import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '@/components/BottomSheet';
import { cellToCenter } from '@/lib/h3/hexUtils';
import { landCellCountryMap } from '@/lib/h3/landCells';
import { COUNTRY_NAMES } from '@/constants/countryNames';
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
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function EmptyCellSheet({
  visible, h3index, visitedSet, accent, onClose, onMarkVisited,
}: Props) {
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
            {countryName ? <Text style={styles.countryLabel}>{countryName}</Text> : null}
          </View>
          <Text style={styles.coords}>{lat.toFixed(4)}°, {lng.toFixed(4)}°</Text>
          <Text style={styles.unvisited}>Not yet visited</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.markBtn}
        activeOpacity={0.8}
        onPress={() => onMarkVisited(h3index)}
      >
        <Text style={styles.markBtnText}>Mark as visited</Text>
        <Text style={styles.markBtnArrow}>→</Text>
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
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  coords: {
    fontFamily: 'ui-monospace',
    fontSize: 15,
    fontWeight: '500',
    color: '#0E0E0C',
    letterSpacing: -0.2,
  },
  unvisited: {
    fontSize: 13,
    color: 'rgba(14,14,12,0.45)',
  },
  markBtn: {
    backgroundColor: '#0E0E0C',
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
    color: '#FAFAF7',
  },
  markBtnArrow: {
    fontSize: 18,
    color: '#FAFAF7',
  },
});
