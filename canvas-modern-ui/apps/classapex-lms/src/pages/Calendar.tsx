import React, { useState, useMemo } from 'react';
import clsx from 'clsx';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type: 'assignment' | 'exam' | 'lecture' | 'meeting' | 'deadline' | 'other';
  course?: { id: string; name: string; color?: string };
  attendees?: number;
  isAllDay?: boolean;
  isRecurring?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
}

// We will fetch these from Canvas API instead
// const mockEvents = ...
// const mockCourses = ...

const ChevronLeftSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3L5 8l5 5"/></svg>;
const ChevronRightSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3l5 5-5 5"/></svg>;
const SearchSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>;
const PlusSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>;
const CalendarIconSvg = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 7h14"/><path d="M6 2v3M14 2v3"/></svg>;
const ClockSvg = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>;
const MapPinSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1a4.5 4.5 0 00-4.5 4.5c0 3 4.5 7.5 4.5 7.5s4.5-4.5 4.5-7.5A4.5 4.5 0 007 1z"/><circle cx="7" cy="5.5" r="1.5"/></svg>;
const XSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>;
const EditSvg = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg>;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getTypeColor(type: string) {
  const map: Record<string, string> = { assignment: '#3b82f6', exam: '#ef4444', lecture: '#10b981', meeting: '#f59e0b', deadline: '#8b5cf6', other: '#6b7280' };
  return map[type] || '#6b7280';
}

