import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import '@/lib/polyfills/emscripten';
import * as h3 from 'h3-js';
import BottomSheet from '@/components/BottomSheet';
import { cellToCenter } from '@/lib/h3/hexUtils';
import { landCellCountryMap } from '@/lib/h3/landCells';
import { COUNTRY_NAMES } from '@/constants/countryNames';
import { useTheme } from '@/lib/theme/ThemeContext';
import HexNeighborThumbnail from './HexNeighborThumbnail';

interface Props {
  visible: boolean;
  h3index: string;
  visitedSet: Set<string>;
  accent: string;
  onClose: () => void;
  onMarkVisited: (h3index: string, countryCode?: string) => void;
}

function codeToFlag(code: string): string {
  const normalized = code.includes("-") ? code.split("-").pop()! : code;
  if (normalized.length !== 2) return "";
  return [...normalized.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function EmptyCellSheet({
  visible, h3index, visitedSet, accent, onClose, onMarkVisited,
}: Props) {
  const { t } = useTranslation();
  const { colours } = useTheme();
  const [lat, lng] = h3index ? cellToCenter(h3index) : [0, 0];
  const centroidCode = h3index ? landCellCountryMap.get(h3index) ?? '' : '';
  const countryName = centroidCode ? (COUNTRY_NAMES[centroidCode] ?? centroidCode) : '';
  const flag = centroidCode ? codeToFlag(centroidCode) : '';

  // Detect border cell: collect distinct countries from ring-1 neighbours.
  const borderCountries = useMemo<{ code: string; name: string; flag: string }[]>(() => {
    if (!h3index) return [];
    const neighbors = (h3 as any).kRing(h3index, 1) as string[];
    const seen = new Set<string>();
    const result: { code: string; name: string; flag: string }[] = [];
    for (const cell of neighbors) {
      const code = landCellCountryMap.get(cell);
      if (code && !seen.has(code)) {
        seen.add(code);
        result.push({ code, name: COUNTRY_NAMES[code] ?? code, flag: codeToFlag(code) });
      }
    }
    return result.length >= 2 ? result : [];
  }, [h3index]);

  const [selectedCode, setSelectedCode] = useState<string>('');
  // Reset selection when cell changes so a previous border pick doesn't carry over.
  React.useEffect(() => { setSelectedCode(''); }, [h3index]);
  const effectiveCode = selectedCode || centroidCode;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.identityRow}>
        {h3index ? (
          <HexNeighborThumbnail
            h3index={h3index}
            visitedSet={visitedSet}
            accent={accent}
            size={62}
          />
        ) : null}
        <View style={styles.identityText}>
          <View style={styles.countryRow}>
            {flag ? <Text style={styles.flagEmoji}>{flag}</Text> : null}
            {countryName ? <Text style={[styles.countryLabel, { color: colours.textMuted }]}>{countryName}</Text> : null}
          </View>
          <Text style={[styles.coords, { color: colours.text }]}>{lat.toFixed(4)}°, {lng.toFixed(4)}°</Text>
          <Text style={[styles.unvisited, { color: colours.textMuted }]}>{t('map.emptyCell.notVisited')}</Text>
        </View>
      </View>

      {borderCountries.length >= 2 && (
        <View style={styles.pickerSection}>
          <Text style={[styles.pickerLabel, { color: colours.textMuted }]}>
            {t('map.emptyCell.borderCell')}
          </Text>
          <View style={styles.pickerRow}>
            {borderCountries.map(({ code, name, flag: f }) => {
              const active = effectiveCode === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.pickerChip,
                    { borderColor: active ? accent : colours.border, backgroundColor: active ? accent + '18' : 'transparent' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCode(code)}
                >
                  <Text style={styles.chipFlag}>{f}</Text>
                  <Text style={[styles.chipName, { color: active ? accent : colours.text }]}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.markBtn, { backgroundColor: colours.text }]}
        activeOpacity={0.8}
        onPress={() => onMarkVisited(h3index, effectiveCode || undefined)}
      >
        <Text style={[styles.markBtnText, { color: colours.background }]}>{t('map.emptyCell.markVisited')}</Text>
        <Text style={[styles.markBtnArrow, { color: colours.background }]}>→</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  identityText: {
    flex: 1,
    marginTop: 4,
    gap: 4,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagEmoji: {
    fontSize: 22,
  },
  countryLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  coords: {
    fontFamily: 'ui-monospace',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  unvisited: {
    fontSize: 13,
  },
  pickerSection: {
    marginBottom: 16,
    gap: 10,
  },
  pickerLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipFlag: {
    fontSize: 18,
  },
  chipName: {
    fontSize: 13,
    fontWeight: '500',
  },
  markBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  markBtnArrow: {
    fontSize: 18,
  },
});
