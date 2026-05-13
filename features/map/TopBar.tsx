import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  zoom: number;
  onShare: () => void;
  onRecenter: () => void;
}

function zoomLabel(zoom: number): string {
  if (zoom < 3) return 'WORLD';
  if (zoom < 5) return 'REGIONAL';
  return 'LOCAL';
}

export default function TopBar({ zoom, onShare, onRecenter }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* gradient fade behind the bar */}
      <View style={styles.gradient} pointerEvents="none" />

      {/* app bar row */}
      <View style={[styles.bar, { top: insets.top + 8 }]}>
        <View>
          <Text style={styles.eyebrow}>WORLD COVERAGE</Text>
          <Text style={styles.title}>HexPlore</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.glassBtn} onPress={onShare} activeOpacity={0.75}>
            <Text style={styles.glassBtnLabel}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.glassBtn} onPress={onRecenter} activeOpacity={0.75}>
            <Text style={styles.glassBtnLabel}>⌖</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* zoom indicator */}
      <View style={[styles.zoomIndicator, { top: insets.top + 72 }]} pointerEvents="none">
        <Text style={styles.zoomText}>
          ZOOM {zoom.toFixed(2)}× · {zoomLabel(zoom)}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    // LinearGradient not available without expo-linear-gradient; approximate with solid fade
    backgroundColor: 'rgba(250,250,247,0.0)',
  },
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 1.7,
    color: 'rgba(14,14,12,0.45)',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0E0E0C',
    letterSpacing: -0.44,
    marginTop: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  glassBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  glassBtnLabel: {
    fontSize: 17,
    color: '#0E0E0C',
  },
  zoomIndicator: {
    position: 'absolute',
    left: 20,
  },
  zoomText: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 0.8,
    color: 'rgba(14,14,12,0.5)',
  },
});
