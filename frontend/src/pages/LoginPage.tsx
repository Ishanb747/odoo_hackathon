import React from 'react'
import Dex from '../components/Dex'
import Button from '../components/Button'

/**
 * LoginPage — Phase 0 placeholder (visual shell only).
 * Full auth wired in Phase 1.
 */
const LoginPage: React.FC = () => (
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
          }}
        >
          AssetFlow – login
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)', marginTop: 4 }}>
          Sign in to your account
        </p>
      </div>

      {/* Fields — placeholder, wired in Phase 1 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <input
          type="email"
          placeholder="Email"
          disabled
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            backgroundColor: 'var(--color-surface-muted)',
            color: 'var(--color-neutral)',
            outline: 'none',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          disabled
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            backgroundColor: 'var(--color-surface-muted)',
            color: 'var(--color-neutral)',
            outline: 'none',
          }}
        />
        <p style={{ textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
          Forgot password?
        </p>
      </div>

      <Button variant="primary" size="lg" style={{ width: '100%' }} disabled>
        Sign in
      </Button>

      <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)', marginBottom: 'var(--space-3)' }}>
          New here?{' '}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral)' }}>
            (Creating an account makes you an employee)
          </span>
        </p>
        <Button variant="secondary" size="md" style={{ width: '100%' }} disabled>
          Create Account
        </Button>
      </div>

      <Dex size={72} />

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral)', fontFamily: 'var(--font-mono)' }}>
        Auth wired in Phase 1
      </p>
    </div>
  </div>
)

export default LoginPage
