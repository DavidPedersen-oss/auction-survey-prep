import { useEffect, useRef, useState, type FormEvent } from "react";
import { IconArrowLeft, IconCamera, IconDownload, IconPhoto, IconTrash, IconX } from "@tabler/icons-react";
import { Button } from "@/components/wensity/button";
import { Card } from "@/components/wensity/card";
import { DialogConfirmation } from "@/components/wensity/dialog";
import { Input } from "@/components/wensity/input";
import { Select } from "@/components/wensity/select";
import { Spinner } from "@/components/wensity/spinner";
import { Textarea } from "@/components/wensity/text-area";
import { Progress } from "@/components/wensity/progress";
import { api, type Item, type ItemStatus } from "@/lib/api";
import { compressImage } from "@/lib/image";
import { buildAuctionZip, downloadBlob, folderName } from "@/lib/export";
import { toast } from "@/lib/toast";
import { navigate } from "@/lib/useHashRoute";

type PendingPhoto = { id: string; file: File; preview: string };

export function ItemFormScreen({ itemId }: { itemId?: number }) {
  const editing = itemId !== undefined;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(editing);

  const [description, setDescription] = useState("");
  const [serial, setSerial] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ItemStatus>("ready");

  const [autoNumber, setAutoNumber] = useState("…");
  const [manualMode, setManualMode] = useState(false);
  const [manualNumber, setManualNumber] = useState("");

  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      api.getItem(itemId).then((it) => {
        setItem(it);
        setDescription(it.description);
        setSerial(it.serial);
        setPrice(it.price);
        setNotes(it.notes);
        setStatus(it.status);
        setManualNumber(it.survey_no);
        setLoading(false);
      }).catch((e) => {
        toast("error", "Item not found", e instanceof Error ? e.message : undefined);
        navigate("/");
      });
    } else {
      api.nextNumber().then((n) => setAutoNumber(n.nextSurveyNo)).catch(() => setAutoNumber("?"));
    }
    return () => {
      // release object URLs
      setPending((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.preview));
        return prev;
      });
    };
  }, [editing, itemId]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) }));
    setPending((prev) => [...prev, ...arr]);
  }

  function removePending(id: string) {
    setPending((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) URL.revokeObjectURL(hit.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function uploadPending(targetId: number) {
    for (let i = 0; i < pending.length; i++) {
      setUploadNote(`Uploading photo ${i + 1} of ${pending.length}…`);
      const { blob, filename } = await compressImage(pending[i].file);
      await api.uploadPhoto(targetId, blob, filename);
    }
    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
    setUploadNote("");
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast("warning", "Description is required");
      return;
    }
    setBusy(true);
    try {
      if (editing && item) {
        await api.updateItem(item.id, {
          description, serial, price, notes, status,
          surveyNo: manualNumber !== item.survey_no ? manualNumber : undefined,
        });
        await uploadPending(item.id);
        const fresh = await api.getItem(item.id);
        setItem(fresh);
        toast("success", `${fresh.survey_no} saved`);
      } else {
        const created = await api.createItem({
          description, serial, price, notes,
          manualNumber: manualMode ? manualNumber : undefined,
        });
        await uploadPending(created.id);
        toast("success", `${created.survey_no} created`,
          pending.length ? `${pending.length} photo(s) uploaded` : undefined);
        navigate("/");
      }
    } catch (e) {
      toast("error", "Save failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(false);
      setUploadNote("");
    }
  }

  async function deleteExistingPhoto(photoId: number) {
    if (!item) return;
    try {
      await api.deletePhoto(photoId);
      setItem(await api.getItem(item.id));
    } catch (e) {
      toast("error", "Couldn't delete photo", e instanceof Error ? e.message : undefined);
    }
  }

  async function deleteItem() {
    if (!item) return;
    setBusy(true);
    try {
      await api.deleteItem(item.id);
      toast("success", `${item.survey_no} deleted`);
      navigate("/");
    } catch (e) {
      toast("error", "Delete failed", e instanceof Error ? e.message : undefined);
      setBusy(false);
    }
  }

  async function exportSingle() {
    if (!item) return;
    setExporting(true);
    try {
      const { blob } = await buildAuctionZip([item.id], () => {});
      downloadBlob(blob, `${folderName(item)}.zip`);
      toast("success", "ZIP downloaded", "Extract it into the auction FY folder on M:");
    } catch (e) {
      toast("error", "Export failed", e instanceof Error ? e.message : undefined);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const numberShown = editing ? manualNumber : manualMode ? manualNumber : autoNumber;

  return (
    <form onSubmit={save} className="mx-auto flex w-full max-w-lg flex-col gap-4 pb-24">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/")}
          aria-label="Back">
          <IconArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">{editing ? "Edit item" : "New item"}</h1>
        {editing && item && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            leftIcon={<IconDownload className="size-4" />}
            loading={exporting}
            onClick={() => void exportSingle()}
          >
            ZIP
          </Button>
        )}
      </div>

      {/* Survey number */}
      <Card className="flex flex-row items-center justify-between gap-3 p-4">
        <div>
          <div className="text-xs text-muted-foreground">Survey number</div>
          <div className="text-2xl font-bold tabular-nums">{numberShown || "—"}</div>
        </div>
        {!editing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setManualMode((m) => !m);
              if (!manualMode) setManualNumber(autoNumber === "…" ? "" : autoNumber);
            }}
          >
            {manualMode ? "Use automatic" : "Enter manually"}
          </Button>
        )}
      </Card>
      {(manualMode || editing) && (
        <Input
          label={editing ? "Survey number" : "Manual survey number"}
          hint="Format: 27-LF001"
          value={manualNumber}
          onChange={(e) => setManualNumber(e.target.value.toUpperCase())}
          fullWidth
        />
      )}

      <Input
        label="Description"
        hint="Used for the folder name, e.g. Red Trek Bike"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        fullWidth
        inputSize="lg"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Serial #" value={serial} onChange={(e) => setSerial(e.target.value)} fullWidth />
        <Input
          label="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="Optional"
          fullWidth
        />
      </div>
      <Textarea
        label="Notes"
        hint="Condition, defects, accessories… e.g. flat tire, loose chain"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        minRows={3}
        autoResize
        fullWidth
      />
      {editing && (
        <Select
          label="Status"
          value={status}
          onValueChange={(v) => setStatus(v as ItemStatus)}
          options={[
            { value: "draft", label: "Draft" },
            { value: "ready", label: "Ready for auction" },
            { value: "exported", label: "Exported" },
          ]}
          fullWidth
        />
      )}

      {/* Photos */}
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium">Photos</div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {item?.photos?.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-surface-muted">
              <img src={api.photoUrl(p.id)} alt={p.filename} className="size-full object-cover" loading="lazy" />
              <button
                type="button"
                aria-label="Delete photo"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                onClick={() => void deleteExistingPhoto(p.id)}
              >
                <IconX className="size-4" />
              </button>
            </div>
          ))}
          {pending.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted ring-2 ring-chili-500/40">
              <img src={p.preview} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                onClick={() => removePending(p.id)}
              >
                <IconX className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<IconCamera className="size-4" />}
            onClick={() => cameraRef.current?.click()}
            className="flex-1"
          >
            Take photo
          </Button>
          <Button
            type="button"
            variant="secondary"
            leftIcon={<IconPhoto className="size-4" />}
            onClick={() => galleryRef.current?.click()}
            className="flex-1"
          >
            From gallery
          </Button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploadNote && (
        <div className="flex flex-col gap-1">
          <Progress indeterminate tone="brand" />
          <div className="text-xs text-muted-foreground">{uploadNote}</div>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="lg" loading={busy} className="flex-1">
          {editing ? "Save changes" : pending.length ? `Save + upload ${pending.length} photo(s)` : "Save item"}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            leftIcon={<IconTrash className="size-4" />}
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        )}
      </div>

      <DialogConfirmation
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${item?.survey_no}?`}
        description="This removes the item and all of its photos. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => void deleteItem()}
      />
    </form>
  );
}
