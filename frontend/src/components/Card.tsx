import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  /** Renders the card with a subtle inset/muted background — good for form fields or nested surfaces */
  inset?: boolean
}

const paddingMap = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-5) var(--space-6)',
  lg: 'var(--space-8)',
}

/**
 * Card — white surface panel used across all screens.
 * Shares the same border-radius, border, and shadow tokens everywhere.
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  padding = 'md',
  hoverable = false,
  inset = false,
}) => (
  <div
    className={className}
    style={{
      backgroundColor: inset ? 'var(--color-surface-raised)' : 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: inset ? 'none' : 'var(--shadow-card)',
      padding: paddingMap[padding],
      transition: hoverable ? 'box-shadow var(--transition-base), transform var(--transition-base)' : undefined,
      cursor: hoverable ? 'pointer' : undefined,
      ...style,
    }}
    onMouseEnter={hoverable ? (e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      e.currentTarget.style.transform = 'translateY(-1px)'
    } : undefined}
    onMouseLeave={hoverable ? (e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      e.currentTarget.style.transform = 'translateY(0)'
    } : undefined}
  >
    {children}
  </div>
)

export default Card
