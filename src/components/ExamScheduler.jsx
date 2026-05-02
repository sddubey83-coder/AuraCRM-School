// ExamScheduler.jsx — AI-Powered Exam Scheduling (ESLint FIXED)
import React, { useState } from 'react';

const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7', success: '#00d97e' };

const SUBJECTS = ['Maths', 'Science', 'English', 'Hindi', 'SST', 'Physics', 'Chemistry', 'Biology', 'Computer'];
const ROOMS = ['Room A1', 'Room A2', 'Room B1', 'Room B2', 'Lab 1', 'Lab 2', 'Hall 1', 'Hall 2'];

export default function ExamScheduler() {
    const [exams, setExams] = useState([
        { id: 1, subject: 'Maths', date: '2025-01-15', time: '09:00-11:00', room: 'Room A1', class: '10', invigilators: ['ST001', 'ST002'], seats: 45 },
        { id: 2, subject: 'Science', date: '2025-01-16', time: '09:00-11:00', room: 'Lab 1', class: '10', invigilators: ['ST003', 'ST004'], seats: 45 },
    ]);

    // ✅ Line 14: form state को properly use किया
    const [form, setForm] = useState({
        subject: '',
        date: '',
        time: '',
        room: '',
        class: '10',
        invigilators: []
    });
    const [showForm, setShowForm] = useState(false);

    const generateSchedule = () => {
        const schedule = [];
        SUBJECTS.forEach((subject, i) => {
            schedule.push({
                id: Date.now() + i,
                subject,
                date: `2025-01-${15 + i}`,
                time: '09:00-11:00',
                room: ROOMS[i % ROOMS.length],
                class: '10',
                invigilators: ['ST001', 'ST002'],
                seats: 45
            });
        });
        setExams(schedule);
    };

    const addExam = () => {
        // ✅ form को use करके new exam add
        if (!form.subject || !form.date || !form.time || !form.room) {
            alert('Please fill all required fields');
            return;
        }

        const newExam = {
            id: Date.now(),
            ...form,
            invigilators: form.invigilators || ['ST001', 'ST002'],
            seats: 45
        };

        setExams(prev => [...prev, newExam]);
        // ✅ setForm को use करके form reset
        setForm({ subject: '', date: '', time: '', room: '', class: '10', invigilators: [] });
        setShowForm(false);
    };

    const detectConflicts = () => {
        const conflicts = exams.filter((exam, i) =>
            exams.findIndex((e, j) => i !== j && e.date === exam.date && e.time === exam.time) !== -1
        );
        return conflicts;
    };

    return (
        <div style={{ padding: 24, background: C.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: 28 }}>📅 Exam Scheduler</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    {/* ✅ form को use करने के लिए Add Exam button */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: '12px 20px',
                            background: C.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 'bold',
                            fontSize: 14
                        }}
                    >
                        {showForm ? '✕ Cancel' : '+ Add Exam'}
                    </button>
                    <button
                        onClick={generateSchedule}
                        style={{
                            padding: '12px 24px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 'bold'
                        }}
                    >
                        AI Generate Schedule
                    </button>
                </div>
            </div>

            {/* ✅ Add Exam Form (form state को use करने के लिए) */}
            {showForm && (
                <div style={{
                    background: C.card,
                    padding: 20,
                    borderRadius: 12,
                    marginBottom: 20,
                    border: '1px solid #374151'
                }}>
                    <h3 style={{ color: 'white', margin: '0 0 16px' }}>➕ Add New Exam</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <input
                            placeholder="Subject"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                            style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}
                        />
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}
                        />
                        <input
                            type="time"
                            value={form.time}
                            onChange={e => setForm({ ...form, time: e.target.value })}
                            style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}
                        />
                        <select
                            value={form.room}
                            onChange={e => setForm({ ...form, room: e.target.value })}
                            style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}
                        >
                            <option value="">Select Room</option>
                            {ROOMS.map(room => <option key={room}>{room}</option>)}
                        </select>
                        <select
                            value={form.class}
                            onChange={e => setForm({ ...form, class: e.target.value })}
                            style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}
                        >
                            <option value="10">Class 10</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                    <button
                        onClick={addExam}
                        style={{
                            marginTop: 16,
                            padding: '12px 24px',
                            background: C.success,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 'bold'
                        }}
                    >
                        ➕ Add Exam to Schedule
                    </button>
                </div>
            )}

            {detectConflicts().length > 0 && (
                <div style={{ background: '#fef3c7', padding: 16, borderRadius: 8, marginBottom: 20, borderLeft: '4px solid #f59e0b' }}>
                    ⚠️ {detectConflicts().length} Time/Room conflicts detected!
                </div>
            )}

            <div style={{ background: C.card, borderRadius: 12, overflow: 'hidden' }}> {/* ✅ Line 74: duplicate padding हटाया */}
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#1f2937' }}>
                            <th style={{ padding: 16, textAlign: 'left' }}>Subject</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Date</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Time</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Room</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Class</th>
                            <th style={{ padding: 16, textAlign: 'left' }}>Invigilators</th>
                            <th style={{ padding: 16, textAlign: 'right' }}>Seats</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map(exam => (
                            <tr key={exam.id} style={{ borderBottom: '1px solid #374151' }}>
                                <td style={{ padding: 16, fontWeight: 'bold', color: 'white' }}>{exam.subject}</td>
                                <td style={{ padding: 16, color: '#9ca3af' }}>{exam.date}</td>
                                <td style={{ padding: 16, color: '#9ca3af' }}>{exam.time}</td>
                                <td style={{ padding: 16, color: 'white' }}>{exam.room}</td>
                                <td style={{ padding: 16 }}>
                                    <span style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        borderRadius: 20,
                                        padding: '4px 12px',
                                        fontSize: 12,
                                        fontWeight: 'bold'
                                    }}>{exam.class}</span>
                                </td>
                                <td style={{ padding: 16, color: '#9ca3af' }}>{exam.invigilators.join(', ')}</td>
                                <td style={{ padding: 16, color: C.success, textAlign: 'right', fontWeight: 'bold' }}>{exam.seats}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}