import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface YearBar {
  year: number;
  count: number;
}

interface Props {
  years: YearBar[];
  accent: string;
}

export default function HexesPerYearChart({ years, accent }: Props) {
  const { t } = useTranslation();
  if (years.length === 0) return null;
  const maxCount = Math.max(...years.map(y => y.count), 1);
  const BAR_MAX_HEIGHT = 70;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('stats.hexesPerYear')}</Text>
      <View style={styles.chart}>
        {years.map(y => (
          <View key={y.year} style={styles.barCol}>
            <Text style={styles.countLabel}>{y.count}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(3, (y.count / maxCount) * BAR_MAX_HEIGHT),
                    backgroundColor: accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.yearLabel}>{String(y.year).slice(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 8,
  },
  label: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  countLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    color: 'rgba(14,14,12,0.55)',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  yearLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    color: 'rgba(14,14,12,0.55)',
  },
});
