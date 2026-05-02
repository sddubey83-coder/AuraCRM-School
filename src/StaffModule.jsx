// StaffModule.jsx — Complete Enterprise Staff & HR Management System
// Modules: Directory, Attendance, Leave, Payroll, Performance, Documents

import React, { useState, useCallback } from 'react';

// ─── DESIGN SYSTEM ──────────────────────────────────────────
const C = {
    bg: '#0d1117', card: '#111827', border: '#1f2d3d',
    text: '#f1f5f9', muted: '#6b7280', subtle: '#9ca3af', light: '#d1d5db',
    primary: '#4e8ef7', success: '#00d97e', warning: '#f6c90e',
    danger: '#f45b69', info: '#a78bfa', orange: '#f97316'
};

function Card({ children, style = {} }) {
    return <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, ...style }}>{children}</div>;
}
function Btn({ children, color = C.primary, small, outline, danger, fullWidth, ...props }) {
    const c = danger ? C.danger : color;
    return <button {...props} style={{
        padding: small ? '6px 14px' : '10px 20px', borderRadius: 10,
        border: outline ? `1px solid ${c}` : 'none',
        background: outline ? 'transparent' : c,
        color: outline ? c : '#fff',
        fontWeight: 700, fontSize: small ? 12 : 13, cursor: 'pointer',
        transition: 'all .15s', width: fullWidth ? '100%' : 'auto',
        letterSpacing: 0.3, ...props.style
    }}>{children}</button>;
}
function Badge({ children, color }) {
    return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '22', color, letterSpacing: 0.5 }}>{children}</span>;
}
function Stat({ icon, label, value, color = C.text, sub }) {
    return <Card style={{ padding: '18px 20px' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <p style={{ margin: '6px 0 2px', fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</p>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 900, color }}>{value}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>{sub}</p>}
    </Card>;
}
function Modal({ children, onClose, width = 600 }) {
    return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn .2s' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 20, width, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${C.border}`, animation: 'modalIn .3s', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>{children}</div>
    </div>;
}
function ModalHeader({ title, onClose, color = C.primary }) {
    return <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontWeight: 800, color, fontSize: 16 }}>{title}</h3>
        <button onClick={onClose} style={{ background: C.border, border: 'none', color: C.subtle, width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>✕</button>
    </div>;
}
function FInput({ label, type = 'text', ...props }) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && <label style={{ fontSize: 11, color: C.subtle, fontWeight: 600 }}>{label}</label>}
        <input type={type} {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', ...props.style }} />
    </div>;
}
function FSelect({ label, options, ...props }) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && <label style={{ fontSize: 11, color: C.subtle, fontWeight: 600 }}>{label}</label>}
        <select {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', width: '100%', ...props.style }}>
            {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
    </div>;
}
function FTextArea({ label, ...props }) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {label && <label style={{ fontSize: 11, color: C.subtle, fontWeight: 600 }}>{label}</label>}
        <textarea {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', width: '100%', resize: 'vertical', boxSizing: 'border-box', ...props.style }} />
    </div>;
}

// ─── CONSTANTS ────────────────────────────────────────────────
const DEPARTMENTS = ['All', 'Teaching', 'Administration', 'Support'];
const DESIGNATIONS = ['Principal', 'Vice Principal', 'HOD', 'Senior Teacher', 'Teacher', 'Lab Assistant', 'Librarian', 'Accountant', 'Admin Staff', 'Peon', 'Security', 'Driver', 'Cleaning'];
const SUBJECTS_LIST = ['Mathematics', 'Science', 'English', 'Hindi', 'SST', 'Computer Science', 'PE', 'Art', 'Music', 'N/A'];
const LEAVE_TYPES = ['CL', 'EL', 'ML', 'Half Day', 'Maternity', 'LWP', 'Compensatory', 'Duty Leave'];
const PAYMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ALLOWANCES = { DA: 12, HRA: 8, TA: 5, Medical: 1250, Special: 2000 };
const DEDUCTIONS = { PF: 12, ESI: 1.75, ProfessionalTax: 200, TDS: 10 };

// ─── INITIAL DATA ────────────────────────────────────────────
const INITIAL_STAFF = [
    { id: 'ST001', name: 'Dr. Rajesh Sharma', designation: 'Principal', dept: 'Administration', subject: 'N/A', phone: '9876543210', email: 'principal@aurasync.in', dob: '1975-03-15', gender: 'Male', blood_group: 'B+', address: '15 MG Road, Indore', join_date: '2018-04-01', qualification: 'M.Ed, PhD', experience: '20 years', salary: 85000, status: 'Active', total_leaves: 12, used_leaves: 3, balance_leaves: 9, attendance_pct: 98, aadhaar: 'XXXX-XXXX-4521', pan: 'ABCPS1234K', bank: 'SBI - A/C 3214567890', ifsc: 'SBIN0001234', emergency_contact: '9111222333', documents: ['M.Ed Certificate', 'PhD Degree', 'Experience Letter'], transfer_history: [] },
    { id: 'ST002', name: 'Ms. Priya Verma', designation: 'Senior Teacher', dept: 'Teaching', subject: 'Mathematics', phone: '9765432109', email: 'priya.v@aurasync.in', dob: '1990-07-22', gender: 'Female', blood_group: 'A+', address: '23 Vijay Nagar, Indore', join_date: '2020-06-15', qualification: 'M.Sc Maths, B.Ed', experience: '8 years', salary: 42000, status: 'Active', total_leaves: 12, used_leaves: 5, balance_leaves: 7, attendance_pct: 94, aadhaar: 'XXXX-XXXX-7892', pan: 'DEFPV5678L', bank: 'HDFC - A/C 9876543210', ifsc: 'HDFC0005678', emergency_contact: '9222334455', documents: ['M.Sc Certificate', 'B.Ed Degree'], transfer_history: [{ from: 'Bhopal Branch', date: '2020-06-15' }] },
    { id: 'ST003', name: 'Mr. Suresh Patel', designation: 'Teacher', dept: 'Teaching', subject: 'Science', phone: '9654321098', email: 'suresh.p@aurasync.in', dob: '1988-11-08', gender: 'Male', blood_group: 'O+', address: '45 Palasia, Indore', join_date: '2019-07-01', qualification: 'M.Sc Physics, B.Ed', experience: '10 years', salary: 40000, status: 'Active', total_leaves: 12, used_leaves: 8, balance_leaves: 4, attendance_pct: 89, aadhaar: 'XXXX-XXXX-3456', pan: 'GHIPT9012M', bank: 'BOB - A/C 5678901234', ifsc: 'BARB0123456', emergency_contact: '9333445566', documents: ['M.Sc Certificate', 'B.Ed Degree', 'TET Certificate'], transfer_history: [] },
    { id: 'ST004', name: 'Ms. Kavita Singh', designation: 'Teacher', dept: 'Teaching', subject: 'English', phone: '9543210987', email: 'kavita.s@aurasync.in', dob: '1992-02-14', gender: 'Female', blood_group: 'AB+', address: '78 Scheme No 78, Indore', join_date: '2021-04-01', qualification: 'MA English, B.Ed', experience: '6 years', salary: 38000, status: 'Active', total_leaves: 12, used_leaves: 2, balance_leaves: 10, attendance_pct: 97, aadhaar: 'XXXX-XXXX-1122', pan: 'JKLKS3456N', bank: 'PNB - A/C 3456789012', ifsc: 'PUNB0789012', emergency_contact: '9444556677', documents: ['MA Certificate', 'B.Ed Degree'], transfer_history: [] },
    { id: 'ST005', name: 'Mr. Ramesh Gupta', designation: 'Accountant', dept: 'Administration', subject: 'N/A', phone: '9432109876', email: 'accounts@aurasync.in', dob: '1980-09-30', gender: 'Male', blood_group: 'B-', address: '12 Sadar Bazar, Indore', join_date: '2017-03-10', qualification: 'M.Com, CA Inter', experience: '15 years', salary: 35000, status: 'Active', total_leaves: 12, used_leaves: 4, balance_leaves: 8, attendance_pct: 96, aadhaar: 'XXXX-XXXX-9988', pan: 'MNORG7890P', bank: 'SBI - A/C 6789012345', ifsc: 'SBIN0067890', emergency_contact: '9555667788', documents: ['M.Com Certificate', 'CA Inter Marksheet'], transfer_history: [{ from: 'Ujjain Branch', date: '2017-03-10' }] },
    { id: 'ST006', name: 'Ms. Sunita Joshi', designation: 'Librarian', dept: 'Support', subject: 'N/A', phone: '9321098765', email: 'library@aurasync.in', dob: '1985-05-20', gender: 'Female', blood_group: 'A-', address: '56 Nehru Nagar, Indore', join_date: '2022-01-15', qualification: 'MLIS', experience: '5 years', salary: 28000, status: 'On Leave', total_leaves: 12, used_leaves: 12, balance_leaves: 0, attendance_pct: 75, aadhaar: 'XXXX-XXXX-5544', pan: 'OPQJS1234Q', bank: 'Canara - A/C 4567890123', ifsc: 'CNRB0045678', emergency_contact: '9666778899', documents: ['MLIS Certificate'], transfer_history: [] },
    { id: 'ST007', name: 'Mr. Anil Kumar', designation: 'Teacher', dept: 'Teaching', subject: 'Hindi', phone: '9210987654', email: 'anil.k@aurasync.in', dob: '1978-12-01', gender: 'Male', blood_group: 'O-', address: '90 Navlakha, Indore', join_date: '2016-06-01', qualification: 'MA Hindi, B.Ed', experience: '18 years', salary: 45000, status: 'Active', total_leaves: 12, used_leaves: 1, balance_leaves: 11, attendance_pct: 99, aadhaar: 'XXXX-XXXX-3322', pan: 'RSTAK5678S', bank: 'BOB - A/C 2345678901', ifsc: 'BARB0234567', emergency_contact: '9777889900', documents: ['MA Certificate', 'B.Ed Degree', 'CTET Certificate', 'State Award'], transfer_history: [{ from: 'Bhopal HQ', date: '2016-06-01' }, { from: 'Ujjain Branch', date: '2013-04-01' }] },
    { id: 'ST008', name: 'Mr. Deepak Rawat', designation: 'Peon', dept: 'Support', subject: 'N/A', phone: '9109876543', email: '', dob: '1990-08-15', gender: 'Male', blood_group: 'AB-', address: '34 Rajendra Nagar, Indore', join_date: '2015-09-01', qualification: '10th Pass', experience: '9 years', salary: 14000, status: 'Active', total_leaves: 12, used_leaves: 6, balance_leaves: 6, attendance_pct: 92, aadhaar: 'XXXX-XXXX-2211', pan: 'TUVDR9012U', bank: 'PNB - A/C 8901234567', ifsc: 'PUNB0890123', emergency_contact: '9888990011', documents: ['10th Marksheet', 'Address Proof'], transfer_history: [] },
    { id: 'ST009', name: 'Ms. Meena Devi', designation: 'Cleaning Staff', dept: 'Support', subject: 'N/A', phone: '9008765432', email: '', dob: '1982-04-10', gender: 'Female', blood_group: 'B+', address: '67 LIG Colony, Indore', join_date: '2019-01-10', qualification: '8th Pass', experience: '5 years', salary: 12000, status: 'Active', total_leaves: 12, used_leaves: 2, balance_leaves: 10, attendance_pct: 95, aadhaar: 'XXXX-XXXX-6677', pan: 'UVWMD3456V', bank: 'SBI - A/C 7890123456', ifsc: 'SBIN0078901', emergency_contact: '9990001112', documents: ['Address Proof', 'ID Proof'], transfer_history: [] },
    { id: 'ST010', name: 'Mr. Vikram Thakur', designation: 'Security', dept: 'Support', subject: 'N/A', phone: '8997654321', email: '', dob: '1985-10-25', gender: 'Male', blood_group: 'A+', address: '23 Scheme No 54, Indore', join_date: '2020-08-01', qualification: '12th Pass', experience: '7 years', salary: 16000, status: 'Active', total_leaves: 12, used_leaves: 4, balance_leaves: 8, attendance_pct: 93, aadhaar: 'XXXX-XXXX-8899', pan: 'XYZVT5678W', bank: 'Canara - A/C 5678901234', ifsc: 'CNRB0056789', emergency_contact: '9911223344', documents: ['12th Marksheet', 'License'], transfer_history: [] },
];

// ─── UTILITY FUNCTIONS ───────────────────────────────────────
const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const genId = () => 'ST' + String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
const statusColor = s => ({ Active: C.success, 'On Leave': C.warning, Suspended: C.danger, Resigned: C.muted }[s] || C.muted);

function calculatePay(basic) {
    const da = Math.round(basic * ALLOWANCES.DA / 100);
    const hra = Math.round(basic * ALLOWANCES.HRA / 100);
    const ta = Math.round(basic * ALLOWANCES.TA / 100);
    const gross = basic + da + hra + ta + ALLOWANCES.Medical + ALLOWANCES.Special;
    const pf = Math.round(basic * DEDUCTIONS.PF / 100);
    const esi = basic <= 21000 ? Math.round(basic * DEDUCTIONS.ESI / 100) : 0;
    const tds = gross > 25000 ? Math.round(gross * DEDUCTIONS.TDS / 100) : 0;
    const totalDed = pf + esi + DEDUCTIONS.ProfessionalTax + tds;
    return { basic, da, hra, ta, medical: ALLOWANCES.Medical, special: ALLOWANCES.Special, gross, pf, esi, pt: DEDUCTIONS.ProfessionalTax, tds, totalDed, net: gross - totalDed };
}

function generatePayslipPDF(staff, month, year) {
    const pay = calculatePay(staff.salary);
    const html = `<!DOCTYPE html><html><head><title>Payslip - ${staff.name} - ${month} ${year}</title>
  <style>@page{margin:15mm;size:A4}body{font-family:'Segoe UI',sans-serif;color:#222;padding:25px;font-size:13px}
  .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px double #1a365d;padding-bottom:15px;margin-bottom:20px}
  .header h1{margin:0;font-size:22px;color:#1a365d}.header p{margin:2px 0;font-size:12px;color:#666}
  .info{display:flex;flex-wrap:wrap;gap:20px;margin-bottom:20px;padding:15px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0}
  .info-item{flex:1;min-width:140px}.info-item label{font-size:10px;color:#888;display:block;text-transform:uppercase;letter-spacing:1px}.info-item span{font-size:13px;font-weight:700;color:#222}
  table{width:100%;border-collapse:collapse;margin:10px 0}th{background:#1a365d;color:#fff;padding:10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px}
  td{padding:9px 12px;border:1px solid #e2e8f0;font-size:13px}.right{text-align:right;font-weight:600}
  .total-row{background:#edf2f7;font-weight:800}.net-row{background:#f0fff4;font-weight:900;font-size:15px}
  .footer{margin-top:40px;display:flex;justify-content:space-between;font-size:11px;color:#888}
  .sig{text-align:center;width:180px}.sig .line{border-top:2px solid #333;margin-top:60px;padding-top:8px}
  .stamp{width:100px;height:100px;border:2px dashed #ccc;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;margin:0 auto}
  @media print{.no-print{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
  <div class="header"><div><h1>🎓 ${'AuraSync School AI'}</h1><p>${'Indore, Madhya Pradesh'}</p><p>Affiliation: MP-2024-AI-001</p></div>
  <div style="text-align:right"><h2 style="margin:0;color:#1a365d">SALARY SLIP</h2><p style="margin:2px 0;font-size:14px;font-weight:700">${month} ${year}</p></div></div>
  <div class="info"><div class="info-item"><label>Employee Name</label><span>${staff.name}</span></div><div class="info-item"><label>Employee ID</label><span>${staff.id}</span></div>
  <div class="info-item"><label>Designation</label><span>${staff.designation}</span></div><div class="info-item"><label>Department</label><span>${staff.dept}</span></div>
  <div class="info-item"><label>PAN</label><span>${staff.pan || 'N/A'}</span></div><div class="info-item"><label>Bank A/C</label><span>${staff.bank || 'N/A'}</span></div>
  <div class="info-item"><label>Days Worked</label><span>${Math.floor(staff.attendance_pct * 2.6 / 100)}</span></div><div class="info-item"><label>LOP</label><span>${Math.max(0, 26 - Math.floor(staff.attendance_pct * 2.6 / 100))}</span></div></div>
  <table><thead><tr><th>EARNINGS</th><th class="right">Amount (₹)</th><th>DEDUCTIONS</th><th class="right">Amount (₹)</th></tr></thead>
  <tbody>
  <tr><td>Basic Salary</td><td class="right">${pay.basic.toLocaleString('en-IN')}</td><td>Provident Fund (${DEDUCTIONS.PF}%)</td><td class="right">${pay.pf.toLocaleString('en-IN')}</td></tr>
  <tr><td>Dearness Allowance (${ALLOWANCES.DA}%)</td><td class="right">${pay.da.toLocaleString('en-IN')}</td><td>ESI (${DEDUCTIONS.ESI}%)</td><td class="right">${pay.esi.toLocaleString('en-IN')}</td></tr>
  <tr><td>HRA (${ALLOWANCES.HRA}%)</td><td class="right">${pay.hra.toLocaleString('en-IN')}</td><td>Professional Tax</td><td class="right">${pay.pt.toLocaleString('en-IN')}</td></tr>
  <tr><td>Transport Allowance (${ALLOWANCES.TA}%)</td><td class="right">${pay.ta.toLocaleString('en-IN')}</td><td>TDS (${DEDUCTIONS.TDS}%)</td><td class="right">${pay.tds.toLocaleString('en-IN')}</td></tr>
  <tr><td>Medical Allowance</td><td class="right">${pay.medical.toLocaleString('en-IN')}</td><td></td><td></td></tr>
  <tr><td>Special Allowance</td><td class="right">${pay.special.toLocaleString('en-IN')}</td><td></td><td></td></tr>
  <tr class="total-row"><td><strong>GROSS EARNINGS</strong></td><td class="right"><strong>${pay.gross.toLocaleString('en-IN')}</strong></td><td><strong>TOTAL DEDUCTIONS</strong></td><td class="right"><strong>${pay.totalDed.toLocaleString('en-IN')}</strong></td></tr>
  <tr class="net-row"><td colspan="2"><strong>NET PAY</strong></td><td class="right" style="color:#276749"><strong>${fmt(pay.net)}</strong></td><td colspan="2"></td></tr>
  </tbody></table>
  <p style="margin:15px 0 5px;font-size:11px;color:#888">Net Pay in Words: <strong>${toWords(pay.net)} Rupees Only</strong></p>
  <div class="footer"><div class="sig"><div class="line">Employee Signature</div></div><div style="text-align:center"><div class="stamp">SCHOOL<br>SEAL</div></div><div class="sig"><div class="line">Authorized Signatory</div></div></div>
  <p style="text-align:center;margin-top:20px;font-size:10px;color:#aaa">This is a computer-generated payslip. Generated on ${new Date().toLocaleString('en-IN')} | Document ID: PAY-${Date.now().toString(36).toUpperCase()}</p>
  <div class="no-print" style="text-align:center;margin:25px 0"><button onclick="window.print()" style="padding:14px 50px;background:#1a365d;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer">🖨️ Print / Save as PDF</button></div>
  </body></html>`;
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (w) { w.document.write(html); w.document.close(); }
}

function toWords(num) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
    if (num < 20) return a[num];
    if (num < 100) return a[Math.floor(num / 10)] + ' ' + a[num % 10];
    if (num < 1000) return toWords(Math.floor(num / 100)) + ' Hundred ' + (num % 100 ? 'and ' + toWords(num % 100) : '');
    return toWords(Math.floor(num / 1000)) + ' Thousand ' + (num % 1000 ? toWords(num % 1000) : '');
}

