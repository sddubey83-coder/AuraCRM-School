/**
 * School OS — Multi-App Ecosystem
 * Student App, Teacher App, Parent App — sab ek jagah
 * Usage: import MultiApp from './MultiApp'
 */

import { useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";

const API = "https://aura-school-backend.onrender.com";

// ── Shared Components ──────────────────────────────────────

function AppShell({ title, subtitle, color, icon, children }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.02)", border: `0.5px solid rgba(255,255,255,0.08)`,
            borderRadius: 16, overflow: "hidden"
        }}>
            {/* App Header */}
            <div style={{
                background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                borderBottom: `0.5px solid ${color}33`,
                padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 12
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${color}22`, border: `0.5px solid ${color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20
                }}>{icon}</div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{subtitle}</div>
                </div>
            </div>
            <div style={{ padding: 16 }}>{children}</div>
        </div>
    );
}

function InfoRow({ label, value, color }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: color || "#fff" }}>{value}</span>
        </div>
    );
}

function ActionBtn({ label, color, onClick }) {
    return (
        <button onClick={onClick} style={{
            background: `${color}22`, border: `0.5px solid ${color}44`,
            color: color, padding: "8px 16px", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: "pointer", width: "100%",
            marginTop: 8
        }}>{label}</button>
    );
}

