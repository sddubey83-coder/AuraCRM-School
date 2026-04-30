/**
 * School OS — AI Brain Dashboard
 * Firebase leads collection se real data fetch karta hai
 */

import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

const RISK_COLORS = {
    CRITICAL: { bg: "#fde8ef", text: "#c9184a", border: "#f4c0d1" },
    HIGH: { bg: "#fff3e8", text: "#e85d04", border: "#fac775" },
    MEDIUM: { bg: "#faeeda", text: "#854F0B", border: "#ef9f27" },
    LOW: { bg: "#e8f5ef", text: "#085041", border: "#5dcaa5" },
};

// ── Risk Engine — Firebase leads data se risk calculate karo ──
function calculateRisk(lead) {
    let score = 0;
    const alerts = [];
    const actions = [];

    // 1. STATUS based risk
    if (lead.status === "lost") {
        score += 40;
        alerts.push("Lead lost — recovery needed");
        actions.push("Send re-engagement WhatsApp message");
    } else if (lead.status === "interested") {
        score += 20;
        alerts.push("Lead interested but not converted");
        actions.push("Call today — conversion window open");
    } else if (lead.status === "converted") {
        score += 0;
    } else if (lead.status === "new") {
        score += 15;
        alerts.push("New lead — no follow-up yet");
        actions.push("Call within 2 hours — best conversion rate");
    }

    // 2. BONUS score (engagement indicator)
    const bonus = lead.bonus || 0;
    if (bonus < 20) {
        score += 25;
        alerts.push(`Low engagement score: ${bonus} — needs attention`);
        actions.push("Increase touchpoints — call + WhatsApp");
    } else if (bonus < 40) {
        score += 15;
        alerts.push(`Medium engagement: ${bonus}`);
        actions.push("Send follow-up message today");
    } else if (bonus < 60) {
        score += 5;
    }

    // 3. SOURCE based priority
    if (lead.source === "Walk-in") {
        score = Math.max(0, score - 10); // Walk-ins are higher intent
    } else if (lead.source === "Online") {
        score += 5;
        actions.push("Online lead — needs faster follow-up");
    }

    // 4. NOTES empty = no follow-up done
    if (!lead.notes || lead.notes.trim() === "") {
        score += 10;
        alerts.push("No notes added — follow-up not recorded");
        actions.push("Add notes after next call");
    }

    // 5. TIMESTAMP — kitne purana lead hai
    if (lead.timestamp) {
        const days = Math.floor(
            (Date.now() - lead.timestamp.toDate().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (days > 7) {
            score += 20;
            alerts.push(`Lead ${days} days old — going cold`);
            actions.push("Urgent: Re-engage before lead goes cold");
        } else if (days > 3) {
            score += 10;
            alerts.push(`Lead ${days} days old — follow up needed`);
            actions.push("Call today to keep warm");
        }
    }

    score = Math.min(score, 100);

    let risk_level = "LOW";
    if (score >= 70) risk_level = "CRITICAL";
    else if (score >= 45) risk_level = "HIGH";
    else if (score >= 25) risk_level = "MEDIUM";

    const dropout_prob = +(1 / (1 + Math.exp(-0.08 * (score - 50)))).toFixed(2);

    return {
        risk_score: Math.round(score),
        risk_level,
        dropout_prob,
        alerts: alerts.length ? alerts : ["Lead looks healthy — monitor regularly"],
        actions: actions.length ? actions : ["Continue regular follow-up"],
    };
}

// ── Sub Components ─────────────────────────────────────────

function RiskBadge({ level }) {
    const c = RISK_COLORS[level] || RISK_COLORS.LOW;
    return (
        <span style={{
            background: c.bg, color: c.text, border: `0.5px solid ${c.border}`,
            padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
        }}>
            {level}
        </span>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "14px 16px", flex: 1, minWidth: 100, textAlign: "center"
        }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: color || "#fff" }}>{value}</div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────
export default function AIBrainDashboard() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState("ALL");

    // Firebase realtime listener
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "leads"), (snap) => {
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                ...calculateRisk(doc.data()),
            }));
            // Sort by risk score
            data.sort((a, b) => b.risk_score - a.risk_score);
            setLeads(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Stats
    const critical = leads.filter(l => l.risk_level === "CRITICAL");
    const high = leads.filter(l => l.risk_level === "HIGH");
    const medium = leads.filter(l => l.risk_level === "MEDIUM");
    const low = leads.filter(l => l.risk_level === "LOW");
    const avgRisk = leads.length
        ? Math.round(leads.reduce((s, l) => s + l.risk_score, 0) / leads.length)
        : 0;

    const filtered = leads.filter(l => {
        const matchSearch = (l.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (l.parent_phone || "").includes(search);
        const matchRisk = filterRisk === "ALL" || l.risk_level === filterRisk;
        return matchSearch && matchRisk;
    });

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "all", label: `All Leads (${leads.length})` },
        { id: "critical", label: `Critical (${critical.length})` },
        { id: "actions", label: "Actions" },
    ];

    if (loading) return (
        <div style={{ padding: 32, color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" }}>
            AI Brain — connecting to Firebase...
        </div>
    );

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                        AI Brain — Live Firebase
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Student Risk Intelligence</div>
                </div>
                <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#00d97e",
                    boxShadow: "0 0 6px #00d97e", animation: "pulse 2s infinite"
                }} />
            </div>

            {/* Stat Cards */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                <StatCard label="Total" value={leads.length} />
                <StatCard label="Critical" value={critical.length} color="#f472b6" />
                <StatCard label="High" value={high.length} color="#fb923c" />
                <StatCard label="Medium" value={medium.length} color="#fbbf24" />
                <StatCard label="Avg Risk" value={`${avgRisk}%`} color={avgRisk > 50 ? "#f472b6" : "#34d399"} />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "0.5px solid rgba(255,255,255,0.08)", marginBottom: 14 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        background: "transparent", border: "none",
                        color: activeTab === t.id ? "#c084fc" : "rgba(255,255,255,0.4)",
                        padding: "7px 14px", fontSize: 12, cursor: "pointer",
                        fontWeight: activeTab === t.id ? 600 : 400,
                        borderBottom: activeTab === t.id ? "2px solid #c084fc" : "2px solid transparent",
                        marginBottom: -1
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
                <div>
                    {leads.filter(l => ["CRITICAL", "HIGH"].includes(l.risk_level)).slice(0, 8).map((lead, i) => (
                        <div key={lead.id} style={{
                            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)",
                            borderRadius: 10, padding: "12px 14px", marginBottom: 8,
                            borderLeft: `3px solid ${RISK_COLORS[lead.risk_level]?.text}`
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{lead.student_name || "Unknown"}</span>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{lead.parent_phone}</span>
                                    <RiskBadge level={lead.risk_level} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: RISK_COLORS[lead.risk_level]?.text }}>
                                    {lead.risk_score}%
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
                                {lead.alerts[0]}
                            </div>
                            <div style={{ fontSize: 12, color: "#60a5fa" }}>→ {lead.actions[0]}</div>
                        </div>
                    ))}
                    {leads.filter(l => ["CRITICAL", "HIGH"].includes(l.risk_level)).length === 0 && (
                        <div style={{ textAlign: "center", color: "#34d399", padding: 32, fontSize: 14 }}>
                            All leads healthy — no critical alerts
                        </div>
                    )}
                </div>
            )}

            {/* ALL LEADS */}
            {activeTab === "all" && (
                <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input
                            placeholder="Search name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                flex: 1, background: "rgba(255,255,255,0.05)",
                                border: "0.5px solid rgba(255,255,255,0.1)",
                                borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12
                            }}
                        />
                        <select
                            value={filterRisk}
                            onChange={e => setFilterRisk(e.target.value)}
                            style={{
                                background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                                borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12
                            }}
                        >
                            <option value="ALL">All</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                    {filtered.map(lead => (
                        <div key={lead.id} style={{
                            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)",
                            borderRadius: 10, padding: "10px 14px", marginBottom: 6,
                            display: "flex", alignItems: "center", justifyContent: "space-between"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: RISK_COLORS[lead.risk_level]?.bg,
                                    color: RISK_COLORS[lead.risk_level]?.text,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, fontWeight: 700, flexShrink: 0
                                }}>
                                    {(lead.student_name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.student_name}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                                        {lead.parent_phone} · {lead.source} · {lead.branch}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <RiskBadge level={lead.risk_level} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: RISK_COLORS[lead.risk_level]?.text, minWidth: 36, textAlign: "right" }}>
                                    {lead.risk_score}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CRITICAL */}
            {activeTab === "critical" && (
                <div>
                    {critical.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#34d399", padding: 32, fontSize: 14 }}>
                            No critical leads right now!
                        </div>
                    ) : critical.map(lead => (
                        <div key={lead.id} style={{
                            background: "rgba(201,24,74,0.08)", border: "0.5px solid rgba(201,24,74,0.25)",
                            borderRadius: 10, padding: "14px 16px", marginBottom: 8
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <div>
                                    <span style={{ fontWeight: 700, fontSize: 15 }}>{lead.student_name}</span>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>{lead.parent_phone}</span>
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 700, color: "#f472b6" }}>{lead.risk_score}%</span>
                            </div>
                            {lead.alerts.map((a, i) => (
                                <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>⚠ {a}</div>
                            ))}
                            <div style={{ marginTop: 8 }}>
                                {lead.actions.map((a, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "#60a5fa", marginBottom: 2 }}>→ {a}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ACTIONS */}
            {activeTab === "actions" && (
                <div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                        AI recommended actions — priority order
                    </div>
                    {leads.filter(l => l.risk_level !== "LOW").map(lead => (
                        <div key={lead.id} style={{
                            background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)",
                            borderRadius: 10, padding: "10px 14px", marginBottom: 6,
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{lead.student_name}</span>
                                    <RiskBadge level={lead.risk_level} />
                                </div>
                                <div style={{ fontSize: 12, color: "#60a5fa" }}>→ {lead.actions[0]}</div>
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                                {lead.parent_phone}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}