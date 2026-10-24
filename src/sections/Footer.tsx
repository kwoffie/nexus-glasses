import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const FOOTER_LINKS = [
    { key: 'privacy', label: t('common.links.privacy') },
    { key: 'terms', label: t('common.links.terms') },
    { key: 'support', label: t('common.links.support') },
    { key: 'press', label: t('common.links.press') },
  ]

  return (
    <footer className="relative py-12 lg:py-16 px-6 lg:px-12 border-t border-white/10 bg-gradient-to-b from-transparent to-white/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="text-center md:text-left">
            <span className="font-mono text-xl font-semibold tracking-[0.15em] text-white mb-2 block">
              NEXUS
            </span>
            <p className="text-sm text-white/60">
              {t('common.footerTagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.map((link, i) => (
              <div key={link.key} className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </a>
                {i < FOOTER_LINKS.length - 1 && (
                  <span className="text-white/20">·</span>
                )}
              </div>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-white/40">
            {t('common.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
