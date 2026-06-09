import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { DEFAULT_ACCENT } from '@/constants/colours';
import { lightColours, darkColours, AppColours } from '@/lib/theme/tokens';

export type ColourScheme = 'light' | 'dark' | 'system';

const ACCENT_KEY = 'accent_colour';
const SCHEME_KEY = 'colour_scheme';

type ThemeContextValue = {
  accent: string;
  setAccent: (hex: string) => void;
  colourScheme: ColourScheme;
  setColourScheme: (s: ColourScheme) => void;
  isDark: boolean;
  colours: AppColours;
};

const ThemeContext = createContext<ThemeContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
  colourScheme: 'system',
  setColourScheme: () => {},
  isDark: false,
  colours: lightColours,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);
  const [colourScheme, setColourSchemeState] = useState<ColourScheme>('system');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ACCENT_KEY),
      AsyncStorage.getItem(SCHEME_KEY),
    ]).then(([storedAccent, storedScheme]) => {
      if (storedAccent) setAccentState(storedAccent);
      if (storedScheme === 'light' || storedScheme === 'dark' || storedScheme === 'system') {
        setColourSchemeState(storedScheme);
      }
    });
  }, []);

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex);
    AsyncStorage.setItem(ACCENT_KEY, hex);
  }, []);

  const setColourScheme = useCallback((s: ColourScheme) => {
    setColourSchemeState(s);
    AsyncStorage.setItem(SCHEME_KEY, s);
  }, []);

  const isDark =
    colourScheme === 'dark' ||
    (colourScheme === 'system' && systemScheme === 'dark');

  const colours = isDark ? darkColours : lightColours;

  return (
    <ThemeContext.Provider value={{ accent, setAccent, colourScheme, setColourScheme, isDark, colours }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
