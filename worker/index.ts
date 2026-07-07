// Auction Survey Prep Tool — Cloudflare Worker API
// Auth: PBKDF2 password hashes, opaque session tokens (SHA-256 stored) in an HttpOnly cookie.

export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  ASSETS: Fetcher;
}

const SESSION_COOKIE = "asp_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 20000; // kept modest for Workers free-plan CPU limits

type SessionUser = { id: number; username: string; role: "admin" | "student" };

// ---------- small utils ----------

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const err = (message: string, status: number) => json({ error: message }, status);

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

async function pbkdf2Hex(password: string, saltHex: string): Promise<string> {
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256
  );
  return hex(bits);
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return hex(arr.buffer);
}

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return null;
}

function sessionCookie(token: string, maxAgeSeconds: number): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

// ---------- fiscal-year numbering ----------

// FY starts July 1; prefix is the two-digit ENDING year of the FY.
// July 2026 → FY 26-27 → prefix "27".
function computedPrefix(now = new Date()): string {
  const y = now.getUTCFullYear();
  const endYear = now.getUTCMonth() >= 6 ? y + 1 : y;
  return String(endYear % 100).padStart(2, "0");
}

async function getSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

async function setSetting(env: Env, key: string, value: string | null): Promise<void> {
  if (value === null || value === "") {
    await env.DB.prepare("DELETE FROM settings WHERE key = ?").bind(key).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).bind(key, value).run();
  }
}

async function currentPrefix(env: Env): Promise<string> {
  return (await getSetting(env, "fy_prefix_override")) || computedPrefix();
}

/** Floor for the sequence, set by seeding from the master xlsx or manually. */
async function seqFloor(env: Env, prefix: string): Promise<number> {
  const v = await getSetting(env, `seq_floor:${prefix}`);
  return v ? parseInt(v, 10) || 0 : 0;
}

async function nextNumberInfo(env: Env): Promise<{ prefix: string; nextSeq: number; nextSurveyNo: string }> {
  const prefix = await currentPrefix(env);
  const floor = await seqFloor(env, prefix);
  const row = await env.DB.prepare("SELECT COALESCE(MAX(seq), 0) AS m FROM items WHERE prefix = ?")
    .bind(prefix)
    .first<{ m: number }>();
  const nextSeq = Math.max(row?.m ?? 0, floor) + 1;
  return { prefix, nextSeq, nextSurveyNo: `${prefix}-LF${String(nextSeq).padStart(3, "0")}` };
}

// ---------- auth ----------

async function getSessionUser(request: Request, env: Env): Promise<SessionUser | null> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now')`
  ).bind(tokenHash).first<SessionUser>();
  return row ?? null;
}

