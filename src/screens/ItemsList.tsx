import { useCallback, useEffect, useRef, useState } from "react";
import { IconCamera, IconPlus } from "@tabler/icons-react";
import { Badge, type BadgeVariant } from "@/components/wensity/badge";
import { Button } from "@/components/wensity/button";
import { Card } from "@/components/wensity/card";
import { Input } from "@/components/wensity/input";
import { SkeletonCard } from "@/components/wensity/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/wensity/tabs";
import { LiquidMultimodalInput } from "@/components/wensity/liquid-multimodal-input";
import { api, type Item, type ItemStatus } from "@/lib/api";
import { compressImage } from "@/lib/image";
import { toast } from "@/lib/toast";
import { navigate } from "@/lib/useHashRoute";

const statusBadge: Record<ItemStatus, { variant: BadgeVariant; label: string }> = {
  draft: { variant: "warning", label: "Draft" },
  ready: { variant: "info", label: "Ready" },
  exported: { variant: "success", label: "Exported" },
};

export function ItemsListScreen() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [quickBusy, setQuickBusy] = useState(false);
  const searchTimer = useRef<number>(0);

  const load = useCallback(async (q: string, st: string) => {
    try {
      const res = await api.listItems({ search: q, status: st });
      setItems(res.items);
    } catch (e) {
      toast("error", "Couldn't load items", e instanceof Error ? e.message : undefined);
    }
  }, []);

  useEffect(() => {
    void load("", "");
  }, [load]);

  function onSearch(q: string) {
    setSearch(q);
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => void load(q, status), 250);
  }

  function onStatus(st: string) {
    const v = st === "all" ? "" : st;
    setStatus(v);
    void load(search, v);
  }

  async function quickAdd(text: string, files: File[]) {
    const description = text.trim();
    if (!description) {
      toast("warning", "Type a short description first");
      return;
    }
    setQuickBusy(true);
    try {
      const item = await api.createItem({ description });
      const images = files.filter((f) => f.type.startsWith("image/"));
      for (const f of images) {
        const { blob, filename } = await compressImage(f);
        await api.uploadPhoto(item.id, blob, filename);
      }
      toast("success", `${item.survey_no} created`, images.length ? `${images.length} photo(s) attached` : undefined);
      void load(search, status);
    } catch (e) {
      toast("error", "Quick add failed", e instanceof Error ? e.message : undefined);
    } finally {
      setQuickBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 pb-44">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search number, description, notes…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          clearable
          onClear={() => onSearch("")}
          fullWidth
          containerClassName="sm:max-w-xs"
        />
        <Tabs variant="segmented" size="sm" value={status || "all"} onValueChange={onStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="exported">Exported</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {items === null ? (
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <IconCamera className="mx-auto mb-2 size-8 opacity-50" />
          No items yet. Use the quick-add box below or the New Item button.
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              interactive
              className="flex cursor-pointer flex-row items-center gap-3 p-3"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                {item.cover_photo_id ? (
                  <img
                    src={api.photoUrl(item.cover_photo_id)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <IconCamera className="size-6 opacity-40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{item.survey_no}</span>
                  <Badge size="sm" variant={statusBadge[item.status].variant}>
                    {statusBadge[item.status].label}
                  </Badge>
                </div>
                <div className="truncate text-sm">{item.description}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {item.photo_count ? `${item.photo_count} photo${item.photo_count === 1 ? "" : "s"} · ` : ""}
                  {item.created_by}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick capture: describe + drop/attach photos, submit → item is created and numbered */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto w-full max-w-xl px-3">
        {quickBusy ? (
          <Card className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground shadow-lg">
            Saving item…
          </Card>
        ) : (
          <div className="shadow-lg rounded-3xl">
            <LiquidMultimodalInput
              placeholder="Quick add: describe the item, attach photos…"
              accept="image/*"
              hideModel
              onSubmit={(value, files) => void quickAdd(value, files)}
            />
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="fixed bottom-2 right-3 z-30 sm:right-6"
        leftIcon={<IconPlus className="size-5" />}
        onClick={() => navigate("/new")}
      >
        New Item
      </Button>
    </div>
  );
}
