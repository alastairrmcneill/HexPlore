import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { colours } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colours.background, paddingTop: insets.top + 16 }]}>
        <View style={[styles.header, { borderBottomColor: colours.border }]}>
          <Text style={[styles.title, { color: colours.text }]}>{t('privacy.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={[styles.closeLabel, { color: colours.text }]}>{t('privacy.done')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.body, { color: colours.textMuted }]}>{t('privacy.body')}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
});
