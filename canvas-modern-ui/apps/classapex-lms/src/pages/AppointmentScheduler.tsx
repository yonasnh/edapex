/**
 * ClassApex — Appointment Scheduler Page
 * =======================================
 * Canvas Appointment Groups UI for teachers and students.
 * Teachers can create appointment slots; students can reserve them.
 *
 * Backend concept for true calendar sync:
 * A dynamic ICS feed endpoint (e.g., GET /api/v1/calendar_events/feed.ics)
 * would generate a live ICS stream keyed to the user's token. For now,
 * the Calendar page generates a static data URI that users can import
 * into Google/Outlook manually.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import clsx from 'clsx'
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery'
import { useNotification } from '../hooks/useNotification'
import { useRole } from '../contexts/RoleContext'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AppointmentSlot {
  id: string
  start_at: string
  end_at: string
  child_events_count: number
  child_events?: Array<{
    id: string
    start_at: string
    end_at: string
    reserved?: boolean
    reserved_by?: { id: number; name: string }[]
  }>
  available_slots: number
}

interface AppointmentGroup {
  id: string
  title: string
  location_name?: string
  context_codes: string[]
  appointments?: AppointmentSlot[]
  appointments_count?: number
  participant_type?: string
  participant_count?: number
  max_appointments_per_participant?: number
  require_scheduler?: boolean
  workflow_state?: string
}

// ─── Icons ──────────────────────────────────────────────────────────────────

const CalendarSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="14" height="13" rx="2" /><path d="M3 7h14" /><path d="M6 2v3M14 2v3" />
  </svg>
)

const ClockSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" />
  </svg>
)

const PlusSvg = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 3v10M3 8h10" />
  </svg>
)

const TrashSvg = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 5h14" /><path d="M8 5V3a1 1 0 011-1h2a1 1 0 011 1v2" /><path d="M5 5l1 12a2 2 0 002 2h4a2 2 0 002-2l1-12" />
  </svg>
)

const MapPinSvg = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 1a4.5 4.5 0 00-4.5 4.5c0 3 4.5 7.5 4.5 7.5s4.5-4.5 4.5-7.5A4.5 4.5 0 007 1z" /><circle cx="7" cy="5.5" r="1.5" />
  </svg>
)

// ─── Helpers ────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8am to 7pm

function formatTimeLabel(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour > 12 ? hour - 12 : hour
  return `${display}:00 ${suffix}`
}

function formatSlotTime(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

function getWeekDates(base: Date): Date[] {
  const monday = new Date(base)
  const day = monday.getDay() || 7
  if (day !== 1) monday.setDate(monday.getDate() - day + 1)
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

// ─── Component ──────────────────────────────────────────────────────────────

const AppointmentScheduler: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const { role } = useRole()
  const { showToast, showConfirm } = useNotification()
  const isTeacher = role === 'teacher' || role === 'admin' || role === 'ta'

  const [viewWeek, setViewWeek] = useState(new Date())
  const [selectedSlots, setSelectedSlots] = useState<{ dayIndex: number; hour: number }[]>([])
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(30)
  const [location, setLocation] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(1)
  const [publishing, setPublishing] = useState(false)

  // Fetch appointment groups for this course context
  const contextCode = useMemo(() => (courseId ? `course_${courseId}` : undefined), [courseId])

  const { data: appointmentGroupsData, isLoading: groupsLoading, refetch: refetchGroups } = useCanvasQuery<AppointmentGroup[]>(
    '/api/v1/appointment_groups',
    { context_codes: contextCode ? [contextCode] : undefined, scope: 'manageable', include: ['appointments', 'child_events'] } as any,
    { enabled: !!contextCode }
  )

  const appointmentGroups = Array.isArray(appointmentGroupsData) ? appointmentGroupsData : []

  // Fetch current user reservations (all calendar events with reservations)
  const { data: reservationsData, refetch: refetchReservations } = useCanvasQuery<any[]>(
    '/api/v1/calendar_events',
    { type: 'appointment', context_codes: contextCode ? [contextCode] : undefined, all_events: true } as any,
    { enabled: !!contextCode && !isTeacher }
  )

  const reservations = Array.isArray(reservationsData) ? reservationsData : []

  const weekDates = useMemo(() => getWeekDates(viewWeek), [viewWeek])

  const toggleSlot = (dayIndex: number, hour: number) => {
    setSelectedSlots(prev => {
      const exists = prev.find(s => s.dayIndex === dayIndex && s.hour === hour)
      if (exists) {
        return prev.filter(s => !(s.dayIndex === dayIndex && s.hour === hour))
      }
      return [...prev, { dayIndex, hour }]
    })
  }

  const handlePublish = async () => {
    if (!title.trim() || selectedSlots.length === 0 || !contextCode) return
    setPublishing(true)
    try {
      const body: Record<string, any> = {
        'appointment_group[title]': title.trim(),
        'appointment_group[context_codes][]': contextCode,
        'appointment_group[participant_visibility]': 'protected',
        'appointment_group[min_appointments_per_participant]': 0,
        'appointment_group[max_appointments_per_participant]': maxParticipants,
      }
      if (location.trim()) {
        body['appointment_group[location_name]'] = location.trim()
      }
      // Build new_appointments from selected slots
      selectedSlots.forEach((slot, idx) => {
        const date = weekDates[slot.dayIndex]
        const start = new Date(date)
        start.setHours(slot.hour, 0, 0, 0)
        const end = new Date(start)
        end.setMinutes(end.getMinutes() + duration)
        body[`appointment_group[new_appointments][${idx}][]`] = [start.toISOString(), end.toISOString()]
      })

      await canvasFetch('/api/v1/appointment_groups', {
        method: 'POST',
        body
      })
      showToast({ title: 'Published', message: 'Appointment slots published successfully.', type: 'success' })
      setSelectedSlots([])
      setTitle('')
      setLocation('')
      setDuration(30)
      setMaxParticipants(1)
      refetchGroups()
    } catch (err: any) {
      console.error('Publish failed:', err)
      showToast({ title: 'Publish Failed', message: err.message || 'Failed to publish appointment slots.', type: 'error' })
    } finally {
      setPublishing(false)
    }
  }

  const handleReserve = async (slotId: string) => {
    try {
      await canvasFetch(`/api/v1/calendar_events/${slotId}/reservations`, {
        method: 'POST',
        body: {}
      })
      showToast({ title: 'Reserved', message: 'Your appointment has been reserved.', type: 'success' })
      refetchGroups()
      refetchReservations()
    } catch (err: any) {
      console.error('Reserve failed:', err)
      showToast({ title: 'Reservation Failed', message: err.message || 'Could not reserve slot.', type: 'error' })
    }
  }

  const handleCancel = async (slotId: string) => {
    const confirmed = await showConfirm({
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this reservation?',
      confirmLabel: 'Cancel Reservation',
      cancelLabel: 'Keep',
      type: 'warning'
    })
    if (!confirmed) return
    try {
      await canvasFetch(`/api/v1/calendar_events/${slotId}/reservations/self`, {
        method: 'DELETE'
      })
      showToast({ title: 'Cancelled', message: 'Your reservation has been cancelled.', type: 'success' })
      refetchGroups()
      refetchReservations()
    } catch (err: any) {
      console.error('Cancel failed:', err)
      showToast({ title: 'Cancel Failed', message: err.message || 'Could not cancel reservation.', type: 'error' })
    }
  }

  const navigateWeek = (dir: 'prev' | 'next') => {
    const d = new Date(viewWeek)
    d.setDate(d.getDate() + (dir === 'next' ? 7 : -7))
    setViewWeek(d)
  }

  // Build set of reserved slot IDs for quick lookup
  const reservedSlotIds = useMemo(() => {
    const set = new Set<string>()
    reservations.forEach((r: any) => {
      if (r.appointment_group_id && r.id) set.add(String(r.id))
    })
    return set
  }, [reservations])

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 0 }}>
        <div>
          <h2 className="cx-page__title">Appointment Scheduler</h2>
          <p className="cx-page__subtitle" style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
            {isTeacher ? 'Create and manage appointment slots for students.' : 'View available appointment slots and reserve your spot.'}
          </p>
        </div>
      </div>

      {isTeacher ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Teacher Create Form */}
          <div className="cx-section" style={{ padding: 20, borderRadius: 12, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-default)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>Create Appointment Slots</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Title</label>
                <input
                  type="text"
                  className="cx-input"
                  placeholder="e.g., Office Hours"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Duration (minutes)</label>
                <input
                  type="number"
                  className="cx-input"
                  min={5}
                  step={5}
                  value={duration}
                  onChange={e => setDuration(Math.max(5, parseInt(e.target.value) || 5))}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Location</label>
                <input
                  type="text"
                  className="cx-input"
                  placeholder="Room or video link"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>Max participants per slot</label>
                <input
                  type="number"
                  className="cx-input"
                  min={1}
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Week Navigator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => navigateWeek('prev')}>← Prev</button>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => navigateWeek('next')}>Next →</button>
            </div>

            {/* Slot Grid */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 4, minWidth: 640 }}>
                <div />
                {DAYS.map((day, i) => (
                  <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, padding: '6px 0' }}>
                    <div>{day}</div>
                    <div style={{ color: 'var(--cx-text-secondary)', fontWeight: 400 }}>{weekDates[i].getDate()}</div>
                  </div>
                ))}
                {HOURS.map(hour => (
                  <React.Fragment key={hour}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                      {formatTimeLabel(hour)}
                    </div>
                    {DAYS.map((_, dayIndex) => {
                      const selected = selectedSlots.some(s => s.dayIndex === dayIndex && s.hour === hour)
                      return (
                        <button
                          key={`${dayIndex}-${hour}`}
                          onClick={() => toggleSlot(dayIndex, hour)}
                          className={clsx('cx-slot-cell', selected && 'cx-slot-cell--selected')}
                          style={{
                            height: 32,
                            border: '1px solid var(--cx-border-subtle)',
                            borderRadius: 4,
                            background: selected ? 'var(--cx-color-primary)' : 'var(--cx-bg-surface-sunken)',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                          aria-label={`Select ${DAYS[dayIndex]} ${formatTimeLabel(hour)}`}
                          title={`${DAYS[dayIndex]} ${formatTimeLabel(hour)}`}
                        />
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {selectedSlots.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)' }}>{selectedSlots.length} slot(s) selected</span>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setSelectedSlots([])}>Clear</button>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="cx-btn cx-btn--primary cx-btn--sm"
                disabled={!title.trim() || selectedSlots.length === 0 || publishing}
                onClick={handlePublish}
              >
                <PlusSvg /> Publish Slots
              </button>
            </div>
          </div>

          {/* Existing Groups */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>Existing Appointment Groups</h3>
            {groupsLoading ? (
              <p style={{ color: 'var(--cx-text-muted)' }}>Loading…</p>
            ) : appointmentGroups.length === 0 ? (
              <div className="cx-empty" style={{ padding: 32, textAlign: 'center', color: 'var(--cx-text-muted)' }}>
                <CalendarSvg />
                <p>No appointment groups yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {appointmentGroups.map(group => (
                  <div key={group.id} className="cx-section" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--cx-border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{group.title}</div>
                        {group.location_name && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MapPinSvg /> {group.location_name}
                          </div>
                        )}
                      </div>
                      <span className="cx-badge cx-badge--info">{group.appointments_count || 0} slots</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(group.appointments || []).map(slot => (
                        <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--cx-bg-surface-sunken)', borderRadius: 6, fontSize: '0.8125rem' }}>
                          <span><ClockSvg /> {formatSlotTime(slot.start_at, slot.end_at)}</span>
                          <span style={{ color: 'var(--cx-text-secondary)' }}>{slot.child_events_count || 0} / {group.max_appointments_per_participant || 1} reserved</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Student View */}
          {groupsLoading ? (
            <p style={{ color: 'var(--cx-text-muted)' }}>Loading appointment slots…</p>
          ) : appointmentGroups.length === 0 ? (
            <div className="cx-empty" style={{ padding: 32, textAlign: 'center', color: 'var(--cx-text-muted)' }}>
              <CalendarSvg />
              <h3>No open appointments</h3>
              <p>Check back later for available appointment slots.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {appointmentGroups.map(group => (
                <div key={group.id} className="cx-section" style={{ padding: 20, borderRadius: 12, border: '1px solid var(--cx-border-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{group.title}</div>
                      {group.location_name && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <MapPinSvg /> {group.location_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(group.appointments || []).map(slot => {
                      const isReserved = reservedSlotIds.has(String(slot.id)) || (slot.child_events || []).some(ce => ce.reserved)
                      const isFull = (slot.child_events_count || 0) >= (group.max_appointments_per_participant || 1)
                      return (
                        <div
                          key={slot.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: 'var(--cx-bg-surface-sunken)',
                            borderRadius: 8,
                            fontSize: '0.875rem'
                          }}
                        >
                          <span><ClockSvg /> {formatSlotTime(slot.start_at, slot.end_at)}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isReserved ? (
                              <>
                                <span className="cx-badge cx-badge--success">Reserved</span>
                                <button className="cx-btn cx-btn--danger cx-btn--sm" onClick={() => handleCancel(slot.id)}>
                                  <TrashSvg /> Cancel
                                </button>
                              </>
                            ) : isFull ? (
                              <span className="cx-badge cx-badge--secondary">Full</span>
                            ) : (
                              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => handleReserve(slot.id)}>
                                Reserve
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AppointmentScheduler
