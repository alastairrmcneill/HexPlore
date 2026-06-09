import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeContext';

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
  const { colours } = useTheme();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 78, backgroundColor: colours.surface, borderColor: colours.border, shadowColor: colours.shadow }]}>
      <View style={styles.cell}>
        <Text style={[styles.label, { color: colours.textMuted }]}>{t('map.stats.worldCovered')}</Text>
        <Text style={[styles.value, { color: accent }]}>{worldPct.toFixed(2)}%</Text>
      </View>
      <View style={[styles.cell, styles.divider, { borderLeftColor: colours.border }]}>
        <Text style={[styles.label, { color: colours.textMuted }]}>{t('map.stats.hexes')}</Text>
        <Text style={[styles.value, { color: colours.text }]}>{hexCount.toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={[styles.cell, styles.divider, { borderLeftColor: colours.border }]} onPress={onCountriesPress} activeOpacity={0.7}>
        <Text style={[styles.label, { color: colours.textMuted }]}>{t('map.stats.countries')}</Text>
        <Text style={[styles.value, { color: colours.text }]}>{countryCount}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    borderWidth: 1,
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
  },
  label: {
    fontFamily: 'ui-monospace',
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'ui-monospace',
    fontSize: 19,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
});
