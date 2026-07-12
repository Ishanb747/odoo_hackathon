import React from 'react'

type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral' | 'primary'

interface BadgeProps {
  tone?: BadgeTone
  children: React.ReactNode
  className?: string
}

const toneStyles: Record<BadgeTone, React.CSSProperties> = {
  success: {
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success-dark)',
    border: '1px solid var(--color-success)',
  },
  danger: {
    backgroundColor: 'var(--color-danger-light)',
    color: 'var(--color-danger-dark)',
    border: '1px solid var(--color-danger)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-light)',
    color: 'var(--color-warning-dark)',
    border: '1px solid var(--color-warning)',
  },
  neutral: {
    backgroundColor: 'var(--color-neutral-light)',
    color: 'var(--color-neutral-dark)',
    border: '1px solid var(--color-border)',
  },
  primary: {
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary-dark)',
    border: '1px solid var(--color-primary)',
  },
}

/**
 * Badge — status pill used across all screens.
 * tone="success" → Mint (Available / Verified / Active)
 * tone="danger"  → Coral (Overdue / Missing / Blocked)
 * tone="warning" → Amber (Damaged / at-risk)
 * tone="neutral" → Grey (Inactive / generic)
 * tone="primary" → Periwinkle (informational)
 */
const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', children, className = '' }) => (
  <span
    className={className}
    style={{
      ...toneStyles[tone],
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      transition: 'all var(--transition-fast)',
    }}
  >
    {children}
  </span>
)

export default Badge
