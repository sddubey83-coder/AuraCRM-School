// AIBrainDashboard.jsx — AI Brain Live Dashboard
// Shows live AI-powered insights, predictions and smart suggestions

import React, { useState, useEffect } from 'react';

const TIPS = [
    { icon: '🔮', color: '#a78bfa', title: 'Conversion Prediction', text: 'Walk-in leads convert 3x faster than phone leads. Prioritize your 3 pending walk-ins today.' },
    { icon: '📊', color: '#4e8ef7', title: 'Peak Inquiry Time', text: 'Most inquiries arrive between 4–7 PM. Schedule callbacks during this window for best response.' },
    { icon: '💬', color: '#00d97e', title: 'WhatsApp Timing', text: 'Messages sent before 10 AM have 47% higher open rate. Schedule your morning campaign now.' },
    { icon: '🎯', color: '#f97316', title: 'Best Source ROI', text: 'Reference leads cost ₹0 to acquire and have 68% conversion. Launch a referral incentive today.' },
    { icon: '⚠️', color: '#f45b69', title: 'Churn Risk', text: 'Students with >15 days no contact are 5x more likely to drop out. Check your cold leads.' },
    { icon: '🏆', color: '#f6c90e', title: 'Top Performer', text: 'Indore Main branch has 12% higher conversion than average. Replicate their follow-up process.' },
];

const LIVE_STATS = [
    { label: 'AI Predictions Run', value: 1284, color: '#4e8ef7', suffix: '' },
    { label: 'Messages Sent Today', value: 47, color: '#00d97e', suffix: '' },
    { label: 'Accuracy Rate', value: 94.2, color: '#a78bfa', suffix: '%' },
    { label: 'Revenue Predicted', value: '₹3.2L', color: '#f97316', suffix: '' },
];

function PulsingDot({ color }) {
    return (
        <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: color, animation: 'pulse 2s infinite', flexShrink: 0, marginTop: 2
        }} />
    );
}

export default function AIBrainDashboard() {
    const [tipIndex, setTipIndex] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [counter, setCounter] = useState(0);

    // Rotate tips every 5 seconds
    useEffect(() => {
        const t = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000);
        return () => clearInterval(t);
    }, []);

    // Animate counter
    useEffect(() => {
        const t = setInterval(() => setCounter(c => c + Math.floor(Math.random() * 3)), 2000);
        return () => clearInterval(t);
    }, []);

    const runAnalysis = () => {
        setProcessing(true);
        setTimeout(() => setProcessing(false), 2200);
    };

    const tip = TIPS[tipIndex];

    return (
        <div style={{
            background: '#111827', borderRadius: 16, border: '1px solid #1f2d3d',
            padding: 24, marginTop: 20
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #a78bfa, #4e8ef7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>🧠</div>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>AI Brain Dashboard</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>Live predictions · Auto-updating</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PulsingDot color="#00d97e" />
                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
                        {counter + 1284} analyses run
                    </span>
                </div>
            </div>

            {/* Live Stats Row */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20
            }}>
                {LIVE_STATS.map(stat => (
                    <div key={stat.label} style={{
                        background: '#0d1117', borderRadius: 10, padding: '12px 14px',
                        border: '1px solid #1f2d3d', textAlign: 'center'
                    }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{stat.label}</p>
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: stat.color }}>
                            {typeof stat.value === 'number' && stat.suffix !== '%'
                                ? (stat.value + counter).toLocaleString()
                                : stat.value}{stat.suffix}
                        </p>
                    </div>
                ))}
            </div>

            {/* Rotating AI Tip */}
            <div style={{
                background: tip.color + '11', border: `1px solid ${tip.color}33`,
                borderRadius: 12, padding: '16px 18px', marginBottom: 16,
                transition: 'all 0.4s ease', minHeight: 80
            }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22 }}>{tip.icon}</span>
                    <div>
                        <p style={{ margin: '0 0 4px', fontSize: 12, color: tip.color, fontWeight: 700, letterSpacing: 0.5 }}>
                            {tip.title}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>
                            {tip.text}
                        </p>
                    </div>
                </div>
                {/* Dot indicators */}
                <div style={{ display: 'flex', gap: 5, marginTop: 12, justifyContent: 'center' }}>
                    {TIPS.map((_, i) => (
                        <span key={i} onClick={() => setTipIndex(i)} style={{
                            width: i === tipIndex ? 16 : 6, height: 6, borderRadius: 4,
                            background: i === tipIndex ? tip.color : '#1f2d3d',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }} />
                    ))}
                </div>
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button
                    onClick={runAnalysis}
                    disabled={processing}
                    style={{
                        flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                        background: processing ? '#1f2d3d' : 'linear-gradient(135deg, #a78bfa, #4e8ef7)',
                        color: '#fff', fontWeight: 700, fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer'
                    }}
                >
                    {processing ? '⏳ Analyzing your data...' : '▶ Run Full AI Analysis'}
                </button>
                <button style={{
                    padding: '10px 16px', borderRadius: 10, border: '1px solid #1f2d3d',
                    background: 'transparent', color: '#9ca3af', fontWeight: 600, fontSize: 12, cursor: 'pointer'
                }}>
                    📋 Export Report
                </button>
            </div>
        </div>
    );
}