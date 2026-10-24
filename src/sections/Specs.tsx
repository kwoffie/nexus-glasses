import { useEffect, useRef } from 'react'
import { Monitor, Cpu, HeartPulse, AudioLines, Component, Battery, Camera, Wifi, Shield, Zap, Package, Thermometer, Gauge } from 'lucide-react'
import GlassesIllustration from '@/components/GlassesIllustration'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const SPEC_CARDS = [
  {
    icon: Monitor,
    title: 'Micro-OLED Display',
    description:
      'Dual 4K micro-OLED panels with 120Hz refresh rate. 5000 nits peak brightness for crystal-clear AR in any lighting.',
    accent: '#3b82f6',
  },
  {
    icon: Cpu,
    title: 'Neural Processor',
    description:
      'Custom N1 chip with 16-core neural engine. Dedicated AI acceleration for real-time object recognition and gesture tracking.',
    accent: '#f59e0b',
  },
  {
    icon: HeartPulse,
    title: 'Biometric Sensors',
    description:
      'PPG heart rate sensor, SpO2 monitor, and skin temperature sensor. Medical-grade accuracy, continuous monitoring.',
    accent: '#10b981',
  },
  {
    icon: AudioLines,
    title: 'Spatial Audio',
    description:
      'Bone conduction transducers with directional audio beams. Private sound without earbuds.',
    accent: '#8b5cf6',
  },
  {
    icon: Component,
    title: 'Titanium Frame',
    description:
      'Grade 5 titanium weighing just 6.3 grams. Flexible temple arms with memory alloy for universal fit.',
    accent: '#f59e0b',
  },
  {
    icon: Battery,
    title: 'All-Day Battery',
    description:
      '48-hour mixed use, 72-hour standby. Wireless charging case provides 5 full charges on the go.',
    accent: '#10b981',
  },
]

const DETAILED_SPECS = [
  // Display Details
  { category: 'Display', spec: 'Panel Type', value: 'Dual 4K Micro-OLED' },
  { category: 'Display', spec: 'Field of View', value: '40° (Standard), 60° (Pro/Limited)' },
  { category: 'Display', spec: 'Refresh Rate', value: '120Hz' },
  { category: 'Display', spec: 'Brightness', value: '5000 nits peak' },
  { category: 'Display', spec: 'Resolution', value: '3840 x 2160 per eye' },
  // Performance
  { category: 'Processor', spec: 'Chip', value: 'N1 Neural Engine' },
  { category: 'Processor', spec: 'Cores', value: '16-core neural engine' },
  { category: 'Processor', spec: 'AI Performance', value: '12 TOPS' },
  { category: 'Processor', spec: 'GPU', value: 'Adreno 750 class' },
  // Memory & Storage
  { category: 'Memory', spec: 'RAM', value: '8GB LPDDR5 (Standard), 16GB (Pro), 64GB (Limited)' },
  { category: 'Memory', spec: 'Storage', value: '128GB / 256GB / 1TB NVMe' },
  // Connectivity
  { category: 'Connectivity', spec: 'WiFi', value: 'Wi-Fi 7 (802.11be)' },
  { category: 'Connectivity', spec: 'Bluetooth', value: '5.3 LE Audio' },
  { category: 'Connectivity', spec: 'Cellular', value: '5G/4G LTE optional eSIM' },
  { category: 'Connectivity', spec: 'Range', value: '10m Wi-Fi, 50m Bluetooth' },
  // Sensors
  { category: 'Sensors', spec: 'Health', value: 'PPG, SpO2, Temp, HRV' },
  { category: 'Sensors', spec: 'Motion', value: '6-axis gyro, accelerometer' },
  { category: 'Sensors', spec: 'Ambient', value: 'Light, proximity, pressure' },
  { category: 'Sensors', spec: 'Camera', value: '12MP main, 8MP depth' },
  // Audio
  { category: 'Audio', spec: 'Speakers', value: 'Bone conduction transducers' },
  { category: 'Audio', spec: 'Directional', value: 'Yes, 360° spatial audio' },
  // Frame & Build
  { category: 'Frame', spec: 'Material', value: 'Grade 5 Titanium' },
  { category: 'Frame', spec: 'Weight', value: '28g (frames only)' },
  { category: 'Frame', spec: 'Finish', value: 'Brushed/PVD coating' },
  { category: 'Frame', spec: 'IP Rating', value: 'IP68 dust/water resistant' },
  // Battery
  { category: 'Battery', spec: 'Capacity', value: '350mAh per frame' },
  { category: 'Battery', spec: 'Life - Mixed Use', value: '48 hours' },
  { category: 'Battery', spec: 'Life - Standby', value: '72 hours' },
  { category: 'Battery', spec: 'Charging Case', value: '1800mAh, 5 full charges' },
  { category: 'Battery', spec: 'Wireless Charging', value: 'Qi 15W, MagSafe compatible' },
  // Power
  { category: 'Power', spec: 'Charging Port', value: 'USB-C PD 3.0' },
  { category: 'Power', spec: 'Fast Charge', value: '50% in 30 minutes' },
  { category: 'Power', spec: 'Solar Charging', value: 'Optional solar lenses' },
  // Security
  { category: 'Security', spec: 'Encryption', value: '256-bit AES' },
  { category: 'Security', spec: 'Auth', value: 'Biometric + PIN' },
  { category: 'Security', spec: 'Secure Element', value: 'Yes, hardware isolated' },
  // Software
  { category: 'OS', spec: 'System', value: 'NEXUS OS 1.0' },
  { category: 'OS', spec: 'Base', value: 'Android 14' },
  { category: 'OS', spec: 'Updates', value: '3 years guaranteed' },
]

