import { useEffect, useRef } from 'react'
import { Clock, Rocket, Sparkles } from 'lucide-react'

interface TimeUnit {
  label: string
  value: string
}

export default function LaunchCountdown() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const units: TimeUnit[] = [
    { label: 'Days', value: '--' },
    { label: 'Hours', value: '--' },
    { label: 'Minutes', value: '--' },
    { label: 'Seconds', value: '--' },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="launch"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 countdown-fade-in bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Launch Countdown
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            Coming <span className="text-amber-400">--</span>
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-[500px] mx-auto leading-relaxed">
            Preorders are open. The future arrives in
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 lg:gap-4 mb-12">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3 lg:gap-4">
              <div className="text-center">
                <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-amber-500/30">
                  <span className="text-xl lg:text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {unit.value}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-white/40 tracking-wider mt-2 uppercase">
                  {unit.label}
                </p>
              </div>
              {i < units.length - 1 && (
                <span className="text-xl lg:text-2xl font-mono text-white/20">:</span>
              )}
            </div>
          ))}
        </div>

        {/* CTA / Status */}
        <div className="text-center">
          <a
            href="#preorder"
            className="inline-flex items-center gap-2 bg-amber-500 text-[#030712] px-8 py-4 rounded-full text-base font-medium hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] group"
          >
            <Rocket size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            Secure Your Preorder
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform duration-300" />
          </a>
        </div>

        {/* Subtle status bar */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Preorders Live
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <Clock size={14} />
            Ships Q3 2026
          </span>
        </div>
      </div>

      <style>{`
        .countdown-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .countdown-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}