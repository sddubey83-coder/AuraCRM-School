import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const SPORTS = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Table Tennis', 'Athletics', 'Chess', 'Kabaddi'];
const HOUSES = ['Red House', 'Blue House', 'Green House', 'Yellow House'];
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function SportsModule() {
    const [sports, setSports] = useState([]);
    const [houses, setHouses] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', sport: 'Cricket', house: 'Red House', class: '1st', achievement: '' });
    const [adding, setAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('registrations');
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/sports`, { headers }).then(r => setSports(r.data)).catch(() => { });
        axios.get(`${API}/api/houses`, { headers }).then(r => setHouses(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/sports`, form, { headers });
        const r = await axios.get(`${API}/api/sports`, { headers });
        setSports(r.data); setAdding(false);
    };

    const addPoints = async (id, points) => {
        await axios.put(`${API}/api/houses/${id}/points`, { points }, { headers });
        const r = await axios.get(`${API}/api/houses`, { headers });
        setHouses(r.data);
    };

    const addHouse = async () => {
        const name = prompt('House name?');
        const color = prompt('Color? (e.g. #f45b69)');
        const captain = prompt('Captain name?');
        if (name) {
            await axios.post(`${API}/api/houses`, { house_name: name, color, captain }, { headers });
            const r = await axios.get(`${API}/api/houses`, { headers });
            setHouses(r.data);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🏆', label: 'Registrations', value: sports.length, color: '#4e8ef7' },
                    { icon: '🏠', label: 'Houses', value: houses.length, color: '#f97316' },
                    { icon: '⚽', label: 'Sports', value: [...new Set(sports.map(s => s.sport))].length, color: '#00d97e' },
                    { icon: '🥇', label: 'Achievements', value: sports.filter(s => s.achievement).length, color: '#f6c90e' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'registrations', label: '⚽ Registrations' }, { id: 'houses', label: '🏠 House System' }].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`,
                        background: activeTab === t.id ? '#4e8ef7' : C.card,
                        color: activeTab === t.id ? '#fff' : '#9ca3af',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>{t.label}</button>
                ))}
            </div>

            {activeTab === 'registrations' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#00d97e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                            {adding ? '✕ Cancel' : '+ Register Student'}
                        </button>
                    </div>

                    {adding && (
                        <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                            <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#00d97e' }}>⚽ Sports Registration</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                                {[{ label: 'Student ID', key: 'student_id' }, { label: 'Student Name', key: 'student_name' }, { label: 'Achievement', key: 'achievement' }].map(f => (
                                    <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                        <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                                    </div>
                                ))}
                                {[{ label: 'Sport', key: 'sport', options: SPORTS }, { label: 'House', key: 'house', options: HOUSES }, { label: 'Class', key: 'class', options: CLASSES }].map(f => (
                                    <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                        <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                            {f.options.map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#00d97e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>💾 Register</button>
                        </div>
                    )}

                    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#0d1117' }}>
                                    {['Student', 'Class', 'Sport', 'House', 'Achievement'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sports.map(s => (
                                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</td>
                                        <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13 }}>{s.class}</td>
                                        <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>{s.sport}</td>
                                        <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{s.house}</td>
                                        <td style={{ padding: '12px 14px', color: '#f6c90e', fontSize: 12 }}>{s.achievement || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sports.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No registrations yet.</p>}
                    </div>
                </>
            )}

            {activeTab === 'houses' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={addHouse} style={{ padding: '10px 20px', background: '#f97316', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                            + Add House
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                        {houses.map((h, i) => (
                            <div key={h.id} style={{ background: C.card, borderRadius: 16, padding: 24, border: `2px solid ${h.color || '#4e8ef7'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 900, color: h.color || '#4e8ef7', fontSize: 18 }}>🏠 {h.house_name}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Captain: {h.captain || 'N/A'}</p>
                                    </div>
                                    <span style={{ fontWeight: 900, fontSize: 28, color: h.color || '#4e8ef7' }}>#{i + 1}</span>
                                </div>
                                <h2 style={{ margin: '0 0 16px', fontSize: 36, fontWeight: 900, color: '#f1f5f9' }}>{h.points} pts</h2>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[5, 10, 25].map(p => (
                                        <button key={p} onClick={() => addPoints(h.id, p)} style={{ flex: 1, padding: '8px', background: h.color + '22' || '#4e8ef722', border: `1px solid ${h.color || '#4e8ef7'}`, borderRadius: 8, color: h.color || '#4e8ef7', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                            +{p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {houses.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No houses yet. Add one!</p>}
                    </div>
                </>
            )}
        </div>
    );
}