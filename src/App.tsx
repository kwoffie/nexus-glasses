import { Suspense, lazy, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Navigation from './sections/Navigation'
import ContentProtection from './components/ContentProtection'
import Hero from './sections/Hero'
import Features from './sections/Features'
import Demo from './sections/Demo'
import DemoReels from './sections/DemoReels'
import Showcase from './sections/Showcase'
import Experience from './sections/Experience'
import Benefits from './sections/Benefits'
import Specs from './sections/Specs'
import Health from './sections/Health'
import LaunchCountdown from './sections/LaunchCountdown'
import LiveDemo from './sections/LiveDemo'
import Preorder from './sections/Preorder'
import Footer from './sections/Footer'
import LanguageSelector from '@/components/LanguageSelector'

// Phase 12: Lazy load non-critical sections for faster initial load
const ColorStudio = lazy(() => import('./sections/ColorStudio'))
const Comparison = lazy(() => import('./sections/Comparison'))
const Testimonials = lazy(() => import('./sections/Testimonials'))
const FAQ = lazy(() => import('./sections/FAQ'))

// Phase 12: Simple loading fallback for lazy sections
function SectionLoader() {
  return (
    <div className="py-20 flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
    </div>
  )
}

// Safety net: ensure all sections are visible after a timeout
function VisibilitySafetyNet() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Make all elements with opacity: 0 visible
      document.querySelectorAll('[style*="opacity: 0"], [style*="opacity:0"]').forEach((el) => {
        (el as HTMLElement).style.opacity = '1'
        ;(el as HTMLElement).style.transform = 'none'
      })
      // Add animate-in class to all elements that might be stuck
      document.querySelectorAll('section, .feature-item, .demo-reels-card, .live-fade-in, .demo-reels-fade-in').forEach((el) => {
        el.classList.add('animate-in')
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return null
}
export default function App() {
  const { t, i18n } = useTranslation()

  return (
    <div className="min-h-screen bg-[#030712] text-[#f8fafc] overflow-x-hidden">
      <VisibilitySafetyNet />
      <ContentProtection />
      <Navigation />
      <main>
        <Hero />
        <Features />
        <Demo />
        <DemoReels />
        <Showcase />
        <Experience />
        <Suspense fallback={<SectionLoader />}>
          <ColorStudio />
        </Suspense>
        <Benefits />
        <Specs />
        <Health />
        <Suspense fallback={<SectionLoader />}>
          <Comparison />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>
        <LaunchCountdown />
        <LiveDemo />
        <Preorder />
      </main>
      <Footer />
      <LanguageSelector />
    </div>
  )
}
