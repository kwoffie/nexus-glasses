import { useState, useEffect } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Navigation() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const NAV_LINKS = [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.demo'), href: '#demo' },
    { label: t('nav.demoReels'), href: '#demo-reels' },
    { label: t('nav.experience'), href: '#experience' },
    { label: t('nav.studio'), href: '#studio' },
    { label: t('nav.benefits'), href: '#benefits' },
    { label: t('nav.specs'), href: '#specs' },
    { label: t('nav.compare'), href: '#compare' },
    { label: t('nav.stories'), href: '#stories' },
    { label: t('nav.faq'), href: '#faq' },
    { label: t('nav.preorder'), href: '#preorder' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 shadow-lg'
          : 'bg-transparent'
      }`}
      style={{ height: 72 }}
    >
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <a
          href="#"
          className="font-mono text-base font-semibold tracking-[0.15em] text-white hover:text-amber-400 transition-all duration-300"
        >
          {t('nav.logo')}
        </a>

          {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.slice(0, -1).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-all duration-300 relative py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <input
            type="text"
            placeholder={t('common.search')}
            className="w-48 lg:w-64 bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all duration-300"
          />
          <Search size={16} className="absolute left-3 text-white/40" />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t('common.closeMenu') : t('common.openMenu')}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#030712]/95 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex flex-col gap-2 animate-fadeIn">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base text-white/70 hover:text-white transition-colors py-3 border-b border-white/5 last:border-0"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
