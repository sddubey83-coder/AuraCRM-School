import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function DropoutPrediction() {
    const [predictions, setPredictions] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', attendance_percent: '', fee_pending: '', performance_score: '' });
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/dropout-prediction`, { headers }).then(r => setPredictions(r.data)).catch(() => { });
    }, []);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        const r = await axios.post(`${API}/api/dropout-prediction/analyze`, form, { headers });
        setResult(r.data);
        const p = await axios.get(`${API}/api/dropout-prediction`, { headers });
        setPredictions(p.data);
        setAnalyzing(false);
    };

    const highRisk = predictions.filter(p => p.risk_level === 'High').length;
    const medRisk = predictions.filter(p => p.risk_level === 'Medium').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '👨‍🎓', label: 'Analyzed', value: predictions.length, color: '#4e8ef7' },
                    { icon: '🔴', label: 'High Risk', value: highRisk, color: '#f45b69' },
                    { icon: '🟡', label: 'Medium Risk', value: medRisk, color: '#f6c90e' },
                    { icon: '🟢', label: 'Low Risk', value: predictions.length - highRisk - medRisk, color: '#00d97e' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#a78bfa' }}>🤖 AI Dropout Analysis</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Attendance %', key: 'attendance_percent', type: 'number', placeholder: 'e.g. 65' },
                            { label: 'Fee Pending (₹)', key: 'fee_pending', type: 'number' },
                            { label: 'Performance Score', key: 'performance_score', type: 'number', placeholder: 'e.g. 45' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Class</label>
                            <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {CLASSES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <button onClick={handleAnalyze} disabled={analyzing} style={{ padding: '12px', background: analyzing ? '#374151' : '#a78bfa', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                            {analyzing ? '⏳ Analyzing...' : '🤖 Analyze Risk'}
                        </button>
                    </div>

                    {result && (
                        <div style={{ marginTop: 16, padding: 16, background: '#0d1117', borderRadius: 12, border: `2px solid ${result.risk_level === 'High' ? '#f45b69' : result.risk_level === 'Medium' ? '#f6c90e' : '#00d97e'}` }}>
                            <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#f1f5f9' }}>Analysis Result:</p>
                            <p style={{ margin: '0 0 4px', fontSize: 14, color: result.risk_level === 'High' ? '#f45b69' : result.risk_level === 'Medium' ? '#f6c90e' : '#00d97e', fontWeight: 900, fontSize: 20 }}>
                                {result.risk_level === 'High' ? '🔴' : result.risk_level === 'Medium' ? '🟡' : '🟢'} {result.risk_level} Risk
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Risk Score: {result.risk_score}/100</p>
                        </div>
                    )}
                </div>

                <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📋 At-Risk Students</p>
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                        {predictions.filter(p => p.risk_level !== 'Low').map(p => (
                            <div key={p.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{p.student_name}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>Class {p.class} · Attendance: {p.attendance_percent}%</p>
                                </div>
                                <span style={{ background: p.risk_level === 'High' ? '#f45b6922' : '#f6c90e22', color: p.risk_level === 'High' ? '#f45b69' : '#f6c90e', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                    {p.risk_level} Risk
                                </span>
                            </div>
                        ))}
                        {predictions.filter(p => p.risk_level !== 'Low').length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No at-risk students!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}