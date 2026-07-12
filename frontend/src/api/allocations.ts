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

export interface AllocationHistoryOut {
  id: number
  allocated_to: string
  department: string | null
  allocated_at: string
  returned_at: string | null
  notes: string | null
  condition_on_return: string | null
}

export interface AllocationStateOut {
  asset_id: number
  is_allocated: boolean
  current_allocation: AllocationHistoryOut | null
  history: AllocationHistoryOut[]
}

export interface AllocationCreate {
  asset_id: number
  employee_id: number
  notes?: string | null
}

export interface TransferRequestCreate {
  asset_id: number
  to_employee_id: number
  reason?: string | null
}

export interface AllocationOut {
  id: number
  asset_id: number
  employee_id: number
  allocated_at: string
  notes: string | null
}

export interface TransferRequestOut {
  id: number
  asset_id: number
  from_employee_id: number
  to_employee_id: number
  status: string
  reason: string | null
  created_at: string
}

// ── API Functions ────────────────────────────────────────────────

export const getAllocationState = (assetId: number): Promise<AllocationStateOut> =>
  authFetch(`/allocations/${assetId}`)

export const allocateAsset = (body: AllocationCreate): Promise<AllocationOut> =>
  authFetch('/allocations', { method: 'POST', body: JSON.stringify(body) })

export const requestTransfer = (body: TransferRequestCreate): Promise<TransferRequestOut> =>
  authFetch('/allocations/transfer', { method: 'POST', body: JSON.stringify(body) })

// ── Compatibility for Phase 4 (Bookings) ─────────────────────────
import { useQuery, useMutation } from '@tanstack/react-query'

export const useGetAllocations = () => {
  return useQuery({
    queryKey: ['allocations_all_mock'],
    queryFn: () => Promise.resolve([])
  })
}

export const useCreateAllocation = () => {
  return useMutation({
    mutationFn: (_body: any) => Promise.resolve({})
  })
}

export const useReturnAllocation = () => {
  return useMutation({
    mutationFn: (_body: any) => Promise.resolve({})
  })
}
