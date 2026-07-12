import React from 'react'
import Dex from '../components/Dex'

interface PlaceholderPageProps {
  screen: string
  phase: string
  owner: 'Dev' | 'Ishan' | 'Dev + Ishan'
}

/**
 * PlaceholderPage — used for every screen during Phase 0.
 * Shows screen name, upcoming phase, and owner.
 * Replaced screen-by-screen from Phase 1 onward.
 */
export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ screen, phase, owner }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--topbar-height))',
      gap: 'var(--space-5)',
      fontFamily: 'var(--font-body)',
      textAlign: 'center',
    }}
  >
    <Dex size={100} />
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-ink)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {screen}
      </h2>
      <p style={{ color: 'var(--color-neutral-dark)', fontSize: 'var(--text-base)' }}>
        Coming in <strong>{phase}</strong> · Owner: <strong>{owner}</strong>
      </p>
    </div>
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-neutral)',
        backgroundColor: 'var(--color-neutral-light)',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-full)',
      }}
    >
      Phase 0 scaffold
    </p>
  </div>
)

// ── Named exports for each screen ────────────────────────────

export const DashboardPage = () => (
  <PlaceholderPage screen="Dashboard" phase="Phase 7" owner="Dev" />
)

export const OrgSetupPage = () => (
  <PlaceholderPage screen="Organization Setup" phase="Phase 1" owner="Dev" />
)

export const AssetsPage = () => (
  <PlaceholderPage screen="Asset Directory" phase="Phase 2" owner="Dev" />
)

export const AllocationPage = () => (
  <PlaceholderPage screen="Allocation & Transfer" phase="Phase 3" owner="Dev" />
)

export const BookingPage = () => (
  <PlaceholderPage screen="Resource Booking" phase="Phase 4" owner="Ishan" />
)

export const MaintenancePage = () => (
  <PlaceholderPage screen="Maintenance Kanban" phase="Phase 5" owner="Ishan" />
)

export const AuditPage = () => (
  <PlaceholderPage screen="Asset Audit" phase="Phase 6" owner="Ishan" />
)

export const ReportsPage = () => (
  <PlaceholderPage screen="Reports & Analytics" phase="Phase 7" owner="Ishan" />
)

export const NotificationsPage = () => (
  <PlaceholderPage screen="Notifications & Activity" phase="Phase 7" owner="Ishan" />
)
