import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function FeeStructure() {
    const [structure, setStructure] = useState([]);
    const [form, setForm] = useState({ class: '1st', tuition_fee: 0, transport_fee: 0, hostel_fee: 0, activity_fee: 0, exam_fee: 0, academic_year: '2024-25' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/fee-structure`, { headers }).then(r => setStructure(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/fee-structure`, form, { headers });
        const r = await axios.get(`${API}/api/fee-structure`, { headers });
        setStructure(r.data); setAdding(false);
    };

    const total = (f) => Number(f.tuition_fee) + Number(f.transport_fee) + Number(f.hostel_fee) + Number(f.activity_fee) + Number(f.exam_fee);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Fee Structure'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>💰 Fee Structure</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Class</label>
                            <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {CLASSES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        {[
                            { label: 'Tuition Fee', key: 'tuition_fee' },
                            { label: 'Transport Fee', key: 'transport_fee' },
                            { label: 'Hostel Fee', key: 'hostel_fee' },
                            { label: 'Activity Fee', key: 'activity_fee' },
                            { label: 'Exam Fee', key: 'exam_fee' },
                            { label: 'Academic Year', key: 'academic_year' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.key === 'academic_year' ? 'text' : 'number'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 14, padding: 14, background: '#0d1117', borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#00d97e' }}>
                            Total: ₹{(Number(form.tuition_fee) + Number(form.transport_fee) + Number(form.hostel_fee) + Number(form.activity_fee) + Number(form.exam_fee)).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>💰 Fee Structure ({structure.length} classes)</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Class', 'Tuition', 'Transport', 'Hostel', 'Activity', 'Exam', 'Total', 'Year'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {structure.map(f => (
                                <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#4e8ef7', fontSize: 13 }}>{f.class}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>₹{Number(f.tuition_fee).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>₹{Number(f.transport_fee).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>₹{Number(f.hostel_fee).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>₹{Number(f.activity_fee).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 12 }}>₹{Number(f.exam_fee).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#00d97e', fontSize: 13 }}>₹{total(f).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{f.academic_year}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {structure.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No fee structure added yet.</p>}
                </div>
            </div>
        </div>
    );
}