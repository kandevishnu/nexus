import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp, ChevronDown, ListChecks, FileUp, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getCookie } from "../utils"; // Assuming the file is located in the parent directory of AdminDashboard

// --- Utility Components and Logic ---

const allowedFileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];

// Generates years PUC1 S1 to E4 S2
const generateAcademicYears = () => {
    const years = [{ label: 'Select Academic Year', value: '' }];
    
    // Add PUC years (PUC1 S1/S2, PUC2 S1/S2)
    for (let p = 1; p <= 2; p++) {
        for (let s = 1; s <= 2; s++) {
            // Label: PUC1 SEM1, Value: PUC1_S1
            years.push({ label: `PUC${p} SEM${s}`, value: `PUC${p}_S${s}` });
        }
    }

    // Add Engineering years (E1 S1 to E4 S2)
    for (let e = 1; e <= 4; e++) {
        for (let s = 1; s <= 2; s++) {
            // Label: E1 SEM1, Value: E1_S1
            years.push({ label: `E${e} SEM${s}`, value: `E${e}_S${s}` });
        }
    }
    return years;
};

// Reusable Upload Box Component
const ResultUploadBox = ({ title, file, setFile, status, setStatus, message, setMessage, onProcessFile, children }) => {
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const validateFile = useCallback((selectedFile) => {
        if (selectedFile && allowedFileTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setMessage(`Selected file: ${selectedFile.name}`);
            setStatus("idle");
            return true;
        } else {
            setFile(null);
            setMessage(
                "Invalid file type. Please upload a CSV or Excel file (.xlsx, .xls)."
            );
            setStatus("error");
            return false;
        }
    }, [setFile, setMessage, setStatus]);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateFile(selectedFile);
    };

    const renderStatusIcon = () => {
        switch (status) {
          case "loading":
            return <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />;
          case "success":
            return <CheckCircle className="h-10 w-10 text-green-500" />;
          case "error":
            return <XCircle className="h-10 w-10 text-red-500" />;
          default:
            return <FileUp className="h-12 w-12 text-indigo-400" />;
        }
    };

    return (
        <div className="space-y-6">
            {children} {/* For Dropdown/Year Selection */}
            
            <div
                className={`w-full p-8 border-2 rounded-xl transition-all duration-300 cursor-pointer 
                border-dashed 
                ${dragging ? 'border-indigo-500 bg-indigo-50 shadow-inner' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
                ${status === 'error' ? 'border-red-500 bg-red-50' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    disabled={status === 'loading'}
                />
                <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
                    {renderStatusIcon()}
                    <h3 className="text-xl font-semibold text-gray-800">
                        {file ? file.name : `${title} File Here`}
                    </h3>
                    <p className="text-sm text-gray-500">
                        or <span className="text-indigo-600 font-medium hover:underline">click to select a file</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Supported formats: .csv, .xlsx, .xls
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {message && status !== 'loading' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium text-center
                        ${status === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={onProcessFile}
                disabled={!file || status === "loading" || status === "error"}
                className="w-full mt-6 px-8 py-3 bg-green-600 text-white rounded-lg shadow-lg shadow-green-500/50 font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.01] disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
            >
                {status === "loading" && <Loader2 className="animate-spin h-5 w-5" />}
                Upload & Validate File
            </motion.button>
        </div>
    );
};


// --- Subject Details Tab Implementation ---
const SubjectDetailsTab = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");

    const handleProcess = async () => {
        setStatus('loading');
        setMessage("Uploading subject details...");
        
        // --- API CALL HERE ---
        const csrfToken = getCookie("csrftoken");
        
        try {
            const formData = new FormData();
            formData.append("excel_file", file);
            
            // UPDATED ENDPOINT: /api/results/subjectInfo/
            const response = await fetch("/api/results/subjectInfo/", {
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": csrfToken },
                credentials: "include",
            });
            
            // Assuming the backend handles the save and returns a success message
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Server failed with status: ${response.status}` }));
                throw new Error(errorData.error || "Failed to upload subject details.");
            }
            
            setStatus('success');
            setMessage(`Subject details from ${file.name} uploaded successfully!`);
            setFile(null);

        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <div className="p-4">
            <ResultUploadBox
                title="Upload Subject Details (Excel/CSV)"
                file={file}
                setFile={setFile}
                status={status}
                setStatus={setStatus}
                message={message}
                setMessage={setMessage}
                onProcessFile={handleProcess}
            />
        </div>
    );
};

