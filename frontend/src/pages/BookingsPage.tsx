import React, { useState } from 'react'
import { format, parse, differenceInMinutes } from 'date-fns'
import { useGetBookings, useCreateBooking, BookingError } from '../api/bookings'

const START_HOUR = 9
const END_HOUR = 17
const HOUR_HEIGHT = 80 // pixels per hour

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

  const handleBook = () => {
    setConflictRequest(null)
    setConflictMsg(null)
    
    // Add seconds for the backend (time field)
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
          // Success! Clear form or keep it.
          // The query will automatically invalidate and fetch the new booking
        },
        onError: (err: BookingError) => {
          if (err.message === 'conflict' && err.conflicting_booking) {
            setConflictRequest({ start: newStart, end: newEnd })
            setConflictMsg(`Requested ${newStart} to ${newEnd} - conflict - slot is unavailable`)
          } else {
            alert(err.message || 'An error occurred')
          }
        }
      }
    )
  }

  // Calculate top and height for rendering a block on the timeline
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
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-8)' }}>
      {/* Header and Picker */}
      <header style={{ marginBottom: 'var(--space-8)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', margin: '0 0 var(--space-2)' }}>Resource Booking</h1>
          <p style={{ color: 'var(--color-neutral-dark)', margin: 0 }}>Select a resource and date to view or book time slots.</p>
        </div>
        
        <select 
          value={resource} 
          onChange={e => setResource(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' }}
        >
          {RESOURCES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)' }}
        />
      </header>

      <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
        {/* Calendar Column */}
        <div style={{ flex: '1', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)', margin: 0 }}>
            {resource} – {format(parse(date, 'yyyy-MM-dd', new Date()), 'EEE, d MMM')}
          </h2>

          <div style={{ position: 'relative', marginTop: 'var(--space-4)' }}>
            {/* Hour Grid Lines */}
            {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', height: HOUR_HEIGHT, borderTop: '1px solid var(--color-border)' }}>
                <span style={{ 
                  width: 60, 
                  textAlign: 'right', 
                  paddingRight: 'var(--space-4)', 
                  transform: 'translateY(-50%)',
                  color: 'var(--color-neutral-dark)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--color-surface)'
                }}>
                  {START_HOUR + i}:00
                </span>
                <div style={{ flex: 1 }} />
              </div>
            ))}

            {/* Bookings Container */}
            <div style={{ position: 'absolute', top: 0, left: 60, right: 0, bottom: 0 }}>
              
              {/* Render Existing Bookings */}
              {bookings.map(b => {
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
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 4px 6px rgba(108, 99, 255, 0.2)',
                      zIndex: 10
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Booked</span> 
                    <span style={{ margin: '0 8px', opacity: 0.8 }}>–</span> 
                    {b.employee_name} 
                    <span style={{ margin: '0 8px', opacity: 0.8 }}>–</span> 
                    {b.start_time.substring(0, 5)} to {b.end_time.substring(0, 5)}
                  </div>
                )
              })}

              {/* Render Conflict Outline */}
              {conflictRequest && (
                <div 
                  style={{
                    position: 'absolute',
                    left: 'var(--space-2)',
                    right: 'var(--space-2)',
                    top: getStyleForTimeRange(conflictRequest.start, conflictRequest.end).top,
                    height: getStyleForTimeRange(conflictRequest.start, conflictRequest.end).height,
                    border: '3px dotted var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 107, 107, 0.05)',
                    padding: 'var(--space-2) var(--space-4)',
                    color: 'var(--color-danger)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    zIndex: 20,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ backgroundColor: 'var(--color-surface)', padding: '2px 8px', borderRadius: '4px' }}>
                    {conflictMsg}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Action Column */}
        <div style={{ width: 320, flexShrink: 0, backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-md)', margin: '0 0 var(--space-4)' }}>Request Slot</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)', marginBottom: 'var(--space-2)' }}>Start Time</label>
              <input 
                type="time" 
                value={newStart} 
                onChange={e => setNewStart(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-dark)', marginBottom: 'var(--space-2)' }}>End Time</label>
              <input 
                type="time" 
                value={newEnd} 
                onChange={e => setNewEnd(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <button 
              onClick={handleBook}
              disabled={createBooking.isPending}
              style={{
                marginTop: 'var(--space-4)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)'
              }}
            >
              {createBooking.isPending ? 'Booking...' : 'Book a slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingsPage
