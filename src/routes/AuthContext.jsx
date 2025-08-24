import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    user: null,
    loading: true, 
  });

  useEffect(() => {
    fetch("http://172.16.200.235:8000/log/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.isAuthenticated) {
          setAuth({
            isAuthenticated: true,
            role: data.role,
            user: data.user || null,
            loading: false,
          });
        } else {
          setAuth({ isAuthenticated: false, role: null, user: null, loading: false });
        }
      })
      .catch(() => {
        setAuth({ isAuthenticated: false, role: null, user: null, loading: false });
      });
  }, []);

  const logout = async () => {
    await fetch("http://172.16.200.235:8000/auth/logout/", {
      method: "POST",
      credentials: "include",
    });
    setAuth({ isAuthenticated: false, role: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
