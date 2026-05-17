import BottomSheet from '@/components/BottomSheet';
import { SUPPORTED_LOCALES, SupportedLocale } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/LocaleContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Null = device default; SupportedLocale = explicit override
type LanguageOption = { key: SupportedLocale | null; label: string };

export default function LanguagePicker({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

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
        <Text style={styles.title}>{t('settings.appearance.language')}</Text>
      </View>
      {options.map((opt, i) => {
        const isSelected = opt.key === null
          ? false // "auto" is selected only if no stored override — hard to detect here, keep simple
          : opt.key === locale;
        const isLast = i === options.length - 1;
        return (
          <TouchableOpacity
            key={opt.key ?? 'auto'}
            style={[styles.row, !isLast && styles.rowBorder]}
            onPress={() => handleSelect(opt.key)}
            activeOpacity={0.65}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{opt.label}</Text>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
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
    color: '#0E0E0C',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14,14,12,0.07)',
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0E0E0C',
    letterSpacing: -0.2,
  },
  labelSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 17,
    color: '#0E0E0C',
  },
});
