import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { FaLock, FaEnvelope, FaUser, FaKey, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const RecoverAccount = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
    ? import.meta.env.VITE_CLIENT_URL
    : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.com');

  const [step, setStep] = useState(1); // 1 = Search, 2 = Verify OTP & Reset
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.recoverAccount(identifier);
      if (res.success) {
        setIsLocked(res.isLocked || false);
        setSuccess(res.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to locate user account.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      return setError('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      return setError('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      return setError('Password must contain at least one number.');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return setError('Password must contain at least one special character.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await api.verifyRecoveryOtp(identifier, otp, password, confirmPassword);
      if (res.success) {
        setSuccess(res.message || 'Account recovered successfully!');
        setStep(3); // success screen
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Check your OTP and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-blue/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-primary-purple/10 blur-[100px] pointer-events-none" />

      <div className="glass p-8 md:p-10 rounded-[30px] border border-slate-200/60 dark:border-white/5 shadow-xl w-full max-w-[420px] relative z-10 text-left">
        
        {/* Back Links */}
        {step !== 3 && (
          <div className="flex justify-between items-center mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-blue transition-colors">
              <FaArrowLeft /> Back to login
            </Link>
            <a href={clientUrl} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-blue transition-colors">
              Back to Website
            </a>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary-purple/10 flex items-center justify-center mx-auto mb-4 border border-primary-purple/20">
            <FaUser className="text-primary-purple" size={24} />
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight text-black dark:text-white">Recover Access</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Verification & Unlock</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed flex items-start gap-2.5">
            <FaExclamationTriangle className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Search Form */}
        {step === 1 && (
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="identifier" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email or Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaEnvelope size={14} />
                </span>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="e.g. mail@example.com or username"
                  className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Find My Account'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP and Reset Form */}
        {step === 2 && (
          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-4">
            {success && (
              <div className="p-3 mb-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold leading-relaxed">
                {success}
              </div>
            )}

            {/* OTP */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">OTP Code (6 Digits)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaKey size={12} />
                </span>
                <input
                  type="text"
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors tracking-[0.25em] text-center font-bold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaLock size={12} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 chars, 1 upper, 1 number, 1 special"
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <FaLock size={12} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Retype password"
                  className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
                />
              </div>
            </div>

            {/* Show Password Toggle */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="showPass"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-primary-blue focus:ring-primary-blue/30 cursor-pointer"
              />
              <label htmlFor="showPass" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                Show passwords
              </label>
            </div>

            <PasswordStrength password={password} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Recover Account'
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success State */}
        {step === 3 && (
          <div className="p-6 text-center flex flex-col items-center gap-4">
            <FaCheckCircle className="text-green-500 animate-bounce" size={48} />
            <h4 className="text-lg font-bold font-title text-black dark:text-white">Access Restored</h4>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{success}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse mt-2">Redirecting to login...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecoverAccount;
