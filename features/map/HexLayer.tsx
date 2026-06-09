import React, { useEffect, useRef, useState } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { getLandGeoJSONAsync } from '@/lib/h3/landCells';
import { cellsToGeoJSON } from '@/lib/h3/geoUtils';
import { useTheme } from '@/lib/theme/ThemeContext';

interface Props {
  visitedIndices: string[];
  accent: string;
  mapMode: 'minimal' | 'street';
  onReady?: () => void;
}

export default function HexLayer({ visitedIndices, accent, mapMode, onReady }: Props) {
  const { colours } = useTheme();
  const [landData, setLandData] = useState<GeoJSON.FeatureCollection | string | null>(null);
  const [visitedGeoJSON, setVisitedGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

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

  const lineColour = mapMode === 'street' ? colours.hexOutlineMap : colours.hexOutline;
  const lineWidth = mapMode === 'street' ? 1.8 : 0.8;

  return (
    <>
      {landData && (
        <GeoJSONSource id="land-source" data={landData}>
          <Layer
            id="land-outline"
            type="line"
            paint={{
              'line-color': lineColour,
              'line-width': lineWidth,
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
