import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };

export default function CanteenModule() {
    const [menu, setMenu] = useState([]);
    const [form, setForm] = useState({ item_name: '', price: '', category: 'Snacks' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    const CATEGORIES = ['Snacks', 'Meals', 'Beverages', 'Desserts', 'Fruits'];

    useEffect(() => {
        axios.get(`${API}/api/canteen`, { headers }).then(r => setMenu(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/canteen`, form, { headers });
        const r = await axios.get(`${API}/api/canteen`, { headers });
        setMenu(r.data); setAdding(false);
        setForm({ item_name: '', price: '', category: 'Snacks' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🍱', label: 'Total Items', value: menu.length, color: '#4e8ef7' },
                    { icon: '🥗', label: 'Categories', value: CATEGORIES.length, color: '#00d97e' },
                    { icon: '💰', label: 'Avg Price', value: menu.length ? '₹' + Math.round(menu.reduce((a, m) => a + Number(m.price), 0) / menu.length) : '₹0', color: '#f97316' },
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
                    {adding ? '✕ Cancel' : '+ Add Item'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f97316' }}>🍱 New Menu Item</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Item Name</label>
                            <input value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Price (₹)</label>
                            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#f97316', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Add Item
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {menu.map(item => (
                    <div key={item.id} style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{item.item_name}</p>
                                <span style={{ background: '#f9731622', color: '#f97316', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{item.category}</span>
                            </div>
                            <p style={{ margin: 0, fontWeight: 900, color: '#00d97e', fontSize: 20 }}>₹{item.price}</p>
                        </div>
                    </div>
                ))}
                {menu.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No menu items yet.</p>}
            </div>
        </div>
    );
}