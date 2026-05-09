import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL;

const FLOW_COLORS = {
    admission: { bg: "#e8f5ef", text: "#085041", border: "#5dcaa5", dark: "#2d6a4f" },
    attendance: { bg: "#e3f0f8", text: "#0c447c", border: "#85b7eb", dark: "#1e6091" },
    fees: { bg: "#fff3e8", text: "#712B13", border: "#fac775", dark: "#e85d04" },
    exam: { bg: "#f3e8f7", text: "#3C3489", border: "#afa9ec", dark: "#7b2d8b" },
};

function FlowCard({ title, color, children, onRun, running }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: `0.5px solid rgba(255,255,255,0.08)`, borderRadius: 14, padding: "18px 16px", borderTop: `3px solid ${color.dark}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{title}</span>
                {onRun && (
                    <button onClick={onRun} disabled={running} style={{ background: color.dark, border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: running ? "not-allowed" : "pointer", opacity: running ? 0.6 : 1, fontWeight: 500 }}>
                        {running ? "Running..." : "Run"}
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

function Field({ label, value, type = "text", onChange, placeholder, options }) {
    const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, marginTop: 4 };
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</div>
            {type === "select" ? (
                <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} style={inputStyle} />
            )}
        </div>
    );
}

function ResultBox({ result }) {
    if (!result) return null;
    return (
        <div style={{ background: result.success ? "rgba(45,106,79,0.15)" : "rgba(201,24,74,0.15)", border: `0.5px solid ${result.success ? "rgba(45,106,79,0.3)" : "rgba(201,24,74,0.3)"}`, borderRadius: 10, padding: "12px 14px", marginTop: 12, fontSize: 12 }}>
            {result.success ? "✅" : "❌"} {result.message || result.invoice_no || (result.success ? "Done!" : "Error")}
            {result.student_id && <div style={{ color: "rgba(255,255,255,0.5)", marginTop: 4 }}>ID: {result.student_id}</div>}
            {result.grade && <div style={{ color: "#fbbf24", marginTop: 4 }}>Grade: {result.grade} ({result.percentage}%) — {result.passed ? "PASS ✅" : "FAIL ❌"}</div>}
            {result.invoice_no && <div style={{ color: "#60a5fa", marginTop: 4 }}>Invoice: {result.invoice_no} | Balance: ₹{result.balance_pending?.toLocaleString("en-IN")}</div>}
        </div>
    );
}

export default function AutomationDashboard() {
    const [activeFlow, setActiveFlow] = useState("admission");
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState({});
    const [logs, setLogs] = useState([]);
    const [analytics, setAnalytics] = useState({ teachers: [], insights: [] });

    const [admission, setAdmission] = useState({ student_name: "", parent_name: "", parent_phone: "", class_name: "Class 6", branch: "Indore Main", fees_total: "45000", source: "Walk-in" });
    const [attendance, setAttendance] = useState({ student_id: "", date: new Date().toISOString().split("T")[0], status: "present", marked_by: "Teacher" });
    const [fees, setFees] = useState({ student_id: "", amount: "", payment_method: "cash", received_by: "Admin" });
    const [exam, setExam] = useState({ student_id: "", subject: "Math", marks_obtained: "", total_marks: "100", exam_type: "unit_test" });

    async function fetchData() {
        try {
            const token = localStorage.getItem('aura_token');
            const headers = { Authorization: `Bearer ${token}` };
            const logRes = await fetch(`${API}/automation/logs`, { headers });
            const logData = await logRes.json();
            setLogs(logData.logs || []);
            const tRes = await fetch(`${API}/automation/analytics/teachers`, { headers });
            const pRes = await fetch(`${API}/automation/analytics/parents`, { headers });
            const tData = await tRes.json();
            const pData = await pRes.json();
            setAnalytics({ teachers: tData.teachers || [], insights: pData.insights || [] });
        } catch (e) {
            console.error("Sync Error:", e);
        }
    }

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    async function callAPI(endpoint, body, flowKey) {
        setRunning(true);
        try {
            const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            setResults(r => ({ ...r, [flowKey]: data }));
            fetchData();
        } catch (e) {
            setResults(r => ({ ...r, [flowKey]: { success: false, message: "API Error — backend running?" } }));
        }
        setRunning(false);
    }

    async function runDemo() {
        setRunning(true);
        try {
            const res = await fetch(`${API}/automation/demo/run-all`);
            const data = await res.json();
            setResults(r => ({ ...r, demo: data }));
            fetchData();
        } catch (e) {
            setResults(r => ({ ...r, demo: { success: false, message: "API Error" } }));
        }
        setRunning(false);
    }

    const flows = [
        { id: "admission", label: "Admission" },
        { id: "attendance", label: "Attendance" },
        { id: "fees", label: "Fees" },
        { id: "exam", label: "Exam" },
        { id: "analytics", label: "Analytics" },
        { id: "logs", label: `Logs (${logs.length})` },
    ];

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Automation Layer — Zero Manual Work</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Smart Workflows</div>
                </div>
                <button onClick={runDemo} disabled={running} style={{ background: "rgba(123,45,139,0.3)", border: "0.5px solid rgba(123,45,139,0.5)", color: "#c084fc", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                    Run Full Demo ↗
                </button>
            </div>

            <div style={{ display: "flex", gap: 4, borderBottom: "0.5px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
                {flows.map(f => (
                    <button key={f.id} onClick={() => setActiveFlow(f.id)} style={{ background: "transparent", border: "none", color: activeFlow === f.id ? "#c084fc" : "rgba(255,255,255,0.4)", padding: "7px 14px", fontSize: 12, cursor: "pointer", fontWeight: activeFlow === f.id ? 600 : 400, borderBottom: activeFlow === f.id ? "2px solid #c084fc" : "2px solid transparent", marginBottom: -1 }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {activeFlow === "admission" && (
                <FlowCard title="Admission → Auto ID → WhatsApp Welcome" color={FLOW_COLORS.admission}
                    onRun={() => callAPI("/automation/admission", { ...admission, fees_total: parseFloat(admission.fees_total) }, "admission")} running={running}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <Field label="Student Name" value={admission.student_name} onChange={v => setAdmission(a => ({ ...a, student_name: v }))} placeholder="Ravi Sharma" />
                        <Field label="Parent Name" value={admission.parent_name} onChange={v => setAdmission(a => ({ ...a, parent_name: v }))} placeholder="Mohan Sharma" />
                        <Field label="Parent Phone" value={admission.parent_phone} onChange={v => setAdmission(a => ({ ...a, parent_phone: v }))} placeholder="9109203458" />
                        <Field label="Fees Total (₹)" value={admission.fees_total} onChange={v => setAdmission(a => ({ ...a, fees_total: v }))} placeholder="45000" />
                        <Field label="Class" value={admission.class_name} type="select" onChange={v => setAdmission(a => ({ ...a, class_name: v }))} options={["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"]} />
                        <Field label="Source" value={admission.source} type="select" onChange={v => setAdmission(a => ({ ...a, source: v }))} options={["Walk-in", "Reference", "Online", "Camp"]} />
                    </div>
                    <ResultBox result={results.admission} />
                </FlowCard>
            )}

            {activeFlow === "attendance" && (
                <FlowCard title="Attendance → Auto WhatsApp to Parent" color={FLOW_COLORS.attendance}
                    onRun={() => callAPI("/automation/attendance", attendance, "attendance")} running={running}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <Field label="Student ID" value={attendance.student_id} onChange={v => setAttendance(a => ({ ...a, student_id: v }))} placeholder="INM26C8123" />
                        <Field label="Date" type="date" value={attendance.date} onChange={v => setAttendance(a => ({ ...a, date: v }))} />
                        <Field label="Status" value={attendance.status} type="select" onChange={v => setAttendance(a => ({ ...a, status: v }))} options={["present", "absent", "late"]} />
                        <Field label="Marked By" value={attendance.marked_by} onChange={v => setAttendance(a => ({ ...a, marked_by: v }))} placeholder="Teacher Name" />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Absent → Auto WhatsApp parent · 3+ absences → Urgent alert</div>
                    <ResultBox result={results.attendance} />
                </FlowCard>
            )}

            {activeFlow === "fees" && (
                <FlowCard title="Fees → Auto Invoice → WhatsApp Receipt" color={FLOW_COLORS.fees}
                    onRun={() => callAPI("/automation/fees/payment", { ...fees, amount: parseFloat(fees.amount) }, "fees")} running={running}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <Field label="Student ID" value={fees.student_id} onChange={v => setFees(f => ({ ...f, student_id: v }))} placeholder="INM26C8123" />
                        <Field label="Amount (₹)" value={fees.amount} onChange={v => setFees(f => ({ ...f, amount: v }))} placeholder="15000" />
                        <Field label="Payment Method" value={fees.payment_method} type="select" onChange={v => setFees(f => ({ ...f, payment_method: v }))} options={["cash", "online", "cheque", "upi"]} />
                        <Field label="Received By" value={fees.received_by} onChange={v => setFees(f => ({ ...f, received_by: v }))} placeholder="Admin" />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Auto invoice number · WhatsApp receipt · Balance update</div>
                    <ResultBox result={results.fees} />
                </FlowCard>
            )}

            {activeFlow === "exam" && (
                <FlowCard title="Marks → Auto Grade → Report Card" color={FLOW_COLORS.exam}
                    onRun={() => callAPI("/automation/exam/marks", { ...exam, marks_obtained: parseFloat(exam.marks_obtained), total_marks: parseFloat(exam.total_marks) }, "exam")} running={running}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <Field label="Student ID" value={exam.student_id} onChange={v => setExam(e => ({ ...e, student_id: v }))} placeholder="INM26C8123" />
                        <Field label="Subject" value={exam.subject} type="select" onChange={v => setExam(e => ({ ...e, subject: v }))} options={["Math", "Science", "English", "Hindi", "Social Science", "Computer"]} />
                        <Field label="Marks Obtained" value={exam.marks_obtained} onChange={v => setExam(e => ({ ...e, marks_obtained: v }))} placeholder="72" />
                        <Field label="Total Marks" value={exam.total_marks} onChange={v => setExam(e => ({ ...e, total_marks: v }))} placeholder="100" />
                        <Field label="Exam Type" value={exam.exam_type} type="select" onChange={v => setExam(e => ({ ...e, exam_type: v }))} options={["unit_test", "mid_term", "final", "assignment"]} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>Fail → Alert WhatsApp · 80%+ → Topper congratulations!</div>
                    <ResultBox result={results.exam} />
                </FlowCard>
            )}

            {activeFlow === "analytics" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 14, border: "1px solid rgba(175,169,236,0.2)" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#afa9ec", marginBottom: 15 }}>Teacher Analytics</div>
                        {analytics.teachers.length === 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Data loading...</div>}
                        {analytics.teachers.map((t, i) => (
                            <div key={i} style={{ marginBottom: 12, fontSize: 13, borderBottom: "0.5px solid rgba(255,255,255,0.05)", paddingBottom: 8 }}>
                                <b>{t.name}</b> <span style={{ color: '#52c48a' }}>{t.rating}</span><br />
                                <small style={{ color: 'rgba(255,255,255,0.5)' }}>{t.punctuality} Punctual | Score: {t.avg_class_score}</small>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 14, border: "1px solid rgba(250,199,117,0.2)" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#fac775", marginBottom: 15 }}>Parent Risk Tracking</div>
                        {analytics.insights.length === 0 && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Data loading...</div>}
                        {analytics.insights.map((p, i) => (
                            <div key={i} style={{ marginBottom: 12, fontSize: 13, borderBottom: "0.5px solid rgba(255,255,255,0.05)", paddingBottom: 8 }}>
                                <b>{p.parent}</b> <span style={{ color: p.engagement_score > 70 ? '#52c48a' : '#ff4d4d' }}>{p.status}</span><br />
                                <small style={{ color: 'rgba(255,255,255,0.5)' }}>{p.last_action}</small>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeFlow === "logs" && (
                <div>
                    <button onClick={fetchData} style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", marginBottom: 12 }}>Refresh Logs</button>
                    {logs.length === 0 && <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 32 }}>No logs yet — run a flow first!</div>}
                    {[...logs].reverse().map((log, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: log.type === "WHATSAPP" ? "rgba(45,106,79,0.2)" : "rgba(30,96,145,0.2)", color: log.type === "WHATSAPP" ? "#52c48a" : "#60a5fa", flexShrink: 0 }}>{log.type}</span>
                            <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{log.message || log.action || log.msg_type}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{log.phone || ""}</div>
                        </div>
                    ))}
                </div>
            )}

            {results.demo && (
                <div style={{ marginTop: 16, background: "rgba(123,45,139,0.1)", border: "0.5px solid rgba(123,45,139,0.3)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "#c084fc" }}>Demo Complete!</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                        Student ID: {results.demo.student_id}<br />
                        {results.demo.admission} · {results.demo.attendance}<br />
                        {results.demo.fees} · {results.demo.exam}<br />
                        WhatsApp messages: {results.demo.total_whatsapp_messages}
                    </div>
                </div>
            )}
        </div>
    );
}