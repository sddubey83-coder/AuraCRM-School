import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d', bg: '#0d1117' };

const Card = ({ children, style = {} }) => (
    <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, ...style }}>{children}</div>
);

const StatCard = ({ icon, label, value, color }) => (
    <Card>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</p>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color }}>{value}</h2>
    </Card>
);

const Badge = ({ children, color }) => (
    <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{children}</span>
);

export default function ParentPortal() {
    const [authed, setAuthed] = useState(() => !!localStorage.getItem('parent_token'));
    const [loginForm, setLoginForm] = useState({ phone: '', student_name: '' });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [student, setStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [fees, setFees] = useState({});
    const [results, setResults] = useState([]);
    const [notices, setNotices] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const token = localStorage.getItem('parent_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (authed) {
            axios.get(`${API}/api/parent/student`, { headers }).then(r => setStudent(r.data)).catch(() => { });
            axios.get(`${API}/api/parent/attendance`, { headers }).then(r => setAttendance(r.data)).catch(() => { });
            axios.get(`${API}/api/parent/fees`, { headers }).then(r => setFees(r.data)).catch(() => { });
            axios.get(`${API}/api/parent/results`, { headers }).then(r => setResults(r.data)).catch(() => { });
            axios.get(`${API}/api/parent/notices`, { headers }).then(r => setNotices(r.data)).catch(() => { });
        }
    }, [authed]);

    const handleLogin = async () => {
        if (!loginForm.phone) return setLoginError('Phone number required');
        setLoading(true); setLoginError('');
        try {
            const res = await axios.post(`${API}/api/parent/login`, loginForm);
            localStorage.setItem('parent_token', res.data.token);
            localStorage.setItem('parent_student', JSON.stringify(res.data.student));
            setAuthed(true);
        } catch (err) {
            setLoginError(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('parent_token');
        localStorage.removeItem('parent_student');
        setAuthed(false);
        setStudent(null);
    };

    const TABS = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'attendance', icon: '📅', label: 'Attendance' },
        { id: 'fees', icon: '💰', label: 'Fees' },
        { id: 'results', icon: '📊', label: 'Results' },
        { id: 'notices', icon: '📢', label: 'Notices' },
    ];

    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendancePercent = attendance.length ? Math.round(presentDays / attendance.length * 100) : 0;

    // Login Screen
    if (!authed) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: "'Segoe UI', sans-serif" }}>
                <div style={{ background: C.card, borderRadius: 24, padding: '48px 40px', width: 380, border: `1px solid ${C.border}`, boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#4e8ef7,#a78bfa)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>👨‍👩‍👧</div>
                        <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 22, fontWeight: 900 }}>Parent Portal</h2>
                        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 13 }}>AuraSync School AI</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Parent Phone Number</label>
                            <input
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={loginForm.phone}
                                onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${loginError ? '#f45b69' : C.border}`, borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Student Name (Optional)</label>
                            <input
                                placeholder="e.g. Rahul Kumar"
                                value={loginForm.student_name}
                                onChange={e => setLoginForm({ ...loginForm, student_name: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                        {loginError && <p style={{ color: '#f45b69', fontSize: 12, margin: 0, fontWeight: 700 }}>❌ {loginError}</p>}
                        <button onClick={handleLogin} disabled={loading} style={{ padding: '14px', background: loading ? '#374151' : '#4e8ef7', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? '⏳ Logging in...' : '🔓 Login'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', borderRadius: 20, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#4e8ef7', fontWeight: 700, letterSpacing: 2 }}>PARENT PORTAL</p>
                    <h2 style={{ margin: '4px 0 2px', color: '#f1f5f9', fontSize: 22, fontWeight: 900 }}>
                        Welcome! {student?.student_name || 'Parent'}
                    </h2>
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
                        Class {student?.class || '—'} · {student?.branch || '—'}
                    </p>
                </div>
                <button onClick={handleLogout} style={{ padding: '10px 18px', background: '#f45b6922', border: '1px solid #f45b69', borderRadius: 10, color: '#f45b69', fontWeight: 700, cursor: 'pointer' }}>
                    🚪 Logout
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, background: C.card, borderRadius: 14, padding: 6, border: `1px solid ${C.border}` }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none',
                        background: activeTab === t.id ? '#4e8ef7' : 'transparent',
                        color: activeTab === t.id ? '#fff' : '#6b7280',
                        fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                    }}>
                        <span style={{ fontSize: 18 }}>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                        <StatCard icon="📅" label="Attendance" value={`${attendancePercent}%`} color={attendancePercent >= 75 ? '#00d97e' : '#f45b69'} />
                        <StatCard icon="💰" label="Fees Due" value={`₹${Number(fees.paid_amount || 0).toLocaleString('en-IN')}`} color="#f6c90e" />
                        <StatCard icon="📊" label="Results" value={results.length} color="#4e8ef7" />
                        <StatCard icon="📢" label="Notices" value={notices.length} color="#a78bfa" />
                    </div>

                    {/* Student Card */}
                    {student && (
                        <Card>
                            <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>👨‍🎓 Student Profile</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    ['Student Name', student.student_name],
                                    ['Class', student.class],
                                    ['Branch', student.branch],
                                    ['Parent Phone', student.parent_phone],
                                    ['Status', student.status],
                                    ['Source', student.source],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ padding: '10px 14px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{label}</p>
                                        <p style={{ margin: 0, fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Recent Notices */}
                    {notices.length > 0 && (
                        <Card>
                            <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>📢 Latest Notices</p>
                            {notices.slice(0, 3).map(n => (
                                <div key={n.id} style={{ padding: '12px 14px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                                    <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{n.title}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{n.message}</p>
                                </div>
                            ))}
                        </Card>
                    )}
                </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                        <StatCard icon="✅" label="Present" value={presentDays} color="#00d97e" />
                        <StatCard icon="❌" label="Absent" value={attendance.length - presentDays} color="#f45b69" />
                        <StatCard icon="📊" label="Percentage" value={`${attendancePercent}%`} color={attendancePercent >= 75 ? '#00d97e' : '#f45b69'} />
                    </div>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📅 Attendance Records</p>
                        </div>
                        {attendance.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No attendance records yet.</p>}
                        {attendance.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `1px solid ${C.border}` }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{new Date(a.captured_at).toLocaleDateString('en-IN')}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{new Date(a.captured_at).toLocaleTimeString('en-IN')}</p>
                                </div>
                                <Badge color={a.status === 'present' ? '#00d97e' : '#f45b69'}>{a.status}</Badge>
                            </div>
                        ))}
                    </Card>
                </div>
            )}

            {/* Fees Tab */}
            {activeTab === 'fees' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                        <StatCard icon="💰" label="Total Fees" value={`₹${Number(fees.total_fees || 0).toLocaleString('en-IN')}`} color="#4e8ef7" />
                        <StatCard icon="✅" label="Paid" value={`₹${Number(fees.paid_amount || 0).toLocaleString('en-IN')}`} color="#00d97e" />
                        <StatCard icon="⏳" label="Pending" value={`₹${Number((fees.total_fees || 0) - (fees.paid_amount || 0)).toLocaleString('en-IN')}`} color="#f45b69" />
                    </div>
                    <Card>
                        <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>💰 Fee Details</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Total Fees', value: `₹${Number(fees.total_fees || 0).toLocaleString('en-IN')}`, color: '#4e8ef7' },
                                { label: 'Paid Amount', value: `₹${Number(fees.paid_amount || 0).toLocaleString('en-IN')}`, color: '#00d97e' },
                                { label: 'Pending Amount', value: `₹${Number((fees.total_fees || 0) - (fees.paid_amount || 0)).toLocaleString('en-IN')}`, color: '#f45b69' },
                            ].map(f => (
                                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                                    <span style={{ fontSize: 13, color: '#9ca3af' }}>{f.label}</span>
                                    <span style={{ fontSize: 14, color: f.color, fontWeight: 800 }}>{f.value}</span>
                                </div>
                            ))}
                        </div>
                        {/* Progress Bar */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>Payment Progress</span>
                                <span style={{ fontSize: 12, color: '#00d97e', fontWeight: 700 }}>
                                    {fees.total_fees ? Math.round(fees.paid_amount / fees.total_fees * 100) : 0}%
                                </span>
                            </div>
                            <div style={{ height: 10, background: C.border, borderRadius: 5 }}>
                                <div style={{
                                    width: `${fees.total_fees ? Math.round(fees.paid_amount / fees.total_fees * 100) : 0}%`,
                                    height: '100%', background: '#00d97e', borderRadius: 5, transition: 'width .5s'
                                }} />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {results.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No results available yet.</p>}
                    {results.map(r => {
                        const pct = Math.round(r.total_marks / r.max_marks * 100);
                        const grade = pct >= 91 ? 'A+' : pct >= 81 ? 'A' : pct >= 71 ? 'B+' : pct >= 61 ? 'B' : pct >= 51 ? 'C' : 'F';
                        const gradeColor = pct >= 75 ? '#00d97e' : pct >= 50 ? '#f6c90e' : '#f45b69';
                        return (
                            <Card key={r.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 16 }}>{r.exam_type}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{r.academic_year}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 900, fontSize: 28, color: gradeColor }}>{grade}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{pct}%</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${C.border}` }}>
                                    <span style={{ fontSize: 13, color: '#9ca3af' }}>Total Marks</span>
                                    <span style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 700 }}>{r.total_marks}/{r.max_marks}</span>
                                </div>
                                <div style={{ height: 8, background: C.border, borderRadius: 4, marginTop: 8 }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: gradeColor, borderRadius: 4 }} />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {notices.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No notices yet.</p>}
                    {notices.map(n => (
                        <Card key={n.id} style={{ border: `1px solid ${n.type === 'urgent' ? '#f45b69' : C.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{n.title}</p>
                                <Badge color={n.type === 'urgent' ? '#f45b69' : '#4e8ef7'}>{n.type}</Badge>
                            </div>
                            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9ca3af' }}>{n.message}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{new Date(n.created_at).toLocaleDateString('en-IN')}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}