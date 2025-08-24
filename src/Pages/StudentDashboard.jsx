import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Home from "./StudentDashboard/Home";
import Profile from "./StudentDashboard/Profile";
import Attendance from "./StudentDashboard/Attendance";

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`fixed inset-y-0 left-0 transform bg-white shadow-lg w-64 p-5 transition-transform duration-300 z-50 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0`}
      >
        <h1 className="text-2xl font-bold text-indigo-600 mb-8">
          Student Panel
        </h1>
        
        <nav className="space-y-4">
          <Link
            to="/student/home"
            className="block p-2 rounded hover:bg-indigo-100"
          >
            Home
          </Link>
          <Link
            to="/student/profile"
            className="block p-2 rounded hover:bg-indigo-100"
          >
            Profile
          </Link>
          <Link
            to="/student/attendance"
            className="block p-2 rounded hover:bg-indigo-100"
          >
            Attendance
          </Link>
        </nav>
      </div>


      <div className="flex-1 flex flex-col">

        <header className="flex items-center justify-between bg-white shadow px-4 py-3">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-lg font-semibold">Student Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hi, Student</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<Attendance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
