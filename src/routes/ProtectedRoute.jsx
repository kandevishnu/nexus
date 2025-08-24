import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();

  if (auth.loading) return <div>Loading...</div>;

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
