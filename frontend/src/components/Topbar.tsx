import React from 'react'

interface TopbarProps {
  title?: string
}

const Topbar: React.FC<TopbarProps> = ({ title = '' }) => {
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-8)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left: AssetFlow wordmark + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'var(--text-xl)',
            color: 'var(--color-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          AssetFlow
        </span>
        {title && (
          <>
            <span style={{ color: 'var(--color-border)', fontSize: 'var(--text-lg)' }}>/</span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                color: 'var(--color-ink)',
                opacity: 0.7,
              }}
            >
              {title}
            </span>
          </>
        )}
      </div>

      {/* Right: user avatar placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Avatar circle — will wire to auth context in Phase 1 */}
        <div
          title="Signed in user"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'opacity var(--transition-fast)',
            color: 'white',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          A
        </div>
      </div>
    </header>
  )
}

export default Topbar
