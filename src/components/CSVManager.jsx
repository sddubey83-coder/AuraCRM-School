// ============================================
// FILE: auraschool-fresh > src > components > CSVManager.jsx
// 4 roles: admin, teacher, student, parent
// ============================================

import { useState, useRef } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function getToken() {
    return (
        localStorage.getItem('aura_token') ||
        localStorage.getItem('token') ||
        ''
    );
}

function getUserRole() {
    try {
        const token = localStorage.getItem('aura_token') || '';
        if (!token) return 'student';
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = (payload.role || '').toLowerCase().trim();
        if (role === 'admin') return 'admin';
        if (role === 'teacher') return 'teacher';
        if (role === 'parent') return 'parent';
        return 'student';
    } catch {
        return 'student';
    }
}

export default function CSVManager() {
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [activeImport, setActiveImport] = useState(null);
    const [activeExport, setActiveExport] = useState(null);
    const fileInputRef = useRef(null);

    const role = getUserRole();
    const token = getToken();

    const handleImport = (endpoint, label) => {
        setActiveImport(endpoint);
        setMessage('');
        setError('');
        fileInputRef.current.dataset.endpoint = endpoint;
        fileInputRef.current.dataset.label = label;
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            setError('Sirf .csv file allowed hai!');
            return;
        }
        const endpoint = fileInputRef.current.dataset.endpoint;
        const label = fileInputRef.current.dataset.label;
        setImporting(true);
        setProgress(0);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                setProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            setImporting(false);
            setActiveImport(null);
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                setMessage(`✅ ${label} import done! ${res.imported} records aaye, ${res.skipped} skip hue.${res.note ? ' | ' + res.note : ''}`);
                setProgress(100);
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    setError('❌ ' + (err.error || 'Import fail hua'));
                } catch {
                    setError('❌ Import fail hua. Dobara try karo.');
                }
            }
            fileInputRef.current.value = '';
        };

        xhr.onerror = () => {
            setImporting(false);
            setActiveImport(null);
            setError('❌ Network error. Server check karo.');
            fileInputRef.current.value = '';
        };

        xhr.open('POST', `${API}/api/csv/${endpoint}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    };

    const handleExport = async (endpoint, filename) => {
        setActiveExport(endpoint);
        setExporting(true);
        setMessage('');
        setError('');
        try {
            const res = await fetch(`${API}/api/csv/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json();
                setError('❌ ' + (err.error || 'Export fail hua'));
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setMessage('✅ Export ho gaya! File download ho rahi hai...');
        } catch (e) {
            setError('❌ Network error: ' + e.message);
        } finally {
            setExporting(false);
            setActiveExport(null);
        }
    };

    const config = {
        admin: {
            imports: [
                { label: 'Students Import', endpoint: 'admin/students/import', tip: 'name, phone, class, section, roll_no, parent_name, parent_phone' },
                { label: 'Staff Import', endpoint: 'admin/staff/import', tip: 'name, email, role, subject, phone' },
            ],
            exports: [
                { label: 'Students Export', endpoint: 'admin/students/export', filename: 'students' },
                { label: 'Staff Export', endpoint: 'admin/staff/export', filename: 'staff' },
                { label: 'Fees Export', endpoint: 'admin/fees/export', filename: 'fees' },
            ],
        },
        teacher: {
            imports: [
                { label: 'Results Import', endpoint: 'teacher/results/import', tip: 'student_phone, subject, marks, max_marks, exam_name, exam_date' },
            ],
            exports: [
                { label: 'Results Export', endpoint: 'teacher/results/export', filename: 'results' },
                { label: 'Assignments Export', endpoint: 'teacher/assignments/export', filename: 'assignments' },
            ],
        },
        student: {
            imports: [],
            exports: [
                { label: 'Mera Result Download', endpoint: 'student/results/export', filename: 'my_results' },
                { label: 'Assignments Download', endpoint: 'student/assignments/export', filename: 'assignments' },
            ],
        },
        parent: {
            imports: [],
            exports: [
                { label: 'Bachche ka Result', endpoint: 'parent/results/export', filename: 'child_results' },
                { label: 'Fees Download', endpoint: 'parent/fees/export', filename: 'fees' },
            ],
        },
    };

    const current = config[role] || config.student;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📊 CSV Import / Export</h2>
            <p style={styles.subtitle}>
                Role: <strong style={styles.badge}>{role.toUpperCase()}</strong> &nbsp;|&nbsp;
                5 lakh+ rows bhi handle hoga — no crash!
            </p>

            <div style={styles.grid}>
                {current.imports.length > 0 && (
                    <div style={styles.card}>
                        <div style={styles.cardIcon}>⬆️</div>
                        <h3 style={styles.cardTitle}>Import CSV</h3>
                        {current.imports.map((item) => (
                            <div key={item.endpoint} style={{ marginBottom: '12px' }}>
                                <button
                                    onClick={() => handleImport(item.endpoint, item.label)}
                                    disabled={importing}
                                    style={{
                                        ...styles.importBtn,
                                        opacity: importing ? 0.6 : 1,
                                        cursor: importing ? 'not-allowed' : 'pointer',
                                        background: activeImport === item.endpoint ? '#3730a3' : '#4f46e5',
                                    }}
                                >
                                    {activeImport === item.endpoint && importing ? `⏳ ${progress}% uploading...` : `⬆️ ${item.label}`}
                                </button>
                                <p style={styles.tip}>Columns: <code>{item.tip}</code></p>
                            </div>
                        ))}
                        {importing && (
                            <div style={styles.progressWrap}>
                                <div style={styles.progressBg}>
                                    <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                                </div>
                                <span style={styles.progressText}>{progress}% upload ho gaya</span>
                            </div>
                        )}
                    </div>
                )}

                <div style={styles.card}>
                    <div style={styles.cardIcon}>⬇️</div>
                    <h3 style={styles.cardTitle}>Export CSV</h3>
                    <p style={styles.cardDesc}>Streaming se download — memory safe rahegi.</p>
                    {current.exports.map((item) => (
                        <button
                            key={item.endpoint}
                            onClick={() => handleExport(item.endpoint, item.filename)}
                            disabled={exporting}
                            style={{
                                ...styles.exportBtn,
                                opacity: exporting ? 0.6 : 1,
                                cursor: exporting ? 'not-allowed' : 'pointer',
                                background: activeExport === item.endpoint ? '#047857' : '#059669',
                                marginBottom: '10px',
                            }}
                        >
                            {activeExport === item.endpoint && exporting ? '⏳ Downloading...' : `⬇️ ${item.label}`}
                        </button>
                    ))}
                </div>
            </div>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />

            {message && <div style={styles.successMsg}>{message}</div>}
            {error && <div style={styles.errorMsg}>{error}</div>}

            {current.imports.length > 0 && (
                <div style={styles.tips}>
                    <p style={styles.tipsTitle}>💡 CSV Tips:</p>
                    <ul style={{ fontSize: '12px', color: '#475569', paddingLeft: '16px' }}>
                        <li>Pehli row mein column names hone chahiye</li>
                        <li>Phone number last 10 digits use hoga</li>
                        <li>Duplicate records automatically skip ho jaayenge</li>
                        <li>Max file size: 50MB | Max rows: 5 lakh</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '860px', margin: '0 auto', fontFamily: 'sans-serif' },
    title: { fontSize: '22px', fontWeight: '600', margin: '0 0 4px 0', color: '#1a1a2e' },
    subtitle: { fontSize: '13px', color: '#666', margin: '0 0 24px 0' },
    badge: { background: '#ede9fe', color: '#4f46e5', padding: '2px 10px', borderRadius: '99px', fontSize: '12px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
    card: { border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    cardIcon: { fontSize: '32px', marginBottom: '12px' },
    cardTitle: { fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' },
    cardDesc: { fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.5' },
    tip: { fontSize: '11px', color: '#94a3b8', marginTop: '4px', marginBottom: 0 },
    importBtn: { display: 'block', width: '100%', padding: '10px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textAlign: 'left' },
    exportBtn: { display: 'block', width: '100%', padding: '10px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textAlign: 'left' },
    progressWrap: { marginTop: '16px' },
    progressBg: { height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' },
    progressBar: { height: '100%', background: '#4f46e5', borderRadius: '4px', transition: 'width 0.2s ease' },
    progressText: { fontSize: '12px', color: '#666' },
    successMsg: { padding: '12px 16px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    errorMsg: { padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
    tips: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' },
    tipsTitle: { fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' },
};