import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        role: null,
        user: null,
        loading: true, 
    });

    // Helper to get the access token
    const getAccessToken = useCallback(() => localStorage.getItem('access'), []);
    const getRefreshToken = useCallback(() => localStorage.getItem('refresh'), []);
    
    // Function to refresh the Access Token using the Refresh Token
    const refreshAccessToken = async () => {
        const refresh = getRefreshToken();
        if (!refresh) return false;

        try {
            const res = await fetch("/api/token/refresh/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
            });

            if (!res.ok) throw new Error("Token refresh failed");
            
            const data = await res.json();
            
            // Store the new access token
            localStorage.setItem('access', data.access);
            return data.access;

        } catch (err) {
            console.error("Token refresh failed:", err);
            return false;
        }
    };


    const checkAuthStatus = async () => {
        // 1. Get the token from LocalStorage
        const access = getAccessToken();

        if (!access) {
            setAuth({ isAuthenticated: false, role: null, user: null, loading: false });
            return;
        }

        try {
            // 2. Decode the JWT Token manually to find the Role
            // (JWTs are just 3 parts separated by dots. The middle part is data.)
            const payload = JSON.parse(atob(access.split('.')[1]));
            
            // 3. Check if token is expired
            const currentTime = Date.now() / 1000;
            if (payload.exp < currentTime) {
                // Token expired - try to refresh or logout
                // For simplicity here, we logout. You can add refresh logic if you want.
                throw new Error("Token expired");
            }

            // 4. Get the role from the token payload
            // Your backend sends "role": "ADMIN", so we convert to lowercase
            const userRole = payload.role ? payload.role.toLowerCase() : null;

            // 5. Restore the Session
            setAuth({
                isAuthenticated: true,
                role: userRole,
                user: { username: payload.user_id }, // We restore ID from token
                loading: false, 
            });

        } catch (err) {
            console.error("Session restore failed:", err);
            // If token is garbage or expired, clear it
            localStorage.removeItem('access'); 
            localStorage.removeItem('refresh'); 
            setAuth({
                isAuthenticated: false,
                role: null,
                user: null,
                loading: false,
            });
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []); 

    const logout = () => {
        // Clear both tokens on logout
        localStorage.removeItem('access'); 
        localStorage.removeItem('refresh'); 
        
        setAuth({
            isAuthenticated: false,
            role: null,
            user: null,
            loading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout, getAccessToken, refreshAccessToken }}>
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