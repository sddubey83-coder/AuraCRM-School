// RealtimeDashboard.jsx — Real-time Analytics Dashboard
// Live charts and metrics that update automatically

import React, { useState, useEffect } from 'react';
// Simple sparkline SVG renderer (no external lib needed)
function Sparkline({ data, color, height = 40 }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 120; const h = height;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={w} height={h} style={{ display: 'block' }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points.split(' ').pop().split(',')[0]} cy={points.split(' ').pop().split(',')[1]}
                r="3" fill={color} />
        </svg>
    );
}

// Simulated live data
const generateData = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 40 + 10));

const METRICS = [
    { key: 'leads', label: 'New Leads', color: '#4e8ef7', icon: '📥', base: 24 },
    { key: 'calls', label: 'Calls Made', color: '#00d97e', icon: '📞', base: 18 },
    { key: 'converted', label: 'Enrolled Today', color: '#a78bfa', icon: '🎓', base: 5 },
    { key: 'messages', label: 'Messages Sent', color: '#f97316', icon: '💬', base: 63 },
];

function BarChart({ data, color, label }) {
    const max = Math.max(...data);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
        <div>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</p>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
                {data.slice(-7).map((v, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 3 }}>
                        <div style={{
                            width: '100%', background: color + '33', borderRadius: '4px 4px 0 0',
                            height: `${(v / max) * 52}px`, border: `1px solid ${color}66`,
                            transition: 'height 0.4s ease'
                        }} />
                        <span style={{ fontSize: 9, color: '#6b7280' }}>{days[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function RealtimeDashboard() {
    const [metrics, setMetrics] = useState(() =>
        METRICS.reduce((acc, m) => ({ ...acc, [m.key]: { current: m.base + Math.floor(Math.random() * 10), history: generateData() } }), {})
    );
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [weeklyData] = useState(Array.from({ length: 7 }, () => Math.floor(Math.random() * 30 + 5)));

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => {
                const updated = { ...prev };
                // Randomly update one metric
                const randomMetric = METRICS[Math.floor(Math.random() * METRICS.length)];
                const delta = Math.random() > 0.5 ? 1 : 0;
                updated[randomMetric.key] = {
                    current: prev[randomMetric.key].current + delta,
                    history: [...prev[randomMetric.key].history.slice(1), prev[randomMetric.key].current + delta]
                };
                return updated;
            });
            setLastUpdate(new Date());
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const fmt = v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v;

    return (
        <div style={{
            background: '#111827', borderRadius: 16, border: '1px solid #1f2d3d',
            padding: 24, marginTop: 20
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>📡 Realtime Dashboard</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280' }}>
                        Last updated: {lastUpdate.toLocaleTimeString('en-IN')}
                    </p>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#0d1117', borderRadius: 20, padding: '5px 12px',
                    border: '1px solid #1f2d3d'
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d97e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Live</span>
                </div>
            </div>

            {/* Metric cards with sparklines */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
                {METRICS.map(m => {
                    const data = metrics[m.key];
                    return (
                        <div key={m.key} style={{
                            background: '#0d1117', borderRadius: 12, padding: '14px 16px',
                            border: `1px solid ${m.color}22`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <p style={{ margin: '0 0 2px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                                    {m.icon} {m.label}
                                </p>
                                <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: m.color }}>{fmt(data.current)}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6b7280' }}>+{Math.floor(Math.random() * 3)} this hour</p>
                            </div>
                            <Sparkline data={data.history} color={m.color} />
                        </div>
                    );
                })}
            </div>

            {/* Weekly bar chart */}
            <div style={{ background: '#0d1117', borderRadius: 12, padding: 16, border: '1px solid #1f2d3d' }}>
                <BarChart data={weeklyData} color="#4e8ef7" label="Weekly Lead Activity (Last 7 Days)" />
            </div>

            {/* Source breakdown */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                    { label: 'WhatsApp', pct: 34, color: '#00d97e' },
                    { label: 'Walk-in', pct: 28, color: '#4e8ef7' },
                    { label: 'Reference', pct: 21, color: '#a78bfa' },
                    { label: 'Instagram', pct: 11, color: '#f97316' },
                    { label: 'Website', pct: 4, color: '#f6c90e' },
                    { label: 'Phone', pct: 2, color: '#9ca3af' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#0d1117', borderRadius: 8, padding: '8px 12px', border: '1px solid #1f2d3d' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.label}</span>
                            <span style={{ fontSize: 11, color: s.color, fontWeight: 700 }}>{s.pct}%</span>
                        </div>
                        <div style={{ height: 4, background: '#1f2d3d', borderRadius: 4 }}>
                            <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 4 }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}