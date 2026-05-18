import React, { useEffect, useRef, useState } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { getLandGeoJSONAsync } from '@/lib/h3/landCells';
import { cellsToGeoJSON } from '@/lib/h3/geoUtils';

interface Props {
  visitedIndices: string[];
  accent: string;
  onReady?: () => void;
}

export default function HexLayer({ visitedIndices, accent, onReady }: Props) {
  const [landData, setLandData] = useState<GeoJSON.FeatureCollection | string | null>(null);
  const [visitedGeoJSON, setVisitedGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // Build land GeoJSON in background chunks so the JS thread stays free for animation
  useEffect(() => {
    let cancelled = false;
    getLandGeoJSONAsync().then((result) => {
      if (!cancelled) {
        setLandData(result);
        onReadyRef.current?.();
      }
    });
    return () => { cancelled = true; };
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
      {landData && (
        <GeoJSONSource id="land-source" data={landData}>
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
