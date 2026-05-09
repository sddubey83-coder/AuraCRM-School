import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Computer', 'Physics', 'Chemistry', 'Biology'];

export default function BoardExamPrep() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '10th', subject: 'Mathematics', preboard_marks: '', predicted_score: '', weak_areas: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/board-prep`, { headers }).then(r => setRecords(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/board-prep`, form, { headers });
        const r = await axios.get(`${API}/api/board-prep`, { headers });
        setRecords(r.data); setAdding(false);
    };

    const avgPreboard = records.length ? Math.round(records.reduce((a, r) => a + Number(r.preboard_marks), 0) / records.length) : 0;
    const avgPredicted = records.length ? Math.round(records.reduce((a, r) => a + Number(r.predicted_score), 0) / records.length) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '👨‍🎓', label: 'Students', value: records.length, color: '#4e8ef7' },
                    { icon: '📝', label: 'Avg Pre-board', value: `${avgPreboard}%`, color: '#f6c90e' },
                    { icon: '🎯', label: 'Avg Predicted', value: `${avgPredicted}%`, color: '#00d97e' },
                    { icon: '⚠️', label: 'Weak Students', value: records.filter(r => r.preboard_marks < 33).length, color: '#f45b69' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#f97316', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Student'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f97316' }}>📋 Board Exam Prep Entry</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Subject</label>
                            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Class', key: 'class', placeholder: '10th/12th' },
                            { label: 'Pre-board Marks', key: 'preboard_marks', type: 'number' },
                            { label: 'Predicted Score', key: 'predicted_score', type: 'number' },
                            { label: 'Weak Areas', key: 'weak_areas', placeholder: 'e.g. Algebra, Geometry' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#f97316', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📋 Board Exam Tracker</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Class', 'Subject', 'Pre-board', 'Predicted', 'Weak Areas', 'Risk'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{r.student_name}</td>
                                    <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13 }}>{r.class}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>{r.subject}</td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: r.preboard_marks < 33 ? '#f45b69' : '#00d97e', fontSize: 13 }}>{r.preboard_marks}%</td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#4e8ef7', fontSize: 13 }}>{r.predicted_score}%</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{r.weak_areas || '—'}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: r.preboard_marks < 33 ? '#f45b6922' : '#00d97e22', color: r.preboard_marks < 33 ? '#f45b69' : '#00d97e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {r.preboard_marks < 33 ? '⚠️ At Risk' : '✅ Good'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {records.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No board prep records yet.</p>}
                </div>
            </div>
        </div>
    );
}