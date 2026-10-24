import { useEffect, useRef } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'Do I still need my phone?',
    a: 'No. NEXUS has its own eSIM, so calls, messages, navigation, and payments all work standalone. You can pair it with a phone if you want, but it isn\'t required.',
  },
  {
    q: 'How does the AR display work in daylight?',
    a: 'The micro-OLED panels hit 5,000 nits peak brightness, well above direct sunlight glare, and automatically dim indoors so the overlay never washes out or blinds you.',
  },
  {
    q: 'What happens to my health data?',
    a: 'Biometric processing happens entirely on-device using the N1 neural chip. Nothing leaves your frame unless you explicitly choose to sync it to the companion app.',
  },
  {
    q: 'Can I wear NEXUS with prescription lenses?',
    a: 'Yes. Every frame ships with a magnetic prescription-insert slot, and we support single-vision inserts up to +/-6.00 diopters at checkout.',
  },
  {
    q: 'When does it ship?',
    a: 'Preorders placed today are estimated to ship in Q3 2026. You\'ll get firmware updates over the air before your unit even arrives.',
  },
]

export default function FAQ() {
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
      id="faq"
      ref={sectionRef}
      className="relative py-20 lg:py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
    >
      <div className="relative z-10 max-w-[760px] mx-auto">
        <div className="text-center mb-16 faq-fade-in">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-amber-400/80 mb-4 block">
            Questions
          </span>
          <h2 className="text-3xl lg:text-5xl font-extralight tracking-tight text-white mb-4">
            Before You Preorder
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-white/10"
            >
              <AccordionTrigger className="text-left text-base text-white hover:text-amber-400 hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-white/60">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <style>{`
        .faq-fade-in {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .faq-fade-in.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}
