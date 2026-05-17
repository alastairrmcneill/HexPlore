import HexBloom from "@/features/onboarding/HexBloom";
import { useTheme } from "@/lib/theme/ThemeContext";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  visible: boolean;
}

export default function MapLoadingOverlay({ visible }: Props) {
  const { accent } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = useState(true);
  const [blocking, setBlocking] = useState(true);

  useEffect(() => {
    if (!visible) {
      setBlocking(false);
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        delay: 80,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, opacity]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={blocking ? "auto" : "none"}
    >
      <View style={styles.content}>
        <HexBloom accent={accent} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>HexPlore</Text>
          <Text style={styles.subtitle}>Loading your map…</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FAFAF7",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  content: {
    alignItems: "center",
    gap: 20,
    marginTop: -40,
  },
  textBlock: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0E0E0C",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "ui-monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: "rgba(14,14,12,0.4)",
    textTransform: "uppercase",
  },
});
