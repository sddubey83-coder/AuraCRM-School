import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Computer', 'Physics', 'Chemistry', 'Biology'];

export default function SyllabusMapping() {
    const [syllabus, setSyllabus] = useState([]);
    const [form, setForm] = useState({ class: '1st', subject: 'Hindi', chapter: '', topic: '' });
    const [adding, setAdding] = useState(false);
    const [filterClass, setFilterClass] = useState('all');
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/syllabus`, { headers }).then(r => setSyllabus(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/syllabus`, form, { headers });
        const r = await axios.get(`${API}/api/syllabus`, { headers });
        setSyllabus(r.data); setAdding(false);
        setForm({ class: '1st', subject: 'Hindi', chapter: '', topic: '' });
    };

    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/syllabus/${id}`, { status }, { headers });
        const r = await axios.get(`${API}/api/syllabus`, { headers });
        setSyllabus(r.data);
    };

    const filtered = filterClass === 'all' ? syllabus : syllabus.filter(s => s.class === filterClass);
    const completed = filtered.filter(s => s.status === 'completed').length;
    const completion = filtered.length ? Math.round(completed / filtered.length * 100) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '📚', label: 'Total Topics', value: filtered.length, color: '#4e8ef7' },
                    { icon: '✅', label: 'Completed', value: completed, color: '#00d97e' },
                    { icon: '⏳', label: 'Pending', value: filtered.length - completed, color: '#f6c90e' },
                    { icon: '📊', label: 'Completion', value: `${completion}%`, color: '#a78bfa' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                    <option value="all">All Classes</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Topic'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>📚 Add Syllabus Topic</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
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
                            { label: 'Chapter', key: 'chapter', placeholder: 'e.g. Chapter 1 - Motion' },
                            { label: 'Topic', key: 'topic', placeholder: 'e.g. Newton\'s Laws' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save Topic
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📚 Syllabus Tracker</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Class', 'Subject', 'Chapter', 'Topic', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#4e8ef7', fontSize: 13 }}>{s.class}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13 }}>{s.subject}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{s.chapter}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{s.topic}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: s.status === 'completed' ? '#00d97e22' : '#f6c90e22', color: s.status === 'completed' ? '#00d97e' : '#f6c90e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {s.status === 'completed' ? '✅ Done' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        {s.status !== 'completed' && (
                                            <button onClick={() => updateStatus(s.id, 'completed')} style={{ padding: '6px 14px', background: '#00d97e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                                Mark Done
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No syllabus topics added yet.</p>}
                </div>
            </div>
        </div>
    );
}