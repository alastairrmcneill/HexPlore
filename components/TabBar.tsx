import { useTheme } from "@/lib/theme/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabDef =
  | { name: string; label: string; set: 'ion'; icon: keyof typeof Ionicons.glyphMap }
  | { name: string; label: string; set: 'mci'; icon: keyof typeof MaterialCommunityIcons.glyphMap };

const TABS: TabDef[] = [
  { name: "index",    label: "Map",      set: 'mci', icon: "hexagon-outline" },
  { name: "stats",    label: "Stats",    set: 'ion', icon: "bar-chart-outline" },
  { name: "settings", label: "Settings", set: 'ion', icon: "settings-outline" },
];

const INACTIVE_COLOR = "rgba(14,14,12,0.45)";

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { accent } = useTheme();

  return (
    <View style={[styles.container, { bottom: insets.bottom + 10 }]}>
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
            style={[styles.tab, isFocused && styles.activeTab]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            {tab.set === 'mci'
              ? <MaterialCommunityIcons name={tab.icon} size={16} color={isFocused ? accent : styles.labelInactive.color} />
              : <Ionicons name={tab.icon} size={15} color={isFocused ? accent : styles.labelInactive.color} />
            }
            <Text style={[styles.label, isFocused ? styles.labelActive : styles.labelInactive]}>{tab.label}</Text>
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
    backgroundColor: "rgba(255,255,255)",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 6,
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(14,14,12,0.06)",
    shadowColor: "#0E0E0C",
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
  activeTab: {
    backgroundColor: "#0E0E0C",
  },
  label: {
    fontSize: 13.5,
    fontWeight: "500",
    letterSpacing: -0.14,
  },
  labelActive: {
    color: "#FAFAF7",
  },
  labelInactive: {
    color: "rgba(14,14,12,0.55)",
  },
});
