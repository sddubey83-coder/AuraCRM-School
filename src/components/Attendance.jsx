// Attendance.jsx — Advanced Student Attendance with Biometric/RFID
import React, { useState, useEffect, useCallback } from 'react';

const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7', success: '#00d97e', danger: '#f45b69' };

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11-Commerce', '11-Science', '11-Arts', '12-Commerce', '12-Science', '12-Arts'];

const INITIAL_STUDENTS = [
    { id: 'S001', name: 'Aarav Sharma', class: '1', roll: 1, parent_phone: '9876543210', status: 'present', time_in: '08:45', biometric_id: 'RFID123456' },
    { id: 'S002', name: 'Ananya Patel', class: '1', roll: 2, parent_phone: '9765432109', status: 'absent', time_in: null, biometric_id: 'RFID123457' },
    // ... 500+ students
];

export default function StudentAttendance() {
    const [selectedClass, setSelectedClass] = useState('1');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState(INITIAL_STUDENTS);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });
    const [rfidMode, setRfidMode] = useState(false);

    const classStudents = students.filter(s => s.class === selectedClass);
    const present = classStudents.filter(s => s.status === 'present').length;
    const absent = classStudents.filter(s => s.status === 'absent').length;
    const late = classStudents.filter(s => s.status === 'late').length;

    const markAttendance = (studentId, status) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status, time_in: status === 'present' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.time_in } : s
        ));
    };

    const sendParentSMS = (student) => {
        // WhatsApp Business API
        fetch('/api/sms', {
            method: 'POST',
            body: JSON.stringify({
                phone: student.parent_phone,
                message: `🚨 ${student.name} absent today. Please ensure attendance. - AuraSync School`
            })
        });
    };

    const bulkMark = (status) => {
        const absentStudents = classStudents.filter(s => s.status !== 'present');
        absentStudents.forEach(s => markAttendance(s.id, status));
        if (status === 'absent') {
            absentStudents.forEach(sendParentSMS);
        }
    };

    useEffect(() => {
        // Real-time RFID Scanner
        if (rfidMode) {
            const scanRFID = () => {
                // Simulate RFID scan
                const student = students.find(s => Math.random() > 0.8);
                if (student) markAttendance(student.id, 'present');
            };
            const interval = setInterval(scanRFID, 2000);
            return () => clearInterval(interval);
        }
    }, [rfidMode]);

    return (
        <div style={{ padding: 24, background: C.bg, minHeight: '100vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: C.card, padding: 20, borderRadius: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, color: C.success }}>✅ {present}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Present</div>
                </div>
                <div style={{ background: C.card, padding: 20, borderRadius: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, color: C.danger }}>❌ {absent}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Absent</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: 12, borderRadius: 8, background: C.card, color: 'white', border: '1px solid #374151' }}>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: 12, borderRadius: 8, background: C.card, color: 'white' }} />
                <button onClick={() => setRfidMode(!rfidMode)} style={{ padding: '12px 24px', background: rfidMode ? C.success : C.primary, color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>
                    {rfidMode ? '🛑 Stop RFID' : '🔗 RFID Mode'}
                </button>
                <button onClick={() => bulkMark('present')} style={{ padding: '12px 24px', background: C.success, color: 'white', border: 'none', borderRadius: 8 }}>All Present</button>
            </div>

            <div style={{ overflow: 'auto', maxHeight: '70vh' }}>
                <table style={{ width: '100%', background: C.card, borderRadius: 12, overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ background: '#1f2937' }}>
                            <th style={{ padding: 16, textAlign: 'left' }}>Roll No</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Student Name</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Time In</th>
                            <th style={{ padding: 16, textAlign: 'center' }}>Status</th>
                            <th style={{ padding: 16, textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classStudents.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid #374151' }}>
                                <td style={{ padding: 16, fontFamily: 'monospace' }}>{student.roll}</td>
                                <td style={{ padding: 16 }}>{student.name}</td>
                                <td style={{ padding: 16, color: '#9ca3af' }}>{student.time_in || '—'}</td>
                                <td style={{ padding: 16, textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        background: student.status === 'present' ? '#10b98122' : '#ef444422',
                                        color: student.status === 'present' ? '#10b981' : '#ef4444',
                                        fontWeight: 'bold'
                                    }}>
                                        {student.status === 'present' ? '✅ PRESENT' : '❌ ABSENT'}
                                    </span>
                                </td>
                                <td style={{ padding: 16 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => markAttendance(student.id, 'present')} style={{ padding: '6px 12px', background: C.success, color: 'white', border: 'none', borderRadius: 6, fontSize: 12 }}>Present</button>
                                        <button onClick={() => markAttendance(student.id, 'absent')} style={{ padding: '6px 12px', background: C.danger, color: 'white', border: 'none', borderRadius: 6, fontSize: 12 }}>Absent</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}