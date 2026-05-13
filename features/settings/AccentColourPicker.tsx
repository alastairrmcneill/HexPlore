import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ACCENT_COLOURS } from '@/constants/colours';
import { useTheme } from '@/lib/theme/ThemeContext';

export default function AccentColourPicker() {
  const { accent, setAccent } = useTheme();

  return (
    <View style={styles.container}>
      {ACCENT_COLOURS.map(colour => {
        const active = accent === colour.hex;
        return (
          <TouchableOpacity
            key={colour.hex}
            onPress={() => setAccent(colour.hex)}
            activeOpacity={0.75}
            style={styles.swatchWrap}
          >
            <View style={[styles.swatch, { backgroundColor: colour.hex }]}>
              {active && <Text style={styles.check}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 14,
  },
  swatchWrap: {
    alignItems: 'center',
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
