import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconClipboardCopy, IconDownload, IconFileSpreadsheet, IconKey, IconTrash, IconUserPlus,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/wensity/alert";
import { Badge } from "@/components/wensity/badge";
import { Button } from "@/components/wensity/button";
import { Card } from "@/components/wensity/card";
import { Checkbox } from "@/components/wensity/checkbox";
import {
  Dialog, DialogBody, DialogConfirmation, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/wensity/dialog";
import { Input } from "@/components/wensity/input";
import { Progress } from "@/components/wensity/progress";
import { Select } from "@/components/wensity/select";
import { Separator } from "@/components/wensity/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/wensity/tabs";
import { api, type Item, type Role, type User } from "@/lib/api";
import { buildAuctionZip, buildMasterTsv, downloadBlob, type ExportProgress } from "@/lib/export";
import { scanMasterXlsx } from "@/lib/xlsx";
import { toast } from "@/lib/toast";

export function AdminScreen({ me }: { me: User }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-24">
      <h1 className="text-lg font-semibold">Admin</h1>
      <Tabs variant="segmented" defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="numbering">Numbering</TabsTrigger>
        </TabsList>
        <TabsContent value="export" className="pt-4">
          <ExportTab />
        </TabsContent>
        <TabsContent value="users" className="pt-4">
          <UsersTab me={me} />
        </TabsContent>
        <TabsContent value="numbering" className="pt-4">
          <NumberingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ───────────────────────── Users ───────────────────────── */

function UsersTab({ me }: { me: User }) {
  const [users, setUsers] = useState<(User & { created_at: string })[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [resetFor, setResetFor] = useState<User | null>(null);
  const [deleteFor, setDeleteFor] = useState<User | null>(null);

  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState<Role>("student");
  const [resetPass, setResetPass] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.listUsers().then((r) => setUsers(r.users)).catch(() => toast("error", "Couldn't load users"));
  }, []);
  useEffect(load, [load]);

  async function addUser() {
    setBusy(true);
    try {
      await api.createUser(newName, newPass, newRole);
      toast("success", `Added ${newName}`);
      setAddOpen(false);
      setNewName("");
      setNewPass("");
      setNewRole("student");
      load();
    } catch (e) {
      toast("error", "Couldn't add user", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function doReset() {
    if (!resetFor) return;
    setBusy(true);
    try {
      await api.resetPassword(resetFor.id, resetPass);
      toast("success", `Password reset for ${resetFor.username}`);
      setResetFor(null);
      setResetPass("");
    } catch (e) {
      toast("error", "Reset failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    if (!deleteFor) return;
    try {
      await api.deleteUser(deleteFor.id);
      toast("success", `Deleted ${deleteFor.username}`);
      setDeleteFor(null);
      load();
    } catch (e) {
      toast("error", "Delete failed", e instanceof Error ? e.message : undefined);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button leftIcon={<IconUserPlus className="size-4" />} onClick={() => setAddOpen(true)} className="self-start">
        Add user
      </Button>
      {users.map((u) => (
        <Card key={u.id} className="flex flex-row items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{u.username}</span>
              <Badge size="sm" variant={u.role === "admin" ? "brand" : "neutral"}>{u.role}</Badge>
              {u.id === me.id && <Badge size="sm" variant="outline">you</Badge>}
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Reset password" onClick={() => setResetFor(u)}>
            <IconKey className="size-4" />
          </Button>
          {u.id !== me.id && (
            <Button variant="ghost" size="icon" aria-label="Delete user" onClick={() => setDeleteFor(u)}>
              <IconTrash className="size-4" />
            </Button>
          )}
        </Card>
      ))}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent variant="form">
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <Input label="Username" value={newName} onChange={(e) => setNewName(e.target.value)}
              autoCapitalize="none" fullWidth />
            <Input label="Password" hint="At least 6 characters" value={newPass}
              onChange={(e) => setNewPass(e.target.value)} fullWidth />
            <Select
              label="Role"
              value={newRole}
              onValueChange={(v) => setNewRole(v as Role)}
              options={[
                { value: "student", label: "Student", description: "Can add and edit items" },
                { value: "admin", label: "Admin", description: "Full access incl. users & export" },
              ]}
              fullWidth
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={() => void addUser()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent variant="form">
          <DialogHeader>
            <DialogTitle>Reset password — {resetFor?.username}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Input label="New password" hint="At least 6 characters" value={resetPass}
              onChange={(e) => setResetPass(e.target.value)} fullWidth />
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetFor(null)}>Cancel</Button>
            <Button loading={busy} onClick={() => void doReset()}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogConfirmation
        open={!!deleteFor}
        onOpenChange={(o) => !o && setDeleteFor(null)}
        title={`Delete ${deleteFor?.username}?`}
        description="They will no longer be able to sign in. Items they logged are kept."
        confirmLabel="Delete"
        destructive
        onConfirm={() => void doDelete()}
      />
    </div>
  );
}

/* ─────────────────────── Numbering ─────────────────────── */

function NumberingTab() {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof api.getSettings>> | null>(null);
  const [override, setOverride] = useState("");
  const [nextSeq, setNextSeq] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [seedBusy, setSeedBusy] = useState(false);

  const load = useCallback(() => {
    api.getSettings().then((s) => {
      setInfo(s);
      setOverride(s.prefixOverride ?? "");
      setNextSeq(String(s.nextSeq));
    }).catch(() => toast("error", "Couldn't load settings"));
  }, []);
  useEffect(load, [load]);

  async function saveSettings() {
    setBusy(true);
    try {
      await api.putSettings({
        prefixOverride: override.trim() || null,
        nextSeq: nextSeq.trim() ? parseInt(nextSeq, 10) : null,
      });
      toast("success", "Numbering updated");
      load();
    } catch (e) {
      toast("error", "Couldn't save", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
    }
  }

  async function onSeedFile(file: File) {
    setSeedBusy(true);
    try {
      const scan = scanMasterXlsx(new Uint8Array(await file.arrayBuffer()));
      if (scan.totalMatches === 0) {
        toast("warning", "No survey numbers found in that file");
        return;
      }
      for (const [prefix, maxSeq] of Object.entries(scan.maxByPrefix)) {
        await api.seed(prefix, maxSeq);
      }
      const summary = Object.entries(scan.maxByPrefix)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([p, s]) => `${p}-LF${String(s).padStart(3, "0")}`)
        .join(", ");
      toast("success", "Seeded from master file", `Highest numbers found: ${summary}`);
      load();
    } catch (e) {
      toast("error", "Couldn't read that file", e instanceof Error ? e.message : undefined);
    } finally {
      setSeedBusy(false);
    }
  }

  if (!info) return null;

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <div className="text-xs text-muted-foreground">Next number to be assigned</div>
        <div className="text-3xl font-bold tabular-nums">{info.nextSurveyNo}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Fiscal-year prefix {info.prefix} (computed from today: {info.computedPrefix}
          {info.prefixOverride ? `, overridden to ${info.prefixOverride}` : ""})
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <div className="font-medium">Sync from the master survey file</div>
        <div className="text-sm text-muted-foreground">
          Upload <span className="font-medium">L&amp;F Master - Survey.xlsx</span> and the app will find the
          highest survey number per fiscal year and continue from there. Numbers only move forward — nothing
          in the file is changed.
        </div>
        <Button
          variant="secondary"
          leftIcon={<IconFileSpreadsheet className="size-4" />}
          loading={seedBusy}
          onClick={() => fileRef.current?.click()}
          className="self-start"
        >
          Upload master xlsx
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onSeedFile(f);
            e.target.value = "";
          }}
        />
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <div className="font-medium">Manual control</div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prefix override"
            hint={`Blank = automatic (${info.computedPrefix})`}
            value={override}
            onChange={(e) => setOverride(e.target.value)}
            placeholder={info.computedPrefix}
            fullWidth
          />
          <Input
            label="Next number"
            hint="Sequence part only, e.g. 12"
            value={nextSeq}
            onChange={(e) => setNextSeq(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            fullWidth
          />
        </div>
        <Alert variant="info" density="compact">
          <AlertDescription>
            The next number can only be raised above existing items — it never renumbers anything.
          </AlertDescription>
        </Alert>
        <Button loading={busy} onClick={() => void saveSettings()} className="self-start">
          Save numbering
        </Button>
      </Card>
    </div>
  );
}

/* ───────────────────────── Export ───────────────────────── */

function ExportTab() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [onlyReady, setOnlyReady] = useState(true);
  const [markAfter, setMarkAfter] = useState(true);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const load = useCallback((ready: boolean) => {
    api.listItems({ status: ready ? "ready" : "" }).then((r) => {
      setItems(r.items);
      setSelected(new Set(r.items.filter((i) => i.status !== "exported").map((i) => i.id)));
    }).catch(() => toast("error", "Couldn't load items"));
  }, []);
  useEffect(() => load(onlyReady), [load, onlyReady]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));

  async function doExport() {
    const ids = items.filter((i) => selected.has(i.id)).map((i) => i.id);
    if (ids.length === 0) {
      toast("warning", "Select at least one item");
      return;
    }
    try {
      const { blob } = await buildAuctionZip(ids, setProgress);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `LF Auction Export ${stamp}.zip`);
      if (markAfter) {
        await api.markExported(ids);
        load(onlyReady);
      }
      toast("success", `Exported ${ids.length} item(s)`, "Extract the ZIP into the FY folder under AUCTIONS L&F on M:");
    } catch (e) {
      toast("error", "Export failed", e instanceof Error ? e.message : undefined);
    } finally {
      setProgress(null);
    }
  }

  async function copyTsv() {
    const chosen = await Promise.all(
      items.filter((i) => selected.has(i.id)).map((i) => api.getItem(i.id))
    );
    if (chosen.length === 0) {
      toast("warning", "Select at least one item");
      return;
    }
    await navigator.clipboard.writeText(buildMasterTsv(chosen));
    toast("success", "Rows copied", "Paste directly into the master survey sheet");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <Checkbox
          label="Only 'Ready' items"
          checked={onlyReady}
          onCheckedChange={(v) => setOnlyReady(v === true)}
        />
        <Checkbox
          label="Mark as exported after download"
          checked={markAfter}
          onCheckedChange={(v) => setMarkAfter(v === true)}
        />
      </div>

      <Card className="flex flex-col divide-y divide-border">
        <div className="flex items-center gap-3 p-3">
          <Checkbox
            label={allSelected ? "Deselect all" : "Select all"}
            checked={allSelected}
            onCheckedChange={() =>
              setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))
            }
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {selected.size} of {items.length} selected
          </span>
        </div>
        {items.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-3 p-3">
            <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
            <span className="font-medium tabular-nums">{item.survey_no}</span>
            <span className="min-w-0 flex-1 truncate text-sm">{item.description}</span>
            {item.status === "exported" && <Badge size="sm" variant="success">exported</Badge>}
            <span className="text-xs text-muted-foreground">{item.photo_count} 📷</span>
          </label>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">Nothing to export.</div>
        )}
      </Card>

      {progress && (
        <div className="flex flex-col gap-1">
          <Progress value={progress.done} max={progress.total} tone="brand" />
          <div className="text-xs text-muted-foreground">
            Packing {progress.label}… ({progress.done + 1}/{progress.total})
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          leftIcon={<IconDownload className="size-4" />}
          onClick={() => void doExport()}
          disabled={!!progress}
          className="flex-1"
        >
          Download ZIP
        </Button>
        <Button
          variant="secondary"
          leftIcon={<IconClipboardCopy className="size-4" />}
          onClick={() => void copyTsv()}
        >
          Copy rows
        </Button>
      </div>

      <Separator />
      <div className="text-xs text-muted-foreground">
        The ZIP contains one folder per item ({`{number}_{description}`} with a Pictures subfolder and a
        notes file), plus <span className="font-medium">Master Survey Import.csv</span> and a paste-ready
        <span className="font-medium"> Master Survey Paste.txt</span> for the master sheet.
      </div>
    </div>
  );
}
