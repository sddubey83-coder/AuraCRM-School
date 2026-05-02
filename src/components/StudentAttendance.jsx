// src/components/StudentAttendance.jsx
import React, { useState } from 'react';

export default function StudentAttendance() {
    const [selectedClass, setSelectedClass] = useState('1');
    const [students, setStudents] = useState([
        { id: 'S001', name: 'Aarav Sharma', roll: 1, status: 'present' },
        { id: 'S002', name: 'Ananya Patel', roll: 2, status: 'absent' },
    ]);

    const toggleStatus = (id) => {
        setStudents(students.map(s =>
            s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
        ));
    };

    return (
        <div style={{ padding: 24, background: '#0d1117', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 32, marginBottom: 24 }}>📋 Student Attendance</h1>
            <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                style={{ padding: 12, marginBottom: 24, background: '#111827', color: 'white', borderRadius: 8 }}
            >
                <option>1</option><option>2</option><option>3</option>
            </select>

            <table style={{ width: '100%', background: '#111827', borderRadius: 12 }}>
                <thead><tr style={{ background: '#1f2937' }}>
                    <th style={{ padding: 16 }}>Roll</th>
                    <th style={{ padding: 16 }}>Name</th>
                    <th style={{ padding: 16 }}>Status</th>
                </tr></thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td style={{ padding: 16 }}>{s.roll}</td>
                            <td style={{ padding: 16 }}>{s.name}</td>
                            <td style={{ padding: 16 }}>
                                <button
                                    onClick={() => toggleStatus(s.id)}
                                    style={{
                                        padding: '8px 16px',
                                        background: s.status === 'present' ? '#10b981' : '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 20
                                    }}
                                >
                                    {s.status === 'present' ? '✅ Present' : '❌ Absent'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}