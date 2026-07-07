// Reads survey numbers out of the L&F Master Survey .xlsx entirely in the browser.
// An xlsx file is a zip of XML parts; we only need the shared-strings table and the
// sheet cell values, so unzip with fflate and scan for NN-LFNNN patterns.

import { unzipSync, strFromU8 } from "fflate";

const SURVEY_RE = /\b(\d{2})-LF(\d{1,4})\b/g;

export type SeedScan = {
  /** highest sequence found per prefix, e.g. { "26": 297, "27": 4 } */
  maxByPrefix: Record<string, number>;
  totalMatches: number;
};

export function scanMasterXlsx(data: Uint8Array): SeedScan {
  const files = unzipSync(data, {
    filter: (f) => f.name === "xl/sharedStrings.xml" || /^xl\/worksheets\/sheet\d+\.xml$/.test(f.name),
  });

  const maxByPrefix: Record<string, number> = {};
  let totalMatches = 0;

  for (const name of Object.keys(files)) {
    const xml = strFromU8(files[name]);
    for (const m of xml.matchAll(SURVEY_RE)) {
      const prefix = m[1];
      const seq = parseInt(m[2], 10);
      if (!Number.isFinite(seq)) continue;
      totalMatches++;
      if ((maxByPrefix[prefix] ?? 0) < seq) maxByPrefix[prefix] = seq;
    }
  }
  return { maxByPrefix, totalMatches };
}
