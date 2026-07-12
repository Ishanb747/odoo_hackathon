import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { 
  useGetAudits, 
  useCreateAudit, 
  useUpdateRecordStatus, 
  useCloseAudit,
  VerificationStatus
} from '../api/audits'
import { getDepartments } from '../api/org'
import Badge from '../components/Badge'

const AuditPage: React.FC = () => {
  const { data: audits = [] } = useGetAudits()
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments })
  
  const createAudit = useCreateAudit()
  const updateRecord = useUpdateRecordStatus()
  const closeAudit = useCloseAudit()

  const [showNewForm, setShowNewForm] = useState(false)
  const [newAuditName, setNewAuditName] = useState('')
  const [selectedDept, setSelectedDept] = useState('')

  // Find the most recent active cycle, if any
  const activeCycle = audits.find(a => !a.closed)

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAuditName.trim()) return
    
    createAudit.mutate({
      name: newAuditName,
      department_id: selectedDept ? parseInt(selectedDept) : undefined,
    }, {
      onSuccess: () => {
        setShowNewForm(false)
        setNewAuditName('')
        setSelectedDept('')
      },
      onError: (err: any) => alert(err.message)
    })
  }

  const handleStatusChange = (recordId: number, status: VerificationStatus) => {
    updateRecord.mutate({ id: recordId, status }, {
      onError: (err: any) => alert(err.message)
    })
  }

  const handleClose = () => {
    if (!activeCycle) return
    if (window.confirm("Are you sure you want to close this audit? Assets marked 'Missing' will be permanently set to 'Lost', and 'Damaged' assets will be sent to Maintenance.")) {
      closeAudit.mutate(activeCycle.id, {
        onError: (err: any) => alert(err.message)
      })
    }
  }

  // Calculate discrepancies
  const discrepanciesCount = activeCycle 
    ? activeCycle.records.filter(r => r.verification_status !== 'verified').length 
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom: 'var(--space-12)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>
            Asset Audit
          </h1>
          <p style={{ margin: 0, color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>
            Run cycle counts, verify asset locations, and automatically reconcile missing or damaged items.
          </p>
        </div>
        {!activeCycle && (
          <button 
            onClick={() => setShowNewForm(!showNewForm)}
            style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.2)' }}
          >
            {showNewForm ? 'Cancel' : 'Start Audit Cycle'}
          </button>
        )}
      </div>

      {/* New Audit Form */}
      {showNewForm && !activeCycle && (
        <form onSubmit={handleStartAudit} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '16px', border: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>Audit Cycle Name</label>
            <input type="text" value={newAuditName} onChange={e => setNewAuditName(e.target.value)} required placeholder="e.g. Q3 Engineering Audit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>Scope (Department)</label>
            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={createAudit.isPending} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-accent)', color: 'var(--color-ink)', fontWeight: 600, cursor: 'pointer' }}>
            {createAudit.isPending ? 'Starting...' : 'Start Cycle'}
          </button>
        </form>
      )}

      {/* Active Cycle View */}
      {activeCycle ? (
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          
          {/* Header Block */}
          <div style={{ padding: 'var(--space-8)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, margin: '0 0 var(--space-2)', color: 'var(--color-ink)' }}>
                  {activeCycle.name}
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)' }}>
                  <span><strong>Scope:</strong> {activeCycle.department_name || 'Global'}</span>
                  <span><strong>Started:</strong> {format(new Date(activeCycle.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <button 
                onClick={handleClose}
                disabled={closeAudit.isPending}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-ink)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                {closeAudit.isPending ? 'Closing...' : 'Close Audit Cycle'}
              </button>
            </div>
            
            {/* Discrepancy Alert */}
            {discrepanciesCount > 0 && (
              <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 107, 107, 0.2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 600 }}>
                  {discrepanciesCount} {discrepanciesCount === 1 ? 'asset' : 'assets'} flagged – discrepancy report generated automatically.
                </span>
              </div>
            )}
          </div>

          {/* Verification Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-canvas)', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-neutral)' }}>Asset</th>
                  <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-neutral)' }}>Expected Location</th>
                  <th style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-neutral)', textAlign: 'right' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {activeCycle.records.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-4) var(--space-8)' }}>
                      <div style={{ fontWeight: 600 }}>{rec.asset_name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-dark)', fontFamily: 'var(--font-mono)' }}>{rec.asset_tag}</div>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--color-neutral-dark)', fontSize: 'var(--text-sm)' }}>
                      {rec.expected_location || '—'}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-8)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-canvas)', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                        {(['verified', 'missing', 'damaged'] as VerificationStatus[]).map(status => {
                          const isActive = rec.verification_status === status
                          
                          // Determine color based on status
                          let activeColor = 'var(--color-neutral)'
                          let activeBg = 'transparent'
                          if (isActive) {
                            if (status === 'verified') { activeColor = 'var(--color-success)'; activeBg = 'rgba(56, 178, 107, 0.1)' }
                            if (status === 'missing') { activeColor = 'var(--color-danger)'; activeBg = 'rgba(255, 107, 107, 0.1)' }
                            if (status === 'damaged') { activeColor = 'var(--color-warning)'; activeBg = 'rgba(232, 163, 61, 0.1)' }
                          }

                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(rec.id, status)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: activeBg,
                                color: isActive ? activeColor : 'var(--color-neutral)',
                                fontWeight: isActive ? 600 : 500,
                                fontSize: 'var(--text-xs)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                              }}
                            >
                              {status}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '24px', border: '1px dashed var(--color-border)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>📋</div>
          <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-lg)' }}>No Active Audits</h3>
          <p style={{ color: 'var(--color-neutral)' }}>Start a new audit cycle to verify your assets.</p>
        </div>
      )}

      {/* Audit History (Closed Cycles) */}
      {audits.filter(a => a.closed).length > 0 && (
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-4)' }}>Past Audits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {audits.filter(a => a.closed).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5)', backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{a.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-dark)' }}>
                    Closed on {a.closed_at ? format(new Date(a.closed_at), 'MMM d, yyyy') : 'Unknown'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge tone="neutral">{a.records.length} items checked</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default AuditPage
