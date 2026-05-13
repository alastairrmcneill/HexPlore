import rawData from '@/assets/land-cells.json';
import { cellsToGeoJSON } from './geoUtils';

type LandCell = { h3index: string; country_code: string };
const data = rawData as LandCell[];

export const landCellIndices: string[] = data.map(c => c.h3index);
export const landCellCount: number = data.length;

export const landCellsByCountry: Record<string, number> = data.reduce(
  (acc, c) => { acc[c.country_code] = (acc[c.country_code] || 0) + 1; return acc; },
  {} as Record<string, number>,
);

// h3index → country_code for fast stats lookups without geocoding
export const landCellCountryMap = new Map<string, string>(
  data.map(c => [c.h3index, c.country_code]),
);

// Cache the GeoJSON so it's only built once across the app lifetime
let _landGeoJSON: GeoJSON.FeatureCollection | null = null;

export function getLandGeoJSON(): GeoJSON.FeatureCollection {
  if (!_landGeoJSON) {
    _landGeoJSON = cellsToGeoJSON(landCellIndices);
  }
  return _landGeoJSON;
}

export function clearLandGeoJSONCache(): void {
  _landGeoJSON = null;
}
