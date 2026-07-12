import React from 'react'
import { NavLink } from 'react-router-dom'

// ── Nav items — exact order from mockup (Section 2 of readme) ──
const NAV_ITEMS = [
  { label: 'Dashboard',              path: '/app/dashboard',    icon: DashboardIcon },
  { label: 'Organization Setup',     path: '/app/org',          icon: OrgIcon },
  { label: 'Assets',                 path: '/app/assets',       icon: AssetsIcon },
  { label: 'Allocation & Transfer',  path: '/app/allocation',   icon: AllocationIcon },
  { label: 'Resource Booking',       path: '/app/booking',      icon: BookingIcon },
  { label: 'Maintenance',            path: '/app/maintenance',  icon: MaintenanceIcon },
  { label: 'Audit',                  path: '/app/audit',        icon: AuditIcon },
  { label: 'Reports',                path: '/app/reports',      icon: ReportsIcon },
  { label: 'Notifications',          path: '/app/notifications',icon: NotificationsIcon },
]

const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        backgroundColor: '#1a1825',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Wordmark ── */}
      <div
        style={{
          padding: 'var(--space-5) var(--space-5)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), #a89cff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(108,99,255,0.4)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'white',
              letterSpacing: '-0.01em',
            }}
          >
            AF
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-lg)',
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          AssetFlow
        </span>
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: 'var(--space-3) var(--space-2)' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  backgroundColor: isActive ? 'rgba(108,99,255,0.85)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  position: 'relative',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  if (el.getAttribute('aria-current') !== 'page') {
                    el.style.backgroundColor = 'rgba(255,255,255,0.06)'
                    el.style.color = 'rgba(255,255,255,0.85)'
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  if (el.getAttribute('aria-current') !== 'page') {
                    el.style.backgroundColor = 'transparent'
                    el.style.color = 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          fontSize: 'var(--text-xs)',
          color: 'rgba(255,255,255,0.2)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.04em',
        }}
      >
        AssetFlow v0.1
      </div>
    </aside>
  )
}

// ── Icon components (simple SVG, inline) ─────────────────────

interface IconProps { size?: number }

function DashboardIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

function OrgIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="5" r="2.5" fill="currentColor" />
      <circle cx="4" cy="14" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="14" r="2.5" fill="currentColor" opacity="0.7" />
      <path d="M10 7.5v3M7 12l-1.5 1M13 12l1.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AssetsIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="7" width="14" height="10" rx="2" fill="currentColor" opacity="0.6" />
      <path d="M7 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

function AllocationIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="10" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="15" cy="10" r="3" fill="currentColor" opacity="0.7" />
      <path d="M8 10h4M11 8l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BookingIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2" fill="currentColor" opacity="0.5" />
      <path d="M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="6" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function MaintenanceIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M15.5 4.5l-2 2-1.5-1.5 2-2A4 4 0 006.5 8a4 4 0 001 2.6L4 14a1.5 1.5 0 002 2l3.4-3.5A4 4 0 0015.5 4.5z" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

function AuditIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="2" fill="currentColor" opacity="0.5" />
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="15" r="3.5" fill="white" />
      <path d="M13.5 15l1 1 2-2" stroke="var(--color-success)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReportsIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="currentColor" opacity="0.3" />
      <rect x="6" y="12" width="2" height="3" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="2" height="6" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="12" y="7" width="2" height="8" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

function NotificationsIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 016 6v3l1.5 2.5H2.5L4 11V8a6 6 0 016-6z" fill="currentColor" opacity="0.7" />
      <path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default Sidebar
