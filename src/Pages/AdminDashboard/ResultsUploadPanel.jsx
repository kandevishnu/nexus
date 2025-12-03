import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, ChevronDown, ListChecks, FileUp, Loader2, 
    CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, ShieldAlert, UploadCloud, AlertTriangle 
} from 'lucide-react';
import { useAuth } from "../../routes/AuthContext";

// --- Constants ---
const allowedFileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];

const generateAcademicYears = () => {
    const years = [{ label: 'Select Academic Year', value: '' }];
    for (let p = 1; p <= 2; p++) {
        for (let s = 1; s <= 2; s++) years.push({ label: `PUC-${p} Semester ${s}`, value: `PUC${p}_S${s}` });
    }
    for (let e = 1; e <= 4; e++) {
        for (let s = 1; s <= 2; s++) years.push({ label: `E-${e} Semester ${s}`, value: `E${e}_S${s}` });
    }
    return years;
};

// --- Reusable Components ---

const StatusMessage = ({ status, message }) => {
    const config = {
        idle: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: null },
        loading: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: Loader2 },
        success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
        error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert },
        warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertTriangle },
    };

    const style = config[status] || config.idle;
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} shadow-sm`}
        >
            {Icon && <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${status === 'loading' ? 'animate-spin' : ''} ${style.text}`} />}
            <div className={`text-sm font-medium leading-relaxed ${style.text}`}>
                {message}
            </div>
        </motion.div>
    );
};

