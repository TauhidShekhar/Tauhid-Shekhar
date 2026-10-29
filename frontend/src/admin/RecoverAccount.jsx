import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { 
  FaLock, FaEnvelope, FaUser, FaKey, FaArrowLeft, 
  FaCheckCircle, FaExclamationCircle, FaSun, FaMoon, FaEye, FaEyeSlash 
} from 'react-icons/fa';

const RecoverAccount = () => {
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState(1); // 1 = Search, 2 = Verify OTP & Reset, 3 = Success
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
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.recoverAccount(identifier.trim());
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
    if (loading) return;
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
      const res = await api.verifyRecoveryOtp(identifier.trim(), otp.trim(), password, confirmPassword);
      if (res.success) {
        setSuccess(res.message || 'Account recovered successfully!');
        setStep(3);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Check your OTP and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] flex flex-col items-center justify-center p-3 sm:p-6 relative z-20 text-slate-800 dark:text-slate-100 font-['Inter'] transition-colors duration-200 overflow-x-hidden overflow-y-auto">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#C2272D]/5 dark:bg-[#C2272D]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] my-auto bg-white dark:bg-[#111114] p-5 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-black/70 relative z-10 text-left transition-colors duration-200">
        
        {/* Top Controls */}
        {step !== 3 && (
          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-cyan-400 transition-colors py-1"
            >
              <FaArrowLeft size={10} /> Back to Sign In
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {isDark ? <FaSun className="text-amber-400 text-sm" /> : <FaMoon className="text-slate-600 text-xs" />}
              </button>
              <Link 
                to="/" 
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-cyan-400 transition-colors"
              >
                Website
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#C2272D]/10 dark:bg-[#C2272D]/20 flex items-center justify-center mx-auto mb-3 border border-[#C2272D]/20">
            <FaUser className="text-[#C2272D] dark:text-[#ff4d54]" size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Manrope'] tracking-tight text-slate-900 dark:text-white">Recover Access</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {step === 1 
              ? 'Find your account to unlock and recover access.'
              : step === 2 
              ? (isLocked ? 'Account is locked. Enter the OTP sent to your email to verify and unlock.' : 'Enter the OTP sent to your email and set your new password.')
              : 'Your account access has been restored!'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaExclamationCircle className="shrink-0 text-sm mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Search Form */}
        {step === 1 && (
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="identifier" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaEnvelope size={12} />
                </span>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  placeholder="name@example.com or username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 focus:ring-1 focus:ring-[#C2272D]/20 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C2272D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                'Find My Account'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP and Reset Form */}
        {step === 2 && (
          <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-3">
            {success && (
              <div className="p-3 mb-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-cyan-800 dark:text-cyan-300 text-xs font-medium leading-relaxed">
                {success}
              </div>
            )}

            {/* OTP */}
            <div className="flex flex-col gap-1">
              <label htmlFor="otp" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                OTP Code (6 Digits)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaKey size={12} />
                </span>
                <input
                  type="text"
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="123456"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-bold tracking-[0.2em] text-center transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaLock size={12} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 chars, 1 upper, 1 special"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaLock size={12} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Retype new password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#18181c] focus:outline-none focus:border-[#C2272D] dark:focus:border-cyan-400 text-xs font-medium transition-all"
                />
              </div>
            </div>

            <PasswordStrength password={password} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C2272D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-60 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying & Resetting...</span>
                </>
              ) : (
                'Recover Account'
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success State */}
        {step === 3 && (
          <div className="p-6 text-center flex flex-col items-center gap-3">
            <FaCheckCircle className="text-emerald-500 text-5xl" />
            <h4 className="text-lg font-bold font-['Manrope'] text-slate-900 dark:text-white">Access Restored!</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{success}</p>
            <p className="text-[11px] text-[#C2272D] dark:text-cyan-400 font-bold uppercase tracking-wider animate-pulse mt-1">
              Redirecting to sign in...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RecoverAccount;
