import React from 'react'

type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral' | 'primary' | 'accent'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  tone?: BadgeTone
  size?: BadgeSize
  children: React.ReactNode
  className?: string
  /** Show a leading dot indicator */
  dot?: boolean
}

const toneStyles: Record<BadgeTone, React.CSSProperties> = {
  success: {
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success-dark)',
    border: '1px solid rgba(70, 195, 143, 0.25)',
  },
  danger: {
    backgroundColor: 'var(--color-danger-light)',
    color: 'var(--color-danger-dark)',
    border: '1px solid rgba(224, 80, 80, 0.25)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-light)',
    color: 'var(--color-warning-dark)',
    border: '1px solid rgba(217, 119, 6, 0.25)',
  },
  neutral: {
    backgroundColor: 'var(--color-surface-raised)',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
  },
  primary: {
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary-dark)',
    border: '1px solid rgba(108, 99, 255, 0.2)',
  },
  accent: {
    backgroundColor: 'var(--color-accent-light)',
    color: 'var(--color-accent-dark)',
    border: '1px solid rgba(255, 184, 76, 0.3)',
  },
}

const dotColors: Record<BadgeTone, string> = {
  success: 'var(--color-success)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  neutral: 'var(--color-muted)',
  primary: 'var(--color-primary)',
  accent: 'var(--color-accent-dark)',
}

/**
 * Badge — status pill used across all screens.
 * tone="success" → Mint  (Available / Verified / Active)
 * tone="danger"  → Coral (Overdue / Missing / Blocked)
 * tone="warning" → Amber (Damaged / at-risk)
 * tone="neutral" → Grey  (Inactive / generic)
 * tone="primary" → Periwinkle (informational)
 * tone="accent"  → Sunshine (special states)
 */
const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', size = 'sm', children, className = '', dot }) => (
  <span
    className={className}
    style={{
      ...toneStyles[tone],
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      letterSpacing: '0.015em',
      whiteSpace: 'nowrap',
    }}
  >
    {dot && (
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: dotColors[tone],
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
    )}
    {children}
  </span>
)

export default Badge
