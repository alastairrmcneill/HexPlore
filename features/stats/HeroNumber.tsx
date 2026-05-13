import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LAND_CELL_COUNT } from '@/constants/h3';

const KM2_PER_CELL = 1770;

interface Props {
  worldPct: number;
  hexCount: number;
  accent: string;
}

export default function HeroNumber({ worldPct, hexCount, accent }: Props) {
  const km2 = (hexCount * KM2_PER_CELL).toLocaleString();
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>WORLD COVERED</Text>
      <View style={styles.numberRow}>
        <Text style={[styles.number, { color: accent }]}>{worldPct.toFixed(2)}</Text>
        <Text style={[styles.percent, { color: accent }]}>%</Text>
      </View>
      <Text style={styles.subtitle}>
        {hexCount.toLocaleString()} hexes of {LAND_CELL_COUNT.toLocaleString()} on Earth
        {'  —  '}about <Text style={styles.subtitleMono}>{km2} km²</Text> covered.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    letterSpacing: 2.2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 6,
  },
  number: {
    fontFamily: 'ui-monospace',
    fontSize: 86,
    fontWeight: '500',
    letterSpacing: -3,
    lineHeight: 96,
  },
  percent: {
    fontFamily: 'ui-monospace',
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(14,14,12,0.55)',
    marginTop: 10,
    lineHeight: 20,
  },
  subtitleMono: {
    fontFamily: 'ui-monospace',
    color: '#0E0E0C',
  },
});
