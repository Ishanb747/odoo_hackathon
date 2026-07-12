import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-ink)',
    border: '2px solid transparent',
    fontWeight: 700,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '2px solid var(--color-primary)',
    fontWeight: 600,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-ink)',
    border: '2px solid transparent',
    fontWeight: 500,
  },
  danger: {
    backgroundColor: 'var(--color-danger-light)',
    color: 'var(--color-danger-dark)',
    border: '2px solid var(--color-danger)',
    fontWeight: 600,
  },
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' },
  md: { padding: '10px 20px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-md)' },
  lg: { padding: '14px 28px', fontSize: 'var(--text-lg)', borderRadius: 'var(--radius-card)' },
}

/**
 * Button — primary/secondary/ghost/danger variants.
 * primary  → sunshine yellow fill (CTAs)
 * secondary → periwinkle outline
 * ghost    → text only, no border
 * danger   → coral fill (destructive actions)
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
      gap: '8px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      fontFamily: 'var(--font-body)',
      transition: 'all var(--transition-fast)',
      outline: 'none',
      lineHeight: 1.2,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (disabled || loading) return
      const el = e.currentTarget
      if (variant === 'primary') el.style.backgroundColor = 'var(--color-accent-dark)'
      if (variant === 'secondary') el.style.backgroundColor = 'var(--color-primary-light)'
      if (variant === 'ghost') el.style.backgroundColor = 'var(--color-neutral-light)'
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget
      el.style.backgroundColor = variantStyles[variant].backgroundColor as string
    }}
    {...rest}
  >
    {loading ? (
      <>
        <span
          style={{
            width: 14, height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        {children}
      </>
    ) : children}
  </button>
)

export default Button
