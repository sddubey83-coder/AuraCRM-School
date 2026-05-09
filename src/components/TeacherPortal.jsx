// TeacherPortal.jsx — Complete Teacher Portal
// Features: Login, Dashboard, Attendance, Marks, Timetable, Lessons, Online Classes, Profile

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = {
    bg: '#0d1117', card: '#111827', border: '#1f2d3d',
    primary: '#4e8ef7', success: '#00d97e', danger: '#f45b69',
    warning: '#f6c90e', purple: '#a78bfa', orange: '#f97316',
    gray: '#6b7280', light: '#9ca3af', lighter: '#d1d5db', white: '#f1f5f9'
};

const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Computer', 'Physics', 'Chemistry', 'Biology', 'PE', 'Art'];
const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Pre-Board', 'Final', 'Annual'];

// ─── SHARED UI ────────────────────────────────────────────────
const Card = ({ children, style = {}, className }) => (
    <div className={className} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, ...style }}>
        {children}
    </div>
);

const Btn = ({ children, color = C.primary, small, outline, danger, disabled, fullWidth, ...props }) => {
    const c = danger ? C.danger : color;
    return (
        <button {...props} disabled={disabled} style={{
            padding: small ? '7px 14px' : '11px 22px', borderRadius: 10,
            border: outline ? `1.5px solid ${c}` : 'none',
            background: disabled ? '#374151' : outline ? 'transparent' : c,
            color: outline ? c : '#fff',
            fontWeight: 700, fontSize: small ? 12 : 14,
            cursor: disabled ? 'not-allowed' : 'pointer',
            width: fullWidth ? '100%' : 'auto',
            opacity: disabled ? 0.6 : 1,
            transition: 'all .15s ease',
            ...props.style
        }}>{children}</button>
    );
};

const Badge = ({ children, color, style }) => (
    <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block', ...style }}>
        {children}
    </span>
);

const StatCard = ({ icon, label, value, color, sub }) => (
    <Card style={{ padding: '18px 20px' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <p style={{ margin: '6px 0 2px', fontSize: 10, color: C.light, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</p>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color }}>{value}</h2>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: C.gray }}>{sub}</p>}
    </Card>
);

const Inp = ({ label, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && <label style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>{label}</label>}
        <input {...props} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '10px 14px', color: C.white, fontSize: 14, outline: 'none',
            width: '100%', boxSizing: 'border-box', transition: 'border .15s',
            ...props.style
        }} onFocus={e => { e.target.style.borderColor = C.primary; }} onBlur={e => { e.target.style.borderColor = C.border; }} />
    </div>
);

const Sel = ({ label, options, placeholder, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && <label style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>{label}</label>}
        <select {...props} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '10px 14px', color: C.white, fontSize: 14, outline: 'none',
            width: '100%', transition: 'border .15s', ...props.style
        }} onFocus={e => { e.target.style.borderColor = C.primary; }} onBlur={e => { e.target.style.borderColor = C.border; }}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => {
                const val = typeof o === 'string' ? o : o.value;
                const lbl = typeof o === 'string' ? o : o.label;
                return <option key={val} value={val}>{lbl}</option>;
            })}
        </select>
    </div>
);

const Grid = ({ children, cols = 'repeat(auto-fit, minmax(200px, 1fr))' }) => (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>{children}</div>
);

const Spinner = ({ size = 20, color = C.primary }) => (
    <div style={{ width: size, height: size, border: `3px solid ${color}22`, borderTopColor: color, borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
);

const EmptyState = ({ icon = '📭', message = 'No data found', sub }) => (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>{icon}</div>
        <p style={{ margin: '0 0 4px', color: C.light, fontWeight: 700, fontSize: 15 }}>{message}</p>
        {sub && <p style={{ margin: 0, color: C.gray, fontSize: 12 }}>{sub}</p>}
    </div>
);

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
    <div style={{ position: 'relative', maxWidth: 320 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.gray }}>🔍</span>
        <input
            value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: '100%', padding: '10px 14px 10px 38px', fontSize: 13,
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
                color: C.white, outline: 'none', boxSizing: 'border-box'
            }}
        />
    </div>
);

// ─── CONFIRM DIALOG ───────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
    return (
        <div onClick={onCancel} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
                padding: 32, maxWidth: 400, width: '90%', textAlign: 'center',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8)'
            }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <p style={{ margin: '0 0 20px', color: C.white, fontSize: 15, fontWeight: 700 }}>{message}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Btn outline color={C.gray} onClick={onCancel} disabled={loading}>Cancel</Btn>
                    <Btn danger onClick={onConfirm} disabled={loading}>
                        {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Deleting...</span> : '🗑️ Delete'}
                    </Btn>
                </div>
            </div>
        </div>
    );
}

// ─── TOAST ────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toasts.map(t => {
                const bg = t.type === 'success' ? C.success : t.type === 'error' ? C.danger : C.warning;
                const icon = t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️';
                return (
                    <div key={t.key} style={{
                        background: bg, color: t.type === 'warning' ? '#000' : '#fff',
                        padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13,
                        boxShadow: `0 8px 32px ${bg}44`, display: 'flex', alignItems: 'center', gap: 10,
                        animation: 'slideIn .3s ease', minWidth: 250
                    }}>
                        <span>{icon}</span>
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <span onClick={() => removeToast(t.key)} style={{ cursor: 'pointer', opacity: 0.7, fontSize: 16, lineHeight: 1 }}>×</span>
                    </div>
                );
            })}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════