import { useCanvasQuery } from '../hooks/useCanvasQuery';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    title: '', description: '', startDate: '', endDate: '',
    location: '', type: 'other', isAllDay: false,
  });

  // Live Canvas API — courses and calendar events
  const { data: coursesData } = useCanvasQuery<any[]>(
    '/api/v1/courses',
    { enrollment_state: 'active', per_page: 50 } as any
  )
  const courses = Array.isArray(coursesData) ? coursesData : []

  const { data: eventsData, refetch } = useCanvasQuery<any[]>('/api/v1/calendar_events', { all_events: true, per_page: 100 } as any)
  
  // Map Canvas API events to internal CalendarEvent shape
  const events = useMemo(() => {
    if (!Array.isArray(eventsData)) return [];
    return eventsData.map(e => ({
      id: String(e.id),
      title: e.title || e.name || 'Untitled Event',
      description: e.description,
      startDate: e.start_at || e.created_at,
      endDate: e.end_at,
      location: e.location_name,
      type: (e.type === 'assignment' ? 'assignment' : 'other') as CalendarEvent['type'],
      course: courses.find(c => String(c.id) === String(e.context_code?.replace('course_', ''))),
      isAllDay: e.all_day,
      status: 'upcoming' as const,
    }))
  }, [eventsData, courses])

  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    if (filterCourse !== 'all') filtered = filtered.filter(e => String(e.course?.id) === filterCourse);
    if (filterType !== 'all') filtered = filtered.filter(e => e.type === filterType);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    return filtered;
  }, [events, filterCourse, filterType, searchTerm]);

  const viewEvents = useMemo(() => {
    const now = currentDate;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);

    return filteredEvents.filter(e => {
      const d = new Date(e.startDate);
      switch (viewMode) {
        case 'month': return d >= startOfMonth && d <= endOfMonth;
        case 'week': return d >= startOfWeek && d <= endOfWeek;
        case 'day': return d.toDateString() === now.toDateString();
        case 'agenda': return d >= now;
        default: return true;
      }
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [filteredEvents, currentDate, viewMode]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      upcoming: filteredEvents.filter(e => new Date(e.startDate) > now).length,
      today: filteredEvents.filter(e => new Date(e.startDate).toDateString() === now.toDateString()).length,
      thisWeek: filteredEvents.filter(e => { const d = new Date(e.startDate); const sw = new Date(now); sw.setDate(now.getDate() - now.getDay()); const ew = new Date(sw); ew.setDate(sw.getDate() + 6); return d >= sw && d <= ew; }).length,
      overdue: filteredEvents.filter(e => new Date(e.startDate) < now && e.status === 'upcoming').length,
    };
  }, [filteredEvents]);

  const navigateDate = (dir: 'prev' | 'next' | 'today') => {
    const d = new Date(currentDate);
    if (dir === 'today') { setCurrentDate(new Date()); return; }
    const offset = viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1;
    d.setDate(d.getDate() + (dir === 'next' ? offset : -offset));
    setCurrentDate(d);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const todayStr = new Date().toDateString();

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return viewEvents.filter(e => new Date(e.startDate).toDateString() === dateStr);
  };

  const formatTime = (s: string) => new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const views = ['month', 'week', 'day', 'agenda'] as const;

  const openCreateModal = () => {
    setEditingEvent(null);
    setEventForm({ title: '', description: '', startDate: '', endDate: '', location: '', type: 'other', isAllDay: false });
    setShowEventModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate ? event.endDate.slice(0, 16) : '',
      location: event.location || '',
      type: event.type,
      isAllDay: event.isAllDay || false,
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title?.trim()) return;
    try {
      const body: Record<string, any> = {
        'calendar_event[context_code]': eventForm.course?.id
          ? `course_${eventForm.course.id}`
          : 'user_self',
        'calendar_event[title]': eventForm.title,
      }
      if (eventForm.description) body['calendar_event[description]'] = eventForm.description
      if (eventForm.startDate) body['calendar_event[start_at]'] = new Date(eventForm.startDate).toISOString()
      if (eventForm.endDate) body['calendar_event[end_at]'] = new Date(eventForm.endDate).toISOString()
      if (eventForm.location) body['calendar_event[location_name]'] = eventForm.location
      if (eventForm.isAllDay) body['calendar_event[all_day]'] = 'true'

      const formData = new URLSearchParams(body as any).toString()

      const isEditing = !!editingEvent
      const url = isEditing
        ? `/api/v1/calendar_events/${editingEvent!.id}`
        : '/api/v1/calendar_events'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setShowEventModal(false)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to save event. Check your permissions.')
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return
    if (!confirm('Delete this event?')) return
    try {
      const res = await fetch(`/api/v1/calendar_events/${editingEvent.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setShowEventModal(false)
      setSelectedEvent(null)
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to delete event.')
    }
  };

  const handleExportICal = () => {
    // Generate simple iCal from currently filtered events
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ClassApex//LMS//EN\n'
    filteredEvents.forEach(e => {
      const dtStart = new Date(e.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const dtEnd = e.endDate ? new Date(e.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : dtStart
      ical += 'BEGIN:VEVENT\n'
      ical += `UID:${e.id}@classapex.local\n`
      ical += `DTSTAMP:${dtStart}\n`
      ical += `DTSTART:${dtStart}\n`
      ical += `DTEND:${dtEnd}\n`
      ical += `SUMMARY:${e.title}\n`
      if (e.description) ical += `DESCRIPTION:${e.description.replace(/\n/g, '\\n')}\n`
      if (e.location) ical += `LOCATION:${e.location}\n`
      ical += 'END:VEVENT\n'
    })
    ical += 'END:VCALENDAR'

    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'calendar.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData('text/plain')
    if (!eventId) return
    
    const ev = events.find(x => x.id === eventId)
    if (!ev) return

    // Calculate new start/end dates keeping the same time of day
    const oldStart = new Date(ev.startDate)
    const newStart = new Date(targetDateStr)
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), oldStart.getSeconds())

    let newEndStr = ''
    if (ev.endDate) {
      const oldEnd = new Date(ev.endDate)
      const durationMs = oldEnd.getTime() - oldStart.getTime()
      const newEnd = new Date(newStart.getTime() + durationMs)
      newEndStr = newEnd.toISOString()
    }

    try {
      const body: Record<string, string> = {
        'calendar_event[start_at]': newStart.toISOString()
      }
      if (newEndStr) body['calendar_event[end_at]'] = newEndStr

      const res = await fetch(`/api/v1/calendar_events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body).toString(),
      })
      if (!res.ok) throw new Error('Failed to reschedule')
      refetch()
    } catch (err) {
      console.error(err)
      alert('Failed to reschedule event.')
    }
  }

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ justifyContent: 'flex-end', paddingTop: 0, gap: 12 }}>
        <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleExportICal}>Export iCal</button>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={openCreateModal}><PlusSvg /> Create Event</button>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Today', value: stats.today, icon: <CalendarIconSvg /> },
          { label: 'This Week', value: stats.thisWeek, icon: <ClockSvg /> },
          { label: 'Upcoming', value: stats.upcoming, icon: <CalendarIconSvg /> },
          { label: 'Overdue', value: stats.overdue, icon: <ClockSvg />, trend: stats.overdue > 0 ? 'decrease' as const : 'neutral' as const },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
              <div className={clsx('cx-stat-card__change', s.trend && `cx-stat-card__change--${s.trend}`)}>{s.trend === 'decrease' ? 'Needs attention' : 'On track'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-calendar-controls">
        <div className="cx-calendar-nav">
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => navigateDate('prev')}><ChevronLeftSvg /></button>
          <h2 className="cx-calendar-title">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => navigateDate('next')}><ChevronRightSvg /></button>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => navigateDate('today')}>Today</button>
        </div>
        <div className="cx-calendar-views">
          {views.map(v => (
            <button key={v} className={clsx('cx-tab', viewMode === v && 'cx-tab--active')} onClick={() => setViewMode(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="cx-toolbar" style={{ marginBottom: 16 }}>
        <div className="cx-search">
          <SearchSvg />
          <input type="search" className="cx-search__input" placeholder="Search events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="cx-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <select className="cx-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {['assignment','exam','lecture','meeting','deadline','other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
      </div>

      {viewMode === 'month' && (
        <div className="cx-calendar-grid">
          <div className="cx-calendar-grid__header">
            {DAYS.map(d => <div key={d} className="cx-calendar-grid__day-name">{d}</div>)}
          </div>
          <div className="cx-calendar-grid__body">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="cx-calendar-grid__cell cx-calendar-grid__cell--empty" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const dateStr = dateObj.toDateString()
              const events = viewEvents.filter(e => new Date(e.startDate).toDateString() === dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div 
                  key={day} 
                  className={clsx('cx-calendar-grid__cell', isToday && 'cx-calendar-grid__cell--today')}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                >
                  <span className="cx-calendar-grid__date">{day}</span>
                  <div className="cx-calendar-grid__events">
                    {events.slice(0, 3).map(e => (
                      <button 
                        key={e.id} 
                        className="cx-calendar-grid__event" 
                        style={{ background: getTypeColor(e.type), cursor: 'grab' }} 
                        onClick={() => setSelectedEvent(e)} 
                        title={e.title}
                        draggable
                        onDragStart={(evt) => handleDragStart(evt, e.id)}
                      >
                        {e.title}
                      </button>
                    ))}
                    {events.length > 3 && <span className="cx-calendar-grid__more">+{events.length - 3} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'agenda' && (
        <div className="cx-section">
          {viewEvents.length === 0 ? (
            <div className="cx-empty">
              <CalendarIconSvg />
              <h3>No upcoming events</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {viewEvents.map(event => (
                <div key={event.id} className="cx-event-card" onClick={() => setSelectedEvent(event)}>
                  <div className="cx-event-card__dot" style={{ background: getTypeColor(event.type) }} />
                  <div className="cx-event-card__body">
                    <div className="cx-event-card__title">{event.title}</div>
                    <div className="cx-event-card__meta">
                      <span><ClockSvg /> {formatTime(event.startDate)}{event.endDate ? ` - ${formatTime(event.endDate)}` : ''}</span>
                      {event.location && <span><MapPinSvg /> {event.location}</span>}
                      {event.course && <span className="cx-badge cx-badge--info">{event.course.name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="cx-calendar-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16 }}>
          {Array.from({ length: 7 }).map((_, d) => {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - date.getDay() + d);
            const dateStr = date.toDateString();
            const isToday = dateStr === todayStr;
            const dayEvents = viewEvents.filter(e => new Date(e.startDate).toDateString() === dateStr);

            return (
              <div 
                key={d} 
                className="cx-calendar-week-col" 
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '2px solid var(--cx-border-color)', color: isToday ? 'var(--cx-color-primary)' : 'var(--cx-text-secondary)' }}>
                  <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', fontWeight: 600 }}>{DAYS[d]}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: isToday ? 700 : 400 }}>{date.getDate()}</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="cx-event-card cx-event-card--sm" 
                      style={{ padding: 8, cursor: 'grab', borderLeft: `3px solid ${getTypeColor(event.type)}` }} 
                      onClick={() => setSelectedEvent(event)}
                      draggable
                      onDragStart={(evt) => handleDragStart(evt, event.id)}
                    >
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>{event.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-secondary)' }}>
                        {formatTime(event.startDate)}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)', textAlign: 'center', padding: '16px 0' }}>No events</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'day' && (
        <div className="cx-section">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {viewEvents.map(event => (
              <div key={event.id} className="cx-event-card" onClick={() => setSelectedEvent(event)}>
                <div className="cx-event-card__dot" style={{ background: getTypeColor(event.type) }} />
                <div className="cx-event-card__body">
                  <div className="cx-event-card__title">{event.title}</div>
                  <div className="cx-event-card__meta">
                    <span><ClockSvg /> {formatTime(event.startDate)}{event.endDate ? ` - ${formatTime(event.endDate)}` : ''}</span>
                    {event.location && <span><MapPinSvg /> {event.location}</span>}
                    {event.course && <span className="cx-badge cx-badge--info">{event.course.name}</span>}
                  </div>
                </div>
              </div>
            ))}
            {viewEvents.length === 0 && (
              <div className="cx-empty">
                <CalendarIconSvg />
                <h3>No events today</h3>
                <p>Adjust your filters to see more events.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="cx-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="cx-modal" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedEvent.title}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setSelectedEvent(null)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              {selectedEvent.description && <p style={{ color: 'var(--cx-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{selectedEvent.description}</p>}
              <div className="cx-detail-grid">
                <div><span className="cx-detail-label">When</span><span>{new Date(selectedEvent.startDate).toLocaleString()}{selectedEvent.endDate ? ` - ${new Date(selectedEvent.endDate).toLocaleString()}` : ''}</span></div>
                {selectedEvent.location && <div><span className="cx-detail-label">Where</span><span>{selectedEvent.location}</span></div>}
                {selectedEvent.course && <div><span className="cx-detail-label">Course</span><span>{selectedEvent.course.name}</span></div>}
                <div><span className="cx-detail-label">Type</span><span style={{ color: getTypeColor(selectedEvent.type) }}>{selectedEvent.type}</span></div>
                {selectedEvent.attendees != null && <div><span className="cx-detail-label">Attendees</span><span>{selectedEvent.attendees}</span></div>}
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => { setSelectedEvent(null); openEditModal(selectedEvent); }}><EditSvg /> Edit</button>
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="cx-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowEventModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Title</label>
                  <input type="text" className="cx-input" style={{ width: '100%' }} placeholder="Event title" value={eventForm.title}
                    onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea className="cx-input" style={{ width: '100%', resize: 'vertical', minHeight: 60 }} rows={3} placeholder="Event description" value={eventForm.description}
                    onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Start</label>
                    <input type="datetime-local" className="cx-input" style={{ width: '100%' }} value={eventForm.startDate}
                      onChange={e => setEventForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>End</label>
                    <input type="datetime-local" className="cx-input" style={{ width: '100%' }} value={eventForm.endDate}
                      onChange={e => setEventForm(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Location</label>
                    <input type="text" className="cx-input" style={{ width: '100%' }} placeholder="Room or link" value={eventForm.location}
                      onChange={e => setEventForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Type</label>
                    <select className="cx-select" style={{ width: '100%' }} value={eventForm.type}
                      onChange={e => setEventForm(p => ({ ...p, type: e.target.value as any }))}>
                      <option value="assignment">Assignment</option>
                      <option value="exam">Exam</option>
                      <option value="lecture">Lecture</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Course</label>
                  <select className="cx-select" style={{ width: '100%' }} value={eventForm.course?.id || ''}
                    onChange={e => setEventForm(p => ({ ...p, course: courses.find(c => String(c.id) === e.target.value) }))}>
                    <option value="">No course</option>
                    {courses.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </select>
                </div>
                <label className="cx-toggle">
                  <input type="checkbox" checked={eventForm.isAllDay || false}
                    onChange={e => setEventForm(p => ({ ...p, isAllDay: e.target.checked }))} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={{ fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }}>All Day Event</span>
                </label>
              </div>
            </div>
            <div className="cx-modal__footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {editingEvent && (
                  <button className="cx-btn cx-btn--danger cx-btn--sm" onClick={handleDeleteEvent}>Delete</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!eventForm.title?.trim()} onClick={handleSaveEvent}>
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
