import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { 
  FaLock, FaEye, FaEyeSlash, FaArrowLeft, 
  FaCheckCircle, FaExclamationCircle, FaSun, FaMoon 
} from 'react-icons/fa';

const ResetPassword = () => {
  const { isDark, toggleTheme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Token verification states
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenErrorMessage, setTokenErrorMessage] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await api.verifyResetToken(token);
        if (res.success) {
          setTokenValid(true);
        }
      } catch (err) {
        setTokenValid(false);
        setTokenErrorMessage(err.message || 'Password reset link is invalid or has expired.');
      } finally {
        setVerifyingToken(false);
      }
    };

    if (token) {
      checkToken();
    } else {
      setVerifyingToken(false);
      setTokenValid(false);
      setTokenErrorMessage('No security reset token was provided.');
    }
  }, [token]);

  const handleReset = async (e) => {
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
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token, password, confirmPassword);
      if (res.success) {
        setSuccess(res.message || 'Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setError(err.message || 'Reset request failed');
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070709] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#111114] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl text-center">
          <div className="w-10 h-10 border-2 border-[#C2272D] dark:border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Verifying Link</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Checking reset token validity...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070709] flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#111114] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500 text-2xl font-bold mx-auto mb-4">✕</div>
          <h3 className="text-lg font-bold font-['Manrope'] text-slate-900 dark:text-white">Link Expired or Invalid</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{tokenErrorMessage}</p>
          <Link 
            to="/forgot-password" 
            className="inline-block py-3 px-6 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold uppercase tracking-wider mt-6 shadow-lg shadow-[#C2272D]/20 transition-all w-full text-center"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] flex flex-col items-center justify-center p-3 sm:p-6 relative z-20 text-slate-800 dark:text-slate-100 font-['Inter'] transition-colors duration-200 overflow-x-hidden overflow-y-auto">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#C2272D]/5 dark:bg-[#C2272D]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] my-auto bg-white dark:bg-[#111114] p-5 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-black/70 relative z-10 text-left transition-colors duration-200">
        
        {/* Top Controls */}
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

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#C2272D]/10 dark:bg-[#C2272D]/20 flex items-center justify-center mx-auto mb-3 border border-[#C2272D]/20">
            <FaLock className="text-[#C2272D] dark:text-[#ff4d54]" size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Manrope'] tracking-tight text-slate-900 dark:text-white">New Password</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Choose a strong, unique password to secure your account.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaExclamationCircle className="shrink-0 text-sm mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center flex flex-col items-center gap-3">
            <FaCheckCircle className="text-emerald-500 text-5xl" />
            <h4 className="text-lg font-bold font-['Manrope'] text-slate-900 dark:text-white">Password Updated!</h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{success}</p>
            <p className="text-[11px] text-[#C2272D] dark:text-cyan-400 font-bold uppercase tracking-wider animate-pulse mt-1">
              Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-3.5">
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
                  placeholder="Min 8 chars, 1 upper, 1 special, 1 number"
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
                  <span>Updating Password...</span>
                </>
              ) : (
                'Set New Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
