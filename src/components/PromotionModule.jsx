import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function PromotionModule() {
    const [promotions, setPromotions] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', current_class: '1st', next_class: '2nd', academic_year: '2024-25', status: 'promoted', reason: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/promotions`, { headers }).then(r => setPromotions(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/promotions`, form, { headers });
        const r = await axios.get(`${API}/api/promotions`, { headers });
        setPromotions(r.data); setAdding(false);
    };

    const promoted = promotions.filter(p => p.status === 'promoted').length;
    const detained = promotions.filter(p => p.status === 'detained').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '👨‍🎓', label: 'Total', value: promotions.length, color: '#4e8ef7' },
                    { icon: '⬆️', label: 'Promoted', value: promoted, color: '#00d97e' },
                    { icon: '⬇️', label: 'Detained', value: detained, color: '#f45b69' },
                    { icon: '⏳', label: 'Pending', value: promotions.filter(p => p.status === 'pending').length, color: '#f6c90e' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#00d97e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Record'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#00d97e' }}>🎓 Promotion/Detention Record</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Academic Year', key: 'academic_year', placeholder: '2024-25' },
                            { label: 'Reason', key: 'reason' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        {[
                            { label: 'Current Class', key: 'current_class' },
                            { label: 'Next Class', key: 'next_class' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                <option value="promoted">Promoted</option>
                                <option value="detained">Detained</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#00d97e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save Record
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🎓 Promotion Records</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Current Class', 'Next Class', 'Year', 'Status', 'Reason'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map(p => (
                                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{p.student_name}</td>
                                    <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13, fontWeight: 700 }}>{p.current_class}</td>
                                    <td style={{ padding: '12px 14px', color: '#00d97e', fontSize: 13, fontWeight: 700 }}>{p.next_class}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{p.academic_year}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{
                                            background: p.status === 'promoted' ? '#00d97e22' : p.status === 'detained' ? '#f45b6922' : '#f6c90e22',
                                            color: p.status === 'promoted' ? '#00d97e' : p.status === 'detained' ? '#f45b69' : '#f6c90e',
                                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700
                                        }}>
                                            {p.status === 'promoted' ? '⬆️ Promoted' : p.status === 'detained' ? '⬇️ Detained' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{p.reason || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {promotions.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No promotion records yet.</p>}
                </div>
            </div>
        </div>
    );
}