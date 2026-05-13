import '@/lib/polyfills/emscripten';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef, PressEvent, PressEventWithFeatures, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import ViewShot from 'react-native-view-shot';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getAllCells, insertManualCell } from '@/lib/db/queries';
import { landCellCount, landCellCountryMap, landCellIndices } from '@/lib/h3/landCells';
import { latLngToCell } from '@/lib/h3/hexUtils';
import { generateShareCard } from '@/features/share/generateShareCard';
import ShareCard from '@/features/share/ShareCard';
import GraticuleLayer from './GraticuleLayer';
import HexLayer from './HexLayer';
import TopBar from './TopBar';
import ZoomControls from './ZoomControls';
import StatsBar from './StatsBar';
import CellSheet from './CellSheet';
import EmptyCellSheet from './EmptyCellSheet';

const INITIAL_CENTER: [number, number] = [20, 30]; // [lng, lat]
const INITIAL_ZOOM = 2.7;

const MAP_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [{ id: 'background', type: 'background' as const, paint: { 'background-color': '#FAFAF7' } }],
};

type SelectedCell = { h3index: string; type: 'visited' | 'empty' };

interface Props {
  onNavigateStats: () => void;
}

export default function MapScreen({ onNavigateStats }: Props) {
  const { accent } = useTheme();
  const cameraRef = useRef<CameraRef>(null);
  const viewShotRef = useRef<ViewShot>(null);

  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [visitedIndices, setVisitedIndices] = useState<string[]>([]);
  const [worldPct, setWorldPct] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const visitedSet = useMemo(() => new Set(visitedIndices), [visitedIndices]);
  const landSet = useMemo(() => new Set(landCellIndices), []);

  const loadCells = useCallback(async () => {
    const cells = await getAllCells();
    const indices = cells.map(c => c.h3index);
    setVisitedIndices(indices);
    setWorldPct((indices.length / landCellCount) * 100);
    const countries = new Set(indices.map(idx => landCellCountryMap.get(idx)).filter(Boolean));
    setCountryCount(countries.size);
  }, []);

  useEffect(() => { loadCells(); }, [loadCells]);

  const handleRegionChange = useCallback(
    (event: NativeSyntheticEvent<ViewStateChangeEvent>) => {
      setZoom(event.nativeEvent.zoom);
    },
    [],
  );

  const handlePress = useCallback(
    (event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>) => {
      const [lng, lat] = event.nativeEvent.lngLat;
      const cell = latLngToCell(lat, lng);
      if (!landSet.has(cell)) return;
      setSelectedCell({ h3index: cell, type: visitedSet.has(cell) ? 'visited' : 'empty' });
    },
    [landSet, visitedSet],
  );

  const handleMarkVisited = useCallback(async (h3index: string) => {
    await insertManualCell(h3index);
    setSelectedCell(null);
    await loadCells();
  }, [loadCells]);

  const handleCloseSheet = useCallback(() => setSelectedCell(null), []);

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
        onShare={() => generateShareCard(viewShotRef)}
        onRecenter={handleRecenter}
      />

      {/* Off-screen share card captured by ViewShot */}
      <ViewShot ref={viewShotRef} style={styles.offscreen} options={{ format: 'png', quality: 1 }}>
        <ShareCard
          worldPct={worldPct}
          hexCount={visitedIndices.length}
          countryCount={countryCount}
          accent={accent}
        />
      </ViewShot>

      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      <StatsBar
        worldPct={worldPct}
        hexCount={visitedIndices.length}
        countryCount={countryCount}
        accent={accent}
        onCountriesPress={onNavigateStats}
      />

      <CellSheet
        visible={selectedCell?.type === 'visited'}
        h3index={selectedCell?.h3index ?? ''}
        visitedSet={visitedSet}
        accent={accent}
        onClose={handleCloseSheet}
      />

      <EmptyCellSheet
        visible={selectedCell?.type === 'empty'}
        h3index={selectedCell?.h3index ?? ''}
        visitedSet={visitedSet}
        accent={accent}
        onClose={handleCloseSheet}
        onMarkVisited={handleMarkVisited}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -2000,
    left: 0,
  },
});
