import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PRIVACY_TEXT = `HexPlore is designed with privacy as a default, not an afterthought.

ALL PROCESSING HAPPENS ON YOUR DEVICE
HexPlore reads the GPS coordinates embedded in your photos to map which parts of the world you have visited. This processing happens entirely on your device. Your photos, their contents, and their locations are never uploaded, transmitted, or shared with any server or third party.

ANONYMOUS USAGE ANALYTICS
To help us understand how the app is used and where to focus improvements, HexPlore collects anonymous usage events via PostHog. These events contain no personal information — no names, no photo data, no location data — only actions like "opened the stats screen" or "shared a result." Each install is assigned a random ID that cannot be linked back to you. You can opt out by contacting us at hello@hexplore.app.

DATA STORED ON YOUR DEVICE
The only data HexPlore stores is a list of H3 hex cell identifiers (grid references) representing places you have visited, along with photo counts and dates. This data lives in a local SQLite database on your device and is removed when you delete the app.

NO ACCOUNTS, NO CLOUD
HexPlore does not have user accounts, cloud sync, or any server-side component. There is nothing to log in to and nothing to delete remotely.

CONTACT
If you have any questions about privacy, email hello@hexplore.app.`;

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeLabel}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.body}>{PRIVACY_TEXT}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14,14,12,0.07)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: '#0E0E0C',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  closeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0E0E0C',
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
    color: 'rgba(14,14,12,0.75)',
  },
});
