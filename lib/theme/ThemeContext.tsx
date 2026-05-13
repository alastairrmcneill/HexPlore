import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ACCENT } from '@/constants/colours';

const STORAGE_KEY = 'accent_colour';

type ThemeContextValue = {
  accent: string;
  setAccent: (hex: string) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) setAccentState(stored);
    });
  }, []);

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex);
    AsyncStorage.setItem(STORAGE_KEY, hex);
  }, []);

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
