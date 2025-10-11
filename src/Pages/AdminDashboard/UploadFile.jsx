// src/pages/AdminDashboard/UploadFile.jsx

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, CheckCircle, Loader2, XCircle } from "lucide-react";
import { getCookie } from "../../utils";
import UserPreviewTable from "./UserPreviewTable";

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [progress, setProgress] = useState(0); // New state for progress bar
  const fileInputRef = useRef(null);

  const allowedFileTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

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
    setMessage("Uploading file for preview...");

    const formData = new FormData();
    formData.append("excel_file", file);

    const csrfToken = getCookie("csrftoken");

    try {
      const response = await fetch("/api/student/add-users/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      });

      const responseData = await response.json();
      console.log("Backend response:", responseData);

      if (!response.ok) {
        const errorMessage =
          responseData.error ||
          responseData.detail ||
          `Upload failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (responseData.data) {
        setPreviewData(responseData.data);
        setStatus("idle");
        setMessage("");
      } else {
        setMessage("File uploaded, but no user data received for preview.");
        setStatus("error");
      }
    } catch (err) {
      console.error("Upload error:", err.message);
      setMessage(`Upload failed: ${err.message}`);
      setStatus("error");
    }
  };

  const confirmSave = async () => {
    const totalUsers = previewData ? previewData.length : 0;
    setProgress(0);
    setStatus("loading");
    setMessage(`Saving users: 0/${totalUsers}`);
    const csrfToken = getCookie("csrftoken");

    try {
      const response = await fetch("/api/student/save-users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ users: previewData }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Server returned status ${response.status} but no valid JSON.`
        }));
        throw new Error(errorData.error || "Failed to save users.");
      }

      const data = await response.json();
      console.log("Save response:", data);
      
      // Simulate progress for a cleaner UI experience
      for (let i = 1; i <= totalUsers; i++) {
        setTimeout(() => {
          setProgress(Math.round((i / totalUsers) * 100));
          setMessage(`Saving users: ${i}/${totalUsers}`);
        }, 10 * i);
      }

      setTimeout(() => {
        setMessage(`Successfully saved ${totalUsers} users!`);
        setStatus("success");
        setPreviewData(null);
        setFile(null);
      }, 10 * totalUsers + 500); // Wait for the progress bar to finish
      
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
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 min-h-[400px]">
    <AnimatePresence>
      {status === 'loading' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm" // Corrected line
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
        {message && status !== 'loading' && (
           <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: 10 }}
           className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium
           ${status === "error" ? "bg-red-100 text-red-700" : ""}
           ${status === "success" ? "bg-green-100 text-green-700" : ""}
           `}
         >
           {message}
         </motion.div>
        )}
      </AnimatePresence>
      
      {previewData ? (
        <UserPreviewTable
          users={previewData}
          onConfirm={confirmSave}
          onCancel={cancelUpload}
        />
      ) : (
        <>
          <div
            className={`w-full max-w-2xl p-8 border-2 border-dashed rounded-xl transition-all duration-300
                            ${
                              dragging
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300"
                            }
                            ${status === "error" ? "border-red-500 bg-red-50" : ""}
                            ${
                              status === "success"
                                ? "border-green-500 bg-green-50"
                                : ""
                            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
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
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {renderStatusIcon()}
              <h3 className="text-xl font-semibold text-gray-800">
                {file ? file.name : "Drag & Drop your file here"}
              </h3>
              <p className="text-sm text-gray-500">
                or{" "}
                <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
                  click to select a file
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: .csv, .xlsx, .xls
              </p>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || status === "loading"}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === "loading" && (
              <Loader2 className="animate-spin h-5 w-5" />
            )}
            Upload File for Preview
          </button>
        </>
      )}
    </div>
  );
};

export default UploadFile;