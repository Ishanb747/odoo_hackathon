import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getAssets, AssetOut } from '../api/assets'
import { getEmployees, EmployeeOut } from '../api/org'
import {
  getAllocationState,
  allocateAsset,
  requestTransfer,
  AllocationCreate,
  TransferRequestCreate
} from '../api/allocations'

import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

const AllocationPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('')
  const [toEmployeeId, setToEmployeeId] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')

  // ── Queries ──────────────────────────────────────────────────

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => getAssets({})
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees
  })

  const { data: allocationState, isLoading: stateLoading } = useQuery({
    queryKey: ['allocations', selectedAssetId],
    queryFn: () => getAllocationState(selectedAssetId as number),
    enabled: selectedAssetId !== ''
  })

  // ── Mutations ────────────────────────────────────────────────

  const allocateMutation = useMutation({
    mutationFn: (body: AllocationCreate) => allocateAsset(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', selectedAssetId] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setToEmployeeId('')
      setNotes('')
    }
  })

  const transferMutation = useMutation({
    mutationFn: (body: TransferRequestCreate) => requestTransfer(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations', selectedAssetId] })
      setToEmployeeId('')
      setReason('')
      alert('Transfer request submitted.')
    }
  })

  // ── Handlers ─────────────────────────────────────────────────

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedAssetId === '' || toEmployeeId === '') return
    allocateMutation.mutate({
      asset_id: selectedAssetId,
      employee_id: toEmployeeId,
      notes: notes || undefined
    })
  }

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedAssetId === '' || toEmployeeId === '') return
    transferMutation.mutate({
      asset_id: selectedAssetId,
      to_employee_id: toEmployeeId,
      reason: reason || undefined
    })
  }

  // ── Render ───────────────────────────────────────────────────

  const selectedAsset = assets.find(a => a.id === selectedAssetId)

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Allocation &amp; Transfer</h1>
      </div>

      {/* Asset Picker */}
      <Card>
        <div className="form-field" style={{ maxWidth: 480 }}>
          <label className="form-label">Select Asset</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">-- Choose an asset --</option>
            {assets.map((a: AssetOut) => (
              <option key={a.id} value={a.id}>
                {a.tag} – {a.name} ({a.status})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedAssetId !== '' && (
        <>
          {stateLoading ? (
            <div style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>Loading allocation state…</div>
          ) : allocationState?.is_allocated ? (
            /* ── Conflict Block & Transfer Form ────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-danger-light)',
                  border: '1px solid var(--color-danger)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-card)',
                  color: 'var(--color-ink)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <Badge tone="danger" dot>Conflict</Badge>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger-dark)' }}>Already Allocated</span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                  Allocated to <strong>{allocationState.current_allocation?.allocated_to}</strong>{' '}
                  ({allocationState.current_allocation?.department || 'Unknown'}).
                  Direct re-allocation is blocked — submit a transfer request below.
                </p>
              </div>

              <Card>
                <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 className="section-title">Transfer Request</h3>

                  <div className="form-field">
                    <label className="form-label">From</label>
                    <input
                      type="text"
                      disabled
                      value={`${allocationState.current_allocation?.allocated_to} (${allocationState.current_allocation?.department || 'Unknown'})`}
                      style={{ backgroundColor: 'var(--color-surface-raised)', color: 'var(--color-muted)' }}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">To (Employee)</label>
                    <select
                      required
                      value={toEmployeeId}
                      onChange={(e) => setToEmployeeId(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">-- Choose employee --</option>
                      {employees.map((emp: EmployeeOut) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Reason</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      placeholder="Why is this transfer needed?"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="primary" size="sm" disabled={transferMutation.isPending}>
                      {transferMutation.isPending ? 'Submitting…' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          ) : (
            /* ── Standard Allocation Form ──────────────────────────── */
            <Card>
              <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <h3 className="section-title">Allocate Asset</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                  <span className="asset-tag">{selectedAsset?.tag}</span> is currently available.
                </p>

                <div className="form-field">
                  <label className="form-label">To Employee</label>
                  <select
                    required
                    value={toEmployeeId}
                    onChange={(e) => setToEmployeeId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">-- Choose employee --</option>
                    {employees.map((emp: EmployeeOut) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Optional allocation notes"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="primary" size="sm" disabled={allocateMutation.isPending}>
                    {allocateMutation.isPending ? 'Allocating…' : 'Allocate'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* ── Allocation History ─────────────────────────────── */}
          {allocationState && allocationState.history.length > 0 && (
            <Card>
              <h3 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Allocation History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {allocationState.history.map((hist) => {
                  const allocDate = new Date(hist.allocated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                  return (
                    <div key={hist.id} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: hist.returned_at ? 'var(--color-muted)' : 'var(--color-primary)', marginTop: 6 }} />
                        <div style={{ width: 1, height: 20, backgroundColor: 'var(--color-border)' }} />
                      </div>
                      <div style={{ color: 'var(--color-ink-soft)' }}>
                        {hist.returned_at ? (
                          <>
                            <span style={{ color: 'var(--color-muted)', fontSize: 'var(--text-xs)' }}>
                              {new Date(hist.returned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>{' '}
                            Returned by {hist.allocated_to} — condition: {hist.condition_on_return || 'unknown'}
                          </>
                        ) : (
                          <>
                            <span style={{ color: 'var(--color-muted)', fontSize: 'var(--text-xs)' }}>{allocDate}</span>{' '}
                            Allocated to <strong>{hist.allocated_to}</strong> — {hist.department || 'Unknown'}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default AllocationPage
