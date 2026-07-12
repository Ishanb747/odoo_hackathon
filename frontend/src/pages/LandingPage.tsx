import React from 'react'
import { Link } from 'react-router-dom'
import Dex from '../components/Dex'
import Button from '../components/Button'

/**
 * LandingPage (Screen 0) — Phase 0 placeholder.
 * Proves the route works and showcases the design system.
 * Full content built in Phase 1.
 */
const LandingPage: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      padding: 'var(--space-8)',
      textAlign: 'center',
      gap: 'var(--space-6)',
    }}
  >
    <Dex size={140} />

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-ink)',
          letterSpacing: '-0.02em',
        }}
      >
        AssetFlow
      </h1>
      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-neutral-dark)', maxWidth: 400 }}>
        Know where everything is — instantly.
      </p>
    </div>

    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
      <Link to="/login" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="lg">Get started</Button>
      </Link>
      <Link to="/login" style={{ textDecoration: 'none' }}>
        <Button variant="secondary" size="lg">Log in</Button>
      </Link>
    </div>

    <p
      style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-neutral)',
        marginTop: 'var(--space-4)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      Phase 0 scaffold — full landing page in Phase 1
    </p>
  </div>
)

export default LandingPage
