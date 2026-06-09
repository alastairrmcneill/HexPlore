import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  onMarkVisited: (h3index: string) => void;
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
  const countryCode = h3index ? landCellCountryMap.get(h3index) ?? '' : '';
  const countryName = countryCode ? (COUNTRY_NAMES[countryCode] ?? countryCode) : '';
  const flag = countryCode ? codeToFlag(countryCode) : '';

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

      <TouchableOpacity
        style={[styles.markBtn, { backgroundColor: colours.text }]}
        activeOpacity={0.8}
        onPress={() => onMarkVisited(h3index)}
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
