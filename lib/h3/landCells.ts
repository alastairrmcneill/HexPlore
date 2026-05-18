import rawData from '@/assets/land-cells.json';
import { cellToBoundaryLngLat } from './hexUtils';
import { cellsToGeoJSON } from './geoUtils';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';

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

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
const LAND_CACHE_PATH = `${FileSystem.cacheDirectory}land-hexes-v${APP_VERSION}.geojson`;

let _landGeoJSON: GeoJSON.FeatureCollection | null = null;
let _landGeoJSONPromise: Promise<GeoJSON.FeatureCollection | string> | null = null;
let _landCacheUri: string | null = null;

export function getLandGeoJSON(): GeoJSON.FeatureCollection {
  if (!_landGeoJSON) {
    _landGeoJSON = cellsToGeoJSON(landCellIndices);
  }
  return _landGeoJSON;
}

// On first launch: builds GeoJSON in 5 000-cell chunks, writes result to disk.
// On subsequent launches: returns the cached file:// URI — MapLibre loads it
// natively in C++ without touching the JS bridge.
export function getLandGeoJSONAsync(): Promise<GeoJSON.FeatureCollection | string> {
  if (_landGeoJSONPromise) return _landGeoJSONPromise;
  if (_landCacheUri) return Promise.resolve(_landCacheUri);

  _landGeoJSONPromise = new Promise<GeoJSON.FeatureCollection | string>((resolve) => {
    if (FileSystem.cacheDirectory) {
      FileSystem.getInfoAsync(LAND_CACHE_PATH).then((info) => {
        if (info.exists) {
          _landCacheUri = LAND_CACHE_PATH;
          resolve(LAND_CACHE_PATH);
          return;
        }
        buildInChunks(resolve);
      }).catch(() => buildInChunks(resolve));
    } else {
      buildInChunks(resolve);
    }
  });

  return _landGeoJSONPromise;
}

function buildInChunks(resolve: (v: GeoJSON.FeatureCollection | string) => void) {
  const CHUNK = 5000;
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
      if (FileSystem.cacheDirectory) {
        FileSystem.writeAsStringAsync(
          LAND_CACHE_PATH,
          JSON.stringify(_landGeoJSON),
        ).then(() => {
          _landCacheUri = LAND_CACHE_PATH;
        }).catch(() => {});
      }
      resolve(_landGeoJSON);
    }
  }

  setTimeout(processChunk, 0);
}

export function clearLandGeoJSONCache(): void {
  _landGeoJSON = null;
  _landGeoJSONPromise = null;
  _landCacheUri = null;
  if (FileSystem.cacheDirectory) {
    FileSystem.deleteAsync(LAND_CACHE_PATH, { idempotent: true }).catch(() => {});
  }
}
