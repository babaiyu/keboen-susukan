import { useEffect, useMemo } from 'react';

/**
 * Creates an object URL for a stored image blob and revokes it when the blob
 * changes or the component unmounts. Photos are stored as Blobs in IndexedDB
 * (see `Plant.photo`); the browser needs an object URL to render them.
 */
export function useBlobUrl(blob?: Blob | null): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return url;
}
