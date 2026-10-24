import { useEffect, useRef, useState } from 'react'
import {
  Focus,
  SunMedium,
  Palette,
  Timer,
  Ruler,
  Aperture,
  Moon,
  Contrast,
  ShieldAlert,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = 'correction' | 'comfort' | 'enhancement' | 'monitoring'

interface VisionMode {
  id: string
  category: Category
  icon: React.ElementType
  title: string
  tag: string
  description: string
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'correction', label: 'Correction' },
  { id: 'comfort', label: 'Comfort & Protection' },
  { id: 'enhancement', label: 'Enhancement' },
  { id: 'monitoring', label: 'Monitoring' },
]

const MODES: VisionMode[] = [
  {
    id: 'autofocus',
    category: 'correction',
    icon: Focus,
    title: 'Adaptive Autofocus',
    tag: 'Presbyopia · Near/Farsightedness',
    description:
      'Liquid-lens elements refocus 60 times a second, sharpening what you\u2019re actually looking at \u2014 a menu in your hand, a sign across the street \u2014 without a fixed prescription.',
  },
  {
    id: 'astigmatism',
    category: 'correction',
    icon: Aperture,
    title: 'Astigmatism Correction',
    tag: 'Astigmatism',
    description:
      'A cylindrical correction layer is dialed in during setup, cleaning up the streaking and ghosting astigmatism causes around headlights, streetlights, and fine text.',
  },
  {
    id: 'strain',
    category: 'comfort',
    icon: Timer,
    title: 'Strain Shield',
    tag: 'Digital Eye Strain',
    description:
      'Warms the HUD\u2019s color temperature as sessions run long, and nudges you through the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.',
  },
  {
    id: 'tint',
    category: 'comfort',
    icon: SunMedium,
    title: 'Photochromic Tint',
    tag: 'UV & Glare Protection',
    description:
      'Lenses darken in direct sun and clear indoors in under a second, holding 100% UVA/UVB protection at every setting in between.',
  },
  {
    id: 'photophobia',
    category: 'comfort',
    icon: ShieldAlert,
    title: 'Glare & Light Sensitivity Shield',
    tag: 'Photophobia · Migraine Aura',
    description:
      'Detects sudden brightness spikes \u2014 oncoming headlights, a flash, stepping outside \u2014 and dims instantly for eyes that are sensitive to light or prone to migraine aura.',
  },
  {
    id: 'color',
    category: 'enhancement',
    icon: Palette,
    title: 'Color Vision Assist',
    tag: 'Color Vision Deficiency',
    description:
      'A real-time daltonization filter shifts hard-to-distinguish reds and greens apart, tuned to your specific type of color vision deficiency during setup.',
  },
  {
    id: 'contrast',
    category: 'enhancement',
    icon: Contrast,
    title: 'Contrast Boost',
    tag: 'Cataracts · Low Vision',
    description:
      'Edge-enhancement and dynamic contrast make outlines, curbs, and text pop through the haze that cataracts and other low-vision conditions cause, especially in dim or flat lighting.',
  },
  {
    id: 'night',
    category: 'enhancement',
    icon: Moon,
    title: 'Night Vision Boost',
    tag: 'Night Blindness · Low-Light',
    description:
      'Low-light passthrough amplification brightens dim scenes in real time \u2014 a real assist for night blindness or the slow-adapting eyes that make walking to the car at night stressful.',
  },
  {
    id: 'distance',
    category: 'monitoring',
    icon: Ruler,
    title: 'Distance Guard',
    tag: 'Screen Posture',
    description:
      'A proximity sensor flags when a phone or book creeps closer than 30cm for too long, one of the habits most linked to worsening nearsightedness in daily life.',
  },
  {
    id: 'risk',
    category: 'monitoring',
    icon: Activity,
    title: 'Ocular Risk Tracker',
    tag: 'Glaucoma & AMD Risk Factors',
    description:
      'Logs screen time, UV exposure, and family-history flags you enter yourself, then reminds you when it\u2019s time for the dilated exam that actually screens for glaucoma and macular degeneration.',
  },
]