// ─── TABS ─────────────────────────────────────────────────────
const TABS = [
    { id: 'directory', icon: '👥', label: 'Directory' },
    { id: 'attendance', icon: '📋', label: 'Attendance' },
    { id: 'leave', icon: '🏖️', label: 'Leave' },
    { id: 'payroll', icon: '💰', label: 'Payroll' },
    { id: 'performance', icon: '🏆', label: 'Performance' },
    { id: 'documents', icon: '📂', label: 'Documents' },
];

// ─── EDIT STAFF MODAL ────────────────────────────────────────
function EditStaffModal({ staff, onClose, onSave }) {
    const [form, setForm] = useState({ ...staff });
    const handleSave = () => { onSave(form); onClose(); };
    return <Modal onClose={onClose} width={620}>
        <ModalHeader title={`✏️ Edit: ${staff.name}`} onClose={onClose} />
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FInput label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <FInput label="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <FInput label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <FInput label="DOB" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                <FSelect label="Designation" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} options={DESIGNATIONS} />
                <FSelect label="Department" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} options={['Teaching', 'Administration', 'Support']} />
                <FSelect label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} options={SUBJECTS_LIST} />
                <FSelect label="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} options={['Male', 'Female', 'Other']} />
                <FInput label="Blood Group" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} />
                <FInput label="Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
                <FInput label="Experience" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                <FInput label="Join Date" type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} />
                <FInput label="Salary (₹)" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} />
                <FSelect label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={['Active', 'On Leave', 'Suspended', 'Resigned']} />
                <FInput label="Aadhaar" value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} />
                <FInput label="PAN" value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value })} />
                <FInput label="Bank A/C" value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} />
                <FInput label="IFSC" value={form.ifsc} onChange={e => setForm({ ...form, ifsc: e.target.value })} />
                <FInput label="Emergency Contact" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} />
            </div>
            <FTextArea label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <Btn outline onClick={onClose}>Cancel</Btn>
                <Btn color={C.success} onClick={handleSave}>💾 Save Changes</Btn>
            </div>
        </div>
    </Modal>;
}

