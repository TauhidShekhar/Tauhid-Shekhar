import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { FaUserShield, FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, FaArrowLeft, FaUserPlus } from 'react-icons/fa';

const Auth = () => {
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes('register') ? 'register' : 'login';
  const redirectPath = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated) {
      if (user?.role === 'Admin') {
        navigate(redirectPath);
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, redirectPath]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await login(loginIdentifier, loginPassword, rememberMe);
      if (res.success) {
        if (res.user.role === 'Admin') {
          navigate(redirectPath);
        } else {
          navigate('/user/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
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

    setLoading(true);
    try {
      const payload = {
        fullName: regFullName,
        email: regEmail,
        username: regEmail.split('@')[0], // generate fallback username
        password: regPassword,
        confirmPassword: regConfirmPassword
      };
      
      const res = await api.register(payload);
      if (res.success) {
        setSuccess(res.message || 'Registration successful! Verification link sent to email.');
        // Reset registration fields
        setRegFullName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        // Toggle back to login tab
        setTimeout(() => {
          navigate('/admin/login');
          setSuccess('');
        }, 5000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-blue/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary-purple/10 blur-[100px] pointer-events-none" />

      <div className="glass p-8 md:p-10 rounded-[30px] border border-slate-200/60 dark:border-white/5 shadow-xl w-full max-w-[440px] relative z-10 text-left">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-blue transition-colors mb-6">
          <FaArrowLeft /> Back to Website
        </Link>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-white/5 mb-6 select-none">
          <button
            onClick={() => {
              navigate('/admin/login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-3 text-center text-sm font-black font-title tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'login'
                ? 'text-primary-blue border-primary-blue'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              navigate('/admin/register');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 pb-3 text-center text-sm font-black font-title tracking-wider border-b-2 cursor-pointer transition-colors ${
              activeTab === 'register'
                ? 'text-primary-blue border-primary-blue'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold leading-relaxed">
            {success}
          </div>
        )}

        {activeTab === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loginIdentifier" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email or Username</label>
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
                  placeholder="Enter email or username"
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="loginPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/admin/forgot-password" className="text-xs font-bold text-primary-blue hover:text-accent-blue transition-colors">
                  Forgot Password?
                </Link>
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
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 cursor-pointer"
                >
                  {showLoginPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue/30 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                Remember my session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="regFullName" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
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
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regEmail" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
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
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="regPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
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
                    className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="regConfirmPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm</label>
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
                    className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
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
                className="w-3.5 h-3.5 rounded border-slate-300 text-primary-blue focus:ring-primary-blue/30 cursor-pointer"
              />
              <label htmlFor="showRegPass" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                Show passwords
              </label>
            </div>

            <PasswordStrength password={regPassword} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Register'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
