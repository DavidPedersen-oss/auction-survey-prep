// Thin fetch wrapper around the Worker API. Session rides in an HttpOnly cookie.

export type Role = "admin" | "student";
export type User = { id: number; username: string; role: Role };
export type ItemStatus = "draft" | "ready" | "exported";

export type PhotoMeta = { id: number; filename: string; size: number; sort_order: number };

export type Item = {
  id: number;
  prefix: string;
  seq: number;
  survey_no: string;
  description: string;
  serial: string;
  price: string;
  notes: string;
  status: ItemStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  photo_count?: number;
  cover_photo_id?: number | null;
  photos?: PhotoMeta[];
};

export type NextNumber = { prefix: string; nextSeq: number; nextSurveyNo: string };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (res.status === 401 && onUnauthorized && path !== "/api/me" && path !== "/api/login") {
    onUnauthorized();
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((body as { error?: string }).error ?? `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

const jsonInit = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(data),
});

export const api = {
  me: () => request<{ user: User | null; setupRequired: boolean }>("/api/me"),
  setup: (username: string, password: string) =>
    request<{ user: User }>("/api/setup", jsonInit("POST", { username, password })),
  login: (username: string, password: string) =>
    request<{ user: User }>("/api/login", jsonInit("POST", { username, password })),
  logout: () => request<{ ok: true }>("/api/logout", { method: "POST" }),

  nextNumber: () => request<NextNumber>("/api/next-number"),

  listItems: (opts: { search?: string; status?: string } = {}) => {
    const p = new URLSearchParams();
    if (opts.search) p.set("search", opts.search);
    if (opts.status) p.set("status", opts.status);
    const qs = p.toString();
    return request<{ items: Item[] }>(`/api/items${qs ? `?${qs}` : ""}`);
  },
  getItem: (id: number) => request<Item>(`/api/items/${id}`),
  createItem: (data: {
    description: string; serial?: string; price?: string; notes?: string; manualNumber?: string;
  }) => request<Item>("/api/items", jsonInit("POST", data)),
  updateItem: (id: number, data: {
    description: string; serial?: string; price?: string; notes?: string; status?: ItemStatus; surveyNo?: string;
  }) => request<Item>(`/api/items/${id}`, jsonInit("PUT", data)),
  deleteItem: (id: number) => request<{ ok: true }>(`/api/items/${id}`, { method: "DELETE" }),
  markExported: (ids: number[]) =>
    request<{ ok: true; count: number }>("/api/items/mark-exported", jsonInit("POST", { ids })),

  uploadPhoto: (itemId: number, blob: Blob, filename: string) =>
    request<PhotoMeta>(`/api/items/${itemId}/photos`, {
      method: "POST",
      headers: { "content-type": blob.type || "image/jpeg", "x-filename": encodeURIComponent(filename) },
      body: blob,
    }),
  deletePhoto: (id: number) => request<{ ok: true }>(`/api/photos/${id}`, { method: "DELETE" }),
  photoUrl: (id: number) => `/api/photos/${id}`,

  listUsers: () => request<{ users: (User & { created_at: string })[] }>("/api/users"),
  createUser: (username: string, password: string, role: Role) =>
    request<User>("/api/users", jsonInit("POST", { username, password, role })),
  deleteUser: (id: number) => request<{ ok: true }>(`/api/users/${id}`, { method: "DELETE" }),
  resetPassword: (id: number, password: string) =>
    request<{ ok: true }>(`/api/users/${id}/password`, jsonInit("POST", { password })),

  getSettings: () =>
    request<NextNumber & { computedPrefix: string; prefixOverride: string | null; seqFloor: number }>("/api/settings"),
  putSettings: (data: { prefixOverride?: string | null; nextSeq?: number | null }) =>
    request<NextNumber>("/api/settings", jsonInit("PUT", data)),
  seed: (prefix: string, maxSeq: number) =>
    request<{ ok: true; prefix: string; seqFloor: number }>("/api/seed", jsonInit("POST", { prefix, maxSeq })),
};