export default function Specs() {
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
      id="specs"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 spec-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Technical Specs
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            Engineered for Tomorrow
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-[600px] mx-auto leading-relaxed">
            Every component designed from the ground up to disappear on your face
            while delivering supercomputer performance.
          </p>
        </div>

        {/* Labeled exploded-view diagram */}
        <div className="mb-16 lg:mb-20 spec-fade-in">
          <div
            className="relative rounded-3xl overflow-hidden group border border-white/10 bg-white/5 p-8 lg:p-14"
            style={{ aspectRatio: '16/9' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative w-full h-full flex items-center justify-center">
              <GlassesIllustration className="w-full max-w-[520px] h-auto" accent="#f59e0b" showHud={false} />

              {/* Callout labels positioned around the frame */}
              <div className="hidden md:block absolute left-[6%] top-[20%] text-right">
                <p className="text-xs font-mono text-amber-400 tracking-wide">TITANIUM HINGE</p>
                <p className="text-[11px] text-white/40">Memory-alloy flex</p>
              </div>
              <div className="hidden md:block absolute right-[6%] top-[20%] text-left">
                <p className="text-xs font-mono text-blue-400 tracking-wide">N1 NEURAL CHIP</p>
                <p className="text-[11px] text-white/40">16-core, on-frame</p>
              </div>
              <div className="hidden md:block absolute left-[12%] bottom-[16%] text-right">
                <p className="text-xs font-mono text-emerald-400 tracking-wide">PPG SENSOR</p>
                <p className="text-[11px] text-white/40">Continuous heart rate</p>
              </div>
              <div className="hidden md:block absolute right-[12%] bottom-[16%] text-left">
                <p className="text-xs font-mono text-violet-400 tracking-wide">BONE CONDUCTION</p>
                <p className="text-[11px] text-white/40">Private spatial audio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specifications Table */}
        <div className="spec-fade-in mb-16 lg:mb-20">
          <h3 className="text-xl lg:text-2xl font-medium text-white mb-6 text-center">Full Technical Specifications</h3>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-4 lg:p-6 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/60 font-mono text-xs uppercase">Category</TableHead>
                  <TableHead className="text-white/60 font-mono text-xs uppercase">Specification</TableHead>
                  <TableHead className="text-white/60 font-mono text-xs uppercase">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DETAILED_SPECS.map((spec, i) => (
                  <TableRow key={i} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="text-white/60 text-sm font-mono">{spec.category}</TableCell>
                    <TableCell className="text-white font-medium">{spec.spec}</TableCell>
                    <TableCell className="text-amber-400">{spec.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPEC_CARDS.map((spec, i) => (
            <div
              key={spec.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className="spec-card group p-7 lg:p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-400/30 transition-all duration-500"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: `${spec.accent}15` }}
              >
                <spec.icon size={20} style={{ color: spec.accent }} className="transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                {spec.title}
              </h3>
              <p className="text-sm lg:text-[15px] leading-relaxed text-white/60">
                {spec.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .spec-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .spec-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .spec-card {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease, border-color 0.5s ease, box-shadow 0.5s ease;
        }
        .spec-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        .spec-card:nth-child(1) { transition-delay: 0.05s; }
        .spec-card:nth-child(2) { transition-delay: 0.12s; }
        .spec-card:nth-child(3) { transition-delay: 0.19s; }
        .spec-card:nth-child(4) { transition-delay: 0.26s; }
        .spec-card:nth-child(5) { transition-delay: 0.33s; }
        .spec-card:nth-child(6) { transition-delay: 0.40s; }
      `}</style>
    </section>
  )
}
