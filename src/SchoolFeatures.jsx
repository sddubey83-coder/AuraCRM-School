/**
 * School OS — Timetable + Transport + Marketplace
 * 3 features ek file mein
 */

import { useState } from "react";

// ═══════════════════════════════════════════════════════════
// 1. AUTO TIMETABLE OPTIMIZER
// ═══════════════════════════════════════════════════════════

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["8:00-8:45", "8:45-9:30", "9:30-10:15", "10:15-11:00", "11:15-12:00", "12:00-12:45", "1:30-2:15", "2:15-3:00"];

const SUBJECTS = {
    "Nursery": ["English", "Hindi", "Math", "Drawing", "PT", "Story Time"],
    "LKG": ["English", "Hindi", "Math", "Drawing", "PT", "Rhymes"],
    "UKG": ["English", "Hindi", "Math", "Drawing", "PT", "GK"],
    "Class 1": ["Math", "English", "Hindi", "EVS", "Drawing", "PT"],
    "Class 2": ["Math", "English", "Hindi", "EVS", "Drawing", "PT"],
    "Class 3": ["Math", "English", "Hindi", "EVS", "Computer", "PT"],
    "Class 4": ["Math", "English", "Hindi", "EVS", "Computer", "PT", "GK"],
    "Class 5": ["Math", "English", "Hindi", "Science", "SST", "Computer", "PT"],
    "Class 6": ["Math", "Science", "English", "Hindi", "SST", "Computer", "Art", "PT"],
    "Class 7": ["Math", "Science", "English", "Hindi", "SST", "Computer", "Art", "PT"],
    "Class 8": ["Math", "Science", "English", "Hindi", "SST", "Computer", "Sanskrit", "PT"],
    "Class 9": ["Math", "Science", "English", "Hindi", "SST", "Computer", "Sanskrit", "PT"],
    "Class 10": ["Math", "Science", "English", "Hindi", "SST", "Computer", "Sanskrit", "PT"],
    "Class 11": ["Math", "Physics", "Chemistry", "English", "Computer", "PE"],
    "Class 12": ["Math", "Physics", "Chemistry", "English", "Computer", "PE"],
};
const TEACHERS = [
    { name: "Mrs. Verma", subjects: ["Math", "Computer"] },
    { name: "Mr. Sharma", subjects: ["Science"] },
    { name: "Ms. Patel", subjects: ["English"] },
    { name: "Mrs. Gupta", subjects: ["Hindi", "Sanskrit"] },
    { name: "Mr. Singh", subjects: ["SST"] },
    { name: "Ms. Joshi", subjects: ["Art", "PT"] },
];

function generateTimetable(className) {
    const subjects = SUBJECTS[className] || SUBJECTS["Class 6"];
    const timetable = {};

    DAYS.forEach(day => {
        timetable[day] = {};
        let subjectIndex = 0;
        PERIODS.forEach(period => {
            if (period === "11:00-11:15") {
                timetable[day][period] = { subject: "BREAK", teacher: "", color: "#1f2d3d" };
            } else if (period === "12:45-1:30") {
                timetable[day][period] = { subject: "LUNCH", teacher: "", color: "#1f2d3d" };
            } else {
                const subject = subjects[subjectIndex % subjects.length];
                const teacher = TEACHERS.find(t => t.subjects.includes(subject));
                timetable[day][period] = {
                    subject,
                    teacher: teacher?.name || "TBD",
                    color: getSubjectColor(subject)
                };
                subjectIndex++;
            }
        });
    });
    return timetable;
}
const EXAM_SCHEDULE = {
    "exam": [
        { date: "2026-05-01", day: "Friday", subject: "Math", time: "9:00 AM - 12:00 PM" },
        { date: "2026-05-03", day: "Sunday", subject: "Science", time: "9:00 AM - 12:00 PM" },
        { date: "2026-05-05", day: "Tuesday", subject: "English", time: "9:00 AM - 12:00 PM" },
        { date: "2026-05-07", day: "Thursday", subject: "Hindi", time: "9:00 AM - 12:00 PM" },
        { date: "2026-05-09", day: "Saturday", subject: "SST", time: "9:00 AM - 12:00 PM" },
        { date: "2026-05-12", day: "Tuesday", subject: "Computer", time: "9:00 AM - 12:00 PM" },
        { date: "2026-05-14", day: "Thursday", subject: "Sanskrit", time: "9:00 AM - 12:00 PM" },
    ],
    "test": [
        { date: "2026-05-02", day: "Saturday", subject: "Math", time: "10:00 AM - 11:00 AM" },
        { date: "2026-05-04", day: "Monday", subject: "Science", time: "10:00 AM - 11:00 AM" },
        { date: "2026-05-06", day: "Wednesday", subject: "English", time: "10:00 AM - 11:00 AM" },
        { date: "2026-05-08", day: "Friday", subject: "Hindi", time: "10:00 AM - 11:00 AM" },
        { date: "2026-05-11", day: "Monday", subject: "SST", time: "10:00 AM - 11:00 AM" },
    ]
};

