import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

const STATS = [
  { value: '48h', label: 'Battery Life' },
  { value: '6.3g', label: 'Ultra-Light Frame' },
  { value: '<3ms', label: 'Response Time' },
]

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const statRefs = useRef<(HTMLDivElement | null)[]>([])

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
      { threshold: 0.2 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    statRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Label */}
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-6 block text-center exp-fade-in">
          See the World Differently
        </span>

        {/* First-person AR viewport mockup — built from CSS/SVG so it needs no external photo or video file */}
        <div
          className="relative rounded-3xl overflow-hidden mb-16 lg:mb-20 exp-fade-in bg-white/5 border border-white/10"
          style={{ aspectRatio: '16/9' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-blue-500/5" />
          {/* faux street perspective */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="none">
            <path d="M0 450 L340 260 L460 260 L800 450 Z" fill="#111827" opacity="0.7" />
            <path d="M400 260 L400 0" stroke="#1e293b" strokeWidth="1" />
            {[...Array(6)].map((_, i) => (
              <path
                key={i}
                d={`M${340 - i * 8} 260 L${20 - i * 30} 450`}
                stroke="#1e293b"
                strokeWidth="1"
                opacity="0.6"
              />
            ))}
          </svg>
          {/* AR HUD overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-10 font-mono">
            <div className="flex justify-between items-start text-xs tracking-widest text-white/60">
              <span>REC ● LIVE</span>
              <span>08:42 · 21°C</span>
            </div>
            <div className="flex items-end justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center">
                <MapPin size={16} className="text-amber-400" />
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-semibold text-white">240m</p>
                <p className="text-xs text-amber-400/80 tracking-wide">Turn left on 5th Ave</p>
              </div>
            </div>
            <div className="flex justify-between items-end text-xs tracking-widest text-white/60">
              <span>HR 142 BPM</span>
              <span>5G · SAT LOCK</span>
            </div>
          </div>
          <div className="absolute inset-4 lg:inset-6 border border-amber-400/20 rounded-2xl pointer-events-none" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              ref={(el) => { statRefs.current[i] = el }}
              className="stat-item text-center"
            >
              <div className="font-mono text-5xl lg:text-6xl font-extralight tracking-tight text-amber-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/60 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .exp-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .exp-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .stat-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .stat-item.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .stat-item:nth-child(1) { transition-delay: 0.15s; }
        .stat-item:nth-child(2) { transition-delay: 0.3s; }
        .stat-item:nth-child(3) { transition-delay: 0.45s; }
      `}</style>
    </section>
  )
}
