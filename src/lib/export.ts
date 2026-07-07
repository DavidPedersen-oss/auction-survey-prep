// Builds the auction ZIP client-side with fflate, mirroring the M:-drive scheme:
//   27-LF001_Red Trek Bike/
//     Pictures/1.jpg ...
//     27-LF001 Notes.txt
//   Master Survey Import.csv   (master-sheet column order, paste/import ready)
//   Master Survey Paste.txt    (same rows as tab-separated values)

import { zip, type Zippable } from "fflate";
import { api, type Item } from "./api";

/** Master sheet column order — must match "L&F Master - Survey.xlsx" exactly. */
const MASTER_COLUMNS = [
  "Logged By", "Closed By", "Date Completed", "Date Assigned", "Survey #",
  "Description", "Serial#", "Original Amount", "Dept ID", "Dept Name",
  "Disposal Code", "Disposal Condition", "Disposal Action", "Notes",
] as const;

function localDate(sqliteUtc: string): string {
  // SQLite datetime('now') is UTC "YYYY-MM-DD HH:MM:SS"
  const d = new Date(sqliteUtc.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? sqliteUtc : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function masterRow(item: Item): string[] {
  return [
    item.created_by,          // Logged By
    "",                       // Closed By
    "",                       // Date Completed
    localDate(item.created_at), // Date Assigned
    item.survey_no,           // Survey #
    item.description,         // Description
    item.serial,              // Serial#
    item.price,               // Original Amount
    "",                       // Dept ID
    "",                       // Dept Name
    "",                       // Disposal Code
    "",                       // Disposal Condition
    "AUCTION",                // Disposal Action
    item.notes,               // Notes
  ];
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const tsvCell = (v: string) => v.replace(/[\t\n\r]+/g, " ");

export function buildMasterCsv(items: Item[]): string {
  const lines = [MASTER_COLUMNS.map(csvCell).join(",")];
  for (const it of items) lines.push(masterRow(it).map(csvCell).join(","));
  return lines.join("\r\n") + "\r\n";
}

/** TSV rows WITHOUT header — ready to paste straight into the master sheet. */
export function buildMasterTsv(items: Item[]): string {
  return items.map((it) => masterRow(it).map(tsvCell).join("\t")).join("\r\n");
}

export function sanitizeFolderName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/, "")
    .slice(0, 120);
}

export function folderName(item: Item): string {
  return sanitizeFolderName(`${item.survey_no}_${item.description}`);
}

function notesTxt(item: Item): string {
  const lines = [
    `${item.survey_no} — ${item.description}`,
    `Logged by: ${item.created_by} on ${localDate(item.created_at)}`,
  ];
  if (item.serial) lines.push(`Serial: ${item.serial}`);
  if (item.price) lines.push(`Price: ${item.price}`);
  if (item.notes) lines.push("", "Notes:", item.notes);
  return lines.join("\r\n") + "\r\n";
}

export type ExportProgress = { done: number; total: number; label: string };

export async function buildAuctionZip(
  itemIds: number[],
  onProgress: (p: ExportProgress) => void
): Promise<{ blob: Blob; items: Item[] }> {
  const enc = new TextEncoder();
  const tree: Zippable = {};
  const items: Item[] = [];
  const total = itemIds.length + 1;

  for (let i = 0; i < itemIds.length; i++) {
    const item = await api.getItem(itemIds[i]);
    items.push(item);
    onProgress({ done: i, total, label: item.survey_no });

    const dir = folderName(item);
    tree[`${dir}/${item.survey_no} Notes.txt`] = enc.encode(notesTxt(item));

    const photos = item.photos ?? [];
    if (photos.length === 0) {
      // keep the Pictures folder present even when empty, like the manual process
      tree[`${dir}/Pictures/`] = new Uint8Array(0);
    }
    for (let p = 0; p < photos.length; p++) {
      const res = await fetch(api.photoUrl(photos[p].id));
      if (!res.ok) throw new Error(`Failed to download photo for ${item.survey_no}`);
      const buf = new Uint8Array(await res.arrayBuffer());
      const ext = photos[p].filename.match(/\.[a-z0-9]+$/i)?.[0] ?? ".jpg";
      // JPEGs are already compressed — store without deflate for speed
      tree[`${dir}/Pictures/${p + 1}${ext}`] = [buf, { level: 0 }];
    }
  }

  onProgress({ done: itemIds.length, total, label: "Master survey import" });
  tree["Master Survey Import.csv"] = enc.encode("﻿" + buildMasterCsv(items));
  tree["Master Survey Paste.txt"] = enc.encode(buildMasterTsv(items));

  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(tree, { level: 6 }, (err, out) => (err ? reject(err) : resolve(out)))
  );
  return { blob: new Blob([data as BlobPart], { type: "application/zip" }), items };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
