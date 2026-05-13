import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '@/components/BottomSheet';
import { getCellByIndex, VisitedCell } from '@/lib/db/queries';
import { cellToCenter } from '@/lib/h3/hexUtils';
import { enqueueGeocode } from '@/lib/media/geocoder';
import HexNeighborThumbnail from './HexNeighborThumbnail';
import PhotoStrip from './PhotoStrip';

interface Props {
  visible: boolean;
  h3index: string;
  visitedSet: Set<string>;
  accent: string;
  onClose: () => void;
}

function codeToFlag(code: string): string {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

function formatDate(ms: number | null): { main: string; sub: string } {
  if (!ms) return { main: '—', sub: '' };
  const d = new Date(ms);
  const main = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const sub = d.getFullYear().toString();
  return { main, sub };
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  );
}

export default function CellSheet({ visible, h3index, visitedSet, accent, onClose }: Props) {
  const [cell, setCell] = useState<VisitedCell | null>(null);

  useEffect(() => {
    if (!visible || !h3index) return;
    getCellByIndex(h3index).then(row => {
      setCell(row);
      if (row && !row.geocoded_at) enqueueGeocode(h3index);
    });
  }, [visible, h3index]);

  const [lat, lng] = h3index ? cellToCenter(h3index) : [0, 0];
  const date = formatDate(cell?.first_photo_date ?? null);
  const flag = cell?.country_code ? codeToFlag(cell.country_code) : '';
  const placeName = cell?.place_name ?? `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* identity row */}
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
          <Text style={styles.countryLabel}>
            {flag ? `${flag}  ` : ''}{(cell?.country ?? '').toUpperCase()}
          </Text>
          <Text style={styles.placeName} numberOfLines={2}>{placeName}</Text>
          {cell?.region ? <Text style={styles.region}>{cell.region}</Text> : null}
        </View>
      </View>

      {/* metric strip */}
      <View style={styles.metrics}>
        <Metric label="FIRST PHOTO" value={date.main} sub={date.sub} />
        <Metric label="PHOTOS" value={(cell?.photo_count ?? 0).toLocaleString()} />
        <Metric label="COORDS" value={`${lat.toFixed(2)}°`} sub={`${lng.toFixed(2)}°`} />
      </View>

      {/* photo strip */}
      {h3index ? <PhotoStrip h3index={h3index} /> : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    marginTop: 4,
  },
  countryLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  placeName: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.44,
    lineHeight: 26,
    color: '#0E0E0C',
    marginTop: 4,
  },
  region: {
    fontSize: 13,
    color: 'rgba(14,14,12,0.55)',
    marginTop: 2,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(14,14,12,0.07)',
    marginBottom: 16,
  },
  metricLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 9.5,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#0E0E0C',
    marginTop: 4,
  },
  metricSub: {
    fontFamily: 'ui-monospace',
    fontSize: 11.5,
    color: 'rgba(14,14,12,0.5)',
    marginTop: 1,
  },
});
