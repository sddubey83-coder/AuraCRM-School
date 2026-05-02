// AcademicCalendar.jsx — Full Year Planner
import React, { useState } from 'react';

const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7', holiday: '#ef4444', exam: '#f59e0b' };

const EVENTS = [
    { date: '2025-01-01', title: 'New Year Holiday', type: 'holiday', color: C.holiday },
    { date: '2025-01-15', title: 'Republic Day', type: 'holiday', color: C.holiday },
    { date: '2025-02-15', title: 'Unit Test 1', type: 'exam', color: C.exam },
    { date: '2025-03-01', title: 'Annual Exam Start', type: 'exam', color: C.exam },
];

export default function AcademicCalendar() {
    const [currentMonth, setCurrentMonth] = useState(0);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const daysInMonth = 30;
    const today = new Date().getDate();

    return (
        <div style={{ padding: 24, background: C.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: 'white', margin: 0 }}>📅 Academic Calendar 2024-25</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} style={{ padding: '8px 16px', background: C.primary, color: 'white', border: 'none', borderRadius: 6 }}>‹</button>
                    <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{months[currentMonth]} 2025</span>
                    <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} style={{ padding: '8px 16px', background: C.primary, color: 'white', border: 'none', borderRadius: 6 }}>›</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, background: C.card, padding: 20, borderRadius: 16 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{ padding: 12, textAlign: 'center', color: '#9ca3af', fontWeight: 600, fontSize: 12 }}>
                        {day}
                    </div>
                ))}

                {Array.from({ length: 42 }, (_, i) => {
                    const day = i % 7 === 0 ? 1 : (i % 7) + 1;
                    const dayEvents = EVENTS.filter(e => e.date.endsWith(`-${String(day).padStart(2, '0')}`));

                    return (
                        <div key={i} style={{
                            padding: 12,
                            textAlign: 'center',
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: day === today ? '#3b82f6' : 'transparent',
                            color: day === today ? 'white' : 'white',
                            position: 'relative',
                            minHeight: 60
                        }}>
                            <div style={{ fontWeight: day <= daysInMonth ? 600 : 300, fontSize: day <= daysInMonth ? 14 : 12 }}>
                                {day <= daysInMonth ? day : ''}
                            </div>
                            {dayEvents.map(event => (
                                <div key={event.id} style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    left: 2,
                                    right: 2,
                                    background: event.color + '44',
                                    color: event.color,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}