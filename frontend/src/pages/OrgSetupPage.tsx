/**
 * pages/OrgSetupPage.tsx — Phase 1 (Dev)
 * Screen 3: Organization Setup — Departments | Categories | Employee tabs.
 * Admin-only. Full CRUD via TanStack Query for live picklist propagation.
 */
import React, { useState, useEffect } from 'react'
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
  type DepartmentOut,
  type DepartmentCreate,
  type CategoryOut,
  type CategoryCreate,
  type EmployeeRole,
  type DeptStatus,
} from '../api/org'

// ── Shared styles ─────────────────────────────────────────────

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-3) var(--space-4)',
  color: 'var(--color-neutral-dark)',
  fontWeight: 600,
  fontSize: 'var(--text-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: '2px solid var(--color-border)',
}

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-4)',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-ink)',
  verticalAlign: 'middle',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--color-border)',
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-ink)',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--color-ink)',
  marginBottom: 'var(--space-1)',
}

const fieldWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  marginBottom: 'var(--space-4)',
}

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

  if (isLoading) return <p style={{ color: 'var(--color-neutral)' }}>Loading…</p>

  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-muted)' }}>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Head</th>
              <th style={thStyle}>Parent Dept</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {depts.length === 0 && (
              <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-neutral)', padding: 'var(--space-8)' }}>
                No departments yet. Click <strong>+ Add</strong> to create one.
              </td></tr>
            )}
            {depts.map((dept, i) => (
              <tr key={dept.id} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-surface-muted)' : 'var(--color-surface)' }}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{dept.name}</td>
                <td style={tdStyle}>{dept.head_name ?? <span style={{ color: 'var(--color-neutral)' }}>—</span>}</td>
                <td style={tdStyle}>{dept.parent_dept_name ?? <span style={{ color: 'var(--color-neutral)' }}>—</span>}</td>
                <td style={tdStyle}>
                  <Badge tone={dept.status === 'active' ? 'success' : 'neutral'}>{dept.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td style={tdStyle}>
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
            <Button variant="ghost" size="md" onClick={closeModal}>Cancel</Button>
            <Button id="save-dept-btn" variant="primary" size="md" disabled={saveMutation.isPending || !formName.trim()} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>}
        >
          {formError && <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-dark)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{formError}</div>}
          <div style={fieldWrap}><label style={labelStyle} htmlFor="dept-name">Name *</label>
            <input id="dept-name" style={inputStyle} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Engineering" /></div>
          <div style={fieldWrap}><label style={labelStyle} htmlFor="dept-head">Department Head</label>
            <select id="dept-head" style={inputStyle} value={formHead} onChange={e => setFormHead(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">— None —</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select></div>
          <div style={fieldWrap}><label style={labelStyle} htmlFor="dept-parent">Parent Department</label>
            <select id="dept-parent" style={inputStyle} value={formParent} onChange={e => setFormParent(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">— None —</option>
              {depts.filter(d => d.id !== modal.editing?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></div>
          <div style={fieldWrap}><label style={labelStyle} htmlFor="dept-status">Status</label>
            <select id="dept-status" style={inputStyle} value={formStatus} onChange={e => setFormStatus(e.target.value as DeptStatus)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select></div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Department" onClose={() => setDeleteTarget(null)} width={400}
          footer={<>
            <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-dept-btn" variant="primary" size="md" style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
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
    setFormName(cat.name); setFormDesc(cat.description ?? ''); setFormError(null)
    setModal({ open: true, editing: cat })
  }
  const closeModal = () => setModal({ open: false, editing: null })

  const saveMutation = useMutation({
    mutationFn: () => {
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

  if (isLoading) return <p style={{ color: 'var(--color-neutral)' }}>Loading…</p>

  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-muted)' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {cats.length === 0 && (
              <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-neutral)', padding: 'var(--space-8)' }}>
                No categories yet. Click <strong>+ Add</strong> to create one.
              </td></tr>
            )}
            {cats.map((cat, i) => (
              <tr key={cat.id} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-surface-muted)' : 'var(--color-surface)' }}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{cat.name}</td>
                <td style={{ ...tdStyle, color: cat.description ? 'var(--color-ink)' : 'var(--color-neutral)' }}>{cat.description ?? '—'}</td>
                <td style={tdStyle}>
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
            <Button variant="ghost" size="md" onClick={closeModal}>Cancel</Button>
            <Button id="save-cat-btn" variant="primary" size="md" disabled={saveMutation.isPending || !formName.trim()} onClick={() => saveMutation.mutate()}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>}
        >
          {formError && <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-dark)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{formError}</div>}
          <div style={fieldWrap}><label style={labelStyle} htmlFor="cat-name">Name *</label>
            <input id="cat-name" style={inputStyle} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Laptops" /></div>
          <div style={fieldWrap}><label style={labelStyle} htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description" /></div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Category" onClose={() => setDeleteTarget(null)} width={400}
          footer={<>
            <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button id="confirm-delete-cat-btn" variant="primary" size="md" style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
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
// EMPLOYEES TAB
// ─────────────────────────────────────────────────────────────

const EmployeesTab: React.FC = () => {
  const qc = useQueryClient()
  const { user } = useAuth()

  const { data: employees = [], isLoading } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })
  const { data: depts = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: EmployeeRole }) => updateEmployeeRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
    onError: (e: Error) => alert(e.message),
  })

  const deptMutation = useMutation({
    mutationFn: ({ id, dept_id }: { id: number; dept_id: number | null }) => updateEmployeeDepartment(id, dept_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
    onError: (e: Error) => alert(e.message),
  })

  if (isLoading) return <p style={{ color: 'var(--color-neutral)' }}>Loading…</p>

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-surface-muted)' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Role</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && (
            <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--color-neutral)', padding: 'var(--space-8)' }}>No employees found.</td></tr>
          )}
          {employees.map((emp, i) => (
            <tr key={emp.id} style={{ backgroundColor: i % 2 === 1 ? 'var(--color-surface-muted)' : 'var(--color-surface)' }}>
              <td style={{ ...tdStyle, fontWeight: 600 }}>
                {emp.name}
                {emp.id === user?.id && (
                  <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 400 }}>(you)</span>
                )}
              </td>
              <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{emp.email}</td>
              <td style={tdStyle}>
                <select id={`emp-dept-${emp.id}`} value={emp.department_id ?? ''} style={{ ...inputStyle, width: 'auto', minWidth: 140 }}
                  onChange={e => deptMutation.mutate({ id: emp.id, dept_id: e.target.value === '' ? null : Number(e.target.value) })}
                  disabled={deptMutation.isPending}>
                  <option value="">— Unassigned —</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </td>
              <td style={tdStyle}>
                <select id={`emp-role-${emp.id}`} value={emp.role} style={{ ...inputStyle, width: 'auto', minWidth: 140 }}
                  onChange={e => roleMutation.mutate({ id: emp.id, role: e.target.value as EmployeeRole })}
                  disabled={roleMutation.isPending || emp.id === user?.id}
                  title={emp.id === user?.id ? 'You cannot change your own role' : undefined}>
                  <option value="employee">Employee</option>
                  <option value="asset_manager">Asset Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

const OrgSetupPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('departments')
  const [addTriggered, setAddTriggered] = useState(false)

  // Redirect non-admin users
  if (user && user.role !== 'admin') {
    navigate('/app/dashboard', { replace: true })
    return null
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'departments', label: 'Departments' },
    { key: 'categories', label: 'Categories' },
    { key: 'employees', label: 'Employee' },
  ]

  const tabStyle = (key: Tab): React.CSSProperties => ({
    padding: 'var(--space-2) var(--space-5)',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    backgroundColor: activeTab === key ? 'var(--color-primary)' : 'transparent',
    color: activeTab === key ? 'white' : 'var(--color-neutral-dark)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)', color: 'var(--color-ink)', margin: 0 }}>
          Organization Setup
        </h1>
        <p style={{ color: 'var(--color-neutral-dark)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Manage departments, asset categories, and employee roles.
        </p>
      </div>

      {/* Tab bar + Add button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)', padding: 'var(--space-3) var(--space-4)',
        gap: 'var(--space-3)', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {tabs.map(tab => (
            <button key={tab.key} id={`tab-${tab.key}`} onClick={() => { setActiveTab(tab.key); setAddTriggered(false) }} style={tabStyle(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab !== 'employees' && (
          <Button id="org-add-btn" variant="primary" size="md" onClick={() => setAddTriggered(true)}>
            + Add
          </Button>
        )}
      </div>

      {/* Tab content */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-card)' }}>
        {activeTab === 'departments' && (
          <DepartmentsTab triggerAdd={addTriggered} onAddHandled={() => setAddTriggered(false)} />
        )}
        {activeTab === 'categories' && (
          <CategoriesTab triggerAdd={addTriggered} onAddHandled={() => setAddTriggered(false)} />
        )}
        {activeTab === 'employees' && <EmployeesTab />}
      </div>
    </div>
  )
}

export default OrgSetupPage
