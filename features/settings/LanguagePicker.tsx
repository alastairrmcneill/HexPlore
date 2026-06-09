import BottomSheet from '@/components/BottomSheet';
import { SUPPORTED_LOCALES, SupportedLocale } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { useTheme } from '@/lib/theme/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type LanguageOption = { key: SupportedLocale | null; label: string };

export default function LanguagePicker({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { colours } = useTheme();

  const options: LanguageOption[] = [
    { key: null, label: t('languages.auto') },
    ...SUPPORTED_LOCALES.map((code) => ({ key: code, label: t(`languages.${code}`) })),
  ];

  function handleSelect(key: SupportedLocale | null) {
    setLocale(key);
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colours.text }]}>{t('settings.appearance.language')}</Text>
      </View>
      {options.map((opt, i) => {
        const isSelected = opt.key === null ? false : opt.key === locale;
        const isLast = i === options.length - 1;
        return (
          <TouchableOpacity
            key={opt.key ?? 'auto'}
            style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colours.border }]}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={0.65}
          >
            <Text style={[styles.label, { color: colours.text }, isSelected && styles.labelSelected]}>{opt.label}</Text>
            {isSelected && <Text style={[styles.checkmark, { color: colours.text }]}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  labelSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 17,
  },
});
