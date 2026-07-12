import React, { useState, useEffect } from 'react'
import { format, parse, differenceInMinutes, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay, isWithinInterval, isBefore } from 'date-fns'
import { useGetBookings, useCreateBooking, useGetResources, BookingError } from '../api/bookings'

const START_HOUR = 9
const END_HOUR = 17
const HOUR_HEIGHT = 90

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE VIEW (For Rooms)
// ─────────────────────────────────────────────────────────────────────────────
const TimelineView: React.FC<{ resource: string }> = ({ resource }) => {
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
      { resource_name: resource, start_date: date, end_date: date, start_time: startTimeStr, end_time: endTimeStr },
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
    return { top: `${(startMins / 60) * HOUR_HEIGHT}px`, height: `${((endMins - startMins) / 60) * HOUR_HEIGHT}px` }
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-10)', alignItems: 'flex-start', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ flex: '1', backgroundColor: 'var(--color-surface)', borderRadius: '24px', padding: 'var(--space-8)', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)', opacity: 0.5, pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
            {resource}
          </h2>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', cursor: 'pointer', transition: 'all 0.2s ease' }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', height: HOUR_HEIGHT, borderTop: '1px dashed var(--color-border)' }}>
              <span style={{ width: 70, textAlign: 'right', paddingRight: 'var(--space-5)', transform: 'translateY(-50%)', color: 'var(--color-neutral-dark)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 600, backgroundColor: 'var(--color-surface)' }}>
                {START_HOUR + i}:00
              </span>
              <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.01)' }} />
            </div>
          ))}

          <div style={{ position: 'absolute', top: 0, left: 70, right: 0, bottom: 0 }}>
            {bookings.map((b, idx) => {
              if (b.status !== 'confirmed') return null
              // Show only if it falls on this day
              if (b.start_date > date || b.end_date < date) return null
              
              const style = getStyleForTimeRange(b.start_time, b.end_time)
              return (
                <div key={b.id} style={{ position: 'absolute', left: 'var(--space-4)', right: 'var(--space-4)', top: style.top, height: style.height, backgroundColor: 'rgba(108, 99, 255, 0.95)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: '16px', padding: 'var(--space-3) var(--space-5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 8px 24px rgba(108, 99, 255, 0.25)', zIndex: 10, transform: mounted ? 'scale(1)' : 'scale(0.95)', opacity: mounted ? 1 : 0, transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s`, border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '0.02em' }}>{b.employee_name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
                  </div>
                </div>
              )
            })}

            {conflictRequest && (
              <div style={{ position: 'absolute', left: 'var(--space-2)', right: 'var(--space-2)', top: getStyleForTimeRange(conflictRequest.start, conflictRequest.end).top, height: getStyleForTimeRange(conflictRequest.start, conflictRequest.end).height, border: '2px dashed var(--color-danger)', borderRadius: '16px', backgroundColor: 'rgba(255, 107, 107, 0.08)', padding: 'var(--space-3) var(--space-5)', color: 'var(--color-danger)', zIndex: 20, pointerEvents: 'none', display: 'flex', alignItems: 'center', animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' }}>
                <div style={{ backgroundColor: 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)', boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>{conflictMsg}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ width: 360, flexShrink: 0, backgroundColor: 'var(--color-surface)', borderRadius: '24px', padding: 'var(--space-8)', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', position: 'sticky', top: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 var(--space-6)', letterSpacing: '-0.01em' }}>Request Slot</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>Start Time</label>
            <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, transition: 'all 0.2s ease', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>End Time</label>
            <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, transition: 'all 0.2s ease', outline: 'none' }} />
          </div>
          <button onClick={handleBook} disabled={createBooking.isPending} style={{ marginTop: 'var(--space-6)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 'var(--text-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)', transition: 'all 0.2s ease', opacity: createBooking.isPending ? 0.8 : 1 }}>
            {createBooking.isPending ? 'Booking...' : 'Book a slot'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW (For Vehicles/Projectors)
// ─────────────────────────────────────────────────────────────────────────────
const CalendarView: React.FC<{ resource: string }> = ({ resource }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Range selection state
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  
  const { data: allBookings = [] } = useGetBookings(resource)
  const createBooking = useCreateBooking()

  const [newStart, setNewStart] = useState("09:00")
  const [newEnd, setNewEnd] = useState("17:00")
  const [conflictMsg, setConflictMsg] = useState<string | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const handleDayClick = (day: Date) => {
    if (!rangeStart) {
      setRangeStart(day)
      setRangeEnd(day)
    } else if (rangeStart && rangeEnd && isSameDay(rangeStart, rangeEnd)) {
      if (isBefore(day, rangeStart)) {
        setRangeStart(day)
      } else {
        setRangeEnd(day)
      }
    } else {
      setRangeStart(day)
      setRangeEnd(day)
    }
  }

  const handleBook = () => {
    if (!rangeStart || !rangeEnd) return
    setConflictMsg(null)
    const startDateStr = format(rangeStart, 'yyyy-MM-dd')
    const endDateStr = format(rangeEnd, 'yyyy-MM-dd')
    const startTimeStr = newStart.length === 5 ? `${newStart}:00` : newStart
    const endTimeStr = newEnd.length === 5 ? `${newEnd}:00` : newEnd

    createBooking.mutate(
      { resource_name: resource, start_date: startDateStr, end_date: endDateStr, start_time: startTimeStr, end_time: endTimeStr },
      {
        onSuccess: () => {
          setRangeStart(null)
          setRangeEnd(null)
        },
        onError: (err: BookingError) => {
          if (err.message === 'conflict' && err.conflicting_booking) {
            setConflictMsg(`Conflict: slot is unavailable due to an overlapping booking.`)
          } else {
            alert(err.message || 'An error occurred')
          }
        }
      }
    )
  }

  const isDayInRange = (day: Date) => {
    if (!rangeStart || !rangeEnd) return false
    return isWithinInterval(day, { start: rangeStart, end: rangeEnd })
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-10)', alignItems: 'flex-start', animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      
      <div style={{ flex: '1', backgroundColor: 'var(--color-surface)', borderRadius: '24px', padding: 'var(--space-8)', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--color-warning)', display: 'inline-block' }} />
            {resource} Schedule
          </h2>
          
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>&larr;</button>
            <div style={{ padding: '8px 16px', fontWeight: 600, fontFamily: 'var(--font-display)', minWidth: 120, textAlign: 'center' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600 }}>&rarr;</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, backgroundColor: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-3)', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-neutral-dark)', textTransform: 'uppercase' }}>
              {day}
            </div>
          ))}
          
          {calendarDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayBookings = allBookings.filter(b => b.start_date <= dateStr && b.end_date >= dateStr && b.status === 'confirmed')
            const inRange = isDayInRange(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <div 
                key={day.toISOString()}
                onClick={() => isCurrentMonth && handleDayClick(day)}
                style={{
                  backgroundColor: inRange ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  padding: 'var(--space-2)',
                  minHeight: 100,
                  cursor: isCurrentMonth ? 'pointer' : 'default',
                  opacity: isCurrentMonth ? 1 : 0.4,
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 'var(--text-sm)', color: isToday(day) && !inRange ? 'var(--color-primary)' : 'inherit', marginBottom: 'var(--space-2)' }}>
                  {format(day, 'd')}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  {dayBookings.slice(0, 3).map(b => (
                    <div key={b.id} style={{ fontSize: 10, backgroundColor: 'rgba(108, 99, 255, 0.1)', color: 'var(--color-primary)', padding: '4px 6px', borderRadius: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                      {b.start_time.substring(0, 5)} {b.employee_name.split(' ')[0]}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--color-neutral-dark)', textAlign: 'center', marginTop: 'auto' }}>
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel for booking a date range */}
      {rangeStart && rangeEnd && (
        <div style={{ width: 320, flexShrink: 0, backgroundColor: 'var(--color-surface)', borderRadius: '24px', padding: 'var(--space-8)', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', position: 'sticky', top: 'var(--space-8)', animation: 'fadeInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
              {isSameDay(rangeStart, rangeEnd) ? format(rangeStart, 'MMM d, yyyy') : `${format(rangeStart, 'MMM d')} - ${format(rangeEnd, 'MMM d')}`}
            </h3>
            <button onClick={() => { setRangeStart(null); setRangeEnd(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-neutral-dark)' }}>&times;</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>Start Time</label>
              <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral)', marginBottom: 'var(--space-2)' }}>End Time</label>
              <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, outline: 'none' }} />
            </div>
            
            {conflictMsg && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(255, 107, 107, 0.1)', color: 'var(--color-danger)', borderRadius: 8, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                ⚠️ {conflictMsg}
              </div>
            )}

            <button onClick={handleBook} disabled={createBooking.isPending} style={{ marginTop: 'var(--space-2)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '16px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 'var(--text-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)', opacity: createBooking.isPending ? 0.8 : 1 }}>
              {createBooking.isPending ? 'Booking...' : 'Book Range'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE SHELL
// ─────────────────────────────────────────────────────────────────────────────
const BookingsPage: React.FC = () => {
  const { data: dynamicResources = [], isLoading: loadingResources } = useGetResources()
  const [selectedResourceName, setSelectedResourceName] = useState("")
  
  useEffect(() => {
    if (dynamicResources.length > 0 && !selectedResourceName) {
      setSelectedResourceName(dynamicResources[0].name)
    }
  }, [dynamicResources, selectedResourceName])

  const selectedObj = dynamicResources.find(r => r.name === selectedResourceName)
  const isRoom = selectedObj?.category === 'Rooms'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-10)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-12)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 var(--space-2)' }}>
            Resource Booking
          </h1>
          <p style={{ color: 'var(--color-neutral-dark)', fontSize: 'var(--text-lg)', margin: 0 }}>
            {isRoom ? 'Select a room and date to view time slots.' : 'Select an asset to view its monthly availability.'}
          </p>
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <select 
            value={selectedResourceName} 
            onChange={e => setSelectedResourceName(e.target.value)}
            style={{ appearance: 'none', width: '100%', padding: '14px 40px 14px 20px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-ink)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
          >
            {loadingResources && <option value="">Loading...</option>}
            {dynamicResources.map(r => <option key={r.name} value={r.name}>{r.name} ({r.category})</option>)}
          </select>
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-neutral-dark)' }}>▼</span>
        </div>
      </header>

      {selectedResourceName && (
        isRoom 
          ? <TimelineView key={`timeline-${selectedResourceName}`} resource={selectedResourceName} />
          : <CalendarView key={`calendar-${selectedResourceName}`} resource={selectedResourceName} />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
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
