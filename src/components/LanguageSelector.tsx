import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'
import { supportedLanguages, type SupportedLanguage } from '@/i18n'

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  'zh-CN': '中文 (简体)',
  ja: '日本語',
  ak: 'Twi (Akan)',
  fr: 'Français',
  es: 'Español',
}

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  'zh-CN': '🇨🇳',
  ja: '🇯🇵',
  ak: '🇬🇭',
  fr: '🇫🇷',
  es: '🇪🇸',
}

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = i18n.language as SupportedLanguage

  const changeLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('nexus-language', lang)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe size={14} />
        <span>{LANGUAGE_FLAGS[currentLang]}</span>
        <span>{LANGUAGE_LABELS[currentLang]}</span>
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-[#030712]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn"
          onMouseLeave={() => setIsOpen(false)}
        >
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                currentLang === lang
                  ? 'bg-amber-500 text-[#030712] font-semibold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_LABELS[lang]}</span>
              {currentLang === lang && (
                <span className="ml-auto text-xs text-white/40">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
