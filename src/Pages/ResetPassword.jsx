import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { getCookie } from "../utils"; // Corrected path to navigate to src/utils

// Reusing the AnimatedCard structure for consistency
const AnimatedCard = ({ children, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-2xl shadow-indigo-500/20"
  >
    <div className="text-center mb-8">
      <motion.h1 
        className="text-3xl font-bold text-gray-900 mb-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
    {children}
  </motion.div>
);


const ResetPassword = () => {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [isResetComplete, setIsResetComplete] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- Token and Email Retrieval ---
    const resetToken = localStorage.getItem("resetToken");
    const resetEmail = localStorage.getItem("resetEmail");
    
    // The target URL that is currently 404
    const resetUrl = "/api/student/reset-password/"; 

    // Effect to check tokens on load
    useEffect(() => {
        if (!resetToken || !resetEmail) {
            // Redirects to verification page if token or email is missing
            navigate("/forgot-password", { replace: true });
        }
    }, [navigate, resetToken, resetEmail]);

    const getCsrfToken = useCallback(() => getCookie("csrftoken"), []);

    const isPasswordValid = newPassword.length >= 8 && newPassword === confirmPassword;

    // --- API Handler ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        console.log(`Attempting password reset to: ${resetUrl}`); // Log the URL

        try {
            const csrfToken = getCsrfToken();

            const response = await fetch(resetUrl, { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                    // Send the token for authorization/verification
                    "Authorization": `Token ${resetToken}` 
                },
                body: JSON.stringify({ 
                    gmail: resetEmail, 
                    password: newPassword,
                    token: resetToken 
                }),
                credentials: "include",
            });

            // Check for 404 explicitly
            if (response.status === 404) {
                 throw new Error(`Endpoint Not Found. Please check your backend URL mapping for ${resetUrl}`);
            }
            
            // Check for 403 explicitly
            if (response.status === 403) {
                 throw new Error(`Forbidden. Token is invalid or expired. Please re-verify your email.`);
            }


            const data = await response.json();

            if (response.ok) {
                // Success! Clear local storage items
                localStorage.removeItem("resetToken");
                localStorage.removeItem("resetEmail");
                
                setMessage("Password reset successfully! Redirecting to login...");
                setIsResetComplete(true);

                // Redirect to login after a delay
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 2000);

            } else {
                // Handle token expired, invalid token, or other errors
                const errMsg = data.error || data.detail || "Password reset failed. Please try the verification process again.";
                setError(errMsg);
            }
        } catch (err) {
            setError(err.message || "Network error during password reset.");
        } finally {
            setLoading(false);
        }
    };
    
    // Safety check: if tokens are missing during initial render, show loading or null
    if (!resetToken || !resetEmail) {
        return <div className="min-h-[100dvh] w-full bg-slate-50 flex items-center justify-center">Redirecting...</div>;
    }


    const LockToggleIcon = showPassword ? EyeOff : Eye;
    const inputType = showPassword ? "text" : "password";

    return (
        <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            
            <button 
                onClick={() => navigate('/forgot-password')} 
                className="absolute top-8 left-8 text-gray-600 hover:text-indigo-600 flex items-center transition-colors disabled:text-gray-400"
                disabled={loading || isResetComplete}
            >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Verification
            </button>

            <AnimatedCard 
                title={isResetComplete ? "Success!" : "Set New Password"}
                subtitle={isResetComplete ? "Your password has been updated." : `For: ${resetEmail}`}
            >
                {isResetComplete ? (
                    <motion.div
                        key="success-message"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                    >
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700">You can now log in with your new password.</p>
                    </motion.div>
                ) : (
                    <motion.form
                        key="reset-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm overflow-hidden"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* New Password Input */}
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                <Lock className="h-5 w-5" />
                            </span>
                            <input
                                type={inputType}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={8}
                                className="w-full pl-12 pr-12 py-3 bg-gray-50/80 border border-gray-300 rounded-lg outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="New Password (min. 8 chars)"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-600 transition-colors"
                                disabled={loading}
                            >
                                <LockToggleIcon className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Confirm Password Input */}
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                <Lock className="h-5 w-5" />
                            </span>
                            <input
                                type={inputType}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={8}
                                className="w-full pl-12 pr-12 py-3 bg-gray-50/80 border border-gray-300 rounded-lg outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Confirm New Password"
                            />
                        </div>

                        {/* Validation Hint */}
                        {newPassword && newPassword.length < 8 && (
                            <p className="text-xs text-red-500 text-center">Password must be at least 8 characters.</p>
                        )}
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500 text-center">Passwords must match.</p>
                        )}


                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid}
                            className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center group ${isPasswordValid ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30' : 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-gray-500/30'}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    <span>Resetting Password...</span>
                                </>
                            ) : (
                                <span>Reset Password</span>
                            )}
                        </button>
                    </motion.form>
                )}
                
                <AnimatePresence>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-center text-sm mt-6 text-green-600 font-semibold"
                        >
                            {message}
                        </motion.p>
                    )}
                </AnimatePresence>
            </AnimatedCard>
        </div>
    );
};

export default ResetPassword;