function getSubjectColor(subject) {
    const colors = {
        Math: "#7b2d8b", Science: "#1e6091", English: "#2d6a4f",
        Hindi: "#e85d04", SST: "#854F0B", Computer: "#185FA5",
        Sanskrit: "#c9184a", Art: "#d97706", PT: "#059669",
        BREAK: "#1f2d3d", LUNCH: "#1f2d3d"
    };
    return colors[subject] || "#374151";
}

export function TimetableOptimizer() {
    const [selectedClass, setSelectedClass] = useState("Class 8");
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [timetable, setTimetable] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [view, setView] = useState("day"); // day / week
    const [timetableType, setTimetableType] = useState("regular");
    const [examSchedule, setExamSchedule] = useState({
        exam: [
            { date: "2026-05-01", day: "Friday", subject: "Math", time: "9:00 AM - 12:00 PM" },
            { date: "2026-05-03", day: "Sunday", subject: "Science", time: "9:00 AM - 12:00 PM" },
            { date: "2026-05-05", day: "Tuesday", subject: "English", time: "9:00 AM - 12:00 PM" },
        ],
        test: [
            { date: "2026-05-02", day: "Saturday", subject: "Math", time: "10:00 AM - 11:00 AM" },
            { date: "2026-05-04", day: "Monday", subject: "Science", time: "10:00 AM - 11:00 AM" },
        ]
    });

    const [showAddExam, setShowAddExam] = useState(false);
    const [newExam, setNewExam] = useState({ date: "", subject: "Math", time: "9:00 AM - 12:00 PM" });
    const generate = async () => {
        setGenerating(true);
        await new Promise(r => setTimeout(r, 1500));
        setTimetable(generateTimetable(selectedClass));
        setGenerating(false);
    };

    const classes = Object.keys(SUBJECTS);

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                    AI Powered
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Auto Timetable Optimizer</div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{
                    background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13
                }}>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div style={{ display: "flex", gap: 6 }}>
                    {["day", "week"].map(v => (
                        <button key={v} onClick={() => setView(v)} style={{
                            background: view === v ? "rgba(123,45,139,0.3)" : "transparent",
                            border: `0.5px solid ${view === v ? "#c084fc" : "rgba(255,255,255,0.1)"}`,
                            color: view === v ? "#c084fc" : "rgba(255,255,255,0.4)",
                            padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer"
                        }}>{v === "day" ? "Day View" : "Week View"}</button>
                    ))}
                </div>

                <button onClick={generate} disabled={generating} style={{
                    background: generating ? "rgba(123,45,139,0.2)" : "rgba(123,45,139,0.4)",
                    border: "0.5px solid rgba(123,45,139,0.6)", color: "#c084fc",
                    padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: generating ? "not-allowed" : "pointer"
                }}>
                    {generating ? "Generating..." : "Generate Timetable"}
                </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {["regular", "exam", "test"].map(type => (
                    <button key={type} onClick={() => setTimetableType(type)} style={{
                        background: timetableType === type ? "rgba(123,45,139,0.3)" : "transparent",
                        border: `0.5px solid ${timetableType === type ? "#c084fc" : "rgba(255,255,255,0.1)"}`,
                        color: timetableType === type ? "#c084fc" : "rgba(255,255,255,0.4)",
                        padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer"
                    }}>
                        {type === "regular" ? "📅 Regular" : type === "exam" ? "📝 Exam" : "✏️ Test"}
                    </button>
                ))}
            </div>

            {/* Day selector */}
            {timetable && view === "day" && (
                <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                    {DAYS.map(day => (
                        <button key={day} onClick={() => setSelectedDay(day)} style={{
                            background: selectedDay === day ? "rgba(123,45,139,0.3)" : "transparent",
                            border: `0.5px solid ${selectedDay === day ? "#c084fc" : "rgba(255,255,255,0.1)"}`,
                            color: selectedDay === day ? "#c084fc" : "rgba(255,255,255,0.4)",
                            padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer"
                        }}>{day.slice(0, 3)}</button>
                    ))}
                </div>
            )}

            {(timetableType === "exam" || timetableType === "test") && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                            {timetableType === "exam" ? "📝 Final Exam" : "✏️ Unit Test"} — {selectedClass}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setShowAddExam(!showAddExam)} style={{
                                background: "rgba(52,211,153,0.15)", border: "0.5px solid rgba(52,211,153,0.3)",
                                color: "#34d399", padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer"
                            }}>+ Add</button>
                            <button onClick={() => window.print()} style={{
                                background: "rgba(96,165,250,0.15)", border: "0.5px solid rgba(96,165,250,0.3)",
                                color: "#60a5fa", padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer"
                            }}>📄 PDF</button>
                        </div>
                    </div>

                    {showAddExam && (
                        <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Date</div>
                                    <input type="date" value={newExam.date} onChange={e => setNewExam(n => ({ ...n, date: e.target.value }))} style={{
                                        width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                                        borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box"
                                    }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Subject</div>
                                    <select value={newExam.subject} onChange={e => setNewExam(n => ({ ...n, subject: e.target.value }))} style={{
                                        width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                                        borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12
                                    }}>
                                        {(SUBJECTS[selectedClass] || []).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Time</div>
                                    <input value={newExam.time} onChange={e => setNewExam(n => ({ ...n, time: e.target.value }))} placeholder="9:00 AM - 12:00 PM" style={{
                                        width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                                        borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, boxSizing: "border-box"
                                    }} />
                                </div>
                            </div>
                            <button onClick={() => {
                                if (!newExam.date || !newExam.subject) return;
                                const dayName = new Date(newExam.date).toLocaleDateString("en-IN", { weekday: "long" });
                                setExamSchedule(prev => ({
                                    ...prev,
                                    [timetableType]: [...prev[timetableType], { ...newExam, day: dayName }]
                                }));
                                setNewExam({ date: "", subject: "Math", time: "9:00 AM - 12:00 PM" });
                                setShowAddExam(false);
                            }} style={{
                                background: "rgba(52,211,153,0.2)", border: "0.5px solid rgba(52,211,153,0.4)",
                                color: "#34d399", padding: "8px 20px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 600
                            }}>Save</button>
                        </div>
                    )}

                    {examSchedule[timetableType]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((exam, i) => {
                            const subjectColor = getSubjectColor(exam.subject);
                            return (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", gap: 14,
                                    padding: "12px 16px", marginBottom: 8,
                                    background: "rgba(255,255,255,0.03)",
                                    border: "0.5px solid rgba(255,255,255,0.07)",
                                    borderRadius: 10, borderLeft: `3px solid ${subjectColor}`
                                }}>
                                    <div style={{ minWidth: 100 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: subjectColor }}>{exam.subject}</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{exam.day}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{exam.time}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                                            {new Date(exam.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </div>
                                        <button onClick={() => setExamSchedule(prev => ({
                                            ...prev,
                                            [timetableType]: prev[timetableType].filter((_, idx) => idx !== i)
                                        }))} style={{
                                            background: "transparent", border: "none", color: "rgba(244,114,182,0.5)",
                                            cursor: "pointer", fontSize: 14
                                        }}>🗑</button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {!timetable && (
                <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                    Class select karo aur Generate karo — AI timetable banayega!
                </div>
            )}

            {/* Day View */}
            {timetable && view === "day" && (
                <div>
                    {PERIODS.map(period => {
                        const slot = timetable[selectedDay][period];
                        if (!slot) return null;
                        const isBreak = slot.subject === "BREAK" || slot.subject === "LUNCH";
                        return (
                            <div key={period} style={{
                                display: "flex", alignItems: "center", gap: 14,
                                padding: "10px 14px", marginBottom: 6,
                                background: isBreak ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
                                border: "0.5px solid rgba(255,255,255,0.07)",
                                borderRadius: 10, borderLeft: `3px solid ${slot.color}`
                            }}>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 80 }}>{period}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: isBreak ? 400 : 600, color: isBreak ? "rgba(255,255,255,0.3)" : "#fff" }}>
                                        {slot.subject}
                                    </div>
                                    {!isBreak && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{slot.teacher}</div>}
                                </div>
                                {!isBreak && (
                                    <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${slot.color}22`, color: slot.color }}>
                                        {slot.subject}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Week View */}
            {timetable && view === "week" && (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                        <thead>
                            <tr>
                                <th style={{ padding: "10px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>Period</th>
                                {DAYS.map(d => (
                                    <th key={d} style={{ padding: "10px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
                                        {d.slice(0, 3)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {PERIODS.map(period => (
                                <tr key={period}>
                                    <td style={{ padding: "8px 10px", fontSize: 11, color: "rgba(255,255,255,0.35)", borderBottom: "0.5px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>{period}</td>
                                    {DAYS.map(day => {
                                        const slot = timetable[day][period];
                                        if (!slot) return <td key={day} />;
                                        const isBreak = slot.subject === "BREAK" || slot.subject === "LUNCH";
                                        return (
                                            <td key={day} style={{ padding: "6px 8px", textAlign: "center", borderBottom: "0.5px solid rgba(255,255,255,0.05)" }}>
                                                <div style={{
                                                    fontSize: 11, fontWeight: 500,
                                                    color: isBreak ? "rgba(255,255,255,0.2)" : slot.color,
                                                    background: isBreak ? "transparent" : `${slot.color}15`,
                                                    borderRadius: 6, padding: "4px 6px"
                                                }}>
                                                    {slot.subject}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 2. TRANSPORT APP
// ═══════════════════════════════════════════════════════════

const BUSES = [
    { id: "BUS01", route: "Vijay Nagar → School", driver: "Ramesh Yadav", phone: "9109201111", capacity: 40, students: 35, status: "On Route", eta: "8 min", stops: ["Vijay Nagar", "Scheme 54", "Palasia", "School"] },
    { id: "BUS02", route: "Scheme 78 → School", driver: "Suresh Patel", phone: "9109202222", capacity: 35, students: 28, status: "At Stop", eta: "15 min", stops: ["Scheme 78", "Kanadia Road", "Rajiv Gandhi Square", "School"] },
    { id: "BUS03", route: "Bhawarkuan → School", driver: "Mahesh Singh", phone: "9109203333", capacity: 45, students: 42, status: "Departed", eta: "22 min", stops: ["Bhawarkuan", "LIG Square", "Nehru Park", "School"] },
    { id: "BUS04", route: "Manglia → School", driver: "Dinesh Kumar", phone: "9109204444", capacity: 50, students: 38, status: "On Route", eta: "35 min", stops: ["Manglia", "Ring Road", "Bypass", "School"] },
];

export function TransportApp() {
    const [selectedBus, setSelectedBus] = useState(null);
    const [view, setView] = useState("live");

    const statusColor = (status) => {
        if (status === "On Route") return "#34d399";
        if (status === "At Stop") return "#fbbf24";
        if (status === "Departed") return "#60a5fa";
        return "#f472b6";
    };

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                        Live Tracking
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Transport Management</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>LIVE</span>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                {[
                    { label: "Total Buses", value: BUSES.length, color: "#60a5fa" },
                    { label: "On Route", value: BUSES.filter(b => b.status === "On Route").length, color: "#34d399" },
                    { label: "Total Students", value: BUSES.reduce((s, b) => s + b.students, 0), color: "#c084fc" },
                    { label: "Avg ETA", value: "20 min", color: "#fbbf24" },
                ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {["live", "routes", "drivers"].map(v => (
                    <button key={v} onClick={() => setView(v)} style={{
                        background: view === v ? "rgba(230,93,4,0.2)" : "transparent",
                        border: `0.5px solid ${view === v ? "#e85d04" : "rgba(255,255,255,0.1)"}`,
                        color: view === v ? "#e85d04" : "rgba(255,255,255,0.4)",
                        padding: "7px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: view === v ? 600 : 400
                    }}>{v === "live" ? "Live Tracking" : v === "routes" ? "Routes" : "Drivers"}</button>
                ))}
            </div>

            {/* Live View */}
            {view === "live" && (
                <div>
                    {BUSES.map(bus => (
                        <div key={bus.id} onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)} style={{
                            background: "rgba(255,255,255,0.03)", border: `0.5px solid ${selectedBus?.id === bus.id ? "#e85d04" : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: selectedBus?.id === bus.id ? 12 : 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ fontSize: 24 }}>🚌</div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{bus.id} — {bus.route}</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{bus.driver} · {bus.students}/{bus.capacity} students</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: statusColor(bus.status), padding: "3px 10px", background: `${statusColor(bus.status)}22`, borderRadius: 20 }}>
                                        {bus.status}
                                    </div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>ETA: {bus.eta}</div>
                                </div>
                            </div>

                            {selectedBus?.id === bus.id && (
                                <div>
                                    {/* Route stops */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 14, marginTop: 8 }}>
                                        {bus.stops.map((stop, i) => (
                                            <div key={stop} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                                <div style={{ textAlign: "center", flex: 1 }}>
                                                    <div style={{
                                                        width: 10, height: 10, borderRadius: "50%", margin: "0 auto 4px",
                                                        background: i === 0 ? "#34d399" : i === bus.stops.length - 1 ? "#c084fc" : "#60a5fa"
                                                    }} />
                                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{stop}</div>
                                                </div>
                                                {i < bus.stops.length - 1 && (
                                                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => window.open(`tel:${bus.phone}`)} style={{
                                            flex: 1, background: "rgba(52,211,153,0.15)", border: "0.5px solid rgba(52,211,153,0.3)",
                                            color: "#34d399", padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer"
                                        }}>📞 Call Driver</button>
                                        <button style={{
                                            flex: 1, background: "rgba(96,165,250,0.15)", border: "0.5px solid rgba(96,165,250,0.3)",
                                            color: "#60a5fa", padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer"
                                        }}>💬 WhatsApp</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Routes View */}
            {view === "routes" && (
                <div>
                    {BUSES.map(bus => (
                        <div key={bus.id} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{bus.route}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {bus.stops.map((stop, i) => (
                                    <span key={stop} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
                                        {i + 1}. {stop}
                                    </span>
                                ))}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
                                {bus.students} students · Capacity: {bus.capacity}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drivers View */}
            {view === "drivers" && (
                <div>
                    {BUSES.map(bus => (
                        <div key={bus.id} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(230,93,4,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧑‍✈️</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{bus.driver}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{bus.id} · {bus.phone}</div>
                                </div>
                            </div>
                            <button onClick={() => window.open(`tel:${bus.phone}`)} style={{
                                background: "rgba(52,211,153,0.15)", border: "0.5px solid rgba(52,211,153,0.3)",
                                color: "#34d399", padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer"
                            }}>📞 Call</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 3. MODULAR MARKETPLACE
// ═══════════════════════════════════════════════════════════

const MODULES = [
    { id: "ai_brain", name: "AI Brain", icon: "🧠", category: "Core", price: "Free", installed: true, desc: "Student prediction, dropout alerts, performance tracking", rating: 4.9, reviews: 128 },
    { id: "automation", name: "Automation Layer", icon: "⚡", category: "Core", price: "Free", installed: true, desc: "Auto workflows — admission, attendance, fees, exams", rating: 4.8, reviews: 95 },
    { id: "multi_app", name: "Multi-App Ecosystem", icon: "📱", category: "Core", price: "Free", installed: true, desc: "Student, Teacher, Parent, Admin apps", rating: 4.7, reviews: 87 },
    { id: "transport", name: "Transport Manager", icon: "🚌", category: "Operations", price: "Free", installed: true, desc: "Live bus tracking, route management, driver app", rating: 4.6, reviews: 62 },
    { id: "timetable", name: "Smart Timetable", icon: "📅", category: "Academic", price: "Free", installed: true, desc: "AI timetable generation, teacher clash detection", rating: 4.5, reviews: 74 },
    { id: "whatsapp", name: "WhatsApp Gateway", icon: "💬", category: "Communication", price: "₹999/mo", installed: false, desc: "Real WhatsApp messages — attendance, fees, results", rating: 4.9, reviews: 215 },
    { id: "razorpay", name: "Fee Payment Gateway", icon: "💳", category: "Finance", price: "2% per txn", installed: false, desc: "Online fee collection — UPI, Cards, Net Banking", rating: 4.8, reviews: 183 },
    { id: "biometric", name: "Biometric Integration", icon: "👆", category: "Security", price: "₹1,999/mo", installed: false, desc: "Fingerprint attendance — device sync", rating: 4.4, reviews: 41 },
    { id: "cctv_ai", name: "CCTV AI Monitor", icon: "📹", category: "Security", price: "₹2,999/mo", installed: false, desc: "AI-powered CCTV — student behavior, safety alerts", rating: 4.3, reviews: 28 },
    { id: "govt_portal", name: "Govt Portal Sync", icon: "🏛️", category: "Compliance", price: "₹499/mo", installed: false, desc: "Auto sync with UDISE, state education portals", rating: 4.2, reviews: 19 },
    { id: "library", name: "Library Manager", icon: "📚", category: "Academic", price: "Free", installed: false, desc: "Book issue, return, fine management", rating: 4.1, reviews: 35 },
    { id: "hostel", name: "Hostel Manager", icon: "🏠", category: "Operations", price: "₹799/mo", installed: false, desc: "Room allocation, mess, attendance, fee", rating: 4.0, reviews: 22 },
];

const CATEGORIES = ["All", "Core", "Academic", "Operations", "Communication", "Finance", "Security", "Compliance"];

export function ModularMarketplace() {
    const [installedModules, setInstalledModules] = useState(MODULES.filter(m => m.installed).map(m => m.id));
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");

    const filtered = MODULES.filter(m => {
        const matchCat = selectedCategory === "All" || m.category === selectedCategory;
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const toggleModule = (moduleId) => {
        const module = MODULES.find(m => m.id === moduleId);
        if (module.price !== "Free" && !installedModules.includes(moduleId)) {
            alert(`${module.name} — ${module.price}\n\nJaise hi payment setup ho — ek click mein activate!`);
            return;
        }
        setInstalledModules(prev =>
            prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
        );
    };

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                        Salesforce Model
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Module Marketplace</div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {installedModules.length}/{MODULES.length} installed
                </div>
            </div>

            {/* Search + Filter */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <input placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} style={{
                    flex: 1, background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, minWidth: 200
                }} />
            </div>

            {/* Categories */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                        background: selectedCategory === cat ? "rgba(192,132,252,0.2)" : "transparent",
                        border: `0.5px solid ${selectedCategory === cat ? "#c084fc" : "rgba(255,255,255,0.1)"}`,
                        color: selectedCategory === cat ? "#c084fc" : "rgba(255,255,255,0.4)",
                        padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer"
                    }}>{cat}</button>
                ))}
            </div>

            {/* Modules Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {filtered.map(module => {
                    const isInstalled = installedModules.includes(module.id);
                    const isFree = module.price === "Free";
                    return (
                        <div key={module.id} style={{
                            background: "rgba(255,255,255,0.03)", border: `0.5px solid ${isInstalled ? "rgba(192,132,252,0.3)" : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 14, padding: "16px", position: "relative"
                        }}>
                            {isInstalled && (
                                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(52,211,153,0.2)", border: "0.5px solid rgba(52,211,153,0.4)", color: "#34d399", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                                    INSTALLED
                                </div>
                            )}
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{module.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{module.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{module.category}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 12 }}>{module.desc}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: isFree ? "#34d399" : "#fbbf24", fontWeight: 600 }}>{module.price}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>⭐ {module.rating} ({module.reviews})</div>
                            </div>
                            <button onClick={() => toggleModule(module.id)} style={{
                                width: "100%", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                cursor: "pointer", border: "none",
                                background: isInstalled ? "rgba(244,114,182,0.15)" : isFree ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
                                color: isInstalled ? "#f472b6" : isFree ? "#34d399" : "#fbbf24",
                            }}>
                                {isInstalled ? "Remove Module" : isFree ? "Install Free" : `Get — ${module.price}`}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}