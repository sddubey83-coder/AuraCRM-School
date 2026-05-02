// ParentPortal.jsx — Mobile-First Parent App (ESLint FIXED)
import React, { useState } from 'react';

const C = { bg: '#f8fafc', card: 'white', primary: '#4e8ef7' };

const PARENT_DATA = {
    children: [
        { id: 'S001', name: 'Aarav Sharma', class: '1', roll: 1, photo: '👦' },
        { id: 'S005', name: 'Priya Sharma', class: '5', roll: 5, photo: '👧' }
    ]
};

export default function ParentPortal() {
    // ✅ Line 14: activeChild state
    const [activeChild, setActiveChild] = useState(PARENT_DATA.children[0]);
    const [tab, setTab] = useState('dashboard');

    const stats = {
        attendance: 97,
        fees: { paid: 25000, due: 5000 },
        homework: 3,
        exams: { upcoming: 2, results: 'A+' }
    };

    // ✅ setActiveChild को use करने के लिए child switcher function
    const switchChild = (child) => {
        setActiveChild(child);
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', background: C.bg, minHeight: '100vh', padding: 20, fontFamily: 'system-ui' }}>
            {/* Child Switcher */}
            <div style={{
                background: C.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
            }}>
                {/* Child Avatar & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{ fontSize: 40 }}>{activeChild.photo}</div>
                    <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{activeChild.name}</h2>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>Class {activeChild.class} | Roll {activeChild.roll}</div>
                    </div>
                </div>

                {/* ✅ setActiveChild को use करके child switcher buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {PARENT_DATA.children.map(child => (
                        <button
                            key={child.id}
                            onClick={() => switchChild(child)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 20,
                                border: activeChild.id === child.id ? 'none' : '1px solid #d1d5db',
                                background: activeChild.id === child.id ? C.primary : 'transparent',
                                color: activeChild.id === child.id ? 'white' : '#374151',
                                fontSize: 12,
                                fontWeight: activeChild.id === child.id ? 700 : 500,
                                cursor: 'pointer'
                            }}
                        >
                            {child.class}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: C.card, padding: 20, borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: 32, color: '#10b981' }}>✅ {stats.attendance}%</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Attendance</div>
                </div>
                <div style={{ background: C.card, padding: 20, borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: 24, color: '#ef4444' }}>₹{stats.fees.due}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Fees Due</div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                    { label: '📋 Homework', tab: 'homework' },
                    { label: '📅 Exams', tab: 'exams' },
                    { label: '💰 Fees', tab: 'fees' },
                    { label: '📢 Notices', tab: 'notices' }
                ].map(btn => (
                    <button key={btn.tab} onClick={() => setTab(btn.tab)} style={{
                        flex: 1,
                        padding: '16px 12px',
                        background: tab === btn.tab ? C.primary : C.card,
                        color: tab === btn.tab ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 600,
                        fontSize: 14,
                        boxShadow: tab === btn.tab ? '0 4px 12px rgba(78, 142, 247, 0.3)' : 'none'
                    }}>
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {tab === 'dashboard' && (
                <div style={{ background: C.card, padding: 20, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#1f2937', fontWeight: 700 }}>📊 {activeChild.name}'s Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f1f5f9', borderRadius: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 16 }}>Attendance Today:</span>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>Present ✅</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#fef3c7', borderRadius: 12 }}>
                        <span style={{ fontSize: 16 }}>Homework:</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>3 pending 📝</span>
                    </div>
                </div>
            )}

            {/* Other tabs placeholder */}
            {tab !== 'dashboard' && (
                <div style={{ background: C.card, padding: 20, borderRadius: 16, textAlign: 'center', color: '#6b7280' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>{tab === 'homework' ? '📋' : tab === 'exams' ? '📅' : tab === 'fees' ? '💰' : '📢'}</div>
                    <h3 style={{ margin: '0 0 8px', color: '#374151' }}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>
                    <p>Content for {tab} tab coming soon...</p>
                </div>
            )}
        </div>
    );
}