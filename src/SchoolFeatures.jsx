// SchoolFeatures.jsx — 3 Feature Modules
// 1. TimetableOptimizer — AI-powered class scheduling
// 2. TransportApp — Bus route + student tracking
// 3. ModularMarketplace — School store / book shop

import React, { useState } from 'react';

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
    return <div style={{ background: '#111827', borderRadius: 16, padding: 24, border: '1px solid #1f2d3d', ...style }}>{children}</div>;
}
function Btn({ children, color = '#4e8ef7', small, outline, ...props }) {
    return (
        <button {...props} style={{
            padding: small ? '7px 14px' : '10px 20px', borderRadius: 10,
            border: outline ? `1px solid ${color}` : 'none',
            background: outline ? 'transparent' : color,
            color: outline ? color : '#fff',
            fontWeight: 700, fontSize: small ? 12 : 13, cursor: 'pointer', ...props.style
        }}>{children}</button>
    );
}
function Badge({ children, color }) {
    return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '22', color, letterSpacing: 1 }}>{children}</span>;
}

// ═══════════════════════════════════════════════════════════════
// 1. TIMETABLE OPTIMIZER
// ═══════════════════════════════════════════════════════════════

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = ['8:00–9:00', '9:00–10:00', '10:00–11:00', '11:20–12:20', '12:20–1:20', '2:00–3:00'];
const SUBJECTS = ['Math', 'Science', 'English', 'Hindi', 'SST', 'Computer', 'PE', 'Art'];
const SUBJECT_COLORS = {
    Math: '#4e8ef7', Science: '#00d97e', English: '#a78bfa', Hindi: '#f97316',
    SST: '#f6c90e', Computer: '#f45b69', PE: '#00c4cc', Art: '#e879f9'
};
const TEACHERS = ['Mr. Sharma', 'Ms. Verma', 'Mr. Patel', 'Ms. Singh', 'Mr. Kumar', 'Ms. Joshi'];

function generateTimetable() {
    return DAYS.reduce((acc, day) => {
        acc[day] = PERIODS.map(() => {
            const sub = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
            const teacher = TEACHERS[Math.floor(Math.random() * TEACHERS.length)];
            return { subject: sub, teacher };
        });
        return acc;
    }, {});
}

