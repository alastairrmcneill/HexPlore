import '@/lib/polyfills/emscripten';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef, PressEvent, PressEventWithFeatures, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getAllCells } from '@/lib/db/queries';
import { landCellCount, landCellCountryMap } from '@/lib/h3/landCells';
import { latLngToCell } from '@/lib/h3/hexUtils';
import GraticuleLayer from './GraticuleLayer';
import HexLayer from './HexLayer';
import TopBar from './TopBar';
import ZoomControls from './ZoomControls';
import StatsBar from './StatsBar';

const INITIAL_CENTER: [number, number] = [20, 30]; // [lng, lat]
const INITIAL_ZOOM = 2.7;

const MAP_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [{ id: 'background', type: 'background' as const, paint: { 'background-color': '#FAFAF7' } }],
};

interface Props {
  onNavigateStats: () => void;
}

export default function MapScreen({ onNavigateStats }: Props) {
  const { accent } = useTheme();
  const cameraRef = useRef<CameraRef>(null);

  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [visitedIndices, setVisitedIndices] = useState<string[]>([]);
  const [worldPct, setWorldPct] = useState(0);
  const [countryCount, setCountryCount] = useState(0);

  useEffect(() => {
    getAllCells().then(cells => {
      const indices = cells.map(c => c.h3index);
      setVisitedIndices(indices);
      setWorldPct((indices.length / landCellCount) * 100);
      const countries = new Set(indices.map(idx => landCellCountryMap.get(idx)).filter(Boolean));
      setCountryCount(countries.size);
    });
  }, []);

  const handleRegionChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      setZoom(event.nativeEvent.zoom);
    },
    [],
  );

  const handlePress = useCallback(
    (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
      const [lng, lat] = event.nativeEvent.lngLat;
      const _cell = latLngToCell(lat, lng);
      // Cell sheet interaction comes in Session 5
    },
    [],
  );

  const handleZoomIn = useCallback(() => {
    cameraRef.current?.zoomTo(Math.min(zoom + 1.5, 14), { duration: 250 });
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    cameraRef.current?.zoomTo(Math.max(zoom - 1.5, 1), { duration: 250 });
  }, [zoom]);

  const handleRecenter = useCallback(() => {
    cameraRef.current?.flyTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM, duration: 600 });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        onRegionDidChange={handleRegionChange}
        onPress={handlePress}
        compass={false}
        logo={false}
        attribution={false}
        touchRotate={false}
        touchPitch={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: INITIAL_CENTER, zoom: INITIAL_ZOOM }}
          minZoom={1}
        />
        <GraticuleLayer zoom={zoom} />
        <HexLayer visitedIndices={visitedIndices} accent={accent} />
      </Map>

      <TopBar
        zoom={zoom}
        onShare={() => {}}
        onRecenter={handleRecenter}
      />

      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      <StatsBar
        worldPct={worldPct}
        hexCount={visitedIndices.length}
        countryCount={countryCount}
        accent={accent}
        onCountriesPress={onNavigateStats}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
