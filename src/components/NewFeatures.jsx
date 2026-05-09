// ═══════════════════════════════════════════════════════════════
// AuraSync School AI — New Features Components
// File: src/components/NewFeatures.jsx
// Contains: 14 components for Infrastructure, Finance, Sports
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d', bg: '#0d1117' };
const token = () => localStorage.getItem('aura_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });
const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// ─── SHARED UI ────────────────────────────────────────────────────
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
const Inp = ({ label, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</label>}
        <input {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', ...props.style }} />
    </div>
);
const Sel = ({ label, options, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {label && <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{label}</label>}
        <select {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', ...props.style }}>
            {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
    </div>
);
const Btn = ({ children, color = '#4e8ef7', small, danger, outline, ...props }) => {
    const c = danger ? '#f45b69' : color;
    return (
        <button {...props} style={{ padding: small ? '7px 14px' : '10px 20px', background: outline ? 'transparent' : c, border: outline ? `1.5px solid ${c}` : 'none', borderRadius: 10, color: outline ? c : '#fff', fontWeight: 700, fontSize: small ? 12 : 14, cursor: 'pointer', ...props.style }}>
            {children}
        </button>
    );
};
const Badge = ({ children, color }) => (
    <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{children}</span>
);
const Grid = ({ children, cols = 'repeat(auto-fit, minmax(180px, 1fr))' }) => (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 14 }}>{children}</div>
);
const Table = ({ headers: hs, children, empty }) => (
    <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: C.bg }}>{hs.map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
            <tbody>{children}</tbody>
        </table>
        {empty}
    </div>
);
const TR = ({ children }) => <tr style={{ borderBottom: `1px solid ${C.border}` }}>{children}</tr>;
const TD = ({ children, style = {} }) => <td style={{ padding: '12px 14px', fontSize: 13, color: '#d1d5db', ...style }}>{children}</td>;

const useData = (url) => {
    const [data, setData] = useState([]);
    const load = () => axios.get(`${API}${url}`, { headers: headers() }).then(r => setData(r.data)).catch(() => { });
    useEffect(() => { load(); }, []);
    return [data, setData, load];
};

const FormPanel = ({ title, color = '#4e8ef7', onSubmit, children, submitLabel = '💾 Save' }) => (
    <Card style={{ border: `1px solid ${color}44` }}>
        <p style={{ margin: '0 0 16px', fontWeight: 700, color }}>{title}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        <div style={{ marginTop: 16 }}><Btn color={color} onClick={onSubmit}>{submitLabel}</Btn></div>
    </Card>
);

// ════════════════════════════════════════════════════════════════
// 1. LAB MANAGEMENT
// ════════════════════════════════════════════════════════════════
export function LabManagement() {
    const [labs, , reload] = useData('/api/labs');
    const [bookings, , reloadB] = useData('/api/lab-bookings');
    const [tab, setTab] = useState('labs');
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ lab_name: '', lab_type: 'Computer', capacity: 30, location: '', incharge_name: '', equipment_count: 0 });
    const [bookForm, setBookForm] = useState({ lab_id: '', class: '1st', subject: '', teacher_name: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
    const f = v => setForm(p => ({ ...p, ...v }));
    const bf = v => setBookForm(p => ({ ...p, ...v }));
    const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const LAB_TYPES = ['Computer', 'Science', 'Physics', 'Chemistry', 'Biology', 'Language', 'Math', 'Other'];

    const save = async () => {
        await axios.post(`${API}/api/labs`, form, { headers: headers() });
        reload(); setAdding(false); setForm({ lab_name: '', lab_type: 'Computer', capacity: 30, location: '', incharge_name: '', equipment_count: 0 });
    };
    const book = async () => {
        await axios.post(`${API}/api/lab-bookings`, bookForm, { headers: headers() });
        reloadB(); setBookForm({ lab_id: '', class: '1st', subject: '', teacher_name: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
    };
    const del = async (id) => { await axios.delete(`${API}/api/labs/${id}`, { headers: headers() }); reload(); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🔬" label="Total Labs" value={labs.length} color="#4e8ef7" />
                <StatCard icon="✅" label="Active" value={labs.filter(l => l.status === 'active').length} color="#00d97e" />
                <StatCard icon="🔧" label="Maintenance" value={labs.filter(l => l.status === 'maintenance').length} color="#f6c90e" />
                <StatCard icon="📅" label="Today Bookings" value={bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                {['labs', 'bookings'].map(t => <Btn key={t} color="#4e8ef7" outline={tab !== t} onClick={() => setTab(t)}>{t === 'labs' ? '🔬 Labs' : '📅 Bookings'}</Btn>)}
                <Btn color="#00d97e" onClick={() => setAdding(!adding)} style={{ marginLeft: 'auto' }}>{adding ? '✕ Cancel' : '+ Add Lab'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🔬 Add Lab" color="#4e8ef7" onSubmit={save}>
                    <Grid><Inp label="Lab Name" value={form.lab_name} onChange={e => f({ lab_name: e.target.value })} /><Sel label="Type" value={form.lab_type} onChange={e => f({ lab_type: e.target.value })} options={LAB_TYPES} /><Inp label="Capacity" type="number" value={form.capacity} onChange={e => f({ capacity: e.target.value })} /><Inp label="Location" value={form.location} onChange={e => f({ location: e.target.value })} /><Inp label="Incharge" value={form.incharge_name} onChange={e => f({ incharge_name: e.target.value })} /><Inp label="Equipment Count" type="number" value={form.equipment_count} onChange={e => f({ equipment_count: e.target.value })} /></Grid>
                </FormPanel>
            )}
            {tab === 'labs' && (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🔬 Lab Directory</p></div>
                    <Table headers={['Lab Name', 'Type', 'Capacity', 'Incharge', 'Equipment', 'Status', 'Actions']}>
                        {labs.map(l => <TR key={l.id}><TD style={{ fontWeight: 700, color: '#f1f5f9' }}>{l.lab_name}</TD><TD>{l.lab_type}</TD><TD>{l.capacity}</TD><TD>{l.incharge_name}</TD><TD>{l.equipment_count}</TD><TD><Badge color={l.status === 'active' ? '#00d97e' : '#f6c90e'}>{l.status}</Badge></TD><TD><Btn small danger outline onClick={() => del(l.id)}>🗑️</Btn></TD></TR>)}
                    </Table>
                    {labs.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No labs added yet.</p>}
                </Card>
            )}
            {tab === 'bookings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormPanel title="📅 Book a Lab" color="#a78bfa" onSubmit={book} submitLabel="📅 Book">
                        <Grid>
                            <Sel label="Select Lab" value={bookForm.lab_id} onChange={e => bf({ lab_id: e.target.value })} options={[{ value: '', label: 'Select...' }, ...labs.map(l => ({ value: l.id, label: l.lab_name }))]} />
                            <Sel label="Class" value={bookForm.class} onChange={e => bf({ class: e.target.value })} options={CLASSES} />
                            <Inp label="Subject" value={bookForm.subject} onChange={e => bf({ subject: e.target.value })} />
                            <Inp label="Teacher" value={bookForm.teacher_name} onChange={e => bf({ teacher_name: e.target.value })} />
                            <Inp label="Date" type="date" value={bookForm.booking_date} onChange={e => bf({ booking_date: e.target.value })} />
                            <Inp label="Start Time" type="time" value={bookForm.start_time} onChange={e => bf({ start_time: e.target.value })} />
                            <Inp label="End Time" type="time" value={bookForm.end_time} onChange={e => bf({ end_time: e.target.value })} />
                            <Inp label="Purpose" value={bookForm.purpose} onChange={e => bf({ purpose: e.target.value })} />
                        </Grid>
                    </FormPanel>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📋 All Bookings</p></div>
                        <Table headers={['Lab', 'Class', 'Subject', 'Teacher', 'Date', 'Time', 'Status']}>
                            {bookings.map(b => <TR key={b.id}><TD style={{ fontWeight: 700, color: '#f1f5f9' }}>{b.lab_name || `Lab #${b.lab_id}`}</TD><TD>{b.class}</TD><TD>{b.subject}</TD><TD>{b.teacher_name}</TD><TD>{b.booking_date}</TD><TD>{b.start_time} – {b.end_time}</TD><TD><Badge color="#4e8ef7">{b.status}</Badge></TD></TR>)}
                        </Table>
                        {bookings.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No bookings yet.</p>}
                    </Card>
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 2. FURNITURE / ASSETS
// ════════════════════════════════════════════════════════════════
export function FurnitureAssets() {
    const [assets, , reload] = useData('/api/assets?category=Furniture');
    const [all, , reloadAll] = useData('/api/assets');
    const [adding, setAdding] = useState(false);
    const [filterCat, setFilterCat] = useState('All');
    const CATS = ['All', 'Furniture', 'Sports', 'Lab', 'Kitchen', 'Library', 'Vehicle', 'Other'];
    const CONDITIONS = ['Good', 'Fair', 'Poor', 'Condemned'];
    const [form, setForm] = useState({ asset_name: '', asset_code: '', category: 'Furniture', purchase_date: '', purchase_price: '', location: '', assigned_to: '', condition_status: 'Good', warranty_until: '', vendor_name: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/assets`, form, { headers: headers() });
        reloadAll(); setAdding(false);
    };
    const del = async (id) => { await axios.delete(`${API}/api/assets/${id}`, { headers: headers() }); reloadAll(); };

    const filtered = filterCat === 'All' ? all : all.filter(a => a.category === filterCat);
    const totalValue = all.reduce((s, a) => s + Number(a.current_value || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🪑" label="Total Assets" value={all.length} color="#4e8ef7" />
                <StatCard icon="💰" label="Total Value" value={fmt(totalValue)} color="#00d97e" />
                <StatCard icon="⚠️" label="Poor Condition" value={all.filter(a => a.condition_status === 'Poor' || a.condition_status === 'Condemned').length} color="#f45b69" />
                <StatCard icon="🏷️" label="Furniture" value={all.filter(a => a.category === 'Furniture').length} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {CATS.map(c => <Btn key={c} small color="#4e8ef7" outline={filterCat !== c} onClick={() => setFilterCat(c)}>{c}</Btn>)}
                <Btn color="#00d97e" onClick={() => setAdding(!adding)} style={{ marginLeft: 'auto' }}>{adding ? '✕ Cancel' : '+ Add Asset'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🪑 Add Asset" color="#4e8ef7" onSubmit={save}>
                    <Grid>
                        <Inp label="Asset Name" value={form.asset_name} onChange={e => f({ asset_name: e.target.value })} />
                        <Inp label="Asset Code" value={form.asset_code} onChange={e => f({ asset_code: e.target.value })} placeholder="e.g. FUR-001" />
                        <Sel label="Category" value={form.category} onChange={e => f({ category: e.target.value })} options={CATS.filter(c => c !== 'All')} />
                        <Inp label="Purchase Date" type="date" value={form.purchase_date} onChange={e => f({ purchase_date: e.target.value })} />
                        <Inp label="Purchase Price (₹)" type="number" value={form.purchase_price} onChange={e => f({ purchase_price: e.target.value })} />
                        <Inp label="Location" value={form.location} onChange={e => f({ location: e.target.value })} />
                        <Inp label="Assigned To" value={form.assigned_to} onChange={e => f({ assigned_to: e.target.value })} />
                        <Sel label="Condition" value={form.condition_status} onChange={e => f({ condition_status: e.target.value })} options={CONDITIONS} />
                        <Inp label="Warranty Until" type="date" value={form.warranty_until} onChange={e => f({ warranty_until: e.target.value })} />
                        <Inp label="Vendor Name" value={form.vendor_name} onChange={e => f({ vendor_name: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🪑 Asset Register ({filtered.length})</p></div>
                <Table headers={['Asset', 'Code', 'Category', 'Location', 'Assigned To', 'Value', 'Condition', 'Actions']}>
                    {filtered.map(a => <TR key={a.id}><TD style={{ fontWeight: 700, color: '#f1f5f9' }}>{a.asset_name}</TD><TD style={{ color: '#6b7280' }}>{a.asset_code}</TD><TD>{a.category}</TD><TD>{a.location}</TD><TD>{a.assigned_to || '—'}</TD><TD style={{ color: '#00d97e' }}>{fmt(a.current_value)}</TD><TD><Badge color={a.condition_status === 'Good' ? '#00d97e' : a.condition_status === 'Fair' ? '#f6c90e' : '#f45b69'}>{a.condition_status}</Badge></TD><TD><Btn small danger outline onClick={() => del(a.id)}>🗑️</Btn></TD></TR>)}
                </Table>
                {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No assets found.</p>}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 3. IT ASSETS
// ════════════════════════════════════════════════════════════════
export function ITAssets() {
    const [items, , reload] = useData('/api/it-assets');
    const [adding, setAdding] = useState(false);
    const TYPES = ['Desktop', 'Laptop', 'Tablet', 'Printer', 'Projector', 'Server', 'Router', 'Switch', 'Camera', 'Other'];
    const [form, setForm] = useState({ device_name: '', device_type: 'Desktop', brand: '', model: '', serial_number: '', ip_address: '', os_name: '', purchase_date: '', purchase_price: '', assigned_to: '', location: '', next_service_date: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/it-assets`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const del = async (id) => { await axios.delete(`${API}/api/it-assets/${id}`, { headers: headers() }); reload(); };

    const active = items.filter(i => i.status === 'active').length;
    const repair = items.filter(i => i.status === 'repair').length;
    const totalValue = items.reduce((s, i) => s + Number(i.purchase_price || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="💻" label="Total Devices" value={items.length} color="#4e8ef7" />
                <StatCard icon="✅" label="Active" value={active} color="#00d97e" />
                <StatCard icon="🔧" label="In Repair" value={repair} color="#f6c90e" />
                <StatCard icon="💰" label="Total Value" value={fmt(totalValue)} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#00d97e" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ Add Device'}</Btn>
            </div>
            {adding && (
                <FormPanel title="💻 Add IT Asset" color="#4e8ef7" onSubmit={save}>
                    <Grid>
                        <Inp label="Device Name" value={form.device_name} onChange={e => f({ device_name: e.target.value })} />
                        <Sel label="Type" value={form.device_type} onChange={e => f({ device_type: e.target.value })} options={TYPES} />
                        <Inp label="Brand" value={form.brand} onChange={e => f({ brand: e.target.value })} />
                        <Inp label="Model" value={form.model} onChange={e => f({ model: e.target.value })} />
                        <Inp label="Serial Number" value={form.serial_number} onChange={e => f({ serial_number: e.target.value })} />
                        <Inp label="IP Address" value={form.ip_address} onChange={e => f({ ip_address: e.target.value })} />
                        <Inp label="OS" value={form.os_name} onChange={e => f({ os_name: e.target.value })} placeholder="e.g. Windows 11" />
                        <Inp label="Purchase Date" type="date" value={form.purchase_date} onChange={e => f({ purchase_date: e.target.value })} />
                        <Inp label="Price (₹)" type="number" value={form.purchase_price} onChange={e => f({ purchase_price: e.target.value })} />
                        <Inp label="Assigned To" value={form.assigned_to} onChange={e => f({ assigned_to: e.target.value })} />
                        <Inp label="Location" value={form.location} onChange={e => f({ location: e.target.value })} />
                        <Inp label="Next Service Date" type="date" value={form.next_service_date} onChange={e => f({ next_service_date: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>💻 IT Asset Register</p></div>
                <Table headers={['Device', 'Type', 'Brand/Model', 'Serial No.', 'IP', 'Assigned', 'Location', 'Status', 'Actions']}>
                    {items.map(i => <TR key={i.id}><TD style={{ fontWeight: 700, color: '#f1f5f9' }}>{i.device_name}</TD><TD>{i.device_type}</TD><TD style={{ color: '#9ca3af' }}>{i.brand} {i.model}</TD><TD style={{ color: '#6b7280', fontSize: 11 }}>{i.serial_number}</TD><TD style={{ color: '#4e8ef7', fontSize: 11 }}>{i.ip_address || '—'}</TD><TD>{i.assigned_to || '—'}</TD><TD>{i.location}</TD><TD><Badge color={i.status === 'active' ? '#00d97e' : i.status === 'repair' ? '#f6c90e' : '#f45b69'}>{i.status}</Badge></TD><TD><Btn small danger outline onClick={() => del(i.id)}>🗑️</Btn></TD></TR>)}
                </Table>
                {items.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No IT assets added yet.</p>}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 4. MAINTENANCE REQUESTS
// ════════════════════════════════════════════════════════════════
export function MaintenanceRequests() {
    const [requests, , reload] = useData('/api/maintenance');
    const [adding, setAdding] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const CATS = ['Electrical', 'Plumbing', 'Civil', 'IT', 'Furniture', 'Cleaning', 'Other'];
    const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
    const [form, setForm] = useState({ title: '', description: '', category: 'Other', priority: 'Medium', location: '', reported_by: '', assigned_to: '', estimated_cost: '', due_date: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/maintenance`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/maintenance/${id}`, { status }, { headers: headers() });
        reload();
    };
    const del = async (id) => { await axios.delete(`${API}/api/maintenance/${id}`, { headers: headers() }); reload(); };

    const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);
    const pending = requests.filter(r => r.status === 'pending').length;
    const critical = requests.filter(r => r.priority === 'Critical').length;

    const priorityColor = p => ({ Low: '#6b7280', Medium: '#f6c90e', High: '#f97316', Critical: '#f45b69' }[p] || '#6b7280');
    const statusColor = s => ({ pending: '#f6c90e', in_progress: '#4e8ef7', completed: '#00d97e', cancelled: '#6b7280' }[s] || '#6b7280');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🔧" label="Total" value={requests.length} color="#4e8ef7" />
                <StatCard icon="⏳" label="Pending" value={pending} color="#f6c90e" />
                <StatCard icon="🚨" label="Critical" value={critical} color="#f45b69" />
                <StatCard icon="✅" label="Completed" value={requests.filter(r => r.status === 'completed').length} color="#00d97e" />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {['all', 'pending', 'in_progress', 'completed'].map(s => <Btn key={s} small color="#4e8ef7" outline={filterStatus !== s} onClick={() => setFilterStatus(s)}>{s === 'all' ? 'All' : s.replace('_', ' ')}</Btn>)}
                <Btn color="#f45b69" onClick={() => setAdding(!adding)} style={{ marginLeft: 'auto' }}>{adding ? '✕ Cancel' : '🚨 New Request'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🔧 New Maintenance Request" color="#f45b69" onSubmit={save} submitLabel="🚨 Submit">
                    <Grid>
                        <Inp label="Title" value={form.title} onChange={e => f({ title: e.target.value })} />
                        <Sel label="Category" value={form.category} onChange={e => f({ category: e.target.value })} options={CATS} />
                        <Sel label="Priority" value={form.priority} onChange={e => f({ priority: e.target.value })} options={PRIORITIES} />
                        <Inp label="Location" value={form.location} onChange={e => f({ location: e.target.value })} />
                        <Inp label="Reported By" value={form.reported_by} onChange={e => f({ reported_by: e.target.value })} />
                        <Inp label="Assigned To" value={form.assigned_to} onChange={e => f({ assigned_to: e.target.value })} />
                        <Inp label="Estimated Cost (₹)" type="number" value={form.estimated_cost} onChange={e => f({ estimated_cost: e.target.value })} />
                        <Inp label="Due Date" type="date" value={form.due_date} onChange={e => f({ due_date: e.target.value })} />
                    </Grid>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Description</label>
                        <textarea value={form.description} onChange={e => f({ description: e.target.value })} rows={3}
                            style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                    </div>
                </FormPanel>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.map(r => (
                    <Card key={r.id} style={{ border: `1px solid ${priorityColor(r.priority)}44` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>{r.title}</p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{r.category} · {r.location}</p>
                            </div>
                            <Badge color={priorityColor(r.priority)}>{r.priority}</Badge>
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af' }}>{r.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: '#6b7280' }}>By: {r.reported_by} · Est: {fmt(r.estimated_cost)}</span>
                            <Badge color={statusColor(r.status)}>{r.status.replace('_', ' ')}</Badge>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {r.status === 'pending' && <Btn small color="#4e8ef7" onClick={() => updateStatus(r.id, 'in_progress')}>▶ Start</Btn>}
                            {r.status === 'in_progress' && <Btn small color="#00d97e" onClick={() => updateStatus(r.id, 'completed')}>✅ Done</Btn>}
                            <Btn small danger outline onClick={() => del(r.id)}>🗑️</Btn>
                        </div>
                    </Card>
                ))}
                {filtered.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No requests found.</p>}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 5. ROOM / CLASSROOM MANAGEMENT
// ════════════════════════════════════════════════════════════════
export function RoomManagement() {
    const [rooms, , reload] = useData('/api/rooms');
    const [adding, setAdding] = useState(false);
    const CLASSES = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const ROOM_TYPES = ['Classroom', 'Lab', 'Office', 'Library', 'Hall', 'Sports', 'Canteen', 'Hostel', 'Other'];
    const [form, setForm] = useState({ room_number: '', room_name: '', room_type: 'Classroom', floor: '', building: 'Main Block', capacity: 40, has_projector: false, has_ac: false, has_smartboard: false, assigned_class: '', class_teacher: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/rooms`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const del = async (id) => { await axios.delete(`${API}/api/rooms/${id}`, { headers: headers() }); reload(); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🏫" label="Total Rooms" value={rooms.length} color="#4e8ef7" />
                <StatCard icon="🎓" label="Classrooms" value={rooms.filter(r => r.room_type === 'Classroom').length} color="#00d97e" />
                <StatCard icon="📽️" label="With Projector" value={rooms.filter(r => r.has_projector).length} color="#a78bfa" />
                <StatCard icon="❄️" label="With AC" value={rooms.filter(r => r.has_ac).length} color="#4e8ef7" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#00d97e" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ Add Room'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🏫 Add Room" color="#4e8ef7" onSubmit={save}>
                    <Grid>
                        <Inp label="Room Number" value={form.room_number} onChange={e => f({ room_number: e.target.value })} placeholder="e.g. 101" />
                        <Inp label="Room Name" value={form.room_name} onChange={e => f({ room_name: e.target.value })} placeholder="e.g. Science Room" />
                        <Sel label="Type" value={form.room_type} onChange={e => f({ room_type: e.target.value })} options={ROOM_TYPES} />
                        <Inp label="Floor" value={form.floor} onChange={e => f({ floor: e.target.value })} placeholder="e.g. Ground, 1st" />
                        <Inp label="Building" value={form.building} onChange={e => f({ building: e.target.value })} />
                        <Inp label="Capacity" type="number" value={form.capacity} onChange={e => f({ capacity: e.target.value })} />
                        <Sel label="Assigned Class" value={form.assigned_class} onChange={e => f({ assigned_class: e.target.value })} options={CLASSES} />
                        <Inp label="Class Teacher" value={form.class_teacher} onChange={e => f({ class_teacher: e.target.value })} />
                    </Grid>
                    <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                        {[['has_projector', '📽️ Projector'], ['has_ac', '❄️ AC'], ['has_smartboard', '📱 Smart Board']].map(([key, label]) => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d1d5db', fontSize: 13, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form[key]} onChange={e => f({ [key]: e.target.checked })} />
                                {label}
                            </label>
                        ))}
                    </div>
                </FormPanel>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {rooms.map(r => (
                    <Card key={r.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div><p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 16 }}>Room {r.room_number}</p><p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{r.room_name} · {r.building}</p></div>
                            <Badge color="#4e8ef7">{r.room_type}</Badge>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                            {[['👥 Capacity', r.capacity], ['📚 Class', r.assigned_class || '—'], ['👩‍🏫 Teacher', r.class_teacher || '—'], ['📍 Floor', r.floor || '—']].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: '#6b7280' }}>{l}</span><span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 600 }}>{v}</span></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            {r.has_projector && <Badge color="#a78bfa">📽️ Projector</Badge>}
                            {r.has_ac && <Badge color="#4e8ef7">❄️ AC</Badge>}
                            {r.has_smartboard && <Badge color="#00d97e">📱 Smart Board</Badge>}
                        </div>
                        <Btn small danger outline onClick={() => del(r.id)}>🗑️ Remove</Btn>
                    </Card>
                ))}
                {rooms.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No rooms added yet.</p>}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 6. FEE CONCESSION / DISCOUNT
// ════════════════════════════════════════════════════════════════
export function FeeConcession() {
    const [concessions, , reload] = useData('/api/fee-concessions');
    const [adding, setAdding] = useState(false);
    const TYPES = ['Merit', 'Sports', 'Staff Ward', 'RTE', 'BPL', 'Sibling', 'Management', 'Other'];
    const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', concession_type: 'Merit', concession_percent: '', original_fee: '', reason: '', approved_by: '', valid_from: '', valid_until: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/fee-concessions`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/fee-concessions/${id}/status`, { status }, { headers: headers() });
        reload();
    };
    const del = async (id) => { await axios.delete(`${API}/api/fee-concessions/${id}`, { headers: headers() }); reload(); };

    const totalSaved = concessions.filter(c => c.status === 'approved').reduce((s, c) => s + Number(c.concession_amount || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🏷️" label="Total" value={concessions.length} color="#4e8ef7" />
                <StatCard icon="✅" label="Approved" value={concessions.filter(c => c.status === 'approved').length} color="#00d97e" />
                <StatCard icon="⏳" label="Pending" value={concessions.filter(c => c.status === 'pending').length} color="#f6c90e" />
                <StatCard icon="💰" label="Total Concession" value={fmt(totalSaved)} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#00d97e" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ Apply Concession'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🏷️ Fee Concession Application" color="#4e8ef7" onSubmit={save}>
                    <Grid>
                        <Inp label="Student ID" value={form.student_id} onChange={e => f({ student_id: e.target.value })} />
                        <Inp label="Student Name" value={form.student_name} onChange={e => f({ student_name: e.target.value })} />
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Sel label="Concession Type" value={form.concession_type} onChange={e => f({ concession_type: e.target.value })} options={TYPES} />
                        <Inp label="Original Fee (₹)" type="number" value={form.original_fee} onChange={e => f({ original_fee: e.target.value })} />
                        <Inp label="Concession %" type="number" value={form.concession_percent} onChange={e => f({ concession_percent: e.target.value })} />
                        <Inp label="Approved By" value={form.approved_by} onChange={e => f({ approved_by: e.target.value })} />
                        <Inp label="Valid From" type="date" value={form.valid_from} onChange={e => f({ valid_from: e.target.value })} />
                        <Inp label="Valid Until" type="date" value={form.valid_until} onChange={e => f({ valid_until: e.target.value })} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Reason</label>
                            <input value={form.reason} onChange={e => f({ reason: e.target.value })} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none' }} />
                        </div>
                    </Grid>
                    {form.original_fee && form.concession_percent && (
                        <div style={{ padding: 14, background: '#00d97e11', borderRadius: 10, border: '1px solid #00d97e33' }}>
                            <p style={{ margin: 0, color: '#00d97e', fontWeight: 700 }}>Concession: {fmt(form.original_fee * form.concession_percent / 100)} · Final Fee: {fmt(form.original_fee - (form.original_fee * form.concession_percent / 100))}</p>
                        </div>
                    )}
                </FormPanel>
            )}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>🏷️ Concession Register</p></div>
                <Table headers={['Student', 'Class', 'Type', 'Original', 'Discount', 'Final', 'Status', 'Actions']}>
                    {concessions.map(c => <TR key={c.id}><TD style={{ fontWeight: 700, color: '#f1f5f9' }}>{c.student_name}</TD><TD>{c.class}</TD><TD>{c.concession_type}</TD><TD>{fmt(c.original_fee)}</TD><TD style={{ color: '#f45b69' }}>{c.concession_percent}% ({fmt(c.concession_amount)})</TD><TD style={{ color: '#00d97e', fontWeight: 700 }}>{fmt(c.final_fee)}</TD><TD><Badge color={c.status === 'approved' ? '#00d97e' : c.status === 'pending' ? '#f6c90e' : '#f45b69'}>{c.status}</Badge></TD>
                        <TD><div style={{ display: 'flex', gap: 6 }}>{c.status === 'pending' && <><Btn small color="#00d97e" onClick={() => updateStatus(c.id, 'approved')}>✅</Btn><Btn small danger onClick={() => updateStatus(c.id, 'rejected')}>❌</Btn></>}<Btn small danger outline onClick={() => del(c.id)}>🗑️</Btn></div></TD></TR>)}
                </Table>
                {concessions.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No concessions yet.</p>}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 7. PARTIAL PAYMENT / INSTALLMENT
// ════════════════════════════════════════════════════════════════
export function InstallmentModule() {
    const [plans, , reload] = useData('/api/installments');
    const [adding, setAdding] = useState(false);
    const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', total_fee: '', installment_count: 3 });
    const f = v => setForm(p => ({ ...p, ...v }));

    const buildInstallments = () => {
        const perInst = Math.ceil(form.total_fee / form.installment_count);
        return Array.from({ length: form.installment_count }, (_, i) => ({
            number: i + 1,
            amount: i === form.installment_count - 1 ? form.total_fee - perInst * (form.installment_count - 1) : perInst,
            due_date: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().split('T')[0]
        }));
    };

    const save = async () => {
        await axios.post(`${API}/api/installments`, { ...form, installments: buildInstallments() }, { headers: headers() });
        reload(); setAdding(false);
    };

    const markPaid = async (paymentId) => {
        await axios.put(`${API}/api/installments/${paymentId}/pay`, { payment_mode: 'Cash', collected_by: 'Admin' }, { headers: headers() });
        reload();
    };

    const totalFees = plans.reduce((s, p) => s + Number(p.total_fee || 0), 0);
    const collected = plans.reduce((s, p) => s + (p.payments || []).filter(pay => pay.status === 'paid').reduce((a, b) => a + Number(b.amount || 0), 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="📋" label="Total Plans" value={plans.length} color="#4e8ef7" />
                <StatCard icon="💰" label="Total Fees" value={fmt(totalFees)} color="#a78bfa" />
                <StatCard icon="✅" label="Collected" value={fmt(collected)} color="#00d97e" />
                <StatCard icon="⏳" label="Pending" value={fmt(totalFees - collected)} color="#f6c90e" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#00d97e" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ Create Plan'}</Btn>
            </div>
            {adding && (
                <FormPanel title="📋 Create Installment Plan" color="#4e8ef7" onSubmit={save}>
                    <Grid>
                        <Inp label="Student ID" value={form.student_id} onChange={e => f({ student_id: e.target.value })} />
                        <Inp label="Student Name" value={form.student_name} onChange={e => f({ student_name: e.target.value })} />
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Inp label="Total Fee (₹)" type="number" value={form.total_fee} onChange={e => f({ total_fee: e.target.value })} />
                        <Sel label="No. of Installments" value={form.installment_count} onChange={e => f({ installment_count: Number(e.target.value) })} options={[2, 3, 4, 6, 12].map(n => ({ value: n, label: `${n} Installments` }))} />
                    </Grid>
                    {form.total_fee > 0 && (
                        <div style={{ padding: 14, background: '#4e8ef711', borderRadius: 10, border: '1px solid #4e8ef733' }}>
                            <p style={{ margin: '0 0 8px', color: '#4e8ef7', fontWeight: 700, fontSize: 13 }}>Preview:</p>
                            {buildInstallments().map(inst => <p key={inst.number} style={{ margin: '4px 0', fontSize: 12, color: '#9ca3af' }}>Installment {inst.number}: {fmt(inst.amount)} · Due: {inst.due_date}</p>)}
                        </div>
                    )}
                </FormPanel>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {plans.map(plan => (
                    <Card key={plan.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div><p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>{plan.student_name}</p><p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Class {plan.class} · Total: {fmt(plan.total_fee)}</p></div>
                            <Badge color="#4e8ef7">{plan.paid_installments}/{plan.installment_count} Paid</Badge>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                            {(plan.payments || []).map(pay => (
                                <div key={pay.id} style={{ padding: 12, background: C.bg, borderRadius: 10, border: `1px solid ${pay.status === 'paid' ? '#00d97e44' : C.border}` }}>
                                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af' }}>Installment {pay.installment_number}</p>
                                    <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#f1f5f9' }}>{fmt(pay.amount)}</p>
                                    <p style={{ margin: '0 0 8px', fontSize: 11, color: '#6b7280' }}>Due: {pay.due_date}</p>
                                    {pay.status === 'paid'
                                        ? <Badge color="#00d97e">✅ Paid</Badge>
                                        : <Btn small color="#4e8ef7" onClick={() => markPaid(pay.id)}>💰 Pay</Btn>}
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
                {plans.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No installment plans yet.</p>}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 8. REFUND MANAGEMENT
// ════════════════════════════════════════════════════════════════
export function RefundManagement() {
    const [refunds, , reload] = useData('/api/refunds');
    const [adding, setAdding] = useState(false);
    const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const REASONS = ['TC Issued', 'Duplicate Payment', 'Overpayment', 'Withdrawal', 'Other'];
    const [form, setForm] = useState({ student_id: '', student_name: '', class: '1st', refund_amount: '', original_payment: '', reason: 'Other', reason_detail: '', refund_mode: 'Cash', bank_account: '', ifsc_code: '', requested_by: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/refunds`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/refunds/${id}/status`, { status, approved_by: 'Admin' }, { headers: headers() });
        reload();
    };

    const pending = refunds.filter(r => r.status === 'pending');
    const totalRefunded = refunds.filter(r => r.status === 'processed').reduce((s, r) => s + Number(r.refund_amount || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="💸" label="Total Requests" value={refunds.length} color="#4e8ef7" />
                <StatCard icon="⏳" label="Pending" value={pending.length} color="#f6c90e" />
                <StatCard icon="✅" label="Processed" value={refunds.filter(r => r.status === 'processed').length} color="#00d97e" />
                <StatCard icon="💰" label="Total Refunded" value={fmt(totalRefunded)} color="#f45b69" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#f45b69" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '+ New Refund'}</Btn>
            </div>
            {adding && (
                <FormPanel title="💸 Refund Request" color="#f45b69" onSubmit={save} submitLabel="📤 Submit">
                    <Grid>
                        <Inp label="Student ID" value={form.student_id} onChange={e => f({ student_id: e.target.value })} />
                        <Inp label="Student Name" value={form.student_name} onChange={e => f({ student_name: e.target.value })} />
                        <Sel label="Class" value={form.class} onChange={e => f({ class: e.target.value })} options={CLASSES} />
                        <Inp label="Original Payment (₹)" type="number" value={form.original_payment} onChange={e => f({ original_payment: e.target.value })} />
                        <Inp label="Refund Amount (₹)" type="number" value={form.refund_amount} onChange={e => f({ refund_amount: e.target.value })} />
                        <Sel label="Reason" value={form.reason} onChange={e => f({ reason: e.target.value })} options={REASONS} />
                        <Sel label="Refund Mode" value={form.refund_mode} onChange={e => f({ refund_mode: e.target.value })} options={['Cash', 'UPI', 'NEFT', 'Cheque']} />
                        <Inp label="Bank Account" value={form.bank_account} onChange={e => f({ bank_account: e.target.value })} />
                        <Inp label="IFSC Code" value={form.ifsc_code} onChange={e => f({ ifsc_code: e.target.value })} />
                        <Inp label="Requested By" value={form.requested_by} onChange={e => f({ requested_by: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>💸 Refund Register</p></div>
                <Table headers={['Student', 'Class', 'Amount', 'Reason', 'Mode', 'Status', 'Actions']}>
                    {refunds.map(r => <TR key={r.id}><TD style={{ fontWeight: 700, color: '#f1f5f9' }}>{r.student_name}</TD><TD>{r.class}</TD><TD style={{ color: '#f45b69', fontWeight: 700 }}>{fmt(r.refund_amount)}</TD><TD>{r.reason}</TD><TD>{r.refund_mode}</TD><TD><Badge color={r.status === 'processed' ? '#00d97e' : r.status === 'approved' ? '#4e8ef7' : r.status === 'pending' ? '#f6c90e' : '#f45b69'}>{r.status}</Badge></TD>
                        <TD><div style={{ display: 'flex', gap: 6 }}>{r.status === 'pending' && <Btn small color="#4e8ef7" onClick={() => updateStatus(r.id, 'approved')}>✅ Approve</Btn>}{r.status === 'approved' && <Btn small color="#00d97e" onClick={() => updateStatus(r.id, 'processed')}>💸 Process</Btn>}</div></TD></TR>)}
                </Table>
                {refunds.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No refund requests.</p>}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 9. GST & TAX
// ════════════════════════════════════════════════════════════════
export function GSTModule() {
    const [records, , reload] = useData('/api/gst');
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ transaction_type: 'Income', description: '', amount: '', gst_rate: 18, hsn_sac_code: '', vendor_gstin: '', invoice_number: '', invoice_date: new Date().toISOString().split('T')[0] });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/gst`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const del = async (id) => { await axios.delete(`${API}/api/gst/${id}`, { headers: headers() }); reload(); };

    const totalGST = records.reduce((s, r) => s + Number(r.total_gst || 0), 0);
    const cgst = records.reduce((s, r) => s + Number(r.cgst || 0), 0);
    const sgst = records.reduce((s, r) => s + Number(r.sgst || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="📑" label="Total Entries" value={records.length} color="#4e8ef7" />
                <StatCard icon="💰" label="Total GST" value={fmt(totalGST)} color="#f6c90e" />
                <StatCard icon="🏛️" label="CGST" value={fmt(cgst)} color="#4e8ef7" />
                <StatCard icon="🏛️" label="SGST" value={fmt(sgst)} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#f6c90e" onClick={() => setAdding(!adding)} style={{ color: '#000' }}>{adding ? '✕ Cancel' : '+ Add Entry'}</Btn>
            </div>
            {adding && (
                <FormPanel title="📑 GST Entry" color="#f6c90e" onSubmit={save}>
                    <Grid>
                        <Sel label="Type" value={form.transaction_type} onChange={e => f({ transaction_type: e.target.value })} options={['Income', 'Expense']} />
                        <Inp label="Description" value={form.description} onChange={e => f({ description: e.target.value })} />
                        <Inp label="Amount (₹)" type="number" value={form.amount} onChange={e => f({ amount: e.target.value })} />
                        <Sel label="GST Rate" value={form.gst_rate} onChange={e => f({ gst_rate: e.target.value })} options={[0, 5, 12, 18, 28].map(r => ({ value: r, label: `${r}%` }))} />
                        <Inp label="HSN/SAC Code" value={form.hsn_sac_code} onChange={e => f({ hsn_sac_code: e.target.value })} />
                        <Inp label="Vendor GSTIN" value={form.vendor_gstin} onChange={e => f({ vendor_gstin: e.target.value })} />
                        <Inp label="Invoice Number" value={form.invoice_number} onChange={e => f({ invoice_number: e.target.value })} />
                        <Inp label="Invoice Date" type="date" value={form.invoice_date} onChange={e => f({ invoice_date: e.target.value })} />
                    </Grid>
                    {form.amount > 0 && (
                        <div style={{ padding: 14, background: '#f6c90e11', borderRadius: 10, border: '1px solid #f6c90e33' }}>
                            <p style={{ margin: 0, color: '#f6c90e', fontWeight: 700 }}>CGST: {fmt(form.amount * form.gst_rate / 200)} + SGST: {fmt(form.amount * form.gst_rate / 200)} = Total GST: {fmt(form.amount * form.gst_rate / 100)}</p>
                        </div>
                    )}
                </FormPanel>
            )}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📑 GST Register</p></div>
                <Table headers={['Date', 'Description', 'Type', 'Amount', 'CGST', 'SGST', 'Total GST', 'Total Amt', 'Actions']}>
                    {records.map(r => <TR key={r.id}><TD style={{ color: '#6b7280', fontSize: 11 }}>{r.invoice_date}</TD><TD style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.description}</TD><TD><Badge color={r.transaction_type === 'Income' ? '#00d97e' : '#f45b69'}>{r.transaction_type}</Badge></TD><TD>{fmt(r.amount)}</TD><TD style={{ color: '#4e8ef7' }}>{fmt(r.cgst)}</TD><TD style={{ color: '#a78bfa' }}>{fmt(r.sgst)}</TD><TD style={{ color: '#f6c90e', fontWeight: 700 }}>{fmt(r.total_gst)}</TD><TD style={{ fontWeight: 700 }}>{fmt(r.total_amount)}</TD><TD><Btn small danger outline onClick={() => del(r.id)}>🗑️</Btn></TD></TR>)}
                </Table>
                {records.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No GST entries yet.</p>}
            </Card>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 10. BANK RECONCILIATION
// ════════════════════════════════════════════════════════════════
export function BankReconciliation() {
    const [accounts, , reloadAcc] = useData('/api/bank-accounts');
    const [selectedAcc, setSelectedAcc] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [addingAcc, setAddingAcc] = useState(false);
    const [addingTxn, setAddingTxn] = useState(false);
    const [accForm, setAccForm] = useState({ bank_name: '', account_number: '', account_type: 'Current', ifsc_code: '', branch_name: '', opening_balance: '' });
    const [txnForm, setTxnForm] = useState({ transaction_date: new Date().toISOString().split('T')[0], description: '', credit: '', debit: '', reference_number: '', transaction_type: 'Other' });
    const af = v => setAccForm(p => ({ ...p, ...v }));
    const tf = v => setTxnForm(p => ({ ...p, ...v }));

    useEffect(() => {
        if (selectedAcc) {
            axios.get(`${API}/api/bank-accounts/${selectedAcc}/transactions`, { headers: headers() })
                .then(r => setTransactions(r.data)).catch(() => { });
        }
    }, [selectedAcc]);

    const saveAcc = async () => {
        await axios.post(`${API}/api/bank-accounts`, accForm, { headers: headers() });
        reloadAcc(); setAddingAcc(false);
    };
    const saveTxn = async () => {
        await axios.post(`${API}/api/bank-accounts/${selectedAcc}/transactions`, txnForm, { headers: headers() });
        const r = await axios.get(`${API}/api/bank-accounts/${selectedAcc}/transactions`, { headers: headers() });
        setTransactions(r.data); setAddingTxn(false);
    };
    const reconcile = async (id) => {
        await axios.put(`${API}/api/bank-transactions/${id}/reconcile`, {}, { headers: headers() });
        const r = await axios.get(`${API}/api/bank-accounts/${selectedAcc}/transactions`, { headers: headers() });
        setTransactions(r.data);
    };

    const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance || 0), 0);
    const unreconciled = transactions.filter(t => !t.is_reconciled).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🏦" label="Accounts" value={accounts.length} color="#4e8ef7" />
                <StatCard icon="💰" label="Total Balance" value={fmt(totalBalance)} color="#00d97e" />
                <StatCard icon="⏳" label="Unreconciled" value={unreconciled} color="#f6c90e" />
                <StatCard icon="✅" label="Reconciled" value={transactions.filter(t => t.is_reconciled).length} color="#00d97e" />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {accounts.map(a => <Btn key={a.id} color="#4e8ef7" outline={selectedAcc !== a.id} onClick={() => setSelectedAcc(a.id)}>🏦 {a.bank_name} ({fmt(a.current_balance)})</Btn>)}
                <Btn color="#00d97e" onClick={() => setAddingAcc(!addingAcc)} style={{ marginLeft: 'auto' }}>{addingAcc ? '✕' : '+ Account'}</Btn>
            </div>
            {addingAcc && (
                <FormPanel title="🏦 Add Bank Account" color="#4e8ef7" onSubmit={saveAcc}>
                    <Grid>
                        <Inp label="Bank Name" value={accForm.bank_name} onChange={e => af({ bank_name: e.target.value })} />
                        <Inp label="Account Number" value={accForm.account_number} onChange={e => af({ account_number: e.target.value })} />
                        <Sel label="Type" value={accForm.account_type} onChange={e => af({ account_type: e.target.value })} options={['Current', 'Savings', 'OD']} />
                        <Inp label="IFSC Code" value={accForm.ifsc_code} onChange={e => af({ ifsc_code: e.target.value })} />
                        <Inp label="Branch Name" value={accForm.branch_name} onChange={e => af({ branch_name: e.target.value })} />
                        <Inp label="Opening Balance (₹)" type="number" value={accForm.opening_balance} onChange={e => af({ opening_balance: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            {selectedAcc && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Btn color="#4e8ef7" onClick={() => setAddingTxn(!addingTxn)}>{addingTxn ? '✕ Cancel' : '+ Add Transaction'}</Btn>
                    </div>
                    {addingTxn && (
                        <FormPanel title="💳 Add Transaction" color="#4e8ef7" onSubmit={saveTxn}>
                            <Grid>
                                <Inp label="Date" type="date" value={txnForm.transaction_date} onChange={e => tf({ transaction_date: e.target.value })} />
                                <Inp label="Description" value={txnForm.description} onChange={e => tf({ description: e.target.value })} />
                                <Inp label="Credit (₹)" type="number" value={txnForm.credit} onChange={e => tf({ credit: e.target.value })} />
                                <Inp label="Debit (₹)" type="number" value={txnForm.debit} onChange={e => tf({ debit: e.target.value })} />
                                <Inp label="Reference No." value={txnForm.reference_number} onChange={e => tf({ reference_number: e.target.value })} />
                                <Sel label="Type" value={txnForm.transaction_type} onChange={e => tf({ transaction_type: e.target.value })} options={['Fee', 'Salary', 'Vendor', 'Utility', 'Other']} />
                            </Grid>
                        </FormPanel>
                    )}
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}><p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📊 Transactions</p></div>
                        <Table headers={['Date', 'Description', 'Credit', 'Debit', 'Balance', 'Type', 'Reconciled', 'Action']}>
                            {transactions.map(t => <TR key={t.id}><TD style={{ color: '#6b7280', fontSize: 11 }}>{t.transaction_date}</TD><TD style={{ fontWeight: 600, color: '#f1f5f9' }}>{t.description}</TD><TD style={{ color: '#00d97e', fontWeight: 700 }}>{t.credit > 0 ? fmt(t.credit) : '—'}</TD><TD style={{ color: '#f45b69', fontWeight: 700 }}>{t.debit > 0 ? fmt(t.debit) : '—'}</TD><TD style={{ color: '#4e8ef7', fontWeight: 700 }}>{fmt(t.balance)}</TD><TD>{t.transaction_type}</TD><TD>{t.is_reconciled ? <Badge color="#00d97e">✅ Done</Badge> : <Badge color="#f6c90e">Pending</Badge>}</TD><TD>{!t.is_reconciled && <Btn small color="#00d97e" onClick={() => reconcile(t.id)}>✅</Btn>}</TD></TR>)}
                        </Table>
                        {transactions.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No transactions yet.</p>}
                    </Card>
                </>
            )}
            {!selectedAcc && accounts.length > 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Select a bank account above to view transactions.</p>}
            {accounts.length === 0 && !addingAcc && <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No bank accounts added yet.</p>}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 11. TOURNAMENT MANAGEMENT
// ════════════════════════════════════════════════════════════════
export function TournamentManagement() {
    const [tournaments, , reload] = useData('/api/tournaments');
    const [adding, setAdding] = useState(false);
    const [selected, setSelected] = useState(null);
    const [teamForm, setTeamForm] = useState({ team_name: '', coach_name: '', player_count: '' });
    const TYPES = ['Interschool', 'Interhouse', 'District', 'State', 'National', 'Friendly'];
    const [form, setForm] = useState({ tournament_name: '', sport_type: '', tournament_type: 'Interhouse', venue: '', start_date: '', end_date: '', organizer: '', prize_pool: '', description: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/tournaments`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const addTeam = async () => {
        await axios.post(`${API}/api/tournaments/${selected}/teams`, teamForm, { headers: headers() });
        reload(); setTeamForm({ team_name: '', coach_name: '', player_count: '' });
    };
    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/tournaments/${id}/status`, { status }, { headers: headers() });
        reload();
    };
    const del = async (id) => { await axios.delete(`${API}/api/tournaments/${id}`, { headers: headers() }); reload(); };

    const ongoing = tournaments.filter(t => t.status === 'ongoing').length;
    const upcoming = tournaments.filter(t => t.status === 'upcoming').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🏆" label="Total" value={tournaments.length} color="#4e8ef7" />
                <StatCard icon="🔴" label="Ongoing" value={ongoing} color="#f45b69" />
                <StatCard icon="📅" label="Upcoming" value={upcoming} color="#f6c90e" />
                <StatCard icon="✅" label="Completed" value={tournaments.filter(t => t.status === 'completed').length} color="#00d97e" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#f6c90e" onClick={() => setAdding(!adding)} style={{ color: '#000' }}>{adding ? '✕ Cancel' : '🏆 New Tournament'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🏆 Create Tournament" color="#f6c90e" onSubmit={save} submitLabel="🏆 Create">
                    <Grid>
                        <Inp label="Tournament Name" value={form.tournament_name} onChange={e => f({ tournament_name: e.target.value })} />
                        <Inp label="Sport Type" value={form.sport_type} onChange={e => f({ sport_type: e.target.value })} placeholder="e.g. Cricket, Football" />
                        <Sel label="Tournament Type" value={form.tournament_type} onChange={e => f({ tournament_type: e.target.value })} options={TYPES} />
                        <Inp label="Venue" value={form.venue} onChange={e => f({ venue: e.target.value })} />
                        <Inp label="Start Date" type="date" value={form.start_date} onChange={e => f({ start_date: e.target.value })} />
                        <Inp label="End Date" type="date" value={form.end_date} onChange={e => f({ end_date: e.target.value })} />
                        <Inp label="Organizer" value={form.organizer} onChange={e => f({ organizer: e.target.value })} />
                        <Inp label="Prize Pool (₹)" type="number" value={form.prize_pool} onChange={e => f({ prize_pool: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {tournaments.map(t => (
                    <Card key={t.id} style={{ border: selected === t.id ? '1px solid #4e8ef7' : `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div><p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>🏆 {t.tournament_name}</p><p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{t.sport_type} · {t.tournament_type}</p></div>
                            <Badge color={t.status === 'ongoing' ? '#f45b69' : t.status === 'upcoming' ? '#f6c90e' : '#00d97e'}>{t.status}</Badge>
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                            <p style={{ margin: '4px 0' }}>📍 {t.venue} | 🗓️ {t.start_date} → {t.end_date}</p>
                            <p style={{ margin: '4px 0' }}>👥 Teams: {(t.teams || []).length} | 🏅 Prize: {fmt(t.prize_pool)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Btn small color="#4e8ef7" outline onClick={() => setSelected(selected === t.id ? null : t.id)}>👥 Teams</Btn>
                            {t.status === 'upcoming' && <Btn small color="#f45b69" onClick={() => updateStatus(t.id, 'ongoing')}>▶ Start</Btn>}
                            {t.status === 'ongoing' && <Btn small color="#00d97e" onClick={() => updateStatus(t.id, 'completed')}>✅ End</Btn>}
                            <Btn small danger outline onClick={() => del(t.id)}>🗑️</Btn>
                        </div>
                        {selected === t.id && (
                            <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                    <Inp label="" placeholder="Team Name" value={teamForm.team_name} onChange={e => setTeamForm(p => ({ ...p, team_name: e.target.value }))} />
                                    <Inp label="" placeholder="Coach" value={teamForm.coach_name} onChange={e => setTeamForm(p => ({ ...p, coach_name: e.target.value }))} />
                                    <Btn color="#00d97e" onClick={addTeam}>+</Btn>
                                </div>
                                {(t.teams || []).map(tm => <div key={tm.id} style={{ padding: '8px 12px', background: C.bg, borderRadius: 8, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>{tm.team_name}</span><Badge color="#f6c90e">{tm.result}</Badge></div>)}
                            </div>
                        )}
                    </Card>
                ))}
                {tournaments.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No tournaments yet.</p>}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 12. CULTURAL EVENTS
// ════════════════════════════════════════════════════════════════
export function CulturalEvents() {
    const [events, , reload] = useData('/api/cultural-events');
    const [adding, setAdding] = useState(false);
    const [selected, setSelected] = useState(null);
    const [pForm, setPForm] = useState({ student_name: '', class: '1st', item_name: '', position: 'Participated' });
    const TYPES = ['Dance', 'Music', 'Drama', 'Art', 'Debate', 'Quiz', 'Elocution', 'Other'];
    const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
    const [form, setForm] = useState({ event_name: '', event_type: 'Other', event_date: '', event_time: '', venue: '', coordinator: '', budget: '', description: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/cultural-events`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const addParticipant = async (eventId) => {
        await axios.post(`${API}/api/cultural-events/${eventId}/participants`, pForm, { headers: headers() });
        reload(); setPForm({ student_name: '', class: '1st', item_name: '', position: 'Participated' });
    };
    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/cultural-events/${id}/status`, { status }, { headers: headers() });
        reload();
    };
    const del = async (id) => { await axios.delete(`${API}/api/cultural-events/${id}`, { headers: headers() }); reload(); };

    const positionColor = p => ({ '1st': '#f6c90e', '2nd': '#9ca3af', '3rd': '#f97316' }[p] || '#4e8ef7');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🎭" label="Total Events" value={events.length} color="#a78bfa" />
                <StatCard icon="📅" label="Planned" value={events.filter(e => e.status === 'planned').length} color="#4e8ef7" />
                <StatCard icon="✅" label="Completed" value={events.filter(e => e.status === 'completed').length} color="#00d97e" />
                <StatCard icon="👨‍🎤" label="Participants" value={events.reduce((s, e) => s + (e.participants || []).length, 0)} color="#f97316" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#a78bfa" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '🎭 New Event'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🎭 Create Cultural Event" color="#a78bfa" onSubmit={save}>
                    <Grid>
                        <Inp label="Event Name" value={form.event_name} onChange={e => f({ event_name: e.target.value })} />
                        <Sel label="Event Type" value={form.event_type} onChange={e => f({ event_type: e.target.value })} options={TYPES} />
                        <Inp label="Date" type="date" value={form.event_date} onChange={e => f({ event_date: e.target.value })} />
                        <Inp label="Time" type="time" value={form.event_time} onChange={e => f({ event_time: e.target.value })} />
                        <Inp label="Venue" value={form.venue} onChange={e => f({ venue: e.target.value })} />
                        <Inp label="Coordinator" value={form.coordinator} onChange={e => f({ coordinator: e.target.value })} />
                        <Inp label="Budget (₹)" type="number" value={form.budget} onChange={e => f({ budget: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {events.map(ev => (
                    <Card key={ev.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div><p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>🎭 {ev.event_name}</p><p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>{ev.event_type} · {ev.event_date}</p></div>
                            <Badge color="#a78bfa">{ev.status}</Badge>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#9ca3af' }}>📍 {ev.venue} · 👤 {ev.coordinator} · 👥 {(ev.participants || []).length} participants</p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                            <Btn small color="#a78bfa" outline onClick={() => setSelected(selected === ev.id ? null : ev.id)}>👥 Participants</Btn>
                            {ev.status === 'planned' && <Btn small color="#f45b69" onClick={() => updateStatus(ev.id, 'ongoing')}>▶ Start</Btn>}
                            {ev.status === 'ongoing' && <Btn small color="#00d97e" onClick={() => updateStatus(ev.id, 'completed')}>✅ End</Btn>}
                            <Btn small danger outline onClick={() => del(ev.id)}>🗑️</Btn>
                        </div>
                        {selected === ev.id && (
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                                <Grid cols="repeat(auto-fit, minmax(140px, 1fr))">
                                    <Inp placeholder="Student Name" value={pForm.student_name} onChange={e => setPForm(p => ({ ...p, student_name: e.target.value }))} />
                                    <Sel options={CLASSES} value={pForm.class} onChange={e => setPForm(p => ({ ...p, class: e.target.value }))} />
                                    <Inp placeholder="Item/Performance" value={pForm.item_name} onChange={e => setPForm(p => ({ ...p, item_name: e.target.value }))} />
                                    <Sel options={['1st', '2nd', '3rd', 'Participated']} value={pForm.position} onChange={e => setPForm(p => ({ ...p, position: e.target.value }))} />
                                </Grid>
                                <Btn small color="#a78bfa" onClick={() => addParticipant(ev.id)} style={{ marginTop: 8 }}>+ Add</Btn>
                                <div style={{ marginTop: 10 }}>
                                    {(ev.participants || []).map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: C.bg, borderRadius: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, color: '#f1f5f9' }}>{p.student_name} (Class {p.class})</span>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <span style={{ fontSize: 11, color: '#6b7280' }}>{p.item_name}</span>
                                                <Badge color={positionColor(p.position)}>{p.position}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
                {events.length === 0 && <p style={{ color: '#6b7280', padding: 20 }}>No events yet.</p>}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 13. ANNUAL DAY PLANNING
// ════════════════════════════════════════════════════════════════
export function AnnualDayPlanning() {
    const [events, , reload] = useData('/api/annual-day');
    const [adding, setAdding] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [taskForm, setTaskForm] = useState({ task_name: '', assigned_to: '', due_date: '', budget: '', notes: '' });
    const [form, setForm] = useState({ year: new Date().getFullYear(), theme: '', event_date: '', venue: '', chief_guest: '', total_budget: '' });
    const f = v => setForm(p => ({ ...p, ...v }));
    const tf = v => setTaskForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/annual-day`, form, { headers: headers() });
        reload(); setAdding(false);
    };
    const addTask = async (eventId) => {
        await axios.post(`${API}/api/annual-day/${eventId}/tasks`, taskForm, { headers: headers() });
        reload();
    };
    const updateTask = async (taskId, status) => {
        await axios.put(`${API}/api/annual-day-tasks/${taskId}`, { status }, { headers: headers() });
        reload();
    };
    const del = async (id) => { await axios.delete(`${API}/api/annual-day/${id}`, { headers: headers() }); reload(); };

    const taskStatusColor = s => ({ pending: '#f6c90e', in_progress: '#4e8ef7', done: '#00d97e' }[s]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="🎊" label="Total Events" value={events.length} color="#f97316" />
                <StatCard icon="📋" label="Total Tasks" value={events.reduce((s, e) => s + (e.tasks || []).length, 0)} color="#4e8ef7" />
                <StatCard icon="✅" label="Done Tasks" value={events.reduce((s, e) => s + (e.tasks || []).filter(t => t.status === 'done').length, 0)} color="#00d97e" />
                <StatCard icon="💰" label="Total Budget" value={fmt(events.reduce((s, e) => s + Number(e.total_budget || 0), 0))} color="#a78bfa" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn color="#f97316" onClick={() => setAdding(!adding)}>{adding ? '✕ Cancel' : '🎊 New Annual Day'}</Btn>
            </div>
            {adding && (
                <FormPanel title="🎊 Plan Annual Day" color="#f97316" onSubmit={save}>
                    <Grid>
                        <Inp label="Year" type="number" value={form.year} onChange={e => f({ year: e.target.value })} />
                        <Inp label="Theme" value={form.theme} onChange={e => f({ theme: e.target.value })} placeholder="e.g. Vasudhaiva Kutumbakam" />
                        <Inp label="Event Date" type="date" value={form.event_date} onChange={e => f({ event_date: e.target.value })} />
                        <Inp label="Venue" value={form.venue} onChange={e => f({ venue: e.target.value })} />
                        <Inp label="Chief Guest" value={form.chief_guest} onChange={e => f({ chief_guest: e.target.value })} />
                        <Inp label="Total Budget (₹)" type="number" value={form.total_budget} onChange={e => f({ total_budget: e.target.value })} />
                    </Grid>
                </FormPanel>
            )}
            {events.map(ev => {
                const doneTasks = (ev.tasks || []).filter(t => t.status === 'done').length;
                const totalTasks = (ev.tasks || []).length;
                const progress = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
                return (
                    <Card key={ev.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 900, color: '#f1f5f9', fontSize: 18 }}>🎊 Annual Day {ev.year}</p>
                                <p style={{ margin: '4px 0 2px', color: '#f97316', fontWeight: 700 }}>{ev.theme}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>📅 {ev.event_date} · 📍 {ev.venue} · 👑 {ev.chief_guest}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af' }}>Budget: {fmt(ev.total_budget)}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#f97316' }}>Spent: {fmt(ev.spent_budget)}</p>
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 12, color: '#9ca3af' }}>Progress: {doneTasks}/{totalTasks} tasks</span>
                                <span style={{ fontSize: 12, color: '#4e8ef7', fontWeight: 700 }}>{progress}%</span>
                            </div>
                            <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: '#00d97e', borderRadius: 4, transition: 'width .3s' }} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <Btn small color="#f97316" outline onClick={() => setSelectedEvent(selectedEvent === ev.id ? null : ev.id)}>📋 {selectedEvent === ev.id ? 'Hide' : 'View'} Tasks</Btn>
                            <Btn small danger outline onClick={() => del(ev.id)} style={{ marginLeft: 8 }}>🗑️</Btn>
                        </div>
                        {selectedEvent === ev.id && (
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                                <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#f97316', fontSize: 13 }}>Add Task:</p>
                                <Grid>
                                    <Inp placeholder="Task Name" value={taskForm.task_name} onChange={e => tf({ task_name: e.target.value })} />
                                    <Inp placeholder="Assigned To" value={taskForm.assigned_to} onChange={e => tf({ assigned_to: e.target.value })} />
                                    <Inp type="date" value={taskForm.due_date} onChange={e => tf({ due_date: e.target.value })} />
                                    <Inp placeholder="Budget (₹)" type="number" value={taskForm.budget} onChange={e => tf({ budget: e.target.value })} />
                                </Grid>
                                <Btn small color="#f97316" onClick={() => addTask(ev.id)} style={{ marginTop: 8 }}>+ Add Task</Btn>
                                <div style={{ marginTop: 16 }}>
                                    {(ev.tasks || []).map(task => (
                                        <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: C.bg, borderRadius: 10, marginBottom: 8, border: `1px solid ${C.border}` }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{task.task_name}</p>
                                                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>👤 {task.assigned_to} · 📅 {task.due_date} · {fmt(task.budget)}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                <Badge color={taskStatusColor(task.status)}>{task.status}</Badge>
                                                {task.status === 'pending' && <Btn small color="#4e8ef7" onClick={() => updateTask(task.id, 'in_progress')}>▶</Btn>}
                                                {task.status === 'in_progress' && <Btn small color="#00d97e" onClick={() => updateTask(task.id, 'done')}>✅</Btn>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                );
            })}
            {events.length === 0 && !adding && <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No Annual Day planned yet.</p>}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
// 14. INVENTORY & STOCK MANAGEMENT
// ════════════════════════════════════════════════════════════════
export function InventoryManagement() {
    const [items, , reload] = useData('/api/inventory');
    const [adding, setAdding] = useState(false);
    const [issuing, setIssuing] = useState(null); // Kis item ko issue kar rahe hain
    const [filterCat, setFilterCat] = useState('All');
    const CATS = ['All', 'Stationary', 'Cleaning', 'Lab Chemicals', 'Sports', 'Uniforms', 'Medical', 'Canteen', 'Library Books', 'Other'];
    const UNITS = ['Pcs', 'Boxes', 'Packs', 'Bottles', 'Kg', 'Sets', 'Pairs', 'Dozens'];

    const [form, setForm] = useState({ item_name: '', category: 'Stationary', unit: 'Pcs', min_stock_level: 10, current_stock: 100, unit_price: 0, supplier: '' });
    const [issueForm, setIssueForm] = useState({ quantity: 1, issued_to: '', purpose: '' });
    const f = v => setForm(p => ({ ...p, ...v }));

    const save = async () => {
        await axios.post(`${API}/api/inventory`, form, { headers: headers() });
        reload(); setAdding(false);
    };

    const issueItem = async (id) => {
        await axios.put(`${API}/api/inventory/${id}/issue`, issueForm, { headers: headers() });
        reload(); setIssuing(null); setIssueForm({ quantity: 1, issued_to: '', purpose: '' });
    };

    const del = async (id) => { await axios.delete(`${API}/api/inventory/${id}`, { headers: headers() }); reload(); };

    const filtered = filterCat === 'All' ? items : items.filter(i => i.category === filterCat);
    const totalValue = filtered.reduce((s, i) => s + (i.current_stock * i.unit_price), 0);
    const lowStock = filtered.filter(i => i.current_stock <= i.min_stock_level).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <StatCard icon="📦" label="Total Items" value={filtered.length} color="#4e8ef7" />
                <StatCard icon="💰" label="Total Value" value={fmt(totalValue)} color="#00d97e" />
                <StatCard icon="🚨" label="Low Stock Alerts" value={lowStock} color="#f45b69" />
                <StatCard icon="🏷️" label="Categories" value={new Set(filtered.map(i => i.category)).size} color="#a78bfa" />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {CATS.map(c => <Btn key={c} small color="#4e8ef7" outline={filterCat !== c} onClick={() => setFilterCat(c)}>{c}</Btn>)}
                <Btn color="#00d97e" onClick={() => setAdding(!adding)} style={{ marginLeft: 'auto' }}>{adding ? '✕ Cancel' : '+ Add Item'}</Btn>
            </div>

            {adding && (
                <FormPanel title="📦 Add Inventory Item" color="#4e8ef7" onSubmit={save}>
                    <Grid>
                        <Inp label="Item Name" value={form.item_name} onChange={e => f({ item_name: e.target.value })} placeholder="e.g. A4 Size Paper" />
                        <Sel label="Category" value={form.category} onChange={e => f({ category: e.target.value })} options={CATS.filter(c => c !== 'All')} />
                        <Sel label="Unit" value={form.unit} onChange={e => f({ unit: e.target.value })} options={UNITS} />
                        <Inp label="Current Stock" type="number" value={form.current_stock} onChange={e => f({ current_stock: e.target.value })} />
                        <Inp label="Min. Stock Level" type="number" value={form.min_stock_level} onChange={e => f({ min_stock_level: e.target.value })} />
                        <Inp label="Unit Price (₹)" type="number" value={form.unit_price} onChange={e => f({ unit_price: e.target.value })} />
                        <Inp label="Supplier" value={form.supplier} onChange={e => f({ supplier: e.target.value })} placeholder="Vendor name" />
                    </Grid>
                </FormPanel>
            )}

            {/* Issuing Panel */}
            {issuing && (
                <Card style={{ border: `2px solid #f97316`, background: '#f9731611' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#f97316' }}>📤 Issue Item</p>
                        <Btn small danger outline onClick={() => setIssuing(null)}>✕ Cancel</Btn>
                    </div>
                    <Grid cols="repeat(auto-fit, minmax(200px, 1fr))">
                        <Inp label="Quantity" type="number" value={issueForm.quantity} onChange={e => setIssueForm(p => ({ ...p, quantity: e.target.value }))} />
                        <Inp label="Issued To" value={issueForm.issued_to} onChange={e => setIssueForm(p => ({ ...p, issued_to: e.target.value }))} placeholder="e.g. Class 10A / Principal" />
                        <Inp label="Purpose" value={issueForm.purpose} onChange={e => setIssueForm(p => ({ ...p, purpose: e.target.value }))} placeholder="e.g. Monthly usage" />
                    </Grid>
                    <div style={{ marginTop: 14 }}><Btn color="#f97316" onClick={() => issueItem(issuing)}>📤 Confirm Issue</Btn></div>
                </Card>
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}` }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>📦 Inventory Register ({filtered.length})</p>
                </div>
                <Table headers={['Item Name', 'Category', 'Stock', 'Min Level', 'Unit', 'Unit Price', 'Total Value', 'Status', 'Actions']}>
                    {filtered.map(i => {
                        const isLow = i.current_stock <= i.min_stock_level;
                        return (
                            <TR key={i.id}>
                                <TD style={{ fontWeight: 700, color: '#f1f5f5' }}>{i.item_name}</TD>
                                <TD><Badge color="#4e8ef7">{i.category}</Badge></TD>
                                <TD style={{ color: isLow ? '#f45b69' : '#00d97e', fontWeight: isLow ? 700 : 400 }}>{i.current_stock} {isLow && ' ⚠️'}</TD>
                                <TD style={{ color: '#6b7280' }}>{i.min_stock_level}</TD>
                                <TD>{i.unit}</TD>
                                <TD>{fmt(i.unit_price)}</TD>
                                <TD style={{ fontWeight: 600 }}>{fmt(i.current_stock * i.unit_price)}</TD>
                                <TD>{isLow ? <Badge color="#f45b69">Low Stock</Badge> : <Badge color="#00d97e">Good</Badge>}</TD>
                                <TD>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Btn small color="#f97316" onClick={() => setIssuing(i.id)}>📤 Issue</Btn>
                                        <Btn small danger outline onClick={() => del(i.id)}>🗑️</Btn>
                                    </div>
                                </TD>
                            </TR>
                        );
                    })}
                </Table>
                {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No inventory items found.</p>}
            </Card>
        </div>
    );
}