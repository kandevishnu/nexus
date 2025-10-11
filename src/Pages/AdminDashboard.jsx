// src/pages/AdminDashboard.jsx (Updated)

import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Users, Settings, BarChart2, FileText } from "lucide-react";
import { useAuth } from "../routes/AuthContext";
import { getCookie } from '.././utils';

// Placeholder pages for Admin
const AdminHome = () => <div>Admin Home Page</div>;
const Reports = () => <div>Analytics & Reports</div>;
import UploadFile from './AdminDashboard/UploadFile'; // Updated import

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();
    const { logout } = useAuth();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };

        if (sidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarOpen]);

    const isActive = (path) => location.pathname.includes(path);
    const csrfToken = getCookie('csrftoken');
    console.log(csrfToken)

    return (
        <div className="flex h-screen bg-gray-50">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"></div>
            )}

            <div
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 transform bg-white shadow-lg w-64 p-5 transition-transform duration-300 z-50 
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                md:relative md:translate-x-0 md:z-auto`}
            >
                <h1 className="text-2xl font-bold text-indigo-600 mb-8">Admin Panel</h1>

                <nav className="space-y-4">
                    <Link
                        to="/admin/home"
                        className={`flex items-center gap-2 p-2 rounded transition ${
                            isActive("home") ? "bg-indigo-100 font-semibold text-indigo-600" : "hover:bg-indigo-100"
                        }`}
                    >
                        <BarChart2 size={18} />
                        Home
                    </Link>
                    <Link
                        to="/admin/upload-users"
                        className={`flex items-center gap-2 p-2 rounded transition ${
                            isActive("upload-users") ? "bg-indigo-100 font-semibold text-indigo-600" : "hover:bg-indigo-100"
                        }`}
                    >
                        <FileText size={18} />
                        Upload Users
                    </Link>
                    <Link
                        to="/admin/reports"
                        className={`flex items-center gap-2 p-2 rounded transition ${
                            isActive("reports") ? "bg-indigo-100 font-semibold text-indigo-600" : "hover:bg-indigo-100"
                        }`}
                    >
                        <Settings size={18} />
                        Reports
                    </Link>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-red-100 text-red-600 mt-6"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between bg-white shadow px-4 py-3 relative z-50">
                    <button
                        className="md:hidden p-2 rounded hover:bg-gray-200"
                        onClick={toggleSidebar}
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <h2 className="text-lg font-semibold">
                        NEXUS | RGUKT-ONGOLE
                    </h2>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Hi, Admin</span>
                        <img
                            src="https://i.pravatar.cc/40?u=admin"
                            alt="profile"
                            className="w-10 h-10 rounded-full"
                        />
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Navigate to="home" replace />} />
                        <Route path="home" element={<AdminHome />} />
                        <Route path="upload-users" element={<UploadFile />} />
                        <Route path="reports" element={<Reports />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;