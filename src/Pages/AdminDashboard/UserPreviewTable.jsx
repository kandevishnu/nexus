import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const UserPreviewTable = ({ 
    users, userType, onConfirm, onCancel, 
    saveStatus, saveProgress, saveMessage 
}) => {
    
    const isSaving = saveStatus === 'loading';
    const isSuccess = saveStatus === 'success';

    // --- Empty State ---
    if (!users || users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                    <FileSpreadsheet size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium">No valid data found to display.</p>
            </div>
        );
    }

    // --- Header Logic ---
    const firstUser = users[0] || {};

    const customKeyMap = {
        'rollNo': 'Roll No.',
        'idNo': 'Student ID',
        'hallTicketNo': 'Hall Ticket',
        'name': 'Full Name',
        'gender': 'Gender',
        'branch': 'Branch',
        'section': 'Section',
        'batch': 'Batch',
        'studentMobile': 'Contact No.',
        'gmail': 'Email Address',
        'department': 'Department',
        'designation': 'Designation',
        'YEAR': 'Year',
        'SEM': 'Semester',
        'CLASS': 'Class ID',
        'FACULTY': 'Faculty ID',
        'SUBJECT': 'Subject Code'
    };

    let headerKeys = Object.keys(firstUser);
    if (userType === 'Student') {
        const priorityKeys = ['idNo', 'name', 'branch', 'batch'];
        const otherKeys = headerKeys.filter(k => !priorityKeys.includes(k));
        headerKeys = [...priorityKeys, ...otherKeys];
    }

    const finalHeaders = headerKeys.map(key => ({
        key: key,
        label: customKeyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));

    return (
        <div className="relative w-full space-y-6">
            
            {/* --- OVERLAY: Saving / Success State --- */}
            <AnimatePresence>
                {(isSaving || isSuccess) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 text-center max-w-sm w-full"
                        >
                            <div className="mx-auto mb-4 flex items-center justify-center">
                                {isSuccess ? (
                                    <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-300" />
                                ) : (
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                                        <div className="absolute inset-0 w-16 h-16 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {isSuccess ? "Save Complete!" : "Saving Records..."}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">{saveMessage}</p>

                            {/* Progress Bar */}
                            {!isSuccess && (
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <motion.div 
                                        className="bg-teal-500 h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${saveProgress}%` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Top Control Bar --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
                        Data Preview
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 ml-4">
                        Reviewing <span className="font-bold text-teal-700">{users.length}</span> {userType} records.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSaving}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all transform active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Confirm Import
                    </button>
                </div>
            </div>

            {/* --- Data Table --- */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16 bg-slate-50">
                                    #
                                </th>
                                {finalHeaders.map((header) => (
                                    <th 
                                        key={header.key} 
                                        className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 whitespace-nowrap"
                                    >
                                        {header.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {users.map((row, idx) => (
                                <tr 
                                    key={idx} 
                                    className="hover:bg-teal-50/30 transition-colors group"
                                >
                                    <td className="px-6 py-3 text-slate-400 font-mono text-xs group-hover:text-teal-600">
                                        {idx + 1}
                                    </td>
                                    {finalHeaders.map((header) => {
                                        const value = row[header.key];
                                        const isEmpty = !value || value === '' || value === '—';
                                        
                                        return (
                                            <td 
                                                key={`${idx}-${header.key}`} 
                                                className="px-6 py-3 whitespace-nowrap text-sm text-slate-700"
                                            >
                                                {isEmpty ? (
                                                    <span className="text-slate-300 text-xs italic">Empty</span>
                                                ) : (
                                                    <span className="font-medium">{value}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Validation Summary */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>Ready to save</span>
                    </div>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-slate-400" />
                        <span>Rows containing empty fields may require attention</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPreviewTable;