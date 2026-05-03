import StaffModule from './StaffModule';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RBACProvider } from "./RBAC";
import RealtimeDashboard from './RealtimeDashboard';
import MultiApp from './MultiApp';
import DocsManager from './components/DocsManager';
import AIBrainDashboard from './AIBrainDashboard';
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import axios from 'axios';
import { TimetableOptimizer, TransportApp, ModularMarketplace } from './SchoolFeatures';
import Attendance from './components/Attendance';
import NoticeBoard from './components/NoticeBoard';
import ExamScheduler from './components/ExamScheduler';
import HomeworkTracker from './components/HomeworkTracker';
import AcademicCalendar from './components/AcademicCalendar';
import ParentPortal from './components/ParentPortal';
import AuditLogs from './components/AuditLogs';
import AdminPanel from './components/AdminPanel';
import AutomationDashboard from './components/AutomationDashboard';
import LibraryManagement from './utils/LibraryManagement';
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const API = process.env.REACT_APP_API_URL;
// eslint-disable-next-line
const isDemoMode = true;
const TABS = [
    { id: 'command', icon: '🧠', label: 'AI Command' },
    { id: 'admissions', icon: '🎯', label: 'Admissions' },
    { id: 'students', icon: '👨‍🎓', label: 'Students' },
    { id: 'staff', icon: '👥', label: 'Staff' },
    { id: 'results', icon: '📊', label: 'Results & PDF' },
    { id: 'fees', icon: '💰', label: 'Fees & Revenue' },
    { id: 'automation', icon: '⚡', label: 'AI Automation' },
    { id: 'automation_status', icon: '📋', label: 'Automation Logs' },
    { id: 'comms', icon: '📞', label: 'Communications' },
    { id: 'insights', icon: '📈', label: 'Insights' },
    { id: 'timetable', icon: '📅', label: 'Timetable' },
    { id: 'transport', icon: '🚌', label: 'Transport' },
    { id: 'marketplace', icon: '🛍️', label: 'Marketplace' },
    { id: 'documents', label: 'Syllabus & Docs', icon: '📂' },
    { id: 'roles', icon: '🔐', label: 'Roles' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'attendance', icon: '📅', label: 'Attendance' },
    { id: 'exams', icon: '📝', label: 'Exam Schedule' },
    { id: 'noticeboard', icon: '📌', label: 'Notice Board' },
    { id: 'homework', icon: '📚', label: 'Homework' },
    { id: 'calendar', icon: '🗓️', label: 'Academic Calendar' },
    { id: 'library', icon: '📖', label: 'Library' },
    { id: 'parentportal', icon: '👨‍👩‍👧', label: 'Parent Portal' },
    { id: 'auditlogs', icon: '🔍', label: 'Audit Logs' },
    { id: 'adminpanel', icon: '🛠️', label: 'Admin Panel' },
    { id: 'automationdash', icon: '🤖', label: 'Auto Dashboard' },
];

const SOURCES = ['Walk-in', 'WhatsApp', 'Instagram', 'Reference', 'Website', 'Phone'];
const BRANCHES = ['Indore Main', 'Indore West', 'Ujjain'];
const STATUSES = ['new', 'called', 'interested', 'converted', 'lost'];
const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Computer'];
const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Final', 'Annual'];
const CLASS_OPTIONS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const scoreColor = s => s >= 80 ? '#00d97e' : s >= 60 ? '#f6c90e' : '#f45b69';
const statusColor = s => ({ new: '#4e8ef7', called: '#f6c90e', interested: '#f97316', converted: '#00d97e', lost: '#f45b69' }[s] || '#888');
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = d => d ? new Date(d?.toDate?.() || d).toLocaleDateString('en-IN') : '—';
const now = () => new Date();
const getGrade = p => p >= 91 ? 'A+' : p >= 81 ? 'A' : p >= 71 ? 'B+' : p >= 61 ? 'B' : p >= 51 ? 'C+' : p >= 41 ? 'C' : p >= 33 ? 'D' : 'F';
const getGradeColor = g => ({ 'A+': '#00d97e', 'A': '#00d97e', 'B+': '#4e8ef7', 'B': '#4e8ef7', 'C+': '#f6c90e', 'C': '#f6c90e', 'D': '#f97316', 'F': '#f45b69' }[g] || '#888');
const getRemark = p => p >= 91 ? 'Outstanding Performance!' : p >= 81 ? 'Excellent Work!' : p >= 71 ? 'Very Good!' : p >= 61 ? 'Good, Keep Improving' : p >= 51 ? 'Average, Need Focus' : p >= 41 ? 'Below Average' : p >= 33 ? 'Needs Improvement' : 'Fail - Remedial Required';

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    const bg = type === 'success' ? '#00d97e' : type === 'error' ? '#f45b69' : type === 'warning' ? '#f6c90e' : '#4e8ef7';
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    return (
        <div style={{
            position: 'fixed', bottom: 30, right: 30, zIndex: 9999,
            background: bg, color: type === 'warning' ? '#000' : '#fff',
            padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            boxShadow: `0 10px 40px ${bg}44`, animation: 'toastIn .4s ease', maxWidth: 400
        }}>
            {icon} {message}
        </div>
    );
}