function LensVisual({ mode, on }: { mode: string; on: boolean }) {
  return (
    <svg viewBox="0 0 400 260" className="w-full h-auto" role="img" aria-label="Lens preview">
      <defs>
        <clipPath id="lensClip">
          <rect x="20" y="20" width="360" height="220" rx="24" />
        </clipPath>
        <linearGradient id="tintGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="360" height="220" rx="24" fill="#0b1220" stroke="#1e293b" />

      <g clipPath="url(#lensClip)">
        {mode === 'autofocus' && (
          <g>
            <text
              x="200"
              y="115"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="30"
              fill="#f8fafc"
              style={{
                filter: on ? 'blur(0px)' : 'blur(4px)',
                transition: 'filter 0.5s ease',
              }}
            >
              5th Ave & Main
            </text>
            <text
              x="200"
              y="150"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="16"
              fill="#94a3b8"
              style={{
                filter: on ? 'blur(0px)' : 'blur(4px)',
                transition: 'filter 0.5s ease',
              }}
            >
              240m · turn left
            </text>
          </g>
        )}

        {mode === 'strain' && (
          <g>
            <rect
              x="20"
              y="20"
              width="360"
              height="220"
              fill={on ? '#f59e0b' : '#3b82f6'}
              opacity={on ? 0.08 : 0.12}
              style={{ transition: 'fill 0.5s ease, opacity 0.5s ease' }}
            />
            <circle
              cx="200"
              cy="130"
              r={on ? 34 : 20}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              opacity={on ? 0.9 : 0}
              style={{ transition: 'all 0.6s ease' }}
            />
            <text x="200" y="136" textAnchor="middle" fontFamily="monospace" fontSize="13" fill="#fcd34d" opacity={on ? 1 : 0} style={{ transition: 'opacity 0.5s ease' }}>
              20s
            </text>
            <text x="200" y="195" textAnchor="middle" fontFamily="monospace" fontSize="12" fill="#94a3b8" opacity={on ? 1 : 0} style={{ transition: 'opacity 0.5s ease' }}>
              Look 20ft away
            </text>
          </g>
        )}

        {mode === 'tint' && (
          <rect
            x="20"
            y="20"
            width="360"
            height="220"
            fill="url(#tintGrad)"
            opacity={on ? 0.55 : 0.05}
            style={{ transition: 'opacity 0.6s ease' }}
          />
        )}

        {mode === 'color' && (
          <g>
            {[...Array(24)].map((_, i) => {
              const angle = (i / 24) * Math.PI * 2
              const r = 70
              const cx = 200 + Math.cos(angle) * r * (0.4 + Math.random() * 0.6)
              const cy = 130 + Math.sin(angle) * r * (0.4 + Math.random() * 0.6)
              const isFigure = i % 5 === 0
              const baseColor = isFigure ? '#7f8c3a' : '#5c6b2e'
              const assistedColor = isFigure ? '#f59e0b' : '#3b3f1f'
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={8 + (i % 3)}
                  fill={on ? assistedColor : baseColor}
                  style={{ transition: 'fill 0.5s ease' }}
                />
              )
            })}
          </g>
        )}

        {mode === 'distance' && (
          <g>
            <rect x="140" y="150" width="70" height="50" rx="4" fill="#1e293b" stroke="#334155" />
            <line
              x1="175"
              y1="150"
              x2="290"
              y2="70"
              stroke={on ? '#f59e0b' : '#334155'}
              strokeWidth="2"
              strokeDasharray="4 4"
              style={{ transition: 'stroke 0.5s ease' }}
            />
            <circle cx="290" cy="70" r="6" fill={on ? '#f59e0b' : '#475569'} style={{ transition: 'fill 0.5s ease' }} />
            <text x="230" y="100" fontFamily="monospace" fontSize="13" fill={on ? '#fcd34d' : '#475569'} style={{ transition: 'fill 0.5s ease' }}>
              {on ? 'Too close — back up' : '32cm'}
            </text>
          </g>
        )}

        {mode === 'astigmatism' && (
          <g>
            {[...Array(3)].map((_, i) => {
              const cx = 130 + i * 90
              const cy = 100 + (i % 2) * 40
              return (
                <g key={i}>
                  {!on &&
                    [...Array(8)].map((_, j) => {
                      const ang = (j / 8) * Math.PI * 2
                      return (
                        <line
                          key={j}
                          x1={cx}
                          y1={cy}
                          x2={cx + Math.cos(ang) * 22}
                          y2={cy + Math.sin(ang) * 22}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                          opacity="0.5"
                        />
                      )
                    })}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={on ? 5 : 10}
                    fill="#f8fafc"
                    style={{ transition: 'r 0.5s ease' }}
                  />
                </g>
              )
            })}
          </g>
        )}

        {mode === 'photophobia' && (
          <g>
            <circle cx="200" cy="90" r={on ? 18 : 55} fill="#fde68a" opacity={on ? 0.5 : 0.95} style={{ transition: 'all 0.5s ease' }} />
            <rect
              x="20"
              y="20"
              width="360"
              height="220"
              fill="#030712"
              opacity={on ? 0.55 : 0}
              style={{ transition: 'opacity 0.4s ease' }}
            />
            <text x="200" y="200" textAnchor="middle" fontFamily="monospace" fontSize="12" fill={on ? '#fcd34d' : '#78350f'} style={{ transition: 'fill 0.5s ease' }}>
              {on ? 'Glare dimmed' : 'Flare detected'}
            </text>
          </g>
        )}

        {mode === 'contrast' && (
          <g>
            <rect x="60" y="60" width="120" height="80" rx="6" fill="none" stroke={on ? '#f8fafc' : '#334155'} strokeWidth={on ? 3 : 1} style={{ transition: 'all 0.5s ease' }} />
            <circle cx="270" cy="150" r="38" fill="none" stroke={on ? '#f8fafc' : '#334155'} strokeWidth={on ? 3 : 1} style={{ transition: 'all 0.5s ease' }} />
            <line x1="60" y1="180" x2="210" y2="180" stroke={on ? '#f8fafc' : '#334155'} strokeWidth={on ? 3 : 1} style={{ transition: 'all 0.5s ease' }} />
            <rect x="20" y="20" width="360" height="220" fill="#94a3b8" opacity={on ? 0.03 : 0.18} style={{ transition: 'opacity 0.5s ease' }} />
          </g>
        )}

        {mode === 'night' && (
          <g>
            <rect x="20" y="20" width="360" height="220" fill="#030712" opacity={on ? 0.15 : 0.85} style={{ transition: 'opacity 0.5s ease' }} />
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={80 + i * 60}
                cy={100 + (i % 3) * 30}
                r={on ? 14 : 8}
                fill={on ? '#bef264' : '#1e293b'}
                opacity={on ? 0.8 : 0.6}
                style={{ transition: 'all 0.5s ease' }}
              />
            ))}
            <text x="200" y="215" textAnchor="middle" fontFamily="monospace" fontSize="12" fill={on ? '#d9f99d' : '#334155'} style={{ transition: 'fill 0.5s ease' }}>
              {on ? 'Low-light boosted' : 'Ambient: dim'}
            </text>
          </g>
        )}

        {mode === 'risk' && (
          <g>
            {(() => {
              const xs = [40, 100, 160, 220, 280, 340]
              const ys = [180, 160, 165, 130, 140, on ? 110 : 90]
              const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
              return (
                <>
                  <polyline
                    points={points}
                    fill="none"
                    stroke={on ? '#f59e0b' : '#334155'}
                    strokeWidth="2.5"
                    style={{ transition: 'stroke 0.5s ease' }}
                  />
                  {xs.map((x, i) => (
                    <circle key={i} cx={x} cy={ys[i]} r="4" fill={on ? '#fbbf24' : '#475569'} style={{ transition: 'fill 0.5s ease' }} />
                  ))}
                </>
              )
            })()}
            <text x="200" y="60" textAnchor="middle" fontFamily="monospace" fontSize="12" fill={on ? '#fcd34d' : '#475569'} style={{ transition: 'fill 0.5s ease' }}>
              {on ? 'Next dilated exam: in 34 days' : 'Tracking paused'}
            </text>
          </g>
        )}
      </g>

      <rect x="20" y="20" width="360" height="220" rx="24" fill="none" stroke="#f59e0b" strokeOpacity={on ? 0.25 : 0} strokeWidth="2" style={{ transition: 'stroke-opacity 0.5s ease' }} />
    </svg>
  )
}

