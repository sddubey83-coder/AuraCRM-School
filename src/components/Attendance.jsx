import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7', success: '#00d97e', danger: '#f45b69' };
const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11-Commerce', '11-Science', '11-Arts', '12-Commerce', '12-Science', '12-Arts'];

export default function StudentAttendance() {
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [rfidMode, setRfidMode] = useState(false);

    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    // Sab students fetch karo
    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API}/api/students/search?q=`, { headers });
                setStudents(res.data.map((s, i) => ({
                    ...s,
                    roll: i + 1,
                    status: 'present',
                    time_in: null,
                })));
            } catch { setStudents([]); }
            setLoading(false);
        };
        fetchStudents();
    }, []);

    const classStudents = selectedClass
        ? students.filter(s => s.class === selectedClass)
        : students;

    const present = classStudents.filter(s => s.status === 'present').length;
    const absent = classStudents.filter(s => s.status === 'absent').length;

    const markAttendance = (id, status) => {
        setStudents(prev => prev.map(s =>
            s.firebase_id === id ? {
                ...s,
                status,
                time_in: status === 'present' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
            } : s
        ));
    };

    const bulkMark = (status) => {
        setStudents(prev => prev.map(s =>
            classStudents.find(cs => cs.firebase_id === s.firebase_id)
                ? { ...s, status, time_in: status === 'present' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null }
                : s
        ));
    };

    const saveAttendance = async () => {
        try {
            await axios.post(`${API}/api/attendance`, {
                date,
                class: selectedClass,
                records: classStudents.map(s => ({
                    student_id: s.firebase_id,
                    student_name: s.student_name,
                    status: s.status,
                    time_in: s.time_in,
                }))
            }, { headers });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    };

    const sendAbsentSMS = async () => {
        const absentStudents = classStudents.filter(s => s.status === 'absent');
        for (const s of absentStudents) {
            try {
                await axios.post(`${API}/api/whatsapp/welcome`, {
                    phone: s.parent_phone,
                    message: `🚨 ${s.student_name} aaj absent hain. Please school se contact karein. - AuraSync School`
                }, { headers });
            } catch { }
        }
        alert(`📱 ${absentStudents.length} parents ko SMS bheja gaya!`);
    };

    // RFID Mode
    useEffect(() => {
        if (rfidMode && students.length > 0) {
            const interval = setInterval(() => {
                const absent = students.filter(s => s.status !== 'present');
                if (absent.length > 0) {
                    const random = absent[Math.floor(Math.random() * absent.length)];
                    markAttendance(random.firebase_id, 'present');
                }
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [rfidMode, students]);

    return (
        <div style={{ padding: 24, background: C.bg, minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#0f2027,#203a43)', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#4e8ef7', fontWeight: 700, letterSpacing: 3 }}>ATTENDANCE MODULE</p>
                <h2 style={{ margin: '4px 0 0', color: '#f1f5f9', fontSize: 20, fontWeight: 900 }}>📅 Student Attendance</h2>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total', value: classStudents.length, color: '#4e8ef7' },
                    { label: 'Present', value: present, color: '#00d97e' },
                    { label: 'Absent', value: absent, color: '#f45b69' },
                    { label: 'Rate', value: `${classStudents.length ? Math.round(present / classStudents.length * 100) : 0}%`, color: '#f6c90e' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: C.card, padding: 20, borderRadius: 16, textAlign: 'center', border: '1px solid #1f2d3d' }}>
                        <div style={{ fontSize: 28, color, fontWeight: 900 }}>{value}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', background: C.card, padding: 16, borderRadius: 16, border: '1px solid #1f2d3d' }}>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: 8, background: '#0d1117', color: 'white', border: '1px solid #374151', fontSize: 13 }}>
                    <option value="">All Classes</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>

                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: 8, background: '#0d1117', color: 'white', border: '1px solid #374151' }} />

                <button onClick={() => bulkMark('present')}
                    style={{ padding: '10px 18px', background: '#00d97e', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    ✅ All Present
                </button>

                <button onClick={() => bulkMark('absent')}
                    style={{ padding: '10px 18px', background: '#f45b69', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    ❌ All Absent
                </button>

                <button onClick={() => setRfidMode(!rfidMode)}
                    style={{ padding: '10px 18px', background: rfidMode ? '#00d97e' : '#4e8ef7', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    {rfidMode ? '🛑 Stop RFID' : '🔗 RFID Mode'}
                </button>

                <button onClick={sendAbsentSMS}
                    style={{ padding: '10px 18px', background: '#f6c90e', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    📱 SMS Absent Parents
                </button>

                <button onClick={saveAttendance}
                    style={{ padding: '10px 18px', background: saved ? '#00d97e' : '#4e8ef7', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>
                    {saved ? '✅ Saved!' : '💾 Save Attendance'}
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: 60 }}>⏳ Loading students...</div>
            ) : (
                <div style={{ background: C.card, borderRadius: 16, border: '1px solid #1f2d3d', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Roll', 'Student Name', 'Class', 'Phone', 'Time In', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {classStudents.map((student, i) => (
                                <tr key={student.firebase_id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{i + 1}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{student.student_name}</td>
                                    <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>{student.class || '—'}</td>
                                    <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>{student.parent_phone}</td>
                                    <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>{student.time_in || '—'}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                            background: student.status === 'present' ? '#00d97e22' : '#f45b6922',
                                            color: student.status === 'present' ? '#00d97e' : '#f45b69'
                                        }}>
                                            {student.status === 'present' ? '✅ Present' : '❌ Absent'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => markAttendance(student.firebase_id, 'present')}
                                                style={{ padding: '6px 12px', background: '#00d97e', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>P</button>
                                            <button onClick={() => markAttendance(student.firebase_id, 'absent')}
                                                style={{ padding: '6px 12px', background: '#f45b69', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>A</button>
                                            <button onClick={() => markAttendance(student.firebase_id, 'late')}
                                                style={{ padding: '6px 12px', background: '#f6c90e', color: '#000', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>L</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {classStudents.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No students found.</p>
                    )}
                </div>
            )}
        </div>
    );
}