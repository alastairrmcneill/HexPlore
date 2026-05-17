import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n, { SUPPORTED_LOCALES, SupportedLocale } from './index';

const STORAGE_KEY = 'app_language';

type LocaleContextValue = {
  locale: SupportedLocale;
  // Pass null to revert to device default
  setLocale: (lang: SupportedLocale | null) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
});

function resolveLocale(lang: string | null | undefined): SupportedLocale {
  if (lang && (SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
    return lang as SupportedLocale;
  }
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
  return (SUPPORTED_LOCALES as readonly string[]).includes(deviceLang)
    ? (deviceLang as SupportedLocale)
    : 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(resolveLocale(null));

  // On mount, check for a user-stored override
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      const resolved = resolveLocale(stored);
      setLocaleState(resolved);
      i18n.changeLanguage(resolved);
    });
  }, []);

  const setLocale = useCallback((lang: SupportedLocale | null) => {
    const resolved = resolveLocale(lang);
    setLocaleState(resolved);
    i18n.changeLanguage(resolved);
    if (lang) {
      AsyncStorage.setItem(STORAGE_KEY, lang);
    } else {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
