import BottomSheet from "@/components/BottomSheet";
import { getCellByIndex, VisitedCell } from "@/lib/db/queries";
import { cellToCenter } from "@/lib/h3/hexUtils";
import { enqueueGeocode } from "@/lib/media/geocoder";
import { useTheme } from "@/lib/theme/ThemeContext";
import { SymbolView } from "expo-symbols";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HexNeighborThumbnail from "./HexNeighborThumbnail";
import PhotoStrip from "./PhotoStrip";

interface Props {
  visible: boolean;
  h3index: string;
  visitedSet: Set<string>;
  accent: string;
  onClose: () => void;
  onRemove: (h3index: string) => void;
}

function codeToFlag(code: string): string {
  const normalized = code.includes("-") ? code.split("-").pop()! : code;
  if (normalized.length !== 2) return "";
  return [...normalized.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join("");
}

function formatDate(ms: number | null, locale: string): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function Metric({ label, value, colours }: { label: string; value: string; colours: any }) {
  return (
    <View>
      <Text style={[styles.metricLabel, { color: colours.textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colours.text }]}>{value}</Text>
    </View>
  );
}

export default function CellSheet({ visible, h3index, visitedSet, accent, onClose, onRemove }: Props) {
  const { t, i18n } = useTranslation();
  const { colours } = useTheme();
  const [cell, setCell] = useState<VisitedCell | null>(null);

  useEffect(() => {
    if (!visible || !h3index) return;
    getCellByIndex(h3index).then((row) => {
      setCell(row);
      if (row && !row.geocoded_at) enqueueGeocode(h3index);
    });
  }, [visible, h3index]);

  useEffect(() => {
    if (!visible || !h3index || cell?.geocoded_at) return;
    const interval = setInterval(() => {
      getCellByIndex(h3index).then((row) => {
        if (row?.geocoded_at) setCell(row);
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [visible, h3index, cell?.geocoded_at]);

  const [lat, lng] = h3index ? cellToCenter(h3index) : [0, 0];
  const dateStr = formatDate(cell?.first_photo_date ?? null, i18n.language);
  const flag = cell?.country_code ? codeToFlag(cell.country_code) : "";

  const handleRemove = () => {
    Alert.alert(
      t('map.cell.removeConfirmTitle'),
      t('map.cell.removeConfirmBody'),
      [
        { text: t('map.cell.cancel'), style: "cancel" },
        { text: t('map.cell.remove'), style: "destructive", onPress: () => onRemove(h3index) },
      ],
    );
  };

  let placeName: string;
  if (cell?.place_name) {
    placeName = cell.place_name;
  } else if (cell?.country) {
    placeName = cell.country;
  } else if (!cell || !cell.geocoded_at) {
    placeName = t('map.cell.locating');
  } else {
    placeName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.identityRow}>
        {h3index ? <HexNeighborThumbnail h3index={h3index} visitedSet={visitedSet} accent={accent} size={62} /> : null}
        <View style={styles.identityText}>
          <View style={styles.countryRow}>
            {flag ? <Text style={styles.flagEmoji}>{flag}</Text> : null}
            <Text style={[styles.countryLabel, { color: colours.textMuted }]}>{(cell?.country ?? "").toUpperCase()}</Text>
          </View>
          <Text style={[styles.placeName, { color: colours.text }]} numberOfLines={2}>
            {placeName}
          </Text>
          {cell?.region ? <Text style={[styles.region, { color: colours.textMuted }]}>{cell.region}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.removeBtn, { backgroundColor: colours.surface, borderColor: colours.border }]}
          activeOpacity={0.7}
          onPress={handleRemove}
          accessibilityLabel={t('map.cell.remove')}
        >
          <SymbolView name="trash" size={16} tintColor="#E0453A" />
        </TouchableOpacity>
      </View>

      <View style={[styles.metrics, { borderColor: colours.border }]}>
        <Metric label={t('map.cell.firstPhoto')} value={dateStr} colours={colours} />
        <Metric label={t('map.cell.photos')} value={(cell?.photo_count ?? 0).toLocaleString()} colours={colours} />
        <Metric label={t('map.cell.coords')} value={`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`} colours={colours} />
      </View>

      {h3index ? <PhotoStrip h3index={h3index} /> : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    marginTop: 4,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  flagEmoji: {
    fontSize: 22,
  },
  countryLabel: {
    fontFamily: "ui-monospace",
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  placeName: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.44,
    lineHeight: 26,
    marginTop: 4,
  },
  region: {
    fontSize: 13,
    marginTop: 2,
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  metricLabel: {
    fontFamily: "ui-monospace",
    fontSize: 9.5,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
    marginTop: 4,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
});
