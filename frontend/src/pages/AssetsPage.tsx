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
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-ink)', margin: 0 }}>
          Asset Directory
        </h1>
        {canRegister && (
          <Button onClick={() => setIsRegisterOpen(true)}>+ Register Asset</Button>
        )}
      </div>

      <Card padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by tag, serial, or name..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              flex: '1 1 250px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
            }}
          />
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value as AssetStatus | '')}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
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
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </Card>

      <Card padding="none" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-neutral-light)' }}>
              <th style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-ink)' }}>Tag</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-ink)' }}>Name</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-ink)' }}>Category</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-ink)' }}>Status</th>
              <th style={{ padding: 'var(--space-4)', fontWeight: 600, color: 'var(--color-ink)' }}>Location</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} style={{ padding: 'var(--space-4)', textAlign: 'center' }}>Loading...</td></tr>
            ) : assets.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 'var(--space-4)', textAlign: 'center' }}>No assets found.</td></tr>
            ) : (
              assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-mono)' }}>{asset.tag}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{asset.name}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{asset.category_name || '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <Badge tone={statusToTone(asset.status)}>
                      {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                    </Badge>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{asset.location || '—'}</td>
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
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tag *</label>
                <input 
                  required
                  value={formData.tag} 
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Name *</label>
                <input 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Serial Number</label>
                <input 
                  value={formData.serial_number || ''} 
                  onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Category</label>
                <select 
                  value={formData.category_id || ''}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                >
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Department</label>
                <select 
                  value={formData.department_id || ''}
                  onChange={e => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : null })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                >
                  <option value="">None</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                >
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>Location</label>
                <input 
                  value={formData.location || ''} 
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
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
