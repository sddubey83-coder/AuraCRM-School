/**
 * School OS — Real-Time CEO Dashboard
 * Firebase se live data fetch karta hai
 * Usage: import RealtimeDashboard from './RealtimeDashboard'
 */

import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

const API = "https://aura-school-backend.onrender.com";

function LiveBadge() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d97e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#00d97e", fontWeight: 600 }}>LIVE</span>
        </div>
    );
}

function MetricCard({ label, value, sub, color, urgent }) {
    return (
        <div style={{
            background: urgent ? "rgba(201,24,74,0.08)" : "rgba(255,255,255,0.03)",
            border: `0.5px solid ${urgent ? "rgba(201,24,74,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 14, padding: "18px 16px", flex: 1, minWidth: 130,
            borderTop: `3px solid ${color}`
        }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: color, marginBottom: 4 }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{sub}</div>}
        </div>
    );
}

function AlertCard({ alert }) {
    const colors = { CRITICAL: "#c9184a", HIGH: "#e85d04", MEDIUM: "#854F0B", LOW: "#085041" };
    const color = colors[alert.level] || colors.LOW;
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)", border: `0.5px solid rgba(255,255,255,0.07)`,
            borderRadius: 10, padding: "12px 14px", marginBottom: 8,
            borderLeft: `3px solid ${color}`
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{alert.name}</span>
                <span style={{ fontSize: 11, color: color, fontWeight: 600 }}>{alert.level}</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{alert.message}</div>
        </div>
    );
}

export default function RealtimeDashboard() {
    const [leads, setLeads] = useState([]);
    const [automationStats, setAutomationStats] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Firebase live sync
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "leads"), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setLeads(data);
            setLastUpdated(new Date());
        });
        return () => unsub();
    }, []);

    // Automation stats
    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`${API}/automation/dashboard`);
                const data = await res.json();
                setAutomationStats(data);
            } catch (e) { }
        }
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    // AI Predictions
    useEffect(() => {
        async function fetchPredictions() {
            try {
                const res = await fetch("https://aura-school-backend.onrender.com/demo/predictions");
                const data = await res.json();
                setPredictions(data.students || []);
            } catch (e) { }
        }
        fetchPredictions();
    }, []);

    // Stats from leads
    const total = leads.length;
    const converted = leads.filter(l => l.status === "converted").length;
    const hot = leads.filter(l => (l.bonus || 0) >= 60).length;
    const newLeads = leads.filter(l => l.status === "new").length;
    const convRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    const revenueForcast = converted * 45000;

    // Dropout alerts
    const dropoutAlerts = predictions
        .filter(p => p.risk_level === "CRITICAL" || p.risk_level === "HIGH")
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            level: p.risk_level,
            message: p.alerts?.[0] || "High risk detected"
        }));

    // Branch wise
    const branches = [...new Set(leads.map(l => l.branch).filter(Boolean))];
    const branchStats = branches.map(b => ({
        name: b,
        total: leads.filter(l => l.branch === b).length,
        converted: leads.filter(l => l.branch === b && l.status === "converted").length,
    }));

    return (
        <div style={{ color: "#fff", fontFamily: "inherit", marginTop: 24 }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                        CEO Dashboard — Real Time
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Live School Intelligence</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <LiveBadge />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                        Updated: {lastUpdated.toLocaleTimeString("en-IN")}
                    </span>
                </div>
            </div>

            {/* Top Metrics */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <MetricCard label="Total Leads" value={total} sub="Firebase live" color="#60a5fa" />
                <MetricCard label="Converted" value={converted} sub={`${convRate}% rate`} color="#34d399" />
                <MetricCard label="Hot Leads" value={hot} sub="Call now" color="#fb923c" urgent={hot > 0} />
                <MetricCard label="New Today" value={newLeads} sub="Needs follow-up" color="#c084fc" />
                <MetricCard label="Revenue" value={`₹${(revenueForcast / 1000).toFixed(0)}K`} sub="From converted" color="#fbbf24" />
            </div>

            {/* 2 column layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                {/* Dropout Risk Alerts */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f472b6" }}>Dropout Risk Alerts</div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{dropoutAlerts.length} students</span>
                    </div>
                    {dropoutAlerts.length === 0 && (
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 20, fontSize: 12 }}>
                            AI Brain connecting...
                        </div>
                    )}
                    {dropoutAlerts.map((a, i) => <AlertCard key={i} alert={a} />)}
                </div>

                {/* Branch Performance */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", marginBottom: 14 }}>Branch Performance</div>
                    {branchStats.length === 0 && (
                        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 20, fontSize: 12 }}>No branch data yet</div>
                    )}
                    {branchStats.map((b, i) => {
                        const rate = b.total > 0 ? Math.round((b.converted / b.total) * 100) : 0;
                        return (
                            <div key={i} style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 500 }}>{b.name}</span>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{b.converted}/{b.total} ({rate}%)</span>
                                </div>
                                <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
                                    <div style={{ width: `${rate}%`, height: "100%", background: rate >= 50 ? "#34d399" : rate >= 30 ? "#fbbf24" : "#f472b6", borderRadius: 4, transition: "width 0.5s" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Automation Stats */}
            {automationStats && (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c084fc", marginBottom: 14 }}>Automation Activity</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {[
                            { label: "Students", value: automationStats.total_students, color: "#60a5fa" },
                            { label: "Automations Run", value: automationStats.total_automations_run, color: "#34d399" },
                            { label: "WhatsApp Queued", value: automationStats.whatsapp_messages_queued, color: "#fbbf24" },
                            { label: "Fees Pending", value: `₹${((automationStats.pending_fees_total || 0) / 1000).toFixed(0)}K`, color: "#f472b6" },
                        ].map((s, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 16px", flex: 1, minWidth: 100, textAlign: "center" }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Live Lead Feed */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#34d399" }}>Live Lead Feed</div>
                    <LiveBadge />
                </div>
                {leads.slice(0, 8).map((lead, i) => (
                    <div key={lead.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: "50%",
                                background: lead.status === "converted" ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 700, color: lead.status === "converted" ? "#34d399" : "rgba(255,255,255,0.5)"
                            }}>
                                {(lead.student_name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.student_name}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{lead.branch} · {lead.source}</div>
                            </div>
                        </div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                            background: lead.status === "converted" ? "rgba(52,211,153,0.15)" : lead.status === "interested" ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.06)",
                            color: lead.status === "converted" ? "#34d399" : lead.status === "interested" ? "#fb923c" : "rgba(255,255,255,0.4)"
                        }}>
                            {lead.status?.toUpperCase()}
                        </div>
                    </div>
                ))}
                {leads.length === 0 && (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 20, fontSize: 12 }}>
                        Firebase se data aa raha hai...
                    </div>
                )}
            </div>
        </div>
    );
}
