import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { 
  FaUserShield, FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, 
  FaArrowLeft, FaGoogle, FaGithub, FaSun, FaMoon, FaExclamationCircle, FaCheckCircle
} from 'react-icons/fa';
import { useUsernameValidator } from '../hooks/useUsernameValidator';

const Auth = () => {
  const { isDark, toggleTheme } = useTheme();

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const {
    username: regUsername,
    setUsername: setRegUsername,
    error: usernameError,
    isValid: isUsernameValid,
    isChecking: isCheckingUsername
  } = useUsernameValidator('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes('register') ? 'register' : 'login';
  const redirectPath = location.state?.from?.pathname || '';

  const queryParams = new URLSearchParams(location.search);
  const externalRedirect = queryParams.get('redirect');

  useEffect(() => {
    const errorParam = queryParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [location.search]);

  // If already authenticated, redirect immediately based on role
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (externalRedirect) {
        window.location.href = externalRedirect;
      } else if (user?.role === 'Admin') {
        navigate(redirectPath && redirectPath.startsWith('/admin') ? redirectPath : '/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath, externalRedirect, isLoading]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier.trim(), loginPassword, rememberMe);
      if (res.success) {
        if (externalRedirect) {
          window.location.href = externalRedirect;
        } else if (res.user?.role === 'Admin') {
          navigate(redirectPath && redirectPath.startsWith('/admin') ? redirectPath : '/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email/username or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (regPassword !== regConfirmPassword) {
      return setError('Passwords do not match');
    }

    if (!isUsernameValid) {
      return setError(usernameError || 'Please choose a valid and unique username.');
    }

    setLoading(true);
    try {
      const payload = {
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        username: regUsername.trim(),
        password: regPassword,
        confirmPassword: regConfirmPassword
      };
      
      const res = await api.register(payload);
      if (res.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setRegFullName('');
        setRegEmail('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
        setTimeout(() => {
          navigate('/login');
          setSuccess('Account created! Please sign in with your credentials.');
        }, 1500);
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const errorMsg = err.errors.map(e => e.message).join(', ');
        setError(errorMsg);
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]/70 dark:bg-transparent flex items-center justify-center p-4 xs:p-6 sm:p-8 relative overflow-hidden select-none">
      
      {/* Subtle Background Glows matching TS Branding */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C2272D]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00FFFF]/10 blur-[120px] pointer-events-none" />

      <div className="glass p-5 xs:p-7 sm:p-9 md:p-10 rounded-[28px] border border-slate-200/80 dark:border-white/10 shadow-2xl w-full max-w-[460px] relative z-10 text-left bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-xl">
        
        {/* Top Controls: Back Link & Theme Toggle */}
        <div className="flex items-center justify-between mb-5">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
          >
            <FaArrowLeft size={11} />
            <span>Back to Website</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <FaSun size={13} className="text-amber-400" /> : <FaMoon size={13} className="text-[#C2272D]" />}
          </button>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img 
            src={isDark ? "/assits/ts-logo-dark.jpg" : "/assits/ts-logo-red.jpg"} 
            alt="Tauhid Shekhar Logo" 
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#C2272D]/40 dark:ring-[#00FFFF]/40 shadow-xl shadow-[#C2272D]/20 mb-3" 
          />
          <h1 className="text-xl sm:text-2xl font-bold font-title text-[#171717] dark:text-white tracking-tight">
            {activeTab === 'login' ? 'Admin & Creator Portal' : 'Join TS Community'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            {activeTab === 'login' 
              ? 'Sign in to access portfolio CMS, messages, and platform control' 
              : 'Create your developer account to join discussions and challenges'}
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mb-6 select-none">
          <button
            type="button"
            onClick={() => {
              navigate('/login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-3 text-center text-xs sm:text-sm font-bold font-title tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === 'login'
                ? 'text-[#C2272D] dark:text-[#00FFFF] border-[#C2272D] dark:border-[#00FFFF]'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-3 text-center text-xs sm:text-sm font-bold font-title tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === 'register'
                ? 'text-[#C2272D] dark:text-[#00FFFF] border-[#C2272D] dark:border-[#00FFFF]'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-[#ff6b6b] text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
            <FaExclamationCircle className="shrink-0 text-sm mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {success && (
          <div className="p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
            <FaCheckCircle className="shrink-0 text-sm mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loginIdentifier" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaUser size={13} />
                </span>
                <input
                  type="text"
                  id="loginIdentifier"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoFocus
                  placeholder="admin or mail@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-xs sm:text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="loginPassword" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <Link to="/recover-account" className="text-xs font-semibold text-slate-500 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors">
                    Recover
                  </Link>
                  <span className="text-slate-300 dark:text-white/10 text-xs">|</span>
                  <Link to="/forgot-password" className="text-xs font-semibold text-[#C2272D] dark:text-[#00FFFF] hover:underline transition-colors">
                    Forgot?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaLock size={13} />
                </span>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="loginPassword"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-xs sm:text-sm font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#C2272D] focus:ring-[#C2272D]/30 cursor-pointer accent-[#C2272D]"
              />
              <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Remember my session on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#C2272D]/25 hover:shadow-xl hover:shadow-[#C2272D]/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-2 btn-shine-effect disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="regFullName" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaUser size={12} />
                </span>
                <input
                  type="text"
                  id="regFullName"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  placeholder="e.g. Tauhid Shekhar"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-xs sm:text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regUsername" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaUser size={12} />
                </span>
                <input
                  type="text"
                  id="regUsername"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                  placeholder="e.g. tauhid_shekhar"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none text-xs sm:text-sm font-medium transition-all ${
                    regUsername && usernameError ? 'border-red-500 focus:border-red-500' : regUsername && isUsernameValid ? 'border-emerald-500 focus:border-emerald-500' : 'border-slate-200 dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF]'
                  }`}
                />
              </div>
              {regUsername && (
                <div className="text-[10px] font-medium leading-tight mt-0.5 px-1">
                  {isCheckingUsername && <span className="text-slate-400 animate-pulse">Checking availability...</span>}
                  {!isCheckingUsername && usernameError && <span className="text-red-500 font-semibold">{usernameError}</span>}
                  {!isCheckingUsername && !usernameError && isUsernameValid && <span className="text-emerald-500 font-semibold">Username available!</span>}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regEmail" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaEnvelope size={12} />
                </span>
                <input
                  type="email"
                  id="regEmail"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="e.g. mail@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-xs sm:text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="regPassword" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaLock size={12} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regPassword"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Min 6 chars"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-xs sm:text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="regConfirmPassword" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Confirm
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaLock size={12} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regConfirmPassword"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Retype password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-xs sm:text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Toggle show/hide passwords */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showRegPass"
                checked={showRegPassword}
                onChange={(e) => setShowRegPassword(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#C2272D] focus:ring-[#C2272D]/30 cursor-pointer accent-[#C2272D]"
              />
              <label htmlFor="showRegPass" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Show passwords
              </label>
            </div>

            <PasswordStrength password={regPassword} />

            <button
              type="submit"
              disabled={loading || !isUsernameValid || isCheckingUsername}
              className="w-full py-3.5 bg-[#C2272D] hover:bg-[#A51E23] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-[#C2272D]/25 hover:shadow-xl hover:shadow-[#C2272D]/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-2 btn-shine-effect"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex py-3 items-center select-none mt-2">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Or Continue With
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
        </div>

        {/* Social Actions Grid */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            onClick={() => {
              const apiBase = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' ? 'http://localhost:5000/api' : 'https://tauhid-shekhar-portfolio.onrender.com/api');
              window.location.href = `${apiBase}/auth/google`;
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <FaGoogle className="text-red-500 text-sm" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const apiBase = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' ? 'http://localhost:5000/api' : 'https://tauhid-shekhar-portfolio.onrender.com/api');
              window.location.href = `${apiBase}/auth/github`;
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <FaGithub className="text-slate-900 dark:text-white text-sm" />
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
