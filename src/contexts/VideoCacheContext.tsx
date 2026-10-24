import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

interface VideoCacheContextType {
  preloadVideo: (src: string) => void
  isPreloaded: (src: string) => boolean
  getVideoStatus: (src: string) => 'idle' | 'loading' | 'loaded' | 'error'
  markVideoLoaded: (src: string) => void
  markVideoError: (src: string) => void
}

const VideoCacheContext = createContext<VideoCacheContextType | undefined>(undefined)

const CACHE_KEY = 'nexus_video_cache'

export const VideoCacheProvider = ({ children }: { children: React.ReactNode }) => {
  const [videoStatus, setVideoStatus] = useState<Record<string, 'idle' | 'loading' | 'loaded' | 'error'>>({})
  const preloadedVideos = useRef<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Load cached status from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        setVideoStatus(parsed)
        Object.keys(parsed).forEach((src) => {
          if (parsed[src] === 'loaded') {
            preloadedVideos.current.add(src)
          }
        })
      }
    } catch (e) {
      console.error('Failed to load video cache:', e)
    }
  }, [])

  // Save cache status to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(videoStatus))
    } catch (e) {
      console.error('Failed to save video cache:', e)
    }
  }, [videoStatus])

  const preloadVideo = useCallback((src: string) => {
    if (!src || preloadedVideos.current.has(src)) return

    setVideoStatus((prev) => ({ ...prev, [src]: 'loading' }))

    // Create a hidden video element to preload
    const video = document.createElement('video')
    video.preload = 'auto'
    video.src = src
    video.muted = true

    video.onloadeddata = () => {
      preloadedVideos.current.add(src)
      setVideoStatus((prev) => ({ ...prev, [src]: 'loaded' }))
    }

    video.onerror = () => {
      setVideoStatus((prev) => ({ ...prev, [src]: 'error' }))
    }

    // Start loading
    video.load()
  }, [])

  const isPreloaded = useCallback((src: string) => {
    return preloadedVideos.current.has(src)
  }, [])

  const getVideoStatus = useCallback((src: string) => {
    return videoStatus[src] || 'idle'
  }, [videoStatus])

  const markVideoLoaded = useCallback((src: string) => {
    preloadedVideos.current.add(src)
    setVideoStatus((prev) => ({ ...prev, [src]: 'loaded' }))
  }, [])

  const markVideoError = useCallback((src: string) => {
    setVideoStatus((prev) => ({ ...prev, [src]: 'error' }))
  }, [])

  // Set up IntersectionObserver for auto-preloading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const src = entry.target.getAttribute('data-video-src')
            if (src) {
              preloadVideo(src)
            }
          }
        })
      },
      { rootMargin: '200px 0px' } // Start preloading 200px before video enters viewport
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [preloadVideo])

  const value: VideoCacheContextType = {
    preloadVideo,
    isPreloaded,
    getVideoStatus,
    markVideoLoaded,
    markVideoError,
  }

  return (
    <VideoCacheContext.Provider value={value}>
      {children}
    </VideoCacheContext.Provider>
  )
}

export const useVideoCache = () => {
  const context = useContext(VideoCacheContext)
  if (!context) {
    throw new Error('useVideoCache must be used within a VideoCacheProvider')
  }
  return context
}

// Custom hook for observing video elements for preloading
export const useVideoObserver = (src: string) => {
  const { preloadVideo } = useVideoCache()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadVideo(src)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [src, preloadVideo])

  return ref
}
