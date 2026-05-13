import React, { useEffect, useState } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { getLandGeoJSON } from '@/lib/h3/landCells';
import { cellsToGeoJSON } from '@/lib/h3/geoUtils';

interface Props {
  visitedIndices: string[];
  accent: string;
}

export default function HexLayer({ visitedIndices, accent }: Props) {
  const [landGeoJSON, setLandGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [visitedGeoJSON, setVisitedGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);

  // Build land GeoJSON once, deferred so the map renders first
  useEffect(() => {
    const timer = setTimeout(() => {
      setLandGeoJSON(getLandGeoJSON());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Rebuild visited GeoJSON whenever the set of visited cells changes
  useEffect(() => {
    if (visitedIndices.length === 0) {
      setVisitedGeoJSON(null);
      return;
    }
    const timer = setTimeout(() => {
      setVisitedGeoJSON(cellsToGeoJSON(visitedIndices));
    }, 0);
    return () => clearTimeout(timer);
  }, [visitedIndices]);

  return (
    <>
      {landGeoJSON && (
        <GeoJSONSource id="land-source" data={landGeoJSON}>
          <Layer
            id="land-outline"
            type="line"
            paint={{
              'line-color': 'rgba(14,14,12,0.12)',
              'line-width': 0.8,
            }}
          />
        </GeoJSONSource>
      )}

      {visitedGeoJSON && (
        <GeoJSONSource id="visited-source" data={visitedGeoJSON}>
          <Layer
            id="visited-fill"
            type="fill"
            paint={{
              'fill-color': accent,
              'fill-opacity': 0.85,
            }}
          />
        </GeoJSONSource>
      )}
    </>
  );
}
