import { useEffect, useRef } from 'react'
import VideoPlayer from '@/components/VideoPlayer'

const VIDEOS = [
  {
    id: 'overview',
    label: 'NEXUS Overview',
    description: 'See how NEXUS transforms your daily life — from navigation to health tracking, all in one frame.',
    accent: '#f59e0b',
    file: '/videos/nexus-overview.mp4',
  },
  {
    id: 'navigation',
    label: 'AR Navigation Demo',
    description: 'Turn-by-turn directions projected directly onto your vision. Never look down at your phone again.',
    accent: '#3b82f6',
    file: '/videos/nexus-navigation.mp4',
  },
  {
    id: 'biometric',
    label: 'Biometric Tracking',
    description: 'Medical-grade heart rate, SpO2, and temperature monitoring — continuous, passive, private.',
    accent: '#8b5cf6',
    file: '/videos/nexus-biometric.mp4',
  },
  {
    id: 'gesture',
    label: 'Gesture Control',
    description: 'Swipe, tap, and pinch in mid-air. Watch how natural the NEXUS gesture interface feels.',
    accent: '#10b981',
    file: '/videos/nexus-gesture.mp4',
  },
]

export default function Showcase() {
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
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 showcase-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Video Showcase
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            See It in Motion
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-[560px] mx-auto leading-relaxed">
            Watch real footage of NEXUS in action. Each video loops automatically.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {VIDEOS.map((video, i) => (
            <div
              key={video.id}
              ref={(el) => { cardRefs.current[i] = el }}
              className="showcase-card"
            >
              <VideoPlayer
                src={video.file}
                accent={video.accent}
                label={video.label}
                aspectRatio="16/9"
                loop
                muted
                autoplay
              />
              <p className="mt-4 text-sm text-white/60 leading-relaxed px-1">
                {video.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .showcase-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .showcase-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .showcase-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .showcase-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .showcase-card:nth-child(1) { transition-delay: 0.05s; }
        .showcase-card:nth-child(2) { transition-delay: 0.15s; }
        .showcase-card:nth-child(3) { transition-delay: 0.25s; }
        .showcase-card:nth-child(4) { transition-delay: 0.35s; }
      `}</style>
    </section>
  )
}
