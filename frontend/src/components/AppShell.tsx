import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

// Map route paths to human-readable titles
const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard':    'Dashboard',
  '/app/org':          'Organization Setup',
  '/app/assets':       'Assets',
  '/app/allocation':   'Allocation & Transfer',
  '/app/booking':      'Resource Booking',
  '/app/maintenance':  'Maintenance',
  '/app/audit':        'Audit',
  '/app/reports':      'Reports & Analytics',
  '/app/notifications':'Notifications',
}

/**
 * AppShell — wraps every authenticated screen.
 * Layout: fixed sidebar (left) + scrollable main content (right).
 * Login and Landing pages render outside this shell.
 */
const AppShell: React.FC = () => {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? ''

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
      }}
    >
      <Sidebar />

      {/* Main content area — offset by sidebar width */}
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Topbar title={title} />

        <main
          style={{
            flex: 1,
            padding: 'var(--space-6) var(--space-8)',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
