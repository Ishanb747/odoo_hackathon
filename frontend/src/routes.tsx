import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import {
  DashboardPage,
  OrgSetupPage,
  AssetsPage,
  AllocationPage,
  BookingPage,
  MaintenancePage,
  AuditPage,
  ReportsPage,
  NotificationsPage,
} from './pages/PlaceholderPage'

/**
 * App routes:
 *   /           → Landing page (no shell)
 *   /login      → Login page (no shell)
 *   /app/*      → AppShell (sidebar + topbar) wrapping all 9 screens
 */
const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes — no sidebar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* App routes — inside AppShell */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"    element={<DashboardPage />} />
        <Route path="org"          element={<OrgSetupPage />} />
        <Route path="assets"       element={<AssetsPage />} />
        <Route path="allocation"   element={<AllocationPage />} />
        <Route path="booking"      element={<BookingPage />} />
        <Route path="maintenance"  element={<MaintenancePage />} />
        <Route path="audit"        element={<AuditPage />} />
        <Route path="reports"      element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes
