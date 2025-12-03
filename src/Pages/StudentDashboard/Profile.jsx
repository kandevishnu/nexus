import React, { useMemo, useState, useEffect } from "react";
import { 
    User, Mail, Phone, MapPin, Calendar, 
    Droplet, Home, Hash, BookOpen, Layers, 
    ShieldCheck, Award, GraduationCap, Briefcase, ChevronRight 
} from "lucide-react";

// --- Real Project Imports ---
import defaultProfilePic from "../../assets/defaultProfilePic.png"; 
import { useAuth } from "../../routes/AuthContext"; 

const Profile = () => {
    const { getAccessToken } = useAuth(); 
    
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI State for Mobile Tabs
    const [activeTab, setActiveTab] = useState("personal");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = getAccessToken(); 

            if (!token) {
                setLoading(false);
                return; 
            }

            try {
                const res = await fetch("/api/student/profile/", {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (res.status === 401 || res.status === 403) {
                    throw new Error("Session expired. Please log in again.");
                }
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch profile.`);
                }
                
                const data = await res.json();
                setStudent(data);
                console.log("Fetched student profile:", data);

            } catch (err) {
                console.error("Profile fetch error:", err);
                setError(err.message);
                setStudent(null); 
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [getAccessToken]); 

    const data = student || {};

    const initialPhoto = useMemo(
        () => (data.photo && String(data.photo).trim()) || defaultProfilePic,
        [data.photo]
    );
    const [imgSrc, setImgSrc] = useState(initialPhoto);

    useEffect(() => {
        if(data.photo) setImgSrc(data.photo);
    }, [data.photo]);

    // --- Loading State ---
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Loading Profile...</p>
            </div>
        );
    }
    
    // --- Error State ---
    if (error || !student) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Profile Unavailable</h3>
                <p className="text-slate-500 max-w-md text-center">{error || "Connection error. Please try again."}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    Retry
                </button>
            </div>
        );
    }

    // --- Render Logic ---
    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                
                {/* =======================
                    LEFT COLUMN (Identity)
                   ======================= */}
                <div className="lg:w-1/3 flex-shrink-0">
                    {/* Desktop: Sticky Card | Mobile: Static Header */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden lg:sticky lg:top-24 transition-all">
                        
                        {/* Artwork Header */}
                        <div className="h-28 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        <div className="px-6 pb-6 -mt-14 flex flex-col items-center text-center relative z-10">
                            {/* Photo */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-500"></div>
                                <img
                                    src={imgSrc}
                                    alt="Profile"
                                    onError={() => setImgSrc(defaultProfilePic)}
                                    className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-full object-cover border-[4px] border-white shadow-md bg-white"
                                />
                                <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" title="Active Student"></div>
                            </div>

                            <h1 className="mt-4 text-2xl font-bold text-slate-800 tracking-tight">
                                {data.name}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 mb-4">{data.idNo}</p>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100 shadow-sm">
                                    {data.branch || "ENG"}
                                </span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200">
                                    Batch {data.batch}
                                </span>
                            </div>

                            {/* Quick Stats (Hidden on small mobile to save space, visible on large) */}
                            <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-slate-100">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section</span>
                                    <span className="block text-sm font-bold text-slate-700">{data.section || "-"}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hostel</span>
                                    <span className="block text-sm font-bold text-slate-700">{data.hostelName || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =======================
                    RIGHT COLUMN (Details)
                   ======================= */}
                <div className="lg:w-2/3 flex flex-col gap-6">
                    
                    {/* --- MOBILE TABS (Visible only on Mobile) --- */}
                    <div className="flex lg:hidden p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm no-scrollbar">
                        <MobileTab 
                            active={activeTab === 'personal'} 
                            onClick={() => setActiveTab('personal')} 
                            icon={User} 
                            label="Personal" 
                        />
                        <MobileTab 
                            active={activeTab === 'academic'} 
                            onClick={() => setActiveTab('academic')} 
                            icon={BookOpen} 
                            label="Academic" 
                        />
                        <MobileTab 
                            active={activeTab === 'contact'} 
                            onClick={() => setActiveTab('contact')} 
                            icon={Home} 
                            label="Contact" 
                        />
                    </div>

                    {/* --- SECTIONS (Conditionally rendered on Mobile, Stacked on Desktop) --- */}
                    
                    {/* 1. Personal Information */}
                    <div className={`${activeTab === 'personal' ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden`}>
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                                <User size={18} />
                            </div>
                            <h2 className="font-bold text-slate-800">Personal Information</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Full Name" value={data.name} />
                            <InfoField label="Date of Birth" value={data.dob} icon={Calendar} />
                            <InfoField label="Gender" value={data.gender} />
                            <InfoField label="Blood Group" value={data.bloodGroup} icon={Droplet} />
                            <InfoField label="Father's Name" value={data.fatherName} />
                            <InfoField label="Mother's Name" value={data.motherName} />
                        </div>
                    </div>

                    {/* 2. Academic Information */}
                    <div className={`${activeTab === 'academic' ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden`}>
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                                <BookOpen size={18} />
                            </div>
                            <h2 className="font-bold text-slate-800">Academic Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Roll Number" value={data.rollNo} icon={Hash} />
                            <InfoField label="Hall Ticket" value={data.hallTicketNo} icon={Award} />
                            <InfoField label="Branch" value={data.branch} icon={Layers} />
                            <InfoField label="Current Batch" value={data.batch} icon={Calendar} />
                        </div>
                    </div>

                    {/* 3. Contact & Residence */}
                    <div className={`${activeTab === 'contact' ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden`}>
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                                <Home size={18} />
                            </div>
                            <h2 className="font-bold text-slate-800">Contact & Residence</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField 
                                label="Student Email" 
                                value={data.gmail} 
                                icon={Mail} 
                                isLink={true} 
                                linkType="mailto"
                            />
                            <InfoField 
                                label="Student Mobile" 
                                value={data.studentMobile} 
                                icon={Phone}
                                isLink={true}
                                linkType="tel"
                            />
                            <InfoField 
                                label="Parent Mobile" 
                                value={data.parentMobile} 
                                icon={Phone}
                                isLink={true}
                                linkType="tel"
                            />
                            <InfoField label="Hostel Block" value={data.hostelName} icon={Briefcase} />
                            <InfoField label="Room Number" value={data.roomNo} icon={Hash} />
                            
                            <div className="md:col-span-2 pt-4 border-t border-slate-50 mt-2">
                                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="mt-0.5 text-slate-400">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Permanent Address</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {data.address || "Address not updated"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

const MobileTab = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick}
        className={`
            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
            ${active 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                : 'text-slate-500 hover:bg-slate-50'
            }
        `}
    >
        <Icon size={16} />
        {label}
    </button>
);

const InfoField = ({ label, value, icon: Icon, isLink, linkType }) => (
    <div className="group">
        <div className="flex items-center gap-2 mb-1.5">
            {Icon && <Icon size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
        <div className="pl-6">
            {isLink && value ? (
                <a 
                    href={`${linkType}:${value}`} 
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline truncate block"
                >
                    {value}
                </a>
            ) : (
                <p className="text-sm font-semibold text-slate-700 break-words leading-snug">
                    {value || "—"}
                </p>
            )}
        </div>
    </div>
);

export default Profile;