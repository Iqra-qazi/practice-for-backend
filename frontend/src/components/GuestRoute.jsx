import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomePath } from "../utils/roleRoutes.js";

export default function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-400">Loading…</div>;
  }
  return user ? <Navigate to={getRoleHomePath(user)} replace /> : <Outlet />;
}