// ── Student App ────────────────────────────────────────────
function StudentApp({ leads }) {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const students = leads.filter(l => l.status === "converted");

    const seed = selectedStudent ? selectedStudent.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
    const attendance = 65 + (seed % 35);
    const performance = 50 + ((seed * 3) % 50);
    const feesPaid = (seed % 3) !== 0;

    return (
        <AppShell title="Student App" subtitle="Academic dashboard" color="#60a5fa" icon="👨‍🎓">
            {!selectedStudent ? (
                <div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Select student:</div>
                    {students.length === 0 && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 20 }}>
                            No converted students yet
                        </div>
                    )}
                    {students.map(s => (
                        <div key={s.id} onClick={() => setSelectedStudent(s)} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                            background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 6,
                            cursor: "pointer", border: "0.5px solid rgba(255,255,255,0.07)"
                        }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(96,165,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>
                                {(s.student_name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.student_name}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.branch}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ fontWeight: 600 }}>{selectedStudent.student_name}</div>
                        <button onClick={() => setSelectedStudent(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12 }}>← Back</button>
                    </div>
                    <InfoRow label="Attendance" value={`${attendance}%`} color={attendance >= 75 ? "#34d399" : "#f472b6"} />
                    <InfoRow label="Performance" value={`${performance}%`} color={performance >= 60 ? "#60a5fa" : "#fbbf24"} />
                    <InfoRow label="Fees Status" value={feesPaid ? "Paid ✅" : "Pending ❌"} color={feesPaid ? "#34d399" : "#f472b6"} />
                    <InfoRow label="Branch" value={selectedStudent.branch} />
                    <InfoRow label="Source" value={selectedStudent.source} />
                    <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Subjects:</div>
                        {["Math", "Science", "English", "Hindi"].map((sub, i) => {
                            const marks = 40 + ((seed + i * 7) % 60);
                            return (
                                <div key={sub} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 12 }}>{sub}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                                            <div style={{ width: `${marks}%`, height: "100%", background: marks >= 60 ? "#34d399" : "#fbbf24", borderRadius: 2 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", minWidth: 28 }}>{marks}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AppShell>
    );
}

// ── Teacher App ────────────────────────────────────────────
function TeacherApp({ leads }) {
    const [marked, setMarked] = useState({});
    const [activeClass, setActiveClass] = useState("Class 8");
    const classes = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
    const students = leads.filter(l => l.status === "converted");

    const markAttendance = async (studentId, status) => {
        setMarked(m => ({ ...m, [studentId]: status }));
        try {
            await fetch(`${API}/automation/attendance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_id: studentId,
                    date: new Date().toISOString().split("T")[0],
                    status: status,
                    marked_by: "Teacher App"
                })
            });
        } catch (e) { }
    };

    const presentCount = Object.values(marked).filter(v => v === "present").length;
    const absentCount = Object.values(marked).filter(v => v === "absent").length;

    return (
        <AppShell title="Teacher App" subtitle="Attendance & marks" color="#34d399" icon="👩‍🏫">
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {classes.map(c => (
                    <button key={c} onClick={() => setActiveClass(c)} style={{
                        background: activeClass === c ? "rgba(52,211,153,0.2)" : "transparent",
                        border: `0.5px solid ${activeClass === c ? "#34d399" : "rgba(255,255,255,0.1)"}`,
                        color: activeClass === c ? "#34d399" : "rgba(255,255,255,0.4)",
                        padding: "4px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer"
                    }}>{c}</button>
                ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "rgba(52,211,153,0.1)", borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#34d399" }}>{presentCount}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Present</div>
                </div>
                <div style={{ background: "rgba(244,114,182,0.1)", borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f472b6" }}>{absentCount}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Absent</div>
                </div>
                <div style={{ background: "rgba(96,165,250,0.1)", borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>{students.length - presentCount - absentCount}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Pending</div>
                </div>
            </div>

            {students.length === 0 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 20 }}>No students yet</div>
            )}
            {students.map(s => (
                <div key={s.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)"
                }}>
                    <span style={{ fontSize: 13 }}>{s.student_name}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => markAttendance(s.id, "present")} style={{
                            background: marked[s.id] === "present" ? "rgba(52,211,153,0.3)" : "transparent",
                            border: "0.5px solid rgba(52,211,153,0.4)", color: "#34d399",
                            padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: marked[s.id] === "present" ? 700 : 400
                        }}>P</button>
                        <button onClick={() => markAttendance(s.id, "absent")} style={{
                            background: marked[s.id] === "absent" ? "rgba(244,114,182,0.3)" : "transparent",
                            border: "0.5px solid rgba(244,114,182,0.4)", color: "#f472b6",
                            padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: marked[s.id] === "absent" ? 700 : 400
                        }}>A</button>
                    </div>
                </div>
            ))}
            {Object.keys(marked).length > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: "#34d399", textAlign: "center" }}>
                    ✅ {Object.keys(marked).length} students marked — WhatsApp auto-sent to absent parents!
                </div>
            )}
        </AppShell>
    );
}

// ── Parent App ────────────────────────────────────────────
function ParentApp({ leads }) {
    const [selectedParent, setSelectedParent] = useState(null);
    const parents = leads.filter(l => l.status === "converted");

    const seed = selectedParent ? selectedParent.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
    const attendance = 65 + (seed % 35);
    const feesPaid = (seed % 3) !== 0;

    return (
        <AppShell title="Parent App" subtitle="Track your child" color="#c084fc" icon="👨‍👩‍👧">
            {!selectedParent ? (
                <div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Select parent:</div>
                    {parents.length === 0 && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 20 }}>No converted students yet</div>
                    )}
                    {parents.map(p => (
                        <div key={p.id} onClick={() => setSelectedParent(p)} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                            background: "rgba(255,255,255,0.03)", borderRadius: 10, marginBottom: 6,
                            cursor: "pointer", border: "0.5px solid rgba(255,255,255,0.07)"
                        }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(192,132,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#c084fc" }}>
                                {(p.parent_name || p.student_name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.parent_name || "Parent"}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Ward: {p.student_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ fontWeight: 600 }}>Ward: {selectedParent.student_name}</div>
                        <button onClick={() => setSelectedParent(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12 }}>← Back</button>
                    </div>

                    <div style={{ background: "rgba(192,132,252,0.08)", border: "0.5px solid rgba(192,132,252,0.2)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Today's Update</div>
                        <div style={{ fontSize: 13, color: "#fff" }}>
                            {attendance >= 75 ? "✅ Present today" : "❌ Absent today — school ne notify kiya"}
                        </div>
                    </div>

                    <InfoRow label="Attendance" value={`${attendance}%`} color={attendance >= 75 ? "#34d399" : "#f472b6"} />
                    <InfoRow label="Fees Status" value={feesPaid ? "Paid ✅" : "₹25,000 Pending"} color={feesPaid ? "#34d399" : "#f472b6"} />
                    <InfoRow label="Branch" value={selectedParent.branch} />
                    <InfoRow label="Contact" value={selectedParent.parent_phone} />

                    <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Recent Notifications:</div>
                        {[
                            { msg: "Attendance marked — Present", time: "9:15 AM", color: "#34d399" },
                            { msg: "Fee reminder — Due in 3 days", time: "Yesterday", color: "#fbbf24" },
                            { msg: "PTM scheduled — Saturday 10 AM", time: "2 days ago", color: "#60a5fa" },
                        ].map((n, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ fontSize: 12, color: n.color }}>{n.msg}</span>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{n.time}</span>
                            </div>
                        ))}
                    </div>

                    {!feesPaid && (
                        <ActionBtn label="Pay Fees Now — Razorpay (Coming Soon)" color="#fbbf24" onClick={() => alert("Razorpay integration jaldi aayega!")} />
                    )}
                </div>
            )}
        </AppShell>
    );
}

// ── Main Multi-App Component ───────────────────────────────
export default function MultiApp() {
    const [leads, setLeads] = useState([]);
    const [activeApp, setActiveApp] = useState("student");

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "leads"), snap => {
            setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    const apps = [
        { id: "student", label: "Student App", icon: "👨‍🎓" },
        { id: "teacher", label: "Teacher App", icon: "👩‍🏫" },
        { id: "parent", label: "Parent App", icon: "👨‍👩‍👧" },
    ];

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                    Multi-App Ecosystem
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>School OS Apps</div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {apps.map(a => (
                    <button key={a.id} onClick={() => setActiveApp(a.id)} style={{
                        background: activeApp === a.id ? "rgba(255,255,255,0.08)" : "transparent",
                        border: `0.5px solid ${activeApp === a.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
                        color: activeApp === a.id ? "#fff" : "rgba(255,255,255,0.4)",
                        padding: "8px 16px", borderRadius: 10, fontSize: 13,
                        cursor: "pointer", fontWeight: activeApp === a.id ? 600 : 400,
                        display: "flex", alignItems: "center", gap: 6
                    }}>
                        <span style={{ fontSize: 16 }}>{a.icon}</span> {a.label}
                    </button>
                ))}
            </div>

            {activeApp === "student" && <StudentApp leads={leads} />}
            {activeApp === "teacher" && <TeacherApp leads={leads} />}
            {activeApp === "parent" && <ParentApp leads={leads} />}
        </div>
    );
}
