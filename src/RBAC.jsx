/**
 * School OS — Role Based Access Control (RBAC)
 * 4 roles: Admin, Teacher, Parent, Student
 * Usage: import { RBACProvider, useAuth, RoleGuard } from './RBAC'
 */

import { createContext, useContext, useState, useEffect } from "react";

// ── Role Definitions ───────────────────────────────────────
export const ROLES = {
    ADMIN: "admin",
    TEACHER: "teacher",
    PARENT: "parent",
    STUDENT: "student",
};

export const PERMISSIONS = {
    admin: [
        "view_all", "edit_all", "delete_all",
        "manage_fees", "manage_students", "manage_teachers",
        "manage_admissions", "view_reports", "send_communications",
        "manage_timetable", "manage_transport", "manage_modules",
        "view_analytics", "manage_roles", "system_settings"
    ],
    teacher: [
        "mark_attendance", "view_attendance",
        "enter_marks", "view_marks",
        "assign_homework", "view_homework",
        "view_student_progress", "view_class_reports",
        "communicate_parents", "view_timetable",
        "view_fee_status", "view_students",
        "view_notifications", "send_notifications"
    ],
    parent: [
        "view_child_attendance", "view_child_marks",
        "view_fee_status", "pay_fees",
        "view_notifications", "communicate_teacher",
        "view_timetable", "view_child_homework",
        "view_child_progress"
    ],
    student: [
        "view_own_attendance", "view_own_marks",
        "view_homework", "submit_homework",
        "view_timetable", "view_notifications",
        "view_own_progress"
    ],
};

// ── Auth Context ───────────────────────────────────────────
const AuthContext = createContext(null);

