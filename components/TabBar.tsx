import { useTheme } from "@/lib/theme/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabDef =
  | { name: string; label: string; set: 'ion'; icon: keyof typeof Ionicons.glyphMap }
  | { name: string; label: string; set: 'mci'; icon: keyof typeof MaterialCommunityIcons.glyphMap };

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { accent, colours } = useTheme();

  const TABS: TabDef[] = [
    { name: "index",    label: t('tabs.map'),      set: 'mci', icon: "hexagon-outline" },
    { name: "stats",    label: t('tabs.stats'),    set: 'ion', icon: "bar-chart-outline" },
    { name: "settings", label: t('tabs.settings'), set: 'ion', icon: "settings-outline" },
  ];

  return (
    <View style={[
      styles.container,
      {
        bottom: insets.bottom + 10,
        backgroundColor: colours.surfaceSolid,
        borderColor: colours.border,
        shadowColor: colours.shadow,
      }
    ]}>
      {TABS.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        const isFocused = state.index === state.routes.indexOf(route);

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isFocused && { backgroundColor: colours.text }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            {tab.set === 'mci'
              ? <MaterialCommunityIcons name={tab.icon} size={16} color={isFocused ? accent : colours.textMuted} />
              : <Ionicons name={tab.icon} size={15} color={isFocused ? accent : colours.textMuted} />
            }
            <Text style={[styles.label, { color: isFocused ? colours.background : colours.textMuted }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 14,
    right: 14,
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 6,
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "500",
    letterSpacing: -0.14,
  },
});
