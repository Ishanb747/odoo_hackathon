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

  // New Request Form State
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
    // Optional styling during drag
    e.currentTarget.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() // Required to allow dropping
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.style.backgroundColor = 'var(--color-canvas)'
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
    
    // Find request to avoid redundant updates
    const req = requests.find(r => r.id === reqId)
    if (req && req.status !== statusId) {
      updateStatus.mutate({ id: reqId, data: { status: statusId } }, {
        onError: (err: any) => alert('Failed to move: ' + err.message)
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-6)', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>
            Maintenance Workflow
          </h1>
          <p style={{ margin: 0, color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>
            Drag and drop tickets to update their status. Approving a ticket automatically flags the asset for maintenance.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.2)' }}
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* New Request Form (inline overlay style) */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>Asset</label>
            <select value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <option value="">Select Asset...</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>Issue Description</label>
            <input type="text" value={issueDesc} onChange={e => setIssueDesc(e.target.value)} required placeholder="e.g. Projector bulb not turning on" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
          </div>
          <button type="submit" disabled={createReq.isPending} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-accent)', color: 'var(--color-ink)', fontWeight: 600, cursor: 'pointer' }}>
            {createReq.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', overflowX: 'auto', flex: 1, paddingBottom: 'var(--space-4)' }}>
        {COLUMNS.map(col => {
          const colRequests = requests.filter(r => r.status === col.id)
          
          return (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ flex: '0 0 320px', backgroundColor: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px', transition: 'background-color 0.2s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', padding: '0 var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {col.label}
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral)', backgroundColor: 'var(--color-canvas)', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {colRequests.length}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', flex: 1, overflowY: 'auto' }}>
                {colRequests.map(req => (
                  <div 
                    key={req.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, req.id)}
                    onDragEnd={handleDragEnd}
                    style={{ backgroundColor: 'var(--color-canvas)', padding: 'var(--space-5)', borderRadius: '16px', border: '1px solid var(--color-border)', cursor: 'grab', transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {req.asset_tag}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-dark)' }}>
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                      {req.asset_name}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)', margin: 0, lineHeight: 1.4 }}>
                      {req.issue_description}
                    </p>
                    
                    {/* Extra context for later columns */}
                    {req.technician_name && (
                      <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px dashed var(--color-border)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                        Tech: {req.technician_name}
                      </div>
                    )}
                    {req.status === 'resolved' && req.resolved_at && (
                      <div style={{ marginTop: 'var(--space-4)' }}>
                        <Badge tone="success">Resolved</Badge>
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
