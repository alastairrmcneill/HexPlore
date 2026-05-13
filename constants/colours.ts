export type AccentColour = {
  name: string;
  hex: string;
};

export const ACCENT_COLOURS: AccentColour[] = [
  { name: 'Coral', hex: '#FF6B5B' },
  { name: 'Teal', hex: '#2DD4BF' },
  { name: 'Burnt Orange', hex: '#EA580C' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Sage', hex: '#84A98C' },
  { name: 'Slate', hex: '#64748B' },
];

export const DEFAULT_ACCENT = ACCENT_COLOURS[0].hex;
