import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d' };

export default function AIChatbot() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: '🙏 Namaste! Main AuraSync School AI hun. Aap kya jaanna chahte hain?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('chat');
    const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'general' });
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/chatbot/faqs`, { headers }).then(r => setFaqs(r.data)).catch(() => { });
        axios.get(`${API}/api/chatbot/logs`, { headers }).then(r => setLogs(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(m => [...m, { role: 'user', text: userMsg }]);
        setLoading(true);
        try {
            const r = await axios.post(`${API}/api/chatbot/ask`, { message: userMsg });
            setMessages(m => [...m, { role: 'bot', text: r.data.response }]);
            const logs = await axios.get(`${API}/api/chatbot/logs`, { headers });
            setLogs(logs.data);
        } catch {
            setMessages(m => [...m, { role: 'bot', text: '❌ Sorry, kuch problem hui. Baad mein try karein.' }]);
        }
        setLoading(false);
    };

    const addFaq = async () => {
        await axios.post(`${API}/api/chatbot/faqs`, faqForm, { headers });
        const r = await axios.get(`${API}/api/chatbot/faqs`, { headers });
        setFaqs(r.data);
        setFaqForm({ question: '', answer: '', category: 'general' });
    };

    const QUICK_QUESTIONS = ['Fees kab bharne hain?', 'Admission kaise lein?', 'Result kab aayega?', 'School timing kya hai?'];
    const CATEGORIES = ['general', 'fees', 'admission', 'results', 'holidays', 'transport'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                {[
                    { icon: '🤖', label: 'Total FAQs', value: faqs.length, color: '#4e8ef7' },
                    { icon: '💬', label: 'Total Chats', value: logs.length, color: '#00d97e' },
                    { icon: '📅', label: 'Today', value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: '#f97316' },
                ].map(s => (
                    <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</h2>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
                {[
                    { id: 'chat', label: '💬 Chat' },
                    { id: 'faqs', label: '📚 FAQ Manager' },
                    { id: 'logs', label: '📋 Chat Logs' },
                ].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        padding: '10px 20px', borderRadius: 10, border: 'none',
                        background: activeTab === t.id ? '#4e8ef7' : C.card,
                        color: activeTab === t.id ? '#fff' : '#9ca3af',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        border: `1px solid ${C.border}`
                    }}>{t.label}</button>
                ))}
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
                    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: 500 }}>
                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '75%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: m.role === 'user' ? '#4e8ef7' : '#1f2d3d',
                                        color: '#f1f5f9', fontSize: 13, lineHeight: 1.5
                                    }}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ padding: '12px 16px', background: '#1f2d3d', borderRadius: '16px 16px 16px 4px', color: '#6b7280', fontSize: 13 }}>
                                        ⏳ Soch raha hun...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: 16, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10 }}>
                            <input value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Apna sawaal likhein..."
                                style={{ flex: 1, background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            <button onClick={sendMessage} style={{ padding: '10px 18px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                                Send
                            </button>
                        </div>
                    </div>

                    {/* Quick Questions */}
                    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
                        <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>⚡ Quick Questions</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {QUICK_QUESTIONS.map(q => (
                                <button key={q} onClick={() => { setInput(q); }}
                                    style={{ padding: '10px 14px', background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, color: '#9ca3af', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Manager Tab */}
            {activeTab === 'faqs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
                        <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>➕ Add FAQ</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Question</label>
                                <input value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                                    placeholder="e.g. Fees kab bharne hain?"
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Category</label>
                                <select value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Answer</label>
                                <textarea value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                                    placeholder="Answer likhein..."
                                    rows={3}
                                    style={{ background: '#0d1117', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                            </div>
                        </div>
                        <button onClick={addFaq} style={{ marginTop: 14, padding: '11px 24px', background: '#4e8ef7', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                            💾 Add FAQ
                        </button>
                    </div>

                    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📚 FAQ Database ({faqs.length})</p>
                        </div>
                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {faqs.map(f => (
                                <div key={f.id} style={{ background: '#0d1117', borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#4e8ef7', fontSize: 13 }}>Q: {f.question}</p>
                                        <span style={{ background: '#4e8ef722', color: '#4e8ef7', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{f.category}</span>
                                    </div>
                                    <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>A: {f.answer}</p>
                                </div>
                            ))}
                            {faqs.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>No FAQs yet. Add some!</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📋 Chat Logs ({logs.length})</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#0d1117' }}>
                                    {['User Message', 'Bot Response', 'Time'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '12px 14px', color: '#4e8ef7', fontSize: 13 }}>{l.user_message}</td>
                                        <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12, maxWidth: 300 }}>{l.bot_response}</td>
                                        <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 11 }}>{new Date(l.created_at).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No chat logs yet.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}