import { COUNTRY_NAMES } from "@/constants/countryNames";
import HomeCountrySheet from "@/features/map/HomeCountrySheet";
import { track } from "@/lib/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccentColourPicker from "./AccentColourPicker";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import SettingsRow from "./SettingsRow";

const APP_VERSION = Constants.expoConfig?.version ?? "0.1";

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [homeCountry, setHomeCountry] = useState<string | null>(null);
  const [homeCountryPickerVisible, setHomeCountryPickerVisible] = useState(false);

  useEffect(() => {
    track("settings_viewed");
    AsyncStorage.getItem("home_country").then((code) => {
      if (code && code !== "dismissed") setHomeCountry(code);
    });
  }, []);

  function getHomeCountryDisplay(): string {
    if (!homeCountry) return "Not set";
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

  function handleContact() {
    Linking.openURL("mailto:hello@hexplore.app");
  }

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Appearance */}
        <SectionHeader title="APPEARANCE" />
        <Section>
          <Text style={styles.rowLabel}>Accent colour</Text>
          <AccentColourPicker />
        </Section>

        {/* Location */}
        <SectionHeader title="LOCATION" />
        <Section>
          <SettingsRow
            label="Home Country"
            value={getHomeCountryDisplay()}
            onPress={() => setHomeCountryPickerVisible(true)}
            isLast
          />
        </Section>

        {/* Feedback */}
        <SectionHeader title="FEEDBACK" />
        <Section>
          <SettingsRow label="Rate HexPlore" onPress={handleRate} />
          <SettingsRow label="Contact" value="hello@hexplore.app" onPress={handleContact} isLast />
        </Section>

        {/* Legal */}
        <SectionHeader title="LEGAL" />
        <Section>
          <SettingsRow label="About" value={`v${APP_VERSION}`} />
          <SettingsRow label="Privacy Policy" onPress={() => setPrivacyVisible(true)} isLast />
        </Section>

        <Text style={styles.footer}>HexPlore · v{APP_VERSION}</Text>
      </ScrollView>

      <PrivacyPolicyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />

      <HomeCountrySheet
        visible={homeCountryPickerVisible}
        onSelect={handleHomeCountrySelect}
        onDismiss={() => setHomeCountryPickerVisible(false)}
        showSkip={false}
        source="settings"
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FAFAF7",
  },
  content: {
    paddingHorizontal: 22,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.8,
    color: "#0E0E0C",
    marginBottom: 28,
  },
  sectionHeader: {
    fontFamily: "ui-monospace",
    fontSize: 10.5,
    letterSpacing: 2,
    color: "rgba(14,14,12,0.4)",
    textTransform: "uppercase",
    marginTop: 28,
    marginBottom: 8,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(14,14,12,0.06)",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
    color: "#0E0E0C",
    paddingTop: 16,
  },
  footer: {
    fontFamily: "ui-monospace",
    fontSize: 10,
    letterSpacing: 1.4,
    color: "rgba(14,14,12,0.3)",
    textAlign: "center",
    marginTop: 40,
  },
});
