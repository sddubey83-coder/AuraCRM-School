import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };

export default function MedicalRecords() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', blood_group: 'A+', allergies: '', emergency_contact: '', vaccination_history: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    useEffect(() => {
        axios.get(`${API}/api/medical`, { headers }).then(r => setRecords(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/medical`, form, { headers });
        const r = await axios.get(`${API}/api/medical`, { headers });
        setRecords(r.data); setAdding(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🏥', label: 'Total Records', value: records.length, color: '#4e8ef7' },
                    { icon: '🩸', label: 'A+ Blood Group', value: records.filter(r => r.blood_group === 'A+').length, color: '#f45b69' },
                    { icon: '⚠️', label: 'With Allergies', value: records.filter(r => r.allergies).length, color: '#f6c90e' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#f45b69', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Record'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f45b69' }}>🏥 New Medical Record</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Emergency Contact', key: 'emergency_contact' },
                            { label: 'Allergies', key: 'allergies' },
                            { label: 'Vaccination History', key: 'vaccination_history' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Blood Group</label>
                            <select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#f45b69', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save Record
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🏥 Medical Records</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Blood Group', 'Allergies', 'Emergency Contact', 'Vaccination'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{r.student_name}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: '#f45b6922', color: '#f45b69', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>🩸 {r.blood_group}</span>
                                    </td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{r.allergies || '—'}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>{r.emergency_contact}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{r.vaccination_history || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {records.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No medical records yet.</p>}
                </div>
            </div>
        </div>
    );
}