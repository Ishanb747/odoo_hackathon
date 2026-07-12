import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStoredToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type MaintenanceStatus = 'pending' | 'approved' | 'technician_assigned' | 'in_progress' | 'resolved'

export interface MaintenanceResponse {
  id: number
  asset_id: number
  asset_name: string
  asset_tag: string
  reported_by: number
  reporter_name: string
  issue_description: string
  status: MaintenanceStatus
  technician_name: string | null
  notes: string | null
  created_at: string
  resolved_at: string | null
}

export interface MaintenanceCreate {
  asset_id: number
  issue_description: string
  notes?: string
}

export interface MaintenanceStatusUpdate {
  status: MaintenanceStatus
  technician_name?: string
  notes?: string
}

const getHeaders = () => {
  const token = getStoredToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useGetMaintenanceRequests = () => {
  return useQuery<MaintenanceResponse[]>({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/maintenance`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to fetch maintenance requests')
      return res.json()
    }
  })
}

export const useCreateMaintenanceRequest = () => {
  const queryClient = useQueryClient()
  return useMutation<MaintenanceResponse, Error, MaintenanceCreate>({
    mutationFn: async (data) => {
      const res = await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to create request')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    }
  })
}

export const useUpdateMaintenanceStatus = () => {
  const queryClient = useQueryClient()
  return useMutation<MaintenanceResponse, Error, { id: number; data: MaintenanceStatusUpdate }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${API_BASE}/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to update status')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] }) // Re-fetch assets in case status changed
    }
  })
}
