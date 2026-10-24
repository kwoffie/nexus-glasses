import { useEffect, useRef } from 'react'
import VideoPlayer from '@/components/VideoPlayer'
import { Play } from 'lucide-react'

interface DemoVideo {
  id: string
  title: string
  description: string
  src: string
  accent: string
}

const demoVideos: DemoVideo[] = [
  {
    id: 'demo-reel',
    title: 'NEXUS Demo Reel',
    description: 'Complete product showcase highlighting the revolutionary design, AI capabilities, and seamless user experience.',
    src: '/videos/nexus-demo.mp4',
    accent: '#f59e0b',
  },
  {
    id: 'overview',
    title: 'NEXUS Overview',
    description: 'Comprehensive walkthrough of all core features and capabilities in a seamless experience.',
    src: '/videos/nexus-overview.mp4',
    accent: '#8b5cf6',
  },
  {
    id: 'navigation',
    title: 'AR Navigation',
    description: 'Advanced augmented reality navigation with real-time spatial mapping and turn-by-turn directions.',
    src: '/videos/nexus-navigation.mp4',
    accent: '#3b82f6',
  },
  {
    id: 'biometric',
    title: 'Biometric Tracking',
    description: 'Continuous health monitoring with advanced biometric sensors and real-time analytics.',
    src: '/videos/nexus-biometric.mp4',
    accent: '#10b981',
  },
  {
    id: 'gesture',
    title: 'Gesture Control',
    description: 'Intuitive hand gesture interface for seamless device control without physical touch.',
    src: '/videos/nexus-gesture.mp4',
    accent: '#ec4899',
  },
]

export default function DemoReels() {
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

    // Fallback: ensure content is visible after 2 seconds
    const fallbackTimer = setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.classList.add('animate-in')
      }
      cardRefs.current.forEach((el) => {
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
      id="demo-reels"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-[#030712]"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 demo-reels-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Video Showcase
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            Demo Reels
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Explore NEXUS capabilities through our comprehensive video demonstrations.
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {demoVideos.map((video, i) => (
            <div
              key={video.id}
              ref={(el) => { cardRefs.current[i] = el }}
              className="demo-reels-card group bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 hover:border-amber-500/30 transition-all duration-300"
            >
              {/* Video Title */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${video.accent}15` }}
                >
                  <Play size={18} style={{ color: video.accent }} />
                </div>
                <h3 className="text-xl lg:text-2xl font-medium text-white">
                  {video.title}
                </h3>
              </div>

              {/* Video Player */}
              <div className="mb-4 rounded-xl overflow-hidden">
                <VideoPlayer
                  src={video.src}
                  accent={video.accent}
                  label={video.title}
                  aspectRatio="16/9"
                  loop
                  muted
                  autoplay
                  controls
                />
              </div>

              {/* Video Description */}
              <p className="text-sm lg:text-[15px] leading-relaxed text-white/60">
                {video.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .demo-reels-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .demo-reels-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .demo-reels-card {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .demo-reels-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .demo-reels-card:nth-child(1) { transition-delay: 0.05s; }
        .demo-reels-card:nth-child(2) { transition-delay: 0.15s; }
        .demo-reels-card:nth-child(3) { transition-delay: 0.25s; }
        .demo-reels-card:nth-child(4) { transition-delay: 0.35s; }
        .demo-reels-card:nth-child(5) { transition-delay: 0.45s; }
      `}</style>
    </section>
  )
}