export function TimetableOptimizer() {
    const [selectedClass, setSelectedClass] = useState('10th');
    const [timetable, setTimetable] = useState(generateTimetable);
    const [optimizing, setOptimizing] = useState(false);
    const [conflicts, setConflicts] = useState(2);

    const classes = ['8th', '9th', '10th', '11th', '12th'];

    const optimize = () => {
        setOptimizing(true);
        setTimeout(() => {
            setTimetable(generateTimetable());
            setConflicts(0);
            setOptimizing(false);
        }, 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { icon: '📅', label: 'Classes', value: classes.length, color: '#4e8ef7' },
                    { icon: '👩‍🏫', label: 'Teachers', value: TEACHERS.length, color: '#00d97e' },
                    { icon: '⚠️', label: 'Conflicts', value: conflicts, color: conflicts > 0 ? '#f45b69' : '#00d97e' },
                    { icon: '✅', label: 'AI Score', value: conflicts === 0 ? '100%' : '87%', color: '#a78bfa' },
                ].map(s => (
                    <Card key={s.label} style={{ textAlign: 'center', padding: '16px 12px' }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '6px 0 2px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* Conflict warning */}
            {conflicts > 0 && (
                <Card style={{ borderLeft: '3px solid #f45b69', padding: '14px 20px' }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#d1d5db' }}>
                        ⚠️ <strong style={{ color: '#f45b69' }}>{conflicts} scheduling conflict{conflicts > 1 ? 's' : ''}</strong> detected — Mr. Sharma assigned to 2 classes at the same time. Click <em>AI Optimize</em> to resolve.
                    </p>
                </Card>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {classes.map(c => (
                        <button key={c} onClick={() => { setSelectedClass(c); setTimetable(generateTimetable()); }}
                            style={{
                                padding: '8px 14px', borderRadius: 10, border: 'none',
                                background: selectedClass === c ? '#4e8ef7' : '#1f2d3d',
                                color: selectedClass === c ? '#fff' : '#9ca3af',
                                fontWeight: 700, fontSize: 12, cursor: 'pointer'
                            }}>{c}</button>
                    ))}
                </div>
                <Btn color={optimizing ? '#374151' : '#00d97e'} onClick={optimize} style={{ marginLeft: 'auto' }}>
                    {optimizing ? '⏳ Optimizing...' : '🤖 AI Optimize'}
                </Btn>
                <Btn color="#4e8ef7" outline small>📄 Export PDF</Btn>
            </div>

            {/* Timetable grid */}
            <Card style={{ padding: 0, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                        <tr style={{ background: '#0d1117' }}>
                            <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1, minWidth: 90 }}>PERIOD</th>
                            {DAYS.map(d => (
                                <th key={d} style={{ padding: '12px 14px', textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: 1 }}>{d.toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERIODS.map((period, pi) => (
                            <tr key={pi} style={{ borderBottom: '1px solid #1f2d3d' }}>
                                <td style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{period}</td>
                                {DAYS.map((day, di) => {
                                    const slot = timetable[day]?.[pi];
                                    const color = SUBJECT_COLORS[slot?.subject] || '#6b7280';
                                    return (
                                        <td key={di} style={{ padding: '8px 6px', textAlign: 'center' }}>
                                            <div style={{
                                                background: color + '18', border: `1px solid ${color}44`,
                                                borderRadius: 8, padding: '6px 8px',
                                            }}>
                                                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color }}>{slot?.subject}</p>
                                                <p style={{ margin: 0, fontSize: 9, color: '#6b7280', marginTop: 2 }}>{slot?.teacher.split(' ')[1]}</p>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SUBJECTS.map(s => (
                    <span key={s} style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: SUBJECT_COLORS[s] + '22', color: SUBJECT_COLORS[s]
                    }}>{s}</span>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// 2. TRANSPORT APP
// ═══════════════════════════════════════════════════════════════

const BUS_ROUTES = [
    { id: 'R1', name: 'Route 1 — Vijay Nagar', driver: 'Ramesh Kumar', phone: '9876543210', seats: 40, students: 34, status: 'On Route', eta: '7 min', stops: ['Vijay Nagar Square', 'Palasia Chowk', 'LIG Square', 'School'] },
    { id: 'R2', name: 'Route 2 — Scheme 54', driver: 'Suresh Yadav', phone: '9765432109', seats: 35, students: 28, status: 'At School', eta: 'Arrived', stops: ['Scheme 54 Main', 'Bicholi Mardana', 'Rau Road', 'School'] },
    { id: 'R3', name: 'Route 3 — Indore West', driver: 'Mahesh Patel', phone: '9654321098', seats: 45, students: 41, status: 'On Route', eta: '15 min', stops: ['Rajendra Nagar', 'Banganga', 'Old Palasia', 'School'] },
    { id: 'R4', name: 'Route 4 — Ujjain Road', driver: 'Prakash Sharma', phone: '9543210987', seats: 50, students: 38, status: 'Delayed', eta: '25 min', stops: ['Dewas Road', 'Ring Road', 'Bypass', 'School'] },
];

const STATUS_COLOR = { 'On Route': '#4e8ef7', 'At School': '#00d97e', 'Delayed': '#f45b69' };

export function TransportApp() {
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all');

    const routes = filter === 'all' ? BUS_ROUTES : BUS_ROUTES.filter(r => r.status === filter);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { icon: '🚌', label: 'Total Buses', value: BUS_ROUTES.length, color: '#4e8ef7' },
                    { icon: '👦', label: 'Students Enrolled', value: BUS_ROUTES.reduce((s, r) => s + r.students, 0), color: '#00d97e' },
                    { icon: '🟢', label: 'On Route', value: BUS_ROUTES.filter(r => r.status === 'On Route').length, color: '#f97316' },
                    { icon: '⚠️', label: 'Delayed', value: BUS_ROUTES.filter(r => r.status === 'Delayed').length, color: '#f45b69' },
                ].map(s => (
                    <Card key={s.label} style={{ padding: '16px 18px' }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '6px 0 2px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8 }}>
                {['all', 'On Route', 'At School', 'Delayed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '7px 16px', borderRadius: 10, border: 'none',
                        background: filter === f ? STATUS_COLOR[f] || '#4e8ef7' : '#1f2d3d',
                        color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer'
                    }}>{f === 'all' ? 'All Routes' : f}</button>
                ))}
            </div>

            {/* Route cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {routes.map(route => (
                    <Card key={route.id} style={{ cursor: 'pointer', border: selected?.id === route.id ? '1px solid #4e8ef7' : '1px solid #1f2d3d' }}
                        onClick={() => setSelected(selected?.id === route.id ? null : route)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                            <div>
                                <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#f1f5f9', fontSize: 14 }}>{route.name}</p>
                                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Driver: {route.driver} · {route.phone}</p>
                            </div>
                            <Badge color={STATUS_COLOR[route.status]}>{route.status}</Badge>
                        </div>
                        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 10, color: '#6b7280', letterSpacing: 1 }}>STUDENTS</p>
                                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#4e8ef7' }}>{route.students}/{route.seats}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 10, color: '#6b7280', letterSpacing: 1 }}>ETA</p>
                                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: route.status === 'Delayed' ? '#f45b69' : '#00d97e' }}>{route.eta}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 10, color: '#6b7280', letterSpacing: 1 }}>CAPACITY</p>
                                <div style={{ marginTop: 4, width: 80, height: 5, background: '#1f2d3d', borderRadius: 4 }}>
                                    <div style={{ width: `${(route.students / route.seats) * 100}%`, height: '100%', background: '#4e8ef7', borderRadius: 4 }} />
                                </div>
                            </div>
                        </div>

                        {/* Stop list (when selected) */}
                        {selected?.id === route.id && (
                            <div style={{ marginTop: 16, borderTop: '1px solid #1f2d3d', paddingTop: 14 }}>
                                <p style={{ margin: '0 0 10px', fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: 1 }}>STOPS</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {route.stops.map((stop, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                                background: i === route.stops.length - 1 ? '#00d97e' : '#1f2d3d',
                                                border: `2px solid ${i === route.stops.length - 1 ? '#00d97e' : '#374151'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, color: '#fff', fontWeight: 700
                                            }}>{i + 1}</div>
                                            <span style={{ fontSize: 12, color: i === route.stops.length - 1 ? '#00d97e' : '#d1d5db', fontWeight: i === route.stops.length - 1 ? 700 : 400 }}>{stop}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// 3. MODULAR MARKETPLACE
// ═══════════════════════════════════════════════════════════════

const PRODUCTS = [
    { id: 1, name: 'Class 10 NCERT Set (All Subjects)', category: 'Books', price: 1450, stock: 23, sold: 87, rating: 4.8, icon: '📚' },
    { id: 2, name: 'School Uniform (Summer Set)', category: 'Uniform', price: 850, stock: 56, sold: 134, rating: 4.6, icon: '👕' },
    { id: 3, name: 'Geometry Box + Stationery Kit', category: 'Stationery', price: 320, stock: 78, sold: 203, rating: 4.9, icon: '📐' },
    { id: 4, name: 'School Bag (Premium)', category: 'Accessories', price: 1200, stock: 12, sold: 56, rating: 4.7, icon: '🎒' },
    { id: 5, name: 'Lab Coat + Safety Kit', category: 'Lab', price: 650, stock: 34, sold: 45, rating: 4.5, icon: '🥼' },
    { id: 6, name: 'Sports Kit (Full Set)', category: 'Sports', price: 980, stock: 8, sold: 29, rating: 4.4, icon: '⚽' },
    { id: 7, name: 'Computer Science Book Set', category: 'Books', price: 680, stock: 15, sold: 62, rating: 4.7, icon: '💻' },
    { id: 8, name: 'Winter Uniform Set', category: 'Uniform', price: 1100, stock: 0, sold: 78, rating: 4.5, icon: '🧥' },
];

const CATEGORIES_M = ['All', 'Books', 'Uniform', 'Stationery', 'Accessories', 'Lab', 'Sports'];
const CAT_COLORS = { Books: '#4e8ef7', Uniform: '#00d97e', Stationery: '#a78bfa', Accessories: '#f97316', Lab: '#00c4cc', Sports: '#f6c90e' };

export function ModularMarketplace() {
    const [filter, setFilter] = useState('All');
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const products = PRODUCTS.filter(p => {
        const matchCat = filter === 'All' || p.category === filter;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const addToCart = (product) => {
        if (product.stock === 0) return;
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

    const placeOrder = () => {
        setOrderPlaced(true);
        setCart([]);
        setTimeout(() => { setOrderPlaced(false); setShowCart(false); }, 3000);
    };

    const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { icon: '🛍️', label: 'Products', value: PRODUCTS.length, color: '#4e8ef7' },
                    { icon: '✅', label: 'In Stock', value: PRODUCTS.filter(p => p.stock > 0).length, color: '#00d97e' },
                    { icon: '📦', label: 'Total Sold', value: PRODUCTS.reduce((s, p) => s + p.sold, 0), color: '#a78bfa' },
                    { icon: '💰', label: 'Revenue', value: fmt(PRODUCTS.reduce((s, p) => s + p.price * p.sold, 0)), color: '#f97316' },
                ].map(s => (
                    <Card key={s.label} style={{ padding: '16px 18px' }}>
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <p style={{ margin: '6px 0 2px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: s.label === 'Revenue' ? 16 : 24, fontWeight: 900, color: s.color }}>{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
                <button onClick={() => setShowCart(!showCart)} style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: cartCount > 0 ? '#f97316' : '#1f2d3d',
                    color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}>🛒 Cart {cartCount > 0 ? `(${cartCount})` : ''}</button>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES_M.map(c => (
                    <button key={c} onClick={() => setFilter(c)} style={{
                        padding: '6px 16px', borderRadius: 20, border: 'none',
                        background: filter === c ? (CAT_COLORS[c] || '#4e8ef7') : '#1f2d3d',
                        color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer'
                    }}>{c}</button>
                ))}
            </div>

            {/* Cart panel */}
            {showCart && (
                <Card style={{ border: '1px solid #f97316' }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 800, color: '#f97316', fontSize: 15 }}>🛒 Your Cart</p>
                    {orderPlaced ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <p style={{ fontSize: 40, margin: '0 0 10px' }}>🎉</p>
                            <p style={{ fontWeight: 800, color: '#00d97e', fontSize: 16, margin: 0 }}>Order Placed Successfully!</p>
                            <p style={{ color: '#6b7280', fontSize: 12, margin: '4px 0 0' }}>Order ID: ASM-{Date.now().toString(36).toUpperCase()}</p>
                        </div>
                    ) : cart.length === 0 ? (
                        <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Cart is empty. Add items from below.</p>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1f2d3d' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{item.icon} {item.name}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Qty: {item.qty} × {fmt(item.price)}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, color: '#f97316', fontSize: 14 }}>{fmt(item.price * item.qty)}</span>
                                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: '1px solid #f45b6933', borderRadius: 6, padding: '4px 8px', color: '#f45b69', cursor: 'pointer', fontSize: 11 }}>✕</button>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Total ({cartCount} items)</p>
                                    <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#f97316' }}>{fmt(total)}</p>
                                </div>
                                <Btn color="#00d97e" onClick={placeOrder}>✅ Place Order</Btn>
                            </div>
                        </>
                    )}
                </Card>
            )}

            {/* Product grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {products.map(product => {
                    const inCart = cart.find(i => i.id === product.id);
                    const catColor = CAT_COLORS[product.category] || '#6b7280';
                    return (
                        <Card key={product.id} style={{ position: 'relative' }}>
                            {product.stock === 0 && (
                                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                    <Badge color="#f45b69">Out of Stock</Badge>
                                </div>
                            )}
                            {product.stock > 0 && product.stock <= 10 && (
                                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                    <Badge color="#f6c90e">Low Stock</Badge>
                                </div>
                            )}
                            <div style={{ fontSize: 36, marginBottom: 12 }}>{product.icon}</div>
                            <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#f1f5f9', fontSize: 14, lineHeight: 1.4 }}>{product.name}</p>
                            <Badge color={catColor}>{product.category}</Badge>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#f97316' }}>₹{product.price.toLocaleString('en-IN')}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>⭐ {product.rating} · {product.sold} sold</p>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                    style={{
                                        padding: '8px 14px', borderRadius: 10, border: 'none',
                                        background: product.stock === 0 ? '#1f2d3d' : inCart ? '#00d97e' : '#f97316',
                                        color: product.stock === 0 ? '#6b7280' : '#fff',
                                        fontWeight: 700, fontSize: 12, cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {product.stock === 0 ? 'Out' : inCart ? `✓ In Cart` : '+ Add'}
                                </button>
                            </div>
                            <p style={{ margin: '8px 0 0', fontSize: 11, color: product.stock > 10 ? '#6b7280' : '#f6c90e' }}>
                                Stock: {product.stock} units
                            </p>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}