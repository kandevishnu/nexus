import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getDefaultRoute } from '../routes/AuthContext'; 
import { User, Lock, ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log("--- Login Process Initiated ---");
            
            // 1. Send Request to Real Backend (Proxied via Vite)
            const response = await fetch('/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }), 
            });

            // 2. Handle API Errors
            if (!response.ok) {
                // Try to get specific error message from server, fallback to generic
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Invalid credentials. Please check your ID and password.');
            }

            // 3. Parse Success Data
            const data = await response.json();

            // 4. Store Tokens
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);

            const userRole = data.role ? data.role.toLowerCase() : 'student';

            // 5. Update Global Auth State
            setAuth({
                isAuthenticated: true,
                role: userRole,
                user: { username: username, ...data.user },
                loading: false,
            });

            // 6. Navigate to Dashboard
            const targetRoute = getDefaultRoute(userRole);
            console.log(`Navigating to: ${targetRoute}`);
            navigate(targetRoute);

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || 'Unable to connect to server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex font-sans bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            
            {/* --- LEFT SIDE: Professional Visuals --- */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" 
                        alt="University Campus" 
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-indigo-950/40 to-slate-900/60" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex flex-col justify-between w-full p-16">
                    <div className="flex items-center">
                        <div className="p-2.5 pr-1.5 backdrop-blur-sm rounded-xl">
                            {/* Updated Image with size constraints */}
                            <img 
                                src="src/assets/rguktlogo.png" 
                                alt="rgukt logo" 
                                className="h-10 w-10 object-contain rounded-lg"
                            />
                        </div>
                        <span className="text-white font-semibold tracking-wide opacity-90">NEXUS PORTAL</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-5xl font-bold text-white leading-tight">
                            Excellence in <br/>
                            <span className="text-indigo-300">Digital Education</span>
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Welcome to the RGUKT unified management system. 
                            Securely access your academic records, attendance, and administrative tools in one place.
                        </p>
                        
                        <div className="flex gap-6 pt-4 border-t border-white/10">
                            <div>
                                <p className="text-3xl font-bold text-white">6k+</p>
                                <p className="text-xs text-indigo-200 uppercase tracking-wider mt-1">Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Secure SSL Encryption</span>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: Clean Login Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
                <div className="w-full max-w-[420px] space-y-8">
                    
                    {/* Header */}
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden inline-flex p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome to Nexus</h2>
                        <p className="text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="p-1 bg-red-100 rounded-full shrink-0">
                                <ShieldCheck className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-red-900">Authentication Failed</h4>
                                <p className="text-sm text-red-600 mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {/* Username Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                Username / Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 
                                             focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none 
                                             transition-all duration-200 ease-in-out hover:border-slate-300"
                                    placeholder="e.g. O170001"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 
                                             focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none 
                                             transition-all duration-200 ease-in-out hover:border-slate-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Extra Options */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        className="peer h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" 
                                    />
                                </div>
                                <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2 transition-all">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                                w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg shadow-indigo-500/20
                                flex items-center justify-center gap-2
                                transition-all duration-300 ease-out
                                ${isLoading 
                                    ? 'bg-indigo-400 cursor-not-allowed transform-none' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
                                }
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="pt-6 text-center text-sm text-slate-400">
                        <p>© {new Date().getFullYear()} Nexus College Management. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import { useAuth, getDefaultRoute } from '../routes/AuthContext'; // UNCOMMENT IN YOUR PROJECT
// import { User, Lock, ArrowRight, Eye, EyeOff, Zap, ShieldCheck, Cpu, Wifi } from 'lucide-react';

// // --- MOCK DATA (FOR PREVIEW PURPOSES ONLY) ---
// const useAuth = () => {
//     return {
//         setAuth: (data) => console.log("Auth Context Updated:", data),
//     };
// };

// const getDefaultRoute = (role) => {
//     switch(role) {
//         case 'student': return '/student/dashboard';
//         case 'faculty': return '/faculty/dashboard';
//         default: return '/dashboard';
//     }
// };
// // ---------------------------------------------

// const LoginPage = () => {
//     // --- State Management ---
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [focusedField, setFocusedField] = useState(null);

//     const { setAuth } = useAuth();
//     const navigate = useNavigate();

//     // --- Logic (Preserved) ---
//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError('');
//         setIsLoading(true);

//         try {
//             await new Promise(resolve => setTimeout(resolve, 1500));
            
//             const data = { 
//                 access: "dummy_access_token", 
//                 refresh: "dummy_refresh_token", 
//                 role: "student",
//                 user: { name: "Test User" }
//             };

//             localStorage.setItem('access', data.access);
//             localStorage.setItem('refresh', data.refresh);
//             const userRole = data.role ? data.role.toLowerCase() : null;
//             setAuth({
//                 isAuthenticated: true,
//                 role: userRole,
//                 user: { username: username, ...data.user },
//                 loading: false,
//             });
//             const targetRoute = getDefaultRoute(userRole);
//             navigate(targetRoute);

//         } catch (err) {
//             console.error(err);
//             setError(err.message || 'Connection failed. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen w-full flex items-center justify-center bg-black text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">
            
//             {/* --- HYPER-REALISTIC BACKGROUND --- */}
//             <div className="absolute inset-0 z-0">
//                 {/* 1. Deep Space Base */}
//                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black" />
                
//                 {/* 2. Moving Perspective Grid (The "Floor") */}
//                 <div 
//                     className="absolute inset-0 opacity-20"
//                     style={{
//                         backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px),
//                                           linear-gradient(to bottom, #06b6d4 1px, transparent 1px)`,
//                         backgroundSize: '40px 40px',
//                         transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
//                         transformOrigin: 'top center',
//                         maskImage: 'linear-gradient(to bottom, transparent, black)'
//                     }}
//                 />

//                 {/* 3. Ambient Neon Glows */}
//                 <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
//                 <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />

//                 {/* 4. Scanning Lasers */}
//                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                     <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-[scan_4s_ease-in-out_infinite]" />
//                     <div className="absolute top-0 left-20 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
//                     <div className="absolute top-0 right-20 h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
//                 </div>
//             </div>

//             {/* --- MAIN INTERFACE (HUD STYLE) --- */}
//             <div className="relative z-10 w-full max-w-6xl p-4 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
                
//                 {/* LEFT SIDE: Holographic Info Panel (Hidden on small mobile) */}
//                 <div className="hidden md:flex flex-col items-start space-y-6 max-w-lg">
//                     <div className="flex items-center gap-2 text-cyan-400 mb-2 animate-fade-in">
//                         <Cpu className="w-5 h-5 animate-pulse" />
//                         <span className="text-xs font-mono tracking-[0.2em]">SYSTEM_ONLINE</span>
//                     </div>
                    
//                     <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
//                         NEXUS
//                     </h1>
                    
//                     <div className="h-px w-32 bg-gradient-to-r from-cyan-500 to-transparent" />
                    
//                     <div className="space-y-1">
//                         <p className="text-2xl font-light text-cyan-100 tracking-wide">
//                             RGUKT <span className="font-bold text-cyan-400">ONGOLE</span>
//                         </p>
//                         <p className="text-slate-400 text-sm max-w-sm leading-relaxed border-l-2 border-slate-700 pl-4 mt-4">
//                             Advanced academic management protocol initialized. 
//                             Secure access required for entry.
//                         </p>
//                     </div>

//                     {/* Stats HUD */}
//                     <div className="grid grid-cols-2 gap-4 w-full mt-4">
//                         <div className="bg-slate-900/50 border border-cyan-900/50 p-3 rounded clip-corner-br relative overflow-hidden group">
//                              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
//                              <p className="text-xs text-cyan-500 font-mono mb-1">LATENCY</p>
//                              <div className="flex items-baseline gap-1">
//                                 <span className="text-xl font-bold text-white">12</span>
//                                 <span className="text-xs text-slate-400">ms</span>
//                              </div>
//                              <Wifi className="absolute top-2 right-2 w-4 h-4 text-cyan-900 group-hover:text-cyan-500 transition-colors" />
//                         </div>
//                         <div className="bg-slate-900/50 border border-violet-900/50 p-3 rounded clip-corner-br relative overflow-hidden group">
//                              <div className="absolute inset-0 bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors" />
//                              <p className="text-xs text-violet-500 font-mono mb-1">SECURITY</p>
//                              <div className="flex items-baseline gap-1">
//                                 <span className="text-xl font-bold text-white">AES</span>
//                                 <span className="text-xs text-slate-400">256</span>
//                              </div>
//                              <ShieldCheck className="absolute top-2 right-2 w-4 h-4 text-violet-900 group-hover:text-violet-500 transition-colors" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* RIGHT SIDE: The Login "Core" */}
//                 <div className="w-full max-w-md relative group perspective-1000">
                    
//                     {/* Glowing Backlight Effect behind the card */}
//                     <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500 animate-tilt" />
                    
//                     {/* The Card Itself */}
//                     <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden">
                        
//                         {/* Decorative HUD Lines */}
//                         <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg" />
//                         <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 rounded-tr-lg" />
//                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-lg" />
//                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-lg" />
                        
//                         {/* Scan Line inside card */}
//                         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20 animate-[scan_3s_linear_infinite]" />

//                         <div className="flex items-center gap-3 mb-8">
//                             <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
//                                 <Zap className="w-6 h-6 text-cyan-400" />
//                             </div>
//                             <h2 className="text-2xl font-bold text-white tracking-tight">Identity Verification</h2>
//                         </div>

//                         {error && (
//                             <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-center gap-3 animate-shake">
//                                 <ShieldCheck className="w-5 h-5 text-red-400" />
//                                 <span className="text-sm text-red-200">{error}</span>
//                             </div>
//                         )}

//                         <form onSubmit={handleLogin} className="space-y-6">
                            
//                             {/* Username Input */}
//                             <div className="group/input relative">
//                                 <label className="text-xs font-mono text-cyan-500 mb-1.5 block uppercase tracking-wider ml-1">
//                                     User_ID
//                                 </label>
//                                 <div className="relative flex items-center">
//                                     <User className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'user' ? 'text-cyan-400' : 'text-slate-600'}`} />
//                                     <input 
//                                         type="text"
//                                         className={`w-full bg-slate-900/80 border text-white pl-12 pr-4 py-3.5 rounded-lg focus:outline-none transition-all duration-300 font-mono text-sm
//                                             ${focusedField === 'user' 
//                                                 ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
//                                                 : 'border-slate-700 hover:border-slate-600'
//                                             }`}
//                                         placeholder="ENTER ID..."
//                                         value={username}
//                                         onChange={(e) => setUsername(e.target.value)}
//                                         onFocus={() => setFocusedField('user')}
//                                         onBlur={() => setFocusedField(null)}
//                                     />
//                                     {/* Focus corner markers */}
//                                     {focusedField === 'user' && (
//                                         <>
//                                             <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
//                                             <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
//                                         </>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Password Input */}
//                             <div className="group/input relative">
//                                 <div className="flex justify-between items-center mb-1.5 ml-1">
//                                     <label className="text-xs font-mono text-cyan-500 uppercase tracking-wider">
//                                         Access_Key
//                                     </label>
//                                 </div>
//                                 <div className="relative flex items-center">
//                                     <Lock className={`absolute left-4 w-5 h-5 transition-colors ${focusedField === 'pass' ? 'text-cyan-400' : 'text-slate-600'}`} />
//                                     <input 
//                                         type={showPassword ? "text" : "password"}
//                                         className={`w-full bg-slate-900/80 border text-white pl-12 pr-12 py-3.5 rounded-lg focus:outline-none transition-all duration-300 font-mono text-sm tracking-widest
//                                             ${focusedField === 'pass' 
//                                                 ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
//                                                 : 'border-slate-700 hover:border-slate-600'
//                                             }`}
//                                         placeholder="••••••••"
//                                         value={password}
//                                         onChange={(e) => setPassword(e.target.value)}
//                                         onFocus={() => setFocusedField('pass')}
//                                         onBlur={() => setFocusedField(null)}
//                                     />
//                                     <button
//                                         type="button"
//                                         className="absolute right-4 text-slate-500 hover:text-cyan-400 transition-colors"
//                                         onClick={() => setShowPassword(!showPassword)}
//                                     >
//                                         {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                                     </button>
//                                      {/* Focus corner markers */}
//                                      {focusedField === 'pass' && (
//                                         <>
//                                             <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
//                                             <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />
//                                         </>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="pt-4">
//                                 <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     className={`
//                                         w-full relative overflow-hidden group bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200
//                                         ${isLoading ? 'opacity-70 cursor-wait' : 'hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02]'}
//                                     `}
//                                 >
//                                     {/* Scan effect on button hover */}
//                                     <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                    
//                                     <div className="flex items-center justify-center gap-3">
//                                         {isLoading ? (
//                                             <>
//                                                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                                                 <span className="font-mono tracking-widest text-sm">AUTHENTICATING...</span>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <span className="font-mono tracking-widest text-lg">INITIALIZE_SESSION</span>
//                                                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                                             </>
//                                         )}
//                                     </div>
//                                 </button>
//                             </div>

//                         </form>
                        
//                         <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-xs font-mono text-slate-500">
//                             <span>V 2.0.4 - STABLE</span>
//                             <a href="#" className="hover:text-cyan-400 transition-colors">HELP_CENTER</a>
//                         </div>

//                     </div>
//                 </div>
//             </div>

//             {/* Custom Animations for Tailwind */}
//             <style>{`
//                 @keyframes scan {
//                     0%, 100% { transform: translateY(0); opacity: 0; }
//                     50% { opacity: 1; }
//                     100% { transform: translateY(100vh); opacity: 0; }
//                 }
//                 .clip-corner-br {
//                     clip-path: polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%);
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default LoginPage;