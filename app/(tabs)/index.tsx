import '@/lib/polyfills/emscripten'; // must precede h3-js — stubs document for Emscripten asm.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { PressEvent, PressEventWithFeatures } from '@maplibre/maplibre-react-native';
import type { ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import * as h3 from 'h3-js';

const ACCENT = '#FF6B5B';

const MAP_STYLE = {
  version: 8 as const,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background' as const,
      paint: { 'background-color': '#FAFAF7' },
    },
  ],
};

type GeoFeature = GeoJSON.Feature<GeoJSON.Polygon, { h3index: string }>;
type GeoCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, { h3index: string }>;

function buildSpikeGeoJSON(cellCount: number): GeoCollection {
  const cells = new Set<string>();
  outer: for (let lat = -60; lat <= 80; lat += 0.5) {
    for (let lng = -180; lng <= 180; lng += 0.5) {
      // h3-js v3 API: geoToH3(lat, lng, resolution)
      cells.add(h3.geoToH3(lat, lng, 4));
      if (cells.size >= cellCount) break outer;
    }
  }

  const features: GeoFeature[] = Array.from(cells).map(h3index => {
    // h3ToGeoBoundary returns [[lat, lng], ...]; GeoJSON wants [lng, lat]
    const ring = (h3.h3ToGeoBoundary(h3index) as [number, number][]).map(
      ([lat, lng]) => [lng, lat] as [number, number],
    );
    ring.push(ring[0]); // close the polygon ring
    return {
      type: 'Feature',
      properties: { h3index },
      geometry: { type: 'Polygon', coordinates: [ring] },
    };
  });

  return { type: 'FeatureCollection', features };
}

export default function SpikeScreen() {
  const [geoJSON, setGeoJSON] = useState<GeoCollection | null>(null);
  const [buildMs, setBuildMs] = useState<number | null>(null);
  const [tappedCell, setTappedCell] = useState<string | null>(null);
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    const t0 = Date.now();
    // Defer off the first render so the loading indicator paints first
    requestAnimationFrame(() => {
      const data = buildSpikeGeoJSON(17000);
      const elapsed = Date.now() - t0;
      setBuildMs(elapsed);
      console.log(`[Spike] built ${data.features.length} cells in ${elapsed}ms`);
      setGeoJSON(data);
    });
  }, []);

  function handleMapPress(
    event: NativeSyntheticEvent<PressEvent | PressEventWithFeatures>,
  ) {
    const [lng, lat] = event.nativeEvent.lngLat;
    // h3-js v3 API: geoToH3(lat, lng, resolution)
    const cell = h3.geoToH3(lat, lng, 4);
    setTappedCell(cell);
    console.log('[Spike] tapped cell:', cell);
  }

  function handleRegionChange(event: NativeSyntheticEvent<ViewStateChangeEvent>) {
    setZoom(event.nativeEvent.zoom);
  }

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        onPress={handleMapPress}
        onRegionDidChange={handleRegionChange}
        compass={false}
        logo={false}
        attribution={false}
      >
        <Camera
          initialViewState={{ center: [0, 20], zoom: 2 }}
        />

        {geoJSON && (
          <GeoJSONSource id="hex-source" data={geoJSON}>
            <Layer
              id="hex-fill"
              type="fill"
              paint={{
                'fill-color': ACCENT,
                'fill-opacity': 0.25,
              }}
            />
            <Layer
              id="hex-outline"
              type="line"
              paint={{
                'line-color': '#888',
                'line-width': 0.6,
                'line-opacity': 0.5,
              }}
            />
          </GeoJSONSource>
        )}
      </Map>

      {/* Performance HUD */}
      <View style={styles.hud}>
        {geoJSON ? (
          <>
            <Text style={styles.hudText}>
              {geoJSON.features.length.toLocaleString()} cells
              {buildMs !== null ? `  ·  built in ${buildMs}ms` : ''}
            </Text>
            <Text style={styles.hudText}>zoom {zoom.toFixed(2)}</Text>
            {tappedCell && (
              <Text style={[styles.hudText, styles.tappedText]} numberOfLines={1}>
                ↗ {tappedCell}
              </Text>
            )}
          </>
        ) : (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={ACCENT} />
            <Text style={styles.hudText}>  Building GeoJSON…</Text>
          </View>
        )}
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>SESSION 0 SPIKE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF7' },
  map: { flex: 1 },
  hud: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  hudText: {
    fontSize: 13,
    fontFamily: 'ui-monospace',
    color: '#0E0E0C',
  },
  tappedText: { color: ACCENT },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'ui-monospace',
    color: '#888',
    letterSpacing: 1,
  },
});
