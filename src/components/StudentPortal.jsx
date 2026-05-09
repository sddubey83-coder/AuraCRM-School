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

export default function StudentPortal() {
    const [authed, setAuthed] = useState(() => !!localStorage.getItem('student_token'));
    const [loginForm, setLoginForm] = useState({ student_name: '', parent_phone: '' });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [results, setResults] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [homework, setHomework] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [onlineClasses, setOnlineClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [notes, setNotes] = useState([]);
    const [noteForm, setNoteForm] = useState({ title: '', content: '', subject: '' });
    const [activeTab, setActiveTab] = useState('dashboard');
    const token = localStorage.getItem('student_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (authed) {
            axios.get(`${API}/api/student/profile`, { headers }).then(r => setProfile(r.data)).catch(() => { });
            axios.get(`${API}/api/student/results`, { headers }).then(r => setResults(r.data)).catch(() => { });
            axios.get(`${API}/api/student/attendance`, { headers }).then(r => setAttendance(r.data)).catch(() => { });
            axios.get(`${API}/api/student/homework`, { headers }).then(r => setHomework(r.data)).catch(() => { });
            axios.get(`${API}/api/student/timetable`, { headers }).then(r => setTimetable(r.data)).catch(() => { });
            axios.get(`${API}/api/student/online-classes`, { headers }).then(r => setOnlineClasses(r.data)).catch(() => { });
            axios.get(`${API}/api/student/notices`, { headers }).then(r => setNotices(r.data)).catch(() => { });
            axios.get(`${API}/api/student/notes`, { headers }).then(r => setNotes(r.data)).catch(() => { });
        }
    }, [authed]);

    const handleLogin = async () => {
        if (!loginForm.student_name || !loginForm.parent_phone) return setLoginError('All fields required');
        setLoading(true); setLoginError('');
        try {
            const res = await axios.post(`${API}/api/student/login`, loginForm);
            localStorage.setItem('student_token', res.data.token);
            localStorage.setItem('student_data', JSON.stringify(res.data.student));
            setAuthed(true);
        } catch (err) {
            setLoginError(err.response?.data?.error || 'Login failed');
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_data');
        setAuthed(false);
        setProfile(null);
    };

    const addNote = async () => {
        if (!noteForm.title || !noteForm.content) return;
        await axios.post(`${API}/api/student/notes`, noteForm, { headers });
        const r = await axios.get(`${API}/api/student/notes`, { headers });
        setNotes(r.data);
        setNoteForm({ title: '', content: '', subject: '' });
    };

    const deleteNote = async (id) => {
        await axios.delete(`${API}/api/student/notes/${id}`, { headers });
        setNotes(notes.filter(n => n.id !== id));
    };

    const TABS = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'results', icon: '📊', label: 'Results' },
        { id: 'attendance', icon: '📅', label: 'Attendance' },
        { id: 'homework', icon: '📚', label: 'Homework' },
        { id: 'timetable', icon: '🗓️', label: 'Timetable' },
        { id: 'classes', icon: '💻', label: 'Online Classes' },
        { id: 'notes', icon: '📝', label: 'My Notes' },
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
                        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#00d97e,#4e8ef7)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>👨‍🎓</div>
                        <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 22, fontWeight: 900 }}>Student Portal</h2>
                        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 13 }}>AuraSync School AI</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Student Name</label>
                            <input
                                placeholder="e.g. Rahul Kumar"
                                value={loginForm.student_name}
                                onChange={e => setLoginForm({ ...loginForm, student_name: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${loginError ? '#f45b69' : C.border}`, borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Parent Phone Number</label>
                            <input
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={loginForm.parent_phone}
                                onChange={e => setLoginForm({ ...loginForm, parent_phone: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${loginError ? '#f45b69' : C.border}`, borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                        {loginError && <p style={{ color: '#f45b69', fontSize: 12, margin: 0, fontWeight: 700 }}>❌ {loginError}</p>}
                        <button onClick={handleLogin} disabled={loading} style={{ padding: '14px', background: loading ? '#374151' : '#00d97e', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
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
                    <p style={{ margin: 0, fontSize: 12, color: '#00d97e', fontWeight: 700, letterSpacing: 2 }}>STUDENT PORTAL</p>
                    <h2 style={{ margin: '4px 0 2px', color: '#f1f5f9', fontSize: 22, fontWeight: 900 }}>
                        Welcome! {profile?.student_name || 'Student'}
                    </h2>
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>
                        Class {profile?.class || '—'} · {profile?.branch || '—'}
                    </p>
                </div>
                <button onClick={handleLogout} style={{ padding: '10px 18px', background: '#f45b6922', border: '1px solid #f45b69', borderRadius: 10, color: '#f45b69', fontWeight: 700, cursor: 'pointer' }}>
                    🚪 Logout
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, background: C.card, borderRadius: 14, padding: 6, border: `1px solid ${C.border}`, overflowX: 'auto' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        flex: 1, padding: '8px 6px', borderRadius: 10, border: 'none',
                        background: activeTab === t.id ? '#00d97e' : 'transparent',
                        color: activeTab === t.id ? '#fff' : '#6b7280',
                        fontWeight: 700, fontSize: 11, cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        minWidth: 70, whiteSpace: 'nowrap'
                    }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                        <StatCard icon="📅" label="Attendance" value={`${attendancePercent}%`} color={attendancePercent >= 75 ? '#00d97e' : '#f45b69'} />
                        <StatCard icon="📊" label="Results" value={results.length} color="#4e8ef7" />
                        <StatCard icon="📚" label="Homework" value={homework.length} color="#f6c90e" />
                        <StatCard icon="💻" label="Online Classes" value={onlineClasses.length} color="#a78bfa" />
                    </div>

                    {/* Profile Card */}
                    {profile && (
                        <Card>
                            <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#00d97e' }}>👨‍🎓 My Profile</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    ['Name', profile.student_name],
                                    ['Class', profile.class],
                                    ['Branch', profile.branch],
                                    ['Status', profile.status],
                                ].map(([label, value]) => (
                                    <div key={label} style={{ padding: '10px 14px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                                        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{label}</p>
                                        <p style={{ margin: 0, fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Latest Result */}
                    {results.length > 0 && (
                        <Card>
                            <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#f1f5f9' }}>📊 Latest Result</p>
                            {(() => {
                                const r = results[0];
                                const pct = Math.round(r.total_marks / r.max_marks * 100);
                                const grade = pct >= 91 ? 'A+' : pct >= 81 ? 'A' : pct >= 71 ? 'B+' : pct >= 61 ? 'B' : pct >= 51 ? 'C' : 'F';
                                const color = pct >= 75 ? '#00d97e' : pct >= 50 ? '#f6c90e' : '#f45b69';
                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>{r.exam_type}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{r.total_marks}/{r.max_marks} marks</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontWeight: 900, fontSize: 32, color }}>{grade}</p>
                                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{pct}%</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </Card>
                    )}
                </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {results.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No results yet.</p>}
                    {results.map(r => {
                        const pct = Math.round(r.total_marks / r.max_marks * 100);
                        const grade = pct >= 91 ? 'A+' : pct >= 81 ? 'A' : pct >= 71 ? 'B+' : pct >= 61 ? 'B' : pct >= 51 ? 'C' : 'F';
                        const color = pct >= 75 ? '#00d97e' : pct >= 50 ? '#f6c90e' : '#f45b69';
                        return (
                            <Card key={r.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 16 }}>{r.exam_type}</p>
                                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{r.academic_year}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 900, fontSize: 28, color }}>{grade}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{pct}%</p>
                                    </div>
                                </div>
                                <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                                </div>
                                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9ca3af' }}>Total: {r.total_marks}/{r.max_marks}</p>
                            </Card>
                        );
                    })}
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
                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📅 Attendance Log</p>
                        </div>
                        {attendance.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No attendance records.</p>}
                        {attendance.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `1px solid ${C.border}` }}>
                                <p style={{ margin: 0, color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{new Date(a.captured_at).toLocaleDateString('en-IN')}</p>
                                <Badge color={a.status === 'present' ? '#00d97e' : '#f45b69'}>{a.status}</Badge>
                            </div>
                        ))}
                    </Card>
                </div>
            )}

            {/* Homework Tab */}
            {activeTab === 'homework' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {homework.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No homework assigned.</p>}
                    {homework.map(h => (
                        <Card key={h.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{h.topic}</p>
                                <Badge color="#f6c90e">{h.subject}</Badge>
                            </div>
                            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af' }}>{h.notes || 'No additional notes'}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>📅 {new Date(h.date).toLocaleDateString('en-IN')} · ⏱️ {h.duration} mins</p>
                        </Card>
                    ))}
                </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {timetable.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No timetable available.</p>}
                    {timetable.map(t => (
                        <Card key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{t.subject}</p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{t.topic} · {t.duration} mins</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontSize: 13, color: '#4e8ef7', fontWeight: 700 }}>{new Date(t.date).toLocaleDateString('en-IN')}</p>
                                <Badge color="#4e8ef7">{t.status}</Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Online Classes Tab */}
            {activeTab === 'classes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {onlineClasses.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No online classes scheduled.</p>}
                    {onlineClasses.map(cls => (
                        <Card key={cls.id} style={{ border: `1px solid ${cls.status === 'live' ? '#f45b69' : C.border}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>{cls.title}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{cls.subject} · {cls.teacher_name}</p>
                                </div>
                                <Badge color={cls.status === 'live' ? '#f45b69' : cls.status === 'completed' ? '#00d97e' : '#f6c90e'}>
                                    {cls.status === 'live' ? '🔴 Live' : cls.status === 'completed' ? '✅ Done' : '📅 Scheduled'}
                                </Badge>
                            </div>
                            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af' }}>⏰ {cls.scheduled_at ? new Date(cls.scheduled_at).toLocaleString('en-IN') : 'N/A'} · ⏱️ {cls.duration} mins</p>
                            {cls.meeting_link && cls.status !== 'completed' && (
                                <a href={cls.meeting_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '8px 20px', background: '#00d97e', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                                    🔗 Join Class
                                </a>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card>
                        <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#a78bfa' }}>📝 Add Note</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input placeholder="Title" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            <input placeholder="Subject" value={noteForm.subject} onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })}
                                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            <textarea placeholder="Write your note..." value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} rows={3}
                                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                            <button onClick={addNote} style={{ padding: '10px', background: '#a78bfa', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                                💾 Save Note
                            </button>
                        </div>
                    </Card>
                    {notes.map(n => (
                        <Card key={n.id} style={{ border: `1px solid #a78bfa33` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{n.title}</p>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Badge color="#a78bfa">{n.subject}</Badge>
                                    <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', color: '#f45b69', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                                </div>
                            </div>
                            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9ca3af' }}>{n.content}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{new Date(n.created_at).toLocaleDateString('en-IN')}</p>
                        </Card>
                    ))}
                    {notes.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>No notes yet. Add your first note!</p>}
                </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {notices.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No notices yet.</p>}
                    {notices.map(n => (
                        <Card key={n.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{n.title}</p>
                                <Badge color="#4e8ef7">{n.type}</Badge>
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