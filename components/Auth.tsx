import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, TrendingUp, Globe, Coins, CheckCircle2, Shield, Key, AlertCircle, ChevronLeft, Server, Square, Building2, Briefcase, MailCheck, Smartphone } from 'lucide-react';
import { MOCK_USERS_DB } from '../constants';

interface AuthProps {
  onLogin: (email: string, name: string, isCorporate?: boolean, companyDetails?: any, emailVerified?: boolean) => void;
  onAdminLogin?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCorporate, setIsCorporate] = useState(false);
  const [authStep, setAuthStep] = useState<'FORM' | 'EMAIL_VERIFY' | '2FA_VERIFY'>('FORM');

  // User Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Corporate Fields
  const [companyName, setCompanyName] = useState('');
  const [rcNumber, setRcNumber] = useState('');

  // Verification Codes
  const [emailCode, setEmailCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Password Strength State
  const [passStrength, setPassStrength] = useState(0);
  const [passCriteria, setPassCriteria] = useState({ length: false, number: false, special: false, upper: false });

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Password Strength Logic (ISO 27001 Requirement)
  useEffect(() => {
    if (isLogin || isAdminMode) return;
    
    const criteria = {
       length: password.length >= 8,
       number: /\d/.test(password),
       special: /[!@#$%^&*]/.test(password),
       upper: /[A-Z]/.test(password)
    };
    setPassCriteria(criteria);
    
    const strength = Object.values(criteria).filter(Boolean).length;
    setPassStrength(strength); // 0 to 4
  }, [password, isLogin, isAdminMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');

    // --- LOGIN FLOW ---
    if (isLogin) {
      setLoading(true);
      
      // Simulate Backend Lookup
      setTimeout(() => {
         // Find user in mock db
         const user = MOCK_USERS_DB.find(u => u.email === email);
         
         // Mock Credential Check
         if (email && password) {
            // In real app, verify hash. Here we proceed.
            if (user && user.settings.twoFactorEnabled) {
               setLoading(false);
               setAuthStep('2FA_VERIFY');
               return;
            }

            // Normal Login (Simulated User or New User in Mock)
            onLogin(
               email, 
               user ? user.name : (name || email.split('@')[0]), 
               isCorporate,
               isCorporate ? { rcNumber } : undefined,
               user ? user.emailVerified : true
            );
            setLoading(false);
         } else {
            setLoading(false);
            setError('Invalid credentials');
         }
      }, 1000);
      return;
    }

    // --- SIGNUP FLOW ---
    
    // Compliance Check
    if (!agreedToTerms) {
       setError('You must agree to the Terms of Service.');
       return;
    }

    if (passStrength < 4) {
       setError('Password does not meet complexity requirements.');
       return;
    }

    setLoading(true);
    
    // Step 1: Simulate SMTP Email Send
    setTimeout(() => {
      setLoading(false);
      setAuthStep('EMAIL_VERIFY');
      setNotification(`Verification code sent to ${email}`);
    }, 1500);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
     e.preventDefault();
     if (emailCode.length !== 6) {
        setError('Invalid verification code');
        return;
     }
     
     setLoading(true);
     setTimeout(() => {
        setLoading(false);
        onLogin(
           email, 
           isCorporate ? companyName : name, 
           isCorporate,
           isCorporate ? { rcNumber } : undefined,
           true // Verified
        );
     }, 1000);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
     e.preventDefault();
     if (twoFactorCode.length !== 6) {
        setError('Invalid 2FA code');
        return;
     }

     setLoading(true);
     setTimeout(() => {
        const user = MOCK_USERS_DB.find(u => u.email === email);
        setLoading(false);
        onLogin(
           email,
           user ? user.name : (name || email.split('@')[0]),
           isCorporate,
           isCorporate ? { rcNumber } : undefined,
           true
        );
     }, 1000);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate Secure Auth Check
    setTimeout(() => {
      // HARDCODED CREDENTIALS FOR DEMO
      if (adminEmail === 'admin@klastech.pro' && adminPass === 'admin123' && adminKey === 'master') {
        onAdminLogin?.();
      } else {
        setError('Invalid Admin Credentials or Master Key');
        setLoading(false);
      }
    }, 1500);
  };

  const toggleAdminMode = (enable: boolean) => {
    setIsAdminMode(enable);
    setIsCorporate(false); // Reset corporate if admin
    setError('');
    setAuthStep('FORM');
    if (enable) {
      setAdminEmail('');
      setAdminPass('');
      setAdminKey('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const getThemeColor = () => {
     if (isAdminMode) return 'rose';
     if (isCorporate) return 'cyan'; // Corporate Theme
     return 'indigo'; // Retail Theme
  };

  const theme = getThemeColor();

  return (
    <div className="min-h-screen flex bg-[#0f172a] font-inter transition-colors duration-500">
      
      {/* LEFT PANEL - HERO / LANDING */}
      <div className={`hidden lg:flex w-1/2 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-slate-950' : 'bg-slate-900'}`}>
        
        {/* Background Effects */}
        <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] pointer-events-none transition-all duration-500 ${
           isAdminMode ? 'from-rose-900/20 via-slate-950 to-slate-950' : 
           isCorporate ? 'from-cyan-900/20 via-slate-900 to-slate-900' : 
           'from-indigo-900/20 via-slate-900 to-slate-900'
        }`}></div>
        <div className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
           isAdminMode ? 'bg-rose-500/10' : 
           isCorporate ? 'bg-cyan-500/10' : 
           'bg-emerald-500/10'
        }`}></div>
        
        {/* Header */}
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-8">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transition-all duration-500 ${
                 isAdminMode ? 'bg-gradient-to-br from-rose-600 to-slate-600' : 
                 isCorporate ? 'bg-gradient-to-br from-cyan-600 to-slate-600' :
                 'bg-gradient-to-br from-indigo-500 to-emerald-500'
              }`}>
                {isAdminMode ? <Shield size={24} /> : isCorporate ? <Building2 size={24} /> : 'K'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Klastech {isAdminMode ? 'Admin' : isCorporate ? 'Corporate' : ''}</h1>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors duration-500 ${
                   isAdminMode ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 
                   isCorporate ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' :
                   'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                }`}>
                  {isAdminMode ? 'Restricted Access' : isCorporate ? 'Merchant Account' : 'Enterprise'}
                </span>
              </div>
           </div>
           
           <h2 className="text-5xl font-bold text-white leading-tight mb-6">
             {isAdminMode ? (
                <>
                   System Control <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-slate-200">
                     Center
                   </span>
                </>
             ) : isCorporate ? (
                <>
                   Global Treasury <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-slate-200">
                     Management
                   </span>
                </>
             ) : (
                <>
                   The Financial OS for <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                     African Growth
                   </span>
                </>
             )}
           </h2>
           <p className="text-lg text-slate-400 max-w-md leading-relaxed">
             {isAdminMode 
               ? "Authorized personnel only. Monitor global transactions, resolve disputes, and manage user compliance from a centralized dashboard."
               : isCorporate 
               ? "Hedge against devaluation with USDC. Access deep liquidity, instant FX settlement, and global wire transfers for your business."
               : "Buy, Sell, Swap, and Earn on your crypto assets with bank-grade security and instant Naira settlement."
             }
           </p>
        </div>

        {/* Feature Grid (Changes based on mode) */}
        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
           {isAdminMode ? (
             <>
               <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
                  <div className="bg-rose-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                     <ShieldCheck className="text-rose-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-1">Audit Logging</h3>
                  <p className="text-xs text-slate-400">Immutable records of all system actions.</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
                  <div className="bg-slate-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                     <Server className="text-slate-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-1">Server Health</h3>
                  <p className="text-xs text-slate-400">Real-time infrastructure monitoring.</p>
               </div>
             </>
           ) : isCorporate ? (
             <>
               <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                     <TrendingUp className="text-cyan-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-1">Inflation Hedging</h3>
                  <p className="text-xs text-slate-400">Secure your treasury in USDC.</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                     <Globe className="text-cyan-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-1">Global Payouts</h3>
                  <p className="text-xs text-slate-400">Wire USD to suppliers globally.</p>
               </div>
             </>
           ) : (
             <>
               <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="bg-emerald-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                     <Coins className="text-emerald-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-1">ISO 27001 Compliant</h3>
                  <p className="text-xs text-slate-400">Bank-grade security architecture protecting your assets.</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <div className="bg-indigo-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                     <Globe className="text-indigo-400" size={20} />
                  </div>
                  <h3 className="text-white font-bold mb-1">Global Access</h3>
                  <p className="text-xs text-slate-400">Trade BTC, ETH, USDC, and USDT with zero boundaries.</p>
               </div>
             </>
           )}
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-12 flex items-center justify-between text-xs text-slate-500">
           <div className="flex gap-4">
             <span>© 2024 Klastech Financial.</span>
             <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
             <span>SOC 2 Type 2 Certified</span>
           </div>
           {onAdminLogin && !isAdminMode && (
             <button onClick={() => toggleAdminMode(true)} className="flex items-center gap-1 text-slate-600 hover:text-white transition-colors">
               <Shield size={10} /> Admin Portal
             </button>
           )}
           {isAdminMode && (
              <div className="flex items-center gap-2 text-rose-500">
                 <Lock size={10} /> Secure Connection
              </div>
           )}
        </div>
      </div>

      {/* RIGHT PANEL - AUTH FORM */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 relative transition-colors duration-500 ${isAdminMode ? 'bg-[#0f1115]' : ''}`}>
         {/* Mobile Background Elements */}
         <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl lg:hidden pointer-events-none ${
            isAdminMode ? 'bg-rose-600/10' : isCorporate ? 'bg-cyan-600/10' : 'bg-indigo-600/10'
         }`}></div>

        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
             <div className={`inline-flex items-center justify-center w-14 h-14 bg-slate-800 rounded-xl mb-4 border border-slate-700 shadow-inner`}>
               <span className={`text-2xl font-bold bg-clip-text text-transparent ${
                  isAdminMode ? 'bg-gradient-to-br from-rose-400 to-slate-400' : 
                  isCorporate ? 'bg-gradient-to-br from-cyan-400 to-slate-400' :
                  'bg-gradient-to-br from-indigo-400 to-emerald-400'
               }`}>K</span>
             </div>
             <h1 className="text-2xl font-bold text-white">{isAdminMode ? 'Admin Access' : isCorporate ? 'Corporate Login' : 'Welcome to Klastech'}</h1>
          </div>

          <div className="bg-slate-900 lg:bg-transparent lg:border-none border border-slate-800 rounded-2xl p-8 lg:p-0 shadow-2xl lg:shadow-none">
             
             {/* Back Button for Admin Mode */}
             {isAdminMode && (
                <button 
                  onClick={() => toggleAdminMode(false)}
                  className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 text-sm font-bold transition-colors"
                >
                   <ChevronLeft size={16} /> Back to User Login
                </button>
             )}

             <div className="mb-6">
               <h2 className="text-2xl font-bold text-white mb-2">
                 {isAdminMode ? 'Authenticate Session' : (
                    authStep === 'EMAIL_VERIFY' ? 'Verify Email' : 
                    authStep === '2FA_VERIFY' ? 'Security Challenge' :
                    isLogin ? 'Sign In to Dashboard' : 'Create Account'
                 )}
               </h2>
               <p className="text-slate-400 text-sm">
                 {isAdminMode 
                   ? 'Please enter your administrative credentials and master key.' 
                   : (
                      authStep === 'EMAIL_VERIFY' ? 'We sent a verification code to your email.' :
                      authStep === '2FA_VERIFY' ? 'Enter the code from Google Authenticator.' :
                      isLogin ? 'Welcome back! Please enter your details.' : 'Join thousands of Nigerian businesses and individuals.'
                   )}
               </p>
             </div>

             {/* Account Type Toggle (If not admin) */}
             {!isAdminMode && authStep === 'FORM' && (
               <div className="bg-slate-800 p-1 rounded-xl flex mb-6 border border-slate-700">
                  <button 
                     type="button"
                     onClick={() => setIsCorporate(false)}
                     className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isCorporate ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                     Personal
                  </button>
                  <button 
                     type="button"
                     onClick={() => setIsCorporate(true)}
                     className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isCorporate ? 'bg-cyan-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                     Corporate
                  </button>
               </div>
             )}

            {/* ERROR NOTIFICATIONS */}
            {notification && (
                <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm font-bold animate-fade-in">
                   <MailCheck size={16} /> {notification}
                </div>
            )}
            {error && (
                <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm font-bold animate-pulse">
                   <AlertCircle size={16} /> {error}
                </div>
            )}


            {/* --- ADMIN FORM --- */}
            {isAdminMode ? (
               <form onSubmit={handleAdminSubmit} className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Admin Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 focus:bg-slate-900 transition-all placeholder-slate-700"
                        placeholder="admin@klastech.pro"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 focus:bg-slate-900 transition-all placeholder-slate-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-400 ml-1 uppercase flex items-center gap-1">
                       <Key size={10} /> Master Key
                    </label>
                    <div className="relative group">
                      <Shield className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-rose-400 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full bg-slate-950 border border-rose-900/50 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-rose-500 focus:bg-slate-900 transition-all placeholder-slate-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 mt-4 transform active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Access Dashboard
                      </>
                    )}
                  </button>
               </form>
            ) : (
               /* --- USER / CORPORATE FORMS --- */
               <>
                  {/* Step 1: Login/Signup Form */}
                  {authStep === 'FORM' && (
                     <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                       {!isLogin && (
                         <>
                           {isCorporate ? (
                              <>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Organization Name</label>
                                    <div className="relative group">
                                       <Building2 className={`absolute left-3 top-3.5 text-slate-500 group-focus-within:text-${theme}-400 transition-colors`} size={18} />
                                       <input
                                          type="text"
                                          required
                                          value={companyName}
                                          onChange={(e) => setCompanyName(e.target.value)}
                                          className={`w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-${theme}-500 focus:bg-slate-800/80 transition-all placeholder-slate-600`}
                                          placeholder="Lagos Logistics Ltd"
                                       />
                                    </div>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">RC Number / TIN</label>
                                    <div className="relative group">
                                       <Briefcase className={`absolute left-3 top-3.5 text-slate-500 group-focus-within:text-${theme}-400 transition-colors`} size={18} />
                                       <input
                                          type="text"
                                          required
                                          value={rcNumber}
                                          onChange={(e) => setRcNumber(e.target.value)}
                                          className={`w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-${theme}-500 focus:bg-slate-800/80 transition-all placeholder-slate-600`}
                                          placeholder="RC1234567"
                                       />
                                    </div>
                                 </div>
                              </>
                           ) : (
                              <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Full Name</label>
                                 <div className="relative group">
                                    <User className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                       type="text"
                                       required
                                       value={name}
                                       onChange={(e) => setName(e.target.value)}
                                       className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all placeholder-slate-600"
                                       placeholder="John Doe"
                                    />
                                 </div>
                              </div>
                           )}
                         </>
                       )}
         
                       <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Email Address</label>
                         <div className="relative group">
                           <Mail className={`absolute left-3 top-3.5 text-slate-500 group-focus-within:text-${theme}-400 transition-colors`} size={18} />
                           <input
                             type="email"
                             required
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             className={`w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-${theme}-500 focus:bg-slate-800/80 transition-all placeholder-slate-600`}
                             placeholder={isCorporate ? "finance@company.com" : "name@example.com"}
                           />
                         </div>
                       </div>
         
                       <div className="space-y-1.5">
                         <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Password</label>
                         <div className="relative group">
                           <Lock className={`absolute left-3 top-3.5 text-slate-500 group-focus-within:text-${theme}-400 transition-colors`} size={18} />
                           <input
                             type="password"
                             required
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             className={`w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-${theme}-500 focus:bg-slate-800/80 transition-all placeholder-slate-600`}
                             placeholder="••••••••"
                           />
                         </div>
                         
                         {/* PASSWORD STRENGTH METER (ISO 27001) */}
                         {!isLogin && password && (
                            <div className="pt-2 space-y-2 animate-fade-in">
                              <div className="flex gap-1 h-1">
                                 {[1,2,3,4].map(step => (
                                    <div key={step} className={`flex-1 rounded-full transition-colors ${passStrength >= step ? (passStrength === 4 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-700'}`}></div>
                                 ))}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500">
                                 <span className={passCriteria.length ? 'text-emerald-400' : ''}>• 8+ Characters</span>
                                 <span className={passCriteria.number ? 'text-emerald-400' : ''}>• Number</span>
                                 <span className={passCriteria.upper ? 'text-emerald-400' : ''}>• Uppercase</span>
                                 <span className={passCriteria.special ? 'text-emerald-400' : ''}>• Symbol (!@#)</span>
                              </div>
                            </div>
                         )}
                       </div>
      
                       {!isLogin && (
                          <div 
                            className="flex items-start gap-3 cursor-pointer group"
                            onClick={() => setAgreedToTerms(!agreedToTerms)}
                          >
                            <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors ${agreedToTerms ? `bg-${theme}-600 border-${theme}-600` : 'border-slate-600 group-hover:border-slate-500'}`}>
                               {agreedToTerms && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed select-none">
                               I agree to the <span className={`text-${theme}-400 hover:underline`}>Terms of Service</span> and <span className={`text-${theme}-400 hover:underline`}>Privacy Policy</span>. I understand my data is processed in accordance with ISO 27001 standards.
                            </p>
                          </div>
                       )}
         
                       <button
                         type="submit"
                         disabled={loading}
                         className={`w-full bg-gradient-to-r hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 transform active:scale-[0.98] ${
                            isCorporate 
                            ? 'from-cyan-600 to-slate-700 shadow-cyan-500/25' 
                            : 'from-indigo-600 to-emerald-600 shadow-indigo-500/25'
                         }`}
                       >
                         {loading ? (
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         ) : (
                           <>
                             {isLogin ? 'Sign In' : isCorporate ? 'Create Merchant Account' : 'Get Started'}
                             <ArrowRight size={18} />
                           </>
                         )}
                       </button>
                     </form>
                  )}
                  
                  {/* Step 2: Email Verification (For Signup) */}
                  {authStep === 'EMAIL_VERIFY' && (
                     <form onSubmit={handleVerifyEmail} className="space-y-6 animate-slide-in">
                        <div className="text-center">
                           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 animate-pulse">
                              <MailCheck size={32} />
                           </div>
                           <p className="text-slate-400 text-sm">Enter the 6-digit code sent to your email.</p>
                        </div>
                        <input
                           type="text"
                           value={emailCode}
                           maxLength={6}
                           onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                           className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-indigo-500"
                           placeholder="000000"
                           autoFocus
                        />
                        <button
                           type="submit"
                           disabled={loading || emailCode.length !== 6}
                           className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                           {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Verify Email'}
                        </button>
                        <button type="button" onClick={() => setAuthStep('FORM')} className="w-full text-slate-500 hover:text-white text-xs">Cancel</button>
                     </form>
                  )}

                  {/* Step 3: 2FA Challenge (For Login) */}
                  {authStep === '2FA_VERIFY' && (
                     <form onSubmit={handleVerify2FA} className="space-y-6 animate-slide-in">
                        <div className="text-center">
                           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                              <Smartphone size={32} />
                           </div>
                           <p className="text-slate-400 text-sm">Enter the code from Google Authenticator.</p>
                        </div>
                        <input
                           type="text"
                           value={twoFactorCode}
                           maxLength={6}
                           onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                           className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-emerald-500"
                           placeholder="000000"
                           autoFocus
                        />
                        <button
                           type="submit"
                           disabled={loading || twoFactorCode.length !== 6}
                           className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                           {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Verify 2FA'}
                        </button>
                        <button type="button" onClick={() => setAuthStep('FORM')} className="w-full text-slate-500 hover:text-white text-xs">Back to Login</button>
                     </form>
                  )}
               </>
            )}

            {!isAdminMode && authStep === 'FORM' && (
               <>
                  <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                      {isLogin ? "New to Klastech?" : "Already have an account?"}
                      <button
                        onClick={() => { setIsLogin(!isLogin); setAgreedToTerms(false); setError(''); }}
                        className={`ml-2 text-${theme}-400 hover:text-${theme}-300 font-bold`}
                      >
                        {isLogin ? 'Create Account' : 'Log In'}
                      </button>
                    </p>
                  </div>
                  
                  {isLogin && (
                     <div className="mt-6 flex justify-center items-center gap-4 text-[10px] text-slate-600 uppercase font-bold tracking-widest">
                        <span>PCI-DSS Compliant</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span>AES-256 Encryption</span>
                     </div>
                  )}
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};