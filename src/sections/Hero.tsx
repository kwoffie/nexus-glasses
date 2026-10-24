import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useVideoCache } from '@/contexts/VideoCacheContext'

export default function Hero() {
  const { t } = useTranslation()
  const { preloadVideo } = useVideoCache()
  const contentRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Preload background video
  useEffect(() => {
    preloadVideo('/videos/nexus-overview.mp4')
  }, [preloadVideo])

  // Ensure background video autoplay with JavaScript fallback
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const ensurePlaying = async () => {
      if (video.paused && !video.ended) {
        try {
          video.muted = true
          video.setAttribute('playsinline', 'true')
          video.setAttribute('webkit-playsinline', 'true')
          await video.play()
        } catch (err) {
          console.log('Background video autoplay failed:', err)
        }
      }
    }

    // Try immediately
    ensurePlaying()

    // Try on any user interaction
    const onInteraction = () => {
      ensurePlaying()
    }
    document.addEventListener('click', onInteraction, { once: true })
    document.addEventListener('touchstart', onInteraction, { once: true })
    document.addEventListener('keydown', onInteraction, { once: true })

    return () => {
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('touchstart', onInteraction)
      document.removeEventListener('keydown', onInteraction)
    }
  }, [])

  useEffect(() => {
    const elements = [headlineRef.current, subheadRef.current].filter(Boolean)
    elements.forEach((el, i) => {
      if (el) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        setTimeout(() => {
          el.style.transition = 'opacity 0.8s ease, transform 0.8s ease'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, 200 + i * 150)
      }
    })
  }, [])

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden hero-section"
      style={{ height: '100vh', minHeight: '600px' }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/videos/nexus-overview.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/images/other-backgrounds/hero-poster.jpg"
        onError={() => {
          console.log('Background video failed to load')
        }}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712] z-[1]" />

      {/* Hero Content */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-[2] flex flex-col justify-end px-6 lg:px-12 pb-20 lg:pb-28 max-w-[1200px] mx-auto"
      >
        <div className="max-w-[600px]">
          <div className="overflow-hidden mb-4">
            <h1 ref={headlineRef} className="text-6xl sm:text-7xl lg:text-8xl font-extralight tracking-tighter leading-none text-white animate-fadeInUp">
              {t('hero.headline')}
            </h1>
          </div>
          <div className="overflow-hidden mb-6">
            <p ref={subheadRef} className="text-2xl sm:text-3xl lg:text-4xl font-light text-white/90 leading-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              {t('hero.subhead')}
            </p>
          </div>
          <div className="overflow-hidden mb-8">
            <p className="text-base lg:text-lg text-white/60 leading-relaxed max-w-[480px] animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {t('hero.description')}
            </p>
          </div>
          <div className="overflow-hidden">
            <a
              href="#preorder"
              className="inline-flex items-center justify-center bg-amber-500 text-[#030712] px-8 py-4 rounded-full text-base font-medium hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-fadeInUp"
              style={{ animationDelay: '0.3s' }}
            >
              {t('hero.cta')}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2 animate-float">
        <div className="w-px h-10 bg-white/20 relative overflow-hidden rounded-full">
          <div className="absolute top-0 left-0 w-full h-3 bg-amber-400 animate-scrollPulse" />
        </div>
        <span className="text-[10px] font-mono text-amber-400/60 tracking-widest uppercase">
          {t('hero.scroll')}
        </span>
      </div>

      <style>{`
        @keyframes scrollPulse {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        .animate-scrollPulse {
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .hero-section {
          background: radial-gradient(ellipse at center top, #1e293b 0%, #030712 70%);
        }
      `}</style>
    </section>
  )
}
