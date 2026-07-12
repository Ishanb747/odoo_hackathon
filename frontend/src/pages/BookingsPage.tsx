import React, { useState, useEffect } from 'react'
import { format, parse, differenceInMinutes } from 'date-fns'
import { useGetBookings, useCreateBooking, BookingError } from '../api/bookings'

const START_HOUR = 9
const END_HOUR = 17
const HOUR_HEIGHT = 90 // slightly taller for a roomier feel

const RESOURCES = [
  "Conference room B2",
  "Boardroom A",
  "Projector X1",
  "Company Vehicle - Van 1"
]

const BookingsPage: React.FC = () => {
  const [resource, setResource] = useState(RESOURCES[0])
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  
  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("10:00")
  
  const { data: bookings = [] } = useGetBookings(resource, date)
  const createBooking = useCreateBooking()

  const [conflictRequest, setConflictRequest] = useState<{ start: string; end: string } | null>(null)
  const [conflictMsg, setConflictMsg] = useState<string | null>(null)
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleBook = () => {
    setConflictRequest(null)
    setConflictMsg(null)
    
    const startTimeStr = newStart.length === 5 ? `${newStart}:00` : newStart
    const endTimeStr = newEnd.length === 5 ? `${newEnd}:00` : newEnd

    createBooking.mutate(
      {
        resource_name: resource,
        date: date,
        start_time: startTimeStr,
        end_time: endTimeStr,
      },
      {
        onSuccess: () => {
          setNewStart("09:00")
          setNewEnd("10:00")
        },
        onError: (err: BookingError) => {
          if (err.message === 'conflict' && err.conflicting_booking) {
            setConflictRequest({ start: newStart, end: newEnd })
            setConflictMsg(`Conflict: ${newStart} to ${newEnd} is unavailable`)
          } else {
            alert(err.message || 'An error occurred')
          }
        }
      }
    )
  }

  const getStyleForTimeRange = (start: string, end: string) => {
    const s = start.substring(0, 5)
    const e = end.substring(0, 5)
    
    const startMins = differenceInMinutes(parse(s, 'HH:mm', new Date()), parse(`${START_HOUR}:00`, 'H:mm', new Date()))
    const endMins = differenceInMinutes(parse(e, 'HH:mm', new Date()), parse(`${START_HOUR}:00`, 'H:mm', new Date()))
    
    const top = (startMins / 60) * HOUR_HEIGHT
    const height = ((endMins - startMins) / 60) * HOUR_HEIGHT
    
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 'var(--space-10)',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* Header section */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: 'var(--space-12)' 
      }}>
        <div>
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: 700, 
            letterSpacing: '-0.03em', 
            margin: '0 0 var(--space-2)' 
          }}>
            Resource Booking
          </h1>
          <p style={{ 
            color: 'var(--color-neutral-dark)', 
            fontSize: 'var(--text-lg)', 
            margin: 0 
          }}>
            Select a resource and date to view or book time slots.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ position: 'relative' }}>
            <select 
              value={resource} 
              onChange={e => setResource(e.target.value)}
              style={{ 
                appearance: 'none',
                padding: '12px 40px 12px 16px', 
                borderRadius: 'var(--radius-full)', 
                border: '1px solid var(--color-border)', 
                backgroundColor: 'var(--color-surface)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--color-ink)',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-neutral-dark)' }}>▼</span>
          </div>
          
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            style={{ 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-full)', 
              border: '1px solid var(--color-border)', 
              backgroundColor: 'var(--color-surface)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 'var(--space-10)', alignItems: 'flex-start' }}>
        
        {/* Calendar / Timeline */}
        <div style={{ 
          flex: '1', 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: '24px', 
          padding: 'var(--space-8)', 
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }} />

          <h2 style={{ 
            fontSize: 'var(--text-xl)', 
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            marginBottom: 'var(--space-8)', 
            paddingBottom: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            margin: '0 0 var(--space-8) 0',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
            {resource} <span style={{ color: 'var(--color-neutral)', fontWeight: 400 }}>—</span> {format(parse(date, 'yyyy-MM-dd', new Date()), 'EEE, d MMM')}
          </h2>

          <div style={{ position: 'relative' }}>
            {/* Hour Grid Lines */}
            {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', height: HOUR_HEIGHT, borderTop: '1px dashed var(--color-border)' }}>
                <span style={{ 
                  width: 70, 
                  textAlign: 'right', 
                  paddingRight: 'var(--space-5)', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-neutral-dark)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-surface)'
                }}>
                  {START_HOUR + i}:00
                </span>
                <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.01)' }} />
              </div>
            ))}

            {/* Bookings Container */}
            <div style={{ position: 'absolute', top: 0, left: 70, right: 0, bottom: 0 }}>
              
              {/* Existing Bookings */}
              {bookings.map((b, idx) => {
                if (b.status !== 'confirmed') return null
                const style = getStyleForTimeRange(b.start_time, b.end_time)
                return (
                  <div 
                    key={b.id} 
                    style={{
                      position: 'absolute',
                      left: 'var(--space-4)',
                      right: 'var(--space-4)',
                      top: style.top,
                      height: style.height,
                      backgroundColor: 'rgba(108, 99, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      borderRadius: '16px',
                      padding: 'var(--space-3) var(--space-5)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(108, 99, 255, 0.25)',
                      zIndex: 10,
                      transform: mounted ? 'scale(1)' : 'scale(0.95)',
                      opacity: mounted ? 1 : 0,
                      transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s`,
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '0.02em' }}>{b.employee_name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                      {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
                    </div>
                  </div>
                )
              })}

              {/* Conflict Outline */}
              {conflictRequest && (
                <div 
                  style={{
                    position: 'absolute',
                    left: 'var(--space-2)',
                    right: 'var(--space-2)',
                    top: getStyleForTimeRange(conflictRequest.start, conflictRequest.end).top,
                    height: getStyleForTimeRange(conflictRequest.start, conflictRequest.end).height,
                    border: '2px dashed var(--color-danger)',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 107, 107, 0.08)',
                    padding: 'var(--space-3) var(--space-5)',
                    color: 'var(--color-danger)',
                    zIndex: 20,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
                  }}
                >
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '6px 12px', 
                    borderRadius: 'var(--radius-full)', 
                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    {conflictMsg}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel (Right Side) */}
        <div style={{ 
          width: 360, 
          flexShrink: 0, 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: '24px', 
          padding: 'var(--space-8)', 
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 'var(--space-8)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--text-lg)', 
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            margin: '0 0 var(--space-6)',
            letterSpacing: '-0.01em'
          }}>
            Request Slot
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--text-xs)', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--color-neutral)', 
                marginBottom: 'var(--space-2)' 
              }}>Start Time</label>
              <input 
                type="time" 
                value={newStart} 
                onChange={e => setNewStart(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--color-border)', 
                  backgroundColor: 'var(--color-canvas)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: 'var(--text-xs)', 
                fontWeight: 600, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--color-neutral)', 
                marginBottom: 'var(--space-2)' 
              }}>End Time</label>
              <input 
                type="time" 
                value={newEnd} 
                onChange={e => setNewEnd(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--color-border)', 
                  backgroundColor: 'var(--color-canvas)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <button 
              onClick={handleBook}
              disabled={createBooking.isPending}
              style={{
                marginTop: 'var(--space-6)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: 'var(--text-md)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)',
                transition: 'all 0.2s ease',
                transform: createBooking.isPending ? 'scale(0.98)' : 'scale(1)',
                opacity: createBooking.isPending ? 0.8 : 1
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {createBooking.isPending ? 'Booking...' : 'Book a slot'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Inline styles for shake animation */}
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  )
}

export default BookingsPage

