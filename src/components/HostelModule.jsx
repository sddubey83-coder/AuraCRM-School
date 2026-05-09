import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { bg: '#0d1117', card: '#111827', border: '#1f2d3d' };

export default function HostelModule() {
    const [rooms, setRooms] = useState([]);
    const [form, setForm] = useState({ room_no: '', bed_no: '', student_id: '', student_name: '', fees: 5000 });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/hostel`, { headers }).then(r => setRooms(r.data)).catch(() => { });
    }, []);

    const handleAllot = async () => {
        await axios.post(`${API}/api/hostel/allot`, form, { headers });
        const r = await axios.get(`${API}/api/hostel`, { headers });
        setRooms(r.data); setAdding(false);
    };

    const handleVacate = async (id) => {
        if (!window.confirm('Vacate this room?')) return;
        await axios.delete(`${API}/api/hostel/${id}`, { headers });
        const r = await axios.get(`${API}/api/hostel`, { headers });
        setRooms(r.data);
    };

    const occupied = rooms.filter(r => r.status === 'occupied').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🏠', label: 'Total Rooms', value: rooms.length, color: '#4e8ef7' },
                    { icon: '✅', label: 'Occupied', value: occupied, color: '#f45b69' },
                    { icon: '🟢', label: 'Vacant', value: rooms.length - occupied, color: '#00d97e' },
                    { icon: '💰', label: 'Monthly Revenue', value: '₹' + rooms.filter(r => r.status === 'occupied').reduce((a, r) => a + Number(r.fees), 0).toLocaleString('en-IN'), color: '#f97316' },
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
                    {adding ? '✕ Cancel' : '+ Allot Room'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>🏠 Room Allotment</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Room No', key: 'room_no', placeholder: 'e.g. A-101' },
                            { label: 'Bed No', key: 'bed_no', placeholder: 'e.g. B1' },
                            { label: 'Student ID', key: 'student_id', placeholder: 'Student ID' },
                            { label: 'Student Name', key: 'student_name', placeholder: 'Full Name' },
                            { label: 'Monthly Fees', key: 'fees', placeholder: '5000', type: 'number' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAllot} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Allot Room
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🏠 Room Allocation</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Room No', 'Bed No', 'Student', 'Fees', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(r => (
                                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{r.room_no}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{r.bed_no}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13 }}>{r.student_name || '—'}</td>
                                    <td style={{ padding: '12px 14px', color: '#00d97e', fontSize: 13, fontWeight: 700 }}>₹{Number(r.fees).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: r.status === 'occupied' ? '#f45b6922' : '#00d97e22', color: r.status === 'occupied' ? '#f45b69' : '#00d97e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {r.status === 'occupied' ? '🔴 Occupied' : '🟢 Vacant'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        {r.status === 'occupied' && (
                                            <button onClick={() => handleVacate(r.id)} style={{ padding: '6px 14px', background: '#f45b69', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                                Vacate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rooms.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No rooms added yet.</p>}
                </div>
            </div>
        </div>
    );
}