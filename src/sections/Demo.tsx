import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import NeuralNetwork from '@/components/NeuralNetwork'
import GlassesIllustration from '@/components/GlassesIllustration'
import VideoPlayer from '@/components/VideoPlayer'
import { Cpu, Globe, Brain, Play } from 'lucide-react'

export default function Demo() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [activeDemo, setActiveDemo] = useState<'neural' | 'processing' | 'connected' | 'video'>('neural')

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
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 demo-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            {t('demo.badge')}
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            {t('demo.title')}
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t('demo.description')}
          </p>
        </div>

        {/* Demo Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveDemo('neural')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
              activeDemo === 'neural'
                ? 'bg-white/10 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
            }`}
          >
            <Brain size={16} />
            {t('demo.tabs.neural')}
          </button>
          <button
            onClick={() => setActiveDemo('processing')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
              activeDemo === 'processing'
                ? 'bg-white/10 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
            }`}
          >
            <Cpu size={16} />
            {t('demo.tabs.processing')}
          </button>
          <button
            onClick={() => setActiveDemo('connected')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
              activeDemo === 'connected'
                ? 'bg-white/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
            }`}
          >
            <Globe size={16} />
            {t('demo.tabs.connected')}
          </button>
          <button
            onClick={() => setActiveDemo('video')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
              activeDemo === 'video'
                ? 'bg-white/10 text-violet-400 border border-violet-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
            }`}
          >
            <Play size={16} />
            Video
          </button>
        </div>

        {/* Main Demo Container */}
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 lg:p-10 mb-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left - Interactive Visual */}
            <div className="relative aspect-square w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              {activeDemo === 'neural' && (
                <NeuralNetwork className="w-full h-full" />
              )}
              {activeDemo === 'processing' && (
                <div className="w-full h-full relative flex items-center justify-center p-6">
                  <GlassesIllustration
                    className="w-full h-auto max-w-[280px]"
                    accent="#3b82f6"
                    hudLabel="N1 CHIP"
                    hudValue="8 TOPS"
                  />
                </div>
              )}
              {activeDemo === 'video' && (
                <div className="w-full h-full relative flex items-center justify-center p-4">
                  <VideoPlayer
                    src="/videos/nexus-demo.mp4"
                    accent="#8b5cf6"
                    label="NEXUS Demo Reel"
                    aspectRatio="16/9"
                    loop
                    muted
                    autoplay
                  />
                </div>
              )}
              {activeDemo === 'connected' && (
                <div className="w-full h-full relative flex items-center justify-center p-6">
                  <GlassesIllustration
                    className="w-full h-auto max-w-[280px]"
                    accent="#10b981"
                    hudLabel="LINK"
                    hudValue="5G + SAT"
                  />
                </div>
              )}
            </div>

            {/* Right - Info Panel */}
            <div className="space-y-6">
              {activeDemo === 'neural' && (
                <>
                  <h3 className="text-2xl lg:text-3xl font-medium text-white">
                    Adaptive Neural Engine
                  </h3>
                  <p className="text-base lg:text-lg text-white/60 leading-relaxed">
                    NEXUS uses a sophisticated neural network to learn your patterns and adapt in real-time.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Real-time Learning</p>
                        <p className="text-white/60 text-sm">Continuous processing of biometric and environmental data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Predictive Analysis</p>
                        <p className="text-white/60 text-sm">Anticipates your needs based on historical patterns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium text-sm">Edge Processing</p>
                        <p className="text-white/60 text-sm">All computation happens on-device for maximum privacy</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeDemo === 'processing' && (
                <>
                  <h3 className="text-2xl lg:text-3xl font-medium text-white">
                    Quantum-Ready Processing
                  </h3>
                  <p className="text-base lg:text-lg text-white/60 leading-relaxed">
                    Next-generation RISC-V processor with neural acceleration, running entirely on-frame.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xl font-mono text-blue-400 mb-1">8 TOPS</p>
                      <p className="text-xs text-white/60">Neural Performance</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xl font-mono text-blue-400 mb-1">12ms</p>
                      <p className="text-xs text-white/60">Response Time</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xl font-mono text-blue-400 mb-1">48h</p>
                      <p className="text-xs text-white/60">Battery Life</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xl font-mono text-blue-400 mb-1">2nm</p>
                      <p className="text-xs text-white/60">Process Node</p>
                    </div>
                  </div>
                </>
              )}

              {activeDemo === 'video' && (
                <>
                  <h3 className="text-2xl lg:text-3xl font-medium text-white">
                    Watch NEXUS in Action
                  </h3>
                  <p className="text-base lg:text-lg text-white/60 leading-relaxed">
                    See the full NEXUS experience in motion with real-world footage.
                  </p>
                </>
              )}

              {activeDemo === 'connected' && (
                <>
                  <h3 className="text-2xl lg:text-3xl font-medium text-white">
                    Always Connected
                  </h3>
                  <p className="text-base lg:text-lg text-white/60 leading-relaxed">
                    Stay connected anywhere on Earth with dual connectivity.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-white text-sm font-medium">5G Ultra Wideband</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-white text-sm font-medium">Satellite Link</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">READY</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .demo-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .demo-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}
