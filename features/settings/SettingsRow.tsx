import { useTheme } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  destructive?: boolean;
}

export default function SettingsRow({ label, value, onPress, isLast, destructive }: Props) {
  const { colours } = useTheme();

  const content = (
    <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colours.border }]}>
      <Text style={[styles.label, { color: destructive ? '#FF3B30' : colours.text }]}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={[styles.value, { color: colours.textFaint }]}>{value}</Text> : null}
        {onPress ? <Text style={[styles.chevron, { color: colours.textMuted }]}>›</Text> : null}
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 18,
  },
});
