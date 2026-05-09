import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Computer', 'Physics', 'Chemistry', 'Biology'];

export default function OnlineClasses() {
    const [classes, setClasses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [form, setForm] = useState({ title: '', subject: 'Mathematics', class: '1st', teacher_id: '', meeting_link: '', scheduled_at: '', duration: 60 });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/online-classes`, { headers }).then(r => setClasses(r.data)).catch(() => { });
        axios.get(`${API}/api/staff`, { headers }).then(r => setStaff(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/online-classes`, form, { headers });
        const r = await axios.get(`${API}/api/online-classes`, { headers });
        setClasses(r.data); setAdding(false);
    };

    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/online-classes/${id}/status`, { status }, { headers });
        const r = await axios.get(`${API}/api/online-classes`, { headers });
        setClasses(r.data);
    };

    const scheduled = classes.filter(c => c.status === 'scheduled').length;
    const completed = classes.filter(c => c.status === 'completed').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '💻', label: 'Total Classes', value: classes.length, color: '#4e8ef7' },
                    { icon: '📅', label: 'Scheduled', value: scheduled, color: '#f6c90e' },
                    { icon: '✅', label: 'Completed', value: completed, color: '#00d97e' },
                    { icon: '🔴', label: 'Live Now', value: classes.filter(c => c.status === 'live').length, color: '#f45b69' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Schedule Class'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>💻 Schedule Online Class</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Title', key: 'title', placeholder: 'e.g. Chapter 5 - Algebra' },
                            { label: 'Meeting Link', key: 'meeting_link', placeholder: 'Google Meet/Zoom link' },
                            { label: 'Scheduled At', key: 'scheduled_at', type: 'datetime-local' },
                            { label: 'Duration (mins)', key: 'duration', type: 'number' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        {[
                            { label: 'Subject', key: 'subject', options: SUBJECTS },
                            { label: 'Class', key: 'class', options: CLASSES },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                    {f.options.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Teacher</label>
                            <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                <option value="">Select Teacher</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Schedule
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {classes.map(cls => (
                    <div key={cls.id} style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${cls.status === 'live' ? '#f45b69' : C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>{cls.title}</p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{cls.subject} · Class {cls.class}</p>
                            </div>
                            <span style={{
                                background: cls.status === 'live' ? '#f45b6922' : cls.status === 'completed' ? '#00d97e22' : '#f6c90e22',
                                color: cls.status === 'live' ? '#f45b69' : cls.status === 'completed' ? '#00d97e' : '#f6c90e',
                                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700
                            }}>
                                {cls.status === 'live' ? '🔴 Live' : cls.status === 'completed' ? '✅ Done' : '📅 Scheduled'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>👨‍🏫 {cls.teacher_name || 'N/A'}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>⏰ {cls.scheduled_at ? new Date(cls.scheduled_at).toLocaleString('en-IN') : 'N/A'}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>⏱️ {cls.duration} mins</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {cls.meeting_link && (
                                <a href={cls.meeting_link} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '8px', background: '#00d97e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                                    🔗 Join
                                </a>
                            )}
                            {cls.status === 'scheduled' && (
                                <button onClick={() => updateStatus(cls.id, 'live')} style={{ flex: 1, padding: '8px', background: '#f45b69', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                    🔴 Go Live
                                </button>
                            )}
                            {cls.status === 'live' && (
                                <button onClick={() => updateStatus(cls.id, 'completed')} style={{ flex: 1, padding: '8px', background: '#6b7280', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                    ✅ End Class
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {classes.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No classes scheduled yet.</p>}
            </div>
        </div>
    );
}