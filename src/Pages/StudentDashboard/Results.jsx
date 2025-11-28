import React, { useState, useCallback, useMemo } from 'react';
import { TrendingUp, Search, Printer, ChevronDown, Loader2, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { getCookie } from "../../utils"; // Corrected path to navigate up two levels to reach src/utils

// --- Utility Functions ---

// Grade to Grade Point (GP) mapping
const GRADE_POINTS = {
    'Ex': 10,
    'A': 9,
    'B': 8,
    'C': 7,
    'D': 6,
    'E': 5,
    'F': 0, // Fail
};

// Generates academic year options (PUC1 S1 to E4 S2)
const generateAcademicYears = () => {
    const years = [{ label: 'Select Academic Year', value: '' }];
    
    // Add PUC years
    for (let p = 1; p <= 2; p++) {
        for (let s = 1; s <= 2; s++) {
            years.push({ label: `PUC${p} SEM${s}`, value: `PUC${p}_S${s}` });
        }
    }

    // Add Engineering years
    for (let e = 1; e <= 4; e++) {
        for (let s = 1; s <= 2; s++) {
            years.push({ label: `E${e} SEM${s}`, value: `E${e}_S${s}` });
        }
    }
    return years;
};

// --- Main Results Component ---

const Results = () => {
    const years = generateAcademicYears();
    
    // --- REMOVED DUMMY DATA FOR LIVE FETCH ---
    
    const [selectedYear, setSelectedYear] = useState(years[0].value); // Start with 'Select Academic Year'
    const [results, setResults] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate SGPA
    const calculateSgpa = useMemo(() => {
        if (!results || results.length === 0) return { sgpa: 'N/A', totalCredits: 0 };

        let totalCreditPoints = 0;
        let totalCredits = 0;
        let failedSubjects = false;

        results.forEach(subject => {
            // Ensure credits is always treated as a number
            const credits = parseInt(subject.credits) || 0; 
            const grade = subject.semGrade || 'F';
            const gradePoint = GRADE_POINTS[grade.toUpperCase()] || 0;
            
            totalCredits += credits;

            if (gradePoint === 0 && grade.toUpperCase() === 'F') {
                failedSubjects = true;
            }
            
            // Only count credits for passed subjects towards SGPA calculation
            if (gradePoint > 0) { 
                totalCreditPoints += credits * gradePoint;
            }
        });

        // SGPA is not calculated if any subject has an 'F' grade
        if (failedSubjects) {
            return { sgpa: 'F (Failed)', totalCredits, totalCreditPoints: 0, failed: true };
        }

        // Prevent division by zero
        if (totalCredits === 0) {
            return { sgpa: 'N/A', totalCredits: 0, failed: false };
        }

        const sgpa = (totalCreditPoints / totalCredits).toFixed(2);
        return { sgpa, totalCredits, failed: false };

    }, [results]);


    // Fetch results from backend (Now performing live API call)
    const fetchResults = async () => {
        if (!selectedYear) {
            setError("Please select an Academic Year to view results.");
            setResults(null);
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);
        
        const csrfToken = getCookie("csrftoken");
        try {
            // UPDATED ENDPOINT: /api/student/get-results/
            const response = await fetch(`/api/student/get-results/?year_sem=${selectedYear}`, {
                method: "GET",
                headers: { "X-CSRFToken": csrfToken },
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.error || data.detail || `Failed to fetch results for ${selectedYear}. Status: ${response.status}`;
                setError(errMsg);
                return;
            }

            if (data.results && Array.isArray(data.results) && data.results.length > 0) {
                setResults(data.results);
            } else {
                setError(`No results found for ${selectedYear}.`);
            }
        } catch (err) {
            // Check for potential network/CORS issues causing non-JSON response
            setError(err.message || "Network error while fetching results. Check console for details.");
        } finally {
            setLoading(false);
        }
    };
    
    // Print functionality (using browser's native print dialog)
    const handlePrint = () => {
        window.print();
    };


    // --- Render Components ---

    const RenderResultsTable = () => (
        <div className="mt-8 bg-white p-4 rounded-xl shadow-md border border-gray-100 print:shadow-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Marks for {selectedYear}
            </h3>
            
            {/* Results Table - Use overflow-x-auto to ensure horizontal scrolling is possible for small screens */}
            <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '700px' }}>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Code</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">Credits</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">Mid 1</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">Mid 2</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">Mid 3</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">WAT</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Internal</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((r, index) => (
                            <tr key={index} className={r.semGrade === 'F' ? 'bg-red-50' : ''}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{r.subjectName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{r.subjectCode}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{r.credits}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{r.mid1}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{r.mid2}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{r.mid3}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{r.wat}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">{r.internalMarks}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-center text-base font-semibold ${r.semGrade === 'F' ? 'text-red-600' : 'text-green-600'}`}>
                                    {r.semGrade}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SGPA & Print Section */}
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex justify-between items-center print:border-none print:bg-white">
                <div className="text-xl font-extrabold text-gray-900">
                    SGPA: 
                    <span className={`ml-2 ${calculateSgpa.failed ? 'text-red-600' : 'text-indigo-600'}`}>
                        {calculateSgpa.sgpa}
                    </span>
                    {calculateSgpa.failed && <span className="text-sm font-normal text-red-500 ml-3">(One or more failures)</span>}
                </div>
                
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md print:hidden"
                >
                    <Printer size={18} /> Print Results
                </button>
            </div>
            
            {/* Grade Point Legend */}
             <div className="mt-4 text-xs text-gray-500 print:hidden">
                <p>Grade Point Scale: Ex (10), A (9), B (8), C (7), D (6), E (5), F (0 - Fail).</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-xl shadow-xl border border-gray-200">
            <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2 mb-6">
                <TrendingUp size={24} /> Academic Results Portal
            </h1>

            {/* Search/Filter Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-inner print:hidden">
                
                <div className="relative inline-block text-left w-full sm:w-auto flex-grow">
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setError(null);
                        }}
                        className="appearance-none block w-full bg-white border border-gray-400 py-2 pl-3 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 font-medium"
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

                <button
                    onClick={fetchResults}
                    disabled={!selectedYear || loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {loading ? 'Fetching...' : 'Search Results'}
                </button>
            </div>
            
            {/* Content Area */}
            <div className="mt-6">
                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-3">
                        <AlertTriangle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {results && results.length > 0 && <RenderResultsTable />}

                {results && results.length === 0 && !loading && !error && (
                     <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg flex items-center gap-3">
                        <XCircle size={20} />
                        <span className="font-medium">No results found for the selected academic year.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;