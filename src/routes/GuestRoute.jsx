// src/routes/GuestRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, getDefaultRoute } from "./AuthContext"; // Import the helper

const GuestRoute = ({ children }) => {
  const { auth } = useAuth();

  if (auth.loading) {
    return <div>Loading...</div>; // Or a full-page spinner
  }

  if (auth.isAuthenticated) {
    // Use the helper to get the correct redirect path
    const defaultRoute = getDefaultRoute(auth.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default GuestRoute;