export default function Health() {
  const [activeCategory, setActiveCategory] = useState<Category>(MODES[0].category)
  const [activeId, setActiveId] = useState(MODES[0].id)
  const [on, setOn] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)

  const visibleModes = MODES.filter((m) => m.category === activeCategory)

  const selectCategory = (category: Category) => {
    setActiveCategory(category)
    const firstInCategory = MODES.find((m) => m.category === category)
    if (firstInCategory) setActiveId(firstInCategory.id)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const active = MODES.find((m) => m.id === activeId)!

  return (
    <section
      id="health"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="text-center mb-16 lg:mb-20 health-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Vision Health
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            Your Eyes, Looked After.
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            {MODES.length} vision modes across four categories. One frame.
            Every mode runs on-device and adjusts to you automatically —
            no app, no setup after day one.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 health-fade-in">
          {CATEGORIES.map((cat) => {
            const count = MODES.filter((m) => m.category === cat.id).length
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-[13px] font-mono tracking-wide border transition-all duration-300',
                  isActive
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80'
                )}
              >
                {cat.label}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Mode list */}
          <div className="flex flex-col gap-3 order-2 lg:order-1">
            {visibleModes.map((mode) => {
              const Icon = mode.icon
              const isActive = mode.id === activeId
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveId(mode.id)}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4',
                    isActive
                      ? 'border-amber-500/30 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors duration-300',
                      isActive ? 'bg-amber-500/15' : 'bg-white/10'
                    )}
                  >
                    <Icon size={18} className={isActive ? 'text-amber-400' : 'text-white/60'} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="text-[15px] font-medium text-white">{mode.title}</h3>
                      <span className="font-mono text-[11px] uppercase tracking-wide text-white/60">
                        {mode.tag}
                      </span>
                    </div>
                    {isActive && (
                      <p className="text-sm leading-relaxed text-white/60 mt-1.5">
                        {mode.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Live lens preview */}
          <div className="order-1 lg:order-2 rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <LensVisual mode={active.id} on={on} />

            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={cn('font-mono text-xs tracking-widest', !on ? 'text-white' : 'text-white/60')}>
                OFF
              </span>
              <button
                role="switch"
                aria-checked={on}
                aria-label="Toggle NEXUS vision mode"
                onClick={() => setOn((v) => !v)}
                className={cn(
                  'relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                  on ? 'bg-amber-500' : 'bg-white/10'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-6 h-6 rounded-full bg-[#030712] transition-transform duration-300',
                    on ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
              <span className={cn('font-mono text-xs tracking-widest', on ? 'text-white' : 'text-white/60')}>
                ON
              </span>
            </div>
            <p className="text-center text-xs font-mono text-white/60 mt-4 tracking-wide">
              Simulated preview · {active.title}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-14">
          <a
            href="simulator/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-400 transition-colors duration-300 hover:bg-amber-500/15 hover:border-amber-500/50"
          >
            Try the Live Simulator
            <span aria-hidden="true">→</span>
          </a>
          <p className="text-center text-xs text-white/60 max-w-[420px] leading-relaxed">
            Runs these modes on your own camera, right in the browser — no
            hardware required. Best on a phone or laptop with a webcam.
          </p>
        </div>

        <p className="text-center text-xs text-white/60 max-w-[560px] mx-auto mt-8 leading-relaxed">
          NEXUS Spectacle's vision modes are wellness and comfort features. They
          are not a substitute for an eye exam — see an optometrist for
          diagnosis or a prescription.
        </p>
      </div>

      <style>{`
        .health-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .health-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}