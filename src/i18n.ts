import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import en from '../public/locales/en/translation.json'
import zhCN from '../public/locales/zh-CN/translation.json'
import ja from '../public/locales/ja/translation.json'
import ak from '../public/locales/ak/translation.json'
import fr from '../public/locales/fr/translation.json'
import es from '../public/locales/es/translation.json'

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
  ja: { translation: ja },
  ak: { translation: ak },
  fr: { translation: fr },
  es: { translation: es },
} as const

export const supportedLanguages = ['en', 'zh-CN', 'ja', 'ak', 'fr', 'es'] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]

// Detect language from browser or default to English
const getDefaultLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('nexus-language') as SupportedLanguage | null
    if (stored && supportedLanguages.includes(stored)) {
      return stored
    }
    const browserLang = navigator.language
    if (supportedLanguages.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage
    }
    // Match language family (e.g., zh-CN matches zh)
    const match = supportedLanguages.find((lang) => browserLang.startsWith(lang.split('-')[0]))
    if (match) return match
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDefaultLanguage(),
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
