import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Dex from '../components/Dex'
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

// ── Mini floating asset tag ───────────────────────────────────
const FloatingTag: React.FC<{
  text: string
  style?: React.CSSProperties
  animClass?: string
}> = ({ text, style, animClass = '' }) => (
  <div
    className={animClass}
    style={{
      position: 'absolute',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'white',
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--radius-full)',
      padding: '6px 14px',
      boxShadow: 'var(--shadow-md)',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--color-ink)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: 'var(--color-success)',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
    {text}
  </div>
)

// ── Blob background element ───────────────────────────────────
const Blob: React.FC<{
  color: string
  size: number
  style?: React.CSSProperties
  animClass?: string
}> = ({ color, size, style, animClass }) => (
  <div
    className={animClass}
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: 'blur(80px)',
      opacity: 0.35,
      pointerEvents: 'none',
      ...style,
    }}
  />
)

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
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                color: 'white',
              }}
            >
              AF
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-xl)',
              color: 'var(--color-ink)',
            }}
          >
            AssetFlow
          </span>
        </div>

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
            backgroundColor: 'rgba(108,99,255,0.06)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(108,99,255,0.06)'
            e.currentTarget.style.color = 'var(--color-primary)'
          }}
        >
          Log in
        </Link>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          paddingTop: 68,
        }}
      >
        {/* Background blobs */}
        <Blob
          color="var(--color-primary)"
          size={500}
          style={{ top: -100, left: -100 }}
          animClass="blobOne"
          // inline style for the blob animation since we can't use className for custom keyframes
        />
        <Blob
          color="var(--color-accent)"
          size={400}
          style={{ bottom: -80, right: -80 }}
          animClass="blobTwo"
        />
        <Blob
          color="var(--color-success)"
          size={300}
          style={{ top: '30%', right: '20%' }}
          animClass="blobThree"
        />

        {/* Dot grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(34,31,46,0.06) 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
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
                  gap: 8,
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  border: '1.5px solid rgba(108,99,255,0.3)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'inline-block',
                    animation: 'pulse 2s ease-in-out infinite',
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
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                Know where{' '}
                <span className="gradient-heading">everything</span>
                {' '}is —
                <br />
                <span style={{ color: 'var(--color-ink)' }}>instantly.</span>
              </h1>
            </div>

            {/* Sub */}
            <div className="land-fade-up delay-300">
              <p
                style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-neutral-dark)',
                  lineHeight: 1.7,
                  maxWidth: 460,
                  margin: 0,
                }}
              >
                AssetFlow replaces spreadsheets and paper logs with one system of
                record — track assets, book shared resources, approve maintenance,
                and run audits.
              </p>
            </div>

            {/* CTAs */}
            <div className="land-fade-up delay-400" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  className="cta-pulse"
                  style={{
                    padding: '14px 32px',
                    borderRadius: 'var(--radius-card)',
                    border: 'none',
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 20px rgba(255,184,76,0.4)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent)' }}
                >
                  Get started free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    padding: '14px 28px',
                    borderRadius: 'var(--radius-card)',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'white',
                    color: 'var(--color-ink)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 'var(--text-base)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-ink)' }}
                >
                  Log in →
                </button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="land-fade-up delay-500">
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-neutral)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ display: 'flex', gap: 4 }}>
                  {['🏢','🔧','📦','🚗'].map((e, i) => (
                    <span key={i} style={{ fontSize: 16 }}>{e}</span>
                  ))}
                </span>
                Built for teams with equipment, rooms, or vehicles to track
              </p>
            </div>
          </div>

          {/* Right: Dex + floating tags */}
          <div
            className="land-slide-right delay-300"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 420,
            }}
          >
            {/* Glow circle behind Dex */}
            <div
              style={{
                position: 'absolute',
                width: 340,
                height: 340,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Dex mascot */}
            <div style={{ animation: 'floatDex 4s ease-in-out infinite', zIndex: 2 }}>
              <Dex size={220} />
            </div>

            {/* Floating asset tags */}
            <FloatingTag
              text="AF-0114 — Available"
              animClass=""
              style={{
                top: '8%',
                right: '5%',
                animation: 'tagFloat 3.5s ease-in-out infinite',
                animationDelay: '0.2s',
              }}
            />
            <FloatingTag
              text="Room B2 — Booked"
              animClass=""
              style={{
                top: '35%',
                left: '2%',
                animation: 'tagFloat2 4s ease-in-out infinite',
                animationDelay: '0.8s',
                borderColor: 'rgba(70,195,143,0.4)',
              }}
            />
            <FloatingTag
              text="Maintenance — Resolved"
              animClass=""
              style={{
                bottom: '20%',
                right: '3%',
                animation: 'tagFloat3 3.8s ease-in-out infinite',
                animationDelay: '0.5s',
                borderColor: 'rgba(255,107,107,0.3)',
              }}
            />
            <FloatingTag
              text="AF-0087 — Audit OK"
              animClass=""
              style={{
                bottom: '10%',
                left: '8%',
                animation: 'tagFloat 4.2s ease-in-out infinite',
                animationDelay: '1.1s',
                borderColor: 'rgba(232,163,61,0.4)',
              }}
            />
          </div>
        </div>

        {/* Bottom fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: 'linear-gradient(to bottom, transparent, var(--color-canvas))',
            pointerEvents: 'none',
          }}
        />
      </section>

      {/* ══════════════════════════════════════════════════
          MARQUEE STRIP
      ══════════════════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: 'var(--color-ink)',
          padding: '18px 0',
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
                gap: 32,
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                color: 'rgba(255,255,255,0.75)',
                padding: '0 32px',
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
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
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            What it does
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              margin: '0 0 var(--space-4)',
              lineHeight: 1.2,
            }}
          >
            Everything your team needs,{' '}
            <span style={{ color: 'var(--color-primary)' }}>nothing it doesn't.</span>
          </h2>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-neutral-dark)',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Four core workflows. One system. No more spreadsheets.
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
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  backgroundColor: f.accent,
                  borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: f.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  marginTop: 8,
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
                    fontSize: 'var(--text-xl)',
                    color: 'var(--color-ink)',
                    margin: '0 0 var(--space-2)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-base)',
                    color: 'var(--color-neutral-dark)',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>

              {/* Asset tag chip */}
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-2)' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: f.accent,
                    backgroundColor: f.bg,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
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
          DEMO WORKFLOW STRIP
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-16) var(--space-8)',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div className="reveal" style={{ marginBottom: 'var(--space-10)' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                color: 'var(--color-ink)',
                margin: '0 0 var(--space-4)',
                letterSpacing: '-0.02em',
              }}
            >
              From signup to insight in minutes
            </h2>
            <p style={{ color: 'var(--color-neutral-dark)', fontSize: 'var(--text-lg)', lineHeight: 1.7 }}>
              Follow the flow that judges will see during the demo.
            </p>
          </div>

          {/* Steps */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0,
              justifyContent: 'center',
              alignItems: 'stretch',
              position: 'relative',
            }}
          >
            {[
              { n: '01', label: 'Sign up as Employee', color: 'var(--color-primary)' },
              { n: '02', label: 'Register an Asset', color: 'var(--color-success)' },
              { n: '03', label: 'Trigger a Conflict', color: 'var(--color-danger)' },
              { n: '04', label: 'Book a Room', color: 'var(--color-accent)' },
              { n: '05', label: 'Drag to Resolve', color: 'var(--color-warning)' },
            ].map((step, i) => (
              <div
                key={step.n}
                className={`reveal delay-${i + 1}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-6) var(--space-5)',
                  flex: '1 1 140px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: `2px solid ${step.color}`,
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 'var(--text-sm)',
                    color: step.color,
                    boxShadow: `0 4px 16px ${step.color}33`,
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {step.n}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink)',
                    margin: 0,
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {step.label}
                </p>
                {/* Connector line */}
                {i < 4 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 42,
                      left: 'calc(50% + 28px)',
                      right: 'calc(-50% + 28px)',
                      height: 2,
                      background: `linear-gradient(90deg, ${step.color}66, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          padding: 'var(--space-16) var(--space-8)',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1a1830 0%, #221F2E 60%, #2d1f3d 100%)',
        }}
      >
        {/* Background blobs for CTA */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            filter: 'blur(120px)',
            opacity: 0.15,
            top: -100,
            right: -100,
            pointerEvents: 'none',
            animation: 'blobOne 10s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            filter: 'blur(100px)',
            opacity: 0.12,
            bottom: -80,
            left: -80,
            pointerEvents: 'none',
            animation: 'blobTwo 12s ease-in-out infinite',
          }}
        />

        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}
        >
          <div className="reveal">
            <Dex size={90} />
          </div>

          <div className="reveal delay-1">
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: 'white',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Ready to get organized?
            </h2>
          </div>

          <div className="reveal delay-2">
            <p
              style={{
                fontSize: 'var(--text-lg)',
                color: 'rgba(255,255,255,0.65)',
                maxWidth: 480,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Sign up and have your first asset registered in under two minutes.
              No spreadsheets. No paper logs.
            </p>
          </div>

          <div className="reveal delay-3" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '16px 40px',
                  borderRadius: 'var(--radius-card)',
                  border: 'none',
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-ink)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  cursor: 'pointer',
                  boxShadow: '0 6px 30px rgba(255,184,76,0.45)',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-dark)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(255,184,76,0.55)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 6px 30px rgba(255,184,76,0.45)'
                }}
              >
                Get started free
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '16px 32px',
                  borderRadius: 'var(--radius-card)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  backgroundColor: 'transparent',
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Log in →
              </button>
            </Link>
          </div>

          {/* Tiny asset tags row */}
          <div className="reveal delay-4" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['AF-0114', 'Room B2', 'AF-0062', 'AF-0087'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer
        style={{
          backgroundColor: 'var(--color-ink)',
          padding: 'var(--space-8) var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'white' }}>AF</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'white' }}>
            AssetFlow
          </span>
        </div>

        <Link
          to="/login"
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 'var(--text-sm)',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
        >
          Log in
        </Link>
      </footer>
    </div>
  )
}

export default LandingPage
