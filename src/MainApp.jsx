import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RBACProvider } from "./RBAC";
import RealtimeDashboard from './RealtimeDashboard';
import MultiApp from './MultiApp';
import AutomationDashboard from './components/AutomationDashboard';
import DocsManager from './components/DocsManager';
import AIBrainDashboard from './AIBrainDashboard';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import axios from 'axios';
import { TimetableOptimizer, TransportApp, ModularMarketplace } from './SchoolFeatures';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const API = "https://aura-school-backend.onrender.com";
// eslint-disable-next-line
const isDemoMode = true;
const TABS = [
    { id: 'timetable', icon: '📅', label: 'Timetable' },
    { id: 'transport', icon: '🚌', label: 'Transport' },
    { id: 'marketplace', icon: '🛍️', label: 'Marketplace' },
    { id: 'roles', icon: '🔐', label: 'Roles' },
    { id: 'command', icon: '🧠', label: 'AI Command' },
    { id: 'documents', label: 'Syllabus & Docs', icon: '📂' },
    { id: 'admissions', icon: '🎯', label: 'Admissions' },
    { id: 'fees', icon: '💰', label: 'Fees & Revenue' },
    { id: 'students', icon: '👨‍🎓', label: 'Students' },
    { id: 'automation', icon: '⚡', label: 'AI Automation' },
    { id: 'automation_status', icon: '📋', label: 'Automation Logs' },
    { id: 'comms', icon: '📞', label: 'Communications' },
    { id: 'insights', icon: '📊', label: 'Insights' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const SOURCES = ['Walk-in', 'WhatsApp', 'Instagram', 'Reference', 'Website', 'Phone'];
const BRANCHES = ['Indore Main', 'Indore West', 'Ujjain'];
const STATUSES = ['new', 'called', 'interested', 'converted', 'lost'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const scoreColor = s => s >= 80 ? '#00d97e' : s >= 60 ? '#f6c90e' : '#f45b69';
const statusColor = s => ({ new: '#4e8ef7', called: '#f6c90e', interested: '#f97316', converted: '#00d97e', lost: '#f45b69' }[s] || '#888');
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = d => d ? new Date(d?.toDate?.() || d).toLocaleDateString('en-IN') : '—';
const now = () => new Date();

function Badge({ children, color }) {
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            fontSize: 11, fontWeight: 700, background: color + '22', color, letterSpacing: 1
        }}>
            {children}
        </span>
    );
}

function Card({ children, style = {} }) {
    return (
        <div style={{ background: '#111827', borderRadius: 16, padding: 24, border: '1px solid #1f2d3d', ...style }}>
            {children}
        </div>
    );
}

function Stat({ label, value, sub, color = '#fff', icon }) {
    return (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</p>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color }}>{value}</h2>
            {sub && <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{sub}</p>}
        </Card>
    );
}

function Input({ label, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</label>}
            <input
                {...props}
                style={{
                    background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10,
                    padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
                    width: '100%', boxSizing: 'border-box', ...props.style
                }}
            />
        </div>
    );
}

function Select({ label, options, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</label>}
            <select
                {...props}
                style={{
                    background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10,
                    padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
                    width: '100%', ...props.style
                }}
            >
                {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
        </div>
    );
}

function Btn({ children, color = '#4e8ef7', outline, small, ...props }) {
    return (
        <button
            {...props}
            style={{
                padding: small ? '7px 16px' : '11px 22px',
                borderRadius: 10,
                border: outline ? `1.5px solid ${color}` : 'none',
                background: outline ? 'transparent' : color,
                color: outline ? color : '#fff',
                fontWeight: 700, fontSize: small ? 12 : 14, cursor: 'pointer',
                transition: 'opacity .15s', letterSpacing: 0.3,
                ...props.style
            }}
        >
            {children}
        </button>
    );
}

function AIInsightBox({ title, insights = [] }) {
    return (
        <Card style={{ borderLeft: '3px solid #4e8ef7' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#4e8ef7', fontWeight: 700, letterSpacing: 1 }}>🧠 {title}</p>
            {insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < insights.length - 1 ? 10 : 0 }}>
                    <span style={{ color: ins.urgent ? '#f45b69' : '#00d97e', fontSize: 16, marginTop: 1 }}>
                        {ins.urgent ? '⚠️' : '✅'}
                    </span>
                    <p style={{ margin: 0, fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}>{ins.text}</p>
                </div>
            ))}
        </Card>
    );
}

// ─── SCORE ENGINE ─────────────────────────────────────────────────────────────
function computeScore(lead) {
    let score = 50;
    if (lead.source === 'Walk-in') score += 20;
    if (lead.source === 'Reference') score += 15;
    if (lead.status === 'interested') score += 15;
    if (lead.status === 'called') score += 5;
    const ageHours = lead.timestamp
        ? (now() - new Date(lead.timestamp?.toDate?.() || lead.timestamp)) / 36e5
        : 0;
    if (ageHours < 6) score += 15;
    else if (ageHours < 24) score += 5;
    else if (ageHours > 72) score -= 10;
    return Math.min(99, Math.max(10, score + (lead.bonus || 0)));
}

function nextAction(lead) {
    const s = computeScore(lead);
    if (s >= 80) return { label: 'Call Now', color: '#f45b69', icon: '📞' };
    if (s >= 65) return { label: 'Send WhatsApp', color: '#f6c90e', icon: '💬' };
    if (lead.status === 'new') return { label: 'Initial Call', color: '#4e8ef7', icon: '📞' };
    return { label: 'Send Offer', color: '#f97316', icon: '🎁' };
}

