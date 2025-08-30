import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./routes/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./Pages/Login";
import StudentDashboard from "./Pages/StudentDashboard";
import FacultyDashboard from "./Pages/FacultyDashboard";
import HodDashboard from "./Pages/HodDashboard";
import DeanDashboard from "./Pages/DeanDashboard";
import Unauthorized from "./Pages/Unauthorized";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/student/*"
            element={
              // <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              // </ProtectedRoute>
            }
          />

          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hod"
            element={
              <ProtectedRoute allowedRoles={["hod"]}>
                <HodDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dean"
            element={
              <ProtectedRoute allowedRoles={["dean"]}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
