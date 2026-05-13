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
  const content = (
    <View style={[styles.row, !isLast && styles.border]}>
      <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {onPress ? <Text style={styles.chevron}>›</Text> : null}
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
  border: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14,14,12,0.07)',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#0E0E0C',
  },
  destructive: {
    color: '#FF3B30',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 15,
    color: 'rgba(14,14,12,0.4)',
  },
  chevron: {
    fontSize: 18,
    color: 'rgba(14,14,12,0.35)',
  },
});
