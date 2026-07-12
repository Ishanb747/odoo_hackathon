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

  // ── Render Helpers ───────────────────────────────────────────

  const selectedAsset = assets.find(a => a.id === selectedAssetId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-ink)' }}>Allocation & Transfer</h1>
      </header>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <label style={{ fontWeight: 500 }}>Select Asset</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value ? Number(e.target.value) : '')}
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-base)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              width: '100%',
              maxWidth: '400px'
            }}
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
            <div>Loading allocation state...</div>
          ) : allocationState?.is_allocated ? (
            // ── Conflict Block & Transfer Form ──────────────────────
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div
                style={{
                  backgroundColor: '#FFF0F0', // Light coral tint
                  border: '1px solid var(--color-danger)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-card)',
                  color: 'var(--color-ink)'
                }}
              >
                <h3 style={{ color: 'var(--color-danger)', margin: '0 0 var(--space-2) 0', fontWeight: 600 }}>
                  Already Allocated
                </h3>
                <p style={{ margin: 0 }}>
                  Allocated to <strong>{allocationState.current_allocation?.allocated_to}</strong>{' '}
                  ({allocationState.current_allocation?.department || 'Unknown'})
                  <br />
                  Direct re-allocation is blocked – submit a transfer request below.
                </p>
              </div>

              <Card>
                <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ margin: 0, fontWeight: 600 }}>Transfer Request</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>From</label>
                    <input
                      type="text"
                      disabled
                      value={`${allocationState.current_allocation?.allocated_to} (${allocationState.current_allocation?.department || 'Unknown'})`}
                      style={{
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-base)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: '#f5f5f5',
                        color: '#666'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>To (Employee)</label>
                    <select
                      required
                      value={toEmployeeId}
                      onChange={(e) => setToEmployeeId(e.target.value ? Number(e.target.value) : '')}
                      style={{
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-base)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)'
                      }}
                    >
                      <option value="">-- Choose employee --</option>
                      {employees.map((emp: EmployeeOut) => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Reason</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      style={{
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-base)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="primary" disabled={transferMutation.isPending}>
                      {transferMutation.isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          ) : (
            // ── Standard Allocation Form ────────────────────────────
            <Card>
              <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>Allocate Asset</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                  {selectedAsset?.tag} is currently available.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>To Employee</label>
                  <select
                    required
                    value={toEmployeeId}
                    onChange={(e) => setToEmployeeId(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-base)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)'
                    }}
                  >
                    <option value="">-- Choose employee --</option>
                    {employees.map((emp: EmployeeOut) => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-base)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="primary" disabled={allocateMutation.isPending}>
                    {allocateMutation.isPending ? 'Allocating...' : 'Allocate'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* ── Allocation History ─────────────────────────────── */}
          {allocationState && allocationState.history.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-ink)' }}>Allocation history</h3>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {allocationState.history.map((hist) => {
                  const allocDate = new Date(hist.allocated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  
                  if (hist.returned_at) {
                    const retDate = new Date(hist.returned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <li key={hist.id} style={{ fontSize: '0.875rem', color: '#555' }}>
                        {retDate} – Returned by {hist.allocated_to} – condition: {hist.condition_on_return || 'unknown'}
                      </li>
                    )
                  } else {
                    return (
                      <li key={hist.id} style={{ fontSize: '0.875rem', color: '#555' }}>
                        {allocDate} – Allocated to {hist.allocated_to} – {hist.department || 'Unknown'}
                      </li>
                    )
                  }
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AllocationPage