function TeacherLogin({ onLogin }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e?.preventDefault();
        if (!form.email || !form.password) { setError('Email and password are required'); return; }
        if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return; }
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${API}/api/teacher/login`, form);
            localStorage.setItem('teacher_token', res.data.token);
            localStorage.setItem('teacher_data', JSON.stringify(res.data.teacher));
            onLogin(res.data.teacher, res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: C.bg, fontFamily: "'Segoe UI', sans-serif", padding: 20
        }}>
            {/* Background decoration */}
            <div style={{ position: 'fixed', top: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,142,247,0.06) 0%, transparent 70%)' }} />
            <div style={{ position: 'fixed', bottom: -200, left: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)' }} />

            <div style={{
                background: C.card, border: `1px solid ${error ? C.danger : C.border}`,
                borderRadius: 24, padding: '48px 40px', textAlign: 'center',
                width: '100%', maxWidth: 420, boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                position: 'relative', zIndex: 1
            }}>
                <div style={{
                    width: 72, height: 72,
                    background: 'linear-gradient(135deg, #4e8ef7, #a78bfa)',
                    borderRadius: 20, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 36, margin: '0 auto 20px',
                    boxShadow: '0 10px 40px rgba(78,142,247,0.3)'
                }}>👨‍🏫</div>

                <h1 style={{ margin: '0 0 6px', color: C.white, fontSize: 24, fontWeight: 900 }}>
                    Teacher Portal
                </h1>
                <p style={{ margin: '0 0 32px', color: C.gray, fontSize: 13 }}>
                    AuraSync School AI — Staff Login
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: 15, fontSize: 14, color: C.gray }}>📧</span>
                        <input
                            type="email" placeholder="Email Address"
                            value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }}
                            style={{
                                width: '100%', padding: '14px 16px 14px 42px', fontSize: 14,
                                background: C.bg, border: `1px solid ${error ? C.danger : C.border}`,
                                borderRadius: 12, color: C.white, outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: 15, fontSize: 14, color: C.gray }}>🔒</span>
                        <input
                            type={showPassword ? 'text' : 'password'} placeholder="Password / PIN"
                            value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); }}
                            style={{
                                width: '100%', padding: '14px 42px 14px 42px', fontSize: 14,
                                background: C.bg, border: `1px solid ${error ? C.danger : C.border}`,
                                borderRadius: 12, color: C.white, outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                        <span onClick={() => setShowPassword(!showPassword)} style={{
                            position: 'absolute', right: 16, top: 15, fontSize: 14, color: C.gray, cursor: 'pointer', userSelect: 'none'
                        }}>{showPassword ? '🙈' : '👁️'}</span>
                    </div>
                    {error && <p style={{ color: C.danger, fontSize: 12, margin: 0, fontWeight: 700 }}>❌ {error}</p>}
                    <button
                        type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '14px',
                            background: loading ? '#374151' : 'linear-gradient(135deg, #4e8ef7, #3b7be0)',
                            border: 'none', borderRadius: 12, color: '#fff',
                            fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all .2s', boxShadow: loading ? 'none' : '0 8px 24px rgba(78,142,247,0.3)'
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <Spinner size={16} color="#fff" /> Logging in...
                            </span>
                        ) : '🔓 Login to Portal'}
                    </button>
                </form>

                <p style={{ margin: '20px 0 0', fontSize: 11, color: '#374151' }}>
                    Contact admin if you forgot your password
                </p>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
function Dashboard({ teacher, token, navigate }) {
    const [stats, setStats] = useState({ classes: 0, marks: 0, lessons: 0, attendance: 0 });
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            axios.get(`${API}/api/teacher/classes`, { headers }).catch(() => ({ data: [] })),
            axios.get(`${API}/api/teacher/marks`, { headers }).catch(() => ({ data: [] })),
            axios.get(`${API}/api/teacher/lessons`, { headers }).catch(() => ({ data: [] })),
            axios.get(`${API}/api/teacher/attendance`, { headers }).catch(() => ({ data: [] })),
        ]).then(([c, m, l, a]) => {
            setStats({ classes: c.data.length || 0, marks: m.data.length || 0, lessons: l.data.length || 0, attendance: a.data.length || 0 });
            // Build recent activity
            const activity = [
                ...a.data.slice(-3).map(r => ({ type: 'attendance', text: `Attendance marked for Class ${r.class} - ${r.subject}`, time: r.created_at || r.date, color: C.success })),
                ...m.data.slice(-3).map(r => ({ type: 'marks', text: `Marks entered for ${r.student_name} - ${r.subject}`, time: r.created_at, color: C.primary })),
                ...l.data.slice(-3).map(r => ({ type: 'lesson', text: `Lesson plan: ${r.topic}`, time: r.created_at, color: C.purple })),
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);
            setRecentActivity(activity);
        }).finally(() => setLoading(false));
    }, []);

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const quickActions = [
        { icon: '📋', label: 'Mark Attendance', color: C.success, tab: 'attendance' },
        { icon: '📊', label: 'Enter Marks', color: C.primary, tab: 'marks' },
        { icon: '📝', label: 'Create Lesson Plan', color: C.purple, tab: 'lessons' },
        { icon: '💻', label: 'Schedule Online Class', color: C.orange, tab: 'online' },
    ];

    const scheduleData = [
        { time: '8:00 AM', subject: 'Mathematics', class: '8th A', color: C.primary },
        { time: '9:00 AM', subject: 'Science', class: '9th B', color: C.success },
        { time: '10:00 AM', subject: 'English', class: '10th A', color: C.purple },
        { time: '11:20 AM', subject: 'Mathematics', class: '7th C', color: C.primary },
        { time: '12:20 PM', subject: 'Hindi', class: '8th B', color: C.orange },
        { time: '2:00 PM', subject: 'Science', class: '9th A', color: C.success },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Welcome Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
                borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(78,142,247,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, right: 100, width: 150, height: 150, borderRadius: '50%', background: 'rgba(167,139,250,0.05)' }} />
                <p style={{ margin: '0 0 4px', fontSize: 12, color: C.primary, fontWeight: 700, letterSpacing: 2 }}>TEACHER PORTAL</p>
                <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#fff' }}>
                    {greeting}, {teacher.name}! 👋
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>{today}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
                    {[
                        { icon: '📚', label: 'My Classes', value: loading ? '...' : stats.classes, color: C.primary },
                        { icon: '📊', label: 'Marks Entered', value: loading ? '...' : stats.marks, color: C.success },
                        { icon: '📝', label: 'Lesson Plans', value: loading ? '...' : stats.lessons, color: C.purple },
                        { icon: '📋', label: 'Attendance Records', value: loading ? '...' : stats.attendance, color: C.warning },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14,
                            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <span style={{ fontSize: 22 }}>{s.icon}</span>
                            <p style={{ margin: '6px 0 2px', fontSize: 10, color: '#9ca3af', fontWeight: 600, letterSpacing: 1 }}>{s.label.toUpperCase()}</p>
                            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.white, fontSize: 15 }}>⚡ Quick Actions</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    {quickActions.map(a => (
                        <div key={a.label} onClick={() => navigate(a.tab)} style={{
                            padding: 16, background: a.color + '11', borderRadius: 12,
                            border: `1px solid ${a.color}33`, textAlign: 'center', cursor: 'pointer',
                            transition: 'all .15s'
                        }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}22`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: a.color }}>{a.label}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
                {/* Today's Schedule */}
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.white, fontSize: 15 }}>📅 Today's Schedule</p>
                    {scheduleData.map((item, i) => (
                        <div key={item.time} style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                            borderBottom: i < scheduleData.length - 1 ? `1px solid ${C.border}` : 'none'
                        }}>
                            <span style={{ fontSize: 12, color: C.gray, width: 70, flexShrink: 0, fontWeight: 600 }}>{item.time}</span>
                            <div style={{
                                flex: 1, padding: '8px 14px', borderRadius: 8,
                                background: item.color + '11', border: `1px solid ${item.color}33`
                            }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.white }}>{item.subject}</p>
                                <p style={{ margin: 0, fontSize: 11, color: C.gray }}>Class {item.class}</p>
                            </div>
                        </div>
                    ))}
                </Card>

                {/* Recent Activity */}
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.white, fontSize: 15 }}>🕐 Recent Activity</p>
                    {recentActivity.length === 0 ? (
                        <EmptyState icon="📭" message="No recent activity" sub="Start by marking attendance or entering marks" />
                    ) : recentActivity.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0',
                            borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.border}` : 'none'
                        }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%', background: item.color,
                                marginTop: 6, flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 13, color: C.lighter, fontWeight: 600 }}>{item.text}</p>
                                <p style={{ margin: '3px 0 0', fontSize: 11, color: C.gray }}>
                                    {item.time ? new Date(item.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </p>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// ATTENDANCE MODULE
// ════════════════════════════════════════════════════════════════
function TeacherAttendance({ token, toast }) {
    const headers = { Authorization: `Bearer ${token}` };
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [form, setForm] = useState({ class: '1st', subject: 'Mathematics', notes: '', date: new Date().toISOString().split('T')[0] });
    const f = v => setForm(p => ({ ...p, ...v }));

    const [students, setStudents] = useState([
        { id: 'S001', name: 'Aarav Sharma', roll: 1, status: 'present' },
        { id: 'S002', name: 'Priya Verma', roll: 2, status: 'present' },
        { id: 'S003', name: 'Rohit Kumar', roll: 3, status: 'present' },
        { id: 'S004', name: 'Ananya Singh', roll: 4, status: 'present' },
        { id: 'S005', name: 'Vikram Patel', roll: 5, status: 'present' },
        { id: 'S006', name: 'Sneha Joshi', roll: 6, status: 'present' },
        { id: 'S007', name: 'Arjun Gupta', roll: 7, status: 'present' },
        { id: 'S008', name: 'Kavya Rao', roll: 8, status: 'present' },
        { id: 'S009', name: 'Dev Patel', roll: 9, status: 'present' },
        { id: 'S010', name: 'Riya Shah', roll: 10, status: 'present' },
    ]);

    const fetchRecords = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/api/teacher/attendance`, { headers });
            setRecords(r.data);
        } catch (e) { console.error(e); }
    }, [headers]);

    useEffect(() => { fetchRecords().finally(() => setLoading(false)); }, [fetchRecords]);

    const toggleStudent = (id) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s));
    };

    const markAll = (status) => setStudents(prev => prev.map(s => ({ ...s, status })));

    const save = async () => {
        const present = students.filter(s => s.status === 'present').length;
        const absent = students.filter(s => s.status === 'absent').length;
        setSaving(true);
        try {
            await axios.post(`${API}/api/teacher/attendance`, {
                ...form, students_present: present, students_absent: absent
            }, { headers });
            await fetchRecords();
            setAdding(false);
            markAll('present');
            toast('Attendance saved successfully!');
        } catch (e) {
            toast('Failed to save attendance', 'error');
        }
        setSaving(false);
    };

    const deleteRecord = async (id) => {
        try {
            await axios.delete(`${API}/api/teacher/attendance/${id}`, { headers });
            await fetchRecords();
            toast('Record deleted');
        } catch (e) { toast('Delete failed', 'error'); }
        setDeleteConfirm(null);
    };

    const filtered = records.filter(r =>
        !search || (r.class || '').toLowerCase().includes(search.toLowerCase()) || (r.subject || '').toLowerCase().includes(search.toLowerCase())
    );

    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {deleteConfirm && <ConfirmDialog message="Delete this attendance record?" onConfirm={() => deleteRecord(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} loading={false} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="📋" label="Total Records" value={loading ? '...' : records.length} color={C.primary} />
                <StatCard icon="✅" label="Present Today" value={present} color={C.success} />
                <StatCard icon="❌" label="Absent Today" value={absent} color={C.danger} />
                <StatCard icon="📊" label="Attendance %" value={`${Math.round(present / students.length * 100)}%`} color={C.warning} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <SearchBar value={search} onChange={setSearch} placeholder="Search by class or subject..." />
                <Btn color={C.success} onClick={() => setAdding(!adding)}>
                    {adding ? '✕ Cancel' : '📋 Mark Attendance'}
                </Btn>
            </div>

            {adding && (
                <Card style={{ borderColor: C.success + '44' }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.success }}>📋 Mark Class Attendance</p>
                    <Grid cols="repeat(auto-fit, minmax(180px, 1fr))">
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Sel label="Subject" value={form.subject} onChange={e => f({ subject: e.target.value })} options={SUBJECTS} />
                        <Inp label="Date" type="date" value={form.date} onChange={e => f({ date: e.target.value })} />
                    </Grid>

                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <p style={{ margin: 0, fontWeight: 700, color: C.white }}>
                                Student List ({present}/{students.length} present)
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Btn small color={C.success} onClick={() => markAll('present')}>All Present</Btn>
                                <Btn small color={C.danger} onClick={() => markAll('absent')}>All Absent</Btn>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                            {students.map(s => (
                                <div key={s.id} onClick={() => toggleStudent(s.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                                    borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
                                    background: s.status === 'present' ? '#00d97e11' : '#f45b6911',
                                    border: `1px solid ${s.status === 'present' ? '#00d97e44' : '#f45b6944'}`
                                }}>
                                    <span style={{ fontSize: 16 }}>{s.status === 'present' ? '✅' : '❌'}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.white }}>{s.name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: C.gray }}>Roll {s.roll}</p>
                                    </div>
                                    <Badge color={s.status === 'present' ? C.success : C.danger}>{s.status === 'present' ? 'P' : 'A'}</Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <label style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>Notes (optional)</label>
                        <textarea value={form.notes} onChange={e => f({ notes: e.target.value })} rows={2} placeholder="Any remarks..."
                            style={{ width: '100%', marginTop: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <Btn color={C.success} onClick={save} disabled={saving} style={{ marginTop: 14 }}>
                        {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Saving...</span> : '💾 Save Attendance'}
                    </Btn>
                </Card>
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: C.white }}>📋 Attendance Records {filtered.length !== records.length && <span style={{ color: C.gray, fontWeight: 500 }}>({filtered.length} of {records.length})</span>}</p>
                </div>
                {loading ? (
                    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div>
                ) : filtered.length === 0 ? (
                    <EmptyState icon="📋" message={search ? 'No matching records' : 'No attendance records yet'} sub={search ? 'Try a different search term' : 'Click "Mark Attendance" to get started'} />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: C.bg }}>
                                    {['Date', 'Class', 'Subject', 'Present', 'Absent', '%', 'Notes', ''].map(h => (
                                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => {
                                    const total = Number(r.students_present || 0) + Number(r.students_absent || 0);
                                    const pct = total ? Math.round((r.students_present / total) * 100) : 0;
                                    return (
                                        <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#1a2332'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 14px', fontSize: 12, color: C.light }}>{new Date(r.date || r.created_at).toLocaleDateString('en-IN')}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: C.white }}>Class {r.class}</td>
                                            <td style={{ padding: '12px 14px', color: C.lighter }}>{r.subject}</td>
                                            <td style={{ padding: '12px 14px', color: C.success, fontWeight: 700 }}>{r.students_present} ✅</td>
                                            <td style={{ padding: '12px 14px', color: C.danger, fontWeight: 700 }}>{r.students_absent} ❌</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: pct >= 75 ? C.success : pct >= 50 ? C.warning : C.danger }}>{pct}%</td>
                                            <td style={{ padding: '12px 14px', fontSize: 12, color: C.gray, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span onClick={() => setDeleteConfirm(r.id)} style={{ cursor: 'pointer', fontSize: 14, opacity: 0.5, transition: 'opacity .15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>🗑️</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// MARKS MODULE
// ════════════════════════════════════════════════════════════════
function MarksModule({ token, toast }) {
    const headers = { Authorization: `Bearer ${token}` };
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const emptyForm = { student_id: '', student_name: '', class: '1st', subject: 'Mathematics', exam_type: 'Unit Test 1', marks: '', max_marks: 100 };
    const [form, setForm] = useState({ ...emptyForm });
    const f = v => setForm(p => ({ ...p, ...v }));

    const fetchMarks = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/api/teacher/marks`, { headers });
            setMarks(r.data);
        } catch (e) { console.error(e); }
    }, [headers]);

    useEffect(() => { fetchMarks().finally(() => setLoading(false)); }, [fetchMarks]);

    const getGrade = (m, max) => {
        const p = (m / max) * 100;
        if (p >= 91) return { g: 'A+', c: C.success };
        if (p >= 81) return { g: 'A', c: C.success };
        if (p >= 71) return { g: 'B+', c: C.primary };
        if (p >= 61) return { g: 'B', c: C.primary };
        if (p >= 51) return { g: 'C+', c: C.warning };
        if (p >= 33) return { g: 'C', c: C.warning };
        return { g: 'F', c: C.danger };
    };

    const save = async () => {
        if (!form.student_name || !form.marks) { toast('Student name and marks are required', 'warning'); return; }
        if (Number(form.marks) > Number(form.max_marks)) { toast('Marks cannot exceed max marks', 'warning'); return; }
        setSaving(true);
        try {
            if (editing) {
                await axios.put(`${API}/api/teacher/marks/${editing}`, form, { headers });
                toast('Marks updated successfully!');
            } else {
                await axios.post(`${API}/api/teacher/marks`, form, { headers });
                toast('Marks saved successfully!');
            }
            await fetchMarks();
            setAdding(false);
            setEditing(null);
            setForm({ ...emptyForm });
        } catch (e) { toast('Failed to save marks', 'error'); }
        setSaving(false);
    };

    const startEdit = (m) => {
        setForm({ student_id: m.student_id || '', student_name: m.student_name, class: m.class, subject: m.subject, exam_type: m.exam_type, marks: m.marks, max_marks: m.max_marks });
        setEditing(m.id);
        setAdding(true);
    };

    const deleteMark = async (id) => {
        try {
            await axios.delete(`${API}/api/teacher/marks/${id}`, { headers });
            await fetchMarks();
            toast('Marks deleted');
        } catch (e) { toast('Delete failed', 'error'); }
        setDeleteConfirm(null);
    };

    const filtered = marks.filter(m => {
        const matchSearch = !search || (m.student_name || '').toLowerCase().includes(search.toLowerCase()) || (m.class || '').toLowerCase().includes(search.toLowerCase());
        const matchExam = !filterExam || m.exam_type === filterExam;
        return matchSearch && matchExam;
    });

    const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + Number(m.marks || 0), 0) / marks.length) : 0;
    const avgPct = marks.length ? Math.round(marks.reduce((s, m) => s + (Number(m.marks) / Number(m.max_marks)) * 100, 0) / marks.length) : 0;
    const failed = marks.filter(m => (Number(m.marks) / Number(m.max_marks)) * 100 < 33).length;
    const toppers = [...marks].sort((a, b) => (Number(b.marks) / Number(b.max_marks)) - (Number(a.marks) / Number(a.max_marks))).slice(0, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {deleteConfirm && <ConfirmDialog message="Delete this marks entry?" onConfirm={() => deleteMark(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="📊" label="Total Entries" value={loading ? '...' : marks.length} color={C.primary} />
                <StatCard icon="📈" label="Avg Marks" value={avgMarks} color={C.success} />
                <StatCard icon="📉" label="Avg %" value={`${avgPct}%`} color={C.warning} />
                <StatCard icon="❌" label="Failed" value={failed} color={C.danger} />
            </div>

            {/* Top Performers */}
            {toppers.length > 0 && (
                <Card>
                    <p style={{ margin: '0 0 12px', fontWeight: 700, color: C.warning, fontSize: 14 }}>🏆 Top Performers</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {toppers.map((t, i) => {
                            const pct = Math.round((Number(t.marks) / Number(t.max_marks)) * 100);
                            return (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.bg, borderRadius: 10, padding: '10px 16px', border: `1px solid ${['#f6c90e44', '#9ca3af44', '#cd7f3244'][i]}` }}>
                                    <span style={{ fontSize: 20 }}>{['🥇', '🥈', '🥉'][i]}</span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: C.white, fontSize: 13 }}>{t.student_name}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: C.gray }}>{t.subject} — {pct}%</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search student or class..." />
                    <Sel options={EXAM_TYPES} value={filterExam} onChange={e => setFilterExam(e.target.value)} placeholder="All Exams" style={{ width: 160, padding: '10px 12px', fontSize: 12 }} />
                </div>
                <Btn color={C.primary} onClick={() => { setAdding(!adding); if (adding) { setEditing(null); setForm({ ...emptyForm }); } }}>
                    {adding ? '✕ Cancel' : '+ Enter Marks'}
                </Btn>
            </div>

            {adding && (
                <Card style={{ borderColor: C.primary + '44' }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.primary }}>
                        {editing ? '✏️ Edit Marks' : '📊 Enter Student Marks'}
                    </p>
                    <Grid cols="repeat(auto-fit, minmax(180px, 1fr))">
                        <Inp label="Student ID" value={form.student_id} onChange={e => f({ student_id: e.target.value })} placeholder="e.g. S001" />
                        <Inp label="Student Name *" value={form.student_name} onChange={e => f({ student_name: e.target.value })} placeholder="Full name" />
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Sel label="Subject" value={form.subject} onChange={e => f({ subject: e.target.value })} options={SUBJECTS} />
                        <Sel label="Exam Type" value={form.exam_type} onChange={e => f({ exam_type: e.target.value })} options={EXAM_TYPES} />
                        <Inp label="Marks Obtained *" type="number" min="0" value={form.marks} onChange={e => f({ marks: e.target.value })} placeholder="e.g. 78" />
                        <Inp label="Max Marks" type="number" min="1" value={form.max_marks} onChange={e => f({ max_marks: e.target.value })} />
                    </Grid>
                    {form.marks && form.max_marks && Number(form.max_marks) > 0 && (
                        <div style={{ marginTop: 12, padding: 12, background: '#4e8ef711', borderRadius: 10, border: '1px solid #4e8ef733' }}>
                            {(() => {
                                const { g, c } = getGrade(Number(form.marks), Number(form.max_marks));
                                const pct = Math.round((Number(form.marks) / Number(form.max_marks)) * 100);
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0, color: c, fontWeight: 700 }}>Grade: {g}</p>
                                        <p style={{ margin: 0, color: C.light, fontWeight: 700 }}>{pct}%</p>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <Btn color="#6b7280" onClick={() => { setAdding(false); setEditing(null); setForm({ ...emptyForm }); }}>Cancel</Btn>
                        <Btn color={C.success} onClick={save} disabled={saving}>
                            {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Saving...</span> : '💾 Save Marks'}
                        </Btn>
                    </div>
                </Card>
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: C.white }}>📊 Marks Register {filtered.length !== marks.length && <span style={{ color: C.gray, fontWeight: 500 }}>({filtered.length} of {marks.length})</span>}</p>
                </div>
                {loading ? (
                    <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div>
                ) : filtered.length === 0 ? (
                    <EmptyState icon="📊" message={search || filterExam ? 'No matching entries' : 'No marks entered yet'} sub={search || filterExam ? 'Adjust your filters' : 'Click "+ Enter Marks" to get started'} />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: C.bg }}>
                                    {['Student', 'Class', 'Subject', 'Exam', 'Marks', '%', 'Grade', ''].map(h => (
                                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(m => {
                                    const { g, c } = getGrade(Number(m.marks), Number(m.max_marks));
                                    const pct = Math.round((Number(m.marks) / Number(m.max_marks)) * 100);
                                    return (
                                        <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#1a2332'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: C.white }}>{m.student_name}</td>
                                            <td style={{ padding: '12px 14px', color: C.light }}>Class {m.class}</td>
                                            <td style={{ padding: '12px 14px', color: C.lighter }}>{m.subject}</td>
                                            <td style={{ padding: '12px 14px' }}><Badge color={C.primary}>{m.exam_type}</Badge></td>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: C.white }}>{m.marks}/{m.max_marks}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: pct >= 33 ? C.success : C.danger }}>{pct}%</td>
                                            <td style={{ padding: '12px 14px' }}><Badge color={c}>{g}</Badge></td>
                                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                                <span onClick={() => startEdit(m)} style={{ cursor: 'pointer', fontSize: 14, opacity: 0.5, transition: 'opacity .15s', marginRight: 8 }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>✏️</span>
                                                <span onClick={() => setDeleteConfirm(m.id)} style={{ cursor: 'pointer', fontSize: 14, opacity: 0.5, transition: 'opacity .15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>🗑️</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// LESSON PLANS
// ════════════════════════════════════════════════════════════════
function LessonPlans({ token, toast }) {
    const headers = { Authorization: `Bearer ${token}` };
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const emptyForm = { class: '1st', subject: 'Mathematics', topic: '', objectives: '', activities: '', homework: '', date: new Date().toISOString().split('T')[0], status: 'planned' };
    const [form, setForm] = useState({ ...emptyForm });
    const f = v => setForm(p => ({ ...p, ...v }));

    const fetchLessons = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/api/teacher/lessons`, { headers });
            setLessons(r.data);
        } catch (e) { console.error(e); }
    }, [headers]);

    useEffect(() => { fetchLessons().finally(() => setLoading(false)); }, [fetchLessons]);

    const statusColor = s => ({ planned: C.warning, completed: C.success, cancelled: C.danger, in_progress: C.primary }[s] || C.gray);
    const statusIcon = s => ({ planned: '📅', completed: '✅', cancelled: '❌', in_progress: '🔄' }[s] || '📋');

    const save = async () => {
        if (!form.topic) { toast('Topic is required', 'warning'); return; }
        setSaving(true);
        try {
            if (editing) {
                await axios.put(`${API}/api/lesson-plans/${editing}`, { ...form, staff_id: 'self' }, { headers });
                toast('Lesson plan updated!');
            } else {
                await axios.post(`${API}/api/lesson-plans`, { ...form, staff_id: 'self' }, { headers });
                toast('Lesson plan created!');
            }
            await fetchLessons();
            setAdding(false);
            setEditing(null);
            setForm({ ...emptyForm });
        } catch (e) { toast('Failed to save lesson plan', 'error'); }
        setSaving(false);
    };

    const startEdit = (l) => {
        setForm({ class: l.class, subject: l.subject, topic: l.topic, objectives: l.objectives || '', activities: l.activities || '', homework: l.homework || '', date: l.date || '', status: l.status || 'planned' });
        setEditing(l.id);
        setAdding(true);
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API}/api/lesson-plans/${id}`, { status }, { headers });
            await fetchLessons();
            toast(`Status updated to ${status}`);
        } catch (e) { toast('Status update failed', 'error'); }
    };

    const deleteLesson = async (id) => {
        try {
            await axios.delete(`${API}/api/lesson-plans/${id}`, { headers });
            await fetchLessons();
            toast('Lesson plan deleted');
        } catch (e) { toast('Delete failed', 'error'); }
        setDeleteConfirm(null);
    };

    const filtered = lessons.filter(l => {
        const matchSearch = !search || (l.topic || '').toLowerCase().includes(search.toLowerCase()) || (l.subject || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || l.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const completed = lessons.filter(l => l.status === 'completed').length;
    const planned = lessons.filter(l => l.status === 'planned').length;
    const inProgress = lessons.filter(l => l.status === 'in_progress').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {deleteConfirm && <ConfirmDialog message="Delete this lesson plan?" onConfirm={() => deleteLesson(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="📝" label="Total Plans" value={loading ? '...' : lessons.length} color={C.primary} />
                <StatCard icon="✅" label="Completed" value={completed} color={C.success} />
                <StatCard icon="🔄" label="In Progress" value={inProgress} color={C.primary} />
                <StatCard icon="📅" label="Planned" value={planned} color={C.warning} />
            </div>

            {/* Completion Bar */}
            {lessons.length > 0 && (
                <Card style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.light }}>Overall Completion</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.success }}>{Math.round(completed / lessons.length * 100)}%</span>
                    </div>
                    <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${completed / lessons.length * 100}%`, background: 'linear-gradient(90deg, #00d97e, #4e8ef7)', borderRadius: 4, transition: 'width .5s ease' }} />
                    </div>
                </Card>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search topic or subject..." />
                    <Sel options={['planned', 'in_progress', 'completed', 'cancelled'].map(s => ({ value: s, label: s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) }))} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Status" style={{ width: 150, padding: '10px 12px', fontSize: 12 }} />
                </div>
                <Btn color={C.purple} onClick={() => { setAdding(!adding); if (adding) { setEditing(null); setForm({ ...emptyForm }); } }}>
                    {adding ? '✕ Cancel' : '+ Create Lesson Plan'}
                </Btn>
            </div>

            {adding && (
                <Card style={{ borderColor: C.purple + '44' }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.purple }}>
                        {editing ? '✏️ Edit Lesson Plan' : '📝 New Lesson Plan'}
                    </p>
                    <Grid cols="repeat(auto-fit, minmax(180px, 1fr))">
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Sel label="Subject" value={form.subject} onChange={e => f({ subject: e.target.value })} options={SUBJECTS} />
                        <Inp label="Topic *" value={form.topic} onChange={e => f({ topic: e.target.value })} placeholder="e.g. Quadratic Equations" />
                        <Inp label="Date" type="date" value={form.date} onChange={e => f({ date: e.target.value })} />
                        <Sel label="Status" value={form.status} onChange={e => f({ status: e.target.value })} options={[
                            { value: 'planned', label: '📅 Planned' },
                            { value: 'in_progress', label: '🔄 In Progress' },
                            { value: 'completed', label: '✅ Completed' },
                            { value: 'cancelled', label: '❌ Cancelled' },
                        ]} />
                    </Grid>
                    {[
                        { label: 'Learning Objectives', key: 'objectives', placeholder: 'Students will be able to...' },
                        { label: 'Activities / Methodology', key: 'activities', placeholder: 'Teaching methods, activities...' },
                        { label: 'Homework / Assignment', key: 'homework', placeholder: 'Exercises to complete at home...' },
                    ].map(field => (
                        <div key={field.key} style={{ marginTop: 14 }}>
                            <label style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>{field.label}</label>
                            <textarea value={form[field.key]} onChange={e => f({ [field.key]: e.target.value })}
                                placeholder={field.placeholder} rows={2}
                                style={{ width: '100%', marginTop: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <Btn color="#6b7280" onClick={() => { setAdding(false); setEditing(null); setForm({ ...emptyForm }); }}>Cancel</Btn>
                        <Btn color={C.purple} onClick={save} disabled={saving}>
                            {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Saving...</span> : '💾 Save Plan'}
                        </Btn>
                    </div>
                </Card>
            )}

            {loading ? (
                <Card><div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div></Card>
            ) : filtered.length === 0 ? (
                <EmptyState icon="📝" message={search || filterStatus ? 'No matching plans' : 'No lesson plans yet'} sub={search || filterStatus ? 'Adjust your filters' : 'Click "+ Create Lesson Plan" to get started'} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                    {filtered.map(l => (
                        <Card key={l.id} style={{ transition: 'border-color .15s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 800, color: C.white, fontSize: 15 }}>{l.topic}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: C.gray }}>{l.subject} · Class {l.class}</p>
                                </div>
                                <Badge color={statusColor(l.status)}>{statusIcon(l.status)} {l.status.replace('_', ' ')}</Badge>
                            </div>
                            {l.objectives && <p style={{ margin: '0 0 6px', fontSize: 12, color: C.light }}>🎯 {l.objectives}</p>}
                            {l.activities && <p style={{ margin: '0 0 6px', fontSize: 12, color: C.light }}>🔬 {l.activities}</p>}
                            {l.homework && <p style={{ margin: '0 0 6px', fontSize: 12, color: C.light }}>📚 HW: {l.homework}</p>}
                            <p style={{ margin: '8px 0 0', fontSize: 11, color: C.gray }}>📅 {l.date ? new Date(l.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                                {l.status === 'planned' && <Btn small color={C.primary} onClick={() => updateStatus(l.id, 'in_progress')}>🔄 Start</Btn>}
                                {l.status === 'in_progress' && <Btn small color={C.success} onClick={() => updateStatus(l.id, 'completed')}>✅ Complete</Btn>}
                                <Btn small outline color={C.light} onClick={() => startEdit(l)}>✏️ Edit</Btn>
                                <span onClick={() => setDeleteConfirm(l.id)} style={{ cursor: 'pointer', fontSize: 14, opacity: 0.5, transition: 'opacity .15s', display: 'flex', alignItems: 'center' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>🗑️</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// TIMETABLE
// ════════════════════════════════════════════════════════════════
function TeacherTimetable({ token }) {
    const headers = { Authorization: `Bearer ${token}` };
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // table | list

    useEffect(() => {
        axios.get(`${API}/api/teacher/timetable`, { headers }).then(r => setTimetable(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const PERIODS = [
        { time: '8:00–8:40', label: 'Period 1' },
        { time: '8:40–9:20', label: 'Period 2' },
        { time: '9:20–10:00', label: 'Period 3' },
        { time: '10:00–10:20', label: 'Break' },
        { time: '10:20–11:00', label: 'Period 4' },
        { time: '11:00–11:40', label: 'Period 5' },
        { time: '11:40–12:20', label: 'Period 6' },
        { time: '12:20–1:00', label: 'Lunch' },
        { time: '1:00–1:40', label: 'Period 7' },
        { time: '1:40–2:20', label: 'Period 8' },
    ];

    const SUBJECT_COLORS = {
        Mathematics: '#4e8ef7', Science: '#00d97e', English: '#a78bfa', Hindi: '#f97316',
        'Social Studies': '#f6c90e', Computer: '#f45b69', Physics: '#4e8ef7', Chemistry: '#00d97e',
        Biology: '#00c4cc', PE: '#00c4cc', Art: '#f97316', Break: '#374151', Lunch: '#374151'
    };

    // Seeded random for consistent mock data
    const seededRandom = (seed) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const getSlot = (day, period) => {
        if (period.label === 'Break') return { subject: 'Break', class: '', isBreak: true };
        if (period.label === 'Lunch') return { subject: 'Lunch Break', class: '', isBreak: true };
        const seed = DAYS.indexOf(day) * 10 + PERIODS.indexOf(period);
        const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer'];
        return {
            subject: subjects[Math.floor(seededRandom(seed) * subjects.length)],
            class: CLASSES[Math.floor(seededRandom(seed + 100) * 8)],
            isBreak: false
        };
    };

    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
    const totalPeriods = PERIODS.filter(p => !p.label.includes('Break') && !p.label.includes('Lunch')).length;

    if (loading) return <Card><div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div></Card>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, color: C.white, fontSize: 15 }}>📅 My Weekly Timetable</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.gray }}>{totalPeriods} teaching periods per day</p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: C.bg, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
                    {['table', 'list'].map(mode => (
                        <span key={mode} onClick={() => setViewMode(mode)} style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            background: viewMode === mode ? C.primary : 'transparent',
                            color: viewMode === mode ? '#fff' : C.gray,
                            transition: 'all .15s'
                        }}>{mode === 'table' ? '📊 Table' : '📋 List'}</span>
                    ))}
                </div>
            </div>

            {viewMode === 'table' ? (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                            <thead>
                                <tr style={{ background: C.bg }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 700, minWidth: 90, position: 'sticky', left: 0, background: C.bg, zIndex: 2 }}>TIME</th>
                                    {DAYS.map((d, i) => (
                                        <th key={d} style={{
                                            padding: '12px', textAlign: 'center', fontSize: 11, fontWeight: 700,
                                            color: i === todayIndex ? C.primary : C.gray,
                                            background: i === todayIndex ? '#4e8ef708' : 'transparent',
                                            borderBottom: i === todayIndex ? `2px solid ${C.primary}` : 'none'
                                        }}>
                                            {d.slice(0, 3).toUpperCase()}
                                            {i === todayIndex && <div style={{ fontSize: 9, color: C.primary, fontWeight: 400, marginTop: 2 }}>TODAY</div>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERIODS.map((period, pi) => (
                                    <tr key={pi} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '8px 12px', fontSize: 11, color: C.gray, fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: C.card, zIndex: 1 }}>
                                            <div>{period.time}</div>
                                            <div style={{ fontSize: 9, color: '#4b5563' }}>{period.label}</div>
                                        </td>
                                        {DAYS.map((day, di) => {
                                            const slot = getSlot(day, period);
                                            if (slot.isBreak) {
                                                return (
                                                    <td key={day} style={{ padding: '4px 6px', textAlign: 'center' }}>
                                                        <div style={{ background: '#37415122', borderRadius: 6, padding: '4px 2px' }}>
                                                            <p style={{ margin: 0, fontSize: 10, color: '#4b5563', fontWeight: 600 }}>☕ {slot.subject}</p>
                                                        </div>
                                                    </td>
                                                );
                                            }
                                            const color = SUBJECT_COLORS[slot.subject] || '#6b7280';
                                            const isToday = di === todayIndex;
                                            return (
                                                <td key={day} style={{ padding: '4px 6px', textAlign: 'center', background: isToday ? '#4e8ef704' : 'transparent' }}>
                                                    <div style={{
                                                        background: color + '15', border: `1px solid ${color}33`,
                                                        borderRadius: 8, padding: '6px 4px', transition: 'all .15s', cursor: 'default'
                                                    }} onMouseEnter={e => { e.currentTarget.style.background = color + '25'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = color + '15'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color }}>{slot.subject}</p>
                                                        <p style={{ margin: 0, fontSize: 10, color: C.gray }}>Cl.{slot.class}</p>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                    {DAYS.map((day, di) => {
                        const isToday = di === todayIndex;
                        return (
                            <Card key={day} style={{ borderColor: isToday ? C.primary + '44' : C.border }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <p style={{ margin: 0, fontWeight: 800, color: isToday ? C.primary : C.white, fontSize: 15 }}>{day}</p>
                                    {isToday && <Badge color={C.primary}>Today</Badge>}
                                </div>
                                {PERIODS.map((period, pi) => {
                                    const slot = getSlot(day, period);
                                    if (slot.isBreak) return (
                                        <div key={pi} style={{ padding: '6px 0', borderBottom: `1px solid ${C.border}44` }}>
                                            <p style={{ margin: 0, fontSize: 11, color: '#4b5563' }}>☕ {slot.subject} · {period.time}</p>
                                        </div>
                                    );
                                    const color = SUBJECT_COLORS[slot.subject] || '#6b7280';
                                    return (
                                        <div key={pi} style={{
                                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                                            borderBottom: `1px solid ${C.border}44`
                                        }}>
                                            <span style={{ fontSize: 11, color: C.gray, width: 70, flexShrink: 0 }}>{period.time}</span>
                                            <div style={{
                                                flex: 1, padding: '6px 10px', borderRadius: 6,
                                                background: color + '15', border: `1px solid ${color}33`
                                            }}>
                                                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color }}>{slot.subject}</p>
                                                <p style={{ margin: 0, fontSize: 10, color: C.gray }}>Class {slot.class}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Legend */}
            <Card style={{ padding: '14px 20px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: C.light }}>SUBJECT LEGEND</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(SUBJECT_COLORS).filter(([k]) => !['Break', 'Lunch'].includes(k)).map(([sub, color]) => (
                        <span key={sub} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '22', color }}>{sub}</span>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// ONLINE CLASSES
// ════════════════════════════════════════════════════════════════
function OnlineClassesTeacher({ token, toast }) {
    const headers = { Authorization: `Bearer ${token}` };
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const emptyForm = { title: '', subject: 'Mathematics', class: '1st', meeting_link: '', scheduled_at: '', duration: 60, description: '' };
    const [form, setForm] = useState({ ...emptyForm });
    const f = v => setForm(p => ({ ...p, ...v }));

    const fetchClasses = useCallback(async () => {
        try {
            const r = await axios.get(`${API}/api/teacher/online-classes`, { headers });
            setClasses(r.data);
        } catch (e) { console.error(e); }
    }, [headers]);

    useEffect(() => { fetchClasses().finally(() => setLoading(false)); }, [fetchClasses]);

    const save = async () => {
        if (!form.title || !form.meeting_link) { toast('Title and meeting link are required', 'warning'); return; }
        setSaving(true);
        try {
            if (editing) {
                await axios.put(`${API}/api/online-classes/${editing}`, form, { headers });
                toast('Class updated!');
            } else {
                await axios.post(`${API}/api/online-classes`, form, { headers });
                toast('Online class scheduled!');
            }
            await fetchClasses();
            setAdding(false);
            setEditing(null);
            setForm({ ...emptyForm });
        } catch (e) { toast('Failed to save class', 'error'); }
        setSaving(false);
    };

    const startEdit = (cls) => {
        setForm({ title: cls.title, subject: cls.subject, class: cls.class, meeting_link: cls.meeting_link, scheduled_at: cls.scheduled_at || '', duration: cls.duration || 60, description: cls.description || '' });
        setEditing(cls.id);
        setAdding(true);
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API}/api/online-classes/${id}/status`, { status }, { headers });
            await fetchClasses();
            toast(status === 'live' ? '🔴 Class is now LIVE!' : status === 'completed' ? 'Class ended' : 'Status updated');
        } catch (e) { toast('Status update failed', 'error'); }
    };

    const deleteClass = async (id) => {
        try {
            await axios.delete(`${API}/api/online-classes/${id}`, { headers });
            await fetchClasses();
            toast('Class deleted');
        } catch (e) { toast('Delete failed', 'error'); }
        setDeleteConfirm(null);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'live': return <Badge color={C.danger}>🔴 Live Now</Badge>;
            case 'completed': return <Badge color={C.success}>✅ Completed</Badge>;
            case 'cancelled': return <Badge color={C.gray}>❌ Cancelled</Badge>;
            default: return <Badge color={C.warning}>📅 Scheduled</Badge>;
        }
    };

    const scheduled = classes.filter(c => c.status === 'scheduled').length;
    const live = classes.filter(c => c.status === 'live').length;
    const completed = classes.filter(c => c.status === 'completed').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {deleteConfirm && <ConfirmDialog message="Delete this online class?" onConfirm={() => deleteClass(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="💻" label="Total Classes" value={loading ? '...' : classes.length} color={C.primary} />
                <StatCard icon="📅" label="Scheduled" value={scheduled} color={C.warning} />
                <StatCard icon="🔴" label="Live Now" value={live} color={C.danger} />
                <StatCard icon="✅" label="Completed" value={completed} color={C.success} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color={C.orange} onClick={() => { setAdding(!adding); if (adding) { setEditing(null); setForm({ ...emptyForm }); } }}>
                    {adding ? '✕ Cancel' : '💻 Schedule Class'}
                </Btn>
            </div>

            {adding && (
                <Card style={{ borderColor: C.orange + '44' }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.orange }}>
                        {editing ? '✏️ Edit Online Class' : '💻 Schedule Online Class'}
                    </p>
                    <Grid cols="repeat(auto-fit, minmax(200px, 1fr))">
                        <Inp label="Title *" value={form.title} onChange={e => f({ title: e.target.value })} placeholder="e.g. Chapter 5 Revision" />
                        <Sel label="Subject" value={form.subject} onChange={e => f({ subject: e.target.value })} options={SUBJECTS} />
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Inp label="Meeting Link *" value={form.meeting_link} onChange={e => f({ meeting_link: e.target.value })} placeholder="Google Meet / Zoom link" />
                        <Inp label="Scheduled At" type="datetime-local" value={form.scheduled_at} onChange={e => f({ scheduled_at: e.target.value })} />
                        <Inp label="Duration (mins)" type="number" min="5" value={form.duration} onChange={e => f({ duration: e.target.value })} />
                    </Grid>
                    <div style={{ marginTop: 14 }}>
                        <label style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>Description (optional)</label>
                        <textarea value={form.description} onChange={e => f({ description: e.target.value })} rows={2} placeholder="Brief description of the class..."
                            style={{ width: '100%', marginTop: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <Btn color="#6b7280" onClick={() => { setAdding(false); setEditing(null); setForm({ ...emptyForm }); }}>Cancel</Btn>
                        <Btn color={C.orange} onClick={save} disabled={saving}>
                            {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Saving...</span> : '💾 Schedule'}
                        </Btn>
                    </div>
                </Card>
            )}

            {loading ? (
                <Card><div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div></Card>
            ) : classes.length === 0 ? (
                <EmptyState icon="💻" message="No online classes scheduled" sub="Click 'Schedule Class' to create one" />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                    {classes.map(cls => {
                        const isLive = cls.status === 'live';
                        return (
                            <Card key={cls.id} style={{
                                borderColor: isLive ? C.danger : C.border,
                                animation: isLive ? 'livePulse 2s ease infinite' : 'none'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 800, color: C.white, fontSize: 15 }}>{cls.title}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: C.gray }}>{cls.subject} · Class {cls.class}</p>
                                    </div>
                                    {getStatusBadge(cls.status)}
                                </div>
                                {cls.description && <p style={{ margin: '0 0 8px', fontSize: 12, color: C.light }}>{cls.description}</p>}
                                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.gray }}>
                                    ⏰ {cls.scheduled_at ? new Date(cls.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Not scheduled'} · ⏱️ {cls.duration} mins
                                </p>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {cls.meeting_link && (
                                        <a href={cls.meeting_link} target="_blank" rel="noreferrer" style={{
                                            flex: 1, minWidth: 100, padding: '8px', background: isLive ? C.danger : C.success, border: 'none', borderRadius: 8,
                                            color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                        }}>
                                            {isLive ? '🔴' : '🔗'} {isLive ? 'Join Now' : 'Open Link'}
                                        </a>
                                    )}
                                    {cls.status === 'scheduled' && (
                                        <>
                                            <Btn small color={C.danger} onClick={() => updateStatus(cls.id, 'live')}>🔴 Go Live</Btn>
                                            <Btn small outline color={C.light} onClick={() => startEdit(cls)}>✏️</Btn>
                                        </>
                                    )}
                                    {cls.status === 'live' && (
                                        <Btn small color="#6b7280" onClick={() => updateStatus(cls.id, 'completed')}>✅ End Class</Btn>
                                    )}
                                    {cls.status !== 'live' && (
                                        <span onClick={() => setDeleteConfirm(cls.id)} style={{ cursor: 'pointer', fontSize: 14, opacity: 0.5, transition: 'opacity .15s', display: 'flex', alignItems: 'center' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>🗑️</span>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════════════
function TeacherProfile({ teacher, token, toast }) {
    const headers = { Authorization: `Bearer ${token}` };
    const [profile, setProfile] = useState(teacher);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', qualification: '', bio: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    useEffect(() => {
        axios.get(`${API}/api/teacher/profile`, { headers }).then(r => {
            setProfile(r.data);
            setForm({ name: r.data.name || '', email: r.data.email || '', phone: r.data.phone || '', department: r.data.department || '', qualification: r.data.qualification || '', bio: r.data.bio || '' });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const save = async () => {
        if (!form.name || !form.email) { toast('Name and email are required', 'warning'); return; }
        setSaving(true);
        try {
            const res = await axios.put(`${API}/api/teacher/profile`, form, { headers });
            setProfile(res.data?.teacher || res.data);
            localStorage.setItem('teacher_data', JSON.stringify(res.data?.teacher || res.data));
            setEditing(false);
            toast('Profile updated successfully!');
        } catch (e) { toast('Failed to update profile', 'error'); }
        setSaving(false);
    };

    const changePassword = async () => {
        // Simple password change - in production, use a modal
        const newPass = prompt('Enter new password (min 6 characters):');
        if (!newPass || newPass.length < 6) { if (newPass !== null) toast('Password must be at least 6 characters', 'warning'); return; }
        try {
            await axios.put(`${API}/api/teacher/change-password`, { new_password: newPass }, { headers });
            toast('Password changed successfully!');
        } catch (e) { toast('Failed to change password', 'error'); }
    };

    if (loading) return <Card><div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner size={28} /></div></Card>;

    const initials = (profile?.name || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{
                            width: 88, height: 88, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4e8ef7, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, fontWeight: 900, color: '#fff', flexShrink: 0,
                            boxShadow: '0 10px 40px rgba(78,142,247,0.3)'
                        }}>
                            {initials}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 4px', color: C.white, fontSize: 24, fontWeight: 900 }}>{profile?.name}</h2>
                            <p style={{ margin: '0 0 8px', fontSize: 13, color: C.light }}>{profile?.email}</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Badge color={C.primary}>{profile?.role || 'Teacher'}</Badge>
                                {profile?.department && <Badge color={C.purple}>{profile.department}</Badge>}
                                <Badge color={C.success}>● Active</Badge>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Btn small outline color={C.primary} onClick={() => setEditing(!editing)}>
                            {editing ? '✕ Cancel' : '✏️ Edit'}
                        </Btn>
                    </div>
                </div>

                {editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 0', borderTop: `1px solid ${C.border}` }}>
                        <Grid cols="repeat(auto-fit, minmax(220px, 1fr))">
                            <Inp label="Full Name *" value={form.name} onChange={e => f({ name: e.target.value })} />
                            <Inp label="Email *" type="email" value={form.email} onChange={e => f({ email: e.target.value })} />
                            <Inp label="Phone" value={form.phone} onChange={e => f({ phone: e.target.value })} placeholder="+91..." />
                            <Inp label="Department" value={form.department} onChange={e => f({ department: e.target.value })} />
                            <Inp label="Qualification" value={form.qualification} onChange={e => f({ qualification: e.target.value })} placeholder="e.g. M.Ed, B.Sc" />
                        </Grid>
                        <div>
                            <label style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>Bio / About</label>
                            <textarea value={form.bio} onChange={e => f({ bio: e.target.value })} rows={3} placeholder="Tell us about yourself..."
                                style={{ width: '100%', marginTop: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.white, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                        </div>
                        <Btn color={C.success} onClick={save} disabled={saving}>
                            {saving ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#fff" /> Saving...</span> : '💾 Save Changes'}
                        </Btn>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        {[
                            { label: 'Employee ID', value: profile?.id, icon: '🔑' },
                            { label: 'Department', value: profile?.department || '—', icon: '🏛️' },
                            { label: 'Role', value: profile?.role || 'Teacher', icon: '💼' },
                            { label: 'Email', value: profile?.email, icon: '📧' },
                            { label: 'Phone', value: profile?.phone || '—', icon: '📱' },
                            { label: 'Qualification', value: profile?.qualification || '—', icon: '🎓' },
                        ].map(({ label, value, icon }) => (
                            <div key={label} style={{ background: C.bg, borderRadius: 10, padding: '14px 16px', border: `1px solid ${C.border}` }}>
                                <p style={{ margin: '0 0 4px', fontSize: 10, color: C.gray, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{icon} {label}</p>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.white }}>{value || '—'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {profile?.bio && !editing && (
                    <div style={{ marginTop: 16, padding: 16, background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: C.gray, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>📝 BIO</p>
                        <p style={{ margin: 0, fontSize: 13, color: C.lighter, lineHeight: 1.6 }}>{profile.bio}</p>
                    </div>
                )}
            </Card>

            {/* Account Settings */}
            <Card>
                <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.white, fontSize: 15 }}>⚙️ Account Settings</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Btn small outline color={C.warning} onClick={changePassword}>🔒 Change Password</Btn>
                    <Btn small outline color={C.gray}>📋 View Login History</Btn>
                    <Btn small outline color={C.gray}>🔔 Notification Preferences</Btn>
                </div>
            </Card>

            {/* Session Info */}
            <Card style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.gray }}>
                        Session started: {new Date().toLocaleString('en-IN')} · Token expires per server policy
                    </p>
                    <Badge color={C.success}>Session Active</Badge>
                </div>
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// MAIN TEACHER PORTAL
// ════════════════════════════════════════════════════════════════
const TABS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'attendance', icon: '📋', label: 'Attendance' },
    { id: 'marks', icon: '📝', label: 'Marks' },
    { id: 'lessons', icon: '📖', label: 'Lesson Plans' },
    { id: 'timetable', icon: '📅', label: 'Timetable' },
    { id: 'online', icon: '💻', label: 'Online Classes' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
];

export default function TeacherPortal() {
    const [authed, setAuthed] = useState(() => {
        try { return !!localStorage.getItem('teacher_token'); } catch { return false; }
    });
    const [teacher, setTeacher] = useState(() => {
        try { return JSON.parse(localStorage.getItem('teacher_data') || 'null'); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('teacher_token') || '');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const toastId = useRef(0);

    const toast = useCallback((message, type = 'success') => {
        const key = ++toastId.current;
        setToasts(prev => [...prev.slice(-4), { message, type, key }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.key !== key)), 3500);
    }, []);

    const removeToast = useCallback((key) => {
        setToasts(prev => prev.filter(t => t.key !== key));
    }, []);

    const navigate = useCallback((tab) => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
    }, []);

    const handleLogin = (teacherData, teacherToken) => {
        setTeacher(teacherData);
        setToken(teacherToken);
        setAuthed(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('teacher_token');
        localStorage.removeItem('teacher_data');
        setAuthed(false);
        setTeacher(null);
        setToken('');
    };

    if (!authed) return <TeacherLogin onLogin={handleLogin} />;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard teacher={teacher} token={token} navigate={navigate} />;
            case 'attendance': return <TeacherAttendance token={token} toast={toast} />;
            case 'marks': return <MarksModule token={token} toast={toast} />;
            case 'lessons': return <LessonPlans token={token} toast={toast} />;
            case 'timetable': return <TeacherTimetable token={token} />;
            case 'online': return <OnlineClassesTeacher token={token} toast={toast} />;
            case 'profile': return <TeacherProfile teacher={teacher} token={token} toast={toast} />;
            default: return <Dashboard teacher={teacher} token={token} navigate={navigate} />;
        }
    };

    const activeTabData = TABS.find(t => t.id === activeTab);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Segoe UI', sans-serif", color: C.white }}>
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div onClick={() => setMobileMenuOpen(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, display: 'none'
                }} className="mobile-overlay" />
            )}

            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? 230 : 64,
                background: C.card, borderRight: `1px solid ${C.border}`,
                display: 'flex', flexDirection: 'column', position: 'fixed',
                height: '100vh', zIndex: 100, transition: 'width .25s ease', overflow: 'hidden',
                // Responsive: hide on mobile unless menu open
            }}
                className="sidebar"
            >
                {/* Logo */}
                <div style={{ padding: '20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, minHeight: 72 }}>
                    <div style={{
                        width: 36, height: 36, background: 'linear-gradient(135deg, #4e8ef7, #a78bfa)',
                        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0, boxShadow: '0 4px 16px rgba(78,142,247,0.3)'
                    }}>👨‍🏫</div>
                    {sidebarOpen && (
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontWeight: 900, color: C.white, fontSize: 13, whiteSpace: 'nowrap' }}>Teacher Portal</p>
                            <p style={{ margin: 0, fontSize: 10, color: C.gray, whiteSpace: 'nowrap' }}>{teacher?.name?.split(' ')[0]}</p>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <div key={tab.id} onClick={() => navigate(tab.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                                cursor: 'pointer', transition: 'all .15s',
                                background: isActive ? '#1f2d3d' : 'transparent',
                                color: isActive ? C.primary : C.light,
                                fontWeight: isActive ? 700 : 500, fontSize: 13,
                            }} onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1a2332'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{tab.icon}</span>
                                {sidebarOpen && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.label}</span>}
                                {isActive && sidebarOpen && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />}
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div style={{ padding: '8px 8px 12px', borderTop: `1px solid ${C.border}` }}>
                    <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: 10, cursor: 'pointer', color: C.gray, fontSize: 13,
                        transition: 'color .15s'
                    }} onMouseEnter={e => e.currentTarget.style.color = C.light} onMouseLeave={e => e.currentTarget.style.color = C.gray}>
                        <span style={{ fontSize: 18 }}>{sidebarOpen ? '◀' : '▶'}</span>
                        {sidebarOpen && <span>Collapse</span>}
                    </div>
                    <div onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                        borderRadius: 10, cursor: 'pointer', color: C.danger, fontSize: 13,
                        transition: 'background .15s'
                    }} onMouseEnter={e => e.currentTarget.style.background = '#f45b6911'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: 18 }}>🚪</span>
                        {sidebarOpen && <span>Logout</span>}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: sidebarOpen ? 230 : 64, flex: 1, padding: '28px',
                transition: 'margin .25s ease', minHeight: '100vh', minWidth: 0
            }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Mobile menu button */}
                        <span onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
                            display: 'none', fontSize: 22, cursor: 'pointer', padding: 4
                        }} className="mobile-menu-btn">☰</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.white }}>
                                {activeTabData?.icon} {activeTabData?.label}
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.gray }}>
                                {teacher?.name} · {teacher?.role || 'Teacher'}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 14px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 12, color: C.light, fontWeight: 600 }}>Online</span>
                        </div>
                        {/* Profile avatar shortcut */}
                        <div onClick={() => navigate('profile')} style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4e8ef7, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 900, color: '#fff', cursor: 'pointer',
                            transition: 'transform .15s'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                            {(teacher?.name || 'T').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                    </div>
                </header>

                {renderContent()}
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
                @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes livePulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(244,91,105,0.3); } 50%{ box-shadow: 0 0 0 8px rgba(244,91,105,0); } }
                button:hover:not(:disabled) { opacity: .88; filter: brightness(1.05); }
                input:focus, select:focus, textarea:focus { border-color: ${C.primary} !important; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: ${C.bg}; }
                ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #374151; }
                * { box-sizing: border-box; }
                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); width: 230px !important; }
                    .sidebar.open { transform: translateX(0); }
                    .mobile-overlay { display: block !important; }
                    .mobile-menu-btn { display: block !important; }
                    main { margin-left: 0 !important; padding: 16px !important; }
                }
                select option { background: ${C.card}; color: ${C.white}; }
            `}</style>
        </div>
    );
}