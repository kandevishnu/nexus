import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, CheckCircle, Loader2, XCircle, Users, BookOpen, Clock } from "lucide-react";
import { getCookie } from "../../utils"; // Correct relative path
import UserPreviewTable from "./UserPreviewTable";

const allowedFileTypes = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

// --- Sub-Component for File Upload Logic (Reusable) ---
const FileUploadTab = ({ userType, apiUrl, saveUrl, currentTab, setActiveTab }) => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState("");
    const [previewData, setPreviewData] = useState(null);
    const [progress, setProgress] = useState(0); 
    const fileInputRef = useRef(null);
    
    // DEFINE FLAGS: True if the flow should skip preview and go straight to save
    const isImmediateSaveFlow = userType === 'Faculty' || userType === 'Schedule Allotment';
    const isScheduleAllotment = userType === 'Schedule Allotment'; // Retain for save message consistency

    // Ensure this tab is active before rendering/interacting
    const isActive = currentTab === userType;

    // Reset status on tab change
    if (!isActive && (file || previewData)) {
        setFile(null);
        setPreviewData(null);
        setMessage("");
        setStatus("idle");
    }

    const validateFile = (selectedFile) => {
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
    };

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
    
    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file to upload.");
            setStatus("error");
            return;
        }
    
        setStatus("loading");
        
        // --- Determine Endpoint and Message ---
        const targetUrl = isImmediateSaveFlow ? saveUrl : apiUrl;
        const processType = isImmediateSaveFlow ? 'saving' : 'preview'; 

        setMessage(`Uploading file for ${processType}...`);
        // --- End Endpoint Determination ---
    
        const formData = new FormData();
        formData.append("excel_file", file); // Consistent key name
    
        const csrfToken = getCookie("csrftoken");
        
        try {
            const response = await fetch(targetUrl, {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRFToken": csrfToken,
                },
                credentials: "include",
            });
    
            // Check for 404 explicitly to provide specific user feedback
            if (response.status === 404) {
                 throw new Error(`Endpoint Not Found. Check backend mapping for: ${targetUrl}`);
            }

            const responseData = await response.json();
            console.log("Backend response:", responseData);
    
            if (!response.ok) {
                const errorMessage =
                    responseData.error ||
                    responseData.detail ||
                    `Upload failed with status: ${response.status}`;
                throw new Error(errorMessage);
            }
    
            if (isImmediateSaveFlow) {
                // --- FACULTY / SCHEDULE: IMMEDIATE SAVE FLOW ---
                const totalRecords = responseData.totalRecords || (responseData.data?.length || 0); 
                
                // Start immediate progress simulation
                for (let i = 1; i <= totalRecords; i++) {
                    setTimeout(() => {
                        setProgress(Math.round((i / totalRecords) * 100));
                        setMessage(`Saving ${userType}s: ${i}/${totalRecords}`);
                    }, 10 * i);
                }
        
                setTimeout(() => {
                    setMessage(`Successfully saved ${totalRecords} ${userType} records!`);
                    setStatus("success");
                    setPreviewData(null);
                    setFile(null);
                }, 10 * totalRecords + 500);

            } else {
                // --- STUDENT: PREVIEW FLOW (API CALL) ---
                if (responseData.data && Array.isArray(responseData.data)) {
                    setPreviewData(responseData.data);
                    setStatus("idle"); 
                    setMessage("File uploaded successfully. Review data before saving.");
                } else {
                    setMessage(`File uploaded, but no ${userType} data received for preview.`);
                    setStatus("error");
                }
            }
        } catch (err) {
            console.error("Upload error:", err.message);
            setMessage(`Upload failed: ${err.message}`);
            setStatus("error");
        }
    };

    const confirmSave = async () => {
        const totalRecords = previewData ? previewData.length : 0;
        setProgress(0);
        setStatus("loading");
        
        const saveType = isScheduleAllotment ? 'Schedule Allotment' : userType;
        setMessage(`Saving ${saveType}: 0/${totalRecords}`);
        
        const csrfToken = getCookie("csrftoken");
    
        try {
            const response = await fetch(saveUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                // Send the previewed data back to the backend
                body: JSON.stringify({ data: previewData }), 
                credentials: "include",
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: `Server returned status ${response.status} but no valid JSON.`
                }));
                throw new Error(errorData.error || `Failed to save ${saveType}.`);
            }
    
            const data = await response.json();
            console.log("Save response:", data);
            
            // Simulate progress for a cleaner UI experience
            for (let i = 1; i <= totalRecords; i++) {
                setTimeout(() => {
                    setProgress(Math.round((i / totalRecords) * 100));
                    setMessage(`Saving ${saveType}: ${i}/${totalRecords}`);
                }, 10 * i);
            }
    
            setTimeout(() => {
                setMessage(`Successfully saved ${totalRecords} ${saveType} records!`);
                setStatus("success");
                setPreviewData(null);
                setFile(null);
            }, 10 * totalRecords + 500);
            
        } catch (err) {
            console.error("Save error:", err);
            setMessage(`Save failed: ${err.message}`);
            setStatus("error");
        }
    };

    const cancelUpload = () => {
        setFile(null);
        setPreviewData(null);
        setMessage("");
        setStatus("idle");
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
            return <FileUp className="h-10 w-10 text-gray-400" />;
        }
    };

    return (
        <div className="w-full">
            {/* Overlay for Loading/Progress */}
            <AnimatePresence>
                {status === 'loading' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
                    >
                        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
                            {renderStatusIcon()}
                            <h4 className="text-lg font-semibold mt-4">{message}</h4>
                            <div className="h-2 bg-gray-200 rounded-full w-full mt-4">
                                <motion.div 
                                    className="h-full rounded-full bg-indigo-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area: Preview Table or Upload Box */}
            <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
                {previewData ? (
                    <UserPreviewTable 
                        users={previewData} 
                        userType={userType}
                        onConfirm={confirmSave} 
                        onCancel={cancelUpload} 
                    />
                ) : (
                    <>
                        <div
                            className={`w-full max-w-2xl p-8 border-2 rounded-xl transition-all duration-300 cursor-pointer 
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
                            />
                            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                                <FileUp className="h-12 w-12 text-indigo-400" />
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {file ? file.name : `Drag & Drop ${userType} File here`}
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
                                    className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium
                                    ${status === "error" ? "bg-red-100 text-red-700" : ""}
                                    ${status === "success" ? "bg-green-100 text-green-700" : ""}`}
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            onClick={handleUpload}
                            disabled={!file || status === "loading"}
                            className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/50 font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                            whileTap={{ scale: 0.98 }}
                        >
                            {status === "loading" && <Loader2 className="animate-spin h-5 w-5" />}
                            {/* Dynamic button text based on flow */}
                            {isImmediateSaveFlow ? `Upload & Save ${userType} records` : `Upload ${userType} File for Preview`}
                        </motion.button>
                    </>
                )}
            </div>
        </div>
    );
}

// --- Main Exported Component ---
const UserManagementPanel = () => {
    const [activeTab, setActiveTab] = useState('Student');
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-2xl shadow-gray-200/50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">User Bulk Upload</h1>
            
            {/* Premium Tab Navigation: Pill Style */}
            <div className="flex bg-gray-100 p-2 rounded-xl mb-8 border border-gray-200">
                <button
                    onClick={() => setActiveTab('Student')}
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-200 rounded-lg w-1/3 justify-center 
                    ${activeTab === 'Student' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <Users size={20} />
                    Student Upload
                </button>
                <button
                    onClick={() => setActiveTab('Faculty')}
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-200 rounded-lg w-1/3 justify-center
                    ${activeTab === 'Faculty' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <BookOpen size={20} />
                    Faculty Upload
                </button>
                <button
                    onClick={() => setActiveTab('Schedule Allotment')}
                    className={`flex items-center gap-2 px-6 py-2.5 font-semibold transition-all duration-200 rounded-lg w-1/3 justify-center
                    ${activeTab === 'Schedule Allotment' ? 'bg-white text-indigo-700 shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                    <Clock size={20} />
                    Schedule Allotment
                </button>
            </div>

            {/* Tab Content (Reusable Component) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    {activeTab === 'Student' && (
                        <FileUploadTab 
                            userType="Student"
                            apiUrl="/api/student/add-users/"
                            saveUrl="/api/student/save-users/"
                            currentTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    )}
                    {activeTab === 'Faculty' && (
                        <FileUploadTab 
                            userType="Faculty"
                            apiUrl="/api/faculty/add-faculty/" // Not used for this flow
                            saveUrl="/api/faculty/save-faculty/" // Used for direct save
                            currentTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    )}
                    {activeTab === 'Schedule Allotment' && (
                        <FileUploadTab 
                            userType="Schedule Allotment"
                            apiUrl="/api/faculty/allotment-preview/" // Used for API Preview call
                            saveUrl="/api/faculty/allot-faculty/"
                            currentTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UserManagementPanel;