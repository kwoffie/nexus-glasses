import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Film, SkipForward } from 'lucide-react'
import { useVideoCache } from '@/contexts/VideoCacheContext'

interface VideoPlayerProps {
  src?: string
  poster?: string
  className?: string
  aspectRatio?: string
  label?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  placeholder?: boolean
  accent?: string
}

export default function VideoPlayer({
  src,
  poster,
  className = '',
  aspectRatio = '16/9',
  label = 'Product Video',
  autoplay = false,
  loop = true,
  muted = true,
  controls = true,
  placeholder = false,
  accent = '#f59e0b',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [progress, setProgress] = useState(0)
  const [showOverlay, setShowOverlay] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const { preloadVideo } = useVideoCache()

  useEffect(() => {
    if (src) {
      preloadVideo(src)
    }
  }, [src, preloadVideo])

  useEffect(() => {
    if (autoplay && src && videoRef.current) {
      const video = videoRef.current
      video.muted = muted
      
      const playVideo = async () => {
        try {
          await video.play()
          setIsPlaying(true)
          setShowOverlay(false)
        } catch (err) {
          console.log('Autoplay failed:', err)
          setIsPlaying(false)
          setShowOverlay(true)
        }
      }
      
      playVideo()

      // Retry on user interaction
      const onInteraction = () => playVideo()
      document.addEventListener('click', onInteraction, { once: true })
      document.addEventListener('touchstart', onInteraction, { once: true })
      document.addEventListener('keydown', onInteraction, { once: true })

      return () => {
        document.removeEventListener('click', onInteraction)
        document.removeEventListener('touchstart', onInteraction)
        document.removeEventListener('keydown', onInteraction)
      }
    }
  }, [autoplay, muted, loop, src])

  const handlePlay = async () => {
    const video = videoRef.current
    if (!video) return
    
    try {
      if (video.paused) {
        await video.play()
        setIsPlaying(true)
        setShowOverlay(false)
      } else {
        video.pause()
        setIsPlaying(false)
        setShowOverlay(true)
      }
    } catch (err) {
      console.log('Play failed:', err)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const onTimeUpdate = () => {
    const video = videoRef.current
    if (!video || !video.duration) return
    setProgress((video.currentTime / video.duration) * 100)
  }

  const onPlay = () => setIsPlaying(true)
  const onPause = () => setIsPlaying(false)

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  const toggleAutoplay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(console.error)
      setIsPlaying(true)
      setShowOverlay(false)
    } else {
      video.pause()
      setIsPlaying(false)
      setShowOverlay(true)
    }
  }

  if (placeholder) {
    return (
      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden border border-dashed border-white/[0.12] bg-white/[0.02] group cursor-pointer hover:border-amber-400/40 transition-all duration-500 ${className}`}
        style={{ aspectRatio }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${accent}15` }}
          >
            <Film size={32} style={{ color: accent }} />
          </div>
          <p className="text-lg font-medium text-[#f8fafc]">{label}</p>
          <p className="text-sm text-[#64748b] text-center max-w-[300px]">
            Drop your video file here or click to browse
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono text-[#475569] tracking-wide">
              VIDEO SLOT — READY
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden bg-[#0b1220] border border-white/[0.06] group ${className}`}
      style={{ aspectRatio }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        playsInline
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onClick={handlePlay}
        onError={() => {
          setLoadError(true)
          console.error('Video failed to load:', src)
        }}
        onLoadStart={() => {
          setLoadError(false)
        }}
      />

      {/* Play/Pause overlay */}
      {showOverlay && src && !loadError && (
        <button
          onClick={handlePlay}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center bg-black/50"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/90 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <Play size={36} className="text-[#030712] ml-1" />
          </div>
        </button>
      )}

      {/* Error state */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1220] gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${accent}15` }}
          >
            <Film size={28} style={{ color: accent }} />
          </div>
          <span className="text-xs font-mono text-[#475569] tracking-wide">
            VIDEO FAILED TO LOAD
          </span>
          <button
            onClick={() => {
              setLoadError(false)
              const video = videoRef.current
              if (video) {
                video.load()
                handlePlay()
              }
            }}
            className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {controls && src && !loadError && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-1 bg-white/10 rounded-full mb-3 cursor-pointer overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${progress}%`, backgroundColor: accent }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="text-white hover:text-amber-400 transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={toggleAutoplay}
                aria-label="Autoplay toggle"
                className="text-white/70 hover:text-white transition-colors"
              >
                <SkipForward size={14} />
              </button>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                className="text-white/70 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Maximize size={14} />
            </button>
          </div>
        </div>
      )}

      {label && (
        <div className="absolute top-3 left-3 bg-[#030712]/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/[0.06]">
          <p className="text-xs font-mono text-[#94a3b8] tracking-wide">{label}</p>
        </div>
      )}
    </div>
  )
}