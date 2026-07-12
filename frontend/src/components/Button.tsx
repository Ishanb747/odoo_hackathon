import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: '1.5px solid var(--color-primary)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1.5px solid var(--color-primary)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-ink-soft)',
    border: '1.5px solid transparent',
    fontWeight: 500,
  },
  danger: {
    backgroundColor: 'var(--color-danger-light)',
    color: 'var(--color-danger-dark)',
    border: '1.5px solid var(--color-danger)',
    fontWeight: 600,
  },
  accent: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-ink)',
    border: '1.5px solid transparent',
    fontWeight: 700,
  },
}

const variantHover: Record<ButtonVariant, Partial<React.CSSProperties>> = {
  primary: { backgroundColor: 'var(--color-primary-dark)', borderColor: 'var(--color-primary-dark)' },
  secondary: { backgroundColor: 'var(--color-primary-hover)' },
  ghost: { backgroundColor: 'var(--color-muted-light)', color: 'var(--color-ink)' },
  danger: { backgroundColor: '#ffe0e0', borderColor: 'var(--color-danger-dark)' },
  accent: { backgroundColor: 'var(--color-accent-dark)', color: '#fff' },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)', gap: '5px' },
  md: { padding: '8px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)', gap: '6px' },
  lg: { padding: '11px 22px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-md)', gap: '8px' },
}

/**
 * Button — primary/secondary/ghost/danger/accent variants.
 * primary  → periwinkle fill (main actions)
 * secondary → periwinkle outline
 * ghost    → text-only, subtle hover
 * danger   → coral fill (destructive actions)
 * accent   → sunshine yellow (marketing CTAs only, e.g. landing page)
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  style,
  disabled,
  ...rest
}) => (
  <button
    disabled={disabled || loading}
    style={{
      ...variantStyles[variant],
      ...sizeStyles[size],
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.55 : 1,
      fontFamily: 'var(--font-body)',
      transition: 'all var(--transition-fast)',
      outline: 'none',
      lineHeight: 1.35,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (disabled || loading) return
      const el = e.currentTarget
      const hv = variantHover[variant]
      Object.entries(hv).forEach(([k, v]) => {
        el.style[k as any] = v as string
      })
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget
      const base = variantStyles[variant]
      el.style.backgroundColor = (base.backgroundColor as string) ?? ''
      el.style.borderColor = (base.border?.toString().split(' ')[2]) ?? ''
      el.style.color = (base.color as string) ?? ''
    }}
    {...rest}
  >
    {loading ? (
      <>
        <span
          style={{
            width: 12, height: 12,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.65s linear infinite',
            flexShrink: 0,
          }}
        />
        {children}
      </>
    ) : children}
  </button>
)

export default Button
