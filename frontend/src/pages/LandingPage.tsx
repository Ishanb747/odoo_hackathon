import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import '../styles/landing.css'

// ── Feature data ─────────────────────────────────────────────
const FEATURES = [
  {
    id: 'track',
    emoji: '📦',
    title: 'Track Assets',
    desc: 'Know what you own, where it is, and who has it — from laptops to forklifts.',
    accent: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
    tag: 'AF-0114',
  },
  {
    id: 'book',
    emoji: '📅',
    title: 'Book Resources',
    desc: 'Reserve rooms, vehicles, and equipment without the back-and-forth email thread.',
    accent: 'var(--color-success)',
    bg: 'var(--color-success-light)',
    tag: 'Room B2',
  },
  {
    id: 'maintain',
    emoji: '🔧',
    title: 'Manage Maintenance',
    desc: 'Move requests from Pending to Resolved on a Kanban board. Asset status updates itself.',
    accent: 'var(--color-warning)',
    bg: 'var(--color-warning-light)',
    tag: 'AF-0062',
  },
  {
    id: 'audit',
    emoji: '✅',
    title: 'Run Audits',
    desc: 'Cycle through assets, mark verified, missing, or damaged. Discrepancies tallied automatically.',
    accent: 'var(--color-danger)',
    bg: 'var(--color-danger-light)',
    tag: 'Q3 Audit',
  },
]

const MARQUEE_ITEMS = [
  '✦ Asset Tracking',
  '✦ Resource Booking',
  '✦ Maintenance Kanban',
  '✦ Audit Cycles',
  '✦ Transfer Requests',
  '✦ Activity Logs',
  '✦ Department Setup',
  '✦ Role Management',
]

// ── Clean UI Mockup ──────────────────────────────────────────
const CleanMockup: React.FC = () => {
  return (
    <div 
      className="land-fade-up delay-300"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        animation: 'floatMockup 6s ease-in-out infinite',
      }}>
        {/* Main Base Panel */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '90%',
          height: '80%',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-6)',
          gap: 'var(--space-4)',
        }}>
          {/* Header Mockup */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)' }} />
            <div style={{ width: 140, height: 12, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-border)' }} />
          </div>
          {/* Content Mockup */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ height: 100, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)' }} />
            <div style={{ height: 100, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ flex: 1, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-border)' }} />
        </div>

        {/* Floating Card 1 */}
        <div style={{
          position: 'absolute',
          top: '0%',
          right: '-2%',
          width: 180,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-4)',
          gap: 'var(--space-2)'
        }}>
          <div style={{ width: 80, height: 10, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-primary)' }} />
          <div style={{ width: '100%', height: 40, backgroundColor: 'var(--color-success-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-success)' }} />
        </div>

        {/* Floating Card 2 */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '-5%',
          width: 220,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-warning)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div style={{ width: 100, height: 8, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-border-strong)' }} />
            <div style={{ width: 60, height: 6, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-border)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)

  // Sticky nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-ink)',
        overflowX: 'hidden',
      }}
    >
      {/* ══════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════ */}
      <nav
        className={`land-nav ${scrolled ? 'scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: '0 var(--space-8)',
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: scrolled ? 'var(--color-surface)' : 'transparent',
        }}
      >
        <Logo size={24} textColor="var(--color-ink)" />

        <Link
          to="/login"
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            padding: '8px 20px',
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'all var(--transition-fast)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-primary)'
          }}
        >
          Log in
        </Link>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO (Clean, Token-Aligned)
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          paddingTop: 'var(--topbar-height)',
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, var(--color-border-strong) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />

        {/* Inner layout */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'var(--space-16) var(--space-8)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-12)',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Badge */}
            <div className="land-fade-up delay-100">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-ink-soft)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary)',
                    display: 'inline-block',
                  }}
                />
                Enterprise Asset Management
              </span>
            </div>

            {/* Headline */}
            <div className="land-fade-up delay-200">
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                Track your assets{' '}
                <span style={{ color: 'var(--color-primary)' }}>intelligently.</span>
              </h1>
            </div>

            {/* Sub */}
            <div className="land-fade-up delay-300">
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-muted)',
                  lineHeight: 1.6,
                  maxWidth: 480,
                  margin: 0,
                }}
              >
                AssetFlow replaces spreadsheets with one system of record. Track assets, book resources, manage maintenance, and run audits securely.
              </p>
            </div>

            {/* CTAs */}
            <div className="land-fade-up delay-400" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    padding: '14px 32px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid transparent',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-surface)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 'var(--text-base)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)' }}
                >
                  Get started
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    padding: '14px 28px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 'var(--text-base)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-ink)' }}
                >
                  Log in →
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Clean Mockup */}
          <div className="land-slide-right delay-300" style={{ display: 'flex', justifyContent: 'center' }}>
             <CleanMockup />
          </div>
        </div>

        {/* Bottom fade into features bg */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: 'linear-gradient(to bottom, transparent, var(--color-surface))',
            pointerEvents: 'none',
          }}
        />
      </section>

      {/* ══════════════════════════════════════════════════
          MARQUEE STRIP
      ══════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-6) 0',
          borderBottom: '1px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className="marquee-track" style={{ width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-10)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: 'var(--text-xs)',
                color: 'var(--color-muted)',
                padding: '0 var(--space-10)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--space-16) var(--space-8)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {/* Section header */}
        <div
          className="reveal"
          style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-primary)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-4)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Capabilities
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              margin: '0 0 var(--space-4)',
              lineHeight: 1.2,
            }}
          >
            A unified system of record
          </h2>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-muted)',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Four core workflows designed specifically for modern asset management. Completely extensible and robust.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              className={`feature-card reveal delay-${i + 1}`}
              style={{
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                position: 'relative',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: f.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  border: `1px solid ${f.accent}20`
                }}
              >
                {f.emoji}
              </div>

              {/* Text */}
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-ink)',
                    margin: '0 0 var(--space-2)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-soft)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>

              {/* Asset tag chip */}
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: f.accent,
                    backgroundColor: f.bg,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {f.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          padding: 'var(--space-16) var(--space-8)',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}
        >
          <div>
             <Logo size={40} textColor="var(--color-ink)" hideText />
          </div>

          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'var(--color-ink)',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Start managing assets<br/>professionally.
            </h2>
          </div>

          <div>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '16px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid transparent',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-surface)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-lg)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)' }}
              >
                Create workspace
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-8) var(--space-8)',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <Logo size={20} textColor="var(--color-ink)" />
            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
              {['Features', 'Pricing', 'Documentation', 'Contact'].map(link => (
                <a
                  key={link}
                  href="#"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--color-muted)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)' }}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
              © {new Date().getFullYear()} AssetFlow. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <a href="#" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