async function createSession(env: Env, userId: number): Promise<string> {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, datetime('now', '+${SESSION_DAYS} days'))`
  ).bind(tokenHash, userId).run();
  // opportunistic cleanup of expired sessions
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
  return token;
}

// ---------- item helpers ----------

const ITEM_COLS =
  "id, prefix, seq, survey_no, description, serial, price, notes, status, created_by, created_at, updated_at";

async function itemWithPhotos(env: Env, id: number) {
  const item = await env.DB.prepare(`SELECT ${ITEM_COLS} FROM items WHERE id = ?`).bind(id).first();
  if (!item) return null;
  const photos = await env.DB.prepare(
    "SELECT id, filename, size, sort_order FROM photos WHERE item_id = ? ORDER BY sort_order, id"
  ).bind(id).all();
  return { ...item, photos: photos.results };
}

const MANUAL_NO_RE = /^(\d{2})-LF(\d{1,4})$/i;

// ---------- request router ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }
    try {
      return await route(request, env, url);
    } catch (e) {
      console.error("API error", e);
      return err("Server error: " + (e instanceof Error ? e.message : String(e)), 500);
    }
  },
} satisfies ExportedHandler<Env>;

async function route(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method.toUpperCase();
  const user = await getSessionUser(request, env);

  // --- public: session status / first-run detection ---
  if (path === "/api/me" && method === "GET") {
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    return json({ user, setupRequired: (count?.n ?? 0) === 0 });
  }

  // --- public: first-run admin creation ---
  if (path === "/api/setup" && method === "POST") {
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    if ((count?.n ?? 0) > 0) return err("Setup already completed", 403);
    const body = await request.json<{ username?: string; password?: string }>();
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";
    if (!username || password.length < 6) return err("Username required; password must be 6+ characters", 400);
    const salt = randomHex(16);
    const passHash = await pbkdf2Hex(password, salt);
    const res = await env.DB.prepare(
      "INSERT INTO users (username, pass_hash, salt, role) VALUES (?, ?, ?, 'admin') RETURNING id"
    ).bind(username, passHash, salt).first<{ id: number }>();
    const token = await createSession(env, res!.id);
    return json(
      { user: { id: res!.id, username, role: "admin" } },
      200,
      { "set-cookie": sessionCookie(token, SESSION_DAYS * 86400) }
    );
  }

  // --- public: login ---
  if (path === "/api/login" && method === "POST") {
    const body = await request.json<{ username?: string; password?: string }>();
    const username = (body.username ?? "").trim();
    const row = await env.DB.prepare(
      "SELECT id, username, pass_hash, salt, role FROM users WHERE username = ?"
    ).bind(username).first<{ id: number; username: string; pass_hash: string; salt: string; role: "admin" | "student" }>();
    if (!row) return err("Invalid username or password", 401);
    const attempt = await pbkdf2Hex(body.password ?? "", row.salt);
    if (attempt !== row.pass_hash) return err("Invalid username or password", 401);
    const token = await createSession(env, row.id);
    return json(
      { user: { id: row.id, username: row.username, role: row.role } },
      200,
      { "set-cookie": sessionCookie(token, SESSION_DAYS * 86400) }
    );
  }

  if (path === "/api/logout" && method === "POST") {
    const token = getCookie(request, SESSION_COOKIE);
    if (token) {
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
    }
    return json({ ok: true }, 200, { "set-cookie": sessionCookie("", 0) });
  }

  // --- everything below requires a session ---
  if (!user) return err("Not signed in", 401);
  const admin = user.role === "admin";

  // --- next number preview ---
  if (path === "/api/next-number" && method === "GET") {
    return json(await nextNumberInfo(env));
  }

  // --- items ---
  if (path === "/api/items" && method === "GET") {
    const q = url.searchParams.get("search")?.trim() ?? "";
    const status = url.searchParams.get("status") ?? "";
    const clauses: string[] = [];
    const binds: unknown[] = [];
    if (q) {
      clauses.push("(i.survey_no LIKE ? OR i.description LIKE ? OR i.notes LIKE ? OR i.serial LIKE ?)");
      const like = `%${q}%`;
      binds.push(like, like, like, like);
    }
    if (status) {
      clauses.push("i.status = ?");
      binds.push(status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = await env.DB.prepare(
      `SELECT i.id, i.survey_no, i.prefix, i.seq, i.description, i.serial, i.price, i.notes, i.status,
              i.created_by, i.created_at, i.updated_at,
              COUNT(p.id) AS photo_count, MIN(p.id) AS cover_photo_id
       FROM items i LEFT JOIN photos p ON p.item_id = i.id
       ${where}
       GROUP BY i.id
       ORDER BY i.prefix DESC, i.seq DESC, i.id DESC
       LIMIT 500`
    ).bind(...binds).all();
    return json({ items: rows.results });
  }

  if (path === "/api/items" && method === "POST") {
    const body = await request.json<{
      description?: string; serial?: string; price?: string; notes?: string; manualNumber?: string;
    }>();
    const description = (body.description ?? "").trim();
    if (!description) return err("Description is required", 400);
    const serial = (body.serial ?? "").trim();
    const price = (body.price ?? "").trim();
    const notes = (body.notes ?? "").trim();
    const manual = (body.manualNumber ?? "").trim().toUpperCase();

    if (manual) {
      const m = MANUAL_NO_RE.exec(manual);
      const prefix = m ? m[1] : "";
      const seq = m ? parseInt(m[2], 10) : 0;
      const surveyNo = m ? `${m[1]}-LF${String(seq).padStart(3, "0")}` : manual;
      try {
        const row = await env.DB.prepare(
          `INSERT INTO items (prefix, seq, survey_no, description, serial, price, notes, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(prefix, seq, surveyNo, description, serial, price, notes, user.username).first<{ id: number }>();
        return json(await itemWithPhotos(env, row!.id), 201);
      } catch (e) {
        if (String(e).includes("UNIQUE")) return err(`Survey number ${surveyNo} is already used`, 409);
        throw e;
      }
    }

    // Auto-assign: single INSERT..SELECT so concurrent saves can't grab the same number.
    const prefix = await currentPrefix(env);
    const floor = await seqFloor(env, prefix);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const row = await env.DB.prepare(
          `INSERT INTO items (prefix, seq, survey_no, description, serial, price, notes, created_by)
           SELECT ?1, MAX(COALESCE(MAX(seq), 0), ?2) + 1,
                  printf('%s-LF%03d', ?1, MAX(COALESCE(MAX(seq), 0), ?2) + 1),
                  ?3, ?4, ?5, ?6, ?7
           FROM items WHERE prefix = ?1
           RETURNING id, survey_no`
        ).bind(prefix, floor, description, serial, price, notes, user.username).first<{ id: number }>();
        return json(await itemWithPhotos(env, row!.id), 201);
      } catch (e) {
        if (!String(e).includes("UNIQUE") || attempt === 2) throw e;
      }
    }
    return err("Could not assign a number, please retry", 500);
  }

  let m: RegExpExecArray | null;

  if ((m = /^\/api\/items\/(\d+)$/.exec(path))) {
    const id = parseInt(m[1], 10);
    if (method === "GET") {
      const item = await itemWithPhotos(env, id);
      return item ? json(item) : err("Not found", 404);
    }
    if (method === "PUT") {
      const body = await request.json<{
        description?: string; serial?: string; price?: string; notes?: string; status?: string; surveyNo?: string;
      }>();
      const existing = await env.DB.prepare("SELECT id, survey_no FROM items WHERE id = ?").bind(id).first<{ id: number; survey_no: string }>();
      if (!existing) return err("Not found", 404);
      const description = (body.description ?? "").trim();
      if (!description) return err("Description is required", 400);
      const status = body.status && ["draft", "ready", "exported"].includes(body.status) ? body.status : "ready";

      let surveyNo = existing.survey_no;
      let prefixUpd: string | null = null;
      let seqUpd: number | null = null;
      if (body.surveyNo && body.surveyNo.trim().toUpperCase() !== existing.survey_no) {
        const manual = body.surveyNo.trim().toUpperCase();
        const mm = MANUAL_NO_RE.exec(manual);
        surveyNo = mm ? `${mm[1]}-LF${String(parseInt(mm[2], 10)).padStart(3, "0")}` : manual;
        prefixUpd = mm ? mm[1] : "";
        seqUpd = mm ? parseInt(mm[2], 10) : 0;
      }
      try {
        await env.DB.prepare(
          `UPDATE items SET description = ?, serial = ?, price = ?, notes = ?, status = ?,
             survey_no = ?, prefix = COALESCE(?, prefix), seq = COALESCE(?, seq),
             updated_at = datetime('now')
           WHERE id = ?`
        ).bind(
          description, (body.serial ?? "").trim(), (body.price ?? "").trim(), (body.notes ?? "").trim(),
          status, surveyNo, prefixUpd, seqUpd, id
        ).run();
      } catch (e) {
        if (String(e).includes("UNIQUE")) return err(`Survey number ${surveyNo} is already used`, 409);
        throw e;
      }
      return json(await itemWithPhotos(env, id));
    }
    if (method === "DELETE") {
      const photos = await env.DB.prepare("SELECT r2_key FROM photos WHERE item_id = ?").bind(id).all<{ r2_key: string }>();
      if (photos.results.length) {
        await env.PHOTOS.delete(photos.results.map((p) => p.r2_key));
      }
      await env.DB.prepare("DELETE FROM items WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  }

  if (path === "/api/items/mark-exported" && method === "POST") {
    const body = await request.json<{ ids?: number[] }>();
    const ids = (body.ids ?? []).filter((n) => Number.isInteger(n));
    if (ids.length) {
      await env.DB.prepare(
        `UPDATE items SET status = 'exported', updated_at = datetime('now') WHERE id IN (${ids.map(() => "?").join(",")})`
      ).bind(...ids).run();
    }
    return json({ ok: true, count: ids.length });
  }

  // --- photos ---
  if ((m = /^\/api\/items\/(\d+)\/photos$/.exec(path)) && method === "POST") {
    const itemId = parseInt(m[1], 10);
    const item = await env.DB.prepare("SELECT id FROM items WHERE id = ?").bind(itemId).first();
    if (!item) return err("Item not found", 404);
    const filename = decodeURIComponent(request.headers.get("x-filename") ?? "photo.jpg");
    const contentType = request.headers.get("content-type") ?? "image/jpeg";
    const body = await request.arrayBuffer();
    if (body.byteLength === 0) return err("Empty upload", 400);
    if (body.byteLength > 15 * 1024 * 1024) return err("Photo too large (15 MB max)", 400);
    const key = `items/${itemId}/${Date.now()}_${randomHex(4)}`;
    await env.PHOTOS.put(key, body, { httpMetadata: { contentType } });
    const orderRow = await env.DB.prepare(
      "SELECT COALESCE(MAX(sort_order), 0) + 1 AS o FROM photos WHERE item_id = ?"
    ).bind(itemId).first<{ o: number }>();
    const row = await env.DB.prepare(
      "INSERT INTO photos (item_id, r2_key, filename, size, sort_order) VALUES (?, ?, ?, ?, ?) RETURNING id"
    ).bind(itemId, key, filename, body.byteLength, orderRow?.o ?? 1).first<{ id: number }>();
    return json({ id: row!.id, filename, size: body.byteLength }, 201);
  }

  if ((m = /^\/api\/photos\/(\d+)$/.exec(path))) {
    const id = parseInt(m[1], 10);
    const photo = await env.DB.prepare("SELECT r2_key, filename FROM photos WHERE id = ?").bind(id)
      .first<{ r2_key: string; filename: string }>();
    if (!photo) return err("Not found", 404);
    if (method === "GET") {
      const obj = await env.PHOTOS.get(photo.r2_key);
      if (!obj) return err("Photo data missing", 404);
      return new Response(obj.body, {
        headers: {
          "content-type": obj.httpMetadata?.contentType ?? "image/jpeg",
          "cache-control": "private, max-age=86400",
        },
      });
    }
    if (method === "DELETE") {
      await env.PHOTOS.delete(photo.r2_key);
      await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
      return json({ ok: true });
    }
  }

  // --- admin: users ---
  if (path === "/api/users") {
    if (!admin) return err("Admin only", 403);
    if (method === "GET") {
      const rows = await env.DB.prepare("SELECT id, username, role, created_at FROM users ORDER BY username").all();
      return json({ users: rows.results });
    }
    if (method === "POST") {
      const body = await request.json<{ username?: string; password?: string; role?: string }>();
      const username = (body.username ?? "").trim();
      const password = body.password ?? "";
      const role = body.role === "admin" ? "admin" : "student";
      if (!username || password.length < 6) return err("Username required; password must be 6+ characters", 400);
      const salt = randomHex(16);
      const passHash = await pbkdf2Hex(password, salt);
      try {
        const row = await env.DB.prepare(
          "INSERT INTO users (username, pass_hash, salt, role) VALUES (?, ?, ?, ?) RETURNING id"
        ).bind(username, passHash, salt, role).first<{ id: number }>();
        return json({ id: row!.id, username, role }, 201);
      } catch (e) {
        if (String(e).includes("UNIQUE")) return err("Username already exists", 409);
        throw e;
      }
    }
  }

  if ((m = /^\/api\/users\/(\d+)$/.exec(path)) && method === "DELETE") {
    if (!admin) return err("Admin only", 403);
    const id = parseInt(m[1], 10);
    if (id === user.id) return err("You can't delete your own account", 400);
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }

  if ((m = /^\/api\/users\/(\d+)\/password$/.exec(path)) && method === "POST") {
    if (!admin) return err("Admin only", 403);
    const id = parseInt(m[1], 10);
    const body = await request.json<{ password?: string }>();
    const password = body.password ?? "";
    if (password.length < 6) return err("Password must be 6+ characters", 400);
    const salt = randomHex(16);
    const passHash = await pbkdf2Hex(password, salt);
    await env.DB.prepare("UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?").bind(passHash, salt, id).run();
    // invalidate that user's sessions so the new password takes effect everywhere
    await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
    return json({ ok: true });
  }

  // --- admin: settings / numbering ---
  if (path === "/api/settings") {
    if (!admin) return err("Admin only", 403);
    if (method === "GET") {
      const info = await nextNumberInfo(env);
      const override = await getSetting(env, "fy_prefix_override");
      return json({
        computedPrefix: computedPrefix(),
        prefixOverride: override,
        ...info,
        seqFloor: await seqFloor(env, info.prefix),
      });
    }
    if (method === "PUT") {
      const body = await request.json<{ prefixOverride?: string | null; nextSeq?: number | null }>();
      if (body.prefixOverride !== undefined) {
        const v = (body.prefixOverride ?? "").trim();
        if (v && !/^\d{2}$/.test(v)) return err("Prefix must be two digits (e.g. 27)", 400);
        await setSetting(env, "fy_prefix_override", v || null);
      }
      if (body.nextSeq !== undefined && body.nextSeq !== null) {
        const n = Number(body.nextSeq);
        if (!Number.isInteger(n) || n < 1 || n > 9999) return err("Next number must be 1-9999", 400);
        const prefix = await currentPrefix(env);
        await setSetting(env, `seq_floor:${prefix}`, String(n - 1));
      }
      return json(await nextNumberInfo(env));
    }
  }

  // --- admin: seed from master xlsx (client parses; sends max seq found) ---
  if (path === "/api/seed" && method === "POST") {
    if (!admin) return err("Admin only", 403);
    const body = await request.json<{ prefix?: string; maxSeq?: number }>();
    const prefix = (body.prefix ?? "").trim();
    const maxSeq = Number(body.maxSeq);
    if (!/^\d{2}$/.test(prefix) || !Number.isInteger(maxSeq) || maxSeq < 0) {
      return err("Invalid seed data", 400);
    }
    await setSetting(env, `seq_floor:${prefix}`, String(maxSeq));
    return json({ ok: true, prefix, seqFloor: maxSeq });
  }

  return err("Not found", 404);
}
