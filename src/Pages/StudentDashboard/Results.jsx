import React, { useState, useMemo, useRef } from 'react';
import { 
    TrendingUp, Search, Printer, ChevronDown, Loader2, 
    AlertTriangle, Award, Calendar, BookOpen, Layers, CheckCircle2, XOctagon, FileSearch 
} from 'lucide-react';
import { useAuth } from "../../routes/AuthContext"; 

// --- Constants & Config ---
const GRADE_POINTS = { 'EX': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'R': 0 };
const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const generateAcademicYears = () => {
    const years = [{ label: 'Select Semester', value: '' }];
    for (let p = 1; p <= 2; p++) {
        for (let s = 1; s <= 2; s++) years.push({ label: `PUC-${p} Semester ${s}`, value: `PUC${p}_S${s}` });
    }
    for (let e = 1; e <= 4; e++) {
        for (let s = 1; s <= 2; s++) years.push({ label: `E-${e} Semester ${s}`, value: `E${e}_S${s}` });
    }
    return years;
};

// --- Helpers ---

const formatSessionDate = (key) => {
    if (!key) return "Unknown Session";
    const keyStr = String(key);
    if (keyStr.length < 3) return keyStr; 

    const yearPart = keyStr.slice(-2);
    const monthPart = keyStr.slice(0, -2);
    const monthName = MONTH_NAMES[parseInt(monthPart)] || "Exam";
    return `${monthName} 20${yearPart}`;
};

const calculateEffectiveStats = (resultsData) => {
    if (!resultsData) return { sgpa: 'N/A', totalCredits: 0, failedCount: 0 };

    const allAttempts = Object.values(resultsData).flat();
    const bestSubjects = {};

    allAttempts.forEach(sub => {
        const name = sub.subject;
        const grade = sub.grade?.toUpperCase() || 'F';
        const gp = GRADE_POINTS[grade] || 0;
        
        // Store the attempt with the highest Grade Point
        if (!bestSubjects[name] || gp > bestSubjects[name].gp) {
            bestSubjects[name] = { 
                credits: parseFloat(sub.credits) || 0, // FIX: Use parseFloat for decimal credits (e.g. 1.5)
                gp: gp,
                grade: grade 
            };
        }
    });

    let totalPoints = 0;
    let totalCredits = 0;
    let failedCount = 0;

    Object.values(bestSubjects).forEach(sub => {
        if (sub.credits > 0) {
            totalCredits += sub.credits;
            totalPoints += (sub.credits * sub.gp);
            
            // Count as failed if GP is 0 (F or R)
            if (sub.gp === 0) failedCount++;
        }
    });

    if (totalCredits === 0) return { sgpa: '0.00', totalCredits: 0, failedCount: 0 };

    const sgpa = (totalPoints / totalCredits).toFixed(2);
    return { sgpa, totalCredits, failedCount };
};

// --- Main Component ---

