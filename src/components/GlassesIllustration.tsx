import { useId } from 'react'

interface GlassesIllustrationProps {
  className?: string
  accent?: string
  hudLabel?: string
  hudValue?: string
  showHud?: boolean
}

/**
 * A fully original, hand-drawn SVG illustration of the NEXUS Spectacle frame.
 * Built as vector art (not a photograph) so it never depends on external
 * image hosting, is copyright-clean, and can be recolored per "finish".
 */
export default function GlassesIllustration({
  className = '',
  accent = '#f59e0b',
  hudLabel = 'NAV',
  hudValue = '240m',
  showHud = true,
}: GlassesIllustrationProps) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 640 360"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of the NEXUS Spectacle smart glasses"
    >
      <defs>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`lens-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="55%" stopColor="#0f172a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#030712" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`frame-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Ambient glow behind the frame */}
      <rect x="0" y="0" width="640" height="360" fill={`url(#glow-${uid})`} />

      {/* Temple arms */}
      <path
        d="M40 150 L150 168"
        stroke={`url(#frame-${uid})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M600 150 L490 168"
        stroke={`url(#frame-${uid})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sensor dot on right temple */}
      <circle cx="565" cy="157" r="5" fill={accent} opacity="0.9" />

      {/* Bridge */}
      <path
        d="M296 176 Q320 162 344 176"
        stroke={`url(#frame-${uid})`}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Left lens */}
      <rect
        x="150"
        y="120"
        width="146"
        height="100"
        rx="34"
        fill={`url(#lens-${uid})`}
        stroke={`url(#frame-${uid})`}
        strokeWidth="9"
      />
      {/* Right lens (HUD side) */}
      <rect
        x="344"
        y="120"
        width="146"
        height="100"
        rx="34"
        fill={`url(#lens-${uid})`}
        stroke={`url(#frame-${uid})`}
        strokeWidth="9"
      />

      {/* Lens highlight streaks */}
      <path d="M168 132 L188 220" stroke="white" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />
      <path d="M362 132 L382 220" stroke="white" strokeOpacity="0.12" strokeWidth="10" strokeLinecap="round" />

      {/* HUD readout projected in the right lens */}
      {showHud && (
        <g fontFamily="ui-monospace, monospace">
          <line x1="366" y1="188" x2="466" y2="188" stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
          <text x="366" y="150" fontSize="11" letterSpacing="2" fill={accent} opacity="0.85">
            {hudLabel}
          </text>
          <text x="366" y="176" fontSize="20" fill="#f8fafc" fontWeight={600}>
            {hudValue}
          </text>
          <circle cx="452" cy="145" r="3" fill={accent}>
            <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  )
}
