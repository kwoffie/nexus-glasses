import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Heart, MapPin, Hand, ArrowRight } from 'lucide-react'
import VideoPlayer from '@/components/VideoPlayer'

const FEATURE_ICONS: Record<string, React.ElementType> = {
  'Heart Rate Monitor': Heart,
  'AR Navigation': MapPin,
  'Gesture Control': Hand,
}

const FEATURE_COLORS: Record<string, string> = {
  'Heart Rate Monitor': '#10b981',
  'AR Navigation': '#3b82f6',
  'Gesture Control': '#f59e0b',
}

export default function Features() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const featuresData = t('features.items', { returnObjects: true }) as Array<{ title: string; description: string }>

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    // Fallback: ensure content is visible after 2 seconds
    const fallbackTimer = setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.classList.add('animate-in')
      }
      itemRefs.current.forEach((el) => {
        if (el) el.classList.add('animate-in')
      })
    }, 2000)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left - Product Video */}
          <div className="w-full lg:w-[55%]">
            <div className="relative group rounded-3xl border border-white/10 bg-white/5 overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <VideoPlayer
                  src="/videos/nexus-overview.mp4"
                  accent="#f59e0b"
                  label={t('hero.headline')}
                  aspectRatio="16/9"
                  loop
                  muted
                  autoplay
                  controls
                />
              </div>
            </div>
          </div>

          {/* Right - Text Content */}
          <div className="w-full lg:w-[45%]">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
              {t('features.badge')}
            </span>
            <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight leading-tight text-white mb-8">
              {t('features.title')}
            </h2>

            <div className="flex flex-col gap-6">
              {featuresData.map((feature, i) => {
                const Icon = FEATURE_ICONS[feature.title] || Heart
                const color = FEATURE_COLORS[feature.title] || '#f59e0b'
                return (
                  <div
                    key={feature.title}
                    ref={(el) => { itemRefs.current[i] = el }}
                    className="feature-item flex gap-4 group"
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={20} style={{ color }} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-medium text-white mb-1.5 group-hover:text-amber-400 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm lg:text-[15px] leading-relaxed text-white/60">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <a
              href="#specs"
              className="inline-flex items-center gap-2 mt-10 text-amber-400 text-sm font-medium hover:underline underline-offset-4 transition-all duration-300 group"
            >
              {t('features.description')}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feature-item {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .feature-item.animate-in {
          opacity: 1;
          transform: translateX(0);
        }
        .feature-item:nth-child(1) { transition-delay: 0.1s; }
        .feature-item:nth-child(2) { transition-delay: 0.25s; }
        .feature-item:nth-child(3) { transition-delay: 0.4s; }
      `}</style>
    </section>
  )
}