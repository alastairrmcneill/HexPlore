import HexBloom from "@/features/onboarding/HexBloom";
import ScanRipple from "@/features/onboarding/ScanRipple";
import { track } from "@/lib/analytics";
import { LAST_SCAN_KEY, PermissionDeniedError, scanCameraRoll } from "@/lib/media/scanner";
import { useTheme } from "@/lib/theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Phase = "welcome" | "scanning" | "done";

const ONBOARDING_KEY = "onboarding_complete";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { accent } = useTheme();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>("welcome");
  const [progress, setProgress] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [hexCount, setHexCount] = useState(0);
  const [permDenied, setPermDenied] = useState(false);
  const scanningRef = useRef(false);
  const scanStartRef = useRef(0);

  useEffect(() => {
    track("onboarding_started");
    track("onboarding_screen_viewed", { screen: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleScan() {
    if (scanningRef.current) return;
    scanningRef.current = true;
    scanStartRef.current = Date.now();
    setPhase("scanning");
    setProgress(0);
    setProcessed(0);
    setTotal(0);
    track("camera_permission_requested");
    track("onboarding_screen_viewed", { screen: 2 });

    try {
      const result = await scanCameraRoll((proc, tot) => {
        setProcessed(proc);
        setTotal(tot);
        setProgress(tot > 0 ? (proc / tot) * 100 : 0);
      });
      const duration = Date.now() - scanStartRef.current;
      await AsyncStorage.setItem(LAST_SCAN_KEY, String(scanStartRef.current));
      track("camera_permission_granted");
      track("scan_completed", { photo_count: result.photoCount, hex_count: result.hexCount, duration_ms: duration });
      setHexCount(result.hexCount);
      setProgress(100);
      setPhase("done");
      track("onboarding_screen_viewed", { screen: 3 });
    } catch (e) {
      if (e instanceof PermissionDeniedError) {
        track("camera_permission_denied");
        setPermDenied(true);
        setPhase("welcome");
      }
      scanningRef.current = false;
    }
  }

  async function handleSeeResults() {
    track("results_reveal_viewed");
    track("app_entered");
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {phase === "welcome" && (
        <View
          style={[styles.welcome, { paddingTop: Math.max(insets.top, 56), paddingBottom: Math.max(insets.bottom, 34) }]}
        >
          <View style={styles.bloomContainer}>
            <HexBloom accent={accent} />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{t('onboarding.eyebrow')}</Text>
            <Text style={styles.headline}>{t('onboarding.headline')}</Text>
            <Text style={styles.body}>{t('onboarding.body')}</Text>
          </View>

          {permDenied && (
            <View style={styles.permBanner}>
              <Text style={styles.permBannerText}>
                {t('onboarding.permDenied.before')}
                <Text style={styles.permBannerLink} onPress={() => Linking.openSettings()}>
                  {t('onboarding.permDenied.link')}
                </Text>
                {t('onboarding.permDenied.after')}
              </Text>
            </View>
          )}

          <View style={styles.ctaSection}>
            <TouchableOpacity style={styles.ctaButton} onPress={handleScan} activeOpacity={0.85}>
              <Text style={styles.ctaLabel}>{t('onboarding.cta')}</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </TouchableOpacity>
            <Text style={styles.safetyNote}>{t('onboarding.safetyNote')}</Text>
          </View>
        </View>
      )}

      {phase === "scanning" && (
        <View style={styles.scanContainer}>
          <ScanRipple accent={accent} progress={progress} />
          <View style={styles.scanText}>
            <Text style={styles.scanLabel}>{t('onboarding.scanning.label')}</Text>
            <Text style={[styles.scanPercent, { color: accent }]}>
              {Math.floor(progress)}
              <Text style={[styles.scanPercentSign, { color: accent }]}>%</Text>
            </Text>
            <Text style={styles.scanDetail}>
              {t('onboarding.scanning.detail', { processed: processed.toLocaleString(), total: total.toLocaleString() })}
            </Text>
          </View>
        </View>
      )}

      {phase === "done" && (
        <View style={[styles.scanContainer, { paddingHorizontal: 20 }]}>
          <ScanRipple accent={accent} progress={100} />
          <View style={styles.scanText}>
            {hexCount === 0 ? (
              <>
                <Text style={styles.scanLabel}>{t('onboarding.done.labelNoHexes')}</Text>
                <Text style={styles.doneHexCount}>{t('onboarding.done.noHexes')}</Text>
                <Text style={styles.scanDetail}>{t('onboarding.done.detailNoHexes')}</Text>
              </>
            ) : (
              <>
                <Text style={styles.scanLabel}>{t('onboarding.done.labelDone')}</Text>
                <Text style={styles.doneHexCount}>{t('onboarding.done.hexesFound', { count: hexCount })}</Text>
                <Text style={styles.scanDetail}>{t('onboarding.done.detailMapped')}</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={[styles.ctaButton, { marginTop: 32 }]}
            onPress={handleSeeResults}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaLabel}>{hexCount === 0 ? t('onboarding.done.ctaExplore') : t('onboarding.done.ctaResults')}</Text>
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
    backgroundColor: "#FAFAF7",
    flexDirection: "column",
  },
  bloomContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: "ui-monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: "rgba(14,14,12,0.5)",
    textTransform: "uppercase",
  },
  headline: {
    fontSize: 38,
    lineHeight: 39,
    fontWeight: "600",
    color: "#0E0E0C",
    marginTop: 14,
    marginBottom: 12,
    letterSpacing: -1,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 22.5,
    color: "rgba(14,14,12,0.62)",
  },
  permBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "rgba(255,100,80,0.08)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,100,80,0.18)",
  },
  permBannerText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: "rgba(14,14,12,0.72)",
  },
  permBannerLink: {
    color: "#C94030",
    fontWeight: "500",
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  ctaButton: {
    backgroundColor: "#0E0E0C",
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaLabel: {
    color: "#FAFAF7",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.16,
  },
  ctaArrow: {
    color: "#FAFAF7",
    fontSize: 18,
  },
  safetyNote: {
    textAlign: "center",
    fontSize: 12.5,
    color: "rgba(14,14,12,0.42)",
    marginTop: 12,
  },

  // scanning / done
  scanContainer: {
    flex: 1,
    backgroundColor: "#FAFAF7",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 40,
  },
  scanText: {
    alignItems: "center",
  },
  scanLabel: {
    fontFamily: "ui-monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: "rgba(14,14,12,0.5)",
    textTransform: "uppercase",
  },
  scanPercent: {
    fontFamily: "ui-monospace",
    fontSize: 32,
    fontWeight: "500",
    letterSpacing: -1,
    marginTop: 8,
  },
  scanPercentSign: {
    fontSize: 18,
  },
  scanDetail: {
    fontSize: 13,
    color: "rgba(14,14,12,0.55)",
    marginTop: 10,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
  doneHexCount: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0E0E0C",
    marginTop: 8,
  },
});
