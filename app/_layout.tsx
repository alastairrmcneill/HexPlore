import { useEffect, useRef } from 'react';
import { Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PostHogProvider } from 'posthog-react-native';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { LocaleProvider } from '@/lib/i18n/LocaleContext';
import '@/lib/i18n';
import { runMigrations } from '@/lib/db/migrations';
import { initAnalytics, posthog } from '@/lib/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

export const unstable_settings = {
  anchor: '(tabs)',
};

async function trackAppOpen() {
  const raw = await AsyncStorage.getItem('app_open_count');
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  await AsyncStorage.setItem('app_open_count', String(count));
  if (count === 2 && (await StoreReview.hasAction())) {
    StoreReview.requestReview();
  }
}

function ScreenTracker() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, { previous_screen: previousPathname.current ?? null, ...params });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    runMigrations().catch(console.error);
    initAnalytics().catch(console.error);
    trackAppOpen().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ['testID'],
        }}
      >
        <ThemeProvider>
          <LocaleProvider>
            <ScreenTracker />
            <Stack>
              <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="dark" />
          </LocaleProvider>
        </ThemeProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
}
