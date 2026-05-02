// App.js — Enterprise School OS Hub (FULLY UPDATED & ESLint FIXED)
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // ❌ useLocation REMOVED

// Framework Imports (YOUR EXISTING)
import MainApp from "./MainApp";
import { useAuth, RBACLoginDemo, RoleGuard } from "./RBAC";

// 🔥 NEW MODULES (Lazy Load - Zero Performance Impact)
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const StaffModule = lazy(() => import("./StaffModule"));
const StudentAttendance = lazy(() => import("./components/StudentAttendance"));
const ExamScheduler = lazy(() => import("./components/ExamScheduler"));
const ParentPortal = lazy(() => import("./components/ParentPortal"));
const NoticeBoard = lazy(() => import("./components/NoticeBoard"));
const HomeworkTracker = lazy(() => import("./components/HomeworkTracker"));
const CertificateGenerator = lazy(() => import("./components/CertificateGenerator"));
const AcademicCalendar = lazy(() => import("./components/AcademicCalendar"));
const AuditLogs = lazy(() => import("./components/AuditLogs"));
const LibraryManagement = lazy(() => import("./utils/LibraryManagement"));

// ─── 🛡️ YOUR EXISTING LAYOUT (Unchanged) ────────────────────
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-blue-100">
      <Suspense fallback={
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0f172a]">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-bold text-xs tracking-widest animate-pulse">AURASYNC ENGINE LOADING...</p>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
};

