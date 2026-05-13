import '@/lib/polyfills/emscripten';
import * as MediaLibrary from 'expo-media-library';
import * as h3 from 'h3-js';
import { upsertCell } from '@/lib/db/queries';

export class PermissionDeniedError extends Error {}

export async function scanCameraRoll(
  onProgress: (processed: number, total: number) => void,
): Promise<{ hexCount: number }> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new PermissionDeniedError('Media library permission denied');
  }

  const visitedIndices = new Set<string>();
  let processed = 0;
  let totalCount = 0;
  let after: string | undefined;

  do {
    const page = await MediaLibrary.getAssetsAsync({
      first: 50,
      after,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    if (totalCount === 0) {
      totalCount = page.totalCount;
    }

    for (const asset of page.assets) {
      const info = await MediaLibrary.getAssetInfoAsync(asset.id, {
        shouldDownloadFromNetwork: false,
      });

      if (info.location) {
        const { latitude, longitude } = info.location;
        // h3-js v3 API
        const h3index = (h3 as any).geoToH3(latitude, longitude, 4);
        visitedIndices.add(h3index);
        await upsertCell(h3index, asset.creationTime * 1000);
      }

      processed++;
      onProgress(processed, totalCount || processed);
    }

    after = page.hasNextPage ? page.endCursor : undefined;
  } while (after !== undefined);

  return { hexCount: visitedIndices.size };
}
