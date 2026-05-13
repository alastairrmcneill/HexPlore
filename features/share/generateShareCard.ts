import { RefObject } from 'react';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

export async function generateShareCard(
  viewShotRef: RefObject<ViewShot | null>,
): Promise<void> {
  const ref = viewShotRef.current;
  if (!ref?.capture) return;

  const uri = await ref.capture();

  await Share.open({
    url: `file://${uri}`,
    type: 'image/png',
    failOnCancel: false,
  });
}
