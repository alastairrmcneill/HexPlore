import { getDeletedCells, restoreCell, VisitedCell } from '@/lib/db/queries';
import { useTheme } from '@/lib/theme/ThemeContext';
import { track } from '@/lib/analytics';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  onRestored?: () => void;
}

function codeToFlag(code: string): string {
  const normalized = code.includes('-') ? code.split('-').pop()! : code;
  if (normalized.length !== 2) return '';
  return [...normalized.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('');
}

export default function DeletedCellsModal({ visible, onClose, onRestored }: Props) {
  const { t, i18n } = useTranslation();
  const { colours } = useTheme();
  const insets = useSafeAreaInsets();
  const [cells, setCells] = useState<VisitedCell[]>([]);

  useEffect(() => {
    if (!visible) return;
    getDeletedCells().then(setCells);
  }, [visible]);

  async function handleRestore(h3index: string) {
    track('cell_restored');
    await restoreCell(h3index);
    setCells((prev) => prev.filter((c) => c.h3index !== h3index));
    onRestored?.();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colours.background, paddingTop: insets.top + 16 }]}>
        <View style={[styles.header, { borderBottomColor: colours.border }]}>
          <Text style={[styles.title, { color: colours.text }]}>{t('settings.deletedCellsModal.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={[styles.closeLabel, { color: colours.text }]}>{t('privacy.done')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {cells.length === 0 ? (
            <Text style={[styles.empty, { color: colours.textMuted }]}>{t('settings.deletedCellsModal.empty')}</Text>
          ) : (
            cells.map((cell) => {
              const flag = cell.country_code ? codeToFlag(cell.country_code) : '';
              const place = cell.place_name ?? cell.country ?? cell.h3index;
              const deletedDate = cell.deleted_at
                ? new Date(cell.deleted_at).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
                : '';
              return (
                <View key={cell.h3index} style={[styles.row, { borderBottomColor: colours.border }]}>
                  <View style={styles.rowText}>
                    <View style={styles.placeRow}>
                      {flag ? <Text style={styles.flag}>{flag}</Text> : null}
                      <Text style={[styles.place, { color: colours.text }]} numberOfLines={1}>{place}</Text>
                    </View>
                    <Text style={[styles.deletedOn, { color: colours.textFaint }]}>
                      {t('settings.deletedCellsModal.deletedOn', { date: deletedDate })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.restoreBtn, { borderColor: colours.border }]}
                    activeOpacity={0.7}
                    onPress={() => handleRestore(cell.h3index)}
                  >
                    <Text style={[styles.restoreLabel, { color: colours.text }]}>{t('settings.deletedCellsModal.restore')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
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
    paddingTop: 8,
  },
  empty: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 16,
  },
  place: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  deletedOn: {
    fontSize: 12.5,
  },
  restoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  restoreLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
});
