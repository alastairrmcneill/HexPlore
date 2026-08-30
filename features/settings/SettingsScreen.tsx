import { COUNTRY_NAMES } from "@/constants/countryNames";
import HomeCountrySheet from "@/features/map/HomeCountrySheet";
import { track } from "@/lib/analytics";
import { getDeletedCells } from "@/lib/db/queries";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useTheme, ColourScheme } from "@/lib/theme/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Clipboard from "expo-clipboard";
import * as StoreReview from "expo-store-review";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccentColourPicker from "./AccentColourPicker";
import DeletedCellsModal from "./DeletedCellsModal";
import LanguagePicker from "./LanguagePicker";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import SettingsRow from "./SettingsRow";

const APP_VERSION = Constants.expoConfig?.version ?? "0.1";

const SCHEME_OPTIONS: { value: ColourScheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
];

function SectionHeader({ title, colours }: { title: string; colours: any }) {
  return <Text style={[styles.sectionHeader, { color: colours.textFaint }]}>{title}</Text>;
}

function Section({ children, colours }: { children: React.ReactNode; colours: any }) {
  return <View style={[styles.section, { backgroundColor: colours.surfaceSolid, borderColor: colours.border }]}>{children}</View>;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { colours, colourScheme, setColourScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [homeCountry, setHomeCountry] = useState<string | null>(null);
  const [homeCountryPickerVisible, setHomeCountryPickerVisible] = useState(false);
  const [languagePickerVisible, setLanguagePickerVisible] = useState(false);
  const [deletedCellsVisible, setDeletedCellsVisible] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function refreshDeletedCount() {
    getDeletedCells().then((cells) => setDeletedCount(cells.length));
  }

  useEffect(() => {
    track("settings_viewed");
    AsyncStorage.getItem("home_country").then((code) => {
      if (code && code !== "dismissed") setHomeCountry(code);
    });
    refreshDeletedCount();
  }, []);

  function getHomeCountryDisplay(): string {
    if (!homeCountry) return t('settings.location.notSet');
    const name = COUNTRY_NAMES[homeCountry];
    if (!name) return homeCountry;
    const flag = homeCountry
      .split("")
      .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
      .join("");
    return `${flag}  ${name}`;
  }

  async function handleHomeCountrySelect(code: string) {
    await AsyncStorage.setItem("home_country", code);
    setHomeCountry(code);
    setHomeCountryPickerVisible(false);
    track("home_country_changed", { country_code: code });
  }

  async function handleRate() {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
  }

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    toastTimer.current = setTimeout(() => setToastMessage(""), 2400);
  }

  async function handleContact() {
    const url = "mailto:alastair.r.mcneill@gmail.com";
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      await Clipboard.setStringAsync("alastair.r.mcneill@gmail.com");
      showToast("Email copied to clipboard");
    }
  }

  return (
    <>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colours.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colours.text }]}>{t('settings.title')}</Text>

        {/* Appearance */}
        <SectionHeader title={t('settings.appearance.header')} colours={colours} />
        <Section colours={colours}>
          <Text style={[styles.rowLabel, { color: colours.text }]}>{t('settings.appearance.accentColour')}</Text>
          <AccentColourPicker />

          {/* Theme picker */}
          <View style={[styles.themePickerRow, { borderTopColor: colours.border }]}>
            <Text style={[styles.rowLabel, { color: colours.text }]}>{t('settings.appearance.theme')}</Text>
            <View style={[styles.segmentedControl, { backgroundColor: colours.background, borderColor: colours.border }]}>
              {SCHEME_OPTIONS.map(opt => {
                const active = colourScheme === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.segment,
                      active && { backgroundColor: colours.text },
                    ]}
                    onPress={() => setColourScheme(opt.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.segmentLabel, { color: active ? colours.background : colours.textMuted }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <SettingsRow
            label={t('settings.appearance.language')}
            value={t(`languages.${locale}`)}
            onPress={() => setLanguagePickerVisible(true)}
            isLast
          />
        </Section>

        {/* Location */}
        <SectionHeader title={t('settings.location.header')} colours={colours} />
        <Section colours={colours}>
          <SettingsRow
            label={t('settings.location.homeCountry')}
            value={getHomeCountryDisplay()}
            onPress={() => setHomeCountryPickerVisible(true)}
            isLast
          />
        </Section>

        {/* Data */}
        <SectionHeader title={t('settings.data.header')} colours={colours} />
        <Section colours={colours}>
          <SettingsRow
            label={t('settings.data.deletedCells')}
            value={deletedCount > 0 ? String(deletedCount) : t('settings.data.none')}
            onPress={() => setDeletedCellsVisible(true)}
            isLast
          />
        </Section>

        {/* Feedback */}
        <SectionHeader title={t('settings.feedback.header')} colours={colours} />
        <Section colours={colours}>
          <SettingsRow label={t('settings.feedback.rate')} onPress={handleRate} />
          <SettingsRow label={t('settings.feedback.contact')} value="alastair.r.mcneill@gmail.com" onPress={handleContact} isLast />
        </Section>

        {/* Legal */}
        <SectionHeader title={t('settings.legal.header')} colours={colours} />
        <Section colours={colours}>
          <SettingsRow label={t('settings.legal.about')} value={`v${APP_VERSION}`} />
          <SettingsRow label={t('settings.legal.privacy')} onPress={() => setPrivacyVisible(true)} isLast />
        </Section>

        <Text style={[styles.footer, { color: colours.textFaint }]}>{t('settings.footer', { version: APP_VERSION })}</Text>
      </ScrollView>

      <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />

      {toastMessage !== "" && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity, bottom: insets.bottom + 100, backgroundColor: colours.text }]} pointerEvents="none">
          <Text style={[styles.toastText, { color: colours.background }]}>{toastMessage}</Text>
        </Animated.View>
      )}

      <LanguagePicker visible={languagePickerVisible} onClose={() => setLanguagePickerVisible(false)} />

      <HomeCountrySheet
        visible={homeCountryPickerVisible}
        onSelect={handleHomeCountrySelect}
        onDismiss={() => setHomeCountryPickerVisible(false)}
        showSkip={false}
        source="settings"
      />

      <DeletedCellsModal
        visible={deletedCellsVisible}
        onClose={() => setDeletedCellsVisible(false)}
        onRestored={refreshDeletedCount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.8,
    marginBottom: 28,
  },
  sectionHeader: {
    fontFamily: "ui-monospace",
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 8,
  },
  section: {
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
    paddingTop: 16,
  },
  themePickerRow: {
    borderTopWidth: 1,
    paddingBottom: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  footer: {
    fontFamily: "ui-monospace",
    fontSize: 10,
    letterSpacing: 1.4,
    textAlign: "center",
    marginTop: 40,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
});
