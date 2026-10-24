import { useRef, useState, useEffect } from 'react'
import { Image } from 'lucide-react'

interface BackgroundImageProps {
  /** Path to the image file in /public/images/ */
  src?: string
  /** When true, shows a placeholder instead of the image */
  placeholder?: boolean
  /** Label for the placeholder */
  label?: string
  /** Overlay opacity (0-1). Darkens the image for text readability */
  overlay?: number
  /** The gradient overlay style */
  overlayGradient?: string
  /** Background color fallback */
  bgColor?: string
  /** Accent color for placeholder */
  accent?: string
  /** Extra classes */
  className?: string
  /** Object fit */
  fit?: 'cover' | 'contain' | 'fill'
  /** Position */
  position?: string
}

export default function BackgroundImage({
  src,
  placeholder = false,
  label = 'Background Image',
  overlay = 0.5,
  overlayGradient,
  bgColor = '#030712',
  accent = '#f59e0b',
  className = '',
  fit = 'cover',
  position = 'center',
}: BackgroundImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection observer for lazy loading
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Placeholder mode
  if (placeholder) {
    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 z-0 ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-dashed border-white/[0.1]"
            style={{ backgroundColor: `${accent}08` }}
          >
            <Image size={22} style={{ color: accent }} className="opacity-50" />
          </div>
          <p className="text-xs font-mono text-[#475569] tracking-wide">{label}</p>
          <p className="text-[10px] font-mono text-[#334155]">
            /public/images/
          </p>
        </div>
      </div>
    )
  }

  // Live image mode
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {isVisible && src && (
        <img
          src={src}
          alt=""
          className={`w-full h-full transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectFit: fit, objectPosition: position }}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      )}

      {/* Gradient overlay */}
      {overlayGradient ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: overlayGradient }}
        />
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: `rgba(3,7,18,${overlay})` }}
        />
      )}
    </div>
  )
}