// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./routes/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./Pages/Login";
import StudentDashboard from "./Pages/StudentDashboard";
import FacultyDashboard from "./Pages/FacultyDashboard";
import HodDashboard from "./Pages/HodDashboard";
import DeanDashboard from "./Pages/DeanDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import Unauthorized from "./Pages/Unauthorized";
import Code from "./Code";
import Home from "./Pages/Home";
import GuestRoute from "./routes/GuestRoute";
import ForgotPasswordVerification from "./Pages/ForgotPasswordVerification";
import ResetPassword from "./Pages/ResetPassword";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          {/* <Route path="/home" element={<Home />} /> */}

          <Route
            path="/forgot-password"
            element={<ForgotPasswordVerification />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hod/*"
            element={
              <ProtectedRoute allowedRoles={["hod"]}>
                <HodDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dean/*"
            element={
              <ProtectedRoute allowedRoles={["dean"]}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/code" element={<Code />} />

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
