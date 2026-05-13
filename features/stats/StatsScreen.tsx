import '@/lib/polyfills/emscripten';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllCells, getCellsGroupedByYear, VisitedCell } from '@/lib/db/queries';
import { landCellCount, landCellsByCountry, landCellCountryMap } from '@/lib/h3/landCells';
import { COUNTRY_NAMES } from '@/constants/countryNames';
import { COUNTRY_CONTINENT } from '@/constants/countryContinent';
import { useTheme } from '@/lib/theme/ThemeContext';
import HeroNumber from './HeroNumber';
import HexesPerYearChart from './HexesPerYearChart';
import BraggingShelf from './BraggingShelf';
import CountryList, { CountryStat } from './CountryList';

export default function StatsScreen() {
  const { accent } = useTheme();
  const insets = useSafeAreaInsets();

  const [cells, setCells] = useState<VisitedCell[]>([]);
  const [yearBars, setYearBars] = useState<{ year: number; count: number }[]>([]);

  const load = useCallback(async () => {
    const [allCells, years] = await Promise.all([
      getAllCells(),
      getCellsGroupedByYear(),
    ]);
    setCells(allCells);
    setYearBars(years);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derive country stats from landCellCountryMap (reliable, no geocoding dependency)
  const countryVisits = new Map<string, number>();
  for (const cell of cells) {
    const code = landCellCountryMap.get(cell.h3index);
    if (code) countryVisits.set(code, (countryVisits.get(code) ?? 0) + 1);
  }

  const countryStats: CountryStat[] = [...countryVisits.entries()].map(([code, visited]) => ({
    code,
    name: COUNTRY_NAMES[code] ?? code,
    visited,
    total: landCellsByCountry[code] ?? 0,
  }));

  const hexCount = cells.length;
  const worldPct = (hexCount / landCellCount) * 100;
  const continents = new Set(
    [...countryVisits.keys()].map(c => COUNTRY_CONTINENT[c]).filter(Boolean)
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <HeroNumber worldPct={worldPct} hexCount={hexCount} accent={accent} />

      <View style={styles.divider} />

      <HexesPerYearChart years={yearBars} accent={accent} />

      <View style={styles.divider} />

      <BraggingShelf
        hexCount={hexCount}
        countryCount={countryStats.length}
        continentCount={continents.size}
        accent={accent}
      />

      <View style={styles.divider} />

      <CountryList stats={countryStats} accent={accent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  content: {
    flexGrow: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(14,14,12,0.06)',
    marginHorizontal: 22,
    marginTop: 24,
  },
});
