import '@/lib/polyfills/emscripten';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import type { CameraRef, MapRef, PressEvent, PressEventWithFeatures, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { useTheme } from '@/lib/theme/ThemeContext';
import { getAllCells, insertManualCell } from '@/lib/db/queries';
import { landCellCount, landCellCountryMap, landCellIndices } from '@/lib/h3/landCells';
import { latLngToCell } from '@/lib/h3/hexUtils';
import { track } from '@/lib/analytics';
import ScanRipple from '@/features/onboarding/ScanRipple';
import { scanCameraRoll, PermissionDeniedError } from '@/lib/media/scanner';
import ShareCard from '@/features/share/ShareCard';
import GraticuleLayer from './GraticuleLayer';
import HexLayer from './HexLayer';
import TopBar from './TopBar';
import ZoomControls from './ZoomControls';
import StatsBar from './StatsBar';
import CellSheet from './CellSheet';
import EmptyCellSheet from './EmptyCellSheet';
import MapHint from './MapHint';

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
  const mapRef = useRef<MapRef>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const sharingRef = useRef(false);

  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [visitedIndices, setVisitedIndices] = useState<string[]>([]);
  const [worldPct, setWorldPct] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [cellsLoaded, setCellsLoaded] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [shareMapUri, setShareMapUri] = useState<string | null>(null);

  const [rescanPhase, setRescanPhase] = useState<null | 'scanning' | 'done'>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanProcessed, setScanProcessed] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanHexCount, setScanHexCount] = useState(0);
  const rescanRef = useRef(false);

  const visitedSet = useMemo(() => new Set(visitedIndices), [visitedIndices]);
  const landSet = useMemo(() => new Set(landCellIndices), []);

  const loadCells = useCallback(async () => {
    const cells = await getAllCells();
    const indices = cells.map(c => c.h3index);
    setVisitedIndices(indices);
    setWorldPct((indices.length / landCellCount) * 100);
    const countries = new Set(indices.map(idx => landCellCountryMap.get(idx)).filter(Boolean));
    setCountryCount(countries.size);
    setCellsLoaded(true);
  }, []);

  useEffect(() => {
    loadCells();
    track('map_viewed');
  }, [loadCells]);

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
      const type = visitedSet.has(cell) ? 'visited' : 'empty';
      const country = landCellCountryMap.get(cell);
      track('cell_tapped', { source: type, country: country ?? null });
      setSelectedCell({ h3index: cell, type });
    },
    [landSet, visitedSet],
  );

  const handleMarkVisited = useCallback(async (h3index: string) => {
    track('cell_marked_manual');
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

  const handleShare = useCallback(async () => {
    if (sharingRef.current) return;
    sharingRef.current = true;
    track('share_initiated');

    try {
      const rawUri = await mapRef.current?.createStaticMapImage({ output: 'file' });
      if (!rawUri) return;

      const mapUri = rawUri.startsWith('file://') ? rawUri : `file://${rawUri}`;
      setShareMapUri(mapUri);

      // wait for ShareCard to re-render with the map image
      await new Promise<void>(r => setTimeout(r, 150));

      const cardUri = await viewShotRef.current?.capture?.();
      if (!cardUri) return;

      await Share.open({
        url: cardUri.startsWith('file://') ? cardUri : `file://${cardUri}`,
        type: 'image/png',
        failOnCancel: false,
      });
      track('share_completed');
    } catch {
      // user cancelled or capture failed — silent
    } finally {
      sharingRef.current = false;
      setShareMapUri(null);
    }
  }, []);

  const handleRescan = useCallback(async () => {
    if (rescanRef.current) return;
    rescanRef.current = true;
    setRescanPhase('scanning');
    setScanProgress(0);
    setScanProcessed(0);
    setScanTotal(0);

    try {
      const result = await scanCameraRoll((proc, tot) => {
        setScanProcessed(proc);
        setScanTotal(tot);
        setScanProgress(tot > 0 ? (proc / tot) * 100 : 0);
      });
      setScanHexCount(result.hexCount);
      setScanProgress(100);
      setRescanPhase('done');
      await loadCells();
    } catch (e) {
      if (!(e instanceof PermissionDeniedError)) {
        // unexpected error — just dismiss
      }
      rescanRef.current = false;
      setRescanPhase(null);
    }
  }, [loadCells]);

  const handleRescanDismiss = useCallback(() => {
    rescanRef.current = false;
    setRescanPhase(null);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Map
        ref={mapRef}
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
        onShare={handleShare}
        onAdd={handleRescan}
      />

      {/* Off-screen share card — map image is injected before capture */}
      <ViewShot ref={viewShotRef} style={styles.offscreen} options={{ format: 'png', quality: 1 }}>
        <ShareCard
          mapImageUri={shareMapUri}
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

      <MapHint visible={cellsLoaded && visitedIndices.length === 0} />

      <Modal visible={rescanPhase !== null} animationType="slide" transparent={false} statusBarTranslucent>
        <View style={styles.rescanContainer}>
          <ScanRipple accent={accent} progress={scanProgress} />
          <View style={styles.scanText}>
            {rescanPhase === 'scanning' ? (
              <>
                <Text style={styles.scanLabel}>SCANNING CAMERA ROLL</Text>
                <Text style={[styles.scanPercent, { color: accent }]}>
                  {Math.floor(scanProgress)}<Text style={[styles.scanPercentSign, { color: accent }]}>%</Text>
                </Text>
                <Text style={styles.scanDetail}>
                  Reading EXIF coordinates · {scanProcessed.toLocaleString()} of {scanTotal.toLocaleString()} photos
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.scanLabel}>ALL DONE</Text>
                <Text style={styles.doneHexCount}>
                  {scanHexCount === 0 ? 'No new hexes found' : `${scanHexCount.toLocaleString()} hexes found`}
                </Text>
                <Text style={styles.scanDetail}>Your camera roll has been mapped.</Text>
              </>
            )}
          </View>
          {rescanPhase === 'done' && (
            <TouchableOpacity style={styles.rescanCtaButton} onPress={handleRescanDismiss} activeOpacity={0.85}>
              <Text style={styles.rescanCtaLabel}>Back to map</Text>
              <Text style={styles.rescanCtaArrow}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -2000,
    left: 0,
  },
  rescanContainer: {
    flex: 1,
    backgroundColor: '#FAFAF7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 40,
  },
  scanText: {
    alignItems: 'center',
  },
  scanLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  scanPercent: {
    fontFamily: 'ui-monospace',
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -1,
    marginTop: 8,
  },
  scanPercentSign: {
    fontSize: 18,
  },
  scanDetail: {
    fontSize: 13,
    color: 'rgba(14,14,12,0.55)',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  doneHexCount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0E0E0C',
    marginTop: 8,
  },
  rescanCtaButton: {
    backgroundColor: '#0E0E0C',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: 12,
  },
  rescanCtaLabel: {
    color: '#FAFAF7',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.16,
  },
  rescanCtaArrow: {
    color: '#FAFAF7',
    fontSize: 18,
  },
});
