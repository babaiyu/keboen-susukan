import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressImage } from './image';

// Must match MAX_BYTES in image.ts.
const MAX_BYTES = 1_500_000;

function imageFile(bytes: number): File {
  return new File([new Uint8Array(bytes)], 'photo.jpg', { type: 'image/jpeg' });
}

let createImageBitmapMock: ReturnType<typeof vi.fn>;
let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob | undefined;

beforeEach(() => {
  // jsdom has no image decoder, so stub createImageBitmap. The 4000x3000 size
  // forces the downscaling path for the compression tests.
  createImageBitmapMock = vi.fn().mockResolvedValue({ width: 4000, height: 3000, close: vi.fn() });
  vi.stubGlobal('createImageBitmap', createImageBitmapMock);

  // jsdom also has no real 2D canvas. Pretend getContext succeeds; toBlob is
  // controlled per test through canvasOutputs().
  const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext') as unknown as {
    mockReturnValue: (value: unknown) => void;
  };
  getContextSpy.mockReturnValue({ drawImage: vi.fn() });

  originalToBlob = HTMLCanvasElement.prototype.toBlob;
});

afterEach(() => {
  if (originalToBlob) {
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  } else {
    delete (HTMLCanvasElement.prototype as { toBlob?: unknown }).toBlob;
  }
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Makes each canvas encode return a JPEG of the given byte sizes, in order. */
function canvasOutputs(sizes: number[]): void {
  let call = 0;
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    configurable: true,
    writable: true,
    value: (callback: BlobCallback) => {
      const size = sizes[Math.min(call, sizes.length - 1)];
      call += 1;
      callback(new Blob([new Uint8Array(size)], { type: 'image/jpeg' }));
    },
  });
}

describe('compressImage', () => {
  it('returns non-image files untouched', async () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });

    expect(await compressImage(file)).toBe(file);
  });

  it('keeps a small, light image as-is', async () => {
    createImageBitmapMock.mockResolvedValueOnce({ width: 800, height: 600, close: vi.fn() });
    const file = imageFile(1000);

    expect(await compressImage(file)).toBe(file);
  });

  it('downscales large photos and returns an encoded blob within the size budget', async () => {
    const file = imageFile(3_000_000);
    // The first quality step is still too big; the second fits.
    canvasOutputs([2_000_000, 900_000]);

    const result = await compressImage(file);

    expect(result).not.toBe(file);
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('returns the original when compression cannot beat the original size', async () => {
    const file = imageFile(100_000);
    // Every encode attempt is larger than the original file.
    canvasOutputs([200_000]);

    expect(await compressImage(file)).toBe(file);
  });

  it('returns the original when the browser cannot decode the image', async () => {
    createImageBitmapMock.mockRejectedValueOnce(new Error('decode failed'));
    const file = imageFile(3_000_000);

    expect(await compressImage(file)).toBe(file);
  });
});
