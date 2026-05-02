// components/DocsManager.jsx — Syllabus & Documents Manager (ESLint FIXED)
import React, { useState, useRef } from 'react';

const CATEGORIES = ['Syllabus', 'Circular', 'Exam Schedule', 'Fee Structure', 'Holiday List', 'Results', 'Forms', 'Other'];
const CLASSES = ['All Classes', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

const SAMPLE_DOCS = [
    { id: 1, name: 'Annual Syllabus 2024-25 - Class 10', category: 'Syllabus', class: '10th', uploadedBy: 'Admin', date: '2024-04-15', size: '2.4 MB', type: 'pdf', shared: true },
    { id: 2, name: 'Mid-Term Exam Schedule', category: 'Exam Schedule', class: 'All Classes', uploadedBy: 'Principal', date: '2024-04-20', size: '0.8 MB', type: 'pdf', shared: true },
    { id: 3, name: 'Fee Structure 2024-25', category: 'Fee Structure', class: 'All Classes', uploadedBy: 'Accounts', date: '2024-03-01', size: '1.2 MB', type: 'pdf', shared: false },
    { id: 4, name: 'Summer Holiday Circular', category: 'Circular', class: 'All Classes', uploadedBy: 'Admin', date: '2024-04-28', size: '0.3 MB', type: 'docx', shared: true },
    { id: 5, name: 'Class 8 Science Syllabus', category: 'Syllabus', class: '8th', uploadedBy: 'Teacher', date: '2024-04-10', size: '1.8 MB', type: 'pdf', shared: false },
    { id: 6, name: 'Admission Form 2024-25', category: 'Forms', class: 'All Classes', uploadedBy: 'Admin', date: '2024-02-15', size: '0.5 MB', type: 'pdf', shared: true },
];

function DocIcon({ type }) {
    const icons = { pdf: '📄', docx: '📝', xlsx: '📊', pptx: '📊', img: '🖼️' };
    const colors = { pdf: '#f45b69', docx: '#4e8ef7', xlsx: '#00d97e', img: '#f6c90e' };
    return (
        <span style={{
            fontSize: 22, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: (colors[type] || '#9ca3af') + '22', borderRadius: 10
        }}>{icons[type] || '📄'}</span>
    );
}

export default function DocsManager({ userRole = 'admin', schoolId }) {
    const [docs, setDocs] = useState(SAMPLE_DOCS);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [filterClass, setFilterClass] = useState('All Classes');
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadForm, setUploadForm] = useState({ name: '', category: CATEGORIES[0], class: 'All Classes' });
    const [selectedDoc, setSelectedDoc] = useState(null); // ✅ Line 37: अब used होगा
    const fileRef = useRef(null);

    const filtered = docs.filter(d => {
        const s = search.toLowerCase();
        const matchSearch = !s || d.name.toLowerCase().includes(s) || d.category.toLowerCase().includes(s);
        const matchCat = filterCat === 'all' || d.category === filterCat;
        const matchClass = filterClass === 'All Classes' || d.class === filterClass;
        return matchSearch && matchCat && matchClass;
    });

    const handleUpload = () => {
        if (!uploadForm.name) return alert('Document name required');
        setUploading(true);
        setTimeout(() => {
            const newDoc = {
                id: Date.now(),
                ...uploadForm,
                uploadedBy: userRole === 'admin' ? 'Admin' : 'Staff',
                date: new Date().toISOString().split('T')[0],
                size: '1.0 MB',
                type: 'pdf',
                shared: false,
            };
            setDocs(prev => [newDoc, ...prev]);
            setUploadForm({ name: '', category: CATEGORIES[0], class: 'All Classes' });
            setShowUpload(false);
            setUploading(false);
        }, 1200);
    };

    const deleteDoc = (id) => {
        if (!window.confirm('Delete this document?')) return;
        setDocs(prev => prev.filter(d => d.id !== id));
    };

    const toggleShare = (id) => {
        setDocs(prev => prev.map(d => d.id === id ? { ...d, shared: !d.shared } : d));
    };

    // ✅ Line 37 fix: selectedDoc को use किया
    const handleDocSelect = (doc) => {
        setSelectedDoc(doc);
        // Preview logic यहाँ add हो सकती है
        console.log('Selected document:', doc.name);
    };

    const catCounts = CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: docs.filter(d => d.category === c).length }), {});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { icon: '📚', label: 'Total Documents', value: docs.length, color: '#4e8ef7' },
                    { icon: '📤', label: 'Shared', value: docs.filter(d => d.shared).length, color: '#00d97e' },
                    { icon: '🔒', label: 'Private', value: docs.filter(d => !d.shared).length, color: '#f6c90e' },
                    { icon: '📁', label: 'Categories', value: CATEGORIES.length, color: '#a78bfa' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 14, padding: '16px 20px' }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <p style={{ margin: '6px 0 2px', fontSize: 10, color: '#6b7280', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Category quick filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setFilterCat('all')} style={{
                    padding: '6px 14px', borderRadius: 20, border: filterCat === 'all' ? 'none' : '1px solid #1f2d3d',
                    background: filterCat === 'all' ? '#4e8ef7' : 'transparent',
                    color: filterCat === 'all' ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}>All ({docs.length})</button>
                {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setFilterCat(filterCat === c ? 'all' : c)} style={{
                        padding: '6px 14px', borderRadius: 20, border: filterCat === c ? 'none' : '1px solid #1f2d3d',
                        background: filterCat === c ? '#1f2d3d' : 'transparent',
                        color: filterCat === c ? '#f1f5f9' : '#9ca3af', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}>{c} {catCounts[c] > 0 && `(${catCounts[c]})`}</button>
                ))}
            </div>

            {/* Search + filters + upload */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input placeholder="🔍 Search documents..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 16px', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                    style={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={() => setShowUpload(!showUpload)} style={{
                    padding: '10px 18px', borderRadius: 10, border: 'none',
                    background: showUpload ? '#374151' : '#4e8ef7', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}>{showUpload ? '✕ Cancel' : '+ Upload Doc'}</button>
            </div>

            {/* Upload form */}
            {showUpload && (
                <div style={{ background: '#111827', border: '1px solid #1f2d3d', borderRadius: 14, padding: 20 }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, color: '#4e8ef7', fontSize: 14 }}>📤 Upload New Document</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Document Name *</label>
                            <input value={uploadForm.name} onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                                placeholder="e.g. Class 10 Maths Syllabus"
                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Category</label>
                            <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>For Class</label>
                            <select value={uploadForm.class} onChange={e => setUploadForm({ ...uploadForm, class: e.target.value })}
                                style={{ background: '#0d1117', border: '1px solid #1f2d3d', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none' }}>
                                {CLASSES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div onClick={() => fileRef.current?.click()} style={{
                            flex: 1, border: '2px dashed #1f2d3d', borderRadius: 10, padding: '16px',
                            textAlign: 'center', cursor: 'pointer', color: '#6b7280', fontSize: 13
                        }}>
                            📎 Click to select file (PDF, DOCX, XLSX)
                            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.pptx" style={{ display: 'none' }} />
                        </div>
                        <button onClick={handleUpload} disabled={uploading} style={{
                            padding: '12px 24px', borderRadius: 10, border: 'none',
                            background: uploading ? '#374151' : '#00d97e', color: '#fff',
                            fontWeight: 700, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer'
                        }}>{uploading ? '⏳ Uploading...' : '💾 Save'}</button>
                    </div>
                </div>
            )}

            {/* Document list */}
            <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1f2d3d', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2d3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#f1f5f9' }}>Documents <span style={{ color: '#6b7280', fontWeight: 400 }}>({filtered.length})</span></p>
                </div>
                {filtered.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No documents found.</p>
                )}
                {filtered.map(doc => (
                    <div
                        key={doc.id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 20px', borderBottom: '1px solid #1f2d3d',
                            background: selectedDoc?.id === doc.id ? '#1f2d3d' : 'transparent',  // ✅ selectedDoc used यहाँ
                            cursor: 'pointer'
                        }}
                        onClick={() => handleDocSelect(doc)}  // ✅ selectedDoc को use करने के लिए click handler add
                    >
                        <DocIcon type={doc.type} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#f1f5f9', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>{doc.category}</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>·</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>{doc.class}</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>·</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>{doc.size}</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>·</span>
                                <span style={{ fontSize: 11, color: '#6b7280' }}>by {doc.uploadedBy}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{
                                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                                background: doc.shared ? '#00d97e22' : '#1f2d3d',
                                color: doc.shared ? '#00d97e' : '#6b7280'
                            }}>{doc.shared ? '🌐 Shared' : '🔒 Private'}</span>
                            <button onClick={(e) => { e.stopPropagation(); toggleShare(doc.id); }} title={doc.shared ? 'Make Private' : 'Share'} style={{
                                background: 'transparent', border: '1px solid #1f2d3d', borderRadius: 8,
                                padding: '5px 10px', color: '#9ca3af', cursor: 'pointer', fontSize: 12
                            }}>{doc.shared ? '🔒' : '🌐'}</button>
                            <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }} title="Delete" style={{
                                background: 'transparent', border: '1px solid #f45b6933', borderRadius: 8,
                                padding: '5px 10px', color: '#f45b69', cursor: 'pointer', fontSize: 12
                            }}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ Selected document preview (optional enhancement) */}
            {selectedDoc && (
                <div style={{ background: '#111827', border: '1px solid #4e8ef7', borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, color: '#4e8ef7', fontWeight: 700 }}>📄 Selected: {selectedDoc.name}</h3>
                        <button onClick={() => setSelectedDoc(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer' }}>✕</button>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: 13 }}>Preview panel - Document details and download options would go here.</p>
                </div>
            )}
        </div>
    );
}