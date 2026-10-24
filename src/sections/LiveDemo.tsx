import { useEffect, useRef, useState } from 'react'
import ProductSimulation from '@/components/ProductSimulation'
import { ZoomIn, MousePointer2 } from 'lucide-react'

export default function LiveDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
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
      id="live-demo"
      ref={sectionRef}
      className="relative py-10 lg:py-16 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/[0.03] to-transparent live-fade-in"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-[#475569] mb-4 block">
            Interactive 3D
          </span>
          <h2 className="text-3xl lg:text-5xl font-normal tracking-[-0.01em] text-[#f8fafc] mb-4">
            Real Life. <span className="text-amber-400">Real Time.</span>
          </h2>
          <p className="text-[17px] text-[#94a3b8] max-w-[560px] mx-auto leading-relaxed">
            Explore NEXUS from every angle. Drag to rotate, scroll to zoom.
          </p>
        </div>

        {/* 3D Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#080812] shadow-2xl">
          {/* Controls hint overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#030712]/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/[0.06] pointer-events-none">
            <MousePointer2 size={14} className="text-amber-400" />
            <span className="text-xs font-mono text-[#94a3b8]">Drag to orbit</span>
            <span className="text-[#1e293b]">·</span>
            <ZoomIn size={14} className="text-amber-400" />
            <span className="text-xs font-mono text-[#94a3b8]">Scroll to zoom</span>
          </div>

          <ProductSimulation className="w-full" style={{ aspectRatio: '16/9', minHeight: '400px', maxHeight: '70vh' }} />
        </div>

        {/* Feature badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Orbit Controls</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Real-time Rendering</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Live HUD Display</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span>PBR Materials</span>
          </div>
        </div>
      </div>

      <style>{`
        .live-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .live-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}