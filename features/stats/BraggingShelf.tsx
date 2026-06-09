import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeContext';

interface Props {
  hexCount: number;
  countryCount: number;
  continentCount: number;
  accent: string;
}

function StatCard({ label, value, accent, colours }: { label: string; value: string; accent: string; colours: any }) {
  return (
    <View style={[styles.card, { backgroundColor: colours.surfaceSolid, borderColor: colours.border, shadowColor: colours.shadow }]}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={[styles.label, { color: colours.textMuted }]}>{label}</Text>
    </View>
  );
}

export default function BraggingShelf({ hexCount, countryCount, continentCount, accent }: Props) {
  const { t } = useTranslation();
  const { colours } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: colours.textMuted }]}>{t('stats.bragging.header')}</Text>
      <View style={styles.row}>
        <StatCard label={t('stats.bragging.totalHexes')} value={hexCount.toLocaleString()} accent={accent} colours={colours} />
        <StatCard label={t('stats.bragging.countries')} value={String(countryCount)} accent={accent} colours={colours} />
        <StatCard label={t('stats.bragging.continents')} value={String(continentCount)} accent={accent} colours={colours} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 28,
    paddingHorizontal: 22,
  },
  sectionLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  value: {
    fontFamily: 'ui-monospace',
    fontSize: 34,
    fontWeight: '500',
    letterSpacing: -1,
  },
  label: {
    fontSize: 13,
    marginTop: 4,
  },
});
