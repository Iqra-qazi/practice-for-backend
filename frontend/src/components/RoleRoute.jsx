import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomePath } from "../utils/roleRoutes.js";

export default function RoleRoute({ role, children }) {
  const { user } = useAuth();
  return user?.role === role
    ? children
    : <Navigate to={getRoleHomePath(user)} replace />;
}
