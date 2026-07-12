/**
 * api/auth.ts — Phase 1 (Dev)
 * Typed fetch helpers for authentication endpoints.
 * Token is stored in localStorage under 'af_token'.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const TOKEN_KEY = 'af_token'

// ── Types ─────────────────────────────────────────────────────

export type EmployeeRole = 'employee' | 'asset_manager' | 'admin' | 'superadmin'

export interface UserOut {
  id: number
  name: string
  email: string
  role: EmployeeRole
  department_id: number | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: UserOut
}

// ── Helpers ───────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ── Auth API ──────────────────────────────────────────────────

export async function apiSignup(
  name: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function apiFetchMe(token: string): Promise<UserOut> {
  return apiFetch<UserOut>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
