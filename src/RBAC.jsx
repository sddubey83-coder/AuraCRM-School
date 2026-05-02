import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ─── 🛠️ CONFIGURATION ───────────────────────────────────────
const PERMISSIONS = {
    admin: ['*'], // '*' means everything
    staff: ['view_all', 'edit_leads', 'view_results', 'send_comms', 'view_insights'],
    accounts: ['view_all', 'manage_fees', 'view_insights'],
    teacher: ['view_students', 'edit_results', 'view_results', 'view_timetable']
};

const RBACContext = createContext(null);

export function RBACProvider({ children }) {
    // 🔄 AUTH STATE: LocalStorage se user uthana
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('aura_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    // 🔑 LOGIN/LOGOUT ACTIONS
    const login = useCallback((role, userData) => {
        const fullUser = { ...userData, role, id: Date.now() };
        setUser(fullUser);
        localStorage.setItem('aura_user', JSON.stringify(fullUser));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('aura_user');
        window.location.href = "/"; // Force redirect on logout
    }, []);

    // 🛡️ PERMISSION ENGINE
    const hasPermission = useCallback((perm) => {
        if (!user) return false;
        const userPerms = PERMISSIONS[user.role] || [];
        return userPerms.includes('*') || userPerms.includes(perm);
    }, [user]);

    const hasRole = useCallback((roleName) => user?.role === roleName, [user]);

    // ⚡ MEMOIZED VALUE (Performance Optimization)
    const value = useMemo(() => ({
        user,
        role: user?.role || null,
        login,
        logout,
        hasPermission,
        hasRole,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher'
    }), [user, login, logout, hasPermission, hasRole]);

    return (
        <RBACContext.Provider value={value}>
            {children}
        </RBACContext.Provider>
    );
}

// ─── 🪝 PRO HOOKS ──────────────────────────────────────────
export const useAuth = () => {
    const ctx = useContext(RBACContext);
    if (!ctx) throw new Error("useAuth must be used within RBACProvider");
    return ctx;
};

// Error solving aliases (Taki App.js crash na ho)
export const useRBAC = useAuth;

// ─── 🛡️ GUARD COMPONENTS ────────────────────────────────────
export function RoleGuard({ permission, role, children, fallback = null }) {
    const { hasPermission, hasRole } = useAuth();

    if (permission && !hasPermission(permission)) return fallback;
    if (role && !hasRole(role)) return fallback;

    return <>{children}</>;
}

export const Can = RoleGuard; // Alias for flexibility

// ─── 🚪 DEMO LOGIN (For immediate fix) ──────────────────────
export function RBACLoginDemo() {
    const { login } = useAuth();
    const roles = ['admin', 'teacher', 'staff', 'accounts'];

    return (
        <div className="p-10 bg-slate-900 rounded-3xl text-white shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-black mb-6">AuraSync Login Interface</h2>
            <div className="grid grid-cols-2 gap-4">
                {roles.map(r => (
                    <button
                        key={r}
                        onClick={() => login(r, { name: `Demo ${r}`, email: `${r}@aurasynk.com` })}
                        className="p-4 bg-slate-800 hover:bg-blue-600 rounded-xl font-bold capitalize transition-all"
                    >
                        Login as {r}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default RBACContext;
