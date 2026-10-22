import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import tsLogoRed from '../assets/ts-logo-red.jpg';
import tsLogo2 from '../assets/logo2.png';
import { 
  FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, 
  FaArrowLeft, FaGoogle, FaGithub, FaExclamationCircle, FaCheckCircle, FaTimes
} from 'react-icons/fa';
import { useUsernameValidator } from '../hooks/useUsernameValidator';

const Auth = () => {
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
      setError(err.message || 'Invalid username/email or password. Please try again.');
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative z-20 text-slate-800 font-['Inter'] select-none">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C2272D]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/80 w-full max-w-[430px] relative z-10 text-left">
        
        {/* Top Controls: Back Link & Close Button */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#C2272D] transition-colors"
          >
            <FaArrowLeft size={10} />
            <span>Back to Website</span>
          </Link>

          {/* Close Icon Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close and return to website"
            aria-label="Close"
          >
            <FaTimes size={12} />
          </button>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-200 dark:border-white/10 p-0.5 flex items-center justify-center shadow-md shadow-[#C2272D]/15 mb-2.5 overflow-hidden">
            <img 
              src={tsLogoRed} 
              alt="Tauhid Shekhar Logo" 
              className="w-full h-full object-cover rounded-[14px]" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = tsLogo2;
              }}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 tracking-tight">
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
            {activeTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Join our platform and connect with the community'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-5 select-none">
          <button
            type="button"
            onClick={() => {
              navigate('/login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-2.5 text-center text-xs font-bold font-['Manrope'] tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === 'login'
                ? 'text-[#C2272D] border-[#C2272D]'
                : 'text-slate-400 border-transparent hover:text-slate-600'
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
            className={`flex-1 pb-2.5 text-center text-xs font-bold font-['Manrope'] tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === 'register'
                ? 'text-[#C2272D] border-[#C2272D]'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaExclamationCircle className="shrink-0 text-sm mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaCheckCircle className="shrink-0 text-sm mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="loginIdentifier" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaUser size={12} />
                </span>
                <input
                  type="text"
                  id="loginIdentifier"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoFocus
                  placeholder="username or email address"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#C2272D] text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label htmlFor="loginPassword" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <Link to="/recover-account" className="text-[11px] font-semibold text-slate-500 hover:text-[#C2272D] transition-colors">
                    Recover
                  </Link>
                  <span className="text-slate-300 text-xs">|</span>
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-[#C2272D] hover:underline transition-colors">
                    Forgot?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaLock size={12} />
                </span>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="loginPassword"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#C2272D] text-xs font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
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
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#C2272D] focus:ring-[#C2272D]/30 cursor-pointer accent-[#C2272D]"
              />
              <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                Remember my session on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C2272D]/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM - COMPACT & CLEAN DESIGN */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="regFullName" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaUser size={11} />
                </span>
                <input
                  type="text"
                  id="regFullName"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#C2272D] text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="regUsername" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaUser size={11} />
                  </span>
                  <input
                    type="text"
                    id="regUsername"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    placeholder="e.g. username"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none text-xs font-medium transition-all ${
                      regUsername && usernameError ? 'border-red-500' : regUsername && isUsernameValid ? 'border-emerald-500' : 'border-slate-200 focus:border-[#C2272D]'
                    }`}
                  />
                </div>
                {regUsername && (
                  <div className="text-[9px] font-medium leading-tight mt-0.5 px-0.5">
                    {isCheckingUsername && <span className="text-slate-400">Checking...</span>}
                    {!isCheckingUsername && usernameError && <span className="text-red-500">{usernameError}</span>}
                    {!isCheckingUsername && !usernameError && isUsernameValid && <span className="text-emerald-500 font-semibold">Available!</span>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="regEmail" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaEnvelope size={11} />
                  </span>
                  <input
                    type="email"
                    id="regEmail"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="mail@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#C2272D] text-xs font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="regPassword" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaLock size={11} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regPassword"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#C2272D] text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="regConfirmPassword" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Confirm
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaLock size={11} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regConfirmPassword"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Retype password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#C2272D] text-xs font-medium transition-all"
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
              <label htmlFor="showRegPass" className="text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                Show passwords
              </label>
            </div>

            <PasswordStrength password={regPassword} />

            <button
              type="submit"
              disabled={loading || !isUsernameValid || isCheckingUsername}
              className="w-full py-2.5 bg-[#C2272D] hover:bg-[#A51E23] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-[#C2272D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex py-2.5 items-center select-none mt-1">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Or Continue With
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Social Actions Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              const apiBase = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' ? 'http://localhost:5000/api' : 'https://tauhid-shekhar-portfolio.onrender.com/api');
              window.location.href = `${apiBase}/auth/google`;
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <FaGoogle className="text-red-500 text-xs" />
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const apiBase = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' ? 'http://localhost:5000/api' : 'https://tauhid-shekhar-portfolio.onrender.com/api');
              window.location.href = `${apiBase}/auth/github`;
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <FaGithub className="text-slate-800 text-xs" />
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
