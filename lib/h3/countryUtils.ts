import { cellToCenter } from "./hexUtils";
import { landCellCountryMap } from "./landCells";

const EUROPE_CENTER: [number, number] = [10, 51];

/**
 * Returns the average centroid of all land H3 cells for a country as
 * [longitude, latitude] (MapLibre convention). Latitude is clamped to ±70°
 * to avoid Mercator extremes for polar countries. Falls back to Europe if the
 * country code has no matching cells.
 */
export function getCountryCentroid(countryCode: string): [number, number] {
  let sumLat = 0;
  let sumLng = 0;
  let count = 0;
  for (const [h3index, code] of landCellCountryMap) {
    if (code === countryCode) {
      const [lat, lng] = cellToCenter(h3index);
      sumLat += lat;
      sumLng += lng;
      count++;
    }
  }
  if (count === 0) return EUROPE_CENTER;
  const avgLat = Math.max(-70, Math.min(70, sumLat / count));
  const avgLng = sumLng / count;
  return [avgLng, avgLat];
}

/**
 * Returns the country code where the user has the most visited hexes, or null
 * if visitedIndices is empty.
 */
export function getMostVisitedCountry(visitedIndices: string[]): string | null {
  if (visitedIndices.length === 0) return null;
  const counts = new Map<string, number>();
  for (const h3index of visitedIndices) {
    const code = landCellCountryMap.get(h3index);
    if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [code, count] of counts) {
    if (count > bestCount) {
      best = code;
      bestCount = count;
    }
  }
  return best;
}
