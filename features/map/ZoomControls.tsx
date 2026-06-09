import { useTheme } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: Props) {
  const { colours } = useTheme();

  const btnStyle = {
    backgroundColor: colours.surface,
    borderColor: colours.border,
    shadowColor: colours.shadow,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, btnStyle]} onPress={onZoomIn} activeOpacity={0.75}>
        <Text style={[styles.label, { color: colours.text }]}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, btnStyle]} onPress={onZoomOut} activeOpacity={0.75}>
        <Text style={[styles.label, { color: colours.text }]}>−</Text>
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  label: {
    fontSize: 19,
    lineHeight: 22,
  },
});
