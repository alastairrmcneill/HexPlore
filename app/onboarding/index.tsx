import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HexBloom from '@/features/onboarding/HexBloom';
import ScanRipple from '@/features/onboarding/ScanRipple';
import { scanCameraRoll, PermissionDeniedError } from '@/lib/media/scanner';
import { useTheme } from '@/lib/theme/ThemeContext';

type Phase = 'welcome' | 'scanning' | 'done';

const ONBOARDING_KEY = 'onboarding_complete';

export default function OnboardingScreen() {
  const router = useRouter();
  const { accent } = useTheme();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('welcome');
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [hexCount, setHexCount] = useState(0);
  const scanningRef = useRef(false);

  async function handleScan() {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setPhase('scanning');
    setProgress(0);
    setProcessed(0);
    setTotal(0);

    try {
      const result = await scanCameraRoll((proc, tot) => {
        setProcessed(proc);
        setTotal(tot);
        setProgress(tot > 0 ? (proc / tot) * 100 : 0);
      });
      setHexCount(result.hexCount);
      setProgress(100);
      setPhase('done');
    } catch (e) {
      if (e instanceof PermissionDeniedError) {
        setPhase('welcome');
      }
      scanningRef.current = false;
    }
  }

  async function handleSeeResults() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {phase === 'welcome' && (
        <View style={[styles.welcome, { paddingTop: Math.max(insets.top, 56), paddingBottom: Math.max(insets.bottom, 34) }]}>
          <View style={styles.bloomContainer}>
            <HexBloom accent={accent} />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>HexPlore · v0.1</Text>
            <Text style={styles.headline}>See how much of the world you've actually been to.</Text>
            <Text style={styles.body}>
              HexPlore reads the location of photos in your camera roll and fills in a hexagon for every 50{' '}km square you've visited. Nothing leaves your device.
            </Text>
          </View>

          <View style={styles.ctaSection}>
            <TouchableOpacity style={styles.ctaButton} onPress={handleScan} activeOpacity={0.85}>
              <Text style={styles.ctaLabel}>Scan my photos</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </TouchableOpacity>
            <Text style={styles.safetyNote}>Photo data stays on this device.</Text>
          </View>
        </View>
      )}

      {phase === 'scanning' && (
        <View style={styles.scanContainer}>
          <ScanRipple accent={accent} progress={progress} />
          <View style={styles.scanText}>
            <Text style={styles.scanLabel}>SCANNING CAMERA ROLL</Text>
            <Text style={[styles.scanPercent, { color: accent }]}>
              {Math.floor(progress)}<Text style={[styles.scanPercentSign, { color: accent }]}>%</Text>
            </Text>
            <Text style={styles.scanDetail}>
              Reading EXIF coordinates · {processed.toLocaleString()} of {total.toLocaleString()} photos
            </Text>
          </View>
        </View>
      )}

      {phase === 'done' && (
        <View style={[styles.scanContainer, { paddingHorizontal: 20 }]}>
          <ScanRipple accent={accent} progress={100} />
          <View style={styles.scanText}>
            <Text style={styles.scanLabel}>ALL DONE</Text>
            <Text style={styles.doneHexCount}>{hexCount.toLocaleString()} hexes found</Text>
            <Text style={styles.scanDetail}>Your camera roll has been mapped.</Text>
          </View>
          <TouchableOpacity style={[styles.ctaButton, { marginTop: 32 }]} onPress={handleSeeResults} activeOpacity={0.85}>
            <Text style={styles.ctaLabel}>See results</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1,
    backgroundColor: '#FAFAF7',
    flexDirection: 'column',
  },
  bloomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 38,
    lineHeight: 39,
    fontWeight: '600',
    color: '#0E0E0C',
    marginTop: 14,
    marginBottom: 12,
    letterSpacing: -1,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 22.5,
    color: 'rgba(14,14,12,0.62)',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#0E0E0C',
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaLabel: {
    color: '#FAFAF7',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.16,
  },
  ctaArrow: {
    color: '#FAFAF7',
    fontSize: 18,
  },
  safetyNote: {
    textAlign: 'center',
    fontSize: 12.5,
    color: 'rgba(14,14,12,0.42)',
    marginTop: 12,
  },

  // scanning / done
  scanContainer: {
    flex: 1,
    backgroundColor: '#FAFAF7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 40,
  },
  scanText: {
    alignItems: 'center',
  },
  scanLabel: {
    fontFamily: 'ui-monospace',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(14,14,12,0.5)',
    textTransform: 'uppercase',
  },
  scanPercent: {
    fontFamily: 'ui-monospace',
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -1,
    marginTop: 8,
  },
  scanPercentSign: {
    fontSize: 18,
  },
  scanDetail: {
    fontSize: 13,
    color: 'rgba(14,14,12,0.55)',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  doneHexCount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0E0E0C',
    marginTop: 8,
  },
});
