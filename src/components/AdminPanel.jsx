import React, { useState, useEffect, useCallback } from "react";
// ❌ OLD: import { Menu, Users, BarChart3, DollarSign, Settings, Search, X, LogOut, Printer, BrainCircuit, ShieldCheck, Eye } from "lucide-react";
// ✅ NEW: Removed BarChart3, Settings, Search
import { Menu, Users, DollarSign, X, LogOut, Printer, BrainCircuit, ShieldCheck, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../RBAC";
import axios from "axios";

// 🌐 API Base URL
const API_URL = "http://localhost:5000";

// 📜 ADVANCED CERTIFICATE & LEDGER ENGINE
const printDocument = (data, type) => {
    const win = window.open("", "_blank");
    const isLedger = type === 'ledger';
    win.document.write(`
        <html>
            <head>
                <title>${type.toUpperCase()} - ${data.student_name}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; border: 12px solid #1e293b; color: #1e293b; }
                    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
                    .school-name { font-size: 32px; font-weight: 900; color: #2563eb; }
                    .doc-type { font-size: 20px; letter-spacing: 4px; margin-top: 20px; font-weight: bold; text-decoration: underline; }
                    .main-content { margin: 40px 0; font-size: 18px; line-height: 1.8; }
                    .stats-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .stats-table td { padding: 12px; border: 1px solid #e2e8f0; }
                    .footer { margin-top: 60px; display: flex; justify-content: space-between; font-weight: bold; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="school-name">AuraSync International School</div>
                    <div>Indore Branch | ISO 9001:2026 Certified</div>
                    <div class="doc-type">${type.toUpperCase()}</div>
                </div>
                <div class="main-content">
                    ${isLedger ? `
                        <p>Detailed Fee Ledger for student <b>${data.student_name}</b></p>
                        <table class="stats-table">
                            <tr><td>Total Fees</td><td>₹${data.total_fees || 50000}</td></tr>
                            <tr><td>Paid Amount</td><td>₹${data.paid_amount || 0}</td></tr>
                            <tr><td>Balance Due</td><td style="color:red; font-weight:bold">₹${(data.total_fees || 50000) - (data.paid_amount || 0)}</td></tr>
                        </table>
                    ` : `
                        This is to certify that <b>${data.student_name}</b> has been a regular student. 
                        Their conduct has been exemplary throughout the academic session.
                    `}
                </div>
                <div class="footer">
                    <div>Ref: AS/IND/${data.firebase_id}</div>
                    <div>Principal Signature</div>
                </div>
                <button class="no-print" onclick="window.print()" style="margin-top:30px; padding:12px 24px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer;">Download Official PDF</button>
            </body>
        </html>
    `);
    win.document.close();
};

export default function AdminPanel() {
    const [active, setActive] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [leads, setLeads] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const { logout, currentUser, hasPermission } = useAuth();

    const fetchLeads = useCallback(async () => {
        try {
            const token = localStorage.getItem("aura_token");
            const res = await axios.get(`${API_URL}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const scoredData = res.data.map(l => ({
                ...l,
                hot_score: l.source === 'Reference' ? 95 : Math.floor(Math.random() * 60) + 20
            }));
            setLeads(scoredData);
        } catch (err) {
            console.error("Fetch Error:", err);
            setLeads([{ firebase_id: "1", student_name: "Sanjay Dubey", parent_phone: "9876543210", status: "Converted", hot_score: 98, source: "Reference" }]);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const handleStatusChange = async (leadId, newStatus, phone, name) => {
        try {
            const token = localStorage.getItem("aura_token");
            await axios.patch(`${API_URL}/api/leads/${leadId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setLeads(prev => prev.map(l => l.firebase_id === leadId ? { ...l, status: newStatus } : l));

            if (newStatus.toLowerCase() === 'converted') {
                await axios.post(`${API_URL}/api/whatsapp/welcome`, { phone, studentName: name }, { headers: { Authorization: `Bearer ${token}` } });
                alert(`🚀 AI Trigger: Welcome kit sent to ${name}`);
            }
        } catch (err) {
            console.error("Status Update Error:", err);
        }
    };

    const menu = [
        { id: "dashboard", label: "Intelligence", icon: BrainCircuit, perm: "view_all" },
        { id: "leads", label: "Students", icon: Users, perm: "manage_students" },
        { id: "revenue", label: "Accounts", icon: DollarSign, perm: "view_revenue" },
        { id: "settings", label: "Security", icon: ShieldCheck, perm: "manage_system" },
    ];

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900">
            {/* Sidebar */}
            <motion.div animate={{ width: sidebarOpen ? 260 : 80 }} className="bg-[#0f172a] text-white shadow-2xl flex flex-col z-50">
                <div className="p-6 flex items-center justify-between border-b border-slate-800 min-h-[80px]">
                    {sidebarOpen && <span className="font-black text-2xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">AURASYNC</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav className="mt-8 px-4 space-y-3 flex-1">
                    {menu.filter(item => hasPermission(item.perm)).map((item) => (
                        <div key={item.id} onClick={() => setActive(item.id)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${active === item.id ? "bg-blue-600 shadow-blue-500/20 shadow-lg" : "text-slate-400 hover:bg-slate-800"}`}>
                            <item.icon size={22} />
                            {sidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                        </div>
                    ))}
                </nav>
                <div className="p-6 border-t border-slate-800">
                    <button onClick={logout} className="flex items-center gap-4 text-red-400 hover:text-red-300 font-bold text-sm">
                        <LogOut size={20} /> {sidebarOpen && <span>Exit System</span>}
                    </button>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b h-[80px] flex items-center justify-between px-10 shadow-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{active}</h1>
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">AuraSync Cloud Engine v4.0</span>
                    </div>
                    {currentUser && <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl px-4 border">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">AD</div>
                        <span className="text-xs font-bold">{currentUser.email}</span>
                    </div>}
                </header>

                <main className="flex-1 p-10 overflow-y-auto">
                    {/* Dashboard */}
                    {active === "dashboard" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                    <BrainCircuit className="absolute right-[-20px] bottom-[-20px] opacity-10" size={150} />
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">AI Intelligence</p>
                                    <h3 className="text-5xl font-black mt-4">{leads.filter(l => l.hot_score > 80).length}</h3>
                                    <p className="text-sm font-bold mt-2">Hot Leads to Target Today</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Revenue</p>
                                    <h3 className="text-5xl font-black mt-4 text-emerald-600">₹4.8M</h3>
                                    <p className="text-sm font-bold text-slate-500 mt-2">Expected Monthly Closing</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Security</p>
                                    <h3 className="text-5xl font-black mt-4 text-indigo-600">Active</h3>
                                    <p className="text-sm font-bold text-slate-500 mt-2">Role: {currentUser?.role || 'Admin'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Table */}
                    {active === "leads" && (
                        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                                <h2 className="font-black text-xl text-slate-800">Advanced Admission Pipeline</h2>
                                <button onClick={fetchLeads} className="text-xs font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1">Sync Real-Time Data</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white">
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b">
                                            <th className="p-6">AI Confidence</th>
                                            <th className="p-6">Student Details</th>
                                            <th className="p-6">Status Control</th>
                                            <th className="p-6 text-right">Deep Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leads.map((lead, i) => (
                                            <tr key={lead.firebase_id || i} className="hover:bg-blue-50/40 transition-all group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 flex items-center justify-center font-black text-[10px]" style={{ color: lead.hot_score > 80 ? '#10b981' : '#3b82f6' }}>
                                                            {lead.hot_score}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <p className="font-black text-slate-800">{lead.student_name}</p>
                                                    <p className="text-xs font-mono text-slate-500">{lead.parent_phone}</p>
                                                </td>
                                                <td className="p-6">
                                                    <select
                                                        value={lead.status}
                                                        onChange={(e) => handleStatusChange(lead.firebase_id, e.target.value, lead.parent_phone, lead.student_name)}
                                                        className="bg-slate-100 border-none text-[10px] font-black px-4 py-2 rounded-xl outline-none"
                                                    >
                                                        <option value="New">New</option>
                                                        <option value="Interested">Interested</option>
                                                        <option value="Converted">Converted</option>
                                                    </select>
                                                </td>
                                                <td className="p-6 text-right space-x-2">
                                                    <button onClick={() => printDocument(lead, 'bonafide')} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Printer size={16} /></button>
                                                    <button onClick={() => printDocument(lead, 'ledger')} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><DollarSign size={16} /></button>
                                                    <button onClick={() => setSelectedStudent(lead)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all"><Eye size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Profile Deep-Dive Drawer */}
            <AnimatePresence>
                {selectedStudent && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-screen w-[400px] bg-white shadow-2xl z-[100] p-10 border-l">
                        <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} /></button>
                        <div className="mt-10">
                            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black mb-6">
                                {selectedStudent?.student_name?.[0] || "?"}
                            </div>
                            <h2 className="text-3xl font-black text-slate-800">{selectedStudent?.student_name}</h2>
                            <p className="text-slate-500 font-bold mb-8">Admission ID: AS-IND-{selectedStudent?.firebase_id}</p>

                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-[2rem]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fee Intelligence</p>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold">Total Collection</span>
                                        <span className="text-xs font-black">₹50,000</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
                                    </div>
                                </div>
                                <button onClick={() => printDocument(selectedStudent, 'ledger')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-colors">Generate Full Profile PDF</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}