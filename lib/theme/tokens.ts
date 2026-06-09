import { Platform } from 'react-native';

export const lightColours = {
  background: '#FAFAF7',
  text: '#0E0E0C',
  textMuted: 'rgba(14,14,12,0.5)',
  textFaint: 'rgba(14,14,12,0.4)',
  surface: 'rgba(255,255,255,0.86)',
  surfaceSolid: '#FFFFFF',
  border: 'rgba(14,14,12,0.07)',
  overlay: 'rgba(14,14,12,0.08)',
  backdrop: 'rgba(14,14,12,0.18)',
  shadow: '#0E0E0C',
  hexOutline: 'rgba(14,14,12,0.12)',
  hexOutlineMap: 'rgba(255,255,255,0.5)',
};

export const darkColours = {
  background: '#1A1A18',
  text: '#FAFAF7',
  textMuted: 'rgba(250,250,247,0.5)',
  textFaint: 'rgba(250,250,247,0.4)',
  surface: 'rgba(28,28,26,0.92)',
  surfaceSolid: '#242422',
  border: 'rgba(250,250,247,0.07)',
  overlay: 'rgba(250,250,247,0.08)',
  backdrop: 'rgba(0,0,0,0.45)',
  shadow: '#000000',
  hexOutline: 'rgba(250,250,247,0.18)',
  hexOutlineMap: 'rgba(255,255,255,0.6)',
};

export type AppColours = typeof lightColours;

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