function Modal({ children, onClose, width = 560 }) {
    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn .2s ease'
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#111827', borderRadius: 20, padding: 0, width, maxWidth: '95vw',
                maxHeight: '90vh', overflowY: 'auto', border: '1px solid #1f2d3d', animation: 'modalIn .3s ease',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
            }}>
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, onClose, color = '#4e8ef7' }) {
    return (
        <div style={{
            padding: '20px 24px', borderBottom: '1px solid #1f2d3d',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(135deg, #111827, #0d1117)', borderRadius: '20px 20px 0 0'
        }}>
            <h3 style={{ margin: 0, fontWeight: 800, color, fontSize: 16 }}>{title}</h3>
            <button onClick={onClose} style={{
                background: '#1f2d3d', border: 'none', color: '#9ca3af', width: 32, height: 32,
                borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
        </div>
    );
}

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
            <input {...props} style={{
                background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10,
                padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
                width: '100%', boxSizing: 'border-box', ...props.style
            }} />
        </div>
    );
}

function Select({ label, options, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</label>}
            <select {...props} style={{
                background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10,
                padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none',
                width: '100%', ...props.style
            }}>
                {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
        </div>
    );
}

function Btn({ children, color = '#4e8ef7', outline, small, danger, ...props }) {
    const c = danger ? '#f45b69' : color;
    return (
        <button {...props} style={{
            padding: small ? '7px 16px' : '11px 22px', borderRadius: 10,
            border: outline ? `1.5px solid ${c}` : 'none',
            background: outline ? 'transparent' : c,
            color: outline ? c : '#fff',
            fontWeight: 700, fontSize: small ? 12 : 14, cursor: 'pointer',
            transition: 'all .15s', letterSpacing: 0.3, ...props.style
        }}>
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
    const ageHours = lead.timestamp ? (now() - new Date(lead.timestamp?.toDate?.() || lead.timestamp)) / 36e5 : 0;
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

// ─── EDIT LEAD MODAL ─────────────────────────────────────────────────────────
function EditLeadModal({ lead, onClose, showToast }) {
    const [form, setForm] = useState({ ...lead });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = async () => {
        if (!form.student_name || !form.parent_phone) return showToast('Name and phone are required', 'error');
        setSaving(true);
        try {
            const { id, timestamp, bonus, ...data } = form;
            await updateDoc(doc(db, "leads", id), data);
            showToast('Lead updated successfully!', 'success');
            onClose();
        } catch (err) {
            console.error(err);
            showToast('Failed to update lead', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, "leads", lead.id));
            // Also remove from localStorage results if exists
            try {
                const results = JSON.parse(localStorage.getItem('student_results') || '{}');
                if (results[lead.id]) {
                    delete results[lead.id];
                    localStorage.setItem('student_results', JSON.stringify(results));
                }
            } catch { }
            showToast(`${lead.student_name} deleted permanently`, 'warning');
            onClose();
        } catch (err) {
            console.error(err);
            showToast('Failed to delete lead', 'error');
        }
        setDeleting(false);
    };

    return (
        <Modal onClose={onClose} width={560}>
            <ModalHeader title={`✏️ Edit: ${lead.student_name}`} onClose={onClose} />
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Input label="Student Name *" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} />
                    <Input label="Parent Phone *" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} />
                    <Input label="City" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
                    <Input label="Parent Name" value={form.parent_name || ''} onChange={e => setForm({ ...form, parent_name: e.target.value })} />
                    <Select label="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} options={BRANCHES} />
                    <Select label="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} options={SOURCES} />
                    <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} />
                    <Select label="Class" value={form.class || '1st'} onChange={e => setForm({ ...form, class: e.target.value })} options={CLASS_OPTIONS} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Notes</label>
                    <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                        style={{ width: '100%', background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div>
                        {!showDeleteConfirm ? (
                            <Btn small danger outline onClick={() => setShowDeleteConfirm(true)}>🗑️ Delete Lead</Btn>
                        ) : (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#f45b69', fontWeight: 600 }}>Sure?</span>
                                <Btn small danger onClick={handleDelete} disabled={deleting}>
                                    {deleting ? '⏳' : 'Yes, Delete'}
                                </Btn>
                                <Btn small outline color="#6b7280" onClick={() => setShowDeleteConfirm(false)}>Cancel</Btn>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Btn small outline onClick={onClose}>Cancel</Btn>
                        <Btn small color="#00d97e" onClick={handleSave} disabled={saving}>
                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                        </Btn>
                    </div>
                </div>
            </div>
        </Modal>
    );
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
            <div style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', borderRadius: 20, padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(78,142,247,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: 200, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,217,126,0.05)' }} />
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#4e8ef7', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>AI Command Center</p>
                            <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 900, color: '#fff' }}>Today's Intelligence</h1>
                            <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Btn color="#f45b69" onClick={() => onSendCampaign('hot')}>🚀 Smart Campaign</Btn>
                            <Btn color="#00d97e" onClick={() => onSendCampaign('fees')}>💰 Fee Recovery</Btn>
                        </div>
                    </div>
                    <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {[
                            { icon: '📞', label: 'Call Now', value: hot.length, color: '#f45b69', sub: 'High-priority leads' },
                            { icon: '💸', label: 'Recover Today', value: fmt(overdue.length * 15000), color: '#f6c90e', sub: 'Estimated recovery' },
                            { icon: '🎓', label: 'Expected This Week', value: weekAdmissions, color: '#00d97e', sub: 'Admission forecast' },
                            { icon: '📈', label: 'Revenue Forecast', value: fmt(forecastRevenue), color: '#4e8ef7', sub: 'From active pipeline' },
                        ].map(item => (
                            <div key={item.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 18, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                <AIInsightBox title="AI Decision Engine" insights={insights.length ? insights : [{ urgent: false, text: 'No urgent actions right now. System is monitoring...' }]} />
                <Card>
                    <p style={{ margin: '0 0 16px', fontSize: 12, color: '#f45b69', fontWeight: 700, letterSpacing: 1 }}>🔥 URGENT — CALL NOW</p>
                    {hot.length === 0 && <p style={{ color: '#6b7280', fontSize: 13 }}>No hot leads right now.</p>}
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
        </div>
    );
}

// ─── ADMISSIONS ENGINE (WITH EDIT/DELETE) ─────────────────────────────────────
function AdmissionsEngine({ leads, onEditLead, onDeleteLead, showToast }) {
    const [form, setForm] = useState({ student_name: '', parent_phone: '', city: '', branch: BRANCHES[0], source: SOURCES[0], status: 'new', notes: '' });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterBranch, setFilterBranch] = useState('all');
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.student_name || !form.parent_phone) return showToast('Name and phone required!', 'error');
        const bonus = Math.floor(Math.random() * 10);
        try {
            await addDoc(collection(db, "leads"), { ...form, bonus, timestamp: new Date() });
            setForm({ student_name: '', parent_phone: '', city: '', branch: BRANCHES[0], source: SOURCES[0], status: 'new', notes: '' });
            setAdding(false);
            showToast('Lead added successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Firebase Error!', 'error');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateDoc(doc(db, "leads", id), { status });
            showToast(`Status updated to ${status}`, 'success');
        } catch (err) { console.error(err); }
    };

    const handleQuickDelete = async (lead) => {
        if (!window.confirm(`Delete "${lead.student_name}"? This cannot be undone.`)) return;
        try {
            await deleteDoc(doc(db, "leads", lead.id));
            showToast(`${lead.student_name} deleted`, 'warning');
        } catch (err) {
            console.error(err);
            showToast('Delete failed', 'error');
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
                    <Card key={p.status} style={{ textAlign: 'center', cursor: 'pointer', border: filterStatus === p.status ? `1px solid ${statusColor(p.status)}` : '1px solid #1f2d3d' }}
                        onClick={() => setFilterStatus(filterStatus === p.status ? 'all' : p.status)}>
                        <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: statusColor(p.status) }}>{p.count}</h2>
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{p.status}</p>
                    </Card>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input placeholder="🔍 Search name or phone..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
                    style={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }}>
                    <option value="all">All Branches</option>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
                <Btn color="#00d97e" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ Add Lead'}</Btn>
            </div>

            {adding && (
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#00d97e' }}>➕ New Lead Capture</p>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                            <Input label="Student Name *" value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} placeholder="Full name" />
                            <Input label="Parent Phone *" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} placeholder="10-digit number" />
                            <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" />
                            <Select label="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} options={BRANCHES} />
                            <Select label="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} options={SOURCES} />
                            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} />
                        </div>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." rows={2}
                            style={{ width: '100%', marginTop: 14, background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                        <div style={{ marginTop: 14 }}><Btn type="submit" color="#00d97e">✅ Save Lead</Btn></div>
                    </form>
                </Card>
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>
                        Lead Intelligence Table <span style={{ color: '#6b7280', fontWeight: 400 }}>({filtered.length} leads)</span>
                    </p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                {['Student', 'Contact', 'Branch/Source', 'AI Score', 'Next Action', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(l => {
                                const score = computeScore(l);
                                const na = nextAction(l);
                                return (
                                    <tr key={l.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                        <td style={{ padding: '14px 14px' }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{l.student_name}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{fmtDate(l.timestamp)}</p>
                                        </td>
                                        <td style={{ padding: '14px 14px' }}>
                                            <p style={{ margin: 0, fontSize: 13, color: '#d1d5db' }}>{l.parent_phone}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{l.city || '—'}</p>
                                        </td>
                                        <td style={{ padding: '14px 14px' }}>
                                            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{l.branch}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{l.source}</p>
                                        </td>
                                        <td style={{ padding: '14px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 50, height: 6, background: '#1f2d3d', borderRadius: 4 }}>
                                                    <div style={{ width: `${score}%`, height: '100%', background: scoreColor(score), borderRadius: 4 }} />
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: 14, color: scoreColor(score) }}>{score}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 14px' }}><Badge color={na.color}>{na.icon} {na.label}</Badge></td>
                                        <td style={{ padding: '14px 14px' }}>
                                            <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 8, padding: '6px 10px', color: statusColor(l.status), fontSize: 12, fontWeight: 700, outline: 'none' }}>
                                                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '14px 14px' }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <Btn small color="#4e8ef7" outline onClick={() => onEditLead(l)} title="Edit">✏️</Btn>
                                                <Btn small color="#00d97e" outline onClick={() => window.open(`https://wa.me/91${l.parent_phone}`)} title="WhatsApp">💬</Btn>
                                                <Btn small color="#f45b69" outline onClick={() => handleQuickDelete(l)} title="Delete">🗑️</Btn>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No leads found.</p>}
                </div>
            </Card>
        </div>
    );
}

// ─── RESULT PDF GENERATOR ─────────────────────────────────────────────────────
function ResultPDFModule({ leads, showToast }) {
    const students = leads.filter(l => l.status === 'converted');
    const [results, setResults] = useState(() => {
        try { return JSON.parse(localStorage.getItem('student_results') || '{}'); }
        catch { return {}; }
    });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [examType, setExamType] = useState('Mid-Term');
    const [academicYear, setAcademicYear] = useState('2024-25');
    const [marks, setMarks] = useState({});
    const [viewMode, setViewMode] = useState('entry');

    const saveResult = () => {
        if (!selectedStudent) return showToast('Select a student first', 'error');
        const totalMarks = Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0);
        if (totalMarks === 0) return showToast('Enter at least one subject marks', 'error');
        const newResults = {
            ...results,
            [selectedStudent.id]: { marks: { ...marks }, examType, academicYear, totalMarks, maxMarks: SUBJECTS.length * 100, date: new Date().toISOString() }
        };
        setResults(newResults);
        localStorage.setItem('student_results', JSON.stringify(newResults));
        showToast('Result saved successfully!', 'success');
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
        const existing = results[student.id];
        if (existing) {
            setMarks({ ...existing.marks });
            setExamType(existing.examType || 'Mid-Term');
        } else {
            setMarks(SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: '' }), {}));
        }
        setViewMode('entry');
    };

    const generateSinglePDF = (student) => {
        const result = results[student.id];
        if (!result) return showToast('No result saved for this student', 'error');
        const percentage = Math.round(result.totalMarks / result.maxMarks * 100);
        const grade = getGrade(percentage);
        const remark = getRemark(percentage);

        const subjectRows = SUBJECTS.map((sub, i) => {
            const m = result.marks[sub] || 0;
            const g = getGrade(m);
            return `<tr><td style="padding:10px;border:1px solid #ddd;text-align:left;">${i + 1}. ${sub}</td><td style="padding:10px;border:1px solid #ddd;text-align:center;">100</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-weight:700;color:${getGradeColor(g)}">${m}</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-weight:700;color:${getGradeColor(g)}">${g}</td></tr>`;
        }).join('');

        const html = `<!DOCTYPE html><html><head><title>Result - ${student.student_name}</title>
        <style>
          @page{margin:15mm;size:A4}
          body{font-family:'Segoe UI',Arial,sans-serif;color:#222;margin:0;padding:20px}
          .header{text-align:center;border-bottom:3px double #1a365d;padding-bottom:15px;margin-bottom:20px}
          .header h1{margin:0;font-size:26px;color:#1a365d;letter-spacing:1px}
          .header h2{margin:8px 0 0;font-size:18px;color:#2d3748}
          .header p{margin:4px 0;color:#718096}
          .info-grid{display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;padding:15px;background:#f7fafc;border-radius:8px;border:1px solid #e2e8f0}
          .info-item{flex:1;min-width:150px}
          .info-item label{font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:1px;display:block}
          .info-item span{font-size:14px;font-weight:700;color:#2d3748}
          table{width:100%;border-collapse:collapse;margin:20px 0}
          th{background:#1a365d;color:#fff;padding:12px;text-align:center;font-size:13px;text-transform:uppercase;letter-spacing:1px}
          .summary{display:flex;gap:20px;margin:20px 0;padding:20px;background:linear-gradient(135deg,#ebf8ff,#f0fff4);border-radius:12px;border:1px solid #bee3f8}
          .summary-item{text-align:center;flex:1}
          .summary-item .value{font-size:32px;font-weight:900}
          .summary-item .label{font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:1px}
          .remark{text-align:center;padding:15px;margin:15px 0;border-radius:10px;font-size:16px;font-weight:700}
          .signatures{display:flex;justify-content:space-between;margin-top:80px}
          .sig{text-align:center;width:180px}
          .sig .line{border-top:2px solid #333;margin-top:60px;padding-top:8px;font-size:12px;color:#555}
          .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;color:rgba(0,0,0,0.03);font-weight:900;pointer-events:none;z-index:0}
          @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}
        </style></head><body>
        <div class="watermark">AURASYNC</div>
        <div class="header">
          <h1>🎓 AuraSync School AI</h1>
          <p>Indore, Madhya Pradesh | Affiliation Code: MP-2024-AI-001</p>
          <h2 style="margin-top:12px">📊 ${result.examType.toUpperCase()} EXAMINATION RESULT</h2>
          <p>Academic Year: ${result.academicYear}</p>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>Student Name</label><span>${student.student_name}</span></div>
          <div class="info-item"><label>Parent/Guardian</label><span>${student.parent_name || 'N/A'}</span></div>
          <div class="info-item"><label>Class</label><span>${student.class || 'N/A'}</span></div>
          <div class="info-item"><label>Branch</label><span>${student.branch}</span></div>
          <div class="info-item"><label>Roll Number</label><span>AS-${String(student.id).slice(-6).toUpperCase()}</span></div>
          <div class="info-item"><label>Date of Issue</label><span>${new Date().toLocaleDateString('en-IN')}</span></div>
        </div>
        <table><thead><tr><th>Subject</th><th>Max Marks</th><th>Marks Obtained</th><th>Grade</th></tr></thead><tbody>${subjectRows}</tbody>
        <tfoot><tr style="background:#edf2f7"><td style="padding:12px;border:1px solid #ddd;font-weight:700;text-align:right">TOTAL</td><td style="padding:12px;border:1px solid #ddd;text-align:center;font-weight:700">${result.maxMarks}</td><td style="padding:12px;border:1px solid #ddd;text-align:center;font-weight:900;font-size:16px;color:#1a365d">${result.totalMarks}</td><td style="padding:12px;border:1px solid #ddd;text-align:center;font-weight:900;font-size:16px;color:${getGradeColor(grade)}">${grade}</td></tr></tfoot>
        </table>
        <div class="summary">
          <div class="summary-item"><div class="value" style="color:#1a365d">${result.totalMarks}/${result.maxMarks}</div><div class="label">Total Marks</div></div>
          <div class="summary-item"><div class="value" style="color:${getGradeColor(grade)}">${percentage}%</div><div class="label">Percentage</div></div>
          <div class="summary-item"><div class="value" style="color:${getGradeColor(grade)}">${grade}</div><div class="label">Overall Grade</div></div>
          <div class="summary-item"><div class="value" style="color:#718096">${SUBJECTS.filter(s => (result.marks[s] || 0) >= 33).length}/${SUBJECTS.length}</div><div class="label">Passed Subjects</div></div>
        </div>
        <div class="remark" style="background:${percentage >= 33 ? '#f0fff4' : '#fff5f5'};color:${percentage >= 33 ? '#276749' : '#c53030'};border:2px solid ${percentage >= 33 ? '#c6f6d5' : '#fed7d7'}">
          ${percentage >= 33 ? '🎉' : '⚠️'} ${remark}
        </div>
        <div class="signatures">
          <div class="sig"><div class="line">Class Teacher</div></div>
          <div class="sig"><div class="line">Principal</div></div>
          <div class="sig"><div class="line">Parent/Guardian</div></div>
        </div>
        <div style="text-align:center;margin-top:30px;padding:10px;background:#f7fafc;border-radius:8px;font-size:10px;color:#a0aec0">
          This is a computer-generated result. Generated by AuraSync School AI System on ${new Date().toLocaleString('en-IN')}. | Document ID: ASR-${Date.now().toString(36).toUpperCase()}
        </div>
        <div class="no-print" style="text-align:center;margin-top:20px">
          <button onclick="window.print()" style="padding:12px 40px;background:#1a365d;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer">🖨️ Print / Save as PDF</button>
        </div>
        </body></html>`;

        const win = window.open('', '_blank', 'width=800,height=1000');
        if (win) {
            win.document.write(html);
            win.document.close();
        } else {
            showToast('Pop-up blocked! Allow pop-ups for this site', 'error');
        }
    };

    const generateBulkPDF = () => {
        const studentsWithResults = students.filter(s => results[s.id]);
        if (studentsWithResults.length === 0) return showToast('No results saved yet', 'error');

        const allCards = studentsWithResults.map(student => {
            const result = results[student.id];
            const percentage = Math.round(result.totalMarks / result.maxMarks * 100);
            const grade = getGrade(percentage);
            const rows = SUBJECTS.map((sub, i) => {
                const m = result.marks[sub] || 0;
                const g = getGrade(m);
                return `<tr><td style="padding:6px 10px;border:1px solid #ddd;font-size:11px">${i + 1}. ${sub}</td><td style="padding:6px;border:1px solid #ddd;text-align:center;font-size:11px">${m}</td><td style="padding:6px;border:1px solid #ddd;text-align:center;font-size:11px;font-weight:700;color:${getGradeColor(g)}">${g}</td></tr>`;
            }).join('');
            return `<div style="page-break-after:always;margin-bottom:30px">
            <div style="text-align:center;border-bottom:2px solid #1a365d;padding-bottom:10px;margin-bottom:12px">
              <h2 style="margin:0;color:#1a365d;font-size:18px">🎓 AuraSync School AI</h2>
              <p style="margin:4px 0;font-size:11px;color:#666">${result.examType} Result | ${result.academicYear}</p>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:12px">
              <div><strong>Name:</strong> ${student.student_name} | <strong>Class:</strong> ${student.class || 'N/A'} | <strong>Roll:</strong> AS-${String(student.id).slice(-6).toUpperCase()}</div>
              <div><strong>Branch:</strong> ${student.branch} | <strong>Total:</strong> ${result.totalMarks}/${result.maxMarks} | <strong>Grade:</strong> <span style="color:${getGradeColor(grade)};font-weight:900">${grade}</span> (${percentage}%)</div>
            </div>
            <table style="width:100%;border-collapse:collapse"><thead><tr><th style="background:#1a365d;color:#fff;padding:6px;text-align:left;font-size:11px">Subject</th><th style="background:#1a365d;color:#fff;padding:6px;text-align:center;font-size:11px">Marks</th><th style="background:#1a365d;color:#fff;padding:6px;text-align:center;font-size:11px">Grade</th></tr></thead><tbody>${rows}</tbody></table>
            <div style="margin-top:10px;font-size:11px;color:#666;text-align:right">Generated: ${new Date().toLocaleString('en-IN')}</div>
            </div>`;
        }).join('');

        const html = `<!DOCTYPE html><html><head><title>Bulk Results - AuraSync School</title>
        <style>@page{margin:12mm;size:A4}body{font-family:'Segoe UI',sans-serif;color:#222;padding:10px}
        @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}</style></head>
        <body>${allCards}
        <div class="no-print" style="text-align:center;margin:30px 0"><button onclick="window.print()" style="padding:14px 50px;background:#1a365d;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer">🖨️ Print All Results as PDF</button></div>
        </body></html>`;

        const win = window.open('', '_blank', 'width=800,height=1000');
        if (win) { win.document.write(html); win.document.close(); }
        else showToast('Pop-up blocked!', 'error');
    };

    const deleteResult = (studentId) => {
        if (!window.confirm('Delete this result?')) return;
        const newResults = { ...results };
        delete newResults[studentId];
        setResults(newResults);
        localStorage.setItem('student_results', JSON.stringify(newResults));
        showToast('Result deleted', 'warning');
    };

    const studentsWithResults = students.filter(s => results[s.id]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <Stat icon="👨‍🎓" label="Total Students" value={students.length} color="#4e8ef7" />
                <Stat icon="📊" label="Results Saved" value={studentsWithResults.length} color="#00d97e" />
                <Stat icon="⏳" label="Pending Results" value={students.length - studentsWithResults.length} color="#f6c90e" />
                <Stat icon="📄" label="Exam Type" value={examType} color="#a78bfa" />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Select label="" value={examType} onChange={e => setExamType(e.target.value)} options={EXAM_TYPES.map(e => ({ value: e, label: e }))} />
                <Input label="" placeholder="Academic Year" value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ width: 140 }} />
                <Btn color="#4e8ef7" onClick={() => setViewMode('entry')}>✏️ Enter Result</Btn>
                <Btn color="#00d97e" onClick={() => setViewMode('view')}>📋 View Results</Btn>
                <Btn color="#a78bfa" onClick={generateBulkPDF}>📄 Bulk PDF</Btn>
            </div>

            {viewMode === 'entry' && (
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
                    <Card style={{ padding: 0, overflow: 'hidden', maxHeight: 500 }}>
                        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1f2d3d' }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>Select Student</p>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 440 }}>
                            {students.length === 0 && <p style={{ padding: 20, color: '#6b7280', fontSize: 12, textAlign: 'center' }}>No converted students</p>}
                            {students.map(s => (
                                <div key={s.id} onClick={() => selectStudent(s)} style={{
                                    padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #1f2d3d',
                                    background: selectedStudent?.id === s.id ? '#1f2d3d' : 'transparent',
                                    borderLeft: selectedStudent?.id === s.id ? '3px solid #4e8ef7' : '3px solid transparent'
                                }}>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{s.class || 'N/A'} · {s.branch}</p>
                                    {results[s.id] && <Badge color="#00d97e" style={{ marginTop: 4 }}>✅ Result Saved</Badge>}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        {selectedStudent ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 16 }}>📝 {selectedStudent.student_name}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{examType} · {academicYear} · {selectedStudent.class || 'N/A'}</p>
                                    </div>
                                    {results[selectedStudent.id] && (
                                        <Btn small color="#a78bfa" onClick={() => generateSinglePDF(selectedStudent)}>📄 View PDF</Btn>
                                    )}
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#0d1117' }}>
                                            {['Subject', 'Max Marks', 'Marks Obtained', 'Grade'].map(h => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SUBJECTS.map(sub => {
                                            const m = Number(marks[sub]) || 0;
                                            const g = getGrade(m);
                                            return (
                                                <tr key={sub} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#d1d5db', fontSize: 13 }}>{sub}</td>
                                                    <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: 13 }}>100</td>
                                                    <td style={{ padding: '12px 14px' }}>
                                                        <input type="number" min="0" max="100" value={marks[sub] ?? ''} onChange={e => setMarks({ ...marks, [sub]: e.target.value })}
                                                            style={{ width: 80, background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 8, padding: '8px 10px', color: '#f1f5f9', fontSize: 14, fontWeight: 700, outline: 'none', textAlign: 'center' }} />
                                                    </td>
                                                    <td style={{ padding: '12px 14px' }}>
                                                        <span style={{ fontWeight: 800, color: getGradeColor(g), fontSize: 14 }}>{m > 0 ? g : '—'}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#0d1117' }}>
                                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#f1f5f9' }}>TOTAL</td>
                                            <td style={{ padding: '12px 14px', color: '#9ca3af', fontWeight: 700 }}>{SUBJECTS.length * 100}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 900, fontSize: 16, color: '#4e8ef7' }}>
                                                {Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0)}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span style={{ fontWeight: 900, fontSize: 16, color: getGradeColor(getGrade(Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0) / (SUBJECTS.length * 100) * 100)) }}>
                                                    {getGrade(Object.values(marks).reduce((a, b) => a + (Number(b) || 0), 0) / (SUBJECTS.length * 100) * 100)}
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                    <Btn color="#00d97e" onClick={saveResult}>💾 Save Result</Btn>
                                    {results[selectedStudent.id] && (
                                        <Btn danger outline onClick={() => deleteResult(selectedStudent.id)}>🗑️ Delete Result</Btn>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                                <p style={{ fontSize: 48, margin: '0 0 16px' }}>👈</p>
                                <p style={{ fontSize: 16, fontWeight: 700 }}>Select a student from the left panel</p>
                                <p style={{ fontSize: 13 }}>to enter or edit their marks</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {viewMode === 'view' && (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📋 Saved Results ({studentsWithResults.length})</p>
                    </div>
                    {studentsWithResults.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No results saved yet.</p>}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#0d1117' }}>
                                    {['Student', 'Class', 'Branch', 'Exam', 'Total', 'Percentage', 'Grade', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {studentsWithResults.map(s => {
                                    const r = results[s.id];
                                    const pct = Math.round(r.totalMarks / r.maxMarks * 100);
                                    const g = getGrade(pct);
                                    return (
                                        <tr key={s.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</td>
                                            <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{s.class || 'N/A'}</td>
                                            <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 12 }}>{s.branch}</td>
                                            <td style={{ padding: '12px 14px' }}><Badge color="#4e8ef7">{r.examType}</Badge></td>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#d1d5db', fontSize: 13 }}>{r.totalMarks}/{r.maxMarks}</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 800, color: getGradeColor(g), fontSize: 14 }}>{pct}%</td>
                                            <td style={{ padding: '12px 14px' }}><Badge color={getGradeColor(g)}>{g}</Badge></td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <Btn small color="#a78bfa" onClick={() => generateSinglePDF(s)}>📄 PDF</Btn>
                                                    <Btn small color="#4e8ef7" outline onClick={() => { selectStudent(s); setViewMode('entry'); }}>✏️ Edit</Btn>
                                                    <Btn small danger outline onClick={() => deleteResult(s.id)}>🗑️</Btn>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}

// ─── FEES ENGINE ──────────────────────────────────────────────────────────────
function FeesEngine({ leads, realFees, showToast }) {
    const converted = leads.filter(l => l.status === 'converted');
    const feeStudents = converted.map(l => {
        const fData = realFees.find(f => f.lead_id === l.id) || { total_fees: 50000, paid_amount: 0 };
        const total = fData.total_fees; const paid = fData.paid_amount; const pending = total - paid;
        const recoveryProb = total > 0 ? Math.round((paid / total) * 100) : 0;
        return { ...l, total, paid, pending, recoveryProb, risk: pending > 20000 ? 'High' : pending > 0 ? 'Medium' : 'Low' };
    });
    const totalFee = feeStudents.reduce((s, x) => s + x.total, 0);
    const collected = feeStudents.reduce((s, x) => s + x.paid, 0);
    const pending = totalFee - collected;
    const overdue = feeStudents.filter(s => s.pending > 0 && s.risk === 'High').reduce((s, x) => s + x.pending, 0);

    const sendReminder = async (phone, name) => {
        try {
            await axios.post(`${API}/send-message`, { phone, message: `Namaste ${name} ji, aapki fees ₹25,000 pending hai. AuraSync School AI` });
            showToast(`Reminder sent to ${name}`, 'success');
        } catch { showToast('Reminder failed', 'error'); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <Stat icon="💰" label="Total Fees" value={fmt(totalFee)} sub={`${converted.length} students`} color="#4e8ef7" />
                <Stat icon="✅" label="Collected" value={fmt(collected)} sub="Received" color="#00d97e" />
                <Stat icon="⏳" label="Pending" value={fmt(pending)} sub="Yet to collect" color="#f6c90e" />
                <Stat icon="🚨" label="Overdue" value={fmt(overdue)} sub="Urgent" color="#f45b69" />
            </div>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Fee Recovery Dashboard</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#0d1117' }}>{['Student', 'Total', 'Paid', 'Pending', 'Risk', 'Recovery %', 'Action'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>)}</tr></thead>
                    <tbody>
                        {feeStudents.map(s => {
                            const owed = s.total - s.paid;
                            const rc = s.risk === 'High' ? '#f45b69' : s.risk === 'Medium' ? '#f6c90e' : '#00d97e';
                            return (
                                <tr key={s.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                    <td style={{ padding: '12px 14px' }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</p><p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{s.parent_phone}</p></td>
                                    <td style={{ padding: '12px 14px', color: '#9ca3af', fontSize: 13 }}>{fmt(s.total)}</td>
                                    <td style={{ padding: '12px 14px', color: '#00d97e', fontSize: 13, fontWeight: 700 }}>{fmt(s.paid)}</td>
                                    <td style={{ padding: '12px 14px', color: owed > 0 ? '#f45b69' : '#6b7280', fontSize: 13, fontWeight: owed > 0 ? 700 : 400 }}>{owed > 0 ? fmt(owed) : '—'}</td>
                                    <td style={{ padding: '12px 14px' }}><Badge color={rc}>{s.risk}</Badge></td>
                                    <td style={{ padding: '12px 14px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 40, height: 5, background: '#1f2d3d', borderRadius: 3 }}><div style={{ width: `${s.recoveryProb}%`, height: '100%', background: '#4e8ef7', borderRadius: 3 }} /></div><span style={{ fontSize: 12, color: '#9ca3af' }}>{s.recoveryProb}%</span></div></td>
                                    <td style={{ padding: '12px 14px' }}>{owed > 0 && <Btn small color="#f6c90e" onClick={() => sendReminder(s.parent_phone, s.student_name)}>Remind</Btn>}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {feeStudents.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No converted students yet.</p>}
            </Card>
        </div>
    );
}

// ─── STUDENTS MODULE ──────────────────────────────────────────────────────────
function StudentsModule({ leads, onEditLead, showToast }) {
    const students = leads.filter(l => l.status === 'converted').map(l => {
        const seed = l.id ? l.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
        return { ...l, attendance: 65 + (seed % 35), performance: 50 + ((seed * 3) % 50), fees_paid: (seed % 3) !== 0, at_risk: (65 + (seed % 35)) < 70 || (seed % 3) === 0 };
    });
    const atRisk = students.filter(s => s.at_risk);
    const avgAtt = students.length ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / students.length) : 0;
    const avgPerf = students.length ? Math.round(students.reduce((a, s) => a + s.performance, 0) / students.length) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <Stat icon="👨‍🎓" label="Total Students" value={students.length} color="#4e8ef7" />
                <Stat icon="⚠️" label="At Risk" value={atRisk.length} color="#f45b69" sub="AI detected" />
                <Stat icon="📊" label="Avg Attendance" value={students.length ? `${avgAtt}%` : '—'} color="#00d97e" />
                <Stat icon="🏆" label="Avg Performance" value={students.length ? `${avgPerf}%` : '—'} color="#f6c90e" />
            </div>
            {atRisk.length > 0 && <AIInsightBox title="AI WEAK STUDENT ALERT" insights={atRisk.map(s => ({ urgent: true, text: `${s.student_name} — Attendance: ${s.attendance}%, Fees: ${s.fees_paid ? 'Paid' : 'PENDING'}` }))} />}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #1f2d3d' }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Student Profiles</p></div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#0d1117' }}>{['Student', 'Contact', 'Branch', 'Class', 'Attendance', 'Performance', 'Fees', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{h}</th>)}</tr></thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{s.student_name}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af' }}>{s.parent_phone}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af' }}>{s.branch}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#9ca3af' }}>{s.class || 'N/A'}</td>
                                <td style={{ padding: '12px 14px' }}><span style={{ color: s.attendance < 70 ? '#f45b69' : '#00d97e', fontWeight: 700, fontSize: 13 }}>{s.attendance}%</span></td>
                                <td style={{ padding: '12px 14px' }}><span style={{ color: s.performance < 60 ? '#f6c90e' : '#4e8ef7', fontWeight: 700, fontSize: 13 }}>{s.performance}%</span></td>
                                <td style={{ padding: '12px 14px' }}><Badge color={s.fees_paid ? '#00d97e' : '#f45b69'}>{s.fees_paid ? 'Paid' : 'Pending'}</Badge></td>
                                <td style={{ padding: '12px 14px' }}><Badge color={s.at_risk ? '#f45b69' : '#00d97e'}>{s.at_risk ? '⚠️ At Risk' : '✅ Good'}</Badge></td>
                                <td style={{ padding: '12px 14px' }}><Btn small color="#4e8ef7" outline onClick={() => onEditLead(s)}>✏️</Btn></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No converted students yet.</p>}
            </Card>
        </div>
    );
}

// ─── AUTOMATION / COMMS / INSIGHTS / SETTINGS / STATUS ───────────────────────
function AutomationEngine({ leads }) {
    const [running, setRunning] = useState({});
    const runFlow = async (key, label) => { setRunning(r => ({ ...r, [key]: true })); await new Promise(r => setTimeout(r, 1800)); setRunning(r => ({ ...r, [key]: false })); };
    const flows = [
        { key: 'new_lead', icon: '🆕', label: 'New Lead Welcome', desc: 'Sends instant WhatsApp greeting', trigger: 'Lead added', color: '#4e8ef7', count: leads.filter(l => l.status === 'new').length },
        { key: 'hot_call', icon: '🔥', label: 'Hot Lead Call Alert', desc: 'Notifies staff when score ≥ 80', trigger: 'Score ≥ 80', color: '#f45b69', count: leads.filter(l => computeScore(l) >= 80).length },
        { key: 'fee_remind', icon: '💸', label: 'Fee Reminder', desc: 'Sends reminder before due date', trigger: 'Daily 6 PM', color: '#f6c90e', count: 0 },
        { key: 'follow_up', icon: '📅', label: '48hr Follow-up', desc: 'Auto follow-up after 48 hours', trigger: '48hr no contact', color: '#00d97e', count: 0 },
        { key: 'dropout', icon: '⚠️', label: 'Dropout Alert', desc: 'Alerts when attendance < 70%', trigger: 'Attendance check', color: '#a78bfa', count: 0 },
        { key: 'weekly', icon: '📊', label: 'Weekly Report', desc: 'Analytics summary every Monday', trigger: 'Every Monday', color: '#f97316', count: 0 },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AIInsightBox title="AUTOMATION STATUS" insights={[{ urgent: false, text: `${leads.filter(l => l.status === 'new').length} new leads awaiting welcome message.` }, { urgent: true, text: `${leads.filter(l => computeScore(l) >= 80).length} hot leads need follow-up.` }]} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {flows.map(f => (
                    <Card key={f.key} style={{ border: `1px solid ${f.color}22` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div><span style={{ fontSize: 28 }}>{f.icon}</span><p style={{ margin: '8px 0 4px', fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{f.label}</p><p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{f.desc}</p><Badge color={f.color}>{f.trigger}</Badge></div>
                            {f.count > 0 && <span style={{ background: f.color + '22', color: f.color, fontWeight: 800, fontSize: 18, borderRadius: 10, padding: '4px 12px' }}>{f.count}</span>}
                        </div>
                        <Btn small color={f.color} style={{ marginTop: 12, width: '100%' }} onClick={() => runFlow(f.key, f.label)}>{running[f.key] ? '⏳ Running...' : '▶ Run Now'}</Btn>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function CommsSystem({ leads, showToast }) {
    const [msg, setMsg] = useState(''); const [target, setTarget] = useState('hot'); const [sending, setSending] = useState(false);
    const templates = [
        { label: 'Admission Follow-up', text: 'Namaste {name}, AuraSync School AI mein aapki seat available hai. Aaj enroll karein!' },
        { label: 'Fee Reminder', text: 'Namaste {name} ji, aapki fees pending hai. Aaj payment karein.' },
        { label: 'Welcome', text: '🎉 Welcome {name}! Aapka enrollment confirm. Kal 9 AM se class.' },
        { label: 'Result', text: 'Congratulations {name}! Aapka result bahut acha aaya. AuraSync School AI.' },
    ];
    const getTargets = () => { if (target === 'hot') return leads.filter(l => computeScore(l) >= 80); if (target === 'new') return leads.filter(l => l.status === 'new'); if (target === 'converted') return leads.filter(l => l.status === 'converted'); return leads; };
    const sendBulk = async () => {
        if (!msg) return showToast('Type a message first', 'error');
        const t = getTargets();
        if (!window.confirm(`Send to ${t.length} people?`)) return;
        setSending(true);
        try { await Promise.all(t.map(l => axios.post(`${API}/send-message`, { phone: l.parent_phone, message: msg.replace('{name}', l.student_name) }))); showToast(`${t.length} messages sent!`, 'success'); }
        catch { showToast('Some messages failed', 'error'); }
        setSending(false);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>Compose Message</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Select label="Send To" value={target} onChange={e => setTarget(e.target.value)} options={[{ value: 'hot', label: `🔥 Hot (${leads.filter(l => computeScore(l) >= 80).length})` }, { value: 'new', label: `🆕 New (${leads.filter(l => l.status === 'new').length})` }, { value: 'converted', label: `✅ Converted (${leads.filter(l => l.status === 'converted').length})` }, { value: 'all', label: `📋 All (${leads.length})` }]} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Message</label><textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} placeholder="Use {name} for personalization" style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', resize: 'vertical' }} /></div>
                        <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>Recipients: <strong style={{ color: '#4e8ef7' }}>{getTargets().length}</strong></p>
                        <Btn color="#00d97e" onClick={sendBulk} style={{ width: '100%' }}>{sending ? '⏳ Sending...' : `🚀 Send to ${getTargets().length}`}</Btn>
                    </div>
                </Card>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>Templates</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {templates.map(t => (<div key={t.label} onClick={() => setMsg(t.text)} style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: 14, cursor: 'pointer' }}><p style={{ margin: '0 0 4px', fontWeight: 700, color: '#4e8ef7', fontSize: 13 }}>{t.label}</p><p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{t.text}</p></div>))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function InsightsModule({ leads }) {
    const branchData = BRANCHES.map(b => ({ branch: b, total: leads.filter(l => l.branch === b).length, converted: leads.filter(l => l.branch === b && l.status === 'converted').length })).map(b => ({ ...b, rate: b.total > 0 ? Math.round(b.converted / b.total * 100) : 0 }));
    const sourceData = SOURCES.map(s => ({ source: s, count: leads.filter(l => l.source === s).length, converted: leads.filter(l => l.source === s && l.status === 'converted').length }));
    const totalConverted = leads.filter(l => l.status === 'converted').length;
    const convRate = leads.length > 0 ? Math.round(totalConverted / leads.length * 100) : 0;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <Stat icon="📋" label="Total Leads" value={leads.length} color="#4e8ef7" />
                <Stat icon="🎓" label="Converted" value={totalConverted} color="#00d97e" />
                <Stat icon="📈" label="Conversion" value={`${convRate}%`} color="#f6c90e" />
                <Stat icon="💰" label="Revenue" value={fmt(totalConverted * 50000)} color="#f97316" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>📍 Branch Performance</p>
                    {branchData.map(b => (<div key={b.branch} style={{ marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600 }}>{b.branch}</span><span style={{ fontSize: 12, color: '#9ca3af' }}>{b.converted}/{b.total} ({b.rate}%)</span></div><div style={{ height: 8, background: '#1f2d3d', borderRadius: 4 }}><div style={{ width: `${b.rate || 0}%`, height: '100%', background: b.rate >= 50 ? '#00d97e' : b.rate >= 30 ? '#f6c90e' : '#f45b69', borderRadius: 4 }} /></div></div>))}
                </Card>
                <Card>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>🔎 Source Analysis</p>
                    {sourceData.map(s => (<div key={s.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1f2d3d' }}><span style={{ fontSize: 13, color: '#d1d5db' }}>{s.source}</span><div style={{ display: 'flex', gap: 12 }}><span style={{ fontSize: 12, color: '#6b7280' }}>{s.count}</span><Badge color={s.converted > 0 ? '#00d97e' : '#6b7280'}>{s.converted}</Badge></div></div>))}
                </Card>
            </div>
        </div>
    );
}

function SettingsModule() {
    const [role, setRole] = useState('admin');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card><p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>🔐 Roles</p><div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>{['admin', 'staff', 'accounts'].map(r => (<Btn key={r} small outline={role !== r} color="#4e8ef7" onClick={() => setRole(r)}>{r.charAt(0).toUpperCase() + r.slice(1)}</Btn>))}</div></Card>
                <Card><p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>⚙️ Config</p><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}><Input label="School Name" defaultValue="AuraSync School AI" /><Input label="API URL" defaultValue={API} /><Btn color="#4e8ef7">💾 Save</Btn></div></Card>
            </div>
        </div>
    );
}

function AutomationStatusModule({ leads }) {
    const logs = [
        { time: '10:30 AM', type: 'New Lead Welcome', status: 'Success', count: leads.filter(l => l.status === 'new').length },
        { time: '09:15 AM', type: 'Fee Reminder', status: 'Success', count: 12 },
        { time: 'Yesterday', type: 'Hot Lead Alert', status: 'Success', count: leads.filter(l => computeScore(l) >= 80).length },
    ];
    return (<Card><p style={{ margin: '0 0 20px', fontWeight: 700, color: '#f1f5f9' }}>📋 Logs</p><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#0d1117' }}>{['Time', 'Type', 'Status', 'Count'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700 }}>{h}</th>)}</tr></thead><tbody>{logs.map((l, i) => (<tr key={i} style={{ borderBottom: '1px solid #1f2d3d' }}><td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>{l.time}</td><td style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{l.type}</td><td style={{ padding: '12px 16px' }}><Badge color="#00d97e">✅ {l.status}</Badge></td><td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>{l.count}</td></tr>))}</tbody></table></Card>);
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function MainApp({ children }) {
    const [authed, setAuthed] = useState(() => { try { return localStorage.getItem('sd_crm_auth') === '1'; } catch { return false; } });
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('command');
    const [leads, setLeads] = useState([]);
    const [realFees, setRealFees] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [editingLead, setEditingLead] = useState(null);
    const [toast, setToast] = useState(null);
    const unsubRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, key: Date.now() });
    }, []);

    const startDataSync = useCallback(() => {
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
        const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
        unsubRef.current = onSnapshot(q, snapshot => { setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); }, err => console.error('Firestore:', err));
        const t = localStorage.getItem('aura_token');
        axios.get(`${API}/get-real-fees`, { headers: { Authorization: `Bearer ${t}` } }).then(r => setRealFees(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (authed) startDataSync();
        return () => { if (unsubRef.current) unsubRef.current(); };
    }, [authed, startDataSync]);

    const handleLogin = async (e) => {
        e?.preventDefault();
        if (!loginForm.email || !loginForm.password) { setLoginError('Email and password required'); return; }
        setLoading(true); setLoginError('');
        try {
            const res = await axios.post(`${API}/api/auth/login`, { email: loginForm.email, password: loginForm.password });
            localStorage.setItem("aura_token", res.data.token);
            localStorage.setItem("sd_crm_auth", "1");
            localStorage.setItem("user_data", JSON.stringify(res.data.user));
            setAuthed(true);
        } catch (err) { setLoginError(err.response?.data?.error || "Login Failed"); }
        finally { setLoading(false); }
    };

    const handleLogout = () => {
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
        try { localStorage.removeItem('sd_crm_auth'); localStorage.removeItem('aura_token'); localStorage.removeItem('user_data'); } catch { }
        setLeads([]); setRealFees([]); setLoginForm({ email: '', password: '' }); setLoginError(''); setAuthed(false);
    };

    const sendCampaign = async (type) => {
        const targets = type === 'hot' ? leads.filter(l => computeScore(l) >= 80) : leads.filter(l => l.status === 'converted');
        if (!targets.length) return showToast('No targets found', 'warning');
        if (!window.confirm(`Send to ${targets.length}?`)) return;
        try { await axios.post(`${API}/send-bulk-campaign`, { targets: targets.map(l => ({ phone: l.parent_phone, name: l.student_name })), type }); showToast(`${targets.length} sent!`, 'success'); }
        catch { showToast('Campaign failed', 'error'); }
    };

    const activeLeadsCount = leads.filter(l => computeScore(l) >= 80).length;

    if (!authed) {
        return (
            <RBACProvider>
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', fontFamily: "'Segoe UI', sans-serif" }}>
                    <div style={{ background: '#111827', border: `1px solid ${loginError ? '#f45b69' : '#1f2d3d'}`, borderRadius: 24, padding: '48px 40px', textAlign: 'center', width: 400, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
                        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#4e8ef7,#a78bfa)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>🧠</div>
                        <h1 style={{ margin: '0 0 6px', color: '#f1f5f9', fontSize: 24, fontWeight: 900 }}>AuraSync School AI</h1>
                        <p style={{ margin: '0 0 28px', color: '#6b7280', fontSize: 13 }}>School Operating System v3.0</p>
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input type="email" placeholder="Email Address" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} style={{ width: '100%', padding: '14px 16px', fontSize: 14, background: '#0d1117', border: `1px solid ${loginError ? '#f45b69' : '#1f2d3d'}`, borderRadius: 12, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }} />
                            <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', padding: '14px 16px', fontSize: 14, background: '#0d1117', border: `1px solid ${loginError ? '#f45b69' : '#1f2d3d'}`, borderRadius: 12, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }} />
                            {loginError && <p style={{ color: '#f45b69', fontSize: 12, margin: 0, fontWeight: 700 }}>❌ {loginError}</p>}
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#374151' : '#4e8ef7', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? '⏳ Authenticating...' : '🔓 Login'}</button>
                        </form>
                    </div>
                </div>
                {children}
            </RBACProvider>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'command': return <><CommandCenter leads={leads} onSendCampaign={sendCampaign} /><AIBrainDashboard /></>;
            case 'admissions': return <AdmissionsEngine leads={leads} onEditLead={setEditingLead} showToast={showToast} />;
            case 'students': return <><StudentsModule leads={leads} onEditLead={setEditingLead} showToast={showToast} /><MultiApp /></>;
            case 'staff': return <StaffModule token={localStorage.getItem('aura_token')} API={API} showToast={showToast} />;
            case 'results': return <ResultPDFModule leads={leads} showToast={showToast} />;
            case 'fees': return <FeesEngine leads={leads} realFees={realFees} showToast={showToast} />;
            case 'automation': return <AutomationEngine leads={leads} />;
            case 'automation_status': return <AutomationStatusModule leads={leads} />;
            case 'comms': return <CommsSystem leads={leads} showToast={showToast} />;
            case 'insights': return <><InsightsModule leads={leads} /><RealtimeDashboard /></>;
            case 'settings': return <SettingsModule />;
            case 'timetable': return <TimetableOptimizer />;
            case 'transport': return <TransportApp />;
            case 'marketplace': return <ModularMarketplace />;
            case 'documents': return <DocsManager userRole="admin" schoolId="AuraIndore_01" />;
            case 'roles': return <RBACProvider><Card><p style={{ margin: '0 0 16px', fontWeight: 700, color: '#f1f5f9' }}>🔐 RBAC Active</p><p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>Role-based access control is protecting routes.</p></Card></RBACProvider>;
            case 'attendance': return <Attendance />;
            case 'exams': return <ExamScheduler />;
            case 'noticeboard': return <NoticeBoard />;
            case 'homework': return <HomeworkTracker />;
            case 'calendar': return <AcademicCalendar />;
            case 'library': return <LibraryManagement />;
            case 'parentportal': return <ParentPortal />;
            case 'auditlogs': return <AuditLogs />;
            case 'adminpanel': return <RBACProvider><AdminPanel /></RBACProvider>;
            case 'automationdash': return <AutomationDashboard />;
            default: return <CommandCenter leads={leads} onSendCampaign={sendCampaign} />;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117', fontFamily: "'Segoe UI', sans-serif", color: '#f1f5f9' }}>
            {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} showToast={showToast} />}
            {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div style={{ width: sidebarOpen ? 240 : 68, background: '#111827', borderRight: '1px solid #1f2d3d', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100, transition: 'width .25s', overflow: 'hidden' }}>
                <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f2d3d', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#4e8ef7,#a78bfa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🧠</div>
                    {sidebarOpen && <div><p style={{ margin: 0, fontWeight: 900, color: '#f1f5f9', fontSize: 15 }}>AuraSync School</p><p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>AI Operating System</p></div>}
                </div>
                <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        const hasBadge = tab.id === 'command' && activeLeadsCount > 0;
                        return (
                            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: isActive ? '#1f2d3d' : 'transparent', color: isActive ? '#4e8ef7' : '#9ca3af', fontWeight: isActive ? 700 : 500, fontSize: 13, transition: 'all .15s' }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{tab.icon}</span>
                                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>}
                                {hasBadge && <span style={{ marginLeft: 'auto', background: '#f45b69', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>{activeLeadsCount}</span>}
                            </div>
                        );
                    })}
                </nav>
                <div style={{ padding: '12px 8px', borderTop: '1px solid #1f2d3d' }}>
                    <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#6b7280', fontSize: 13 }}><span style={{ fontSize: 18 }}>{sidebarOpen ? '◀' : '▶'}</span>{sidebarOpen && <span>Collapse</span>}</div>
                    <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', color: '#f45b69', fontSize: 13 }}><span style={{ fontSize: 18 }}>🚪</span>{sidebarOpen && <span>Logout</span>}</div>
                </div>
            </div>

            <div style={{ marginLeft: sidebarOpen ? 240 : 68, flex: 1, padding: '32px', transition: 'margin .25s', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#f1f5f9' }}>{TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}</h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{leads.length} leads · {leads.filter(l => l.status === 'converted').length} converted · Live Sync</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111827', border: '1px solid #1f2d3d', borderRadius: 20, padding: '6px 14px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d97e', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Live</span>
                    </div>
                </div>
                {renderTabContent()}
            </div>

            <style>{`
                *{box-sizing:border-box}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
                @keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                ::-webkit-scrollbar{width:6px;height:6px}
                ::-webkit-scrollbar-track{background:#0d1117}
                ::-webkit-scrollbar-thumb{background:#1f2d3d;border-radius:4px}
                button:hover:not(:disabled){opacity:.88}
                input::placeholder,textarea::placeholder{color:#374151}
            `}</style>
        </div>
    );
}