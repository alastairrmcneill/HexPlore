import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  worldPct: number;
  hexCount: number;
  countryCount: number;
  accent: string;
}

export default function ShareCard({ worldPct, hexCount, countryCount, accent }: Props) {
  const year = new Date().getFullYear();

  return (
    <View style={styles.card}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.brandLabel}>HEXPLORE · {year}</Text>
      </View>

      {/* hero % */}
      <View style={styles.hero}>
        <View style={styles.pctRow}>
          <Text style={[styles.pctNumber, { color: accent }]}>{worldPct.toFixed(2)}</Text>
          <Text style={[styles.pctSign, { color: accent }]}>%</Text>
        </View>
        <Text style={styles.pctSub}>of Earth's land visited</Text>
      </View>

      {/* stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: accent }]}>{hexCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>HEXES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: accent }]}>{countryCount}</Text>
          <Text style={styles.statLabel}>COUNTRIES</Text>
        </View>
      </View>

      {/* footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>hexplore.app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#FAFAF7',
    borderRadius: 24,
    overflow: 'hidden',
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.08)',
  },
  header: {
    marginBottom: 32,
  },
  brandLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10,
    letterSpacing: 2.4,
    color: 'rgba(14,14,12,0.4)',
  },
  hero: {
    marginBottom: 36,
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  pctNumber: {
    fontFamily: 'ui-monospace',
    fontSize: 72,
    fontWeight: '500',
    letterSpacing: -2,
    lineHeight: 80,
  },
  pctSign: {
    fontFamily: 'ui-monospace',
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 10,
  },
  pctSub: {
    fontSize: 15,
    color: 'rgba(14,14,12,0.5)',
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontFamily: 'ui-monospace',
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.4)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(14,14,12,0.1)',
    marginHorizontal: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(14,14,12,0.07)',
    paddingTop: 16,
  },
  footerText: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(14,14,12,0.3)',
  },
});
