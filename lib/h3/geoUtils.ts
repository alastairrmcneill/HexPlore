import { cellToBoundaryLngLat } from "./hexUtils";

type HexFeature = GeoJSON.Feature<GeoJSON.Polygon, { h3index: string }>;
type HexCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, { h3index: string }>;

export function cellsToGeoJSON(cells: string[]): HexCollection {
  const features: HexFeature[] = cells.map((h3index) => ({
    type: "Feature",
    properties: { h3index },
    geometry: { type: "Polygon", coordinates: [cellToBoundaryLngLat(h3index)] },
  }));
  return { type: "FeatureCollection", features };
}
