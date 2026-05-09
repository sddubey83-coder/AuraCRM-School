// ============================================
// FILE: src/components/LeadSources.jsx
// Google Sheets + Social Media + Website leads
// With duplicate check on every source
// ============================================

import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_PYTHON_URL;

function getToken() {
  return localStorage.getItem("aura_token") || localStorage.getItem('token') || "";
}

const api = axios.create({ baseURL: API });
api.interceptors.request.use((c) => {
  const t = getToken();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// ─── STYLES ───────────────────────────────────────────────────
const S = {
  wrap: { padding: "24px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" },
  title: { fontSize: "22px", fontWeight: "600", margin: "0 0 4px 0", color: "#001D3D" },
  sub: { fontSize: "13px", color: "#666", margin: "0 0 24px 0" },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  tab: (active) => ({
    padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", border: "none",
    background: active ? "#001D3D" : "#f1f5f9",
    color: active ? "#00FFCC" : "#334155",
    transition: "all 0.15s"
  }),
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "16px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#475569", marginBottom: "6px", display: "block" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", marginBottom: "12px" },
  select: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", marginBottom: "12px", background: "#fff" },
  btn: (color = "#001D3D") => ({
    padding: "10px 20px", background: color, color: color === "#001D3D" ? "#00FFCC" : "#fff",
    border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", width: "100%"
  }),
  success: { padding: "12px 16px", background: "#d1fae5", color: "#065f46", borderRadius: "8px", marginTop: "12px", fontSize: "13px" },
  error: { padding: "12px 16px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginTop: "12px", fontSize: "13px" },
  warn: { padding: "12px 16px", background: "#fef3c7", color: "#92400e", borderRadius: "8px", marginTop: "12px", fontSize: "13px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  statCard: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", textAlign: "center" },
  statNum: { fontSize: "28px", fontWeight: "600", color: "#001D3D" },
  statLabel: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
  code: { background: "#1e293b", color: "#00FFCC", padding: "12px 16px", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", marginTop: "8px" },
  hint: { fontSize: "12px", color: "#94a3b8", marginTop: "4px", marginBottom: "8px" },
};

// ═══════════════════════════════════════════════════════════════
export default function LeadSources() {
  const [activeTab, setActiveTab] = useState("sheets");
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.get("/sources/stats").then(r => setStats(r.data.sources || [])).catch(() => { });
  }, []);

  const tabs = [
    { id: "sheets", label: "🟢 Google Sheets", },
    { id: "social", label: "📱 Social Media", },
    { id: "website", label: "🌐 Website", },
    { id: "stats", label: "📊 Source Stats", },
  ];

  return (
    <div style={S.wrap}>
      <h2 style={S.title}>🔗 Lead Sources</h2>
      <p style={S.sub}>Google Sheets, Social Media aur Website se leads import karein — duplicate auto-check hoga!</p>

      <div style={S.tabs}>
        {tabs.map(t => (
          <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "sheets" && <GoogleSheetsTab />}
      {activeTab === "social" && <SocialMediaTab />}
      {activeTab === "website" && <WebsiteTab />}
      {activeTab === "stats" && <StatsTab stats={stats} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE SHEETS TAB
// ═══════════════════════════════════════════════════════════════
function GoogleSheetsTab() {
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSync = async () => {
    if (!sheetUrl.trim()) { setError("Sheet URL required hai"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      const res = await api.post("/sources/google-sheets/sync", { sheet_url: sheetUrl });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Sync fail hua. Sheet URL check karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", color: "#001D3D", fontSize: "16px" }}>🟢 Google Sheets Sync</h3>

        <label style={S.label}>Google Sheet URL</label>
        <p style={S.hint}>Sheet must be published: File → Share → Publish to web → CSV</p>
        <input
          style={S.input}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={sheetUrl}
          onChange={e => setSheetUrl(e.target.value)}
        />

        <button style={S.btn()} onClick={handleSync} disabled={loading}>
          {loading ? "⏳ Syncing..." : "🔄 Sync Now"}
        </button>

        {result && (
          <div style={S.success}>
            ✅ Sync complete! <strong>{result.imported}</strong> imported, <strong>{result.skipped}</strong> duplicates skip hue.
            {result.errors?.length > 0 && (
              <details style={{ marginTop: "8px" }}>
                <summary style={{ cursor: "pointer" }}>⚠️ {result.errors.length} warnings</summary>
                {result.errors.map((e, i) => <div key={i} style={{ fontSize: "12px", marginTop: "4px" }}>{e}</div>)}
              </details>
            )}
          </div>
        )}
        {error && <div style={S.error}>❌ {error}</div>}
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", color: "#001D3D", fontSize: "15px" }}>📋 Sheet Format</h3>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px" }}>
          Aapki Google Sheet mein yeh columns hone chahiye (pehli row mein headings):
        </p>
        <div style={S.code}>
          name | mobile | city | course | category | level | consultant | source_name
        </div>
        <p style={{ ...S.hint, marginTop: "8px" }}>
          ✅ Duplicate mobile numbers automatically skip ho jaayenge<br />
          ✅ Ek baar sync karo — duplicate nahi banega
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL MEDIA TAB
// ═══════════════════════════════════════════════════════════════
function SocialMediaTab() {
  const [form, setForm] = useState({
    name: "", mobile: "", city: "", course: "Engineering",
    category: "Gen", platform: "Facebook", consultant: "", remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.mobile) { setError("Naam aur mobile required hai"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      const res = await api.post("/sources/social-media/manual", form);
      setResult(res.data);
      setForm({ name: "", mobile: "", city: "", course: "Engineering", category: "Gen", platform: "Facebook", consultant: "", remarks: "" });
    } catch (e) {
      const msg = e.response?.data?.detail;
      if (typeof msg === "object" && msg?.message) setError("⚠️ " + msg.message);
      else setError(msg || "Add karna fail hua");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", color: "#001D3D", fontSize: "16px" }}>📱 Social Media Lead Add</h3>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Student Name *</label>
            <input style={S.input} placeholder="Ram Sharma" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Mobile *</label>
            <input style={S.input} placeholder="9876543210" value={form.mobile} onChange={e => set("mobile", e.target.value)} />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Platform</label>
            <select style={S.select} value={form.platform} onChange={e => set("platform", e.target.value)}>
              <option>Facebook</option>
              <option>Instagram</option>
              <option>WhatsApp</option>
              <option>YouTube</option>
              <option>LinkedIn</option>
              <option>Twitter/X</option>
            </select>
          </div>
          <div>
            <label style={S.label}>City</label>
            <input style={S.input} placeholder="Indore" value={form.city} onChange={e => set("city", e.target.value)} />
          </div>
        </div>

        <div style={S.grid2}>
          <div>
            <label style={S.label}>Course</label>
            <select style={S.select} value={form.course} onChange={e => set("course", e.target.value)}>
              {["Engineering", "Medical", "Management", "Law", "Arts", "Commerce", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Category</label>
            <select style={S.select} value={form.category} onChange={e => set("category", e.target.value)}>
              {["Gen", "OBC", "SC", "ST", "EWS"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <label style={S.label}>Remarks</label>
        <input style={S.input} placeholder="Koi note..." value={form.remarks} onChange={e => set("remarks", e.target.value)} />

        <button style={S.btn()} onClick={handleSubmit} disabled={loading}>
          {loading ? "⏳ Adding..." : "➕ Add Social Lead"}
        </button>

        {result && <div style={S.success}>✅ {result.message}</div>}
        {error && <div style={S.error}>❌ {error}</div>}
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", color: "#001D3D", fontSize: "15px" }}>🤖 Facebook Lead Ads Auto-Sync</h3>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px" }}>
          Facebook Lead Ads ko directly connect karo — leads automatically aayenge!
        </p>
        <div style={S.code}>
          Webhook URL:<br />
          POST {"https://auracrm-school-backend-1.onrender.com"}/sources/social-media/webhook<br /><br />
          Verify Token: auracrm_fb_verify_2024
        </div>
        <p style={S.hint}>Facebook Ads Manager → Lead Ads → CRM Integration → Custom Webhook mein yeh URL add karo</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WEBSITE TAB
// ═══════════════════════════════════════════════════════════════
function WebsiteTab() {
  const [copied, setCopied] = useState(false);

  const backendUrl = process.env.REACT_APP_PYTHON_URL;

  const scriptCode = `<!-- AuraCRM Lead Widget -->
<script src="${backendUrl}/sources/website/widget.js"></script>`;

  const formCode = `<!-- Manual form integration -->
<form id="enquiry-form">
  <input name="name" placeholder="Aapka naam" required />
  <input name="mobile" placeholder="Mobile number" required />
  <input name="city" placeholder="Shehar" />
  <select name="course">
    <option>Engineering</option>
    <option>Medical</option>
    <option>Management</option>
  </select>
  <button type="submit">Submit Enquiry</button>
</form>

<script>
document.getElementById('enquiry-form').onsubmit = function(e) {
  e.preventDefault();
  var data = Object.fromEntries(new FormData(e.target));
  fetch('${backendUrl}/sources/website/lead', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(d => alert(d.message));
};
</script>`;

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", color: "#001D3D", fontSize: "16px" }}>🌐 Website Widget (Easiest!)</h3>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px" }}>
          Yeh ek line apni website ke <code>&lt;body&gt;</code> tag se pehle add karo — floating enquiry button aa jaayega!
        </p>
        <div style={S.code}>{scriptCode}</div>
        <button
          onClick={() => copy(scriptCode)}
          style={{ ...S.btn("#059669"), marginTop: "10px", width: "auto", padding: "8px 16px" }}
        >
          {copied ? "✅ Copied!" : "📋 Copy Code"}
        </button>
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", color: "#001D3D", fontSize: "16px" }}>📝 Custom Form Integration</h3>
        <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px" }}>
          Apna khud ka form banana ho toh yeh code use karo:
        </p>
        <div style={{ ...S.code, fontSize: "11px" }}>{formCode}</div>
        <button
          onClick={() => copy(formCode)}
          style={{ ...S.btn("#059669"), marginTop: "10px", width: "auto", padding: "8px 16px" }}
        >
          {copied ? "✅ Copied!" : "📋 Copy Code"}
        </button>
      </div>

      <div style={S.card}>
        <h3 style={{ margin: "0 0 12px", color: "#001D3D", fontSize: "15px" }}>⚡ API Endpoint</h3>
        <div style={S.code}>
          POST {backendUrl}/sources/website/lead<br /><br />
          {`{
  "name": "Ram Sharma",
  "mobile": "9876543210",
  "city": "Indore",
  "course": "Engineering",
  "category": "Gen",
  "message": "Interested in B.Tech admissions"
}`}
        </div>
        <p style={S.hint}>
          ✅ Duplicate mobile → friendly message return hoga, lead nahi banega<br />
          ✅ No auth required — public endpoint hai
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS TAB
// ═══════════════════════════════════════════════════════════════
function StatsTab({ stats }) {
  const colors = {
    "Google Sheet": "#10b981",
    "Social Media": "#6366f1",
    "Website": "#f59e0b",
    "Direct": "#3b82f6",
    "Reference": "#ef4444",
  };

  const total = stats.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", color: "#001D3D", fontSize: "16px" }}>📊 Source-wise Lead Stats</h3>
        {stats.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Abhi koi data nahi hai</p>
        ) : (
          <div>
            {stats.map((s, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#334155" }}>
                    {s.source || "Direct"}
                  </span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    {s.count} leads ({total ? Math.round(s.count / total * 100) : 0}%)
                  </span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
                  <div style={{
                    height: "8px",
                    borderRadius: "99px",
                    background: colors[s.source] || "#94a3b8",
                    width: `${total ? (s.count / total * 100) : 0}%`,
                    transition: "width 0.5s ease"
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "24px", fontWeight: "600", color: "#001D3D" }}>{total}</span>
              <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "8px" }}>Total Leads</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}