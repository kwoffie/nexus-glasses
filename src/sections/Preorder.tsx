import { useEffect, useRef, useState } from 'react'
import NeuralNetwork from '@/components/NeuralNetwork'
import { Check, CreditCard, Shield, Truck, Zap, Clock } from 'lucide-react'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'

interface PreorderVariant {
  id: string
  name: string
  price: string
  originalPrice: string
  features: string[]
  quality: string
  popular?: boolean
  specs?: { display: string; processor: string; storage: string; frame: string }
}

const preorderVariants: PreorderVariant[] = [
  {
    id: 'standard',
    name: 'NEXUS Standard',
    price: '---',
    originalPrice: '---',
    quality: 'Premium Build',
    features: [
      'AR Display (40° FOV)',
      'Basic Gesture Control',
      'Health Monitoring',
      '128GB Storage',
      'Aluminum Frame',
      '1 Year Warranty',
    ],
    specs: {
      display: '40° FOV',
      processor: '8-core Neural',
      storage: '128GB',
      frame: 'Aluminum',
    },
  },
  {
    id: 'pro',
    name: 'NEXUS Pro',
    price: '---',
    originalPrice: '---',
    quality: 'Professional Grade',
    features: [
      'AR Display (60° FOV)',
      'Advanced Gesture Control',
      'Full Health Suite',
      '256GB Storage',
      'Titanium Frame',
      'Wireless Charging Case',
      '2-Year Warranty',
    ],
    popular: true,
    specs: {
      display: '60° FOV',
      processor: '16-core Neural',
      storage: '256GB',
      frame: 'Titanium',
    },
  },
  {
    id: 'limited',
    name: 'NEXUS Limited Edition',
    price: '---',
    originalPrice: '---',
    quality: 'Ultra Premium',
    features: [
      'AR Display (60° FOV + HDR)',
      'Advanced Gesture Control',
      'Full Health Suite',
      '1TB Storage',
      'Titanium + Gold PVD Frame',
      'Exclusive Color Options',
      'Priority Support',
      'Lifetime Software Updates',
      '3-Year Warranty',
    ],
    specs: {
      display: '60° FOV + HDR',
      processor: '16-core + AI Boost',
      storage: '1TB NVMe',
      frame: 'Titanium + Gold PVD',
    },
  },
]

