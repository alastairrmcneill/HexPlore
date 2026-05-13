import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const CARD_WIDTH = 390;
const CARD_HEIGHT = 520;

interface Props {
  mapImageUri: string | null;
  worldPct: number;
  hexCount: number;
  countryCount: number;
  accent: string;
}

export default function ShareCard({ mapImageUri, worldPct, hexCount, countryCount, accent }: Props) {
  const year = new Date().getFullYear();

  return (
    <View style={styles.card}>
      {mapImageUri ? (
        <Image source={{ uri: mapImageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.mapFallback]} />
      )}

      <View style={styles.overlay}>
        <Text style={styles.brand}>HEXPLORE · {year}</Text>

        <View style={styles.pctRow}>
          <Text style={[styles.pctNumber, { color: accent }]}>{worldPct.toFixed(2)}</Text>
          <Text style={[styles.pctSign, { color: accent }]}>%</Text>
        </View>
        <Text style={styles.pctSub}>of Earth's land visited</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>{hexCount.toLocaleString()} hexes</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.stat}>{countryCount} countries</Text>
        </View>

        <Text style={styles.footer}>hexplore.app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#0E0E0C',
    overflow: 'hidden',
  },
  mapFallback: {
    backgroundColor: '#1A1A18',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,9,0.88)',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 28,
  },
  brand: {
    fontFamily: 'ui-monospace',
    fontSize: 9,
    letterSpacing: 2.2,
    color: 'rgba(250,250,247,0.4)',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  pctNumber: {
    fontFamily: 'ui-monospace',
    fontSize: 56,
    fontWeight: '500',
    letterSpacing: -2,
    lineHeight: 60,
  },
  pctSign: {
    fontFamily: 'ui-monospace',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  pctSub: {
    fontSize: 13.5,
    color: 'rgba(250,250,247,0.5)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  stat: {
    fontFamily: 'ui-monospace',
    fontSize: 12,
    color: 'rgba(250,250,247,0.65)',
    letterSpacing: 0.2,
  },
  statDot: {
    color: 'rgba(250,250,247,0.3)',
    fontSize: 12,
  },
  footer: {
    fontFamily: 'ui-monospace',
    fontSize: 9,
    letterSpacing: 1.2,
    color: 'rgba(250,250,247,0.25)',
    marginTop: 12,
  },
});
