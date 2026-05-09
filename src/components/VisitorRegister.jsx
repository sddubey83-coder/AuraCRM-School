import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };

export default function VisitorRegister() {
    const [visitors, setVisitors] = useState([]);
    const [form, setForm] = useState({ visitor_name: '', purpose: '', whom_to_meet: '', phone: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/visitors`, { headers }).then(r => setVisitors(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/visitors`, form, { headers });
        const r = await axios.get(`${API}/api/visitors`, { headers });
        setVisitors(r.data); setAdding(false);
        setForm({ visitor_name: '', purpose: '', whom_to_meet: '', phone: '' });
    };

    const handleExit = async (id) => {
        await axios.put(`${API}/api/visitors/exit/${id}`, {}, { headers });
        const r = await axios.get(`${API}/api/visitors`, { headers });
        setVisitors(r.data);
    };

    const active = visitors.filter(v => !v.exit_time).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🚪', label: 'Total Today', value: visitors.length, color: '#4e8ef7' },
                    { icon: '🟢', label: 'Inside', value: active, color: '#00d97e' },
                    { icon: '🔴', label: 'Exited', value: visitors.length - active, color: '#f45b69' },
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
                    {adding ? '✕ Cancel' : '+ New Visitor'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>🚪 New Visitor Entry</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Visitor Name', key: 'visitor_name' },
                            { label: 'Phone', key: 'phone' },
                            { label: 'Purpose', key: 'purpose' },
                            { label: 'Whom to Meet', key: 'whom_to_meet' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Register Entry
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🚪 Visitor Log</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Name', 'Phone', 'Purpose', 'Meeting', 'Entry', 'Exit', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visitors.map(v => (
                                <tr key={v.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{v.visitor_name}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{v.phone}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>{v.purpose}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{v.whom_to_meet}</td>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>{new Date(v.entry_time).toLocaleTimeString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>{v.exit_time ? new Date(v.exit_time).toLocaleTimeString('en-IN') : '—'}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        {!v.exit_time && (
                                            <button onClick={() => handleExit(v.id)} style={{ padding: '6px 14px', background: '#f45b69', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                                Exit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {visitors.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No visitors today.</p>}
                </div>
            </div>
        </div>
    );
}