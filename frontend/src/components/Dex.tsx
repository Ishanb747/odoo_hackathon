import React from 'react'

interface DexProps {
  size?: number
  className?: string
}

/**
 * Dex — the AssetFlow mascot, a rounded dolly/trolley character.
 * Used on Login screen and empty states.
 */
const Dex: React.FC<DexProps> = ({ size = 120, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Dex mascot"
    role="img"
  >
    {/* Platform / base of the dolly */}
    <rect x="20" y="88" width="80" height="14" rx="7" fill="#6C63FF" opacity="0.15" />
    <rect x="28" y="90" width="64" height="10" rx="5" fill="#6C63FF" opacity="0.3" />

    {/* Wheels */}
    <circle cx="38" cy="105" r="7" fill="#221F2E" opacity="0.8" />
    <circle cx="38" cy="105" r="3.5" fill="#FAF6F0" />
    <circle cx="82" cy="105" r="7" fill="#221F2E" opacity="0.8" />
    <circle cx="82" cy="105" r="3.5" fill="#FAF6F0" />

    {/* Handle pole */}
    <rect x="90" y="38" width="6" height="54" rx="3" fill="#6C63FF" opacity="0.5" />
    <rect x="88" y="35" width="10" height="8" rx="4" fill="#6C63FF" />

    {/* Body / box */}
    <rect x="16" y="38" width="72" height="52" rx="14" fill="white" />
    <rect x="16" y="38" width="72" height="52" rx="14" stroke="#ECE7DE" strokeWidth="2" />

    {/* Face background */}
    <ellipse cx="52" cy="64" rx="26" ry="24" fill="#FAF6F0" />

    {/* Eyes */}
    <ellipse cx="42" cy="60" rx="5" ry="6" fill="#221F2E" />
    <ellipse cx="62" cy="60" rx="5" ry="6" fill="#221F2E" />
    {/* Eye shine */}
    <circle cx="44" cy="58" r="1.8" fill="white" />
    <circle cx="64" cy="58" r="1.8" fill="white" />

    {/* Happy smile */}
    <path
      d="M41 70 Q52 80 63 70"
      stroke="#221F2E"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cheek blush */}
    <ellipse cx="36" cy="68" rx="5" ry="3" fill="#FF6B6B" opacity="0.25" />
    <ellipse cx="68" cy="68" rx="5" ry="3" fill="#FF6B6B" opacity="0.25" />

    {/* AssetFlow 'AF' tag on the box */}
    <rect x="24" y="44" width="28" height="14" rx="5" fill="#6C63FF" opacity="0.12" />
    <text
      x="38"
      y="54.5"
      textAnchor="middle"
      fill="#6C63FF"
      fontSize="8"
      fontFamily="'JetBrains Mono', monospace"
      fontWeight="600"
    >
      AF
    </text>

    {/* Stars / sparkles */}
    <circle cx="12" cy="30" r="2.5" fill="#FFB84C" opacity="0.8" />
    <circle cx="98" cy="28" r="2" fill="#46C38F" opacity="0.8" />
    <circle cx="8" cy="56" r="1.5" fill="#6C63FF" opacity="0.6" />
    <circle cx="104" cy="52" r="1.5" fill="#FFB84C" opacity="0.6" />
  </svg>
)

export default Dex
