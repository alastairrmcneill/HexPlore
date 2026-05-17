import BottomSheet from "@/components/BottomSheet";
import { COUNTRY_NAMES } from "@/constants/countryNames";
import { track } from "@/lib/analytics";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CountryItem = { code: string; name: string; flag: string };

function getFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join("");
}

// Pre-build sorted list once — only 2-letter ISO codes get valid flag emoji
const COUNTRY_LIST: CountryItem[] = Object.entries(COUNTRY_NAMES)
  .filter(([code]) => /^[A-Z]{2}$/.test(code))
  .map(([code, name]) => ({ code, name, flag: getFlagEmoji(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

interface Props {
  visible: boolean;
  onSelect: (code: string) => void;
  onDismiss: () => void;
  showSkip: boolean;
  source?: "onboarding" | "settings";
}

export default function HomeCountrySheet({ visible, onSelect, onDismiss, showSkip, source = "onboarding" }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<CountryItem | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Reset state when sheet opens
  useEffect(() => {
    if (visible) {
      track("home_country_prompt_shown");
      setSelected(null);
      setDropdownOpen(false);
    }
  }, [visible]);

  function handleSelect(code: string) {
    track("home_country_selected", { country_code: code, source });
    onSelect(code);
  }

  function handleDismiss() {
    track("home_country_dismissed");
    onDismiss();
  }

  return (
    <BottomSheet visible={visible} onClose={handleDismiss}>
      {/* Header — always visible */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('homeCountry.eyebrow')}</Text>
        <Text style={styles.title}>{t('homeCountry.title')}</Text>
        {!dropdownOpen && (
          <Text style={styles.subtitle}>{t('homeCountry.subtitle')}</Text>
        )}
      </View>

      {/* Dropdown trigger */}
      <TouchableOpacity
        style={[styles.selector, dropdownOpen && styles.selectorOpen]}
        onPress={() => setDropdownOpen((o) => !o)}
        activeOpacity={0.75}
      >
        <View style={styles.selectorLeft}>
          {selected ? (
            <>
              <Text style={styles.selectorFlag}>{selected.flag}</Text>
              <Text style={styles.selectorValue}>{selected.name}</Text>
            </>
          ) : (
            <Text style={styles.selectorPlaceholder}>{t('homeCountry.placeholder')}</Text>
          )}
        </View>
        <Text style={styles.chevron}>{dropdownOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Expanded country list — lives inside the BottomSheet ScrollView */}
      {dropdownOpen && (
        <View style={styles.listContainer}>
          {COUNTRY_LIST.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={styles.row}
              onPress={() => {
                setSelected(item);
                setDropdownOpen(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.rowFlag}>{item.flag}</Text>
              <Text style={styles.rowName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Actions — shown only when the list is collapsed */}
      {!dropdownOpen && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, !selected && styles.saveButtonDisabled]}
            onPress={selected ? () => handleSelect(selected.code) : undefined}
            activeOpacity={selected ? 0.85 : 1}
          >
            <Text style={[styles.saveLabel, !selected && styles.saveLabelDisabled]}>{t('homeCountry.save')}</Text>
          </TouchableOpacity>

          {showSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={handleDismiss} activeOpacity={0.7}>
              <Text style={styles.skipLabel}>{t('homeCountry.skip')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 16,
  },
  eyebrow: {
    fontFamily: "ui-monospace",
    fontSize: 10.5,
    letterSpacing: 2,
    color: "rgba(14,14,12,0.4)",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#0E0E0C",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(14,14,12,0.5)",
    lineHeight: 20,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "rgba(14,14,12,0.1)",
  },
  selectorOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorFlag: {
    fontSize: 20,
    marginRight: 10,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0E0E0C",
    letterSpacing: -0.2,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: "rgba(14,14,12,0.35)",
    letterSpacing: -0.2,
  },
  chevron: {
    fontSize: 10,
    color: "rgba(14,14,12,0.35)",
    marginLeft: 8,
  },
  listContainer: {
    marginHorizontal: 22,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "rgba(14,14,12,0.1)",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  rowFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0E0E0C",
    letterSpacing: -0.2,
  },
  actions: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 8,
  },
  saveButton: {
    backgroundColor: "#0E0E0C",
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(14,14,12,0.08)",
  },
  saveLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FAFAF7",
    letterSpacing: -0.2,
  },
  saveLabelDisabled: {
    color: "rgba(14,14,12,0.3)",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  skipLabel: {
    fontSize: 15,
    color: "rgba(14,14,12,0.4)",
    fontWeight: "500",
  },
});