// Calculate time remaining until Q3 2026 (September 1, 2026)
const calculateTimeRemaining = () => {
  const targetDate = new Date('September 1, 2026').getTime()
  const now = new Date().getTime()
  const difference = targetDate - now

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

// Simulated database using localStorage
const saveVisitorData = (data: { name: string, email: string, variant: string }) => {
  const visitors = JSON.parse(localStorage.getItem('nexus_visitors') || '[]')
  visitors.push({ ...data, timestamp: new Date().toISOString() })
  localStorage.setItem('nexus_visitors', JSON.stringify(visitors))
}

const findVisitor = (email: string) => {
  const visitors = JSON.parse(localStorage.getItem('nexus_visitors') || '[]')
  return visitors.find((v: any) => v.email === email)
}

export default function Preorder() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const fadeRefs = useRef<(HTMLDivElement | null)[]>([])
  const [selectedVariant, setSelectedVariant] = useState('pro')
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { user, token, logout } = useAuth()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    fadeRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handlePreorder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const variant = preorderVariants.find(v => v.id === selectedVariant)
      if (!variant) return

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/preorders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          variant_id: selectedVariant,
          variant_name: variant.name,
          price: variant.price
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create preorder')
      }

      alert(`Thank you for preordering NEXUS ${variant.name}! We'll notify you when your order ships.`)
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
  }

  const selectedPrice = preorderVariants.find(v => v.id === selectedVariant)?.price

  return (
    <section
      id="preorder"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#030712]"
      style={{ minHeight: '100vh' }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5" />
      </div>

      {/* Neural Network Background */}
      <NeuralNetwork className="absolute inset-0 z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-28 min-h-[100dvh]">
        <h2 ref={(el) => { fadeRefs.current[5] = el }} className="preorder-fade-in-1 text-4xl lg:text-6xl font-extralight text-white tracking-tight mb-5">
          Join the Future.<br />
          Today.
        </h2>

        <p ref={(el) => { fadeRefs.current[6] = el }} className="preorder-fade-in-2 text-base lg:text-lg text-white/60 max-w-[520px] leading-relaxed mb-10">
          Preorder NEXUS now and be among the first to experience phone-free living. Ships Q3 2026.
        </p>

        {/* Countdown Timer */}
        <div ref={(el) => { fadeRefs.current[0] = el }} className="preorder-fade-in flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3 mb-12">
          <Clock size={18} className="text-amber-400" />
          <span className="text-sm font-mono text-white/60">Deployment in:</span>
          <div className="flex items-center gap-3 font-mono text-white">
            <div className="text-center">
              <span className="text-lg font-bold text-amber-400 tabular-nums">--</span>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">Days</span>
            </div>
            <span className="text-white/20">:</span>
            <div className="text-center">
              <span className="text-lg font-bold text-amber-400 tabular-nums">--</span>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">Hours</span>
            </div>
            <span className="text-white/20">:</span>
            <div className="text-center">
              <span className="text-lg font-bold text-amber-400 tabular-nums">--</span>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">Mins</span>
            </div>
            <span className="text-white/20">:</span>
            <div className="text-center">
              <span className="text-lg font-bold text-amber-400 tabular-nums">--</span>
              <span className="text-[10px] text-white/40 block uppercase tracking-wider">Secs</span>
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div ref={(el) => { fadeRefs.current[2] = el }} className="preorder-fade-in-3 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] w-full mb-10">
          {preorderVariants.map((variant) => (
            <div
              key={variant.id}
              onClick={() => setSelectedVariant(variant.id)}
              className={`relative cursor-pointer bg-white/5 backdrop-blur-sm border rounded-3xl p-6 lg:p-8 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${
                selectedVariant === variant.id
                  ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'border-white/10 hover:border-amber-500/30'
              }`}
            >
              {variant.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-[#030712] text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl lg:text-2xl font-medium text-white mb-2">{variant.name}</h3>

              <div className="mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                  Quality: {variant.quality}
                </span>
              </div>

              <div className="mb-4">
                <span className="text-3xl lg:text-4xl font-bold text-amber-400">{variant.price}</span>
                <span className="text-sm text-white/40 line-through ml-2">{variant.originalPrice}</span>
                <span className="text-xs text-emerald-400 block">
                  ---
                </span>
              </div>

              <ul className="text-left space-y-2 mb-6">
                {variant.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="absolute bottom-6 left-6 right-6">
                <div
                  className={`w-full h-1 rounded-full transition-all duration-300 ${
                    selectedVariant === variant.id ? 'bg-amber-500' : 'bg-white/10'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Preorder Form */}
        <div ref={(el) => { fadeRefs.current[3] = el }} className="preorder-fade-in-4 w-full max-w-sm mb-8">
          {user ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8">
              <h3 className="text-xl font-medium text-white mb-4">Welcome, {user.name}!</h3>
              <p className="text-white/60 mb-6">You're logged in and ready to preorder.</p>
              <button
                onClick={handlePreorder}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#030712] px-8 py-4 rounded-full text-[15px] font-semibold hover:scale-[1.03] transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    <CreditCard size={18} />
                    Preorder Now — {selectedPrice}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8">
              <h3 className="text-xl font-medium text-white mb-6">Create Your Account</h3>
              <div className="space-y-3">
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#030712] px-6 py-3.5 rounded-full font-medium hover:scale-[1.02] transition-all duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                  className="w-full bg-white/5 border border-white/10 text-white px-6 py-3.5 rounded-full font-medium hover:bg-white/10 transition-all duration-300"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Guarantees */}
        <div ref={(el) => { fadeRefs.current[4] = el }} className="preorder-fade-in-5 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-emerald-400" />
            <span>1-3 Year Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-amber-400" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-400" />
            <span>30-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </section>
  )
}