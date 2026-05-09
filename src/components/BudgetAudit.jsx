import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CATEGORIES = ['Salary', 'Infrastructure', 'Books & Stationery', 'Sports', 'Events', 'Maintenance', 'Utilities', 'Transport', 'Other'];

export default function BudgetAudit() {
    const [budget, setBudget] = useState([]);
    const [form, setForm] = useState({ category: 'Salary', type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/budget`, { headers }).then(r => setBudget(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/budget`, form, { headers });
        const r = await axios.get(`${API}/api/budget`, { headers });
        setBudget(r.data); setAdding(false);
    };

    const totalIncome = budget.filter(b => b.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const totalExpense = budget.filter(b => b.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '📈', label: 'Total Income', value: '₹' + totalIncome.toLocaleString('en-IN'), color: '#00d97e' },
                    { icon: '📉', label: 'Total Expense', value: '₹' + totalExpense.toLocaleString('en-IN'), color: '#f45b69' },
                    { icon: '💰', label: 'Balance', value: '₹' + balance.toLocaleString('en-IN'), color: balance >= 0 ? '#00d97e' : '#f45b69' },
                    { icon: '📋', label: 'Transactions', value: budget.length, color: '#4e8ef7' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setAdding(!adding)} style={{ padding: '10px 20px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    {adding ? '✕ Cancel' : '+ Add Transaction'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>📊 New Transaction</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Category', key: 'category', options: CATEGORIES },
                            { label: 'Type', key: 'type', options: ['income', 'expense'] },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                    {f.options.map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        {[
                            { label: 'Amount (₹)', key: 'amount', type: 'number' },
                            { label: 'Description', key: 'description' },
                            { label: 'Date', key: 'date', type: 'date' },
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

            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📊 Transaction History</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Date', 'Category', 'Type', 'Amount', 'Description'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {budget.map(b => (
                                <tr key={b.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 12 }}>{new Date(b.date).toLocaleDateString('en-IN')}</td>
                                    <td style={{ padding: '12px 14px', color: '#d1d5db', fontSize: 13 }}>{b.category}</td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <span style={{ background: b.type === 'income' ? '#00d97e22' : '#f45b6922', color: b.type === 'income' ? '#00d97e' : '#f45b69', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                            {b.type === 'income' ? '📈 Income' : '📉 Expense'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 14px', fontWeight: 800, color: b.type === 'income' ? '#00d97e' : '#f45b69', fontSize: 13 }}>
                                        {b.type === 'income' ? '+' : '-'}₹{Number(b.amount).toLocaleString('en-IN')}
                                    </td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{b.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {budget.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No transactions yet.</p>}
                </div>
            </div>
        </div>
    );
}