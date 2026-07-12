import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { getAssets, createAsset, AssetStatus, AssetCreate } from '../api/assets'
import { getCategories, getDepartments } from '../api/org'
import { useAuth } from '../context/AuthContext'

function statusToTone(status: AssetStatus): 'success' | 'primary' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'available': return 'success'
    case 'allocated': return 'primary'
    case 'maintenance': return 'warning'
    case 'lost': return 'danger'
    default: return 'neutral'
  }
}

const AssetsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canRegister = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'asset_manager'

  // Filter state
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | ''>('')
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('')

  // Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<AssetCreate>>({
    tag: '',
    name: '',
    serial_number: '',
    category_id: null,
    status: 'available',
    location: '',
    department_id: null,
    notes: '',
  })

  // Queries
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets', { search, selectedCategory, selectedStatus, selectedDepartment }],
    queryFn: () => getAssets({
      search: search || undefined,
      category_id: selectedCategory === '' ? undefined : selectedCategory,
      status: selectedStatus === '' ? undefined : selectedStatus,
      department_id: selectedDepartment === '' ? undefined : selectedDepartment,
    })
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  })

  // Mutations
  const registerMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setIsRegisterOpen(false)
      setFormData({
        tag: '',
        name: '',
        serial_number: '',
        category_id: null,
        status: 'available',
        location: '',
        department_id: null,
        notes: '',
      })
    }
  })

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tag || !formData.name) return
    registerMutation.mutate(formData as AssetCreate)
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header">
        <h1 className="page-title">Asset Directory</h1>
        {canRegister && (
          <Button onClick={() => setIsRegisterOpen(true)} size="sm">+ Register Asset</Button>
        )}
      </div>

      <Card padding="sm" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by tag, serial, or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 220px', minWidth: 0 }}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
            style={{ flex: '0 0 140px' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as AssetStatus | '')}
            style={{ flex: '0 0 130px' }}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="maintenance">Maintenance</option>
            <option value="lost">Lost</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value ? Number(e.target.value) : '')}
            style={{ flex: '0 0 150px' }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </Card>

      <Card padding="none" style={{ overflowX: 'auto' }}>
        <table className="af-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-muted)' }}>Loading assets…</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-muted)' }}>No assets found.</td></tr>
            ) : (
              assets.map(asset => (
                <tr key={asset.id}>
                  <td><span className="asset-tag">{asset.tag}</span></td>
                  <td style={{ fontWeight: 500 }}>{asset.name}</td>
                  <td style={{ color: 'var(--color-muted)' }}>{asset.category_name || '—'}</td>
                  <td>
                    <Badge tone={statusToTone(asset.status)} dot>
                      {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--color-muted)' }}>{asset.location || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {isRegisterOpen && (
        <Modal 
          title="Register New Asset" 
          onClose={() => setIsRegisterOpen(false)}
          width={600}
        >
          <form id="register-asset-form" onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {[
                { label: 'Tag *', key: 'tag', type: 'text', required: true },
                { label: 'Name *', key: 'name', type: 'text', required: true },
                { label: 'Serial Number', key: 'serial_number', type: 'text' },
                { label: 'Location', key: 'location', type: 'text' },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="form-field">
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={(formData as any)[key] || ''}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="form-field">
                <label className="form-label">Category</label>
                <select
                  value={formData.category_id || ''}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Department</label>
                <select
                  value={formData.department_id || ''}
                  onChange={e => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">None</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                >
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
            {registerMutation.isError && (
              <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
                {registerMutation.error.message}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Button variant="ghost" type="button" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
              <Button type="submit" loading={registerMutation.isPending}>Register</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default AssetsPage
