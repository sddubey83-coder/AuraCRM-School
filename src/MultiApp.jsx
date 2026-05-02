// MultiApp.jsx — Multi-feature panel shown in Students tab
// Attendance tracker + Quick notes + Parent communication log

import React, { useState } from 'react';

const SAMPLE_ATTENDANCE = [
    { date: '01 May', present: 42, absent: 8, late: 3 },
    { date: '30 Apr', present: 45, absent: 5, late: 2 },
    { date: '29 Apr', present: 38, absent: 12, late: 3 },
    { date: '28 Apr', present: 47, absent: 3, late: 1 },
    { date: '27 Apr', present: 40, absent: 10, late: 4 },
];

const QUICK_NOTES = [
    { id: 1, text: 'Parent-teacher meeting scheduled for May 10', author: 'Principal', time: '2h ago', color: '#4e8ef7' },
    { id: 2, text: 'Class 8B exam rescheduled to May 15', author: 'Staff', time: '5h ago', color: '#f6c90e' },
    { id: 3, text: 'Rohit Kumar fee pending since March', author: 'Accounts', time: '1d ago', color: '#f45b69' },
];

const COMM_LOG = [
    { student: 'Aarav Sharma', parent: '9876543210', type: 'WhatsApp', msg: 'Fee reminder sent', time: '10:30 AM', status: 'Delivered' },
    { student: 'Priya Verma', parent: '9765432109', type: 'Call', msg: 'Admission follow-up', time: '09:15 AM', status: 'Connected' },
    { student: 'Rahul Singh', parent: '9654321098', type: 'WhatsApp', msg: 'Result notification', time: 'Yesterday', status: 'Read' },
];

export default function MultiApp() {
    const [activePanel, setActivePanel] = useState('attendance');
    const [noteText, setNoteText] = useState('');
    const [notes, setNotes] = useState(QUICK_NOTES);

    const addNote = () => {
        if (!noteText.trim()) return;
        setNotes(n => [{ id: Date.now(), text: noteText, author: 'You', time: 'Just now', color: '#00d97e' }, ...n]);
        setNoteText('');
    };

    const PANELS = [
        { id: 'attendance', label: '📋 Attendance', color: '#4e8ef7' },
        { id: 'notes', label: '📝 Quick Notes', color: '#a78bfa' },
        { id: 'commlog', label: '📞 Comm Log', color: '#00d97e' },
    ];

    return (
        <div style={{ background: '#111827', borderRadius: 16, border: '1px solid #1f2d3d', padding: 24, marginTop: 20 }}>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {PANELS.map(p => (
                    <button key={p.id} onClick={() => setActivePanel(p.id)} style={{
                        padding: '8px 16px', borderRadius: 10, border: activePanel === p.id ? 'none' : '1px solid #1f2d3d',
                        background: activePanel === p.id ? p.color : 'transparent',
                        color: activePanel === p.id ? '#fff' : '#9ca3af',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>{p.label}</button>
                ))}
            </div>

            {/* Attendance Panel */}
            {activePanel === 'attendance' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                        {[
                            { label: 'Avg Present', value: '42/50', color: '#00d97e' },
                            { label: 'Avg Absent', value: '6/50', color: '#f45b69' },
                            { label: 'Avg Late', value: '2/50', color: '#f6c90e' },
                        ].map(s => (
                            <div key={s.label} style={{ background: '#0d1117', borderRadius: 10, padding: '12px 14px', border: '1px solid #1f2d3d', textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1 }}>{s.label.toUpperCase()}</p>
                                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Date', 'Present', 'Absent', 'Late', 'Rate'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SAMPLE_ATTENDANCE.map((row, i) => {
                                const rate = Math.round(row.present / (row.present + row.absent) * 100);
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                        <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13, fontWeight: 600 }}>{row.date}</td>
                                        <td style={{ padding: '12px 14px', color: '#00d97e', fontWeight: 700 }}>{row.present}</td>
                                        <td style={{ padding: '12px 14px', color: '#f45b69', fontWeight: 700 }}>{row.absent}</td>
                                        <td style={{ padding: '12px 14px', color: '#f6c90e', fontWeight: 700 }}>{row.late}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 50, height: 5, background: '#1f2d3d', borderRadius: 4 }}>
                                                    <div style={{ width: `${rate}%`, height: '100%', background: rate >= 80 ? '#00d97e' : '#f45b69', borderRadius: 4 }} />
                                                </div>
                                                <span style={{ fontSize: 12, color: rate >= 80 ? '#00d97e' : '#f45b69', fontWeight: 700 }}>{rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Quick Notes Panel */}
            {activePanel === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input value={noteText} onChange={e => setNoteText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addNote()}
                            placeholder="Add a quick note... (Enter to save)"
                            style={{ flex: 1, background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
                        <button onClick={addNote} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#a78bfa', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            + Add
                        </button>
                    </div>
                    {notes.map(n => (
                        <div key={n.id} style={{
                            background: '#0d1117', borderRadius: 10, padding: '14px 16px',
                            border: `1px solid ${n.color}33`, borderLeft: `3px solid ${n.color}`
                        }}>
                            <p style={{ margin: '0 0 6px', fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}>{n.text}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ fontSize: 11, color: n.color, fontWeight: 700 }}>{n.author}</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>{n.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Communication Log Panel */}
            {activePanel === 'commlog' && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#0d1117' }}>
                            {['Student', 'Parent', 'Channel', 'Message', 'Time', 'Status'].map(h => (
                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {COMM_LOG.map((log, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{log.student}</td>
                                <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{log.parent}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <span style={{
                                        background: log.type === 'WhatsApp' ? '#00d97e22' : '#4e8ef722',
                                        color: log.type === 'WhatsApp' ? '#00d97e' : '#4e8ef7',
                                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                                    }}>{log.type}</span>
                                </td>
                                <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{log.msg}</td>
                                <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{log.time}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <span style={{
                                        background: log.status === 'Connected' ? '#00d97e22' : log.status === 'Read' ? '#4e8ef722' : '#f6c90e22',
                                        color: log.status === 'Connected' ? '#00d97e' : log.status === 'Read' ? '#4e8ef7' : '#f6c90e',
                                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                                    }}>✓ {log.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}