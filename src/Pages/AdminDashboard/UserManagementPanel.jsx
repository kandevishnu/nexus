import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileUp, CheckCircle2, Loader2, XCircle, Users, 
    BookOpen, Clock, AlertCircle, FileSpreadsheet, UploadCloud, Save, Database 
} from "lucide-react";
import { useAuth } from "../../routes/AuthContext";
import UserPreviewTable from "./UserPreviewTable"; 

// --- Constants ---
const allowedFileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];

const BATCH_SIZE = 10; // Process 10 records per request for real-time updates

// --- Helper Functions ---
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds === Infinity) return "Calculating...";
    if (seconds < 1) return "Almost done...";
    if (seconds < 60) return `${Math.ceil(seconds)}s remaining`;
    const m = Math.floor(seconds / 60);
    const s = Math.ceil(seconds % 60);
    return `${m}m ${s}s remaining`;
};

const formatDuration = (seconds) => {
    const totalSeconds = Math.ceil(Number(seconds));
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
};

// --- Reusable UI Components ---

const SuccessModal = ({ stats, onClose }) => {
    if (!stats) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
                <div className="p-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6 shadow-sm">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Complete!</h3>
                    <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                        The <strong>{stats.type}</strong> database has been successfully updated.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                                <Database size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Records</span>
                            </div>
                            <p className="text-2xl font-black text-slate-800">{stats.count}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                                <Clock size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Time Taken</span>
                            </div>
                            {/* UPDATED: Uses minutes + seconds format */}
                            <p className="text-2xl font-black text-slate-800">{formatDuration(stats.time)}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-lg shadow-slate-900/20"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const StatusMessage = ({ status, message, progress }) => {
    const config = {
        idle: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: null },
        loading: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: Loader2 },
        success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
        error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    };

    const style = config[status] || config.idle;
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`w-full overflow-hidden`}
        >
            <div className={`flex flex-col gap-3 p-4 rounded-xl border ${style.bg} ${style.border} shadow-sm mb-4`}>
                <div className="flex items-start gap-3">
                    {Icon && <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${status === 'loading' ? 'animate-spin' : ''} ${style.text}`} />}
                    <div className="flex-1">
                        <p className={`text-sm font-semibold ${style.text}`}>{message}</p>
                    </div>
                </div>
                
                {/* Progress Bar for Loading State */}
                {status === 'loading' && progress !== undefined && (
                    <div className="w-full bg-teal-200/50 rounded-full h-1.5 mt-1 overflow-hidden">
                        <motion.div 
                            className="bg-teal-600 h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const UploadZone = ({ file, onFileSelected, disabled, userType }) => {
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
                    group relative w-full h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out overflow-hidden
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200' : ''}
                    ${isDragging 
                        ? 'border-teal-500 bg-teal-50/20 scale-[1.01] shadow-2xl shadow-teal-500/10' 
                        : file 
                            ? 'border-teal-400 bg-teal-50/10' 
                            : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/50'
                    }
                `}
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
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
                
                <div className="relative z-10 text-center space-y-5 pointer-events-none p-6">
                    <div className="relative">
                        <div className={`absolute inset-0 bg-teal-400 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full`}></div>
                        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 transform group-hover:-translate-y-2 ${file ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-teal-500/40' : 'bg-white border border-slate-100 text-slate-400 group-hover:text-teal-600 group-hover:border-teal-200'}`}>
                            {file ? <FileSpreadsheet size={32} /> : <UploadCloud size={32} strokeWidth={1.5} />}
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                            {file ? file.name : `Upload ${userType} Data`}
                        </h3>
                        {!file && (
                            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                                Drag & drop Excel/CSV file or click to browse
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
                            Ready to Process
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Logic Component ---

const FileUploadTab = ({ userType, apiUrl, saveUrl, currentTab, setActiveTab }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle"); 
    const [message, setMessage] = useState("");
    const [previewData, setPreviewData] = useState(null);
    const [progress, setProgress] = useState(0);
    const [successStats, setSuccessStats] = useState(null);
    
    const { getAccessToken } = useAuth();

    // Flags
    const isImmediateSaveFlow = userType === 'Faculty' || userType === 'Schedule Allotment';
    const isScheduleAllotment = userType === 'Schedule Allotment';

    const validateFile = (selectedFile) => {
        if (selectedFile && allowedFileTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setMessage("");
            setStatus("idle");
        } else {
            setFile(null);
            setMessage("Invalid file format. Please upload Excel (.xlsx) or CSV.");
            setStatus("error");
        }
    };

    const resetState = () => {
        setFile(null);
        setPreviewData(null);
        setMessage("");
        setStatus("idle");
        setProgress(0);
        setSuccessStats(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file to upload.");
            setStatus("error");
            return;
        }
        
        const token = getAccessToken();
        if (!token) {
            setMessage("Session expired. Please login again.");
            setStatus("error");
            return;
        }
    
        setStatus("loading");
        setProgress(10); // Start progress
        
        const targetUrl = isImmediateSaveFlow ? saveUrl : apiUrl;
        const processType = isImmediateSaveFlow ? 'Saving' : 'Processing'; 

        setMessage(`${processType} data...`);
        const startTime = Date.now();
    
        const formData = new FormData();
        formData.append("excel_file", file);
    
        try {
            const response = await fetch(targetUrl, {
                method: "POST",
                body: formData,
                headers: { 
                    "Authorization": `Bearer ${token}`
                },
            });
    
            if (response.status === 404) throw new Error(`Endpoint Not Found. Check backend mapping for: ${targetUrl}`);
            if (response.status === 401) throw new Error("Unauthorized. Please log in again.");

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || responseData.detail || `Upload failed: ${response.status}`);
            }
    
            setProgress(50);

            if (isImmediateSaveFlow) {
                // --- FACULTY / SCHEDULE: IMMEDIATE SAVE FLOW ---
                const totalRecords = responseData.totalRecords || (responseData.data?.length || 0); 
                
                // Simulate progress completion
                let p = 50;
                const interval = setInterval(() => {
                    p += 10;
                    if (p > 90) clearInterval(interval);
                    setProgress(p);
                }, 100); // Faster simulation

                setTimeout(() => {
                    clearInterval(interval);
                    setProgress(100);
                    
                    const endTime = Date.now();
                    const duration = ((endTime - startTime) / 1000).toFixed(2);
                    
                    setMessage(`Successfully saved ${totalRecords} ${userType} records!`);
                    setStatus("success");
                    
                    // Show Modal
                    setSuccessStats({
                        type: userType,
                        count: totalRecords,
                        time: duration
                    });

                }, 1000);

            } else {
                // --- STUDENT: PREVIEW FLOW ---
                setProgress(100);
                if (responseData.data && Array.isArray(responseData.data)) {
                    setPreviewData(responseData.data);
                    setStatus("idle"); 
                    setMessage("");
                } else {
                    // UPDATED: Specific message for empty but valid response
                    setPreviewData([]); // Set empty array to trigger specific empty state
                    setStatus("idle");
                    setMessage("");
                }
            }
        } catch (err) {
            console.error("Upload error:", err.message);
            setMessage(err.message);
            setStatus("error");
            setProgress(0);
        }
    };

    const confirmSave = async () => {
        const token = getAccessToken();
        if (!token) {
            setMessage("Session expired. Please login again.");
            setStatus("error");
            return;
        }

        if (!previewData || previewData.length === 0) return;

        const totalRecords = previewData.length;
        const batches = chunkArray(previewData, BATCH_SIZE);
        const startTime = Date.now();

        setStatus("loading");
        setProgress(0);
        setMessage(`Initializing batch process for ${totalRecords} records...`);

        let processedCount = 0;
        let errorCount = 0;

        const saveType = isScheduleAllotment ? 'Schedule Allotment' : userType;

        try {
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                
                // Send Batch
                const response = await fetch(saveUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: batch }), 
                });
        
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(`Batch ${i+1} failed:`, errorData);
                    errorCount += batch.length;
                }

                processedCount += batch.length;
                
                // Update UI
                const percent = Math.round((processedCount / totalRecords) * 100);
                const elapsedTime = (Date.now() - startTime) / 1000;
                const rate = processedCount / elapsedTime; 
                const remaining = totalRecords - processedCount;
                const estSeconds = rate > 0 ? remaining / rate : 0;
                
                setProgress(percent);
                // UPDATED: Use formatTimeRemaining helper
                setMessage(`Saving: ${processedCount}/${totalRecords} (${percent}%) • ${formatTimeRemaining(estSeconds)}`);
            }

            // Finalize
            setProgress(100);
            const successCount = totalRecords - errorCount;
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            if (errorCount === 0) {
                setMessage(`Success! Saved all ${successCount} records.`);
                setStatus("success");
                setSuccessStats({
                    type: saveType,
                    count: successCount,
                    time: duration
                });
            } else {
                setMessage(`Completed with warnings. Saved: ${successCount}, Failed: ${errorCount}.`);
                setStatus("error"); 
            }
            
        } catch (err) {
            console.error("Save error:", err);
            setMessage(`Process Interrupted: ${err.message}`);
            setStatus("error");
        }
    };

    const cancelUpload = () => {
        setFile(null);
        setPreviewData(null);
        setMessage("");
        setStatus("idle");
    };

    // --- Render Content ---
    
    // 0. Success Modal (Global for this tab)
    if (successStats) {
        return (
            <>
                <SuccessModal stats={successStats} onClose={resetState} />
            </>
        );
    }

    // 1. Preview Mode
    if (previewData) {
        return (
            <UserPreviewTable 
                users={previewData} 
                userType={userType}
                onConfirm={confirmSave} 
                onCancel={cancelUpload}
                saveStatus={status}    
                saveProgress={progress} 
                saveMessage={message}   
            />
        );
    }

    // 2. Upload Mode
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Info Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center mb-4">
                        {userType === 'Student' && <Users size={20} />}
                        {userType === 'Faculty' && <BookOpen size={20} />}
                        {userType === 'Schedule Allotment' && <Clock size={20} />}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800">{userType} Database</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                        {userType === 'Student' && "Upload student records including ID, Name, Branch, and Batch. Supports bulk enrollment."}
                        {userType === 'Faculty' && "Update the faculty registry. Ensure Faculty IDs map correctly to their Departments."}
                        {userType === 'Schedule Allotment' && "Upload the class schedule matrix. This links Faculty to specific Subjects and Sections."}
                    </p>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required Fields</p>
                        <ul className="space-y-2 text-sm text-slate-600 font-medium">
                            {userType === 'Student' && (
                                <>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Student ID</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Full Name</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Branch Code</li>
                                </>
                            )}
                            {userType === 'Faculty' && (
                                <>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Faculty ID</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Department</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Designation</li>
                                </>
                            )}
                            {userType === 'Schedule Allotment' && (
                                <>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Subject Code</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Faculty ID</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400" />Section/Group</li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Upload Panel */}
            <div className="lg:col-span-2 space-y-6">
                <UploadZone 
                    file={file} 
                    onFileSelected={validateFile} 
                    disabled={status === 'loading'} 
                    userType={userType}
                />

                <AnimatePresence mode="wait">
                    {message && (
                        <StatusMessage key={status} status={status} message={message} progress={progress} />
                    )}
                </AnimatePresence>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleUpload}
                        disabled={!file || status === 'loading'}
                        className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] hover:-translate-y-0.5"
                    >
                        {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : (isImmediateSaveFlow ? <Save className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />)}
                        {status === 'loading' ? 'Processing...' : (isImmediateSaveFlow ? 'Upload & Save' : 'Preview Data')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---

const UserManagementPanel = () => {
    const [activeTab, setActiveTab] = useState('Student');
    
    return (
        <div className="w-full h-full p-6 lg:p-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                <p className="text-slate-500 mt-1 font-medium">Bulk upload and manage user records for the institution.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/50 p-1.5 gap-1 overflow-x-auto">
                    {[
                        { id: 'Student', icon: Users, label: 'Student Upload' },
                        { id: 'Faculty', icon: BookOpen, label: 'Faculty Upload' },
                        { id: 'Schedule Allotment', icon: Clock, label: 'Schedule' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[160px] py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 duration-300
                            ${activeTab === tab.id 
                                ? 'bg-slate-900 text-white shadow-md ring-1 ring-slate-200' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            <tab.icon size={16} strokeWidth={2.5} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 md:p-10 bg-white min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FileUploadTab 
                                userType={activeTab}
                                apiUrl={activeTab === 'Student' ? "/api/student/add-users/" : "/api/faculty/allotment-preview/"}
                                saveUrl={activeTab === 'Student' ? "/api/student/save-users/" : "/api/faculty/save-faculty/"}
                                currentTab={activeTab}
                                setActiveTab={setActiveTab}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default UserManagementPanel;