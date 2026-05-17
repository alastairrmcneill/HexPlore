import '@/lib/polyfills/emscripten';
import * as h3 from 'h3-js';

const _h3 = h3 as any;

export function latLngToCell(lat: number, lng: number, resolution = 4): string {
  return _h3.geoToH3(lat, lng, resolution);
}

// Returns [lng, lat] pairs ready for GeoJSON, with antimeridian crossings unwrapped.
// Without this, H3 cells near ±180° longitude produce lines spanning the entire map.
export function cellToBoundaryLngLat(h3index: string): [number, number][] {
  const raw = (_h3.h3ToGeoBoundary(h3index) as [number, number][]).map(
    ([lat, lng]) => [lng, lat] as [number, number],
  );
  // Unwrap: if consecutive vertices differ by >180° in lng, shift to stay local
  const ring: [number, number][] = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    let lng = raw[i][0];
    const diff = lng - ring[i - 1][0];
    if (diff > 180) lng -= 360;
    else if (diff < -180) lng += 360;
    ring.push([lng, raw[i][1]]);
  }
  ring.push(ring[0]);
  return ring;
}

// Returns [lat, lng] centroid
export function cellToCenter(h3index: string): [number, number] {
  return _h3.h3ToGeo(h3index) as [number, number];
}
