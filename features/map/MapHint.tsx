import { useTheme } from '@/lib/theme/ThemeContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
}

export default function MapHint({ visible }: Props) {
  const { t } = useTranslation();
  const { colours } = useTheme();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 158,
          backgroundColor: colours.surface,
          borderColor: colours.border,
          shadowColor: colours.shadow,
        },
      ]}
      pointerEvents="box-none"
    >
      <Text style={[styles.text, { color: colours.textMuted }]}>{t('map.hint')}</Text>
      <TouchableOpacity
        onPress={() => setDismissed(true)}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        activeOpacity={0.6}
      >
        <Text style={[styles.dismiss, { color: colours.textMuted }]}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  text: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 18,
  },
  dismiss: {
    fontSize: 20,
    lineHeight: 22,
  },
});
