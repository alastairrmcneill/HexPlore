import PostHog from 'posthog-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Replace with your PostHog project API key
const POSTHOG_API_KEY = 'phc_REPLACE_WITH_YOUR_KEY';
const POSTHOG_HOST = 'https://us.i.posthog.com';
const DISTINCT_ID_KEY = 'analytics_distinct_id';

let client: PostHog | null = null;

export async function initAnalytics(): Promise<void> {
  try {
    let distinctId = await AsyncStorage.getItem(DISTINCT_ID_KEY);
    if (!distinctId) {
      distinctId = generateUUID();
      await AsyncStorage.setItem(DISTINCT_ID_KEY, distinctId);
    }
    client = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      defaultOptIn: true,
    });
    client.identify(distinctId);
  } catch {
    // Analytics are non-critical — fail silently
  }
}

export function track(event: string, properties?: Record<string, string | number | boolean | null>): void {
  try {
    client?.capture(event, properties as any);
  } catch {
    // No-op
  }
}
