import { useRouter } from 'expo-router';
import MapScreen from '@/features/map/MapScreen';

export default function MapTab() {
  const router = useRouter();
  return (
    <MapScreen onNavigateStats={() => router.push('/(tabs)/stats')} />
  );
}