const Results = () => {
    const years = useMemo(() => generateAcademicYears(), []);
    const { getAccessToken } = useAuth(); 
    
    const [selectedYear, setSelectedYear] = useState(years[0].value); 
    const [resultsData, setResultsData] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false);
    const printRef = useRef();

    const stats = useMemo(() => calculateEffectiveStats(resultsData), [resultsData]);

    // Memoize sorted session keys to determine Regular vs Remedial
    const sortedSessions = useMemo(() => {
        if (!resultsData) return [];
        // Sort keys (e.g., "125" vs "225") to ensure chronological order
        return Object.keys(resultsData).sort((a, b) => parseInt(a) - parseInt(b));
    }, [resultsData]);

    const fetchResults = async () => {
        if (!selectedYear) return;

        const token = getAccessToken();
        if (!token) {
            setError("Session expired. Please login again.");
            return;
        }

        setLoading(true);
        setError(null);
        setNoData(false);
        setResultsData(null);
        
        try {
            const response = await fetch(`/api/student/get-results/?year_sem=${selectedYear}`, {
                method: "GET",
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                },
            });

            const jsonResponse = await response.json();

            if (response.status === 401) throw new Error("Session expired. Please log in.");
            if (!response.ok) {
                throw new Error(jsonResponse.detail || jsonResponse.error || "Failed to fetch results.");
            }

            if (jsonResponse.data && Object.keys(jsonResponse.data).length > 0) {
                setResultsData(jsonResponse.data);
            } else {
                setNoData(true);
            }
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };
    
    const handlePrint = () => window.print();

    const selectedYearLabel = years.find(y => y.value === selectedYear)?.label || selectedYear;

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans min-h-screen">
            
            {/* --- PRINT STYLES --- */}
            <style>
                {`
                    @media print {
                        @page { margin: 10mm; size: A4; }
                        html, body, #root, main {
                            height: auto !important;
                            overflow: visible !important;
                            position: static !important;
                        }
                        body * { visibility: hidden; }
                        #printable-content, #printable-content * { 
                            visibility: visible; 
                        }
                        #printable-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            background: white;
                            color: black;
                        }
                        table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        th, td { border: 1px solid #ddd !important; padding: 8px !important; color: black !important; font-size: 10pt !important; }
                        .no-print { display: none !important; }
                    }
                `}
            </style>

            {/* =======================
                NON-PRINTABLE HEADER
               ======================= */}
            <div className="print:hidden">
                
                {/* Filter Bar */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 mb-8">
                    
                    <div className="mb-4 flex items-center gap-2 text-slate-800">
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <FileSearch size={20} />
                        </div>
                        <h2 className="text-lg font-bold">Select Year and Semester</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:w-80 group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Layers size={18} />
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setError(null);
                                    setNoData(false);
                                    setResultsData(null);
                                }}
                                className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-3.5 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all cursor-pointer hover:border-indigo-300 shadow-sm"
                            >
                                {years.map(year => (
                                    <option key={year.value} value={year.value} disabled={!year.value}>
                                        {year.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" size={18} />
                        </div>

                        <button
                            onClick={fetchResults}
                            disabled={!selectedYear || loading}
                            className="w-full md:w-auto flex items-center justify-center gap-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            {loading ? 'Retrieving...' : 'View Results'}
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-4 animate-in fade-in duration-200">
                        <div className="p-2 bg-white rounded-full shadow-sm text-red-500 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-800 text-sm">System Error</h4>
                            <p className="text-sm text-red-600 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* No Data State */}
                {noData && !loading && (
                    <div className="mb-8 p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <BookOpen className="text-slate-300" size={32} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-700">No Records Found</h4>
                        <p className="text-slate-500 max-w-md mt-1">
                            We couldn't find any published results for <span className="font-bold text-slate-900">{selectedYearLabel}</span>. They may not be released yet.
                        </p>
                    </div>
                )}
            </div>

            {/* =======================
                PRINTABLE CONTENT
               ======================= */}
            <div id="printable-content">
                
                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-6 pt-4">
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black text-slate-900 uppercase tracking-wider mb-2">RGUKT ONGOLE</div>
                        <div className="text-sm font-semibold text-slate-600 uppercase tracking-widest mb-4">Rajiv Gandhi University of Knowledge Technologies</div>
                        
                        <div className="px-6 py-2 border border-slate-900 rounded-full inline-block">
                            <h2 className="text-xl font-bold text-slate-900 uppercase">Provisional Grade Report</h2>
                        </div>
                        
                        <p className="text-slate-500 mt-4 font-medium">
                            Academic Session: <span className="text-slate-900 font-bold">{selectedYearLabel}</span>
                        </p>
                    </div>
                </div>

                {/* Results */}
                {resultsData && (
                    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500 print:space-y-8">
                        
                        {/* Cumulative Scorecard */}
                        <div className="relative overflow-hidden rounded-xl p-4 md:p-8 text-white shadow-2xl print:hidden">
                            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-0"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                                
                                {/* Desktop Text */}
                                <div className="hidden md:block w-full md:w-auto">
                                    <p className="text-indigo-200 font-bold tracking-widest text-xs uppercase mb-1 opacity-80">Cumulative Summary</p>
                                    <h2 className="text-3xl font-bold text-white">{selectedYearLabel}</h2>
                                    <p className="text-slate-300 text-sm mt-1 max-w-md">
                                        Consolidated performance report including all attempts.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="w-full md:w-auto flex justify-around md:justify-start items-center gap-4 md:gap-8 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider mb-0.5">SGPA</p>
                                        <p className={`text-2xl md:text-4xl font-black ${stats.failedCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {stats.sgpa}
                                        </p>
                                    </div>
                                    
                                    <div className="h-8 w-px bg-white/10"></div>
                                    
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider mb-0.5">Credits</p>
                                        <p className="text-xl md:text-2xl font-bold text-white">{stats.totalCredits}</p>
                                    </div>

                                    {stats.failedCount > 0 && (
                                        <>
                                            <div className="h-8 w-px bg-white/10"></div>
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] text-red-300 uppercase font-bold tracking-wider mb-0.5">Backlogs</p>
                                                <p className="text-xl md:text-2xl font-bold text-red-400">{stats.failedCount}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- SESSION TABLES LOOP --- */}
                        {sortedSessions.map((sessionKey, index) => {
                            const subjects = resultsData[sessionKey];
                            const isFirstAttempt = index === 0; // Logic: First key is Regular, others Remedial
                            const examTypeLabel = isFirstAttempt ? "Regular Examination" : "Remedial Examination";

                            return (
                                <div key={sessionKey} className="break-inside-avoid print:mb-8">
                                    
                                    {/* Session Header */}
                                    <div className="flex items-center gap-3 mb-4 pl-1">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg print:hidden">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="w-full flex justify-between items-end border-b border-slate-200 pb-2 print:border-slate-800">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                                                    {formatSessionDate(sessionKey)}
                                                </h3>
                                                {/* Dynamic Regular/Remedial Label */}
                                                <p className="text-xs text-slate-500 font-medium print:text-slate-600">
                                                    {examTypeLabel}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Table */}
                                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm print:border-2 print:border-slate-800 print:shadow-none print:rounded-none">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 print:bg-slate-100 print:text-black print:border-slate-800">
                                                    <tr>
                                                        <th className="px-4 py-3 min-w-[140px] md:w-1/3">Subject Name</th>
                                                        <th className="px-2 py-3 text-center">Credits</th>
                                                        <th className="px-2 py-3 text-center">Mid 1</th>
                                                        <th className="px-2 py-3 text-center">Mid 2</th>
                                                        <th className="px-2 py-3 text-center">Mid 3</th>
                                                        <th className="px-2 py-3 text-center">Best 2</th>
                                                        <th className="px-4 py-3 text-center">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                                                    {subjects.map((row, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors print:hover:bg-transparent">
                                                            <td className="px-4 py-3 font-semibold text-slate-900 print:text-black">
                                                                {row.subject}
                                                            </td>
                                                            <td className="px-2 py-3 text-center text-slate-600 font-medium print:text-black">
                                                                {parseFloat(row.credits)} {/* Ensure float display */}
                                                            </td>
                                                            <td className="px-2 py-3 text-center text-slate-500 text-xs print:text-black">{row.mid1 ?? '-'}</td>
                                                            <td className="px-2 py-3 text-center text-slate-500 text-xs print:text-black">{row.mid2 ?? '-'}</td>
                                                            <td className="px-2 py-3 text-center text-slate-500 text-xs print:text-black">{row.mid3 ?? '-'}</td>
                                                            <td className="px-2 py-3 text-center font-bold text-slate-700 print:text-black">
                                                                {row.bo2 ?? '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-xs font-bold border print:border-black print:bg-transparent print:text-black ${
                                                                    row.grade === 'F' || row.grade === 'R'
                                                                        ? 'bg-red-50 border-red-200 text-red-700' 
                                                                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                                }`}>
                                                                    {row.grade}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Print Footer */}
                        <div className="hidden print:flex justify-between mt-12 pt-8 border-t-2 border-slate-800 text-xs font-bold text-slate-900">
                            <div>Date Generated: {new Date().toLocaleDateString()}</div>
                            <div>Controller of Examinations</div>
                        </div>

                        {/* Floating Print Button (Web Only) */}
                        <div className="fixed bottom-8 right-8 print:hidden z-50">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold rounded-full shadow-2xl hover:bg-indigo-600 hover:scale-105 transition-all"
                            >
                                <Printer size={20} />
                                <span className="hidden md:inline">Print Results</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;