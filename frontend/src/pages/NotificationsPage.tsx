import React, { useState } from 'react'
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, LogType } from '../api/notifications'
import { formatDistanceToNow } from 'date-fns'
import Badge from '../components/Badge'

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LogType | 'all'>('all')
  const { data: logs, isLoading, error } = useGetNotifications(activeTab === 'all' ? undefined : activeTab)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const tabs: { value: LogType | 'all', label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'alert', label: 'Alerts' },
    { value: 'approval', label: 'Approvals' },
    { value: 'booking', label: 'Bookings' }
  ]

  if (error) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-danger)' }}>Failed to load notifications.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom: 'var(--space-12)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 var(--space-2)' }}>
            Activity & Notifications
          </h1>
          <p style={{ margin: 0, color: 'var(--color-neutral)', fontSize: 'var(--text-sm)' }}>
            Stay updated on system changes, approvals, and alerts.
          </p>
        </div>
        <button 
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || !logs || logs.every(l => l.read)}
          style={{ 
            backgroundColor: 'transparent', 
            color: 'var(--color-primary)', 
            border: '1px solid var(--color-primary)', 
            padding: '8px 16px', 
            borderRadius: '8px', 
            fontWeight: 600, 
            cursor: 'pointer',
            opacity: (!logs || logs.every(l => l.read)) ? 0.5 : 1
          }}
        >
          Mark all as read
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.value ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === t.value ? 'var(--color-primary)' : 'var(--color-neutral)',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '-9px'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-6)' }}>Loading...</div>
        ) : !logs || logs.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-neutral)' }}>
            No activity found for this filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((log, i) => (
              <div 
                key={log.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-4)', 
                  padding: 'var(--space-4) var(--space-6)', 
                  borderBottom: i < logs.length - 1 ? '1px solid var(--color-border)' : 'none',
                  backgroundColor: log.read ? 'transparent' : 'rgba(108, 99, 255, 0.03)',
                  transition: 'background-color 0.3s'
                }}
              >
                {/* Read Checkbox */}
                <input 
                  type="checkbox" 
                  checked={log.read} 
                  onChange={() => {
                    if (!log.read) markRead.mutate(log.id)
                  }}
                  disabled={log.read || markRead.isPending}
                  style={{ width: '18px', height: '18px', cursor: log.read ? 'default' : 'pointer' }}
                />
                
                {/* Type Badge */}
                <div style={{ width: '80px' }}>
                  {log.type === 'alert' && <Badge tone="danger">Alert</Badge>}
                  {log.type === 'approval' && <Badge tone="success">Approval</Badge>}
                  {log.type === 'booking' && <Badge tone="primary">Booking</Badge>}
                  {log.type === 'transfer' && <Badge tone="primary">Transfer</Badge>}
                  {log.type === 'audit' && <Badge tone="warning">Audit</Badge>}
                  {log.type === 'maintenance' && <Badge tone="neutral">Maint</Badge>}
                </div>

                {/* Message */}
                <div style={{ flex: 1, fontSize: 'var(--text-sm)', color: log.read ? 'var(--color-neutral-dark)' : 'var(--color-ink)', fontWeight: log.read ? 400 : 500 }}>
                  {log.message}
                </div>

                {/* Timestamp */}
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral)' }}>
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default NotificationsPage