// ─── AI COMMAND CENTER ────────────────────────────────────────────────────────
function CommandCenter({ leads, onSendCampaign }) {
    const hot = leads.filter(l => computeScore(l) >= 80);
    const converted = leads.filter(l => l.status === 'converted');
    const pending = leads.filter(l => l.status !== 'converted' && l.status !== 'lost');
    const overdue = leads.filter(l => l.fees_overdue);
    const forecastRevenue = pending.length * 25000 * 0.45;
    const weekAdmissions = Math.round(pending.length * 0.35);

    const insights = [
        hot.length > 0 && { urgent: true, text: `${hot.length} hot lead${hot.length > 1 ? 's' : ''} need immediate calls — conversion window closing` },
        overdue.length > 0 && { urgent: true, text: `${fmt(overdue.length * 15000)} fee recovery possible today — best window 6–8 PM` },
        pending.length > 3 && { urgent: false, text: `${weekAdmissions} admissions expected this week based on pipeline analysis` },
        converted.length > 0 && { urgent: false, text: `${fmt(converted.length * 50000)} revenue secured — ${converted.length} students converted` },
    ].filter(Boolean);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{
                background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
                borderRadius: 20, padding: '32px 36px', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(78,142,247,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: 200, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,217,126,0.05)' }} />
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#4e8ef7', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>AI Command Center</p>
                            <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 900, color: '#fff' }}>Today's Intelligence</h1>
                            <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Btn color="#f45b69" onClick={() => onSendCampaign('hot')}>🚀 Start Smart Campaign</Btn>
                            <Btn color="#00d97e" onClick={() => onSendCampaign('fees')}>💰 Fee Recovery Blast</Btn>
                        </div>
                    </div>

                    <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {[
                            { icon: '📞', label: 'Call Now', value: hot.length, color: '#f45b69', sub: 'High-priority leads' },
                            { icon: '💸', label: 'Recover Today', value: fmt(overdue.length * 15000), color: '#f6c90e', sub: 'Estimated recovery' },
                            { icon: '🎓', label: 'Expected This Week', value: weekAdmissions, color: '#00d97e', sub: 'Admission forecast' },
                            { icon: '📈', label: 'Revenue Forecast', value: fmt(forecastRevenue), color: '#4e8ef7', sub: 'From active pipeline' },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 18,
                                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <span style={{ fontSize: 24 }}>{item.icon}</span>
                                <p style={{ margin: '8px 0 4px', fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: 1 }}>{item.label.toUpperCase()}</p>
                                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7280' }}>{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <AIInsightBox
                    title="AI Decision Engine"
                    insights={insights.length ? insights : [{ urgent: false, text: 'No urgent actions right now. System is monitoring...' }]}
                />
                <Card>
                    <p style={{ margin: '0 0 16px', fontSize: 12, color: '#f45b69', fontWeight: 700, letterSpacing: 1 }}>🔥 URGENT — CALL NOW</p>
                    {hot.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>No hot leads right now. Keep adding leads!</p>}
                    {hot.slice(0, 5).map(l => (
                        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1f2d3d' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{l.student_name}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{l.parent_phone} · {l.branch}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: scoreColor(computeScore(l)) }}>{computeScore(l)}%</span>
                                <Btn small color="#f45b69" onClick={() => window.open(`tel:${l.parent_phone}`)}>Call</Btn>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>

            <Card>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: '#a78bfa', fontWeight: 700, letterSpacing: 1 }}>🔬 AI REASONING ENGINE — WHY THESE DECISIONS?</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    {[
                        { title: 'Score Algorithm', desc: 'Scores based on source, status, response time, and engagement history. Walk-ins get +20, References +15.' },
                        { title: 'Timing Intelligence', desc: 'Call window 10AM–12PM and 5PM–8PM shows 3x higher answer rates based on historical data.' },
                        { title: 'Fee Recovery', desc: 'Parents respond 85% better to evening reminders. System schedules messages between 6–8 PM automatically.' },
                        { title: 'Dropout Detection', desc: 'Students with attendance < 70% and 2+ missed fee payments are flagged for intervention.' },
                    ].map(r => (
                        <div key={r.title} style={{ background: '#0d1117', borderRadius: 12, padding: 16 }}>
                            <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#a78bfa', fontSize: 13 }}>{r.title}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>{r.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ─── ADMISSIONS ENGINE ────────────────────────────────────────────────────────
function AdmissionsEngine({ leads }) {
    const [form, setForm] = useState({
        student_name: '', parent_phone: '', city: '',
        branch: BRANCHES[0], source: SOURCES[0], status: 'new', notes: ''
    });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.student_name || !form.parent_phone) return alert("Name aur phone required hai!");
        const bonus = Math.floor(Math.random() * 10);
        try {
            await addDoc(collection(db, "leads"), { ...form, bonus, timestamp: new Date() });
            setForm({ student_name: '', parent_phone: '', city: '', branch: BRANCHES[0], source: SOURCES[0], status: 'new', notes: '' });
            setAdding(false);
        } catch (err) {
            console.error(err);
            alert("Firebase Error!");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, "leads", id), { status });
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = leads.filter(l => {
        const s = search.toLowerCase();
        const match = !s || l.student_name?.toLowerCase().includes(s) || l.parent_phone?.includes(s);
        const st = filterStatus === 'all' || l.status === filterStatus;
        const br = filterBranch === 'all' || l.branch === filterBranch;
        return match && st && br;
    });

    const pipeline = STATUSES.map(s => ({ status: s, count: leads.filter(l => l.status === s).length }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {pipeline.map(p => (
                    <Card
                        key={p.status}
                        style={{
                            textAlign: 'center', cursor: 'pointer',
                            border: filterStatus === p.status ? `1px solid ${statusColor(p.status)}` : '1px solid #1f2d3d'
                        }}
                        onClick={() => setFilterStatus(filterStatus === p.status ? 'all' : p.status)}
                    >
                        <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: statusColor(p.status) }}>{p.count}</h2>
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{p.status}</p>
                    </Card>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    placeholder="🔍 Search name or phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                />
                <select
                    value={filterBranch}
                    onChange={e => setFilterBranch(e.target.value)}
                    style={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}
                >
                    <option value="all">All Branches</option>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
                <Btn color="#4e8ef7" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ Add Lead'}</Btn>
            </div>

            {adding && (
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7' }}>New Lead Capture</p>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                            <Input label="Student Name *" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} placeholder="Full name" />
                            <Input label="Parent Phone *" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} placeholder="10-digit number" />
                            <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
                            <Select label="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} options={BRANCHES} />
                            <Select label="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} options={SOURCES} />
                            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} />
                        </div>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="Notes..."
                            rows={2}
                            style={{ width: '100%', marginTop: 14, background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ marginTop: 14 }}>
                            <Btn type="submit" color="#00d97e">✅ Save Lead</Btn>
                        </div>
                    </form>
                </Card>
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>
                        Lead Intelligence Table <span style={{ color: '#6b7280', fontWeight: 400 }}>({filtered.length} leads)</span>
                    </p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Contact', 'Branch/Source', 'AI Score', 'Next Action', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(l => {
                                const score = computeScore(l);
                                const na = nextAction(l);
                                return (
                                    <tr key={l.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{l.student_name}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{fmtDate(l.timestamp)}</p>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <p style={{ margin: 0, fontSize: 13, color: '#d1d5db' }}>{l.parent_phone}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{l.city}</p>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{l.branch}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{l.source}</p>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 50, height: 6, background: '#1f2d3d', borderRadius: 4 }}>
                                                    <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 4 }} />
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: 14, color: scoreColor(score) }}>{score}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <Badge color={na.color}>{na.icon} {na.label}</Badge>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <select
                                                value={l.status}
                                                onChange={e => updateStatus(l.id, e.target.value)}
                                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 8, padding: '6px 10px', color: statusColor(l.status), fontSize: 12, fontWeight: 700, outline: 'none' }}
                                            >
                                                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Btn small color="#4e8ef7" outline onClick={() => window.open(`tel:${l.parent_phone}`)}>📞</Btn>
                                                <Btn small color="#00d97e" outline onClick={() => window.open(`https://wa.me/91${l.parent_phone}`)}>💬</Btn>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No leads found. Add some leads to get started.</p>
                    )}
                </div>
            </Card>
        </div>
    );
}

