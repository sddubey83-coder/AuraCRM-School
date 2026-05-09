import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export default function GatePass() {
    const [passes, setPasses] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', reason: '', issued_by: '' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/gate-pass`, { headers }).then(r => setPasses(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/gate-pass`, form, { headers });
        const r = await axios.get(`${API}/api/gate-pass`, { headers });
        setPasses(r.data); setAdding(false);
    };

    const handleReturn = async (id) => {
        await axios.put(`${API}/api/gate-pass/${id}/return`, {}, { headers });
        const r = await axios.get(`${API}/api/gate-pass`, { headers });
        setPasses(r.data);
    };

    const printPass = (pass) => {
        const html = `<!DOCTYPE html><html><head><title>Gate Pass</title>
        <style>body{font-family:'Segoe UI',sans-serif;padding:20px}.pass{border:2px solid #333;padding:24px;max-width:400px;margin:0 auto}.title{text-align:center;font-size:20px;font-weight:900;margin-bottom:16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}.sign{display:flex;justify-content:space-between;margin-top:40px}.sig{text-align:center;width:150px}.sig .line{border-top:1px solid #333;padding-top:8px;font-size:11px}</style></head>
        <body><div class="pass">
        <div class="title">🎓 AuraSync School AI<br><small style="font-size:14px">GATE PASS</small></div>
        <div class="row"><span>Student</span><strong>${pass.student_name}</strong></div>
        <div class="row"><span>Class</span><strong>${pass.class}</strong></div>
        <div class="row"><span>Reason</span><strong>${pass.reason}</strong></div>
        <div class="row"><span>Exit Time</span><strong>${new Date(pass.exit_time).toLocaleString('en-IN')}</strong></div>
        <div class="row"><span>Issued By</span><strong>${pass.issued_by}</strong></div>
        <div class="sign"><div class="sig"><div class="line">Student Sign</div></div><div class="sig"><div class="line">Authority Sign</div></div></div>
        </div><script>window.print();</script></body></html>`;
        const win = window.open('', '_blank', 'width=500,height=600');
        if (win) { win.document.write(html); win.document.close(); }
    };

    const active = passes.filter(p => p.status === 'active').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🚪', label: 'Total Today', value: passes.length, color: '#4e8ef7' },
                    { icon: '🟢', label: 'Outside', value: active, color: '#f45b69' },
                    { icon: '✅', label: 'Returned', value: passes.filter(p => p.status === 'returned').length, color: '#00d97e' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#f97316', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Issue Gate Pass'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f97316' }}>🚪 Issue Gate Pass</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Reason', key: 'reason' },
                            { label: 'Issued By', key: 'issued_by' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
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
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#f97316', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        🚪 Issue Pass
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🚪 Gate Pass Log</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Class', 'Reason', 'Exit Time', 'Return Time', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {passes.map(p => (
                                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{p.student_name}</td>
                                    <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13 }}>{p.class}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{p.reason}</td>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>{new Date(p.exit_time).toLocaleTimeString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>{p.return_time ? new Date(p.return_time).toLocaleTimeString('en-IN') : '—'}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: p.status === 'returned' ? '#00d97e22' : '#f45b6922', color: p.status === 'returned' ? '#00d97e' : '#f45b69', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {p.status === 'returned' ? '✅ Returned' : '🔴 Outside'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {p.status === 'active' && (
                                                <button onClick={() => handleReturn(p.id)} style={{ padding: '6px 12px', background: '#00d97e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Return</button>
                                            )}
                                            <button onClick={() => printPass(p)} style={{ padding: '6px 12px', background: '#4e8ef7', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>🖨️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {passes.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No gate passes today.</p>}
                </div>
            </div>
        </div>
    );
}