// --- Results Entry Tab Implementation ---
const ResultsEntryTab = () => {
    const years = generateAcademicYears();
    const [academicYear, setAcademicYear] = useState(years[0].value);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");

    // Simulate validation based on selected year and file name
    const handleValidation = () => {
        if (!academicYear) {
            setStatus('error');
            setMessage('Please select the Academic Year before uploading.');
            return false;
        }

        // --- SIMULATED FILE MATCHING LOGIC ---
        if (file) {
            // Get the selected year format (e.g., E1_S1)
            const selectedSem = academicYear.split('_')[1]; 
            const fileName = file.name.toUpperCase();
            
            // Check if the filename contains the semester part (S1, S2, etc.)
            // Note: This logic is simple and meant to be replaced by backend verification.
            if (!fileName.includes(selectedSem) && !fileName.includes(academicYear.replace('_', ''))) {
                 setStatus('error');
                 setMessage(`File name mismatch. Selected year is ${academicYear}, but file name does not seem to contain '${selectedSem}'.`);
                 return false;
            }
        }
        // --- END SIMULATED LOGIC ---
        
        setStatus('loading');
        setMessage('Validation passed. Submitting file for saving...');
        handleSave(); // Proceed to save if validation passes
    };

    const handleSave = async () => {
        const csrfToken = getCookie("csrftoken");
        
        try {
            const formData = new FormData();
            formData.append("excel_file", file);
            // MANDATORY: Add the selected academic year to the form data
            formData.append("year_sem", academicYear); 

            // UPDATED API endpoint to process and save results
            const response = await fetch("/api/results/result/", { 
                method: "POST",
                body: formData,
                headers: { "X-CSRFToken": csrfToken },
                credentials: "include",
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Server failed with status: ${response.status}` }));
                throw new Error(errorData.error || "Failed to upload results.");
            }

            // Simulate progress for the final save (as implemented previously)
            const totalRecords = 50; // Mock total records for progress bar
            
            // Simulating progress
            let progressInterval = setInterval(() => {
                // Logic removed to prevent ReferenceError.
            }, 50);

            setTimeout(() => {
                // Ensure interval is stopped before state change
                if (typeof progressInterval !== 'undefined') clearInterval(progressInterval); 
                
                setStatus('success');
                setMessage(`Results for ${academicYear} saved successfully!`);
                setFile(null);
            }, 1000); // 1 second hardcoded delay for success

        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };


    return (
        <div className="p-4">
            <ResultUploadBox
                title="Upload Exam Results (Excel/CSV)"
                file={file}
                setFile={setFile}
                status={status}
                setStatus={setStatus}
                message={message}
                setMessage={setMessage}
                onProcessFile={handleValidation}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-2 sm:mb-0">
                        Academic Year Selection <span className="text-red-500">*</span>
                    </h3>
                    
                    {/* Styled Dropdown for Academic Year */}
                    <div className="relative inline-block text-left w-full sm:w-auto">
                        <select
                            value={academicYear}
                            onChange={(e) => {
                                setAcademicYear(e.target.value);
                                setStatus('idle'); // Reset status on year change
                                setMessage('');
                            }}
                            className="appearance-none block w-full bg-white border border-gray-400 py-2 pl-3 pr-10 rounded-md shadow-inner focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-medium"
                        >
                            {years.map(year => (
                                <option 
                                    key={year.value} 
                                    value={year.value} 
                                    disabled={!year.value}
                                >
                                    {year.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>
            </ResultUploadBox>
        </div>
    );
};


// --- Main Component ---
const ResultsUploadPanel = () => {
    const [activeTab, setActiveTab] = useState('SubjectDetails');
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-2xl shadow-gray-200/50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Academic Results Management</h1>
            
            {/* Premium Tab Navigation: Pill Style */}
            <div className="flex bg-gray-100 p-2 rounded-xl mb-8 border border-gray-200">
                <button
                    onClick={() => setActiveTab('SubjectDetails')}
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-200 rounded-lg w-1/2 justify-center 
                    ${activeTab === 'SubjectDetails' ? 'bg-white text-green-700 shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <ListChecks size={20} />
                    Subject Details Upload
                </button>
                <button
                    onClick={() => setActiveTab('ResultsEntry')}
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-200 rounded-lg w-1/2 justify-center
                    ${activeTab === 'ResultsEntry' ? 'bg-white text-green-700 shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <TrendingUp size={20} />
                    Result Entry Upload
                </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    {activeTab === 'SubjectDetails' && <SubjectDetailsTab />}
                    {activeTab === 'ResultsEntry' && <ResultsEntryTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ResultsUploadPanel;