export function RBACProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("aura_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (role, userData) => {
        const user = { role, ...userData, permissions: PERMISSIONS[role] || [] };
        setCurrentUser(user);
        localStorage.setItem("aura_user", JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem("aura_user");
    };

    const hasPermission = (permission) => {
        if (!currentUser) return false;
        return currentUser.permissions.includes(permission);
    };

    const hasRole = (role) => {
        if (!currentUser) return false;
        return currentUser.role === role;
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, hasPermission, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    // Safety Check: अगर Context Provider के बाहर इस्तेमाल हो रहा है
    if (context === undefined) {
        throw new Error("useAuth must be used within an RBACProvider");
    }
    return context;
}


// ── Role Guard Component ───────────────────────────────────
export function RoleGuard({ permission, role, children, fallback = null }) {
    const auth = useAuth();

    // अगर auth या currentUser मौजूद नहीं है, तो सीधे fallback दिखाएँ (Blank page नहीं होगा)
    if (!auth || !auth.currentUser) return fallback;

    const { hasPermission, hasRole } = auth;

    if (permission && !hasPermission(permission)) return fallback;
    if (role && !hasRole(role)) return fallback;

    return children;
}

// ── Demo Login Screen ──────────────────────────────────────
export function RBACLoginDemo({ onLogin }) {
    const { login } = useAuth();

    const demoUsers = [
        { role: "admin", name: "Shyam Dubey", email: "admin@aurasynk.com", icon: "👑", color: "#c084fc", desc: "Full system access" },
        { role: "teacher", name: "Mrs. Verma", email: "verma@aurasynk.com", icon: "👩‍🏫", color: "#34d399", desc: "Attendance, Marks, Students" },
        { role: "parent", name: "Mohan Sharma", email: "parent@aurasynk.com", icon: "👨‍👩‍👧", color: "#60a5fa", desc: "Child progress, Fees" },
        { role: "student", name: "Ravi Sharma", email: "student@aurasynk.com", icon: "👨‍🎓", color: "#fbbf24", desc: "Marks, Attendance, Homework" },
    ];

    const handleLogin = (user) => {
        login(user.role, { name: user.name, email: user.email });
        if (onLogin) onLogin(user.role);
    };

    return (
        <div style={{ color: "#fff", fontFamily: "inherit" }}>
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
                    Role Based Access Control
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Login As</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {demoUsers.map(user => (
                    <div key={user.role} onClick={() => handleLogin(user)} style={{
                        background: "rgba(255,255,255,0.03)", border: `0.5px solid ${user.color}33`,
                        borderRadius: 14, padding: "20px 16px", cursor: "pointer",
                        transition: "transform 0.15s, border-color 0.15s",
                        borderTop: `3px solid ${user.color}`
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = user.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = `${user.color}33`}
                    >
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{user.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: user.color, marginBottom: 4 }}>
                            {user.role.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user.desc}</div>
                        <button style={{
                            marginTop: 14, width: "100%", background: `${user.color}22`,
                            border: `0.5px solid ${user.color}44`, color: user.color,
                            padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>
                            Login as {user.role}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Role Dashboard ─────────────────────────────────────────
export function RoleDashboard() {
    const { currentUser, logout, hasPermission } = useAuth();

    if (!currentUser) return null;

    const roleColors = {
        admin: "#c084fc", teacher: "#34d399",
        parent: "#60a5fa", student: "#fbbf24"
    };
    const color = roleColors[currentUser.role] || "#fff";

    const allPerms = PERMISSIONS[currentUser.role] || [];

    return (
        <div style={{ color: "#fff", fontFamily: "inherit" }}>
            {/* User Card */}
            <div style={{
                background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                border: `0.5px solid ${color}33`, borderRadius: 14,
                padding: "20px", marginBottom: 20,
                display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: `${color}22`, display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 22
                    }}>
                        {currentUser.role === "admin" ? "👑" : currentUser.role === "teacher" ? "👩‍🏫" : currentUser.role === "parent" ? "👨‍👩‍👧" : "👨‍🎓"}
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{currentUser.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{currentUser.email}</div>
                        <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {currentUser.role}
                        </div>
                    </div>
                </div>
                <button onClick={logout} style={{
                    background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)", padding: "8px 16px", borderRadius: 8,
                    fontSize: 12, cursor: "pointer"
                }}>Logout</button>
            </div>

            {/* Permissions */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                    Your permissions ({allPerms.length} total):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {allPerms.map(perm => (
                        <span key={perm} style={{
                            background: `${color}15`, border: `0.5px solid ${color}33`,
                            color: color, padding: "4px 10px", borderRadius: 20,
                            fontSize: 11, fontWeight: 500
                        }}>
                            ✓ {perm.replace(/_/g, " ")}
                        </span>
                    ))}
                </div>
            </div>

            {/* Role specific quick actions */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color }}>
                    Quick Actions — {currentUser.role}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {currentUser.role === "admin" && [
                        { label: "Manage All Students", icon: "👨‍🎓" },
                        { label: "Fee Collection Report", icon: "💰" },
                        { label: "Teacher Analytics", icon: "📊" },
                        { label: "System Settings", icon: "⚙️" },
                    ].map(a => (
                        <div key={a.label} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px", cursor: "pointer" }}>
                            <span style={{ fontSize: 18 }}>{a.icon}</span>
                            <div style={{ fontSize: 12, marginTop: 6, color: "rgba(255,255,255,0.7)" }}>{a.label}</div>
                        </div>
                    ))}
                    {currentUser.role === "teacher" && [
                        { label: "Mark Attendance", icon: "✅" },
                        { label: "Enter Marks", icon: "📝" },
                        { label: "Assign Homework", icon: "📚" },
                        { label: "View Timetable", icon: "📅" },
                    ].map(a => (
                        <div key={a.label} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px", cursor: "pointer" }}>
                            <span style={{ fontSize: 18 }}>{a.icon}</span>
                            <div style={{ fontSize: 12, marginTop: 6, color: "rgba(255,255,255,0.7)" }}>{a.label}</div>
                        </div>
                    ))}
                    {currentUser.role === "parent" && [
                        { label: "Child Attendance", icon: "📋" },
                        { label: "Pay Fees", icon: "💳" },
                        { label: "View Marks", icon: "📊" },
                        { label: "Message Teacher", icon: "💬" },
                    ].map(a => (
                        <div key={a.label} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px", cursor: "pointer" }}>
                            <span style={{ fontSize: 18 }}>{a.icon}</span>
                            <div style={{ fontSize: 12, marginTop: 6, color: "rgba(255,255,255,0.7)" }}>{a.label}</div>
                        </div>
                    ))}
                    {currentUser.role === "student" && [
                        { label: "My Attendance", icon: "📋" },
                        { label: "My Marks", icon: "📊" },
                        { label: "Homework", icon: "📚" },
                        { label: "Timetable", icon: "📅" },
                    ].map(a => (
                        <div key={a.label} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px", cursor: "pointer" }}>
                            <span style={{ fontSize: 18 }}>{a.icon}</span>
                            <div style={{ fontSize: 12, marginTop: 6, color: "rgba(255,255,255,0.7)" }}>{a.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main RBAC Component ────────────────────────────────────
// ... (RoleDashboard का पूरा कोड यहाँ खत्म होगा) ...

// ── Main RBAC Component ────────────────────────────────────
// इसे फ़ाइल के एकदम आखिर में रखें
export default function RBAC() {
    const auth = useAuth();

    // सुरक्षा चेक: अगर context अभी लोड नहीं हुआ है
    if (!auth) {
        return (
            <div style={{ color: "rgba(255,255,255,0.5)", padding: 40, textAlign: "center" }}>
                Initializing Security Layer...
            </div>
        );
    }

    const { currentUser } = auth;

    // अगर यूजर लॉग-इन है तो डैशबोर्ड दिखाओ, वरना लॉगिन स्क्रीन
    return currentUser ? <RoleDashboard /> : <RBACLoginDemo />;
}
