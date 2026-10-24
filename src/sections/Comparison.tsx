import { useEffect, useRef } from 'react'
import { Check, Minus, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Cell = 'yes' | 'no' | 'partial' | string

interface Row {
  label: string
  phone: Cell
  oldGlasses: Cell
  nexus: Cell
}

const ROWS: Row[] = [
  { label: 'Hands-free navigation', phone: 'no', oldGlasses: 'partial', nexus: 'yes' },
  { label: 'Continuous heart rate', phone: 'no', oldGlasses: 'no', nexus: 'yes' },
  { label: 'Gesture control', phone: 'no', oldGlasses: 'partial', nexus: 'yes' },
  { label: 'All-day battery', phone: '18h', oldGlasses: '3h', nexus: '48h' },
  { label: 'Weight', phone: '187g', oldGlasses: '92g', nexus: '6.3g' },
  { label: 'Satellite connectivity', phone: 'no', oldGlasses: 'no', nexus: 'yes' },
  { label: 'On-device AI privacy', phone: 'partial', oldGlasses: 'no', nexus: 'yes' },
]

function CellValue({ value }: { value: Cell }) {
  if (value === 'yes') {
    return <Check size={18} className="text-emerald-400 mx-auto" />
  }
  if (value === 'no') {
    return <X size={18} className="text-[#475569] mx-auto" />
  }
  if (value === 'partial') {
    return <Minus size={18} className="text-amber-400 mx-auto" />
  }
  return <span className="font-mono text-sm text-[#e2e8f0]">{value}</span>
}

export default function Comparison() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="compare"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[900px] mx-auto">
        <div className="text-center mb-16 compare-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Why Switch
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            NEXUS vs. Everything Else
          </h2>
          <p className="text-base lg:text-lg text-white/60 max-w-[560px] mx-auto leading-relaxed">
            Your phone does a lot. Old AR headsets do a little, badly. NEXUS was built to replace both.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="text-white/60 py-4 pl-6 font-mono text-[11px] uppercase">Capability</TableHead>
                <TableHead className="text-center text-white/60 font-mono text-[11px] uppercase">Smartphone</TableHead>
                <TableHead className="text-center text-white/60 font-mono text-[11px] uppercase">Legacy AR</TableHead>
                <TableHead className="text-center text-amber-400 font-semibold font-mono text-[11px] uppercase">NEXUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.label} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="pl-6 text-white font-medium">{row.label}</TableCell>
                  <TableCell className="text-center"><CellValue value={row.phone} /></TableCell>
                  <TableCell className="text-center"><CellValue value={row.oldGlasses} /></TableCell>
                  <TableCell className="text-center bg-amber-500/5"><CellValue value={row.nexus} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <style>{`
        .compare-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .compare-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}
