import { useQuery } from '@tanstack/react-query'
import { getStoredToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface StatusDistribution {
  total: number
  available: number
  allocated: number
  maintenance: number
  lost: number
}

export interface DepartmentUtilization {
  department: string
  total_assets: number
  in_use: number
  percentage: number
}

export interface MaintenancePipeline {
  pending: number
  approved: number
  in_progress: number
  resolved: number
}

export interface AuditHealth {
  cycle_name: string
  match_rate: number
  verified: number
  missing: number
  damaged: number
}

export interface TopResource {
  name: string
  bookings: number
}

export interface AgingAsset {
  id: number
  tag: string
  name: string
  reason: string
}

export interface ReportsDashboard {
  status_distribution: StatusDistribution
  utilization_by_department: DepartmentUtilization[]
  maintenance_pipeline: MaintenancePipeline
  audit_health: AuditHealth
  top_resources: TopResource[]
  aging_assets: AgingAsset[]
}

const getHeaders = () => {
  const token = getStoredToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useGetReportsDashboard = () => {
  return useQuery<ReportsDashboard>({
    queryKey: ['reports-dashboard'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/reports/dashboard`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to fetch reports')
      return res.json()
    }
  })
}
