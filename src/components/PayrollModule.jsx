import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { bg: '#0d1117', card: '#111827', border: '#1f2d3d', primary: '#4e8ef7', success: '#00d97e', danger: '#f45b69', warning: '#f6c90e' };

export default function PayrollModule() {
    const [payroll, setPayroll] = useState([]);
    const [staff, setStaff] = useState([]);
    const [form, setForm] = useState({ staff_id: '', month: 'January', year: 2026, basic_salary: 0, da: 0, hra: 0, pf: 0, esi: 0, other_deductions: 0 });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        axios.get(`${API}/api/payroll/list`, { headers }).then(r => setPayroll(r.data)).catch(() => { });
        axios.get(`${API}/api/staff`, { headers }).then(r => setStaff(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        const net = Number(form.basic_salary) + Number(form.da) + Number(form.hra) - Number(form.pf) - Number(form.esi) - Number(form.other_deductions);
        await axios.post(`${API}/api/payroll/add`, { ...form, net_salary: net }, { headers });
        const r = await axios.get(`${API}/api/payroll/list`, { headers });
        setPayroll(r.data); setAdding(false);
    };

    const markPaid = async (id) => {
        await axios.put(`${API}/api/payroll/pay/${id}`, {}, { headers });
        const r = await axios.get(`${API}/api/payroll/list`, { headers });
        setPayroll(r.data);
    };

    const totalPayroll = payroll.reduce((a, p) => a + Number(p.net_salary), 0);
    const paid = payroll.filter(p => p.status === 'paid').reduce((a, p) => a + Number(p.net_salary), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '👥', label: 'Total Staff', value: payroll.length, color: '#4e8ef7' },
                    { icon: '💰', label: 'Total Payroll', value: '₹' + totalPayroll.toLocaleString('en-IN'), color: '#f97316' },
                    { icon: '✅', label: 'Paid', value: '₹' + paid.toLocaleString('en-IN'), color: '#00d97e' },
                    { icon: '⏳', label: 'Pending', value: '₹' + (totalPayroll - paid).toLocaleString('en-IN'), color: '#f45b69' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#00d97e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Payroll'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#00d97e' }}>💰 New Payroll Entry</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Staff</label>
                            <select value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                <option value="">Select Staff</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Month</label>
                            <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {MONTHS.map(m => <option key={m}>{m}</option>)}
                            </select>
                        </div>
                        {[
                            { label: 'Basic Salary', key: 'basic_salary' },
                            { label: 'DA', key: 'da' },
                            { label: 'HRA', key: 'hra' },
                            { label: 'PF Deduction', key: 'pf' },
                            { label: 'ESI Deduction', key: 'esi' },
                            { label: 'Other Deductions', key: 'other_deductions' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input type="number" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 16, padding: 14, background: '#0d1117', borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#00d97e', fontSize: 16 }}>
                            Net Salary: ₹{(Number(form.basic_salary) + Number(form.da) + Number(form.hra) - Number(form.pf) - Number(form.esi) - Number(form.other_deductions)).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Save Payroll
                    </button>
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📋 Payroll Records</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Staff', 'Month/Year', 'Basic', 'DA', 'HRA', 'PF', 'Net Salary', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {payroll.map(p => (
                                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{p.name || 'N/A'}</td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{p.month} {p.year}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13 }}>₹{Number(p.basic_salary).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13 }}>₹{Number(p.da).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13 }}>₹{Number(p.hra).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#f45b69', fontSize: 13 }}>₹{Number(p.pf).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#00d97e', fontSize: 14 }}>₹{Number(p.net_salary).toLocaleString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: p.status === 'paid' ? '#00d97e22' : '#f45b69022', color: p.status === 'paid' ? '#00d97e' : '#f45b69', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {p.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        {p.status !== 'paid' && (
                                            <button onClick={() => markPaid(p.id)} style={{ padding: '6px 14px', background: '#00d97e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                                                Mark Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payroll.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No payroll records yet.</p>}
                </div>
            </div>
        </div>
    );
}