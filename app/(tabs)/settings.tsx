import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}>
      <Text style={styles.eyebrow}>Settings</Text>
      <Text style={styles.heading}>Preferences</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF7', paddingHorizontal: 24 },
  eyebrow: { fontFamily: 'ui-monospace', fontSize: 11, letterSpacing: 2, color: 'rgba(14,14,12,0.5)', textTransform: 'uppercase', marginBottom: 4 },
  heading: { fontSize: 32, fontWeight: '600', color: '#0E0E0C', letterSpacing: -0.8 },
});
