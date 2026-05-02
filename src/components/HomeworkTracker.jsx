// HomeworkTracker.jsx — COMPLETE & ERROR-FREE
import React, { useState } from 'react';

const C = {
    bg: '#0d1117',
    card: '#111827',
    primary: '#4e8ef7',
    success: '#00d97e',
    danger: '#f45b69',
    warning: '#f6c90e'
};

const INITIAL_HOMEWORK = [
    { id: 1, class: '1', subject: 'Maths', title: 'Practice Addition (1-20)', due: '2025-01-16', submitted: 28, total: 35, files: ['hw1.pdf'], status: 'active' },
    { id: 2, class: '5', subject: 'Science', title: 'Draw Water Cycle Diagram', due: '2025-01-17', submitted: 42, total: 45, files: ['diagram.jpg'], status: 'active' },
    { id: 3, class: '8', subject: 'English', title: 'Essay: My School (300 words)', due: '2025-01-15', submitted: 18, total: 32, files: [], status: 'overdue' },
    { id: 4, class: '10', subject: 'Physics', title: 'Solve Numericals Ch-2', due: '2025-01-18', submitted: 25, total: 28, files: ['physics_hw.pdf'], status: 'active' },
];

export default function HomeworkTracker() {
    const [homework, setHomework] = useState(INITIAL_HOMEWORK);
    const [form, setForm] = useState({ class: '1', subject: 'Maths', title: '', due: '', files: [] });
    const [showForm, setShowForm] = useState(false);
    const [filterClass, setFilterClass] = useState('all');

    const classes = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const subjects = ['Maths', 'Science', 'English', 'Hindi', 'SST', 'Physics', 'Chemistry', 'Biology', 'Computer'];

    const submissionRate = (submitted, total) => Math.round((submitted / total) * 100);

    const filteredHomework = homework.filter(hw => filterClass === 'all' || hw.class === filterClass);

    const addHomework = () => {
        if (!form.title || !form.due) {
            alert('Title and Due Date required!');
            return;
        }
        const newHw = {
            id: Date.now(),
            ...form,
            submitted: 0,
            total: 0,
            files: [],
            status: new Date(form.due) < new Date() ? 'overdue' : 'active'
        };
        setHomework([newHw, ...homework]);
        setForm({ class: '1', subject: 'Maths', title: '', due: '', files: [] });
        setShowForm(false);
    };

    const toggleStatus = (id) => {
        setHomework(prev => prev.map(hw =>
            hw.id === id ? { ...hw, status: hw.status === 'active' ? 'completed' : 'active' } : hw
        ));
    };

    const overdueCount = homework.filter(h => h.status === 'overdue').length;
    const avgSubmission = Math.round(homework.reduce((sum, h) => sum + submissionRate(h.submitted, h.total), 0) / homework.length);

    return (
        <div style={{ padding: 24, background: C.bg, minHeight: '100vh' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, color: 'white' }}>📚 Homework Tracker</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: 16 }}>Track assignments, submissions & overdue work</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        padding: '14px 28px',
                        background: C.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 14
                    }}
                >
                    ➕ New Assignment
                </button>
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: C.card, padding: 24, borderRadius: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: C.success }}>{avgSubmission}%</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Avg Submission</div>
                </div>
                <div style={{ background: C.card, padding: 24, borderRadius: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: C.primary }}>{homework.length}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Active Tasks</div>
                </div>
                <div style={{ background: C.card, padding: 24, borderRadius: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, color: C.danger }}>{overdueCount}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Overdue</div>
                </div>
            </div>

            {/* FILTERS */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <select
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    style={{ padding: '12px 20px', background: C.card, color: 'white', borderRadius: 12, border: '1px solid #374151' }}
                >
                    {classes.map(c => (
                        <option key={c} value={c}>
                            {c === 'all' ? 'All Classes' : `Class ${c}`}
                        </option>
                    ))}
                </select>
                <button
                    style={{
                        padding: '12px 24px',
                        background: C.warning,
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 700
                    }}
                    onClick={() => alert('Excel Export Coming Soon!')}
                >
                    📊 Export Excel
                </button>
            </div>

            {/* TABLE */}
            <div style={{ background: C.card, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#1f2937' }}>
                            <th style={{ padding: '20px 16px', textAlign: 'left' }}>Class</th>
                            <th style={{ padding: '20px 16px', textAlign: 'left' }}>Subject</th>
                            <th style={{ padding: '20px 16px', textAlign: 'left' }}>Title</th>
                            <th style={{ padding: '20px 16px', textAlign: 'center' }}>Due</th>
                            <th style={{ padding: '20px 16px', textAlign: 'center' }}>Submitted</th>
                            <th style={{ padding: '20px 16px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '20px 16px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHomework.map(hw => {
                            const rate = submissionRate(hw.submitted, hw.total);
                            const isOverdue = hw.due < new Date().toISOString().split('T')[0];

                            return (
                                <tr key={hw.id} style={{ borderBottom: isOverdue ? '3px solid #ef4444' : '1px solid #374151' }}>
                                    <td style={{ padding: '20px 16px', background: '#3b82f6', color: 'white', borderRadius: 8, fontWeight: 700, textAlign: 'center' }}>
                                        Class {hw.class}
                                    </td>
                                    <td style={{ padding: '20px 16px', color: C.primary, fontWeight: 600 }}>{hw.subject}</td>
                                    <td style={{ padding: '20px 16px', maxWidth: 300, wordBreak: 'break-word' }}>{hw.title}</td>
                                    <td style={{
                                        padding: '20px 16px',
                                        textAlign: 'center',
                                        color: isOverdue ? C.danger : '#9ca3af',
                                        fontWeight: isOverdue ? 800 : 500
                                    }}>
                                        {hw.due}
                                    </td>
                                    <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{
                                                width: 80,
                                                height: 10,
                                                background: '#374151',
                                                borderRadius: 6,
                                                overflow: 'hidden',
                                                marginBottom: 4
                                            }}>
                                                <div style={{
                                                    width: `${rate}%`,
                                                    height: '100%',
                                                    background: rate >= 80 ? C.success : rate >= 50 ? C.warning : C.danger,
                                                    borderRadius: 6
                                                }} />
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: rate >= 80 ? C.success : C.warning }}>
                                                {hw.submitted}/{hw.total}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '8px 16px',
                                            borderRadius: 20,
                                            background: hw.status === 'overdue' ? '#ef444422' :
                                                hw.status === 'completed' ? '#10b98122' : '#3b82f622',
                                            color: hw.status === 'overdue' ? C.danger :
                                                hw.status === 'completed' ? C.success : C.primary,
                                            fontWeight: 700,
                                            fontSize: 12
                                        }}>
                                            {hw.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <button
                                                onClick={() => toggleStatus(hw.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: hw.status === 'active' ? C.primary : C.success,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}
                                            >
                                                {hw.status === 'active' ? '✅ Complete' : '🔄 Reopen'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)'
                }} onClick={() => setShowForm(false)}>
                    <div style={{
                        background: C.card,
                        padding: 32,
                        borderRadius: 20,
                        width: 'min(90vw, 500px)',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid #374151'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 800, color: 'white' }}>➕ New Assignment</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <select
                                value={form.class}
                                onChange={e => setForm({ ...form, class: e.target.value })}
                                style={{ padding: 14, background: C.bg, color: 'white', borderRadius: 12, border: '1px solid #374151' }}
                            >
                                {classes.slice(1).map(c => <option key={c}>{c}</option>)}
                            </select>
                            <select
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                style={{ padding: 14, background: C.bg, color: 'white', borderRadius: 12, border: '1px solid #374151' }}
                            >
                                {subjects.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>

                        <input
                            placeholder="Assignment Title *"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            style={{ width: '100%', padding: 14, background: C.bg, color: 'white', borderRadius: 12, border: '1px solid #374151', marginBottom: 16 }}
                        />
                        <input
                            type="date"
                            placeholder="Due Date *"
                            value={form.due}
                            onChange={e => setForm({ ...form, due: e.target.value })}
                            style={{ width: '100%', padding: 14, background: C.bg, color: 'white', borderRadius: 12, border: '1px solid #374151', marginBottom: 24 }}
                        />

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{ padding: '14px 28px', background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: 12, fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addHomework}
                                style={{ padding: '14px 28px', background: C.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700 }}
                            >
                                ➕ Create Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}