import * as Location from 'expo-location';
import { cellToCenter } from '@/lib/h3/hexUtils';
import { getUngeocodedCells, updateGeocode } from '@/lib/db/queries';

const queue: string[] = [];
let running = false;

export function enqueueGeocode(h3index: string): void {
  if (queue.includes(h3index)) return;
  queue.push(h3index);
  if (!running) processNext();
}

// Queue all cells that haven't been reverse-geocoded yet.
// Called after scan completes and on app open. Runs at 1s/cell (Apple rate limit).
export async function enqueueAllUngeocoded(): Promise<void> {
  const cells = await getUngeocodedCells();
  for (const h3index of cells) {
    enqueueGeocode(h3index);
  }
}

async function processNext(): Promise<void> {
  if (queue.length === 0) {
    running = false;
    return;
  }
  running = true;
  const h3index = queue.shift()!;
  try {
    const [lat, lng] = cellToCenter(h3index);
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results.length > 0) {
      const r = results[0];
      await updateGeocode(h3index, {
        place_name: r.city ?? r.district ?? r.subregion ?? r.region ?? null,
        region: r.region ?? null,
        country: r.country ?? null,
        country_code: r.isoCountryCode ?? null,
      });
    }
  } catch {}
  setTimeout(processNext, 1000);
}
