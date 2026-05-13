import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btn} onPress={onZoomIn} activeOpacity={0.75}>
        <Text style={styles.label}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onZoomOut} activeOpacity={0.75}>
        <Text style={styles.label}>−</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 14,
    top: '38%',
    gap: 6,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(14,14,12,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  label: {
    fontSize: 19,
    color: '#0E0E0C',
    lineHeight: 22,
  },
});
