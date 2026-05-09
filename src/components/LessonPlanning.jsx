import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Computer', 'Physics', 'Chemistry', 'Biology'];

export default function LessonPlanning() {
    const [lessons, setLessons] = useState([]);
    const [staff, setStaff] = useState([]);
    const [form, setForm] = useState({ staff_id: '', class: '1st', subject: 'Hindi', topic: '', date: new Date().toISOString().split('T')[0], duration: 45, notes: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/lessons`, { headers }).then(r => setLessons(r.data)).catch(() => { });
        axios.get(`${API}/api/staff`, { headers }).then(r => setStaff(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/lessons`, form, { headers });
        const r = await axios.get(`${API}/api/lessons`, { headers });
        setLessons(r.data); setAdding(false);
    };

    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/lessons/${id}`, { status }, { headers });
        const r = await axios.get(`${API}/api/lessons`, { headers });
        setLessons(r.data);
    };

    const completed = lessons.filter(l => l.status === 'completed').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '📝', label: 'Total Plans', value: lessons.length, color: '#4e8ef7' },
                    { icon: '✅', label: 'Completed', value: completed, color: '#00d97e' },
                    { icon: '⏳', label: 'Planned', value: lessons.filter(l => l.status === 'planned').length, color: '#f6c90e' },
                    { icon: '📊', label: 'Completion', value: lessons.length ? `${Math.round(completed / lessons.length * 100)}%` : '0%', color: '#a78bfa' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#a78bfa', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Lesson Plan'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#a78bfa' }}>📝 New Lesson Plan</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Teacher</label>
                            <select value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                <option value="">Select Teacher</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Class</label>
                            <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {CLASSES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Subject</label>
                            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        {[
                            { label: 'Topic', key: 'topic', placeholder: 'Lesson topic' },
                            { label: 'Date', key: 'date', type: 'date' },
                            { label: 'Duration (mins)', key: 'duration', type: 'number', placeholder: '45' },
                            { label: 'Notes', key: 'notes', placeholder: 'Optional notes' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#a78bfa', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save Plan
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📝 Lesson Plans</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Teacher', 'Class', 'Subject', 'Topic', 'Date', 'Duration', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map(l => (
                                <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{l.teacher_name || 'N/A'}</td>
                                    <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13, fontWeight: 700 }}>{l.class}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>{l.subject}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{l.topic}</td>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{new Date(l.date).toLocaleDateString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{l.duration} min</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: l.status === 'completed' ? '#00d97e22' : '#f6c90e22', color: l.status === 'completed' ? '#00d97e' : '#f6c90e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {l.status === 'completed' ? '✅ Done' : '⏳ Planned'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        {l.status !== 'completed' && (
                                            <button onClick={() => updateStatus(l.id, 'completed')} style={{ padding: '6px 14px', background: '#00d97e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                                Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {lessons.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No lesson plans yet.</p>}
                </div>
            </div>
        </div>
    );
}