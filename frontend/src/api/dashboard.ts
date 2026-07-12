import { getStoredToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

// ── Types ────────────────────────────────────────────────────────

export interface DashboardKPIsOut {
  available_assets: number
  allocated_assets: number
  maintenance_assets: number
  active_bookings: number
  pending_transfers: number
  upcoming_returns: number
}

export interface ActivityLogOut {
  id: number
  message: string
  created_at: string
}

export interface OverdueAlertOut {
  asset_id: number
  asset_tag: string
  allocated_to: string
  days_overdue: number
}

export interface StatusDistributionOut {
  name: string
  value: number
  color: string
}

export interface DepartmentUtilizationOut {
  name: string
  count: number
}

export interface DashboardDataOut {
  kpis: DashboardKPIsOut
  recent_activity: ActivityLogOut[]
  overdue_alerts: OverdueAlertOut[]
  status_distribution: StatusDistributionOut[]
  department_utilization: DepartmentUtilizationOut[]
}

// ── API Functions ────────────────────────────────────────────────

export const getDashboardData = (): Promise<DashboardDataOut> =>
  authFetch('/dashboard')
