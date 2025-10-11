// src/routes/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { getCookie } from "../utils"; // Assuming this works correctly

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    user: null,
    loading: true, // Start in a loading state
  });

  // This useEffect now runs once on app load/refresh to verify the session
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Always check the session with the backend.
        // The browser will automatically send the session cookie.
        const res = await fetch("/api/log/", {
          credentials: "include",
        });

        // If the server returns a 401/403 or other error, it will throw here
        if (!res.ok) {
            throw new Error("Session check failed");
        }
        
        const data = await res.json();

        if (data?.is_authenticated) {
          // If authenticated, set all the relevant details
          setAuth({
            isAuthenticated: true,
            role: data.role ? data.role.toLowerCase() : null,
            user: data.user ?? null,
            loading: false, // Finished loading
          });
        } else {
          // If not authenticated, set the state explicitly
          setAuth({
            isAuthenticated: false,
            role: null,
            user: null,
            loading: false, // Finished loading
          });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // On any error (network, server error), assume user is not logged in
        setAuth({
          isAuthenticated: false,
          role: null,
          user: null,
          loading: false, // Finished loading
        });
      }
    };

    checkAuthStatus();
  }, []); 

  const logout = async () => {
  const csrfToken = getCookie("csrftoken");
  try {
    await fetch("/api/logout/", {
      method: "POST", // Changed to POST method
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // Use X-CSRFToken header for POST requests
      },
    });
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    setAuth({
      isAuthenticated: false,
      role: null,
      user: null,
      loading: false,
    });
  }
};

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {/* Don't render children until the initial auth check is complete */}
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

// These helpers can remain the same
export const getDefaultRoute = (role) => {
  switch (role?.toLowerCase()) {
    case "student":
      return "/student";
    case "faculty":
      return "/faculty";
    case "hod":
      return "/hod";
    case "dean":
      return "/dean";
    case "admin":
      return "/admin";
    default:
      return "/unauthorized";
  }
};

export const useAuth = () => useContext(AuthContext);