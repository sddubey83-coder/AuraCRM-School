/**
 * School OS — Syllabus & Docs Manager (PRO Version)
 * Backend Proxy + S3 + MD5 Hash Duplicate Check
 */

import { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";

// ── Configuration ──────────────────────────────────────────
// Isse apni AWS EC2 ki Public IP ya Domain se replace karein
const API_BASE_URL = "https://auracrm-school-final.onrender.com";

const CATEGORIES = [
    { id: "syllabus", label: "Syllabus", icon: "📚", color: "#7b2d8b" },
    { id: "notes", label: "Class Notes", icon: "📝", color: "#1e6091" },
    { id: "assignments", label: "Assignments", icon: "✏️", color: "#2d6a4f" },
    { id: "results", label: "Results", icon: "📊", color: "#e85d04" },
    { id: "circulars", label: "Circulars", icon: "📢", color: "#c9184a" },
    { id: "forms", label: "Forms", icon: "📄", color: "#854F0B" },
];

const CLASS_LIST = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "All Classes"];

// ── Helpers ───────────────────────────────────────────────
const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileIcon = (name) => {
    const ext = name.split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "📕";
    if (["doc", "docx"].includes(ext)) return "📘";
    if (["xls", "xlsx"].includes(ext)) return "📗";
    if (["jpg", "jpeg", "png"].includes(ext)) return "🖼️";
    return "📄";
};

export default function DocsManager({ userRole = "admin", schoolId = "indore_aura_01" }) {
    const [docs, setDocs] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [search, setSearch] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        category: "syllabus",
        class_name: "All Classes",
        subject: "",
        description: ""
    });
    const fileInputRef = useRef();

    // ── Effect: Fetch Docs ──
    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/docs?school_id=${schoolId}`);
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (e) {
            console.error("Backend offline, using local cache");
            const saved = localStorage.getItem("school_os_docs");
            if (saved) setDocs(JSON.parse(saved));
        }
    };

    // ── PRO Logic: Calculate MD5 Hash ──
    const getFileHash = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binary = e.target.result;
                const hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(binary)).toString();
                resolve(hash);
            };
            reader.readAsBinaryString(file);
        });
    };

    // ── PRO Logic: Secure Upload ──
    const handleUpload = async () => {
        if (!selectedFile || !uploadForm.subject) {
            setMessage({ type: "error", text: "Bhai, File aur Subject dono bharo!" });
            return;
        }

        setUploading(true);
        setUploadProgress(20);

        try {
            const hash = await getFileHash(selectedFile);
            setUploadProgress(40);

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("file_hash", hash);
            formData.append("category", uploadForm.category);
            formData.append("class_name", uploadForm.class_name);
            formData.append("subject", uploadForm.subject);
            formData.append("description", uploadForm.description);
            formData.append("school_id", schoolId);

            const response = await fetch(`${API_BASE_URL}/upload-doc`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.status === "duplicate") {
                setMessage({ type: "error", text: "Duplicate! Ye file pehle se S3 par hai." });
            } else if (response.ok) {
                setMessage({ type: "success", text: "S3 Upload Successful!" });
                fetchDocs(); // Refresh list from server
                setShowUpload(false);
                setSelectedFile(null);
            }
        } catch (e) {
            setMessage({ type: "error", text: "Server error! AWS check karein." });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Delete kar du?")) return;
        // Backend delete logic yahan aayega
        const updated = docs.filter(d => d.id !== docId);
        setDocs(updated);
        localStorage.setItem("school_os_docs", JSON.stringify(updated));
    };

    // ── Filter Logic ──
    const filtered = docs.filter(d => {
        const matchCat = selectedCategory === "all" || d.category === selectedCategory;
        const matchClass = selectedClass === "all" || d.class_name === selectedClass || d.class_name === "All Classes";
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.subject.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchClass && matchSearch;
    });

    const canUpload = userRole === "admin" || userRole === "teacher";
    const canDelete = userRole === "admin";

    return (
        <div style={{ color: "#fff", padding: "20px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>AWS Cloud Storage</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>AuraSoft Docs</div>
                </div>
                {canUpload && (
                    <button onClick={() => setShowUpload(!showUpload)} style={{ background: "#7b2d8b", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>
                        + New Upload
                    </button>
                )}
            </div>

            {/* Status Message */}
            {message && <div style={{ padding: 12, borderRadius: 8, marginBottom: 15, background: message.type === "success" ? "#065f46" : "#991b1b" }}>{message.text}</div>}

            {/* Upload Modal Snippet */}
            {showUpload && (
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15, marginBottom: 20 }}>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setSelectedFile(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current.click()}
                        style={{ border: `2px dashed ${dragOver ? "#c084fc" : "#444"}`, padding: 30, textAlign: "center", borderRadius: 10, cursor: "pointer" }}
                    >
                        {selectedFile ? `Selected: ${selectedFile.name}` : "Drag file here or click"}
                        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
                        <input placeholder="Subject" style={{ padding: 10, borderRadius: 5, background: "#222", border: "1px solid #444", color: "#fff" }} onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })} />
                        <select style={{ padding: 10, borderRadius: 5, background: "#222", color: "#fff" }} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>

                    <button onClick={handleUpload} style={{ width: "100%", marginTop: 15, padding: 12, background: "#7b2d8b", border: "none", color: "#fff", borderRadius: 8, fontWeight: "bold" }}>
                        {uploading ? `Processing... ${uploadProgress}%` : "Deploy to S3"}
                    </button>
                </div>
            )}

            {/* Search & Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input placeholder="Search..." style={{ flex: 1, padding: 10, borderRadius: 8, background: "#111", border: "1px solid #333", color: "#fff" }} onChange={e => setSearch(e.target.value)} />
                <select style={{ padding: 10, borderRadius: 8, background: "#111", color: "#fff" }} onChange={e => setSelectedClass(e.target.value)}>
                    <option value="all">All Classes</option>
                    {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Docs List Mapping */}
            {filtered.map(doc => (
                <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", padding: 15, borderRadius: 10, marginBottom: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                        <span style={{ fontSize: 24 }}>{getFileIcon(doc.name)}</span>
                        <div>
                            <div style={{ fontWeight: 600 }}>{doc.subject}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{doc.name} • {formatSize(doc.size)}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <a href={doc.url} target="_blank" rel="noreferrer" style={{ background: "#1e3a8a", color: "#fff", padding: "8px 15px", borderRadius: 5, textDecoration: "none", fontSize: 12 }}>Download</a>
                        {canDelete && <button onClick={() => handleDelete(doc.id)} style={{ background: "#450a0a", color: "#f87171", border: "none", padding: "8px 12px", borderRadius: 5 }}>🗑</button>}
                    </div>
                </div>
            ))}
        </div>
    );
}