import React from 'react'
import { useGetReportsDashboard } from '../api/reports'

const ReportsPage: React.FC = () => {
  const { data, isLoading, error } = useGetReportsDashboard()

  if (isLoading) return <div style={{ padding: 'var(--space-8)' }}>Loading reports...</div>
  if (error) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)' }}>Failed to load reports.</div>
  if (!data) return null

  // Helper for safe percentages
  const pct = (part: number, whole: number) => whole > 0 ? (part / whole) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom: 'var(--space-12)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>
            Reports & Analytics
          </h1>
          <p style={{ margin: 0, color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>
            Executive overview of inventory health, utilization, and maintenance pipelines.
          </p>
        </div>
        <button 
          onClick={() => alert("Mock: Report exported successfully.")}
          style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.2)' }}
        >
          Export PDF
        </button>
      </div>

      {/* 3x2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
        
        {/* 1. Asset Status Distribution */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>Inventory Status</h3>
          <p style={{ margin: '0 0 var(--space-6)', color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>{data.status_distribution.total} total assets recorded</p>
          
          {/* Segmented Bar */}
          <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
            <div style={{ width: `${pct(data.status_distribution.available, data.status_distribution.total)}%`, backgroundColor: 'var(--color-success)', transition: 'width 1s ease-out' }} />
            <div style={{ width: `${pct(data.status_distribution.allocated, data.status_distribution.total)}%`, backgroundColor: 'var(--color-primary)', transition: 'width 1s ease-out' }} />
            <div style={{ width: `${pct(data.status_distribution.maintenance, data.status_distribution.total)}%`, backgroundColor: 'var(--color-warning)', transition: 'width 1s ease-out' }} />
            <div style={{ width: `${pct(data.status_distribution.lost, data.status_distribution.total)}%`, backgroundColor: 'var(--color-danger)', transition: 'width 1s ease-out' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'auto' }}>
            <div style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'var(--color-success)' }} /> {data.status_distribution.available} Available</div>
            <div style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'var(--color-primary)' }} /> {data.status_distribution.allocated} Allocated</div>
            <div style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'var(--color-warning)' }} /> {data.status_distribution.maintenance} Maint.</div>
            <div style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: 'var(--color-danger)' }} /> {data.status_distribution.lost} Lost</div>
          </div>
        </div>

        {/* 2. Department Utilization */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>Dept Utilization</h3>
          <p style={{ margin: '0 0 var(--space-6)', color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>Assets actively allocated</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
            {data.utilization_by_department.map(dept => (
              <div key={dept.department}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{dept.department}</span>
                  <span style={{ color: 'var(--color-neutral-dark)' }}>{dept.percentage}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--color-canvas)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${dept.percentage}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px', transition: 'width 1s ease-out' }} />
                </div>
              </div>
            ))}
            {data.utilization_by_department.length === 0 && <div style={{ color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>No department data available.</div>}
          </div>
        </div>

        {/* 3. Maintenance Pipeline */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>Maintenance Pipeline</h3>
          <p style={{ margin: '0 0 var(--space-6)', color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>Active ticket volume by stage</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1, padding: '0 12px' }}>
            {/* Funnel bars */}
            {[
              { label: 'Pending', count: data.maintenance_pipeline.pending, color: 'var(--color-danger)' },
              { label: 'Approved', count: data.maintenance_pipeline.approved, color: 'var(--color-warning)' },
              { label: 'In Prog', count: data.maintenance_pipeline.in_progress, color: 'var(--color-accent)' },
              { label: 'Done', count: data.maintenance_pipeline.resolved, color: 'var(--color-success)' }
            ].map(stage => {
              const max = Math.max(10, data.maintenance_pipeline.pending, data.maintenance_pipeline.approved, data.maintenance_pipeline.in_progress, data.maintenance_pipeline.resolved)
              const h = (stage.count / max) * 100
              return (
                <div key={stage.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>{stage.count}</span>
                  <div style={{ width: '40px', height: '80px', backgroundColor: 'var(--color-canvas)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: `${h}%`, backgroundColor: stage.color, transition: 'height 1s ease-out' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-neutral)', fontWeight: 500 }}>{stage.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Audit Health Score */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-2)', alignSelf: 'flex-start' }}>Audit Match Rate</h3>
          <p style={{ margin: '0 0 auto', color: 'var(--color-neutral)', fontSize: 'var(--text-sm)', alignSelf: 'flex-start' }}>Latest: {data.audit_health.cycle_name}</p>
          
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'var(--space-4) 0' }}>
            {/* Simple CSS ring */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-canvas)" strokeWidth="12" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-success)" strokeWidth="12" 
                strokeDasharray="339.29" 
                strokeDashoffset={339.29 - (339.29 * data.audit_health.match_rate) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {data.audit_health.match_rate}%
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-dark)', marginTop: 'auto' }}>
            <span><span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{data.audit_health.verified}</span> verified</span>
            <span><span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{data.audit_health.missing}</span> missing</span>
            <span><span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{data.audit_health.damaged}</span> damaged</span>
          </div>
        </div>

        {/* 5. Popular Bookings */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>Popular Resources</h3>
          <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>Top booked communal assets</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.top_resources.map((res, i) => (
              <div key={res.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '12px', backgroundColor: 'var(--color-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-neutral-dark)' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>{res.name}</div>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {res.bookings} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-neutral)' }}>slots</span>
                </div>
              </div>
            ))}
            {data.top_resources.length === 0 && <div style={{ color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>No bookings found.</div>}
          </div>
        </div>

        {/* 6. Aging Assets */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>Retirement Watchlist</h3>
          <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>Assets &gt; 3 years old</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.aging_assets.map(asset => (
              <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'rgba(255, 107, 107, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.1)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>{asset.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-neutral-dark)' }}>{asset.tag}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-danger)', fontWeight: 500, alignSelf: 'center' }}>
                  {asset.reason}
                </div>
              </div>
            ))}
            {data.aging_assets.length === 0 && <div style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>All assets are up to date!</div>}
          </div>
        </div>

      </div>

    </div>
  )
}

export default ReportsPage
