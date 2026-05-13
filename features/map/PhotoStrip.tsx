import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { getPhotoIdsByCell } from '@/lib/db/queries';

interface Props {
  h3index: string;
}

export default function PhotoStrip({ h3index }: Props) {
  const [uris, setUris] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setUris([]);

    async function load() {
      const ids = await getPhotoIdsByCell(h3index);
      const resolved: string[] = [];
      for (const id of ids.slice(0, 12)) {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(id);
          if (info.localUri) resolved.push(info.localUri);
        } catch {}
        if (cancelled) return;
      }
      if (!cancelled) setUris(resolved);
    }

    load();
    return () => { cancelled = true; };
  }, [h3index]);

  if (uris.length === 0) return null;

  return (
    <View>
      <Text style={styles.label}>RECENT PHOTOS</Text>
      <FlatList
        horizontal
        data={uris}
        keyExtractor={uri => uri}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.thumb} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
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
    backgroundColor: 'rgba(14,14,12,0.06)',
  },
});
