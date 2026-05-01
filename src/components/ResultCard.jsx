import React, { useState, useMemo } from "react";

// ── CONFIGURATION: Subjects & Teachers ────────────────────────────────────
const SCHOOL_DATA = {
  classes: {
    "Nursery": ["English", "Hindi", "Math", "Drawing", "PT"],
    "Class 5": ["English", "Hindi", "Math", "Science", "SST", "Computer"],
    "Class 10": ["English", "Hindi", "Math", "Science", "SST", "IT"],
    "Class 12": ["English", "Physics", "Chemistry", "Math/Bio", "Computer", "PE"]
    // Note: You can fill other classes similarly
  },
  exams: [
    { id: "ut1", name: "UT-1", max: 20 },
    { id: "ut2", name: "UT-2", max: 20 },
    { id: "term1", name: "Term-1", max: 50 },
    { id: "ut3", name: "UT-3", max: 20 },
    { id: "halfYearly", name: "Half Yearly", max: 100 },
    { id: "ut4", name: "UT-4", max: 20 },
    { id: "term2", name: "Term-2", max: 50 },
    { id: "final", name: "Final Exam", max: 100 }
  ]
};

export default function SchoolOSUltimate() {
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [student, setStudent] = useState({ name: "", roll: "", father: "" });
  const [marks, setMarks] = useState({}); // { Subject: { ut1: 10, final: 80 ... } }

  // ── Calculation Engine ─────────────────────────────────────
  const calculateResult = useMemo(() => {
    const subjects = SCHOOL_DATA.classes[selectedClass] || [];
    let grandTotal = 0;
    let totalMax = 0;

    subjects.forEach(sub => {
      SCHOOL_DATA.exams.forEach(ex => {
        grandTotal += Number(marks[sub]?.[ex.id] || 0);
        totalMax += ex.max;
      });
    });

    const percentage = totalMax > 0 ? ((grandTotal / totalMax) * 100).toFixed(2) : 0;
    return { grandTotal, totalMax, percentage };
  }, [marks, selectedClass]);

  const getGrade = (score, max) => {
    const p = (score / max) * 100;
    if (p >= 90) return "A1";
    if (p >= 80) return "A2";
    if (p >= 33) return "Pass";
    return "Fail";
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f4f4f9" }}>

      {/* 🛠 ADMIN PANEL (Left Sidebar) */}
      <div className="no-print" style={sidebarStyle}>
        <h2 style={{ color: "#fff" }}>School OS Pro</h2>

        <div style={sectionStyle}>
          <label>Class Selection</label>
          <select style={inputStyle} onChange={(e) => setSelectedClass(e.target.value)}>
            {Object.keys(SCHOOL_DATA.classes).map(c => <option key={c}>{c}</option>)}
          </select>
          <input style={inputStyle} placeholder="Student Name" onChange={e => setStudent({ ...student, name: e.target.value })} />
          <input style={inputStyle} placeholder="Roll Number" onChange={e => setStudent({ ...student, roll: e.target.value })} />
        </div>

        <div style={{ ...sectionStyle, overflowY: "auto", maxHeight: "60vh" }}>
          <label>Marks Entry Grid</label>
          {(SCHOOL_DATA.classes[selectedClass] || []).map(sub => (
            <div key={sub} style={{ marginBottom: "15px", borderBottom: "1px solid #444", paddingBottom: "10px" }}>
              <p style={{ color: "#ffd700", margin: "5px 0" }}>{sub}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                {SCHOOL_DATA.exams.map(ex => (
                  <input
                    key={ex.id}
                    type="number"
                    placeholder={ex.name}
                    style={miniInput}
                    onChange={e => setMarks({
                      ...marks,
                      [sub]: { ...marks[sub], [ex.id]: e.target.value }
                    })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => window.print()} style={printBtn}>Download PDF Result</button>
      </div>

      {/* 📄 PROGRESS CARD (Right Preview) */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div id="report-card" style={reportCardStyle}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "4px double #2c3e50", marginBottom: "20px" }}>
            <h1 style={{ margin: 0 }}>MODERN PUBLIC ACADEMY</h1>
            <p>Annual Comprehensive Progress Record | 2023-24</p>
          </div>

          {/* Student Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px", fontWeight: "bold" }}>
            <span>Name: {student.name || "__________"}</span>
            <span>Class: {selectedClass}</span>
            <span>Roll No: {student.roll || "____"}</span>
          </div>

          {/* Master Table */}
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#2c3e50", color: "#fff" }}>
                <th style={tdStyle}>Subject</th>
                {SCHOOL_DATA.exams.map(ex => <th key={ex.id} style={tdStyle}>{ex.name}<br /><small>({ex.max})</small></th>)}
                <th style={tdStyle}>Total</th>
                <th style={tdStyle}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {(SCHOOL_DATA.classes[selectedClass] || []).map(sub => {
                let subTotal = 0;
                SCHOOL_DATA.exams.forEach(ex => subTotal += Number(marks[sub]?.[ex.id] || 0));
                return (
                  <tr key={sub}>
                    <td style={{ ...tdStyle, fontWeight: "bold", textAlign: "left" }}>{sub}</td>
                    {SCHOOL_DATA.exams.map(ex => (
                      <td key={ex.id} style={tdStyle}>{marks[sub]?.[ex.id] || "-"}</td>
                    ))}
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>{subTotal}</td>
                    <td style={tdStyle}>{getGrade(subTotal, 380)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Footer */}
          <div style={summaryBox}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span><strong>Grand Total:</strong> {calculateResult.grandTotal} / {calculateResult.totalMax}</span>
              <span><strong>Percentage:</strong> {calculateResult.percentage}%</span>
              <span><strong>Final Grade:</strong> {getGrade(calculateResult.grandTotal, calculateResult.totalMax)}</span>
            </div>
          </div>

          <div style={{ marginTop: "60px", display: "flex", justifyContent: "space-between" }}>
            <div style={sig}>Class Teacher</div>
            <div style={sig}>Principal Signature</div>
            <div style={sig}>Parent's Signature</div>
          </div>
        </div>
      </div>

      <style>{`@media print { .no-print { display: none; } #report-card { border: none; box-shadow: none; } }`}</style>
    </div>
  );
}

// ── STYLES ──────────────────────────────────────────────
const sidebarStyle = { width: "350px", background: "#2c3e50", color: "#fff", padding: "20px", display: "flex", flexDirection: "column" };
const sectionStyle = { marginBottom: "25px" };
const inputStyle = { width: "100%", padding: "10px", margin: "5px 0", borderRadius: "4px", border: "none" };
const miniInput = { width: "100%", padding: "5px", fontSize: "11px", borderRadius: "3px", border: "1px solid #ddd" };
const reportCardStyle = { width: "1100px", background: "#fff", padding: "40px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", border: "1px solid #ccc" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const tdStyle = { border: "1px solid #2c3e50", padding: "8px", textAlign: "center", fontSize: "12px" };
const summaryBox = { marginTop: "20px", padding: "15px", background: "#eee", borderRadius: "5px" };
const sig = { borderTop: "1px solid #000", width: "180px", textAlign: "center", paddingTop: "5px", fontWeight: "bold" };
const printBtn = { padding: "15px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };

// ── FIXED Calculation inside the Map ──────────────────────────
{
  subjects.map(sub => {
    let subTotal = 0;
    let subMaxTotal = 0; // Dynamic Max Marks calculate karne ke liye

    SCHOOL_DATA.exams.forEach(ex => {
      subTotal += Number(marks[sub]?.[ex.id] || 0);
      subMaxTotal += ex.max; // Har exam ka max add karo
    });

    return (
      <tr key={sub}>
        <td style={{ ...tdStyle, fontWeight: "bold", textAlign: "left" }}>{sub}</td>
        {SCHOOL_DATA.exams.map(ex => (
          <td key={ex.id} style={tdStyle}>{marks[sub]?.[ex.id] || "-"}</td>
        ))}
        <td style={{ ...tdStyle, fontWeight: "bold" }}>{subTotal}</td>
        {/* Ab ye har subject ke liye sahi grade nikalega */}
        <td style={tdStyle}>{getGrade(subTotal, subMaxTotal)}</td>
      </tr>
    );
  })
}