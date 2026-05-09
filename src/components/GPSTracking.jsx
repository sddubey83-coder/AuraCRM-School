import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };

export default function GPSTracking() {
    const [buses, setBuses] = useState([]);
    const [form, setForm] = useState({ bus_no: '', driver_name: '', route: '', latitude: '22.7196', longitude: '75.8577' });
    const [adding, setAdding] = useState(false);
    const [simulating, setSimulating] = useState({});
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/gps/buses`, { headers }).then(r => setBuses(r.data)).catch(() => { });
    }, []);

    const handleAdd = async () => {
        await axios.post(`${API}/api/gps/buses`, form, { headers });
        const r = await axios.get(`${API}/api/gps/buses`, { headers });
        setBuses(r.data); setAdding(false);
    };

    const simulateMovement = async (bus) => {
        setSimulating(s => ({ ...s, [bus.id]: true }));
        for (let i = 0; i < 5; i++) {
            const lat = (Number(bus.latitude) + (Math.random() - 0.5) * 0.01).toFixed(6);
            const lng = (Number(bus.longitude) + (Math.random() - 0.5) * 0.01).toFixed(6);
            const speed = (Math.random() * 40 + 20).toFixed(1);
            await axios.put(`${API}/api/gps/buses/${bus.id}`, { latitude: lat, longitude: lng, speed, status: 'running' }, { headers });
            await new Promise(r => setTimeout(r, 1000));
        }
        const r = await axios.get(`${API}/api/gps/buses`, { headers });
        setBuses(r.data);
        setSimulating(s => ({ ...s, [bus.id]: false }));
    };

    const running = buses.filter(b => b.status === 'running').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🚌', label: 'Total Buses', value: buses.length, color: '#4e8ef7' },
                    { icon: '🟢', label: 'Running', value: running, color: '#00d97e' },
                    { icon: '🔴', label: 'Stopped', value: buses.length - running, color: '#f45b69' },
                    { icon: '📍', label: 'Live Tracking', value: 'Active', color: '#a78bfa' },
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
                    {adding ? '✕ Cancel' : '+ Add Bus'}
                </button>
            </div>

            {adding && (
                <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>🚌 Add Bus</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                        {[
                            { label: 'Bus No', key: 'bus_no', placeholder: 'e.g. MP-09-1234' },
                            { label: 'Driver Name', key: 'driver_name' },
                            { label: 'Route', key: 'route', placeholder: 'e.g. Indore - Ujjain' },
                            { label: 'Latitude', key: 'latitude' },
                            { label: 'Longitude', key: 'longitude' },
                        ].map(f => (
                            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{f.label}</label>
                                <input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAdd} style={{ marginTop: 16, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        💾 Add Bus
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {buses.map(bus => (
                    <div key={bus.id} style={{ background: C.card, borderRadius: 16, padding: 24, border: `2px solid ${bus.status === 'running' ? '#00d97e' : C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 900, color: '#f1f5f9', fontSize: 18 }}>🚌 {bus.bus_no}</p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Driver: {bus.driver_name}</p>
                            </div>
                            <span style={{ background: bus.status === 'running' ? '#00d97e22' : '#f45b6922', color: bus.status === 'running' ? '#00d97e' : '#f45b69', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                {bus.status === 'running' ? '🟢 Running' : '🔴 Stopped'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {[
                                { label: '📍 Route', value: bus.route },
                                { label: '🌐 Location', value: `${Number(bus.latitude).toFixed(4)}, ${Number(bus.longitude).toFixed(4)}` },
                                { label: '⚡ Speed', value: `${bus.speed || 0} km/h` },
                                { label: '🕐 Updated', value: new Date(bus.updated_at).toLocaleTimeString('en-IN') },
                            ].map(r => (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</span>
                                    <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600 }}>{r.value}</span>
                                </div>
                            ))}
                        </div>
                        {/* Live Map */}
                        <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                            <iframe
                                title={`map-${bus.id}`}
                                width="100%"
                                height="180"
                                frameBorder="0"
                                src={`https://maps.google.com/maps?q=${bus.latitude},${bus.longitude}&z=15&output=embed`}
                                style={{ border: 'none' }}
                            />
                        </div>

                        <button onClick={() => simulateMovement(bus)} disabled={simulating[bus.id]} style={{ width: '100%', padding: '10px', background: simulating[bus.id] ? '#374151' : '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: simulating[bus.id] ? 'not-allowed' : 'pointer' }}>
                            {simulating[bus.id] ? '⏳ Tracking...' : '📍 Simulate Movement'}
                        </button>
                    </div>
                ))}
                {buses.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No buses added yet.</p>}
            </div>
        </div>
    );
}