import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { 
  FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, 
  FaArrowLeft, FaGoogle, FaGithub, FaExclamationCircle, 
  FaCheckCircle, FaTimes, FaSun, FaMoon, FaInfoCircle 
} from 'react-icons/fa';
import { useUsernameValidator } from '../hooks/useUsernameValidator';

const getSafeRedirect = (target, role) => {
  if (!target || typeof target !== 'string') {
    return role === 'Admin' ? '/admin/dashboard' : '/user/dashboard';
  }
  const trimmed = target.trim();
  // Strictly prevent open redirect vulnerabilities
  if (trimmed.startsWith('//') || trimmed.includes('://')) {
    return role === 'Admin' ? '/admin/dashboard' : '/user/dashboard';
  }
  if (!trimmed.startsWith('/')) {
    return role === 'Admin' ? '/admin/dashboard' : '/user/dashboard';
  }
  // Enforce server-role isolation: non-admins cannot redirect into admin routes
  if (role !== 'Admin' && trimmed.startsWith('/admin')) {
    return '/user/dashboard';
  }
  return trimmed;
};

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
  const [oauthNotice, setOauthNotice] = useState('');
  const [oauthStatus, setOauthStatus] = useState({ google: false, github: false, loaded: false });

  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes('register') ? 'register' : 'login';
  const redirectPath = location.state?.from?.pathname || '';

  const queryParams = new URLSearchParams(location.search);
  const externalRedirect = queryParams.get('redirect');

  // Load backend OAuth status to verify actual provider configuration
  useEffect(() => {
    let isMounted = true;
    const fetchOAuthStatus = async () => {
      try {
        const res = await api.getOAuthStatus();
        if (isMounted && res && res.providers) {
          setOauthStatus({
            google: !!res.providers.google,
            github: !!res.providers.github,
            loaded: true
          });
        }
      } catch (_) {
        if (isMounted) {
          setOauthStatus({ google: false, github: false, loaded: true });
        }
      }
    };
    fetchOAuthStatus();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const errorParam = queryParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [location.search]);

  // If already authenticated, redirect safely based on server-verified role
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      const destination = getSafeRedirect(externalRedirect || redirectPath, user.role);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate, redirectPath, externalRedirect, isLoading]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate clicks
    setError('');
    setSuccess('');
    setOauthNotice('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier.trim(), loginPassword, rememberMe);
      if (res && res.success) {
        setSuccess('Authentication successful! Redirecting...');
        const userRole = res.user?.role || 'User';
        const destination = getSafeRedirect(externalRedirect || redirectPath, userRole);
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 300);
      }
    } catch (err) {
      // Preserve login identifier on error for easy retry without exposing password
      setError(err.message || 'Invalid username/email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');
    setOauthNotice('');

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
        setSuccess('Registration successful! Redirecting to sign in...');
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

  const handleOAuthClick = (provider) => {
    setOauthNotice('');
    const isConfigured = provider === 'google' ? oauthStatus.google : oauthStatus.github;
    const providerName = provider === 'google' ? 'Google' : 'GitHub';

    if (!isConfigured) {
      setOauthNotice(`${providerName} Sign-In requires Client ID & Secret configured in backend .env. Please sign in with Email or Username.`);
      return;
    }

    const apiBase = import.meta.env.VITE_API_URL || (window.location.port === '5173' || window.location.port === '5174' ? 'http://localhost:5000/api' : 'https://tauhid-shekhar-portfolio.onrender.com/api');
    window.location.href = `${apiBase}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] flex flex-col items-center justify-center p-3 sm:p-6 relative z-20 text-slate-800 dark:text-slate-100 font-['Inter'] transition-colors duration-200 overflow-x-hidden overflow-y-auto">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#C2272D]/5 dark:bg-[#C2272D]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-[440px] my-auto bg-white dark:bg-[#111114] p-5 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-black/70 relative z-10 text-left transition-colors duration-200">
        
        {/* Top Controls: Back Link, Global Theme Toggle & Close Button */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-cyan-400 transition-colors py-1"
          >
            <FaArrowLeft size={10} />
            <span>Back to Website</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C2272D]/30"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FaSun className="text-amber-400 text-sm" />
              ) : (
                <FaMoon className="text-slate-600 text-xs" />
              )}
            </button>

            {/* Close Icon Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C2272D]/30"
              title="Close and return to website"
              aria-label="Close"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <img 
            src="/assits/ts-logo-red.jpg" 
            alt="Tauhid Shekhar Logo" 
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#C2272D]/30 shadow-md shadow-[#C2272D]/15 mb-2.5" 
          />
          <h1 className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white tracking-tight">
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs font-medium">
            {activeTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Join our platform and connect with the community'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mb-5 select-none">
          <button
            type="button"
            onClick={() => {
              navigate('/login');
              setError('');
              setSuccess('');
              setOauthNotice('');
            }}
            className={`flex-1 pb-2.5 text-center text-xs font-bold font-['Manrope'] tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === 'login'
                ? 'text-[#C2272D] dark:text-[#ff4d54] border-[#C2272D] dark:border-[#ff4d54]'
                : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
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
              setOauthNotice('');
            }}
            className={`flex-1 pb-2.5 text-center text-xs font-bold font-['Manrope'] tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
              activeTab === 'register'
                ? 'text-[#C2272D] dark:text-[#ff4d54] border-[#C2272D] dark:border-[#ff4d54]'
                : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaExclamationCircle className="shrink-0 text-sm mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaCheckCircle className="shrink-0 text-sm mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* OAuth Notice Alert */}
        {oauthNotice && (
          <div className="p-3 mb-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-cyan-800 dark:text-cyan-300 text-xs font-medium flex items-start gap-2 leading-relaxed">
            <FaInfoCircle className="shrink-0 text-sm mt-0.5 text-cyan-600 dark:text-cyan-400" />
            <span>{oauthNotice}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label htmlFor="loginIdentifier" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaUser size={12} />
                </span>
                <input
                  type="text"
                  id="loginIdentifier"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="username or email address"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 focus:ring-1 focus:ring-[#C2272D]/20 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center flex-wrap gap-1">
                <label htmlFor="loginPassword" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <Link to="/recover-account" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-cyan-400 transition-colors">
                    Recover
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-[#C2272D] dark:text-[#ff4d54] hover:underline transition-colors">
                    Forgot?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaLock size={12} />
                </span>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  id="loginPassword"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 focus:ring-1 focus:ring-[#C2272D]/20 text-xs font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1 min-w-[28px] min-h-[28px] flex items-center justify-center"
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
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#C2272D] focus:ring-[#C2272D]/30 cursor-pointer accent-[#C2272D]"
              />
              <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Remember my session on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C2272D]/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60 active:scale-[0.99]"
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
          /* REGISTER FORM - COMPACT & CLEAN RESPONSIVE DESIGN */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="regFullName" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaUser size={11} />
                </span>
                <input
                  type="text"
                  id="regFullName"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="regUsername" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FaUser size={11} />
                  </span>
                  <input
                    type="text"
                    id="regUsername"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="e.g. username"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none text-xs font-medium transition-all ${
                      regUsername && usernameError 
                        ? 'border-red-500' 
                        : regUsername && isUsernameValid 
                        ? 'border-emerald-500' 
                        : 'border-slate-200 dark:border-white/10 focus:border-[#C2272D] dark:focus:border-cyan-400'
                    }`}
                  />
                </div>
                {regUsername && (
                  <div className="text-[9px] font-medium leading-tight mt-0.5 px-0.5">
                    {isCheckingUsername && <span className="text-slate-400 dark:text-slate-500">Checking...</span>}
                    {!isCheckingUsername && usernameError && <span className="text-red-500">{usernameError}</span>}
                    {!isCheckingUsername && !usernameError && isUsernameValid && <span className="text-emerald-500 font-semibold">Available!</span>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="regEmail" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FaEnvelope size={11} />
                  </span>
                  <input
                    type="email"
                    id="regEmail"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="mail@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor="regPassword" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FaLock size={11} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regPassword"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="regConfirmPassword" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Confirm
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FaLock size={11} />
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regConfirmPassword"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Retype password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-medium transition-all"
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
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-[#C2272D] focus:ring-[#C2272D]/30 cursor-pointer accent-[#C2272D]"
              />
              <label htmlFor="showRegPass" className="text-[11px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                Show passwords
              </label>
            </div>

            <PasswordStrength password={regPassword} />

            <button
              type="submit"
              disabled={loading || !isUsernameValid || isCheckingUsername}
              className="w-full py-2.5 bg-[#C2272D] hover:bg-[#A51E23] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-[#C2272D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 active:scale-[0.99]"
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
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Or Continue With
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
        </div>

        {/* Social Actions Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuthClick('google')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm transition-all cursor-pointer relative group ${
              oauthStatus.loaded && !oauthStatus.google ? 'opacity-85' : ''
            }`}
            title={oauthStatus.loaded && !oauthStatus.google ? "Google Sign-In configuration required in backend environment" : "Sign in with Google"}
          >
            <FaGoogle className="text-red-500 text-xs" />
            <span>Google</span>
            {oauthStatus.loaded && !oauthStatus.google && (
              <span className="hidden sm:inline text-[9px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">
                (Setup Req)
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleOAuthClick('github')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm transition-all cursor-pointer relative group ${
              oauthStatus.loaded && !oauthStatus.github ? 'opacity-85' : ''
            }`}
            title={oauthStatus.loaded && !oauthStatus.github ? "GitHub Sign-In configuration required in backend environment" : "Sign in with GitHub"}
          >
            <FaGithub className="text-slate-800 dark:text-slate-200 text-xs" />
            <span>GitHub</span>
            {oauthStatus.loaded && !oauthStatus.github && (
              <span className="hidden sm:inline text-[9px] font-normal text-slate-400 dark:text-slate-500 ml-0.5">
                (Setup Req)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
