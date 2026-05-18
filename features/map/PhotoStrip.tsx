import { getPhotoIdsByCell } from "@/lib/db/queries";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

interface Props {
  h3index: string;
}

const MAX_PHOTOS = 5;

// Survives re-renders and re-opens of the same cell — no re-fetching needed
const _uriCache = new Map<string, string[]>();

export default function PhotoStrip({ h3index }: Props) {
  const [uris, setUris] = useState<string[]>(() => _uriCache.get(h3index) ?? []);
  const [loading, setLoading] = useState(!_uriCache.has(h3index));

  useEffect(() => {
    if (_uriCache.has(h3index)) {
      setUris(_uriCache.get(h3index)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setUris([]);
    setLoading(true);

    async function load() {
      const ids = await getPhotoIdsByCell(h3index);
      const batch = ids.slice(0, MAX_PHOTOS);

      // Fetch all asset infos in parallel instead of sequentially
      const results = await Promise.allSettled(
        batch.map((id) => MediaLibrary.getAssetInfoAsync(id)),
      );

      if (cancelled) return;

      const resolved = results
        .filter((r): r is PromiseFulfilledResult<MediaLibrary.AssetInfo> => r.status === 'fulfilled')
        .map((r) => r.value.localUri)
        .filter((uri): uri is string => !!uri);

      _uriCache.set(h3index, resolved);
      setUris(resolved);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [h3index]);

  if (!loading && uris.length === 0) return null;

  return (
    <View>
      <Text style={styles.label}>RECENT PHOTOS</Text>
      <FlatList
        horizontal
        data={uris}
        keyExtractor={(uri) => uri}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={styles.thumb}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
        )}
        ListFooterComponent={loading ? <View style={styles.placeholder} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: "ui-monospace",
    fontSize: 10.5,
    letterSpacing: 2,
    color: "rgba(14,14,12,0.5)",
    marginBottom: 8,
  },
  list: {
    gap: 8,
    paddingBottom: 4,
  },
  thumb: {
    width: 92,
    height: 110,
    borderRadius: 12,
    backgroundColor: "rgba(14,14,12,0.06)",
  },
  placeholder: {
    width: 92,
    height: 110,
    borderRadius: 12,
    backgroundColor: "rgba(14,14,12,0.06)",
  },
});
