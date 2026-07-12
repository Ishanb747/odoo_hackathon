import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStoredToken } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type LogType = 'alert' | 'approval' | 'booking' | 'transfer' | 'audit' | 'maintenance'

export interface ActivityLogResponse {
  id: number
  type: LogType
  message: string
  employee_id: number | null
  read: boolean
  created_at: string
}

const getHeaders = () => {
  const token = getStoredToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useGetNotifications = (typeFilter?: LogType) => {
  return useQuery<ActivityLogResponse[]>({
    queryKey: ['notifications', typeFilter],
    queryFn: async () => {
      const url = new URL(`${API_BASE}/notifications`)
      if (typeFilter) url.searchParams.append('type_filter', typeFilter)
      
      const res = await fetch(url.toString(), { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to fetch notifications')
      return res.json()
    }
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation<ActivityLogResponse, Error, number>({
    mutationFn: async (logId) => {
      const res = await fetch(`${API_BASE}/notifications/${logId}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to mark as read')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation<any, Error, void>({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders(),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to mark all as read')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
