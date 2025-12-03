import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
    Menu, X, LogOut, Home as HomeIcon, User, CalendarCheck, 
    TrendingUp, Bell, ChevronRight, GraduationCap, BookOpen, AlertCircle 
} from "lucide-react";

// --- Real Project Imports ---
import { useAuth } from "../routes/AuthContext"; 
import Home from "./StudentDashboard/Home";
import Profile from "./StudentDashboard/Profile";
import Attendance from "./StudentDashboard/Attendance";
import Results from "./StudentDashboard/Results";

const StudentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const sidebarRef = useRef(null);
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    // Close sidebar on click outside
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

    // Logout Handlers
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const isActive = (path) => location.pathname.includes(path);

    // Navigation Item Component
    const NavItem = ({ to, icon: Icon, label, activeKey }) => {
        const active = isActive(activeKey);
        return (
            <Link
                to={to}
                className={`
                    group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ease-out font-medium text-sm
                    border border-transparent relative overflow-hidden
                    ${active 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                    }
                `}
            >
                <Icon size={20} className={`z-10 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-300"}`} />
                <span className="z-10">{label}</span>
                
                {active && <ChevronRight size={16} className="ml-auto text-indigo-200 opacity-75 z-10" />}
                
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            
            {/* --- LOGOUT MODAL --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Sign Out?</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Are you sure you want to end your session? You will need to login again to access your dashboard.
                            </p>
                        </div>
                        <div className="flex items-center border-t border-slate-100 bg-slate-50 px-6 py-4 gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-2.5 px-4 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MOBILE OVERLAY --- */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"></div>
            )}

            {/* --- SIDEBAR --- */}
            <div
                ref={sidebarRef}
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-out shadow-2xl border-r border-slate-800
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                    md:relative md:translate-x-0 md:z-auto flex flex-col
                `}
            >
                {/* Sidebar Header */}
                <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-800 bg-slate-900 shrink-0">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-wide text-white">NEXUS</h1>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Student Portal</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-2 mt-4 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Academic</p>
                    
                    <NavItem to="/student/home" icon={HomeIcon} label="Dashboard" activeKey="home" />
                    <NavItem to="/student/attendance" icon={CalendarCheck} label="Attendance" activeKey="attendance" />
                    <NavItem to="/student/results" icon={TrendingUp} label="Results & Grades" activeKey="results" />
                    
                    <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">Personal</p>
                    
                    <NavItem to="/student/profile" icon={User} label="My Profile" activeKey="profile" />
                </nav>

                {/* Sidebar Footer (Logout) */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                    <button
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group border border-transparent hover:border-red-900/30"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
                
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0 shadow-sm/50 backdrop-blur-xl bg-white/80">
                    
                    {/* Left: Mobile Toggle & Page Title */}
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={toggleSidebar}
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {isActive('home') && <><BookOpen size={20} className="text-indigo-600"/> Overview</>}
                                {isActive('profile') && <><User size={20} className="text-indigo-600"/> My Profile</>}
                                {isActive('attendance') && <><CalendarCheck size={20} className="text-indigo-600"/> Attendance Records</>}
                                {isActive('results') && <><TrendingUp size={20} className="text-indigo-600"/> Academic Results</>}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium hidden sm:block">RGUKT Ongole • Academic Year 2025-26</p>
                        </div>
                    </div>

                    {/* Right: Profile & Actions */}
                    <div className="flex items-center gap-6">
                        
                        {/* Notifications */}
                        <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-300 group">
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        {/* Profile Pill */}
                        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-700">Student</p>
                                <p className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">B.Tech</p>
                            </div>
                            <div className="h-10 w-10 bg-gradient-to-tr from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm ring-2 ring-transparent hover:ring-indigo-50 transition-all">
                                <User size={20} className="text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
                        <Routes>
                            <Route path="/" element={<Navigate to="home" replace />} />
                            <Route path="home" element={<Home />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="attendance" element={<Attendance />} />
                            <Route path="results" element={<Results />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;