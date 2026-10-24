import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Shield, Battery, Wifi } from 'lucide-react'

interface Benefit {
  icon: React.ElementType
  title: string
  description: string
}

const BENEFIT_ICONS: Record<string, React.ElementType> = {
  'Privacy First': Shield,
  '48-Hour Battery': Battery,
  'Satellite Ready': Wifi,
  'Medical Grade': Check,
}

export default function Benefits() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const benefitsData = t('benefits.items', { returnObjects: true }) as Array<{ title: string; description: string }>

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="benefits"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="text-center mb-12 lg:mb-16 benefits-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            {t('benefits.badge')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-[560px] mx-auto leading-relaxed">
            {t('benefits.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefitsData.map((benefit, i) => {
            const Icon = BENEFIT_ICONS[benefit.title] || Shield
            return (
              <div
                key={benefit.title}
                ref={(el) => { cardRefs.current[i] = el }}
                className="benefit-card p-6 lg:p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} className="text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm lg:text-[15px] leading-relaxed text-white/60">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .benefits-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .benefits-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .benefit-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .benefit-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .benefit-card:nth-child(1) { transition-delay: 0.05s; }
        .benefit-card:nth-child(2) { transition-delay: 0.15s; }
        .benefit-card:nth-child(3) { transition-delay: 0.25s; }
        .benefit-card:nth-child(4) { transition-delay: 0.35s; }
      `}</style>
    </section>
  )
}
