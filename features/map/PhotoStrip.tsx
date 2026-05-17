import { getPhotoIdsByCell } from "@/lib/db/queries";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

interface Props {
  h3index: string;
}

const MAX_PHOTOS = 5;

export default function PhotoStrip({ h3index }: Props) {
  const [uris, setUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setUris([]);
    setLoading(true);

    async function load() {
      const ids = await getPhotoIdsByCell(h3index);
      for (const id of ids.slice(0, MAX_PHOTOS)) {
        if (cancelled) return;
        try {
          const info = await MediaLibrary.getAssetInfoAsync(id);
          if (info.localUri && !cancelled) {
            setUris((prev) => [...prev, info.localUri!]);
          }
        } catch {}
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
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
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.thumb} />}
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
