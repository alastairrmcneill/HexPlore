import { getDb } from "@/lib/db/client";
import { insertCellPhoto, upsertCell } from "@/lib/db/queries";
import "@/lib/polyfills/emscripten";
import * as MediaLibrary from "expo-media-library";
import * as h3 from "h3-js";

export class PermissionDeniedError extends Error {}

/** Number of getAssetInfoAsync calls to fire in parallel per chunk. */
const CONCURRENCY = 16;

export const LAST_SCAN_KEY = "last_scan_time";

export async function scanCameraRoll(
  onProgress: (processed: number, total: number) => void,
  sinceMs?: number,
): Promise<{ hexCount: number; photoCount: number }> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new PermissionDeniedError("Media library permission denied");
  }

  const visitedIndices = new Set<string>();
  const db = await getDb();
  let processed = 0;
  let totalCount = 0;
  let after: string | undefined;

  do {
    const page = await MediaLibrary.getAssetsAsync({
      first: 50,
      after,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
      ...(sinceMs !== undefined ? { createdAfter: sinceMs } : {}),
    });

    if (totalCount === 0) {
      totalCount = page.totalCount;
    }

    // Process assets in parallel chunks of CONCURRENCY
    for (let i = 0; i < page.assets.length; i += CONCURRENCY) {
      const chunk = page.assets.slice(i, i + CONCURRENCY);

      // Fire all getAssetInfoAsync calls concurrently
      const results = await Promise.allSettled(
        chunk.map((asset) => MediaLibrary.getAssetInfoAsync(asset.id, { shouldDownloadFromNetwork: false })),
      );

      // Collect geotagged results
      const geotagged: { asset: MediaLibrary.Asset; h3index: string }[] = [];
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r.status === "fulfilled" && r.value.location) {
          const { latitude, longitude } = r.value.location;
          // h3-js v3 API
          const h3index = (h3 as any).geoToH3(latitude, longitude, 4);
          visitedIndices.add(h3index);
          geotagged.push({ asset: chunk[j], h3index });
        }
      }

      // Batch all DB writes for this chunk in a single transaction
      if (geotagged.length > 0) {
        await db.withTransactionAsync(async () => {
          for (const { asset, h3index } of geotagged) {
            await upsertCell(h3index, asset.creationTime);
            await insertCellPhoto(h3index, asset.id);
          }
        });
      }

      processed += chunk.length;
      onProgress(processed, totalCount || processed);
    }

    after = page.hasNextPage ? page.endCursor : undefined;
  } while (after !== undefined);

  return { hexCount: visitedIndices.size, photoCount: processed };
}
