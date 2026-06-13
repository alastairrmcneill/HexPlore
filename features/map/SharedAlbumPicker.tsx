import { listSharedAlbums, SharedAlbum } from "@/lib/media/scanner";
import { useTheme } from "@/lib/theme/ThemeContext";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLUMNS = 3;
const GAP = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_SIZE = (SCREEN_WIDTH - GAP * (COLUMNS + 1)) / COLUMNS;

interface Props {
  visible: boolean;
  onClose: () => void;
  onScan: (albumIds: string[]) => void;
}

function AlbumCover({ coverAssetId }: { coverAssetId: string | null }) {
  const { colours } = useTheme();
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (!coverAssetId) return;
    let cancelled = false;
    MediaLibrary.getAssetInfoAsync(coverAssetId)
      .then((info) => {
        if (!cancelled) setUri(info.localUri ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [coverAssetId]);

  if (!uri) {
    return <View style={[styles.thumb, { backgroundColor: colours.overlay }]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={styles.thumb}
      contentFit="cover"
      cachePolicy="memory"
      transition={100}
    />
  );
}

export default function SharedAlbumPicker({ visible, onClose, onScan }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colours, accent } = useTheme();
  const [albums, setAlbums] = useState<SharedAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) {
      setSelected(new Set());
      setAlbums([]);
      return;
    }
    setLoading(true);
    listSharedAlbums()
      .then((a) => {
        setAlbums(a);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [visible]);

  const toggleAlbum = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleScan = useCallback(() => {
    onScan([...selected]);
  }, [selected, onScan]);

  const scanLabel =
    selected.size === 0
      ? t("map.sharedAlbums.scan")
      : t("map.sharedAlbums.scanCount", { count: selected.size });

  const renderItem = useCallback(
    ({ item }: { item: SharedAlbum }) => {
      const isSelected = selected.has(item.id);
      return (
        <TouchableOpacity
          style={[styles.cell, isSelected && { borderColor: accent, borderWidth: 3 }]}
          onPress={() => toggleAlbum(item.id)}
          activeOpacity={0.85}
        >
          <AlbumCover coverAssetId={item.coverAssetId} />

          {/* Gradient overlay — transparent at top, dark at bottom */}
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <SvgLinearGradient id={`grad-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000" stopOpacity="0" />
                <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
                <Stop offset="0.9" stopColor="#000" stopOpacity="0.52" />
                <Stop offset="1" stopColor="#000" stopOpacity="0.66" />
              </SvgLinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#grad-${item.id})`} />
          </Svg>

          <View style={styles.nameOverlay}>
            <Text style={styles.albumName} numberOfLines={2} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.albumCount}>{item.count}</Text>
          </View>

          {isSelected && (
            <View style={[styles.checkBadge, { backgroundColor: accent }]}>
              <SymbolView name="checkmark" size={10} tintColor="#fff" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selected, accent, toggleAlbum],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colours.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colours.border }]}>
          <TouchableOpacity style={styles.headerSide} onPress={onClose} hitSlop={8}>
            <SymbolView name="chevron.left" size={18} tintColor={colours.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colours.text }]}>
            {t("map.sharedAlbums.title")}
          </Text>

          <TouchableOpacity
            style={styles.headerSide}
            onPress={handleScan}
            disabled={selected.size === 0}
            hitSlop={8}
          >
            <Text
              style={[
                styles.scanBtn,
                { color: selected.size === 0 ? colours.textMuted : accent },
              ]}
            >
              {scanLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colours.textMuted} />
          </View>
        ) : albums.length === 0 ? (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: colours.textMuted }]}>
              {t("map.sharedAlbums.empty")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={albums}
            keyExtractor={(a) => a.id}
            numColumns={COLUMNS}
            renderItem={renderItem}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSide: {
    width: 80,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  scanBtn: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "right",
    width: 80,
  },
  grid: {
    padding: GAP,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    borderWidth: 0,
    borderColor: "transparent",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  nameOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 7,
    paddingBottom: 7,
    paddingTop: 4,
  },
  albumName: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: -0.1,
    lineHeight: 14,
  },
  albumCount: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    marginTop: 1,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    letterSpacing: -0.1,
  },
});
