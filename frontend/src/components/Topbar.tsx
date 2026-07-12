import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

interface TopbarProps {
  title?: string
}

const Topbar: React.FC<TopbarProps> = ({ title = '' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'
  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left: AssetFlow wordmark + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Logo size={24} />
        {title && (
          <>
            <span style={{ color: 'var(--color-border-strong)', fontSize: 'var(--text-base)', userSelect: 'none' }}>›</span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-muted)',
              }}
            >
              {title}
            </span>
          </>
        )}
      </div>

      {/* Right: user info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {user && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            {user.name}
          </span>
        )}
        <div
          id="topbar-avatar"
          title={user?.email ?? 'Signed in user'}
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--color-primary), #a89cff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'white',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.7rem',
            letterSpacing: '0.02em',
          }}
        >
          {initials}
        </div>
        <button
          id="topbar-logout-btn"
          onClick={handleLogout}
          title="Log out"
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            padding: 'var(--space-1) var(--space-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-neutral-dark)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-danger-light)'; e.currentTarget.style.color = 'var(--color-danger-dark)'; e.currentTarget.style.borderColor = 'var(--color-danger)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-neutral-dark)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default Topbar
