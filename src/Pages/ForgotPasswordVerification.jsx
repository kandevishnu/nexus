import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { getCookie } from "../utils"; // Corrected path assumption: assuming utils is directly under src or a common folder

// --- Utility Components ---

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

const OtpInput = ({ length = 6, value, onChange, disabled }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus the first empty input field on load/change
        if (value.length < length && inputRefs.current[value.length]) {
            inputRefs.current[value.length].focus();
        }
    }, [value, length]);

    const handleChange = (e, index) => {
        let newValue = e.target.value;
        const inputChar = newValue.slice(-1);

        if (inputChar.match(/[0-9]/)) {
            const newOtp = value.split('');
            newOtp[index] = inputChar;
            const newOtpString = newOtp.join('');

            onChange(newOtpString.slice(0, length));

            // Move to next input
            if (index < length - 1 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        } else if (newValue.length === 0) {
            // Handle deletion
            const newOtp = value.split('');
            newOtp[index] = '';
            onChange(newOtp.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on Backspace if current is empty
        if (e.key === 'Backspace' && index > 0 && inputRefs.current[index].value === '') {
            e.preventDefault(); // Prevent default backspace behavior
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (pasteData.match(/^[0-9]+$/) && pasteData.length <= length) {
            onChange(pasteData.slice(0, length));
        }
    };

    return (
        <div className="flex justify-center space-x-2 sm:space-x-4" onPaste={handlePaste}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={disabled}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-2xl text-center border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
            ))}
        </div>
    );
};


// --- Main Component ---

const ForgotPasswordVerification = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Input
  const [gmail, setGmail] = useState(localStorage.getItem("recoveryEmail") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Clear recoveryEmail after use, but keep the value in state
  useEffect(() => {
    localStorage.removeItem("recoveryEmail");
  }, []); 

  // Timer logic
  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setInterval(() => {
        setResendTimer((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [resendTimer]);
  
  const getCsrfToken = useCallback(() => getCookie("csrftoken"), []);
  
  // Validation for OTP button activation
  const isOtpValid = useMemo(() => otp.length === 6, [otp]);

  // --- API Handlers ---

  const handleSendOtp = async (isResend = false) => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
        const csrfToken = getCsrfToken();
        const endpoint = isResend ? "/api/student/resend-otp/" : "/api/student/get-mail/";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            // Sending the state variable `gmail`
            body: JSON.stringify({ gmail }), 
            credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
            setStep(2); // Move to OTP step
            setResendTimer(60); // Start 60-second timer
            setMessage(isResend ? "New OTP sent successfully!" : "Verification code sent to your email.");
            setOtp(""); // Clear OTP input on new send
        } else {
            const errMsg = data.error || data.detail || "Failed to send OTP.";
            // Edge Case: If account is invalid, clearly inform the user.
            if (response.status === 404 || errMsg.includes("No account")) {
                 setError("No account found with this email. Please verify the address.");
            } else {
                 setError(errMsg);
            }
        }
    } catch (err) {
        setError(err.message || "Network error. Could not reach server.");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpValid) return;

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
        const csrfToken = getCsrfToken();

        const response = await fetch("/api/student/verify-otp/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            // Sending the state variables `gmail` and `otp`
            body: JSON.stringify({ gmail, otp }), 
            credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
            // Success! Store a temporary token and navigate to reset page
            localStorage.setItem("resetToken", data.token); // Assuming backend returns a token like { "token": "xyz" }
            localStorage.setItem("resetEmail", gmail);
            navigate("/reset-password", { replace: true });
        } else {
            const errMsg = data.error || data.detail || "Invalid OTP. Please enter the code again.";
            setError(errMsg);
            setOtp(""); // Clear OTP on failure
        }
    } catch (err) {
        setError(err.message || "Network error during OTP verification.");
    } finally {
        setLoading(false);
    }
  };

  // --- Render Functions ---

  const renderEmailInput = () => (
    <motion.form
      key="email-form"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
      className="space-y-6"
    >
      <div className="relative group">
        <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
          <Mail className="h-5 w-5" />
        </span>
        <input
          type="email"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
          required
          disabled={loading}
          className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-300 rounded-lg outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your registered email"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !gmail}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Sending OTP...</span>
          </>
        ) : (
          <span>Send Verification Code</span>
        )}
      </button>
    </motion.form>
  );

  const renderOtpInput = () => (
    <motion.div
      key="otp-form"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
        <p className="text-center text-sm text-gray-600">
            A 6-digit code has been sent to <span className="font-semibold text-gray-800">{gmail}</span>.
        </p>

        <OtpInput 
            length={6} 
            value={otp} 
            onChange={setOtp} 
            disabled={loading}
        />
      
        <button
            onClick={handleVerifyOtp}
            disabled={loading || !isOtpValid}
            className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center group ${isOtpValid ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30' : 'bg-gray-300 text-gray-600 cursor-not-allowed shadow-gray-500/30'}`}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                </>
            ) : (
                <>
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    <span>Verify OTP</span>
                </>
            )}
        </button>

        <div className="text-center text-sm">
            {resendTimer > 0 ? (
                <p className="text-gray-500">Resend code in {resendTimer}s</p>
            ) : (
                <button
                    onClick={() => handleSendOtp(true)}
                    disabled={loading}
                    className="text-indigo-600 font-medium hover:text-indigo-700 disabled:text-gray-400 transition-colors"
                >
                    Resend Code
                </button>
            )}
        </div>
    </motion.div>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        <button 
            onClick={() => navigate('/')} 
            className="absolute top-8 left-8 text-gray-600 hover:text-indigo-600 flex items-center transition-colors"
        >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Login
        </button>

        <AnimatedCard 
            title={step === 1 ? "Forgot Password" : "OTP Verification"}
            subtitle={step === 1 ? "Enter your email to receive a verification code." : "Enter the 6-digit code sent to your email."}
        >
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm mb-6 overflow-hidden"
                    >
                        {error}
                    </motion.div>
                )}
                {step === 1 && renderEmailInput()}
                {step === 2 && renderOtpInput()}
            </AnimatePresence>

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

export default ForgotPasswordVerification;