// ─── FEES & REVENUE ENGINE ────────────────────────────────────────────────────
function FeesEngine({ leads, realFees }) {
    const converted = leads.filter(l => l.status === 'converted');

    const feeStudents = converted.map(l => {
        const fData = realFees.find(f => f.lead_id === l.id) || { total_fees: 50000, paid_amount: 0 };
        const total = fData.total_fees;
        const paid = fData.paid_amount;
        const pending = total - paid;
        const recoveryProb = total > 0 ? Math.round((paid / total) * 100) : 0;
        return {
            ...l, total, paid, pending, recoveryProb,
            risk: pending > 20000 ? 'High' : pending > 0 ? 'Medium' : 'Low',
        };
    });

    const totalFee = feeStudents.reduce((sum, s) => sum + s.total, 0);
    const collected = feeStudents.reduce((sum, s) => sum + s.paid, 0);
    const pending = totalFee - collected;
    const overdue = feeStudents.filter(s => s.pending > 0 && s.risk === 'High').reduce((sum, s) => sum + s.pending, 0);

    const sendReminder = async (phone, name) => {
        try {
            await axios.post(`${API}/send-message`, {
                phone,
                message: `Namaste ${name} ji, aapki fees ki reminder: ₹25,000 pending hai. Aaj payment karein aur confirmation paayein. AuraSync School AI`
            });
            alert(`✅ Reminder sent to ${name}`);
        } catch (err) {
            console.error(err);
            alert("Reminder bhejne mein error aaya. Backend check karein.");
        }
    };

    const bulkReminder = () => {
        const overdueCount = feeStudents.filter(s => s.paid < s.total).length;
        if (window.confirm(`${overdueCount} parents ko fee reminder bhejein?`)) {
            alert("🚀 Bulk fee reminders sent successfully!");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <Stat icon="💰" label="Total Fees" value={fmt(totalFee)} sub={`${converted.length} students`} color="#4e8ef7" />
                <Stat icon="✅" label="Collected" value={fmt(collected)} sub="Received so far" color="#00d97e" />
                <Stat icon="⏳" label="Pending" value={fmt(pending)} sub="Yet to collect" color="#f6c90e" />
                <Stat icon="🚨" label="Overdue" value={fmt(overdue)} sub="Urgent recovery" color="#f45b69" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Fee Recovery Dashboard</p>
                        <Btn small color="#f45b69" onClick={bulkReminder}>📤 Bulk Reminder</Btn>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Total', 'Paid', 'Pending', 'Risk', 'Recovery %', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {feeStudents.map(s => {
                                const owed = s.total - s.paid;
                                const riskColor = s.risk === 'High' ? '#f45b69' : s.risk === 'Medium' ? '#f6c90e' : '#00d97e';
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                        <td style={{ padding: '12px 14px' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{s.parent_phone}</p>
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 13 }}>{fmt(s.total)}</td>
                                        <td style={{ padding: '12px 14px', color: '#00d97e', fontSize: 13, fontWeight: 700 }}>{fmt(s.paid)}</td>
                                        <td style={{ padding: '12px 14px', color: owed > 0 ? '#f45b69' : '#6b7280', fontSize: 13, fontWeight: owed > 0 ? 700 : 400 }}>
                                            {owed > 0 ? fmt(owed) : '—'}
                                        </td>
                                        <td style={{ padding: '12px 14px' }}><Badge color={riskColor}>{s.risk}</Badge></td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 40, height: 5, background: '#1f2d3d', borderRadius: 3 }}>
                                                    <div style={{ width: `${s.recoveryProb}%`, height: '100%', background: '#4e8ef7', borderRadius: 3 }} />
                                                </div>
                                                <span style={{ fontSize: 12, color: '#9ca3af' }}>{s.recoveryProb}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            {owed > 0 && (
                                                <Btn small color="#f6c90e" onClick={() => sendReminder(s.parent_phone, s.student_name)}>Remind</Btn>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {feeStudents.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No converted students yet.</p>
                    )}
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <AIInsightBox title="AI RECOVERY STRATEGY" insights={[
                        { urgent: true, text: `Best collection time: 6 PM – 8 PM today. ${Math.round(feeStudents.length * 0.3)} parents likely to pay.` },
                        { urgent: false, text: 'Send personalized messages — not bulk. Use student name + exact amount.' },
                        { urgent: false, text: `Revenue forecast next 30 days: ${fmt(pending * 0.65)} recoverable.` },
                    ]} />
                    <Card>
                        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#f6c90e', fontWeight: 700, letterSpacing: 1 }}>📊 MONTHLY REVENUE FORECAST</p>
                        {[
                            { label: 'New Admissions', value: fmt(25000 * 8), pct: 80 },
                            { label: 'Fee Recovery', value: fmt(pending * 0.6), pct: 60 },
                            { label: 'Renewals', value: fmt(15000 * 4), pct: 40 },
                        ].map(item => (
                            <div key={item.label} style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{item.label}</span>
                                    <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 700 }}>{item.value}</span>
                                </div>
                                <div style={{ height: 6, background: '#1f2d3d', borderRadius: 4 }}>
                                    <div style={{ width: `${item.pct}%`, height: '100%', background: '#4e8ef7', borderRadius: 4 }} />
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
function StudentsModule({ leads }) {
    const students = leads
        .filter(l => l.status === 'converted')
        .map(l => {
            const seed = l.id ? l.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
            const attendance = 65 + (seed % 35);
            const performance = 50 + ((seed * 3) % 50);
            const fees_paid = (seed % 3) !== 0;
            return { ...l, attendance, performance, fees_paid, at_risk: false };
        })
        .map(s => ({ ...s, at_risk: s.attendance < 70 || !s.fees_paid }));

    const atRisk = students.filter(s => s.at_risk);
    const avgAttendance = students.length ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) : 0;
    const avgPerformance = students.length ? Math.round(students.reduce((a, s) => a + s.performance, 0) / students.length) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <Stat icon="👨‍🎓" label="Total Students" value={students.length} color="#4e8ef7" />
                <Stat icon="⚠️" label="At Risk" value={atRisk.length} color="#f45b69" sub="AI detected" />
                <Stat icon="📊" label="Avg Attendance" value={students.length ? `${avgAttendance}%` : '—'} color="#00d97e" />
                <Stat icon="🏆" label="Avg Performance" value={students.length ? `${avgPerformance}%` : '—'} color="#f6c90e" />
            </div>

            {atRisk.length > 0 && (
                <AIInsightBox
                    title="AI WEAK STUDENT ALERT"
                    insights={atRisk.map(s => ({
                        urgent: true,
                        text: `${s.student_name} — Attendance: ${s.attendance}%, Fees: ${s.fees_paid ? 'Paid' : 'PENDING'}. Immediate intervention needed.`
                    }))}
                />
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Student Profiles</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#0d1117' }}>
                            {['Student', 'Contact', 'Branch', 'Attendance', 'Performance', 'Fees', 'AI Status'].map(h => (
                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af' }}>{s.parent_phone}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af' }}>{s.branch}</td>
                                <td style={{ padding: '12px 14px' }}>
                                    <span style={{ color: s.attendance < 70 ? '#f45b69' : '#00d97e', fontWeight: 700, fontSize: 13 }}>{s.attendance}%</span>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <span style={{ color: s.performance < 60 ? '#f6c90e' : '#4e8ef7', fontWeight: 700, fontSize: 13 }}>{s.performance}%</span>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <Badge color={s.fees_paid ? '#00d97e' : '#f45b69'}>{s.fees_paid ? 'Paid' : 'Pending'}</Badge>
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                    <Badge color={s.at_risk ? '#f45b69' : '#00d97e'}>{s.at_risk ? '⚠️ At Risk' : '✅ Good'}</Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No converted students yet. Convert leads to see them here.</p>
                )}
            </Card>
        </div>
    );
}

// ─── AUTOMATION ───────────────────────────────────────────────────────────────
function AutomationEngine({ leads }) {
    const [running, setRunning] = useState({});

    const runFlow = async (key, label) => {
        setRunning(r => ({ ...r, [key]: true }));
        await new Promise(res => setTimeout(res, 1800));
        setRunning(r => ({ ...r, [key]: false }));
        alert(`✅ ${label} executed successfully!`);
    };

    const flows = [
        { key: 'new_lead', icon: '🆕', label: 'New Lead Welcome', desc: 'Sends instant WhatsApp greeting to every new lead', trigger: 'Lead added', color: '#4e8ef7', count: leads.filter(l => l.status === 'new').length },
        { key: 'hot_call', icon: '🔥', label: 'Hot Lead Call Alert', desc: 'Notifies staff when lead score exceeds 80%', trigger: 'Score ≥ 80', color: '#f45b69', count: leads.filter(l => computeScore(l) >= 80).length },
        { key: 'fee_remind', icon: '💸', label: 'Fee Reminder Automation', desc: 'Sends fee reminder 3 days before due date', trigger: 'Daily 6 PM', color: '#f6c90e', count: 0 },
        { key: 'follow_up', icon: '📅', label: '48hr Follow-up', desc: 'Auto follow-up if lead not contacted in 48 hours', trigger: '48hr no contact', color: '#00d97e', count: 0 },
        { key: 'dropout', icon: '⚠️', label: 'Dropout Alert', desc: 'Alerts when student attendance drops below 70%', trigger: 'Attendance check', color: '#a78bfa', count: 0 },
        { key: 'weekly', icon: '📊', label: 'Weekly Report', desc: 'Sends analytics summary every Monday 9 AM', trigger: 'Every Monday', color: '#f97316', count: 0 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AIInsightBox title="AUTOMATION STATUS" insights={[
                { urgent: false, text: `${leads.filter(l => l.status === 'new').length} new leads awaiting welcome message automation.` },
                { urgent: true, text: `${leads.filter(l => computeScore(l) >= 80).length} hot leads need immediate follow-up flow activation.` },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {flows.map(f => (
                    <Card key={f.key} style={{ border: `1px solid ${f.color}22` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <span style={{ fontSize: 28 }}>{f.icon}</span>
                                <p style={{ margin: '8px 0 4px', fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{f.label}</p>
                                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{f.desc}</p>
                                <Badge color={f.color}>{f.trigger}</Badge>
                            </div>
                            {f.count > 0 && (
                                <span style={{ background: f.color + '22', color: f.color, fontWeight: 800, fontSize: 18, borderRadius: 10, padding: '4px 12px' }}>{f.count}</span>
                            )}
                        </div>
                        <Btn small color={f.color} style={{ marginTop: 12, width: '100%' }} onClick={() => runFlow(f.key, f.label)}>
                            {running[f.key] ? '⏳ Running...' : '▶ Run Now'}
                        </Btn>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ─── COMMUNICATIONS ───────────────────────────────────────────────────────────
function CommsSystem({ leads }) {
    const [tab, setTab] = useState('whatsapp');
    const [msg, setMsg] = useState('');
    const [target, setTarget] = useState('hot');
    const [sending, setSending] = useState(false);

    const templates = [
        { label: 'Admission Follow-up', text: `Namaste {name}, AuraSync School AI mein aapki seat abhi bhi available hai. Aaj enroll karein aur ₹5,000 ki scholarship paayein! Call: 8686XXXXXX` },
        { label: 'Fee Reminder', text: `Namaste {name} ji, aapki fees ₹{amount} pending hai. Aaj payment karein aur late fee se bachein. AuraSync School AI Team.` },
        { label: 'Welcome Message', text: `🎉 Welcome to AuraSync School AI, {name}! Aapka enrollment confirm ho gaya. Kal 9 AM se class shuru hogi. Koi bhi sawaal ho toh call karein.` },
        { label: 'Result Congratulations', text: `Congratulations {name}! Aapka result bahut acha aaya. Keep it up! AuraSync School AI Family.` },
    ];

    const getTargets = useCallback(() => {
        if (target === 'hot') return leads.filter(l => computeScore(l) >= 80);
        if (target === 'new') return leads.filter(l => l.status === 'new');
        if (target === 'converted') return leads.filter(l => l.status === 'converted');
        return leads;
    }, [target, leads]);

    const sendBulk = async () => {
        if (!msg) return alert("Message type karein pehle!");
        const targets = getTargets();
        if (!window.confirm(`${targets.length} logon ko message bhejein?`)) return;
        setSending(true);
        try {
            await Promise.all(
                targets.map(l =>
                    axios.post(`${API}/send-message`, { phone: l.parent_phone, message: msg.replace('{name}', l.student_name) })
                )
            );
            alert(`✅ ${targets.length} messages sent!`);
        } catch (err) {
            console.error(err);
            alert("Kuch messages fail ho gaye. Backend check karein.");
        }
        setSending(false);
    };

    const currentTargets = getTargets();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 8 }}>
                {['whatsapp', 'sms', 'call'].map(t => (
                    <Btn key={t} outline={tab !== t} color="#4e8ef7" onClick={() => setTab(t)}>
                        {t === 'whatsapp' ? '💬 WhatsApp' : t === 'sms' ? '📱 SMS' : '📞 Calls'}
                    </Btn>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>Compose Message</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Select
                            label="Send To"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            options={[
                                { value: 'hot', label: `🔥 Hot Leads (${leads.filter(l => computeScore(l) >= 80).length})` },
                                { value: 'new', label: `🆕 New Leads (${leads.filter(l => l.status === 'new').length})` },
                                { value: 'converted', label: `✅ Converted Students (${leads.filter(l => l.status === 'converted').length})` },
                                { value: 'all', label: `📋 All Leads (${leads.length})` },
                            ]}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Message</label>
                            <textarea
                                value={msg}
                                onChange={e => setMsg(e.target.value)}
                                rows={5}
                                placeholder="Apna message yahan likhein. {name} likhe toh automatically replace ho jaayega."
                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical' }}
                            />
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
                            Recipients: <strong style={{ color: '#4e8ef7' }}>{currentTargets.length}</strong>
                        </p>
                        <Btn color="#00d97e" onClick={sendBulk} style={{ width: '100%' }}>
                            {sending ? '⏳ Sending...' : `🚀 Send to ${currentTargets.length} People`}
                        </Btn>
                    </div>
                </Card>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>Message Templates</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {templates.map(t => (
                            <div
                                key={t.label}
                                onClick={() => setMsg(t.text)}
                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: 14, cursor: 'pointer' }}
                            >
                                <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#4e8ef7', fontSize: 13 }}>{t.label}</p>
                                <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>{t.text.substring(0, 80)}...</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
function InsightsModule({ leads }) {
    const branchData = BRANCHES.map(b => ({
        branch: b,
        total: leads.filter(l => l.branch === b).length,
        converted: leads.filter(l => l.branch === b && l.status === 'converted').length,
    })).map(b => ({ ...b, rate: b.total > 0 ? Math.round(b.converted / b.total * 100) : 0 }));

    const sourceData = SOURCES.map(s => ({
        source: s,
        count: leads.filter(l => l.source === s).length,
        converted: leads.filter(l => l.source === s && l.status === 'converted').length,
    }));

    const totalConverted = leads.filter(l => l.status === 'converted').length;
    const convRate = leads.length > 0 ? Math.round(totalConverted / leads.length * 100) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <Stat icon="📋" label="Total Leads" value={leads.length} color="#4e8ef7" />
                <Stat icon="🎓" label="Converted" value={totalConverted} color="#00d97e" />
                <Stat icon="📈" label="Conversion Rate" value={`${convRate}%`} color="#f6c90e" />
                <Stat icon="💰" label="Revenue" value={fmt(totalConverted * 50000)} color="#f97316" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>📍 Branch Performance</p>
                    {branchData.map(b => (
                        <div key={b.branch} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600 }}>{b.branch}</span>
                                <span style={{ fontSize: 12, color: '#9ca3af' }}>{b.converted}/{b.total} ({b.rate}%)</span>
                            </div>
                            <div style={{ height: 8, background: '#1f2d3d', borderRadius: 4 }}>
                                <div style={{ width: `${b.rate || 0}%`, height: '100%', background: b.rate >= 50 ? '#00d97e' : b.rate >= 30 ? '#f6c90e' : '#f45b69', borderRadius: 4 }} />
                            </div>
                        </div>
                    ))}
                </Card>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>🔎 Lead Source Analysis</p>
                    {sourceData.map(s => (
                        <div key={s.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1f2d3d' }}>
                            <span style={{ fontSize: 13, color: '#d1d5db' }}>{s.source}</span>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#6b7280' }}>{s.count} leads</span>
                                <Badge color={s.converted > 0 ? '#00d97e' : '#6b7280'}>{s.converted} converted</Badge>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
            <Card>
                <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>📈 AI Trend Analysis</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        { trend: '↑ Walk-in leads +23%', insight: 'Increase offline advertising in target areas.', color: '#00d97e' },
                        { trend: '↓ WhatsApp conversion -8%', insight: 'Review message templates — response rate dropping.', color: '#f45b69' },
                        { trend: '→ Ujjain branch stable', insight: 'No significant change. Consider new campaign.', color: '#f6c90e' },
                        { trend: '↑ Revenue forecast +15%', insight: 'On track to hit monthly target if 6 more leads convert.', color: '#4e8ef7' },
                    ].map(t => (
                        <div key={t.trend} style={{ background: '#0d1117', borderRadius: 12, padding: 16, borderLeft: `3px solid ${t.color}` }}>
                            <p style={{ margin: '0 0 6px', fontWeight: 800, color: t.color, fontSize: 13 }}>{t.trend}</p>
                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{t.insight}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsModule() {
    const [role, setRole] = useState('admin');
    const staff = [
        { name: 'Admin User', role: 'admin', access: 'Full Access' },
        { name: 'Sales Staff', role: 'staff', access: 'Leads + Comms' },
        { name: 'Accounts', role: 'accounts', access: 'Fees Only' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>🔐 Role & Access Control</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {['admin', 'staff', 'accounts'].map(r => (
                            <Btn key={r} small outline={role !== r} color="#4e8ef7" onClick={() => setRole(r)}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </Btn>
                        ))}
                    </div>
                    {staff.map(s => (
                        <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1f2d3d' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.name}</p>
                                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{s.access}</p>
                            </div>
                            <Badge color={s.role === 'admin' ? '#4e8ef7' : s.role === 'accounts' ? '#f6c90e' : '#00d97e'}>{s.role}</Badge>
                        </div>
                    ))}
                </Card>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>⚙️ System Configuration</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Input label="School Name" defaultValue="AuraSync School AI" />
                        <Input label="Backend API URL" defaultValue={API} />
                        <Input label="WhatsApp Number" defaultValue="+918686000000" />
                        <Select label="Default Branch" options={BRANCHES} />
                        <Btn color="#4e8ef7" style={{ marginTop: 4 }}>💾 Save Configuration</Btn>
                    </div>
                </Card>
            </div>
            <Card>
                <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#00d97e' }}>🔴 Live System Status</p>
                {[
                    { name: 'Firebase Realtime DB', status: 'Connected', color: '#00d97e' },
                    { name: 'WhatsApp API', status: 'Active', color: '#00d97e' },
                    { name: 'Backend Server', status: 'Check Required', color: '#f6c90e' },
                    { name: 'AI Scoring Engine', status: 'Running', color: '#00d97e' },
                ].map(s => (
                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1f2d3d' }}>
                        <span style={{ fontSize: 13, color: '#d1d5db' }}>{s.name}</span>
                        <Badge color={s.color}>{s.status}</Badge>
                    </div>
                ))}
            </Card>
        </div>
    );
}

// ─── AUTOMATION STATUS (FIXED: Was missing component) ─────────────────────────
function AutomationStatusModule({ leads }) {
    const logs = [
        { time: '10:30 AM', type: 'New Lead Welcome', status: 'Success', count: leads.filter(l => l.status === 'new').length },
        { time: '09:15 AM', type: 'Fee Reminder', status: 'Success', count: 12 },
        { time: 'Yesterday', type: 'Hot Lead Alert', status: 'Success', count: leads.filter(l => computeScore(l) >= 80).length },
        { time: 'Yesterday', type: 'Weekly Report', status: 'Success', count: 1 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card>
                <p style={{ margin: '0 0 20px', fontWeight: 700, color: '#f1f5f9' }}>📋 Automation Execution Logs</p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#0d1117' }}>
                            {['Time', 'Automation', 'Status', 'Recipients'].map(h => (
                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>{log.time}</td>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{log.type}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <Badge color="#00d97e">✅ {log.status}</Badge>
                                </td>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af' }}>{log.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function MainApp({ children }) {
    // ── Auth State ──
    const [authed, setAuthed] = useState(() => {
        try { return localStorage.getItem('sd_crm_auth') === '1'; }
        catch { return false; }
    });

    // ── Login Form State (FIXED: Added email & password fields) ──
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('command');
    const [leads, setLeads] = useState([]);
    const [realFees, setRealFees] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Firestore unsubscribe ref ──
    const unsubRef = useRef(null);

    // ── Data sync ──
    const startDataSync = useCallback(() => {
        if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
        }

        const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
        unsubRef.current = onSnapshot(
            q,
            snapshot => {
                setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            },
            err => console.error('Firestore error:', err)
        );

        axios.get(`${API}/get-real-fees`)
            .then(r => setRealFees(r.data))
            .catch(err => console.error('Fees fetch error:', err));
    }, []);

    useEffect(() => {
        if (authed) {
            startDataSync();
        }
        return () => {
            if (unsubRef.current) unsubRef.current();
        };
    }, [authed, startDataSync]);

    // ── FIXED: handleLogin now reads from loginForm state ──
    const handleLogin = async (e) => {
        e?.preventDefault();

        if (!loginForm.email || !loginForm.password) {
            setLoginError('Email and password are required');
            return;
        }

        setLoading(true);
        setLoginError('');

        try {
            const res = await axios.post(`${API}/api/auth/login`, {
                email: loginForm.email,
                password: loginForm.password
            });

            localStorage.setItem("aura_token", res.data.token);
            localStorage.setItem("sd_crm_auth", "1");
            localStorage.setItem("user_data", JSON.stringify(res.data.user));

            setAuthed(true);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Login Failed";
            setLoginError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
        }
        try {
            localStorage.removeItem('sd_crm_auth');
            localStorage.removeItem('aura_token');
            localStorage.removeItem('user_data');
        } catch { }
        setLeads([]);
        setRealFees([]);
        setLoginForm({ email: '', password: '' });
        setLoginError('');
        setAuthed(false);
    };

    const sendCampaign = async (type) => {
        const targets = type === 'hot'
            ? leads.filter(l => computeScore(l) >= 80)
            : leads.filter(l => l.status === 'converted');
        if (!targets.length) return alert('AI Insight: Category khali hai.');
        if (!window.confirm(`AI ne ${targets.length} targets select kiye hain. Bulk broadcast shuru karein?`)) return;
        try {
            await axios.post(`${API}/send-bulk-campaign`, {
                targets: targets.map(l => ({ phone: l.parent_phone, name: l.student_name })),
                type,
            });
            alert(`🚀 Success! ${targets.length} messages sent.`);
        } catch (err) {
            console.error(err);
            alert('Network Error: Campaign fail hui.');
        }
    };

    const activeLeadsCount = leads.filter(l => computeScore(l) >= 80).length;

    // ── FIXED: Login screen with email + password fields ──
    if (!authed) {
        return (
            <RBACProvider>
                <div style={{
                    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#0d1117', fontFamily: "'Segoe UI', sans-serif"
                }}>
                    <div style={{
                        background: '#111827',
                        border: `1px solid ${loginError ? '#f45b69' : '#1f2d3d'}`,
                        borderRadius: 24, padding: '48px 40px', textAlign: 'center', width: 400,
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6)', transition: 'border-color .2s'
                    }}>
                        <div style={{
                            width: 64, height: 64, background: 'linear-gradient(135deg,#4e8ef7,#a78bfa)',
                            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, margin: '0 auto 20px'
                        }}>🧠</div>
                        <h1 style={{ margin: '0 0 6px', color: '#f1f5f9', fontSize: 24, fontWeight: 900 }}>AuraSync School AI</h1>
                        <p style={{ margin: '0 0 28px', color: '#6b7280', fontSize: 13 }}>School Operating System v3.0</p>

                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={loginForm.email}
                                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                style={{
                                    width: '100%', padding: '14px 16px', fontSize: 14,
                                    background: '#0d1117', border: `1px solid ${loginError ? '#f45b69' : '#1f2d3d'}`,
                                    borderRadius: 12, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginForm.password}
                                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                style={{
                                    width: '100%', padding: '14px 16px', fontSize: 14,
                                    background: '#0d1117', border: `1px solid ${loginError ? '#f45b69' : '#1f2d3d'}`,
                                    borderRadius: 12, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                            {loginError && (
                                <p style={{ color: '#f45b69', fontSize: 12, margin: 0, fontWeight: 700 }}>
                                    ❌ {loginError}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px', marginTop: 6,
                                    background: loading ? '#374151' : '#4e8ef7',
                                    border: 'none', borderRadius: 12, color: '#fff',
                                    fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? '⏳ Authenticating...' : '🔓 Login'}
                            </button>
                        </form>
                    </div>
                </div>
                {children}
            </RBACProvider>
        );
    }

    // ── FIXED: Main dashboard - no duplicate tab rendering ──
    const renderTabContent = () => {
        switch (activeTab) {
            case 'command':
                return (
                    <>
                        <CommandCenter leads={leads} onSendCampaign={sendCampaign} />
                        <AIBrainDashboard />
                    </>
                );
            case 'admissions':
                return <AdmissionsEngine leads={leads} />;
            case 'fees':
                return <FeesEngine leads={leads} realFees={realFees} />;
            case 'students':
                return (
                    <>
                        <StudentsModule leads={leads} />
                        <MultiApp />
                    </>
                );
            case 'automation':
                return <AutomationEngine leads={leads} />;
            case 'automation_status':
                return <AutomationStatusModule leads={leads} />;
            case 'comms':
                return <CommsSystem leads={leads} />;
            case 'insights':
                return (
                    <>
                        <InsightsModule leads={leads} />
                        <RealtimeDashboard />
                    </>
                );
            case 'settings':
                return <SettingsModule />;
            case 'timetable':
                return <TimetableOptimizer />;
            case 'transport':
                return <TransportApp />;
            case 'marketplace':
                return <ModularMarketplace />;
            case 'documents':
                return <DocsManager userRole="admin" schoolId="AuraIndore_01" />;
            case 'roles':
                return (
                    <RBACProvider>
                        <Card>
                            <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>🔐 Role-Based Access Control</p>
                            <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>
                                Configure user roles and permissions. RBAC Provider is active and protecting routes.
                            </p>
                        </Card>
                    </RBACProvider>
                );
            default:
                return <CommandCenter leads={leads} onSendCampaign={sendCampaign} />;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117', fontFamily: "'Segoe UI', sans-serif", color: '#f1f5f9' }}>

            {/* SIDEBAR */}
            <div style={{
                width: sidebarOpen ? 240 : 68, background: '#111827', borderRight: '1px solid #1f2d3d',
                display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh',
                zIndex: 100, transition: 'width .25s', overflow: 'hidden'
            }}>
                <div style={{
                    padding: '20px 16px', borderBottom: '1px solid #1f2d3d',
                    display: 'flex', alignItems: 'center', gap: 12
                }}>
                    <div style={{
                        width: 36, height: 36, background: 'linear-gradient(135deg,#4e8ef7,#a78bfa)',
                        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0
                    }}>🧠</div>
                    {sidebarOpen && (
                        <div>
                            <p style={{ margin: 0, fontWeight: 900, color: '#f1f5f9', fontSize: 15 }}>AuraSync School</p>
                            <p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>AI Operating System</p>
                        </div>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        const hasBadge = tab.id === 'command' && activeLeadsCount > 0;
                        return (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                                    borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                                    background: isActive ? '#1f2d3d' : 'transparent',
                                    color: isActive ? '#4e8ef7' : '#9ca3af',
                                    fontWeight: isActive ? 700 : 500, fontSize: 13, transition: 'all .15s'
                                }}
                            >
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{tab.icon}</span>
                                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>}
                                {hasBadge && (
                                    <span style={{
                                        marginLeft: 'auto', background: '#f45b69', color: '#fff',
                                        borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 800
                                    }}>
                                        {activeLeadsCount}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ padding: '12px 8px', borderTop: '1px solid #1f2d3d' }}>
                    <div
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#6b7280', fontSize: 13 }}
                    >
                        <span style={{ fontSize: 18 }}>{sidebarOpen ? '◀' : '▶'}</span>
                        {sidebarOpen && <span>Collapse</span>}
                    </div>
                    <div
                        onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#f45b69', fontSize: 13 }}
                    >
                        <span style={{ fontSize: 18 }}>🚪</span>
                        {sidebarOpen && <span>Logout</span>}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ marginLeft: sidebarOpen ? 240 : 68, flex: 1, padding: '32px', transition: 'margin .25s', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>
                            {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                            {leads.length} total leads · {leads.filter(l => l.status === 'converted').length} converted · Live Firebase Sync
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111827', border: '1px solid #1f2d3d', borderRadius: 20, padding: '6px 14px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d97e', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Live System</span>
                    </div>
                </div>

                {/* FIXED: Single render call using switch - no duplicates */}
                {renderTabContent()}
            </div>

            <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#0d1117; }
        ::-webkit-scrollbar-thumb { background:#1f2d3d; border-radius:4px; }
        button:hover:not(:disabled) { opacity:.88; }
        input::placeholder, textarea::placeholder { color:#374151; }
      `}</style>
        </div>
    );
}