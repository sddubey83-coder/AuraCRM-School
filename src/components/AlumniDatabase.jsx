import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };

export default function AlumniDatabase() {
    const [alumni, setAlumni] = useState([]);
    const [form, setForm] = useState({ student_name: '', pass_out_year: new Date().getFullYear(), class: '12th', phone: '', email: '', current_city: '', occupation: '' });
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/alumni`, { headers }).then(r => setAlumni(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/alumni`, form, { headers });
        const r = await axios.get(`${API}/api/alumni`, { headers });
        setAlumni(r.data); setAdding(false);
    };

    const filtered = alumni.filter(a => !search || a.student_name?.toLowerCase().includes(search.toLowerCase()) || a.occupation?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🎓', label: 'Total Alumni', value: alumni.length, color: '#4e8ef7' },
                    { icon: '📅', label: 'Latest Batch', value: alumni.length ? Math.max(...alumni.map(a => a.pass_out_year)) : '—', color: '#00d97e' },
                    { icon: '🏙️', label: 'Cities', value: [...new Set(alumni.map(a => a.current_city).filter(Boolean))].length, color: '#f97316' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <input placeholder="🔍 Search alumni..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Alumni'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>🎓 Add Alumni</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Name', key: 'student_name' },
                            { label: 'Pass Out Year', key: 'pass_out_year', type: 'number' },
                            { label: 'Class', key: 'class' },
                            { label: 'Phone', key: 'phone' },
                            { label: 'Email', key: 'email' },
                            { label: 'Current City', key: 'current_city' },
                            { label: 'Occupation', key: 'occupation' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {filtered.map(a => (
                    <div key={a.id} style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#4e8ef7,#a78bfa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>{a.student_name}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Batch {a.pass_out_year} · Class {a.class}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[
                                { icon: '💼', value: a.occupation },
                                { icon: '🏙️', value: a.current_city },
                                { icon: '📱', value: a.phone },
                                { icon: '📧', value: a.email },
                            ].filter(r => r.value).map((r, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontSize: 14 }}>{r.icon}</span>
                                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No alumni records yet.</p>}
            </div>
        </div>
    );
}