import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VisitedCell } from '@/lib/db/queries';
import { COUNTRY_NAMES } from '@/constants/countryNames';
import { landCellCountryMap } from '@/lib/h3/landCells';
import { CountryStat } from './CountryList';

interface Props {
  cells: VisitedCell[];
  countryStats: CountryStat[];
  accent: string;
}

interface Card {
  eyebrow: string;
  headline: string;
  detail: string;
}

function InsightCard({ card, accent }: { card: Card; accent: string }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.eyebrow, { color: accent }]}>{card.eyebrow}</Text>
      <Text style={styles.headline}>{card.headline}</Text>
      <Text style={styles.detail}>{card.detail}</Text>
    </View>
  );
}

export default function InsightCards({ cells, countryStats, accent }: Props) {
  const cards: Card[] = [];

  // "Your patch" — most photographed cell
  const mostPhotographed = [...cells].sort((a, b) => (b.photo_count ?? 0) - (a.photo_count ?? 0))[0];
  if (mostPhotographed) {
    const code = landCellCountryMap.get(mostPhotographed.h3index);
    const country = code ? (COUNTRY_NAMES[code] ?? code) : '';
    const name = mostPhotographed.place_name ?? country;
    cards.push({
      eyebrow: 'YOUR PATCH',
      headline: name || 'Unknown location',
      detail: `${mostPhotographed.photo_count ?? 0} photos in this cell`,
    });
  }

  // "First hex ever" — earliest first_photo_date
  const firstCell = [...cells]
    .filter(c => c.first_photo_date != null)
    .sort((a, b) => (a.first_photo_date ?? 0) - (b.first_photo_date ?? 0))[0];
  if (firstCell?.first_photo_date) {
    const d = new Date(firstCell.first_photo_date);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const name = firstCell.place_name ?? (() => {
      const code = landCellCountryMap.get(firstCell.h3index);
      return code ? (COUNTRY_NAMES[code] ?? '') : '';
    })();
    cards.push({
      eyebrow: 'FIRST HEX EVER',
      headline: name || 'Unknown location',
      detail: dateStr,
    });
  }

  // "Best explored country" — highest % coverage
  const best = [...countryStats]
    .filter(s => s.total > 0)
    .sort((a, b) => b.visited / b.total - a.visited / a.total)[0];
  if (best) {
    const pct = ((best.visited / best.total) * 100).toFixed(1);
    cards.push({
      eyebrow: 'BEST EXPLORED',
      headline: best.name,
      detail: `${best.visited} of ${best.total} cells — ${pct}% covered`,
    });
  }

  if (cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>PERSONAL INSIGHTS</Text>
      <View style={styles.grid}>
        {cards.map((c, i) => (
          <InsightCard key={i} card={c} accent={accent} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  grid: {
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.06)',
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  eyebrow: {
    fontFamily: 'ui-monospace',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headline: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: '#0E0E0C',
  },
  detail: {
    fontSize: 13,
    color: 'rgba(14,14,12,0.55)',
    marginTop: 3,
  },
});
