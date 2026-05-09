import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const TYPES = ['Merit-based', 'Need-based', 'Government', 'Sports', 'Staff Ward', 'Sibling Discount'];

export default function ScholarshipModule() {
    const [scholarships, setScholarships] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', type: 'Merit-based', amount: '', reason: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/scholarships`, { headers }).then(r => setScholarships(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/scholarships`, form, { headers });
        const r = await axios.get(`${API}/api/scholarships`, { headers });
        setScholarships(r.data); setAdding(false);
    };

    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/scholarships/${id}`, { status }, { headers });
        const r = await axios.get(`${API}/api/scholarships`, { headers });
        setScholarships(r.data);
    };

    const totalAmount = scholarships.filter(s => s.status === 'approved').reduce((a, s) => a + Number(s.amount), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🏆', label: 'Total', value: scholarships.length, color: '#4e8ef7' },
                    { icon: '✅', label: 'Approved', value: scholarships.filter(s => s.status === 'approved').length, color: '#00d97e' },
                    { icon: '⏳', label: 'Pending', value: scholarships.filter(s => s.status === 'pending').length, color: '#f6c90e' },
                    { icon: '💰', label: 'Total Amount', value: '₹' + totalAmount.toLocaleString('en-IN'), color: '#f97316' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#f6c90e', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Scholarship'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f6c90e' }}>🏆 New Scholarship</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Amount (₹)', key: 'amount', type: 'number' },
                            { label: 'Reason', key: 'reason' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        {[
                            { label: 'Class', key: 'class', options: CLASSES },
                            { label: 'Type', key: 'type', options: TYPES },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                    {f.options.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#f6c90e', border: 'none', borderRadius: 10, color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🏆 Scholarship Records</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Class', 'Type', 'Amount', 'Reason', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {scholarships.map(s => (
                                <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</td>
                                    <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13 }}>{s.class}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: '#f6c90e22', color: '#f6c90e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{s.type}</span>
                                    </td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#00d97e', fontSize: 13 }}>₹{Number(s.amount).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{s.reason}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: s.status === 'approved' ? '#00d97e22' : s.status === 'rejected' ? '#f45b6922' : '#f6c90e22', color: s.status === 'approved' ? '#00d97e' : s.status === 'rejected' ? '#f45b69' : '#f6c90e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        {s.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => updateStatus(s.id, 'approved')} style={{ padding: '6px 12px', background: '#00d97e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>✅</button>
                                                <button onClick={() => updateStatus(s.id, 'rejected')} style={{ padding: '6px 12px', background: '#f45b69', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>❌</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {scholarships.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No scholarships yet.</p>}
                </div>
            </div>
        </div>
    );
}