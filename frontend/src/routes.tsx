import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/AppShell'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OrgSetupPage from './pages/OrgSetupPage'
import BookingsPage from './pages/BookingsPage'
import MaintenancePage from './pages/MaintenancePage'
import AuditPage from './pages/AuditPage'
import { DashboardPage } from './pages/PlaceholderPage'
import AssetsPage from './pages/AssetsPage'
import AllocationPage from './pages/AllocationPage'
import ReportsPage from './pages/ReportsPage'
import NotificationsPage from './pages/NotificationsPage'

/**
 * ProtectedRoute — redirects to /login if the user is not authenticated.
 * Shows nothing while the auth state is loading (avoids flash of redirect).
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null  // brief null while hydrating from localStorage
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

/**
 * App routes:
 *   /           → Landing page (no shell)
 *   /login      → Login page (no shell)
 *   /app/*      → AppShell (sidebar + topbar) wrapping all 9 screens — requires auth
 */
const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes — no sidebar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* App routes — inside AppShell, protected */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="org"           element={<OrgSetupPage />} />
        <Route path="assets"        element={<AssetsPage />} />
        <Route path="allocation"    element={<AllocationPage />} />
        <Route path="booking"       element={<BookingsPage />} />
        <Route path="maintenance"   element={<MaintenancePage />} />
        <Route path="audit"         element={<AuditPage />} />
        <Route path="reports"       element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes
