// Client-side photo compression: phones produce 3-12 MB HEIC/JPEG originals;
// we resize to a max edge and re-encode as JPEG before uploading to R2.

const MAX_EDGE = 2000;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<{ blob: Blob; filename: string }> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    // Unsupported format for decode — upload as-is.
    return { blob: file, filename: file.name };
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob) return { blob: file, filename: file.name };

  const filename = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  // Keep the original if compression somehow made it bigger.
  return blob.size < file.size
    ? { blob, filename }
    : { blob: file, filename: file.name };
}
