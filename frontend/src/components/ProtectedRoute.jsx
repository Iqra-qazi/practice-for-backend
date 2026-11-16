import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          Checking your session…
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
