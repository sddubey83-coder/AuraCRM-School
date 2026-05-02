// AuditLogs.jsx — Enterprise Audit Trail
import React, { useState } from 'react';

const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7', success: '#00d97e', danger: '#f45b69' };

const LOGS = [
    { id: 1, user: 'principal@school.in', action: 'MARK_ATTENDANCE', timestamp: '2025-01-15 08:45', ip: '192.168.1.100', details: 'Class 1 - 35/35 present' },
    { id: 2, user: 'teacher1@school.in', action: 'ADD_HOMEWORK', timestamp: '2025-01-15 10:20', ip: '192.168.1.101', details: 'Maths HW for Class 5' },
    { id: 3, user: 'admin@school.in', action: 'FEES_PAYMENT', timestamp: '2025-01-15 11:15', ip: '192.168.1.102', details: '₹25,000 received from Parent Sharma' },
];

const ACTION_COLORS = {
    MARK_ATTENDANCE: C.success,
    ADD_HOMEWORK: C.primary,
    FEES_PAYMENT: C.success,
    USER_LOGIN: '#9ca3af',
    DELETE_RECORD: C.danger
};

export default function AuditLogs() {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredLogs = LOGS.filter(log =>
        filter === 'all' || log.action === filter
    ).filter(log =>
        log.user.includes(search) || log.details.includes(search)
    );

    return (
        <div style={{ padding: 24, background: C.bg }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <input
                    placeholder="🔍 Search logs..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '12px 20px', background: C.card, color: 'white', borderRadius: 12, border: '1px solid #374151', flex: 1, minWidth: 300 }}
                />
                <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '12px 20px', background: C.card, color: 'white', borderRadius: 12 }}>
                    <option value="all">All Actions</option>
                    <option value="MARK_ATTENDANCE">Attendance</option>
                    <option value="ADD_HOMEWORK">Homework</option>
                    <option value="FEES_PAYMENT">Fees</option>
                </select>
            </div>

            <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
                {filteredLogs.map(log => (
                    <div key={log.id} style={{
                        background: C.card,
                        marginBottom: 12,
                        padding: 20,
                        borderRadius: 12,
                        borderLeft: `4px solid ${ACTION_COLORS[log.action] || '#9ca3af'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>{log.action.replace('_', ' ')}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{log.timestamp}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#d1d5db' }}>
                            <div><strong>User:</strong> {log.user}</div>
                            <div><strong>IP:</strong> {log.ip}</div>
                            <div style={{ flex: 1 }}><strong>Details:</strong> {log.details}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}