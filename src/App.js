// App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainApp from "./MainApp";
import AdminPanel from "./components/AdminPanel";
import { useAuth, RBACLoginDemo, RoleGuard } from "./RBAC";

function NavigationLogic() {
  const { currentUser } = useAuth();

  // 1. Agar user login nahi hai -> Login Screen dikhao
  if (!currentUser) {
    return <div className="p-10 bg-slate-900 min-h-screen"><RBACLoginDemo /></div>;
  }

  // 2. Agar login hai -> Routes dikhao
  return (
    <Routes>
      {/* Sirf Admin ke liye */}
      <Route path="/admin/*" element={
        <RoleGuard role="admin" fallback={<Navigate to="/dashboard" />}>
          <AdminPanel />
        </RoleGuard>
      } />

      {/* Sab ke liye */}
      <Route path="/dashboard" element={<div className="text-white p-10">Welcome {currentUser.name}!</div>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp>
        <NavigationLogic />
      </MainApp>
    </BrowserRouter>
  );
}
