import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  worldPct: number;
  hexCount: number;
  countryCount: number;
  accent: string;
  onCountriesPress: () => void;
}

export default function StatsBar({ worldPct, hexCount, countryCount, accent, onCountriesPress }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 78 }]}>
      <View style={styles.cell}>
        <Text style={styles.label}>{t('map.stats.worldCovered')}</Text>
        <Text style={[styles.value, { color: accent }]}>{worldPct.toFixed(2)}%</Text>
      </View>
      <View style={[styles.cell, styles.divider]}>
        <Text style={styles.label}>{t('map.stats.hexes')}</Text>
        <Text style={styles.value}>{hexCount.toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={[styles.cell, styles.divider]} onPress={onCountriesPress} activeOpacity={0.7}>
        <Text style={styles.label}>{t('map.stats.countries')}</Text>
        <Text style={styles.value}>{countryCount}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.06)',
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
  },
  cell: {
    flex: 1,
    gap: 3,
  },
  divider: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(14,14,12,0.06)',
  },
  label: {
    fontFamily: 'ui-monospace',
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'ui-monospace',
    fontSize: 19,
    fontWeight: '500',
    color: '#0E0E0C',
    letterSpacing: -0.3,
  },
});
