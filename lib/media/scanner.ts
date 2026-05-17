import { getDb } from "@/lib/db/client";
import { insertCellPhoto, upsertCell } from "@/lib/db/queries";
import "@/lib/polyfills/emscripten";
import * as MediaLibrary from "expo-media-library";
import * as h3 from "h3-js";
import { NativeModules } from "react-native";

export class PermissionDeniedError extends Error {}

export const LAST_SCAN_KEY = "last_scan_time";

interface PhotoLocation {
  id: string;
  lat: number;
  lng: number;
  createdAt: number;
}

const { PhotoLocationScanner } = NativeModules;

export async function scanCameraRoll(
  onProgress: (processed: number, total: number) => void,
  sinceMs?: number,
): Promise<{ hexCount: number; photoCount: number }> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new PermissionDeniedError("Media library permission denied");
  }

  // Single native call — reads PHAsset.location from the iOS Photos database.
  // No per-photo bridge round-trips; the entire library is enumerated in < 2s.
  onProgress(0, 1);
  const locations: PhotoLocation[] = await PhotoLocationScanner.getLocations(sinceMs ?? 0);

  const totalCount = locations.length;
  if (totalCount === 0) {
    onProgress(1, 1);
    return { hexCount: 0, photoCount: 0 };
  }

  // Compute H3 indices for every geotagged photo.
  const visitedIndices = new Set<string>();
  const geotagged: { loc: PhotoLocation; h3index: string }[] = [];
  for (const loc of locations) {
    // h3-js v3 API
    const h3index = (h3 as any).geoToH3(loc.lat, loc.lng, 4);
    visitedIndices.add(h3index);
    geotagged.push({ loc, h3index });
  }

  // Write everything in one SQLite transaction.
  // Report progress in chunks so the UI stays responsive during writes.
  const db = await getDb();
  const CHUNK = 200;
  for (let i = 0; i < geotagged.length; i += CHUNK) {
    const chunk = geotagged.slice(i, i + CHUNK);
    await db.withTransactionAsync(async () => {
      for (const { loc, h3index } of chunk) {
        await upsertCell(h3index, loc.createdAt);
        await insertCellPhoto(h3index, loc.id);
      }
    });
    onProgress(Math.min(i + CHUNK, geotagged.length), geotagged.length);
  }

  onProgress(geotagged.length, geotagged.length);
  return { hexCount: visitedIndices.size, photoCount: totalCount };
}
