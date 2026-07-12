/**
 * pages/LoginPage.tsx — Phase 1 (Dev)
 * Fully wired login + inline signup form.
 */
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Dex from '../components/Dex'

type Mode = 'login' | 'signup'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--color-border)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-base)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-ink)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
  boxSizing: 'border-box',
}

const LoginPage: React.FC = () => {
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return }
        await signup(name.trim(), email, password)
      }
      navigate('/app/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-10)',
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-5)',
          textAlign: 'center',
        }}
      >
        {/* AF avatar mark */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-xl)',
              color: 'white',
            }}
          >
            AF
          </span>
        </div>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            AssetFlow – {mode === 'login' ? 'login' : 'create account'}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)', marginTop: 4 }}>
            {mode === 'login'
              ? 'Sign in to your account'
              : 'New accounts start as employee role'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger-dark)',
              fontSize: 'var(--text-sm)',
              textAlign: 'left',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          id="auth-form"
          onSubmit={handleSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
        >
          {mode === 'signup' && (
            <input
              id="signup-name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          )}
          <input
            id="auth-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
          <input
            id="auth-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />

          {mode === 'login' && (
            <p
              style={{
                textAlign: 'right',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-neutral)',
                cursor: 'default',
                userSelect: 'none',
              }}
              title="Password reset is not available in this build"
            >
              Forgot password?
            </p>
          )}

          <Button
            id="auth-submit-btn"
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%', marginTop: 'var(--space-1)' }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle mode */}
        <div
          style={{
            width: '100%',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-4)',
          }}
        >
          {mode === 'login' ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)' }}>
              New here?{' '}
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral)' }}>
                (Creating an account makes you an employee)
              </span>
              <br />
              <button
                id="switch-to-signup"
                type="button"
                onClick={() => { setMode('signup'); setError(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  padding: 0,
                  marginTop: 'var(--space-2)',
                  textDecoration: 'underline',
                }}
              >
                Create Account
              </button>
            </p>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)' }}>
              Already have an account?{' '}
              <button
                id="switch-to-login"
                type="button"
                onClick={() => { setMode('login'); setError(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>

        <Dex size={64} />

        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-neutral)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Link to="/" style={{ color: 'var(--color-neutral)', textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
