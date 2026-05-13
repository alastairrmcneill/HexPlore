import React, { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 110;

const ENTER = { duration: 320, easing: Easing.out(Easing.cubic) };
const EXIT  = { duration: 260, easing: Easing.in(Easing.cubic) };
const SNAP  = { duration: 220, easing: Easing.out(Easing.quad) };

// Tab bar floats at insets.bottom + 10, is ~50pt tall — clear it with room to spare.
const TAB_BAR_CLEARANCE = 76;

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withTiming(0, ENTER);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 220 });
      translateY.value = withTiming(SCREEN_HEIGHT, EXIT);
    }
  }, [visible]);

  // Pan gesture is scoped to the drag handle only — the ScrollView below
  // handles its own native scroll without any gesture conflict.
  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd(e => {
      if (e.translationY > DISMISS_THRESHOLD) {
        runOnJS(onClose)();
      } else {
        translateY.value = withTiming(0, SNAP);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'box-none' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Drag handle — pan gesture lives here only */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        {/* Scrollable content clears the floating tab bar */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(14,14,12,0.18)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: SCREEN_HEIGHT * 0.74,
    backgroundColor: '#FAFAF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#0E0E0C',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 10,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(14,14,12,0.18)',
    marginBottom: 16,
  },
  scroll: {
    paddingHorizontal: 22,
  },
});
