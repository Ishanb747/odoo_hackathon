import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getEmployees,
  updateEmployeeRole,
  updateEmployeeDepartment,
  deleteEmployee,
  type DepartmentOut,
  type DepartmentCreate,
  type CategoryOut,
  type CategoryCreate,
  type EmployeeRole,
  type DeptStatus,
} from '../api/org'

// ── Shared inline styles ───────────────────────────────────────
const iconBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 'var(--space-1) var(--space-2)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-base)',
  transition: 'background var(--transition-fast)',
  lineHeight: 1,
}

type Tab = 'departments' | 'categories' | 'employees'

// ─────────────────────────────────────────────────────────────
// DEPARTMENTS TAB
// ─────────────────────────────────────────────────────────────

interface DeptModalState { open: boolean; editing: DepartmentOut | null }

const DepartmentsTab: React.FC<{ triggerAdd: boolean; onAddHandled: () => void }> = ({ triggerAdd, onAddHandled }) => {
  const qc = useQueryClient()
  const { useEffect } = React
  const [modal, setModal] = useState<DeptModalState>({ open: false, editing: null })
  const [deleteTarget, setDeleteTarget] = useState<DepartmentOut | null>(null)
  const [formName, setFormName] = useState('')
  const [formStatus, setFormStatus] = useState<DeptStatus>('active')
  const [formHead, setFormHead] = useState<number | ''>('')
  const [formParent, setFormParent] = useState<number | ''>('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data: depts = [], isLoading } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })

  useEffect(() => {
    if (triggerAdd) {
      setFormName(''); setFormStatus('active'); setFormHead(''); setFormParent(''); setFormError(null)
      setModal({ open: true, editing: null })
      onAddHandled()
    }
  }, [triggerAdd, onAddHandled])

  const openEdit = (dept: DepartmentOut) => {
    setFormName(dept.name); setFormStatus(dept.status)
    setFormHead(dept.head_employee_id ?? ''); setFormParent(dept.parent_dept_id ?? '')
    setFormError(null); setModal({ open: true, editing: dept })
  }
  const closeModal = () => setModal({ open: false, editing: null })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: DepartmentCreate = {
        name: formName.trim(), status: formStatus,
        head_employee_id: formHead !== '' ? Number(formHead) : null,
        parent_dept_id: formParent !== '' ? Number(formParent) : null,
      }
      return modal.editing ? updateDepartment(modal.editing.id, payload) : createDepartment(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); closeModal() },
    onError: (e: Error) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setDeleteTarget(null) },
    onError: (e: Error) => alert(e.message),
  })

  if (isLoading) return <p style={{ color: 'var(--color-muted)' }}>Loading…</p>

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="af-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Head</th>
              <th>Parent Dept</th>
              <th>Status</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {depts.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 'var(--space-8)' }}>
                No departments yet. Click <strong>+ Add</strong> to create one.
              </td></tr>
            )}
            {depts.map(dept => (
              <tr key={dept.id}>
                <td style={{ fontWeight: 600 }}>{dept.name}</td>
                <td style={{ color: 'var(--color-muted)' }}>{dept.head_name ?? '—'}</td>
                <td style={{ color: 'var(--color-muted)' }}>{dept.parent_dept_name ?? '—'}</td>
                <td>
                  <Badge tone={dept.status === 'active' ? 'success' : 'neutral'} dot>
                    {dept.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <span style={{ display: 'flex', gap: 4 }}>
                    <button id={`edit-dept-${dept.id}`} style={{ ...iconBtn, color: 'var(--color-primary)' }} onClick={() => openEdit(dept)} title="Edit"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>✏️</button>
                    <button id={`delete-dept-${dept.id}`} style={{ ...iconBtn, color: 'var(--color-danger)' }} onClick={() => setDeleteTarget(dept)} title="Delete"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-light)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🗑️</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <Modal title={modal.editing ? 'Edit Department' : 'Add Department'} onClose={closeModal}
          footer={<>
            <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
            <Button id="save-dept-btn" variant="primary" size="sm" disabled={saveMutation.isPending || !formName.trim()} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>}
        >
          {formError && <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-dark)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{formError}</div>}
          <div className="form-field">
            <label className="form-label" htmlFor="dept-name">Name *</label>
            <input id="dept-name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Engineering" />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="dept-head">Department Head</label>
            <select id="dept-head" value={formHead} onChange={e => setFormHead(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">— None —</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="dept-parent">Parent Department</label>
            <select id="dept-parent" value={formParent} onChange={e => setFormParent(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">— None —</option>
              {depts.filter(d => d.id !== modal.editing?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="dept-status">Status</label>
            <select id="dept-status" value={formStatus} onChange={e => setFormStatus(e.target.value as DeptStatus)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Department" onClose={() => setDeleteTarget(null)} width={400}
          footer={<>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-dept-btn" variant="danger" size="sm" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </>}
        >
          <p style={{ color: 'var(--color-ink)', fontSize: 'var(--text-base)' }}>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// CATEGORIES TAB
// ─────────────────────────────────────────────────────────────

interface CatModalState { open: boolean; editing: CategoryOut | null }

const CategoriesTab: React.FC<{ triggerAdd: boolean; onAddHandled: () => void }> = ({ triggerAdd, onAddHandled }) => {
  const qc = useQueryClient()
  const { useEffect } = React
  const [modal, setModal] = useState<CatModalState>({ open: false, editing: null })
  const [deleteTarget, setDeleteTarget] = useState<CategoryOut | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data: cats = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  useEffect(() => {
    if (triggerAdd) {
      setFormName(''); setFormDesc(''); setFormError(null)
      setModal({ open: true, editing: null })
      onAddHandled()
    }
  }, [triggerAdd, onAddHandled])

  const openEdit = (cat: CategoryOut) => {
    setFormName(cat.name); setFormDesc(cat.description ?? '')
    setFormError(null); setModal({ open: true, editing: cat })
  }
  const closeModal = () => setModal({ open: false, editing: null })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CategoryCreate = { name: formName.trim(), description: formDesc.trim() || null }
      return modal.editing ? updateCategory(modal.editing.id, payload) : createCategory(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); closeModal() },
    onError: (e: Error) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null) },
    onError: (e: Error) => alert(e.message),
  })

  if (isLoading) return <p style={{ color: 'var(--color-muted)' }}>Loading…</p>

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="af-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {cats.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 'var(--space-8)' }}>
                No categories yet.
              </td></tr>
            )}
            {cats.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td style={{ color: 'var(--color-muted)' }}>{cat.description ?? '—'}</td>
                <td>
                  <span style={{ display: 'flex', gap: 4 }}>
                    <button id={`edit-cat-${cat.id}`} style={{ ...iconBtn, color: 'var(--color-primary)' }} onClick={() => openEdit(cat)} title="Edit"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-light)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>✏️</button>
                    <button id={`delete-cat-${cat.id}`} style={{ ...iconBtn, color: 'var(--color-danger)' }} onClick={() => setDeleteTarget(cat)} title="Delete"
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-light)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🗑️</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <Modal title={modal.editing ? 'Edit Category' : 'Add Category'} onClose={closeModal}
          footer={<>
            <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
            <Button id="save-cat-btn" variant="primary" size="sm" disabled={saveMutation.isPending || !formName.trim()} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>}
        >
          {formError && <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-dark)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{formError}</div>}
          <div className="form-field">
            <label className="form-label" htmlFor="cat-name">Name *</label>
            <input id="cat-name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Laptops" />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional" />
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Category" onClose={() => setDeleteTarget(null)} width={400}
          footer={<>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-cat-btn" variant="danger" size="sm" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </>}
        >
          <p style={{ color: 'var(--color-ink)', fontSize: 'var(--text-base)' }}>
            Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// EMPLOYEES TAB
// ─────────────────────────────────────────────────────────────

const EmployeesTab: React.FC = () => {
  const qc = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const { data: employees = [], isLoading } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })
  const { data: depts = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: EmployeeRole }) => updateEmployeeRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
    onError: (e: Error) => alert(e.message),
  })

  const deptMutation = useMutation({
    mutationFn: ({ id, deptId }: { id: number; deptId: number | null }) => updateEmployeeDepartment(id, deptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
    onError: (e: Error) => alert(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setDeleteTarget(null) },
    onError: (e: Error) => alert(e.message),
  })

  if (isLoading) return <p style={{ color: 'var(--color-muted)' }}>Loading…</p>

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="af-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 'var(--space-8)' }}>
                No employees registered yet.
              </td></tr>
            )}
            {employees.map(emp => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 600 }}>{emp.name}</td>
                <td style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{emp.email}</td>
                <td>
                  <select
                    id={`role-select-${emp.id}`}
                    value={emp.role}
                    onChange={e => roleMutation.mutate({ id: emp.id, role: e.target.value as EmployeeRole })}
                    style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-1) var(--space-2)', width: 'auto' }}
                  >
                    <option value="employee">Employee</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </td>
                <td>
                  <select
                    id={`dept-select-${emp.id}`}
                    value={emp.department_id ?? ''}
                    onChange={e => deptMutation.mutate({ id: emp.id, deptId: e.target.value ? Number(e.target.value) : null })}
                    style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-1) var(--space-2)', width: 'auto' }}
                  >
                    <option value="">— None —</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </td>
                <td>
                  <button id={`delete-emp-${emp.id}`} style={{ ...iconBtn, color: 'var(--color-danger)' }} onClick={() => setDeleteTarget({ id: emp.id, name: emp.name })} title="Remove"
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-light)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <Modal title="Remove Employee" onClose={() => setDeleteTarget(null)} width={400}
          footer={<>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-emp-btn" variant="danger" size="sm" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
              {deleteMutation.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </>}
        >
          <p style={{ color: 'var(--color-ink)', fontSize: 'var(--text-base)' }}>
            Remove <strong>{deleteTarget.name}</strong> from the system?
          </p>
        </Modal>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

const OrgSetupPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('departments')
  const [triggerAdd, setTriggerAdd] = useState(false)

  React.useEffect(() => {
    if (user && user.role === 'employee') navigate('/app/dashboard', { replace: true })
  }, [user, navigate])

  const tabLabels: { id: Tab; label: string }[] = [
    { id: 'departments', label: 'Departments' },
    { id: 'categories', label: 'Categories' },
    { id: 'employees', label: 'Employees' },
  ]

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organization Setup</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Manage departments, asset categories, and team members.
          </p>
        </div>
        <Button size="sm" onClick={() => setTriggerAdd(true)}>+ Add</Button>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)' }}>
        {tabLabels.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: 'var(--space-2) var(--space-5)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'color var(--transition-fast)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {activeTab === 'departments' && (
          <DepartmentsTab triggerAdd={triggerAdd} onAddHandled={() => setTriggerAdd(false)} />
        )}
        {activeTab === 'categories' && (
          <CategoriesTab triggerAdd={triggerAdd} onAddHandled={() => setTriggerAdd(false)} />
        )}
        {activeTab === 'employees' && <EmployeesTab />}
      </div>
    </div>
  )
}

export default OrgSetupPage
