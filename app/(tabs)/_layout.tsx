import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import TabBar from '@/components/TabBar';

export default function TabLayout() {
  const [checked, setChecked] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then(val => {
      setOnboardingDone(val === 'true');
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Map' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
