import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const EMERGENCY_TYPES = ['Fever', 'Injury', 'Allergy', 'Fainting', 'Breathing Issue', 'Stomach Pain', 'Other'];

export default function MedicalEmergency() {
    const [emergencies, setEmergencies] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', emergency_type: 'Fever', description: '', action_taken: '', reported_by: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/medical-emergency`, { headers }).then(r => setEmergencies(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/medical-emergency`, form, { headers });
        const r = await axios.get(`${API}/api/medical-emergency`, { headers });
        setEmergencies(r.data); setAdding(false);
    };

    const today = emergencies.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🚨', label: 'Total Cases', value: emergencies.length, color: '#f45b69' },
                    { icon: '📅', label: 'Today', value: today, color: '#f6c90e' },
                    { icon: '🤒', label: 'Fever Cases', value: emergencies.filter(e => e.emergency_type === 'Fever').length, color: '#f97316' },
                    { icon: '🩹', label: 'Injuries', value: emergencies.filter(e => e.emergency_type === 'Injury').length, color: '#a78bfa' },
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
                    {adding ? '✕ Cancel' : '🚨 Report Emergency'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `2px solid #f45b69` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f45b69' }}>🚨 Medical Emergency Report</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Description', key: 'description' },
                            { label: 'Action Taken', key: 'action_taken' },
                            { label: 'Reported By', key: 'reported_by' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        {[
                            { label: 'Class', key: 'class', options: CLASSES },
                            { label: 'Emergency Type', key: 'emergency_type', options: EMERGENCY_TYPES },
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
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#f45b69', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        🚨 Submit Report
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🚨 Emergency Log</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Class', 'Type', 'Description', 'Action', 'Time'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {emergencies.map(e => (
                                <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{e.student_name}</td>
                                    <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13 }}>{e.class}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: '#f45b6922', color: '#f45b69', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{e.emergency_type}</span>
                                    </td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{e.description}</td>
                                    <td style={{ padding: '12px 14px', color: '#00d97e', fontSize: 12 }}>{e.action_taken}</td>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>{new Date(e.created_at).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {emergencies.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No emergencies recorded.</p>}
                </div>
            </div>
        </div>
    );
}