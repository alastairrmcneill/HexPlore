import React, { useMemo } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

interface Props {
  zoom: number;
}

function buildGraticule(step: number | null): GeoJSON.FeatureCollection {
  if (step === null) return { type: 'FeatureCollection', features: [] };

  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

  for (let lng = -180; lng <= 180; lng += step) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [[lng, -60], [lng, 80]] },
    });
  }

  for (let lat = -60; lat <= 80; lat += step) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [[-180, lat], [180, lat]] },
    });
  }

  return { type: 'FeatureCollection', features };
}

export default function GraticuleLayer({ zoom }: Props) {
  const step: number | null = zoom < 3 ? 5 : 2;
  const data = useMemo(() => buildGraticule(step), [step]);

  return (
    <GeoJSONSource id="graticule-source" data={data}>
      <Layer
        id="graticule-layer"
        type="line"
        paint={{
          'line-color': 'rgba(14,14,12,0.05)',
          'line-width': 0.5,
        }}
      />
    </GeoJSONSource>
  );
}
