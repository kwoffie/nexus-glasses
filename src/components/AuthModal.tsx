import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Chrome, Facebook, Unlock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type AuthMode = 'login' | 'register' | 'magic-link' | 'forgot-password'

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, register, sendMagicLink, socialLogin } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        if (onSuccess) onSuccess()
        onClose()
      } else if (mode === 'register') {
        await register(name, email, password)
        if (onSuccess) onSuccess()
        onClose()
      } else if (mode === 'magic-link') {
        await sendMagicLink(email)
        setSuccess('Magic link sent! Check your email.')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setError('')
    setIsLoading(true)

    // Simulate social login (in production, this would come from OAuth)
    const mockName = name || email.split('@')[0]
    const mockProviderId = 'mock_' + provider + '_' + Date.now()

    try {
      await socialLogin(mockName, email, provider, mockProviderId)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Social login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccess('')
    setShowPassword(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-normal text-[#f8fafc]">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
            {mode === 'magic-link' && 'Magic Link Login'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h3>
          <button onClick={onClose} className="text-[#475569] hover:text-[#f8fafc]">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {(mode === 'register') && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-[#030712]/50 border border-[#1e293b] rounded-full text-[#f8fafc] placeholder-[#475569] focus:outline-none focus:border-amber-500/50 transition-all duration-300"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-[#030712]/50 border border-[#1e293b] rounded-full text-[#f8fafc] placeholder-[#475569] focus:outline-none focus:border-amber-500/50 transition-all duration-300"
            />
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Create Password' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3.5 bg-[#030712]/50 border border-[#1e293b] rounded-full text-[#f8fafc] placeholder-[#475569] focus:outline-none focus:border-amber-500/50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-amber-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#030712] px-6 py-3.5 rounded-full font-semibold hover:scale-[1.02] transition-all duration-300 shadow-glow disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Please wait...' : (
              mode === 'login' ? 'Sign In' :
              mode === 'register' ? 'Create Account' :
              'Send Magic Link'
            )}
          </button>
        </form>

        {/* Social Login */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1e293b]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0f172a] text-[#475569]">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setEmail('user@gmail.com')
                  handleSocialLogin('google')
                }}
                className="flex items-center justify-center gap-2 bg-white/5 border border-[#1e293b] rounded-full py-2.5 text-[#f8fafc] hover:bg-white/10 transition-all duration-300"
                title="Sign in with Google"
              >
                <Chrome size={18} />
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user@facebook.com')
                  handleSocialLogin('facebook')
                }}
                className="flex items-center justify-center gap-2 bg-white/5 border border-[#1e293b] rounded-full py-2.5 text-[#f8fafc] hover:bg-white/10 transition-all duration-300"
                title="Sign in with Facebook"
              >
                <Facebook size={18} />
                Facebook
              </button>
            </div>
          </>
        )}

        {/* Toggle modes */}
        <div className="text-center text-sm space-y-2">
          {(mode === 'login' || mode === 'register') && (
            <>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('magic-link'); resetForm(); }}
                  className="text-amber-400 hover:underline block"
                >
                  Sign in with magic link
                </button>
              )}
              <button
                type="button"
                onClick={() => { 
                  setMode(mode === 'login' ? 'register' : 'login')
                  resetForm(); 
                }}
                className="text-[#94a3b8] hover:text-[#f8fafc] block"
              >
                {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
              </button>
            </>
          )}

          {mode === 'magic-link' && (
            <button
              type="button"
              onClick={() => { setMode('login'); resetForm(); }}
              className="text-[#94a3b8] hover:text-[#f8fafc] block"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}