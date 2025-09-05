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
  }, []); // Empty array ensures this runs only once on mount

  // Logout function remains the same
  const logout = async () => {
    try {
      const csrfToken = getCookie("csrftoken");
      await fetch("/api/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, // 👈 3. Add the token to the header
        },
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clear auth state regardless of API call success
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
    default:
      return "/unauthorized";
  }
};

export const useAuth = () => useContext(AuthContext);