import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import UserDashboardPage from "./pages/UserDashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import { getRoleHomePath } from "./utils/roleRoutes.js";
import { useAuth } from "./context/AuthContext.jsx";

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getRoleHomePath(user)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboardPage /></RoleRoute>} />
          <Route path="/user" element={<RoleRoute role="user"><UserDashboardPage /></RoleRoute>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
