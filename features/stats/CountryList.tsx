import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeContext';

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

function CountryRow({ stat, accent, isLast, colours }: { stat: CountryStat; accent: string; isLast: boolean; colours: any }) {
  const pct = stat.total > 0 ? (stat.visited / stat.total) * 100 : 0;

  return (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colours.border }]}>
      <View style={styles.left}>
        <View style={styles.nameRow}>
          <Text style={styles.flag}>{codeToFlag(stat.code)}</Text>
          <Text style={[styles.name, { color: colours.text }]} numberOfLines={1}>{stat.name}</Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colours.overlay }]}>
          <View style={[styles.bar, { width: `${pct}%` as any, backgroundColor: accent }]} />
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.hexCount, { color: colours.text }]}>{stat.visited}</Text>
        <Text style={[styles.pctLabel, { color: colours.textMuted }]}>{pct.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

export default function CountryList({ stats, accent }: Props) {
  const { t } = useTranslation();
  const { colours } = useTheme();
  if (stats.length === 0) return null;

  const sorted = [...stats].sort((a, b) => {
    const pctA = a.total > 0 ? a.visited / a.total : 0;
    const pctB = b.total > 0 ? b.visited / b.total : 0;
    return pctB - pctA;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionLabel, { color: colours.textMuted }]}>{t('stats.countries.label', { count: stats.length })}</Text>
        <Text style={[styles.headerRight, { color: colours.textFaint }]}>{t('stats.countries.right')}</Text>
      </View>
      {sorted.map((s, i) => (
        <CountryRow
          key={s.code}
          stat={s}
          accent={accent}
          isLast={i === sorted.length - 1}
          colours={colours}
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
    textTransform: 'uppercase',
  },
  headerRight: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
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
    flexShrink: 1,
  },
  barTrack: {
    height: 3,
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
  },
  pctLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    marginTop: 1,
  },
});