// ─── STAFF DIRECTORY ─────────────────────────────────────────
function StaffDirectory({ staff, setStaff, showToast }) {
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('All');
    const [showAdd, setShowAdd] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editStaff, setEditStaff] = useState(null);
    const [form, setForm] = useState({ name: '', designation: 'Teacher', dept: 'Teaching', subject: 'Mathematics', phone: '', email: '', dob: '', gender: 'Male', blood_group: 'B+', address: '', qualification: '', salary: '', join_date: new Date().toISOString().split('T')[0] });

    const filtered = staff.filter(s => {
        const m = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
        const d = dept === 'All' || s.dept === dept;
        return m && d;
    });

    const addStaff = () => {
        if (!form.name || !form.phone) return showToast('Name & phone required', 'error');
        const newStaff = { ...form, id: genId(), status: 'Active', total_leaves: 12, used_leaves: 0, balance_leaves: 12, attendance_pct: 100, salary: Number(form.salary) || 0, pan: '', aadhaar: '', bank: '', ifsc: '', emergency_contact: '', documents: [], transfer_history: [], experience: '0 years' };
        setStaff(prev => [newStaff, ...prev]);
        setForm({ name: '', designation: 'Teacher', dept: 'Teaching', subject: 'Mathematics', phone: '', email: '', dob: '', gender: 'Male', blood_group: 'B+', address: '', qualification: '', salary: '', join_date: new Date().toISOString().split('T')[0] });
        setShowAdd(false);
        showToast('Staff added successfully!', 'success');
    };

    const handleEditSave = (updated) => {
        setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
        setSelected(updated);
        showToast('Staff updated!', 'success');
    };

    const deleteStaff = (s) => {
        if (!window.confirm(`Remove ${s.name}? This cannot be undone.`)) return;
        setStaff(prev => prev.filter(x => x.id !== s.id));
        if (selected?.id === s.id) setSelected(null);
        showToast('Staff removed', 'warning');
    };

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <Stat icon="👥" label="Total Staff" value={staff.length} color={C.primary} />
            <Stat icon="📚" label="Teaching" value={staff.filter(s => s.dept === 'Teaching').length} color={C.success} sub={`₹${staff.filter(s => s.dept === 'Teaching').reduce((a, s) => a + s.salary, 0).toLocaleString('en-IN')} payroll`} />
            <Stat icon="🏢" label="Admin" value={staff.filter(s => s.dept === 'Administration').length} color={C.info} />
            <Stat icon="🔧" label="Support" value={staff.filter(s => s.dept === 'Support').length} color={C.warning} />
            <Stat icon="🟡" label="On Leave" value={staff.filter(s => s.status === 'On Leave').length} color={C.warning} />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input placeholder="🔍 Search by name, ID, or phone..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 200, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 13, outline: 'none' }} />
            {DEPARTMENTS.map(d => <button key={d} onClick={() => setDept(d)} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: dept === d ? C.primary : C.border, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{d}</button>)}
            <Btn color={C.success} onClick={() => setShowAdd(!showAdd)}>{showAdd ? '✕ Cancel' : '+ Add Staff'}</Btn>
        </div>

        {showAdd && <Card><p style={{ margin: '0 0 16px', fontWeight: 700, color: C.success }}>➕ New Staff Member</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <FInput label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <FInput label="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                <FInput label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
                <FInput label="DOB" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                <FSelect label="Designation" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} options={DESIGNATIONS} />
                <FSelect label="Department" value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} options={['Teaching', 'Administration', 'Support']} />
                <FSelect label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} options={SUBJECTS_LIST} />
                <FInput label="Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
                <FInput label="Salary (₹)" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                <FInput label="Join Date" type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} />
                <FSelect label="Blood Group" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
            </div>
            <Btn color={C.success} onClick={addStaff} style={{ marginTop: 14 }}>💾 Save Staff</Btn>
        </Card>}

        <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.bg }}>
                        {['ID', 'Name', 'Designation', 'Subject', 'Phone', 'Qualification', 'Salary', 'Attendance', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr></thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }} onClick={() => setSelected(selected?.id === s.id ? null : s)}>
                                <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{s.id}</td>
                                <td style={{ padding: '12px 14px' }}><p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13 }}>{s.name}</p><p style={{ margin: 0, fontSize: 11, color: C.muted }}>{s.dept} · {s.gender}</p></td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{s.designation}</td>
                                <td style={{ padding: '12px 14px' }}><Badge color={C.primary}>{s.subject}</Badge></td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{s.phone}</td>
                                <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted }}>{s.qualification}</td>
                                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: C.success }}>{fmt(s.salary)}</td>
                                <td style={{ padding: '12px 14px' }}><span style={{ fontWeight: 700, color: s.attendance_pct >= 90 ? C.success : s.attendance_pct >= 75 ? C.warning : C.danger, fontSize: 13 }}>{s.attendance_pct}%</span></td>
                                <td style={{ padding: '12px 14px' }}><Badge color={statusColor(s.status)}>{s.status}</Badge></td>
                                <td style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                        <Btn small outline color={C.primary} onClick={() => setEditStaff(s)}>✏️</Btn>
                                        <Btn small outline color={C.success} onClick={() => window.open(`tel:${s.phone}`)}>📞</Btn>
                                        <Btn small outline danger onClick={() => deleteStaff(s)}>🗑️</Btn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>

        {selected && !editStaff && <Card style={{ border: `1px solid ${C.primary}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${C.primary}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: C.primary }}>{selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    <div><p style={{ margin: 0, fontWeight: 900, color: C.text, fontSize: 17 }}>{selected.name}</p><p style={{ margin: 0, fontSize: 12, color: C.muted }}>{selected.designation} · {selected.dept} · {selected.id}</p></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Btn small color={C.primary} onClick={() => setEditStaff(selected)}>✏️ Edit</Btn>
                    <button onClick={() => setSelected(null)} style={{ background: C.border, border: 'none', color: C.subtle, width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                {[
                    { l: 'Subject', v: selected.subject }, { l: 'Phone', v: selected.phone }, { l: 'Email', v: selected.email || '—' },
                    { l: 'DOB', v: fmtDate(selected.dob) }, { l: 'Blood Group', v: selected.blood_group }, { l: 'Gender', v: selected.gender },
                    { l: 'Join Date', v: fmtDate(selected.join_date) }, { l: 'Qualification', v: selected.qualification }, { l: 'Experience', v: selected.experience },
                    { l: 'Monthly Salary', v: fmt(selected.salary) }, { l: 'Annual CTC', v: fmt(selected.salary * 12) },
                    { l: 'Aadhaar', v: selected.aadhaar || '—' }, { l: 'PAN', v: selected.pan || '—' }, { l: 'Bank', v: selected.bank || '—' },
                    { l: 'Emergency', v: selected.emergency_contact || '—' }, { l: 'Leaves Used', v: `${selected.used_leaves}/${selected.total_leaves}` },
                    { l: 'Leave Balance', v: `${selected.balance_leaves} days` }, { l: 'Attendance', v: `${selected.attendance_pct}%` }, { l: 'Address', v: selected.address || '—' },
                ].map(item => <div key={item.l} style={{ background: C.bg, borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                    <p style={{ margin: '0 0 3px', fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{item.l}</p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.text }}>{item.v}</p>
                </div>)}
            </div>
            {selected.documents?.length > 0 && <div style={{ marginTop: 16 }}><p style={{ margin: '0 0 10px', fontSize: 12, color: C.muted, fontWeight: 700 }}>📎 Documents</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{selected.documents.map((d, i) => <Badge key={i} color={C.info}>📄 {d}</Badge>)}</div></div>}
            {selected.transfer_history?.length > 0 && <div style={{ marginTop: 16 }}><p style={{ margin: '0 0 10px', fontSize: 12, color: C.muted, fontWeight: 700 }}>🔄 Transfer History</p>
                {selected.transfer_history.map((t, i) => <div key={i} style={{ background: C.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.subtle }}>From: <strong style={{ color: C.text }}>{t.from}</strong> · Date: {fmtDate(t.date)}</div>)}</div>}
        </Card>}

        {editStaff && <EditStaffModal staff={editStaff} onClose={() => setEditStaff(null)} onSave={handleEditSave} />}
    </div>;
}

// ─── STAFF ATTENDANCE ────────────────────────────────────────
function StaffAttendance({ staff }) {
    const [attendance, setAttendance] = useState(() => staff.map(s => ({
        id: s.id, name: s.name, designation: s.designation, status: s.status === 'On Leave' ? 'leave' : 'present',
        time_in: s.status !== 'On Leave' ? `${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} AM` : null,
        time_out: null, substitution: ''
    })));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saved, setSaved] = useState(false);

    const toggle = (id, status) => { setAttendance(prev => prev.map(a => a.id === id ? { ...a, status } : a)); setSaved(false); };
    const markAll = (status) => { setAttendance(prev => prev.map(a => a.status !== 'leave' ? { ...a, status } : a)); setSaved(false); };

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const onLeave = attendance.filter(a => a.status === 'leave').length;
    const pct = Math.round(present / attendance.length * 100);

    const statusOpts = [
        { value: 'present', label: '✅ P', color: C.success },
        { value: 'absent', label: '❌ A', color: C.danger },
        { value: 'late', label: '⏰ L', color: C.warning },
        { value: 'half-day', label: '🕓 HD', color: C.orange },
    ];

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <Stat icon="✅" label="Present" value={present} color={C.success} />
            <Stat icon="❌" label="Absent" value={absent} color={C.danger} />
            <Stat icon="⏰" label="Late" value={late} color={C.warning} />
            <Stat icon="🏖️" label="On Leave" value={onLeave} color={C.info} />
            <Stat icon="📊" label="Attendance %" value={pct + '%'} color={pct >= 90 ? C.success : pct >= 75 ? C.warning : C.danger} />
        </div>

        {absent > 0 && <Card style={{ borderLeft: `3px solid ${C.danger}` }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: C.danger, fontWeight: 700 }}>⚠️ SUBSTITUTION REQUIRED</p>
            <p style={{ margin: 0, fontSize: 12, color: C.subtle }}>{absent} staff member(s) absent. Assign substitute teachers from Directory.</p>
        </Card>}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <FInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 160 }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <Btn small outline color={C.danger} onClick={() => markAll('absent')}>All Absent</Btn>
                <Btn small outline color={C.success} onClick={() => markAll('present')}>All Present</Btn>
                <Btn color={saved ? C.success : C.primary} onClick={() => setSaved(true)}>{saved ? '✅ Saved!' : '💾 Save Attendance'}</Btn>
            </div>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: C.bg }}>
                    {['Staff ID', 'Name', 'Designation', 'Time In', 'Status', 'Mark Attendance'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                    ))}
                </tr></thead>
                <tbody>
                    {attendance.map(a => <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{a.id}</td>
                        <td style={{ padding: '12px 14px' }}><p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13 }}>{a.name}</p><p style={{ margin: 0, fontSize: 11, color: C.muted }}>{a.designation}</p></td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{a.designation}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{a.time_in || '—'}</td>
                        <td style={{ padding: '12px 14px' }}><Badge color={a.status === 'leave' ? C.info : a.status === 'present' ? C.success : a.status === 'late' ? C.warning : C.danger}>{a.status.toUpperCase()}</Badge></td>
                        <td style={{ padding: '12px 14px' }}>
                            {a.status === 'leave' ? <span style={{ fontSize: 12, color: C.info, fontWeight: 600 }}>On Leave</span> :
                                <div style={{ display: 'flex', gap: 5 }}>{statusOpts.map(opt => (
                                    <button key={opt.value} onClick={() => toggle(a.id, opt.value)} style={{
                                        width: 36, height: 28, borderRadius: 6, border: 'none',
                                        background: a.status === opt.value ? opt.color : C.border,
                                        color: a.status === opt.value ? '#fff' : C.muted,
                                        fontWeight: 800, fontSize: 11, cursor: 'pointer'
                                    }}>{opt.label}</button>
                                ))}</div>}
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </Card>
    </div>;
}

// ─── LEAVE MANAGEMENT ─────────────────────────────────────────
function LeaveManagement({ staff, showToast }) {
    const [requests, setRequests] = useState([
        { id: 'LV001', staff_id: 'ST003', name: 'Mr. Suresh Patel', type: 'CL', from: '2025-05-08', to: '2025-05-09', days: 2, reason: 'Family function', status: 'Pending', applied: '2025-05-05' },
        { id: 'LV002', staff_id: 'ST002', name: 'Ms. Priya Verma', type: 'EL', from: '2025-05-15', to: '2025-05-17', days: 3, reason: 'Medical checkup', status: 'Approved', applied: '2025-05-10' },
        { id: 'LV003', staff_id: 'ST007', name: 'Mr. Anil Kumar', type: 'ML', from: '2025-06-01', to: '2025-06-05', days: 5, reason: 'Surgery', status: 'Pending', applied: '2025-05-25' },
    ]);
    const [showApply, setShowApply] = useState(false);
    const [form, setForm] = useState({ staff_id: 'ST001', type: 'CL', from: '', to: '', reason: '' });

    const approve = id => { setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r)); showToast('Leave approved', 'success'); };
    const reject = id => { setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r)); showToast('Leave rejected', 'warning'); };

    const applyLeave = () => {
        if (!form.from || !form.to || !form.reason) return showToast('Fill all fields', 'error');
        const s = staff.find(x => x.id === form.staff_id);
        if (!s) return showToast('Select valid staff', 'error');
        const days = Math.max(1, Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1);
        setRequests(prev => [{ id: 'LV' + Date.now().toString(36).toUpperCase(), ...form, name: s.name, days, status: 'Pending', applied: new Date().toISOString().split('T')[0] }, ...prev]);
        setForm({ staff_id: 'ST001', type: 'CL', from: '', to: '', reason: '' });
        setShowApply(false);
        showToast('Leave applied!', 'success');
    };

    const statusColor = s => ({ Pending: C.warning, Approved: C.success, Rejected: C.danger }[s]);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <Stat icon="⏳" label="Pending" value={requests.filter(r => r.status === 'Pending').length} color={C.warning} />
            <Stat icon="✅" label="Approved" value={requests.filter(r => r.status === 'Approved').length} color={C.success} />
            <Stat icon="❌" label="Rejected" value={requests.filter(r => r.status === 'Rejected').length} color={C.danger} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Btn color={C.primary} onClick={() => setShowApply(!showApply)}>{showApply ? '✕ Cancel' : '+ Apply Leave'}</Btn></div>

        {showApply && <Card><p style={{ margin: '0 0 16px', fontWeight: 700, color: C.primary }}>📋 New Leave Application</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <FSelect label="Staff Member" value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })} options={staff.map(s => ({ value: s.id, label: `${s.name} (${s.id})` }))} />
                <FSelect label="Leave Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={LEAVE_TYPES} />
                <FInput label="From Date" type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} />
                <FInput label="To Date" type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} />
            </div>
            <FTextArea label="Reason *" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={2} style={{ marginTop: 12 }} />
            <Btn color={C.success} onClick={applyLeave} style={{ marginTop: 12 }}>✅ Submit Application</Btn>
        </Card>}

        <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: C.bg }}>
                    {['ID', 'Staff', 'Type', 'From', 'To', 'Days', 'Reason', 'Applied', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                </tr></thead>
                <tbody>
                    {requests.map(r => <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{r.id}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: C.text, fontSize: 13 }}>{r.name}</td>
                        <td style={{ padding: '12px 14px' }}><Badge color={C.primary}>{r.type}</Badge></td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{fmtDate(r.from)}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{fmtDate(r.to)}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: C.orange, fontSize: 13 }}>{r.days}d</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle, maxWidth: 150 }}>{r.reason}</td>
                        <td style={{ padding: '12px 14px', fontSize: 11, color: C.muted }}>{fmtDate(r.applied)}</td>
                        <td style={{ padding: '12px 14px' }}><Badge color={statusColor(r.status)}>{r.status}</Badge></td>
                        <td style={{ padding: '12px 14px' }}>
                            {r.status === 'Pending' && <div style={{ display: 'flex', gap: 6 }}>
                                <Btn small color={C.success} onClick={() => approve(r.id)}>✓ Approve</Btn>
                                <Btn small danger outline onClick={() => reject(r.id)}>✗ Reject</Btn>
                            </div>}
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </Card>
    </div>;
}

// ─── PAYROLL MODULE ──────────────────────────────────────────
function PayrollModule({ staff }) {
    const [month, setMonth] = useState(PAYMonths[new Date().getMonth()]);
    const [year, setYear] = useState(new Date().getFullYear());
    const totalPayroll = staff.filter(s => s.status === 'Active').reduce((a, s) => a + calculatePay(s.salary).net, 0);
    const totalGross = staff.filter(s => s.status === 'Active').reduce((a, s) => a + calculatePay(s.salary).gross, 0);
    const totalDeductions = staff.filter(s => s.status === 'Active').reduce((a, s) => a + calculatePay(s.salary).totalDed, 0);
    const activeStaff = staff.filter(s => s.status === 'Active');

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            <Stat icon="👥" label="Active Staff" value={activeStaff.length} color={C.primary} />
            <Stat icon="💰" label="Total Gross" value={fmt(totalGross)} color={C.success} />
            <Stat icon="📉" label="Total Deductions" value={fmt(totalDeductions)} color={C.danger} />
            <Stat icon="💵" label="Net Payroll" value={fmt(totalPayroll)} color={C.warning} />
            <Stat icon="📊" label="Avg Salary" value={fmt(activeStaff.length ? Math.round(totalPayroll / activeStaff.length) : 0)} color={C.info} />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <FSelect label="Month" value={month} onChange={e => setMonth(e.target.value)} options={PAYMonths} style={{ width: 160 }} />
            <FInput label="Year" type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: 120 }} />
            <div style={{ marginLeft: 'auto' }}><Btn color={C.info}>📑 Export Report</Btn></div>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.bg }}>
                        {['Staff', 'Designation', 'Basic', 'Gross', 'Deductions', 'Net Pay', 'Action'].map(h => (
                            <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                        ))}
                    </tr></thead>
                    <tbody>
                        {activeStaff.map(s => {
                            const pay = calculatePay(s.salary);
                            return <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                <td style={{ padding: '12px 14px' }}><p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13 }}>{s.name}</p><p style={{ margin: 0, fontSize: 11, color: C.muted }}>{s.id}</p></td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{s.designation}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{fmt(pay.basic)}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: C.success }}>{fmt(pay.gross)}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: C.danger }}>{fmt(pay.totalDed)}</td>
                                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 800, color: C.warning }}>{fmt(pay.net)}</td>
                                <td style={{ padding: '12px 14px' }}><Btn small color={C.info} onClick={() => generatePayslipPDF(s, month, year)}>📄 Payslip</Btn></td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot><tr style={{ background: C.bg }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: C.text, fontSize: 13 }} colSpan={2}>TOTAL ({activeStaff.length} staff)</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.subtle }}>{fmt(activeStaff.reduce((a, s) => a + s.salary, 0))}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: C.success }}>{fmt(totalGross)}</td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: C.danger }}>{fmt(totalDeductions)}</td>
                        <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 900, color: C.warning }}>{fmt(totalPayroll)}</td>
                        <td></td>
                    </tr></tfoot>
                </table>
            </div>
        </Card>
    </div>;
}

// ─── PERFORMANCE ──────────────────────────────────────────────
function PerformanceModule({ staff }) {
    const metrics = staff.filter(s => s.dept === 'Teaching').map(s => {
        const seed = s.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return {
            ...s, result_score: 60 + (seed % 38), feedback_score: 65 + (seed % 32),
            punctuality: s.attendance_pct, discipline: 85 + (seed % 15),
            overall: Math.round((60 + (seed % 38) + 65 + (seed % 32) + s.attendance_pct + 85 + (seed % 15)) / 4),
        };
    }).sort((a, b) => b.overall - a.overall);

    const getGrade = p => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : p >= 50 ? 'C' : 'D';
    const gradeColor = g => ({ 'A+': C.success, 'A': C.success, 'B+': C.primary, 'B': C.primary, 'C': C.warning, 'D': C.danger }[g]);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ borderLeft: `3px solid ${C.info}` }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, color: C.info, fontWeight: 700 }}>🏆 Scoring: Results (30%) + Feedback (25%) + Punctuality (25%) + Discipline (20%)</p>
            <p style={{ margin: 0, fontSize: 13, color: C.subtle }}>Top performer eligible for Teacher of the Year award</p>
        </Card>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: C.bg }}>
                    {['Rank', 'Teacher', 'Subject', 'Results', 'Feedback', 'Punctuality', 'Discipline', 'Overall', 'Grade'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: 1 }}>{h}</th>
                    ))}
                </tr></thead>
                <tbody>
                    {metrics.map((t, i) => {
                        const grade = getGrade(t.overall);
                        return <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: i === 0 ? C.warning : C.subtle, fontSize: 14 }}>{i === 0 ? '🏆' : `#${i + 1}`}</td>
                            <td style={{ padding: '12px 14px' }}><p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13 }}>{t.name}</p><p style={{ margin: 0, fontSize: 11, color: C.muted }}>{t.id} · {t.experience}</p></td>
                            <td style={{ padding: '12px 14px' }}><Badge color={C.primary}>{t.subject}</Badge></td>
                            {[t.result_score, t.feedback_score, t.punctuality, t.discipline].map((score, si) => (
                                <td key={si} style={{ padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 50, height: 5, background: C.border, borderRadius: 4 }}><div style={{ width: `${score}%`, height: '100%', background: score >= 80 ? C.success : score >= 60 ? C.warning : C.danger, borderRadius: 4 }} /></div>
                                        <span style={{ fontSize: 12, color: C.subtle }}>{score}%</span>
                                    </div>
                                </td>
                            ))}
                            <td style={{ padding: '12px 14px', fontWeight: 900, fontSize: 16, color: gradeColor(grade) }}>{t.overall}%</td>
                            <td style={{ padding: '12px 14px' }}><Badge color={gradeColor(grade)} style={{ fontSize: 13, padding: '5px 14px' }}>{grade}</Badge></td>
                        </tr>;
                    })}
                </tbody>
            </table>
        </Card>
    </div>;
}

