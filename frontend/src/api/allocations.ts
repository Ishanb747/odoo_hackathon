import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface AllocationResponse {
  id: number
  asset_id: number
  asset_name: string
  asset_tag: string
  employee_id: number
  employee_name: string
  allocated_at: string
  returned_at: string | null
  condition_on_return: string | null
  notes: string | null
}

export interface AllocationCreate {
  asset_id: number
  employee_id: number
  notes?: string
}

export interface AllocationReturn {
  condition_on_return: string
  needs_maintenance?: boolean
}

const getHeaders = () => {
  const token = localStorage.getItem('af_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const useGetAllocations = () => {
  return useQuery<AllocationResponse[]>({
    queryKey: ['allocations'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/allocations`, { headers: getHeaders() })
      if (!res.ok) throw new Error('Failed to fetch allocations')
      return res.json()
    }
  })
}

export const useCreateAllocation = () => {
  const queryClient = useQueryClient()
  return useMutation<AllocationResponse, Error, AllocationCreate>({
    mutationFn: async (data) => {
      const res = await fetch(`${API_BASE}/allocations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to create allocation')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] }) // Assets list also needs refreshing to reflect 'allocated' status
    }
  })
}

export const useReturnAllocation = () => {
  const queryClient = useQueryClient()
  return useMutation<AllocationResponse, Error, { id: number; data: AllocationReturn }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`${API_BASE}/allocations/${id}/return`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to return allocation')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    }
  })
}
