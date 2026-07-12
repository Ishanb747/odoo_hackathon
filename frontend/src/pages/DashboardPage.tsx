import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { getDashboardData } from '../api/dashboard'
import Card from '../components/Card'
import Button from '../components/Button'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: getDashboardData,
    refetchInterval: 30000,
    staleTime: 60000,
    gcTime: 5 * 60000,
  })

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
        <div className="skeleton skeleton-title"></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton skeleton-card"></div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
          <div className="skeleton" style={{ height: '350px' }}></div>
          <div className="skeleton" style={{ height: '350px' }}></div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 'var(--space-6)', color: 'var(--color-danger)' }}>
        Failed to load dashboard data.
      </div>
    )
  }

  const { kpis, recent_activity, overdue_alerts, status_distribution, department_utilization } = data
  const hasOverdue = overdue_alerts.length > 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <header className="page-header">
        <div>
          <h1 className="page-title text-gradient">Welcome back!</h1>
          <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" size="sm" onClick={() => navigate('/app/assets')}>+ Register Asset</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/booking')}>Book Resource</Button>
        </div>
      </header>

      {/* ── KPI Highlight Strip ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)',
        }}
      >
        {[
          { label: 'Available', value: kpis.available_assets, color: 'var(--color-success)', sub: 'assets ready' },
          { label: 'Allocated', value: kpis.allocated_assets, color: 'var(--color-primary)', sub: 'currently in use' },
          { label: 'Maintenance', value: kpis.maintenance_assets, color: 'var(--color-warning)', sub: 'under service' },
          { label: 'Active Bookings', value: kpis.active_bookings, color: 'var(--color-primary)', sub: 'confirmed today' },
          { label: 'Pending Transfers', value: kpis.pending_transfers, color: 'var(--color-warning)', sub: 'awaiting approval' },
          { label: 'Returns Due', value: kpis.upcoming_returns, color: 'var(--color-muted)', sub: 'active allocations' },
        ].map((kpi, idx) => (
          <Card key={idx} className="hover-lift glass-panel" style={{ borderLeft: `4px solid ${kpi.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>{kpi.label}</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-ink)', lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>{kpi.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Main Layout: Charts & Feed ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        
        {/* Left Column: Visuals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {/* Status Donut Chart */}
            <Card className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
                Asset Distribution
              </h3>
              <div style={{ height: 250, flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={status_distribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
                {status_distribution.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: s.color }} />
                    {s.name}
                  </div>
                ))}
              </div>
            </Card>

            {/* Department Utilization Bar Chart */}
            <Card className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
                Department Utilization
              </h3>
              <div style={{ height: 250, flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={department_utilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#F3F4F6' }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Alerts & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {hasOverdue && (
            <div
              style={{
                backgroundColor: '#FFF0F0',
                border: '1px solid var(--color-danger)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--color-danger)', marginBottom: 'var(--space-2)' }}>
                Action Required
              </div>
              <div style={{ color: 'var(--color-ink)', fontSize: '0.875rem', marginBottom: 'var(--space-3)' }}>
                {overdue_alerts.length} asset{overdue_alerts.length > 1 ? 's are' : ' is'} overdue for return and flagged for follow-up.
              </div>
              <Button variant="secondary" onClick={() => navigate('/app/reports')} style={{ width: '100%', justifyContent: 'center' }}>
                Review Returns
              </Button>
            </div>
          )}

          <Card className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="section-title" style={{ marginBottom: 'var(--space-5)' }}>Recent Activity</h3>
            {recent_activity.length === 0 ? (
              <div style={{ color: 'var(--color-neutral)', fontSize: '0.875rem' }}>No recent activity to display.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto', flexGrow: 1, paddingRight: 'var(--space-2)' }}>
                {recent_activity.map(activity => (
                  <div key={activity.id} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginTop: 6 }} />
                      <div style={{ width: 2, flexGrow: 1, backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                        {activity.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral)', marginTop: 2 }}>
                        {new Date(activity.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}

export default DashboardPage
