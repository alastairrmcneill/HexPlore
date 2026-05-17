import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const initialLng: SupportedLocale = (SUPPORTED_LOCALES as readonly string[]).includes(deviceLang)
  ? (deviceLang as SupportedLocale)
  : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
