import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };
const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const BRANCHES = ['Indore Main', 'Indore West', 'Ujjain'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function StudentIDCards() {
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', branch: 'Indore Main', parent_phone: '', blood_group: 'A+' });
    const [adding, setAdding] = useState(false);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/id-cards`, { headers }).then(r => setCards(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/id-cards`, form, { headers });
        const r = await axios.get(`${API}/api/id-cards`, { headers });
        setCards(r.data); setAdding(false);
        setForm({ student_id: '', student_name: '', class: '1st', branch: 'Indore Main', parent_phone: '', blood_group: 'A+' });
    };

    const printCard = (card) => {
        const html = `<!DOCTYPE html><html><head><title>ID Card - ${card.student_name}</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; padding: 20px; background: #f0f0f0; }
            .card { width: 320px; background: linear-gradient(135deg, #1a365d, #2d3748); border-radius: 16px; padding: 24px; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
            .school { text-align: center; margin-bottom: 16px; }
            .school h2 { margin: 0; font-size: 16px; color: #90cdf4; }
            .school p { margin: 4px 0 0; font-size: 11px; color: #a0aec0; }
            .photo { width: 80px; height: 80px; background: #4e8ef7; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
            .name { text-align: center; font-size: 18px; font-weight: 900; margin-bottom: 4px; }
            .class { text-align: center; font-size: 12px; color: #90cdf4; margin-bottom: 16px; }
            .info { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
            .info-row label { color: #a0aec0; }
            .info-row span { font-weight: 700; }
            .qr { text-align: center; margin-top: 16px; font-size: 10px; color: #a0aec0; word-break: break-all; }
            @media print { body { background: white; } }
        </style></head><body>
        <div class="card">
            <div class="school">
                <h2>🎓 AuraSync School AI</h2>
                <p>Indore, Madhya Pradesh</p>
            </div>
            <div class="photo">👨‍🎓</div>
            <div class="name">${card.student_name}</div>
            <div class="class">Class ${card.class} | ${card.branch}</div>
            <div class="info">
                <div class="info-row"><label>Student ID</label><span>${card.student_id}</span></div>
                <div class="info-row"><label>Blood Group</label><span style="color:#f45b69">${card.blood_group}</span></div>
                <div class="info-row"><label>Parent Phone</label><span>${card.parent_phone}</span></div>
                <div class="info-row"><label>Issued</label><span>${new Date(card.issued_at).toLocaleDateString('en-IN')}</span></div>
            </div>
            <div class="qr">QR: ${card.qr_code}</div>
        </div>
        <script>window.print();</script>
        </body></html>`;
        const win = window.open('', '_blank', 'width=400,height=600');
        if (win) { win.document.write(html); win.document.close(); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🪪', label: 'Total Cards', value: cards.length, color: '#4e8ef7' },
                    { icon: '📅', label: 'This Month', value: cards.filter(c => new Date(c.issued_at).getMonth() === new Date().getMonth()).length, color: '#00d97e' },
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
                    {adding ? '✕ Cancel' : '+ Generate ID Card'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>🪪 Generate Student ID Card</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Student ID', key: 'student_id' },
                            { label: 'Student Name', key: 'student_name' },
                            { label: 'Parent Phone', key: 'parent_phone' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                        {[
                            { label: 'Class', key: 'class', options: CLASSES },
                            { label: 'Branch', key: 'branch', options: BRANCHES },
                            { label: 'Blood Group', key: 'blood_group', options: BLOOD_GROUPS },
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
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        🪪 Generate Card
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {cards.map(card => (
                    <div key={card.id} style={{ background: 'linear-gradient(135deg, #1a365d, #2d3748)', borderRadius: 16, padding: 24, border: `1px solid #2d3748` }}>
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                            <div style={{ width: 60, height: 60, background: '#4e8ef7', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👨‍🎓</div>
                            <p style={{ margin: 0, fontWeight: 900, color: '#fff', fontSize: 16 }}>{card.student_name}</p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#90cdf4' }}>Class {card.class} | {card.branch}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                            {[
                                { label: 'ID', value: card.student_id },
                                { label: 'Blood', value: card.blood_group },
                                { label: 'Phone', value: card.parent_phone },
                            ].map(r => (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, color: '#a0aec0' }}>{r.label}</span>
                                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{r.value}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => printCard(card)} style={{ width: '100%', padding: '8px', background: '#4e8ef7', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                            🖨️ Print ID Card
                        </button>
                    </div>
                ))}
                {cards.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No ID cards generated yet.</p>}
            </div>
        </div>
    );
}