// Client-side photo compression for stored Blobs (PRD §9).
//
// Field photos are often several megabytes straight from a phone camera. We
// downscale to a sensible display size and re-encode as JPEG before writing to
// IndexedDB, keeping storage use and render cost predictable.

const DEFAULT_MAX_DIMENSION = 1280;
const DEFAULT_QUALITY = 0.7;
const MAX_BYTES = 1_500_000; // 1.5 MB per stored photo
const QUALITY_STEPS = [0.7, 0.55, 0.4, 0.3];

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
}

interface LoadedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Tidak bisa membaca gambar.'));
      element.src = url;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality));
}

/**
 * Returns a compressed JPEG Blob for a photo. Falls back to the original file
 * when the browser cannot decode it or compression would make it larger.
 */
export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<Blob> {
  const { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = options;

  if (!file.type.startsWith('image/')) return file;

  let image: LoadedImage | undefined;
  try {
    image = await loadImage(file);
    const longestSide = Math.max(image.width, image.height);
    const scale = Math.min(1, maxDimension / longestSide);

    // Already small and light: keep the original untouched.
    if (scale === 1 && file.size <= MAX_BYTES) return file;

    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image.source, 0, 0, width, height);

    // Try progressively lower quality until the result fits the size budget.
    const qualities = Array.from(new Set([quality, ...QUALITY_STEPS.filter((step) => step < quality)]));
    let best: Blob | undefined;
    for (const step of qualities) {
      const blob = await encode(canvas, step);
      if (!blob) continue;
      best = blob;
      if (blob.size <= MAX_BYTES) break;
    }

    if (!best || best.size >= file.size) return file;
    return best;
  } catch {
    return file;
  } finally {
    image?.release();
  }
}
