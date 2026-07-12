import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStoredToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type VerificationStatus = 'verified' | 'missing' | 'damaged'

export interface AuditRecordResponse {
  id: number
  asset_id: number
  asset_name: string
  asset_tag: string
  expected_location: string | null
  verification_status: VerificationStatus
}

export interface AuditCycleResponse {
  id: number
  name: string
  department_id: number | null
  department_name: string | null
  start_date: string | null
  end_date: string | null
  auditor_ids: number[]
  closed: boolean
  closed_at: string | null
  created_at: string
  records: AuditRecordResponse[]
}

export interface AuditCycleCreate {
  name: string
  department_id?: number
  start_date?: string
  end_date?: string
  auditor_ids?: number[]
}

const getHeaders = () => {
  const token = getStoredToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useGetAudits = () => {
  return useQuery<AuditCycleResponse[]>({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/audits`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to fetch audits')
      return res.json()
    }
  })
}

export const useCreateAudit = () => {
  const queryClient = useQueryClient()
  return useMutation<AuditCycleResponse, Error, AuditCycleCreate>({
    mutationFn: async (data) => {
      const res = await fetch(`${API_BASE}/audits`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to create audit cycle')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] })
    }
  })
}

export const useUpdateRecordStatus = () => {
  const queryClient = useQueryClient()
  return useMutation<AuditRecordResponse, Error, { id: number; status: VerificationStatus }>({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`${API_BASE}/audits/records/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ verification_status: status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to update record')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] })
    }
  })
}

export const useCloseAudit = () => {
  const queryClient = useQueryClient()
  return useMutation<AuditCycleResponse, Error, number>({
    mutationFn: async (cycleId) => {
      const res = await fetch(`${API_BASE}/audits/${cycleId}/close`, {
        method: 'POST',
        headers: getHeaders(),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to close audit')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] }) // Assets might be marked lost/maintenance
      queryClient.invalidateQueries({ queryKey: ['maintenance'] }) // New maintenance tickets might be spawned
    }
  })
}
