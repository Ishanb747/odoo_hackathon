import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  useGetMaintenanceRequests,
  useCreateMaintenanceRequest,
  useUpdateMaintenanceStatus,
  MaintenanceStatus
} from '../api/maintenance'
import { useQuery } from '@tanstack/react-query'
import { getAssets, AssetOut } from '../api/assets'
import Badge from '../components/Badge'
import Button from '../components/Button'

const COLUMNS: { id: MaintenanceStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'technician_assigned', label: 'Technician Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
]

export const MaintenancePage: React.FC = () => {
  const { data: requests = [] } = useGetMaintenanceRequests()
  const { data: assets = [] } = useQuery<AssetOut[]>({ queryKey: ['assets'], queryFn: () => getAssets() })

  const createReq = useCreateMaintenanceRequest()
  const updateStatus = useUpdateMaintenanceStatus()

  const [showForm, setShowForm] = useState(false)
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [issueDesc, setIssueDesc] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetId || !issueDesc.trim()) return
    createReq.mutate({ asset_id: parseInt(selectedAssetId), issue_description: issueDesc }, {
      onSuccess: () => {
        setShowForm(false)
        setSelectedAssetId('')
        setIssueDesc('')
      },
      onError: (err: any) => alert(err.message)
    })
  }

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, reqId: number) => {
    e.dataTransfer.setData('text/plain', reqId.toString())
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = 'var(--color-surface)'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, statusId: MaintenanceStatus) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = 'var(--color-surface)'

    const reqIdStr = e.dataTransfer.getData('text/plain')
    if (!reqIdStr) return
    const reqId = parseInt(reqIdStr)

    const req = requests.find(r => r.id === reqId)
    if (req && req.status !== statusId) {
      updateStatus.mutate({ id: reqId, data: { status: statusId } }, {
        onError: (err: any) => alert('Failed to move: ' + err.message)
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-6)' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Workflow</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
            Drag and drop tickets to update their status.
          </p>
        </div>
        <Button size="sm" variant={showForm ? 'ghost' : 'primary'} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-5) var(--space-6)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="form-field" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Asset</label>
            <select value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} required>
              <option value="">Select Asset…</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
            </select>
          </div>
          <div className="form-field" style={{ flex: '2 1 300px' }}>
            <label className="form-label">Issue Description</label>
            <input type="text" value={issueDesc} onChange={e => setIssueDesc(e.target.value)} required placeholder="e.g. Projector bulb not turning on" />
          </div>
          <Button type="submit" size="sm" disabled={createReq.isPending}>
            {createReq.isPending ? 'Submitting…' : 'Submit'}
          </Button>
        </form>
      )}

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', flex: 1, paddingBottom: 'var(--space-4)' }}>
        {COLUMNS.map(col => {
          const colRequests = requests.filter(r => r.status === col.id)

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                flex: '0 0 280px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 400,
                transition: 'background-color var(--transition-base)',
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', padding: '0 var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col.label}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface-raised)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                  {colRequests.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1, overflowY: 'auto' }}>
                {colRequests.map(req => (
                  <div
                    key={req.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, req.id)}
                    onDragEnd={handleDragEnd}
                    style={{
                      backgroundColor: 'var(--color-canvas)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      cursor: 'grab',
                      transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span className="asset-tag" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        {req.asset_tag}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-1)' }}>
                      {req.asset_name}
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', margin: 0, lineHeight: 1.45 }}>
                      {req.issue_description}
                    </p>

                    {req.technician_name && (
                      <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px dashed var(--color-border)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block' }} />
                        Tech: {req.technician_name}
                      </div>
                    )}
                    {req.status === 'resolved' && req.resolved_at && (
                      <div style={{ marginTop: 'var(--space-3)' }}>
                        <Badge tone="success" dot>Resolved</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MaintenancePage
