import React from 'react';

interface LogoProps {
  size?: number;
  textColor?: string;
  hideText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 28, textColor = 'var(--color-ink)', hideText = false }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Abstract geometric infinity/flow symbol */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
        <path 
          d="M11.5 12.5L16 8L24 16L16 24L11.5 19.5" 
          stroke="url(#paint0_linear)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M20.5 19.5L16 24L8 16L16 8L20.5 12.5" 
          stroke="white" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="paint0_linear" x1="16" y1="8" x2="16" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB84C" />
            <stop offset="1" stopColor="#46C38F" />
          </linearGradient>
        </defs>
      </svg>
      
      {!hideText && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: Math.max(16, size * 0.7),
            color: textColor,
            letterSpacing: '-0.02em',
          }}
        >
          AssetFlow
        </span>
      )}
    </div>
  );
};

export default Logo;
