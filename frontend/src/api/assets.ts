/**
 * api/assets.ts — Phase 2 (Dev)
 * Typed fetch helpers for Asset Registry endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
import { getStoredToken } from './auth'

// ── Types ─────────────────────────────────────────────────────

export type AssetStatus = 'available' | 'allocated' | 'maintenance' | 'lost'

export interface AssetOut {
  id: number
  tag: string
  name: string
  serial_number: string | null
  category_id: number | null
  category_name: string | null
  status: AssetStatus
  location: string | null
  department_id: number | null
  department_name: string | null
  acquisition_date: string | null
  notes: string | null
}

export interface AssetCreate {
  tag: string
  name: string
  serial_number?: string | null
  category_id?: number | null
  status?: AssetStatus
  location?: string | null
  department_id?: number | null
  acquisition_date?: string | null
  notes?: string | null
}

export interface GetAssetsParams {
  search?: string
  category_id?: number
  department_id?: number
  status?: AssetStatus
}

// ── Helpers ───────────────────────────────────────────────────

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

// ── Assets API ────────────────────────────────────────────────

export const getAssets = (params?: GetAssetsParams): Promise<AssetOut[]> => {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.append('search', params.search)
  if (params?.category_id !== undefined) searchParams.append('category_id', params.category_id.toString())
  if (params?.department_id !== undefined) searchParams.append('department_id', params.department_id.toString())
  if (params?.status) searchParams.append('status', params.status)

  const query = searchParams.toString()
  const path = query ? `/assets?${query}` : '/assets'
  return authFetch(path)
}

export const createAsset = (body: AssetCreate): Promise<AssetOut> =>
  authFetch('/assets', { method: 'POST', body: JSON.stringify(body) })
