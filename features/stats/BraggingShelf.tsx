import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  hexCount: number;
  countryCount: number;
  continentCount: number;
  accent: string;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function BraggingShelf({ hexCount, countryCount, continentCount, accent }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{t('stats.bragging.header')}</Text>
      <View style={styles.row}>
        <StatCard label={t('stats.bragging.totalHexes')} value={hexCount.toLocaleString()} accent={accent} />
        <StatCard label={t('stats.bragging.countries')} value={String(countryCount)} accent={accent} />
        <StatCard label={t('stats.bragging.continents')} value={String(continentCount)} accent={accent} />
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
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.06)',
    shadowColor: '#0E0E0C',
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
    color: 'rgba(14,14,12,0.55)',
    marginTop: 4,
  },
});