// ─── 🧭 YOUR NAVIGATION CORE (ENHANCED) ─────────────────────
function NavigationLogic() {
  const { user, isAdmin } = useAuth(); // ❌ logout REMOVED (unused)

  // 1. YOUR LOGIN PORTAL (Unchanged)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-6">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          <div className="hidden md:block">
            <h1 className="text-6xl font-black text-white leading-tight">
              Manage <br /> <span className="text-blue-500">Education</span> <br /> with Intelligence.
            </h1>
            <p className="text-slate-400 mt-6 text-lg">17 Modules Complete: Attendance, Exams, Parents, Library, Hostel, Sports, Certificates...</p>
          </div>
          <div className="bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl backdrop-blur-xl">
            <RBACLoginDemo />
          </div>
        </div>
      </div>
    );
  }

  // 2. 🔥 YOUR DASHBOARD (ENHANCED with ALL Modules)
  return (
    <AppLayout>
      <Routes>
        {/* 🏠 YOUR DASHBOARD (Enhanced Quick Launch) */}
        <Route path="/dashboard" element={
          <div className="p-10 max-w-6xl mx-auto">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 font-black text-9xl uppercase tracking-tighter select-none">Aura</div>
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-2">School ERP Complete</h2>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Welcome, {user.name}</h1>
              <p className="text-slate-500 mt-4 text-lg font-medium max-w-2xl">
                17 Modules Ready: {user.role === 'admin' ? 'Full Admin Access' : 'Staff Access'}. Click any module below.
              </p>

              {/* 🔥 FULL MODULE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {isAdmin && (
                  <a href="/admin" className="p-8 bg-[#0f172a] text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                    <p className="text-[10px] text-blue-400 uppercase mb-4 tracking-widest">Master Control</p>
                    Admin Panel 👑
                    <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-blue-300">All Permissions</div>
                  </a>
                )}

                <a href="/staff" className="p-8 bg-blue-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-blue-200 uppercase mb-4 tracking-widest">HR System</p>
                  Staff & Payroll 👥
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-blue-200">Attendance + Salary</div>
                </a>

                <a href="/attendance" className="p-8 bg-emerald-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-emerald-200 uppercase mb-4 tracking-widest">Core Module</p>
                  Student Attendance 📋
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-emerald-200">Daily + Parent SMS</div>
                </a>

                <a href="/exams" className="p-8 bg-purple-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-purple-200 uppercase mb-4 tracking-widest">Academic</p>
                  Exam Scheduler 📅
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-purple-200">AI Conflict Free</div>
                </a>

                <a href="/parents" className="p-8 bg-indigo-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-indigo-200 uppercase mb-4 tracking-widest">Parent App</p>
                  Parent Portal 👨‍👩‍👧
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-indigo-200">Mobile PWA</div>
                </a>

                <a href="/notices" className="p-8 bg-orange-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-orange-200 uppercase mb-4 tracking-widest">Communication</p>
                  Notice Board 📢
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-orange-200">Digital Broadcast</div>
                </a>

                <a href="/homework" className="p-8 bg-pink-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-pink-200 uppercase mb-4 tracking-widest">Academic</p>
                  Homework Tracker 📚
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-pink-200">Submission Rate</div>
                </a>

                <a href="/certificates" className="p-8 bg-teal-600 text-white rounded-[2rem] font-black text-left hover:scale-[1.02] transition-transform shadow-xl group">
                  <p className="text-[10px] text-teal-200 uppercase mb-4 tracking-widest">Documents</p>
                  Certificates 📄
                  <div className="opacity-0 group-hover:opacity-100 transition-all mt-2 text-xs text-teal-200">Auto Generate</div>
                </a>
              </div>

              {/* 🔥 MORE MODULES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200">
                <a href="/calendar" className="p-6 bg-slate-50 text-slate-900 rounded-xl font-semibold text-center hover:bg-slate-100 transition-all group">
                  📅 Academic Calendar
                </a>
                <a href="/audit" className="p-6 bg-slate-50 text-slate-900 rounded-xl font-semibold text-center hover:bg-slate-100 transition-all group">
                  🔍 Audit Logs
                </a>
                <a href="/library" className="p-6 bg-slate-50 text-slate-900 rounded-xl font-semibold text-center hover:bg-slate-100 transition-all group">
                  📚 Library Management
                </a>
              </div>
            </div>
          </div>
        } />

        {/* 🔥 ALL NEW MODULE ROUTES WITH YOUR RBAC */}
        <Route path="/attendance" element={
          <RoleGuard permission="attendance" fallback={<Navigate to="/dashboard" />}>
            <StudentAttendance />
          </RoleGuard>
        } />
        <Route path="/exams" element={
          <RoleGuard permission="exams" fallback={<Navigate to="/dashboard" />}>
            <ExamScheduler />
          </RoleGuard>
        } />
        <Route path="/parents" element={
          <RoleGuard permission="parents" fallback={<Navigate to="/dashboard" />}>
            <ParentPortal />
          </RoleGuard>
        } />
        <Route path="/notices" element={
          <RoleGuard permission="notices" fallback={<Navigate to="/dashboard" />}>
            <NoticeBoard />
          </RoleGuard>
        } />
        <Route path="/homework" element={
          <RoleGuard permission="homework" fallback={<Navigate to="/dashboard" />}>
            <HomeworkTracker />
          </RoleGuard>
        } />
        <Route path="/certificates" element={
          <RoleGuard permission="certificates" fallback={<Navigate to="/dashboard" />}>
            <CertificateGenerator />
          </RoleGuard>
        } />
        <Route path="/calendar" element={
          <RoleGuard permission="calendar" fallback={<Navigate to="/dashboard" />}>
            <AcademicCalendar />
          </RoleGuard>
        } />
        <Route path="/audit" element={
          <RoleGuard role="admin" fallback={<Navigate to="/dashboard" />}>
            <AuditLogs />
          </RoleGuard>
        } />
        <Route path="/library" element={
          <RoleGuard permission="library" fallback={<Navigate to="/dashboard" />}>
            <LibraryManagement />
          </RoleGuard>
        } />

        {/* 🛡️ YOUR EXISTING ROUTES (Unchanged) */}
        <Route path="/admin/*" element={
          <RoleGuard role="admin" fallback={<Navigate to="/dashboard" />}>
            <AdminPanel />
          </RoleGuard>
        } />
        <Route path="/staff/*" element={
          <RoleGuard permission="manage_system" fallback={<Navigate to="/dashboard" />}>
            <StaffModule />
          </RoleGuard>
        } />

        {/* 🛡️ YOUR SECURITY FALLBACKS (Unchanged) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

// ─── 🚀 YOUR ROOT EXPORT (Unchanged) ────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <MainApp>
        <NavigationLogic />
      </MainApp>
    </BrowserRouter>
  );
}