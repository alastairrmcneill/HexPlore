import { SymbolView } from 'expo-symbols';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeContext';

interface Props {
  zoom: number;
  onShare: () => void;
  onAdd: () => void;
  mapMode: "minimal" | "street";
  onToggleMapMode: () => void;
}

export default function TopBar({ zoom, onShare, onAdd, mapMode, onToggleMapMode }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colours } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  function zoomLevel(): string {
    if (zoom < 3) return t('map.zoomLevel.world');
    if (zoom < 5) return t('map.zoomLevel.regional');
    return t('map.zoomLevel.local');
  }

  function openMenu() {
    setMenuVisible(true);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 280,
      friction: 22,
    }).start();
  }

  function closeMenu(then?: () => void) {
    Animated.timing(anim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
      then?.();
    });
  }

  const menuTop = insets.top + 8 + 38 + 6;

  return (
    <>
      <View style={styles.gradient} pointerEvents="none" />

      <View style={[styles.bar, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View pointerEvents="none">
          <Text style={[styles.eyebrow, { color: colours.textMuted }]}>{t('map.topbar.worldCoverage')}</Text>
          <Text style={[styles.title, { color: colours.text }]}>HexPlore</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.glassBtn, { backgroundColor: colours.surface, borderColor: colours.border, shadowColor: colours.shadow }]}
            onPress={onShare}
            activeOpacity={0.75}
          >
            <SymbolView name="square.and.arrow.up" size={18} tintColor={colours.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.glassBtn,
              { backgroundColor: colours.surface, borderColor: colours.border, shadowColor: colours.shadow },
              mapMode === "street" && { backgroundColor: colours.text, borderColor: 'transparent' },
            ]}
            onPress={onToggleMapMode}
            activeOpacity={0.75}
          >
            <SymbolView
              name={mapMode === "street" ? "map.fill" : "map"}
              size={18}
              tintColor={mapMode === "street" ? colours.background : colours.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.glassBtn, { backgroundColor: colours.surface, borderColor: colours.border, shadowColor: colours.shadow }]}
            onPress={openMenu}
            activeOpacity={0.75}
          >
            <Text style={[styles.glassBtnLabelLarge, { color: colours.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.zoomIndicator, { top: insets.top + 52 }]} pointerEvents="none">
        <Text style={[styles.zoomText, { color: colours.textMuted }]}>
          {t('map.topbar.zoom', { zoom: zoom.toFixed(2), level: zoomLevel() })}
        </Text>
      </View>

      <Modal visible={menuVisible} transparent animationType="none" onRequestClose={() => closeMenu()}>
        <TouchableWithoutFeedback onPress={() => closeMenu()}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.menu,
            { top: menuTop, right: 16, backgroundColor: colours.surfaceSolid },
            {
              opacity: anim,
              transform: [
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
                { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [9, 0] }) },
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-9, 0] }) },
              ],
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.5}
            onPress={() => closeMenu(onAdd)}
          >
            <Text style={[styles.menuItemLabel, { color: colours.text }]}>{t('map.topbar.scanAgain')}</Text>
            <SymbolView name="camera" size={16} tintColor={colours.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.44,
    marginTop: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  glassBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  glassBtnLabelLarge: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  zoomIndicator: {
    position: 'absolute',
    left: 20,
  },
  zoomText: {
    fontFamily: 'ui-monospace',
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  menu: {
    position: 'absolute',
    width: 210,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  menuItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