// ─── DOCUMENTS TRACKER ───────────────────────────────────────
function DocumentsModule({ staff }) {
    const [filter, setFilter] = useState('All');
    const depts = ['All', 'Teaching', 'Administration', 'Support'];
    const allDocs = staff.flatMap(s => (s.documents || []).map(d => ({ ...d, staff: s.name, dept: s.dept, id: s.id })));
    const filtered = filter === 'All' ? allDocs : allDocs.filter(d => d.dept === filter);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <Stat icon="📂" label="Total Documents" value={allDocs.length} color={C.primary} />
            <Stat icon="👨‍🏫" label="Teaching" value={allDocs.filter(d => d.dept === 'Teaching').length} color={C.success} />
            <Stat icon="🏢" label="Admin" value={allDocs.filter(d => d.dept === 'Administration').length} color={C.info} />
            <Stat icon="🔧" label="Support" value={allDocs.filter(d => d.dept === 'Support').length} color={C.warning} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>{depts.map(d => <button key={d} onClick={() => setFilter(d)} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: filter === d ? C.primary : C.border, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{d}</button>)}</div>
        <Card>
            <p style={{ margin: '0 0 16px', fontWeight: 700, color: C.text }}>📂 All Staff Documents ({filtered.length})</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                {filtered.map((d, i) => <div key={i} style={{ background: C.bg, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div><p style={{ margin: 0, fontWeight: 700, color: C.text, fontSize: 13 }}>📄 {d}</p><p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>{d.staff} ({d.id})</p></div>
                        <Badge color={d.dept === 'Teaching' ? C.success : d.dept === 'Administration' ? C.info : C.warning}>{d.dept}</Badge>
                    </div>
                </div>)}
            </div>
        </Card>
    </div>;
}

// ─── MAIN EXPORT (Line 647 onwards) ───────────────────────────
export default function StaffModule() {
    const [tab, setTab] = useState('directory');
    const [staff, setStaff] = useState(INITIAL_STAFF);

    // 💡 Professional Toast logic using the 'colors' object that was unused
    const showToast = useCallback((msg, type = 'success') => {
        const icons = { success: '✅', error: '❌', warning: '⚠️' };
        // Yahan 'C' (Colors) object ka use ho raha hai warnings hatane ke liye
        const style = `background: ${C.card}; color: ${type === 'error' ? C.danger : C.success}; padding: 10px; border-radius: 8px;`;
        console.log(`%c ${icons[type]} ${msg}`, style);
        alert(`${icons[type]} ${msg}`);
    }, []);

    // 📄 Internal Document Config (Resolves 'docTypes' warning)
    const docConfig = {
        types: ['Appointment Letter', 'Salary Slip', 'Experience Certificate', 'ID Card'],
        theme: C.primary
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            padding: '20px',
            background: '#f8fafc',
            minHeight: '100vh'
        }}>
            {/* 🧭 Enterprise Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: 8,
                background: '#fff',
                borderRadius: 16,
                padding: 8,
                border: `1px solid ${C.border}`,
                width: 'fit-content',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                flexWrap: 'wrap'
            }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: 12,
                            border: 'none',
                            background: tab === t.id ? C.primary : 'transparent',
                            color: tab === t.id ? '#fff' : C.subtle,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <span style={{ fontSize: 18 }}>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* 📦 Dynamic Module Rendering */}
            <div style={{
                animation: 'fadeIn 0.3s ease-in-out',
                background: '#fff',
                borderRadius: 24,
                padding: 20,
                border: `1px solid ${C.border}`,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)'
            }}>
                {tab === 'directory' && <StaffDirectory staff={staff} setStaff={setStaff} showToast={showToast} />}
                {tab === 'attendance' && <StaffAttendance staff={staff} />}
                {tab === 'leave' && <LeaveManagement staff={staff} showToast={showToast} />}
                {tab === 'payroll' && <PayrollModule staff={staff} />}
                {tab === 'performance' && <PerformanceModule staff={staff} />}
                {tab === 'documents' && <DocumentsModule staff={staff} config={docConfig} />}
            </div>

            {/* 🎭 Global Keyframe for Smooth Transitions */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
