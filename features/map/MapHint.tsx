import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
}

export default function MapHint({ visible }: Props) {
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 158 }]} pointerEvents="box-none">
      <Text style={styles.text}>Tap any hex on the map to mark it as visited</Text>
      <TouchableOpacity
        onPress={() => setDismissed(true)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        activeOpacity={0.6}
      >
        <Text style={styles.dismiss}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.06)',
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  text: {
    flex: 1,
    fontSize: 13.5,
    color: 'rgba(14,14,12,0.65)',
    lineHeight: 18,
  },
  dismiss: {
    fontSize: 20,
    lineHeight: 22,
    color: 'rgba(14,14,12,0.35)',
  },
});
