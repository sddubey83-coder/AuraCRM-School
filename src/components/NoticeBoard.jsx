// NoticeBoard.jsx — Digital Notice Board
import React, { useState } from 'react';

const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7' };

const INITIAL_NOTICES = [
    { id: 1, title: '📢 Annual Sports Day', date: '2025-01-20', category: 'Event', content: 'Sports day on 20th Jan. All students must participate.', readBy: 245 },
    { id: 2, title: '💰 Fee Reminder', date: '2025-01-15', category: 'Fees', content: 'January fees due by 20th. Late fee applicable after.', readBy: 189 },
    { id: 3, title: '📚 PTM Schedule', date: '2025-01-18', category: 'Meeting', content: 'Parent-Teacher Meeting on 18th Jan 3-5 PM.', readBy: 267 },
];

export default function NoticeBoard() {
    const [notices, setNotices] = useState(INITIAL_NOTICES);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', category: 'General' });
    const [showForm, setShowForm] = useState(false);

    const categories = ['General', 'Event', 'Fees', 'Meeting', 'Exam', 'Holiday'];

    const addNotice = () => {
        setNotices([{
            id: Date.now(),
            ...newNotice,
            date: new Date().toISOString().split('T')[0],
            readBy: 0
        }, ...notices]);
        setNewNotice({ title: '', content: '', category: 'General' });
        setShowForm(false);
    };

    const markRead = (id) => {
        setNotices(prev => prev.map(n => n.id === id ? { ...n, readBy: n.readBy + 1 } : n));
    };

    return (
        <div style={{ padding: 24, background: C.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: 28 }}>📢 Notice Board</h1>
                <button onClick={() => setShowForm(true)} style={{ padding: '12px 24px', background: C.primary, color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold' }}>
                    + New Notice
                </button>
            </div>

            {showForm && (
                <div style={{ background: C.card, padding: 24, borderRadius: 16, marginBottom: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 16 }}>
                        <input placeholder="Notice Title" value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} style={{ padding: 12, borderRadius: 8, border: '1px solid #374151', background: C.bg, color: 'white' }} />
                        <select value={newNotice.category} onChange={e => setNewNotice({ ...newNotice, category: e.target.value })} style={{ padding: 12, borderRadius: 8, background: C.bg, color: 'white' }}>
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <textarea placeholder="Notice content..." value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })} rows={3} style={{ padding: 12, borderRadius: 8, border: '1px solid #374151', background: C.bg, color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button onClick={addNotice} style={{ padding: '12px 24px', background: C.primary, color: 'white', border: 'none', borderRadius: 8 }}>Publish</button>
                        <button onClick={() => setShowForm(false)} style={{ padding: '12px 24px', background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: 8 }}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                {notices.map(notice => (
                    <div key={notice.id} style={{ background: C.card, borderRadius: 16, padding: 20, cursor: 'pointer' }} onClick={() => markRead(notice.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <h3 style={{ margin: 0, color: 'white', fontSize: 18 }}>{notice.title}</h3>
                            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'right' }}>
                                {notice.date}<br />
                                👁️ {notice.readBy}
                            </div>
                        </div>
                        <div style={{ color: '#d1d5db', lineHeight: 1.6 }}>{notice.content}</div>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #374151', fontSize: 12, color: '#9ca3af' }}>
                            {notice.category}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}