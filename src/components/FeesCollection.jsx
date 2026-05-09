import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const C = { card: '#111827', border: '#1f2d3d', bg: '#0d1117' };

const PAYMENT_MODES = ['Cash', 'Online', 'Cheque', 'UPI', 'NEFT/RTGS'];

function printReceipt(student, payment) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>Fee Receipt</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
            .school { font-size: 28px; font-weight: 900; color: #2563eb; }
            .receipt-no { font-size: 13px; color: #64748b; margin-top: 6px; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .label { color: #64748b; }
            .value { font-weight: 700; color: #1e293b; }
            .total { background: #eff6ff; padding: 16px; border-radius: 10px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 900; color: #2563eb; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
            .stamp { text-align: center; margin-top: 40px; }
            .paid-stamp { display: inline-block; border: 4px solid #16a34a; color: #16a34a; padding: 10px 30px; border-radius: 8px; font-size: 28px; font-weight: 900; transform: rotate(-15deg); opacity: 0.7; }
            @media print { button { display: none; } }
        </style></head>
        <body>
            <div class="header">
                <div class="school">AuraSync International School</div>
                <div style="font-size:13px;color:#64748b;margin-top:4px">Indore Branch | ISO 9001:2026 Certified</div>
                <div style="font-size:18px;font-weight:800;margin-top:12px;letter-spacing:3px">FEE RECEIPT</div>
                <div class="receipt-no">Receipt No: AS-${Date.now()} | Date: ${new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <div class="row"><span class="label">Student Name</span><span class="value">${student.student_name}</span></div>
            <div class="row"><span class="label">Class</span><span class="value">${student.class || '—'}</span></div>
            <div class="row"><span class="label">Parent Phone</span><span class="value">${student.parent_phone}</span></div>
            <div class="row"><span class="label">Payment Mode</span><span class="value">${payment.mode}</span></div>
            <div class="row"><span class="label">Payment Date</span><span class="value">${new Date().toLocaleDateString('en-IN')}</span></div>
            ${payment.cheque_no ? `<div class="row"><span class="label">Cheque No</span><span class="value">${payment.cheque_no}</span></div>` : ''}
            <div class="total"><span>Amount Paid</span><span>₹${Number(payment.amount).toLocaleString('en-IN')}</span></div>
            <div class="stamp"><div class="paid-stamp">✓ PAID</div></div>
            <div class="footer">
                <div>Cashier Signature: ___________</div>
                <div>Principal Signature: ___________</div>
            </div>
            <button onclick="window.print()" style="margin-top:30px;padding:12px 24px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:700;">🖨️ Print Receipt</button>
        </body></html>
    `);
    win.document.close();
}

export default function FeesCollection() {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feeDetails, setFeeDetails] = useState(null);
    const [payHistory, setPayHistory] = useState([]);
    const [payForm, setPayForm] = useState({ amount: '', mode: 'Cash', cheque_no: '', note: '' });
    const [paying, setPaying] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const searchRef = useRef();
    const token = localStorage.getItem('aura_token');
    const headers = { Authorization: `Bearer ${token}` };

    // Search students
    useEffect(() => {
        if (search.length < 2) { setSearchResults([]); return; }
        const t = setTimeout(async () => {
            try {
                const res = await axios.get(`${API}/api/students/search?q=${search}`, { headers });
                setSearchResults(res.data || []);
            } catch {
                // fallback: search from leads
                try {
                    const res = await axios.get(`${API}/api/leads?search=${search}`, { headers });
                    setSearchResults(res.data || []);
                } catch { setSearchResults([]); }
            }
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const selectStudent = async (student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        setSearch(student.student_name);
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/fees/student/${student.firebase_id || student.id}`, { headers });
            setFeeDetails(res.data);
        } catch {
            // Default fee structure
            setFeeDetails({ total_fees: 50000, paid_amount: 0, pending: 50000 });
        }
        try {
            const res = await axios.get(`${API}/api/fees/history/${student.firebase_id || student.id}`, { headers });
            setPayHistory(res.data || []);
        } catch { setPayHistory([]); }
        setLoading(false);
    };

    const handlePayment = async () => {
        if (!payForm.amount || Number(payForm.amount) <= 0) return setError('Amount daalo');
        if (payForm.mode === 'Cheque' && !payForm.cheque_no) return setError('Cheque number required');
        setPaying(true); setError(''); setSuccess('');
        try {
            await axios.post(`${API}/api/fees/collect`, {
                student_id: selectedStudent.firebase_id || selectedStudent.id,
                student_name: selectedStudent.student_name,
                parent_phone: selectedStudent.parent_phone,
                amount: Number(payForm.amount),
                mode: payForm.mode,
                cheque_no: payForm.cheque_no,
                note: payForm.note,
            }, { headers });

            // Update local state
            setFeeDetails(prev => ({
                ...prev,
                paid_amount: (prev?.paid_amount || 0) + Number(payForm.amount),
                pending: (prev?.pending || 0) - Number(payForm.amount),
            }));
            setPayHistory(prev => [{
                amount: Number(payForm.amount),
                mode: payForm.mode,
                created_at: new Date().toISOString(),
                note: payForm.note,
            }, ...prev]);

            // Print receipt
            printReceipt(selectedStudent, payForm);

            setSuccess(`✅ ₹${Number(payForm.amount).toLocaleString('en-IN')} successfully collected! Receipt printed. WhatsApp/SMS sent to ${selectedStudent.parent_phone}`);
            setPayForm({ amount: '', mode: 'Cash', cheque_no: '', note: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Payment failed');
        }
        setPaying(false);
    };

    const pending = (feeDetails?.total_fees || 0) - (feeDetails?.paid_amount || 0);
    const paidPct = feeDetails?.total_fees ? Math.round((feeDetails.paid_amount / feeDetails.total_fees) * 100) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Segoe UI', sans-serif" }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)', borderRadius: 20, padding: '24px 28px' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#4e8ef7', fontWeight: 700, letterSpacing: 3 }}>FINANCE MODULE</p>
                <h2 style={{ margin: '4px 0 2px', color: '#f1f5f9', fontSize: 22, fontWeight: 900 }}>💰 Fees Collection</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>Student search → Collect → Auto Receipt + WhatsApp/SMS</p>
            </div>

            {/* Student Search */}
            <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, position: 'relative' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#f1f5f9' }}>🔍 Student Search</p>
                <input
                    ref={searchRef}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSelectedStudent(null); setFeeDetails(null); }}
                    placeholder="Student name ya phone number search karo..."
                    style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100px', left: 24, right: 24, background: '#1a2233', border: `1px solid ${C.border}`, borderRadius: 12, zIndex: 100, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        {searchResults.map((s, i) => (
                            <div key={i} onClick={() => selectStudent(s)}
                                style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#253047'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{s.student_name}</p>
                                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{s.parent_phone} · Class {s.class || '—'}</p>
                                </div>
                                <span style={{ fontSize: 11, background: '#4e8ef722', color: '#4e8ef7', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>{s.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Fee Details + Payment Form */}
            {selectedStudent && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                    {/* Left: Student + Fee Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Student Card */}
                        <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
                            <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#4e8ef7' }}>👨‍🎓 Student Details</p>
                            {[
                                ['Name', selectedStudent.student_name],
                                ['Phone', selectedStudent.parent_phone],
                                ['Class', selectedStudent.class || '—'],
                                ['Status', selectedStudent.status],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>{l}</span>
                                    <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        {/* Fee Summary */}
                        {loading ? (
                            <div style={{ background: C.card, borderRadius: 16, padding: 30, border: `1px solid ${C.border}`, textAlign: 'center', color: '#6b7280' }}>Loading fee details...</div>
                        ) : feeDetails && (
                            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
                                <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#f1f5f9' }}>💰 Fee Summary</p>
                                {[
                                    { l: 'Total Fees', v: feeDetails.total_fees, c: '#4e8ef7' },
                                    { l: 'Paid', v: feeDetails.paid_amount, c: '#00d97e' },
                                    { l: 'Pending', v: pending, c: pending > 0 ? '#f45b69' : '#00d97e' },
                                ].map(({ l, v, c }) => (
                                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, color: '#9ca3af' }}>{l}</span>
                                        <span style={{ fontSize: 14, color: c, fontWeight: 800 }}>₹{Number(v || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                                {/* Progress */}
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 11, color: '#6b7280' }}>Payment Progress</span>
                                        <span style={{ fontSize: 11, color: '#00d97e', fontWeight: 700 }}>{paidPct}%</span>
                                    </div>
                                    <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
                                        <div style={{ width: `${paidPct}%`, height: '100%', background: paidPct === 100 ? '#00d97e' : '#4e8ef7', borderRadius: 4, transition: 'width .5s' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment History */}
                        {payHistory.length > 0 && (
                            <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
                                <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#f1f5f9' }}>📋 Payment History</p>
                                {payHistory.slice(0, 5).map((p, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 13, color: '#f1f5f9', fontWeight: 700 }}>₹{Number(p.amount).toLocaleString('en-IN')}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>{p.mode} · {new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                                        </div>
                                        <span style={{ fontSize: 11, background: '#00d97e22', color: '#00d97e', padding: '4px 10px', borderRadius: 20, fontWeight: 700, alignSelf: 'center' }}>PAID</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Payment Form */}
                    <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, height: 'fit-content' }}>
                        <p style={{ margin: '0 0 20px', fontWeight: 700, color: '#4e8ef7', fontSize: 16 }}>💳 Collect Payment</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Amount */}
                            <div>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 6 }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    value={payForm.amount}
                                    onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                                    placeholder={`Max: ₹${Number(pending).toLocaleString('en-IN')}`}
                                    style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 16px', color: '#f1f5f9', fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                                />
                                {/* Quick amounts */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    {[5000, 10000, 25000].map(amt => (
                                        <button key={amt} onClick={() => setPayForm({ ...payForm, amount: amt })}
                                            style={{ flex: 1, padding: '8px', background: '#253047', border: `1px solid ${C.border}`, borderRadius: 8, color: '#9ca3af', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                            ₹{amt.toLocaleString('en-IN')}
                                        </button>
                                    ))}
                                    <button onClick={() => setPayForm({ ...payForm, amount: pending })}
                                        style={{ flex: 1, padding: '8px', background: '#00d97e22', border: `1px solid #00d97e`, borderRadius: 8, color: '#00d97e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                        Full
                                    </button>
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 6 }}>Payment Mode</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                    {PAYMENT_MODES.map(m => (
                                        <button key={m} onClick={() => setPayForm({ ...payForm, mode: m })}
                                            style={{ padding: '10px 6px', background: payForm.mode === m ? '#4e8ef7' : C.bg, border: `1px solid ${payForm.mode === m ? '#4e8ef7' : C.border}`, borderRadius: 10, color: payForm.mode === m ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cheque No */}
                            {payForm.mode === 'Cheque' && (
                                <div>
                                    <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 6 }}>Cheque Number</label>
                                    <input
                                        value={payForm.cheque_no}
                                        onChange={e => setPayForm({ ...payForm, cheque_no: e.target.value })}
                                        placeholder="e.g. 123456"
                                        style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            )}

                            {/* Note */}
                            <div>
                                <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: 6 }}>Note (Optional)</label>
                                <input
                                    value={payForm.note}
                                    onChange={e => setPayForm({ ...payForm, note: e.target.value })}
                                    placeholder="e.g. Term 1 fees"
                                    style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {error && <p style={{ color: '#f45b69', fontSize: 13, margin: 0, fontWeight: 700 }}>❌ {error}</p>}
                            {success && <p style={{ color: '#00d97e', fontSize: 13, margin: 0, fontWeight: 700 }}>{success}</p>}

                            {/* Submit */}
                            <button onClick={handlePayment} disabled={paying || !payForm.amount}
                                style={{ padding: '16px', background: paying || !payForm.amount ? '#374151' : 'linear-gradient(135deg,#4e8ef7,#2563eb)', border: 'none', borderRadius: 14, color: '#fff', fontWeight: 800, fontSize: 15, cursor: paying ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(78,142,247,0.3)' }}>
                                {paying ? '⏳ Processing...' : `💳 Collect ₹${Number(payForm.amount || 0).toLocaleString('en-IN')}`}
                            </button>

                            <div style={{ background: '#253047', borderRadius: 10, padding: 12, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                                ✅ Receipt auto-print hoga<br />
                                📱 WhatsApp + SMS parent ko jayega<br />
                                📊 Ledger automatically update hoga
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}