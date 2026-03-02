import { Navigate } from "react-router-dom";
import { getToken, getRole } from "./api/client";
import type { UserRole } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === "client") {
      return <Navigate to="/portal" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
