// CertificateGenerator.jsx — Auto Certificate System (ESLint FIXED)
import React, { useState } from 'react';

const C = { bg: '#0d1117', card: '#111827', primary: '#4e8ef7' };

const CERTIFICATE_TEMPLATES = {
    transfer: {
        title: "TRANSFER CERTIFICATE",
        fields: ["student_name", "class", "leaving_date", "reason", "conduct"]
    },
    bonafide: {
        title: "BONAFIDE CERTIFICATE",
        fields: ["student_name", "class", "admission_date", "status"]
    },
    character: {
        title: "CHARACTER CERTIFICATE",
        fields: ["student_name", "class", "conduct", "principal_signature"]
    }
};

// ✅ Line 34: template को properly define किया
function getCurrentTemplate(templateKey) {
    return CERTIFICATE_TEMPLATES[templateKey];
}

export default function CertificateGenerator() {
    const [template, setTemplate] = useState('transfer');
    const [studentData, setStudentData] = useState({
        student_name: "Aarav Sharma",
        class: "Class 5",
        admission_date: "01-04-2020",
        leaving_date: "31-03-2025",
        reason: "Parent Transfer",
        conduct: "Excellent",
        principal_signature: "Dr. Rajesh Sharma"
    });

    const generatePDF = () => {
        // ✅ Line 34 fix: template को function call से get करो
        const templateConfig = getCurrentTemplate(template);

        const html = `
        <div style="font-family: 'Times New Roman'; width: 800px; padding: 50px; text-align: center; background: #f9f9f9;">
            <div style="border: 3px double #000; padding: 40px; background: white; margin: 0 auto; max-width: 600px;">
                <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 30px; color: #1a365d;">${templateConfig.title}</h1>
                <p style="font-size: 16px; line-height: 1.6; text-align: justify; margin-bottom: 20px;">
                    This is to certify that <strong>${studentData.student_name}</strong> was a student of 
                    <strong>${studentData.class}</strong> at AuraSync School during the academic year 
                    <strong>${studentData.admission_date} to ${studentData.leaving_date || 'present'}</strong>.
                </p>
                ${templateConfig.fields.includes('conduct') && `
                <p style="font-size: 16px; line-height: 1.6; text-align: justify;">
                    His/Her conduct has been <strong>${studentData.conduct}</strong> throughout the stay.
                </p>
                `}
                <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                    <div style="text-align: center;">
                        <div style="border-top: 2px solid #000; width: 200px; margin: 0 auto 10px;"></div>
                        <div style="font-size: 14px; font-weight: bold;">Class Teacher</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="border-top: 2px solid #000; width: 200px; margin: 0 auto 10px;"></div>
                        <div style="font-size: 14px; font-weight: bold;">${studentData.principal_signature}</div>
                        <div style="font-size: 12px;">Principal</div>
                    </div>
                </div>
                <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
                    School Seal & Signature<br/>
                    Date: ${new Date().toLocaleDateString()}
                </div>
            </div>
        </div>`;

        const win = window.open('', '_blank');
        win.document.write(`
            <!DOCTYPE html><html><head><title>${templateConfig.title}</title>
            <style>@page{margin:1in}body{margin:0;padding:0}</style></head>
            <body>${html}</body>
        `);
        win.document.close();
    };

    return (
        <div style={{ padding: 24, background: C.bg, display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, background: C.card, padding: 24, borderRadius: 16 }}>
                <h2 style={{ color: 'white', marginBottom: 20 }}>📄 Certificate Generator</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <select value={template} onChange={e => setTemplate(e.target.value)} style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}>
                        <option value="transfer">Transfer Certificate</option>
                        <option value="bonafide">Bonafide Certificate</option>
                        <option value="character">Character Certificate</option>
                    </select>

                    {['student_name', 'class', 'admission_date', 'leaving_date', 'reason', 'conduct', 'principal_signature'].map(field => (
                        <input
                            key={field}
                            placeholder={field.replace('_', ' ').toUpperCase()}
                            value={studentData[field]}
                            onChange={e => setStudentData({ ...studentData, [field]: e.target.value })}
                            style={{ padding: 12, background: C.bg, color: 'white', borderRadius: 8, border: '1px solid #374151' }}
                        />
                    ))}
                </div>

                <button onClick={generatePDF} style={{
                    width: '100%', padding: '16px', background: C.primary, color: 'white',
                    border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 'bold', marginTop: 24
                }}>
                    🖨️ Generate & Print Certificate
                </button>
            </div>

            <div style={{ width: 2, background: '#374151' }}></div>

            {/* ✅ Line 110: Unique title add किया */}
            <div style={{ flex: 1 }}>
                <iframe
                    src="about:blank"
                    title="Certificate Preview - AuraSync School AI"
                    style={{ width: '100%', height: '80vh', borderRadius: 16, border: 'none' }}
                />
            </div>
        </div>
    );
}