import { useEffect, useRef, useState } from 'react'
import NexusGlasses from '@/components/NexusGlasses'
import { type ColorwayKey } from '@/components/NexusGlasses'
import { cn } from '@/lib/utils'

interface Finish {
  id: string
  name: string
  hex: string
  blurb: string
  colorway: ColorwayKey
}

const FINISHES: Finish[] = [
  { id: 'onyx', name: 'Onyx', hex: '#f59e0b', blurb: 'Matte black titanium, amber HUD', colorway: 'gold' },
  { id: 'glacier', name: 'Glacier', hex: '#3b82f6', blurb: 'Brushed silver, cobalt HUD', colorway: 'arctic' },
  { id: 'moss', name: 'Moss', hex: '#10b981', blurb: 'Sage titanium, emerald HUD', colorway: 'aurora' },
  { id: 'dusk', name: 'Dusk', hex: '#8b5cf6', blurb: 'Deep plum, violet HUD', colorway: 'violet' },
]

export default function ColorStudio() {
  const [active, setActive] = useState(FINISHES[0])
  const sectionRef = useRef<HTMLDivElement>(null)

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

  return (
    <section
      id="studio"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1100px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Live illustration */}
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 lg:p-10">
          <NexusGlasses
            className="w-full h-auto transition-all duration-500 max-w-[400px] mx-auto"
            colorway={active.colorway}
            hud={true}
            autoRotate={true}
          />
          <p className="text-center text-xs font-mono text-white/60 mt-4 tracking-wide">
            Live preview · rendered on-device · drag to orbit
          </p>
        </div>

        {/* Copy + swatches */}
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Make It Yours
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-6">
            Four Finishes.<br />
            One You.
          </h2>
          <p className="text-base lg:text-lg text-white/60 leading-relaxed mb-8">
            Every NEXUS frame ships with a swappable titanium shell and a
            matching HUD accent color. Pick a finish below to preview it.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {FINISHES.map((finish) => (
              <button
                key={finish.id}
                onClick={() => setActive(finish)}
                className={cn(
                  'text-left p-4 rounded-xl border transition-all duration-300 group',
                  active.id === finish.id
                    ? 'border-amber-500/40 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-4 h-4 rounded-full transition-all"
                    style={{ backgroundColor: finish.hex }}
                  />
                  <span className="text-sm font-medium text-white">{finish.name}</span>
                </div>
                <p className="text-xs text-white/60 leading-snug">{finish.blurb}</p>
              </button>
            ))}
          </div>

          <a
            href="#preorder"
            className="inline-block bg-amber-500 text-[#030712] px-8 py-4 rounded-full text-base font-medium hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          >
            Preorder in {active.name}
          </a>
        </div>
      </div>

      <style>{`
        .studio-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .studio-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}