const UploadZone = ({ file, onFileSelected, disabled, title, subtitle }) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled && e.dataTransfer.files?.[0]) {
            onFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (!disabled && e.target.files?.[0]) {
            onFileSelected(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    group relative w-full h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out overflow-hidden
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                    ${isDragging 
                        ? 'border-teal-500 bg-teal-50/20 scale-[1.01] shadow-2xl shadow-teal-500/10' 
                        : file 
                            ? 'border-teal-400 bg-teal-50/10' 
                            : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/50'
                    }
                `}
            >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500" 
                    style={{ backgroundImage: 'radial-gradient(#0f766e 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileInput}
                    disabled={disabled}
                />
                
                <div className="relative z-10 text-center space-y-6 pointer-events-none p-6">
                    {/* Icon Container */}
                    <div className="relative">
                        <div className={`absolute inset-0 bg-teal-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full`}></div>
                        <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-500 transform group-hover:-translate-y-2 ${file ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-teal-500/40' : 'bg-white border border-slate-100 text-slate-400 group-hover:text-teal-600 group-hover:border-teal-200'}`}>
                            {file ? <FileSpreadsheet size={40} /> : <UploadCloud size={40} strokeWidth={1.5} />}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                            {file ? file.name : title || "Drop file to upload"}
                        </h3>
                        {!file && (
                            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                                {subtitle || "Drag & drop your Excel or CSV file here, or click to browse."}
                            </p>
                        )}
                    </div>

                    {file && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 shadow-sm"
                        >
                            <CheckCircle2 size={14} />
                            Ready for Validation
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Tab Components ---

const SubjectDetailsTab = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const { getAccessToken } = useAuth();

    const validateAndSetFile = (selectedFile) => {
        if (!allowedFileTypes.includes(selectedFile.type)) {
            setStatus('error');
            setMessage("Invalid file format. Please upload Excel (.xlsx) or CSV.");
            return;
        }
        setStatus('idle');
        setMessage("");
        setFile(selectedFile);
    };

    const handleUpload = async () => {
        const token = getAccessToken();
        if (!token) {
            setStatus('error');
            setMessage("Session expired. Login required.");
            return;
        }

        setStatus('loading');
        setMessage("Mapping subject codes and updating database...");

        try {
            const formData = new FormData();
            formData.append("excel_file", file);

            const response = await fetch("/api/results/subjectInfo/", {
                method: "POST",
                body: formData,
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            setStatus('success');
            setMessage(`Database updated successfully with ${file.name}`);
            setFile(null);
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left Info Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center mb-4">
                        <ListChecks size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Subject Database</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        Upload the master list of subjects. This file must contain:
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />SUBJECT CODE</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />NAME</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />CREDITS</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />YEAR (EX: E3S1)</li>
                    </ul>
                </div>
            </div>

            {/* Right Upload Panel */}
            <div className="lg:col-span-2 space-y-6">
                <UploadZone 
                    file={file} 
                    onFileSelected={validateAndSetFile} 
                    status={status} 
                    disabled={status === 'loading'} 
                    title="Upload Subject Master List"
                />

                <AnimatePresence mode="wait">
                    {message && <StatusMessage key={status} status={status} message={message} />}
                </AnimatePresence>

                <div className="flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || status === 'loading'}
                        className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] hover:-translate-y-0.5"
                    >
                        {status === 'loading' ? <Loader2 className="animate-spin" /> : <ListChecks />}
                        {status === 'loading' ? 'Processing...' : 'Update Database'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResultsEntryTab = () => {
    const years = generateAcademicYears();
    const [academicYear, setAcademicYear] = useState(years[0].value);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const { getAccessToken } = useAuth();

    // --- Validation Logic ---
    const validateAndSetFile = (selectedFile) => {
        // 1. Check File Type only
        if (!allowedFileTypes.includes(selectedFile.type)) {
            setStatus('error');
            setMessage("Invalid file format. Please upload Excel (.xlsx) or CSV.");
            return;
        }

        // Allow selection even if year is not picked yet
        setStatus('idle');
        setMessage("");
        setFile(selectedFile);
    };

    const handlePublish = async () => {
        // 1. Validation: Year Selected?
        if (!academicYear) {
            setStatus('warning');
            setMessage("Please select the Academic Year above before publishing.");
            return;
        }
        
        // 2. Validation: Filename Matching (Strict Check on Publish)
        if (file) {
            const fileName = file.name.toUpperCase();
            const [yearPart, semPart] = academicYear.toUpperCase().split('_'); 
            const semVariant = semPart ? semPart.replace('S', 'SEM') : '';

            const hasYear = fileName.includes(yearPart);
            const hasSem = fileName.includes(semPart) || fileName.includes(semVariant);

            if (!hasYear || !hasSem) {
                setStatus('error');
                setMessage(
                    `Filename Mismatch: The file "${file.name}" does not match "${academicYear.replace('_', ' ')}". \n` +
                    `Please ensure the filename contains both "${yearPart}" and "${semPart}".`
                );
                return;
            }
        }

        const token = getAccessToken();
        if (!token) {
            setStatus('error');
            setMessage("Authentication failed. Please refresh.");
            return;
        }

        setStatus('loading');
        setMessage("Parsing spreadsheet and calculating grades...");

        try {
            const formData = new FormData();
            formData.append("excel_file", file);
            formData.append("year_sem", academicYear);

            const response = await fetch("/api/results/result/", {
                method: "POST",
                body: formData,
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to process results.");
            }

            setStatus('success');
            setMessage(`Results for ${academicYear.replace('_', ' ')} published successfully!`);
            setFile(null);
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left Controls */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Result Entry</h3>
                    <p className="text-slate-500 text-sm mt-2 mb-6">
                        Select the academic term and upload the student grades spreadsheet. This file must contain:
                    </p>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Academic Year</label>
                        <div className="relative group">
                            <select
                                value={academicYear}
                                onChange={(e) => {
                                    setAcademicYear(e.target.value);
                                    if (status === 'warning') setStatus('idle'); // Clear warning if they select year
                                    if (status !== 'loading') setMessage('');
                                }}
                                className="w-full appearance-none bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold py-3.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all cursor-pointer hover:border-teal-300"
                            >
                                {years.map(year => (
                                    <option key={year.value} value={year.value} disabled={!year.value}>
                                        {year.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-teal-600 transition-colors" size={20} />
                        </div>
                    </div>
                </div>
                
            </div>

            {/* Right Upload Panel */}
            <div className="lg:col-span-2 space-y-6">
                <UploadZone 
                    file={file} 
                    onFileSelected={validateAndSetFile} 
                    status={status} 
                    disabled={status === 'loading'} 
                    title="Upload Result Sheet"
                    subtitle="Ensure file includes Student IDs, Subject Codes, and Marks."
                />

                <AnimatePresence mode="wait">
                    {message && <StatusMessage key={status} status={status} message={message} />}
                </AnimatePresence>

                <div className="flex justify-end">
                    <button
                        onClick={handlePublish}
                        disabled={!file || status === 'loading'}
                        className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] hover:-translate-y-0.5"
                    >
                        {status === 'loading' ? <Loader2 className="animate-spin" /> : <TrendingUp />}
                        {status === 'loading' ? 'Publishing...' : 'Publish Results'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---

const ResultsUploadPanel = () => {
    const [activeTab, setActiveTab] = useState('SubjectDetails');

    return (
        <div className="w-full h-full p-6 lg:p-10 animate-in fade-in duration-500">
            {/* Navigation Tabs (Full Width Pill Style) */}
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex w-full mb-8">
                <button
                    onClick={() => setActiveTab('SubjectDetails')}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300
                    ${activeTab === 'SubjectDetails' 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 transform scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                    <ListChecks size={18} strokeWidth={2.5} />
                    Subject Database
                </button>
                <button
                    onClick={() => setActiveTab('ResultsEntry')}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300
                    ${activeTab === 'ResultsEntry' 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 transform scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                >
                    <TrendingUp size={18} strokeWidth={2.5} />
                    Result Entry
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'SubjectDetails' ? <SubjectDetailsTab /> : <ResultsEntryTab />}
            </div>
        </div>
    );
};

export default ResultsUploadPanel;