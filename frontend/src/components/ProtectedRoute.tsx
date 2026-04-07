import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/state/auth";

type ProtectedRouteProps = {
  role: "admin" | "donor";
  element: ReactElement;
};

const ProtectedRoute = ({ role, element }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin" && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (role === "donor" && !user.isDonor) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
