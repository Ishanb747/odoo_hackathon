/**
 * api/org.ts — Phase 1 (Dev)
 * Typed fetch helpers for Organization Setup endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
import { getStoredToken } from './auth'

// ── Types ─────────────────────────────────────────────────────

export type DeptStatus = 'active' | 'inactive'
export type EmployeeRole = 'employee' | 'asset_manager' | 'admin' | 'superadmin'

export interface DepartmentOut {
  id: number
  name: string
  head_employee_id: number | null
  head_name: string | null
  parent_dept_id: number | null
  parent_dept_name: string | null
  status: DeptStatus
}

export interface DepartmentCreate {
  name: string
  head_employee_id?: number | null
  parent_dept_id?: number | null
  status?: DeptStatus
}

export interface DepartmentUpdate {
  name?: string
  head_employee_id?: number | null
  parent_dept_id?: number | null
  status?: DeptStatus
}

export interface CategoryOut {
  id: number
  name: string
  description: string | null
}

export interface CategoryCreate {
  name: string
  description?: string | null
}

export interface CategoryUpdate {
  name?: string
  description?: string | null
}

export interface EmployeeOut {
  id: number
  name: string
  email: string
  role: EmployeeRole
  department_id: number | null
  department_name: string | null
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

// ── Departments ───────────────────────────────────────────────

export const getDepartments = (): Promise<DepartmentOut[]> =>
  authFetch('/org/departments')

export const createDepartment = (body: DepartmentCreate): Promise<DepartmentOut> =>
  authFetch('/org/departments', { method: 'POST', body: JSON.stringify(body) })

export const updateDepartment = (id: number, body: DepartmentUpdate): Promise<DepartmentOut> =>
  authFetch(`/org/departments/${id}`, { method: 'PATCH', body: JSON.stringify(body) })

export const deleteDepartment = (id: number): Promise<void> =>
  authFetch(`/org/departments/${id}`, { method: 'DELETE' })

// ── Categories ────────────────────────────────────────────────

export const getCategories = (): Promise<CategoryOut[]> =>
  authFetch('/org/categories')

export const createCategory = (body: CategoryCreate): Promise<CategoryOut> =>
  authFetch('/org/categories', { method: 'POST', body: JSON.stringify(body) })

export const updateCategory = (id: number, body: CategoryUpdate): Promise<CategoryOut> =>
  authFetch(`/org/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) })

export const deleteCategory = (id: number): Promise<void> =>
  authFetch(`/org/categories/${id}`, { method: 'DELETE' })

// ── Employees ─────────────────────────────────────────────────

export const getEmployees = (): Promise<EmployeeOut[]> =>
  authFetch('/org/employees')

export const updateEmployeeRole = (id: number, role: EmployeeRole): Promise<EmployeeOut> =>
  authFetch(`/org/employees/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })

export const updateEmployeeDepartment = (
  id: number,
  department_id: number | null,
): Promise<EmployeeOut> =>
  authFetch(`/org/employees/${id}/department`, {
    method: 'PATCH',
    body: JSON.stringify({ department_id }),
  })

export const deleteEmployee = (id: number): Promise<void> =>
  authFetch(`/org/employees/${id}`, { method: 'DELETE' })
