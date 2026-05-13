import { Platform } from 'react-native';

export const colours = {
  background: '#FAFAF7',
  text: '#0E0E0C',
  accentDefault: '#FF6B5B',
  surface: 'rgba(255,255,255,0.86)',
  muted: '#888880',
  border: 'rgba(14,14,12,0.08)',
};

export const radii = {
  card: 24,
  pill: 30,
  sheet: 28,
};

export const shadow = {
  shadowColor: '#0E0E0C',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 40,
};

export const fonts = {
  sans: Platform.select({ ios: 'System', default: 'normal' }),
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
};
