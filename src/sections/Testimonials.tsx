import { useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Testimonial {
  name: string
  role: string
  quote: string
  color: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Priya Nandakumar',
    role: 'Trail runner',
    quote: "I leave my phone in the car now. Turn-by-turn directions in my field of view and my heart rate in the corner - that's the whole run.",
    color: '#f59e0b',
  },
  {
    name: 'Marcus Ude',
    role: 'Field engineer',
    quote: 'Gesture control means I can pull up a schematic with gloves on. Small thing, but it saves me twenty trips back to the van a day.',
    color: '#3b82f6',
  },
  {
    name: 'Sofia Berg',
    role: 'Product designer',
    quote: 'The battery is the real feature. 48 hours means it disappears into my routine instead of becoming another thing to charge.',
    color: '#10b981',
  },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

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
    cardRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="stories"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="text-center mb-16 lg:mb-20 testimonial-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Early Access
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            From the First 500 Wearers
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              className="testimonial-card p-6 lg:p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-base lg:text-[15px] leading-relaxed text-white/80 mb-6 flex-1">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback
                    style={{ backgroundColor: `${t.color}22`, color: t.color }}
                    className="font-mono text-xs font-semibold"
                  >
                    {initials(t.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-white/60">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .testimonial-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .testimonial-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .testimonial-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .testimonial-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .testimonial-card:nth-child(1) { transition-delay: 0.05s; }
        .testimonial-card:nth-child(2) { transition-delay: 0.15s; }
        .testimonial-card:nth-child(3) { transition-delay: 0.25s; }
      `}</style>
    </section>
  )
}
