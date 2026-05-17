import rawData from '@/assets/land-cells.json';
import { cellToBoundaryLngLat } from './hexUtils';
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
let _landGeoJSONPromise: Promise<GeoJSON.FeatureCollection> | null = null;

export function getLandGeoJSON(): GeoJSON.FeatureCollection {
  if (!_landGeoJSON) {
    _landGeoJSON = cellsToGeoJSON(landCellIndices);
  }
  return _landGeoJSON;
}

// Builds the GeoJSON in 2 000-cell chunks, yielding to the event loop between
// each batch so that animations (RAF-driven) keep running during the computation.
export function getLandGeoJSONAsync(): Promise<GeoJSON.FeatureCollection> {
  if (_landGeoJSONPromise) return _landGeoJSONPromise;
  if (_landGeoJSON) return (_landGeoJSONPromise = Promise.resolve(_landGeoJSON));

  _landGeoJSONPromise = new Promise<GeoJSON.FeatureCollection>((resolve) => {
    const CHUNK = 2000;
    const features: GeoJSON.Feature<GeoJSON.Polygon, { h3index: string }>[] = [];
    let i = 0;

    function processChunk() {
      const end = Math.min(i + CHUNK, landCellIndices.length);
      for (; i < end; i++) {
        const h3index = landCellIndices[i];
        features.push({
          type: 'Feature',
          properties: { h3index },
          geometry: { type: 'Polygon', coordinates: [cellToBoundaryLngLat(h3index)] },
        });
      }
      if (i < landCellIndices.length) {
        setTimeout(processChunk, 0);
      } else {
        _landGeoJSON = { type: 'FeatureCollection', features };
        resolve(_landGeoJSON);
      }
    }

    setTimeout(processChunk, 0);
  });

  return _landGeoJSONPromise;
}

export function clearLandGeoJSONCache(): void {
  _landGeoJSON = null;
  _landGeoJSONPromise = null;
}
