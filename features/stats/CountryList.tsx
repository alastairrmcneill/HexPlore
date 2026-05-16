import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface CountryStat {
  code: string;
  name: string;
  visited: number;
  total: number;
}

interface Props {
  stats: CountryStat[];
  accent: string;
}

function codeToFlag(code: string): string {
  if (code.length !== 2) return '';
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

function CountryRow({ stat, accent, isLast }: { stat: CountryStat; accent: string; isLast: boolean }) {
  const pct = stat.total > 0 ? (stat.visited / stat.total) * 100 : 0;
  const barWidth = pct;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.left}>
        <View style={styles.nameRow}>
          <Text style={styles.flag}>{codeToFlag(stat.code)}</Text>
          <Text style={styles.name} numberOfLines={1}>{stat.name}</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.bar, { width: `${barWidth}%` as any, backgroundColor: accent }]} />
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.hexCount}>{stat.visited}</Text>
        <Text style={styles.pctLabel}>{pct.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

export default function CountryList({ stats, accent }: Props) {
  if (stats.length === 0) return null;

  // Sort descending by % coverage (highest first)
  const sorted = [...stats].sort((a, b) => {
    const pctA = a.total > 0 ? a.visited / a.total : 0;
    const pctB = b.total > 0 ? b.visited / b.total : 0;
    return pctB - pctA;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>COUNTRIES · {stats.length}</Text>
        <Text style={styles.headerRight}>HEXES · % COVERED</Text>
      </View>
      {sorted.map((s, i) => (
        <CountryRow
          key={s.code}
          stat={s}
          accent={accent}
          isLast={i === sorted.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  headerRight: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: 'rgba(14,14,12,0.4)',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14,14,12,0.07)',
  },
  left: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    fontSize: 17,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#0E0E0C',
    flexShrink: 1,
  },
  barTrack: {
    height: 3,
    backgroundColor: 'rgba(14,14,12,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
  hexCount: {
    fontFamily: 'ui-monospace',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#0E0E0C',
  },
  pctLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    color: 'rgba(14,14,12,0.5)',
    marginTop: 1,
  },
});
