import PostHog from 'posthog-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const DISTINCT_ID_KEY = 'analytics_distinct_id';

const apiKey = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;
const isConfigured = !!apiKey && apiKey !== 'phc_your_project_token_here';

// Shared PostHog client — also consumed by PostHogProvider in _layout.tsx
export const posthog = new PostHog(apiKey ?? 'placeholder', {
  host,
  disabled: !isConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
});

export async function initAnalytics(): Promise<void> {
  try {
    let distinctId = await AsyncStorage.getItem(DISTINCT_ID_KEY);
    if (!distinctId) {
      distinctId = generateUUID();
      await AsyncStorage.setItem(DISTINCT_ID_KEY, distinctId);
    }
    posthog.identify(distinctId);
  } catch {
    // Analytics are non-critical — fail silently
  }
}

export function track(event: string, properties?: Record<string, string | number | boolean | null>): void {
  try {
    posthog.capture(event, properties as any);
  } catch {
    // No-op
  }
}
