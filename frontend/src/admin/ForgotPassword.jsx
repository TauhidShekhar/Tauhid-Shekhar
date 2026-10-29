import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { FaLock, FaEnvelope, FaArrowLeft, FaSun, FaMoon, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ForgotPassword = () => {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      if (res.success) {
        setSuccess(res.message || 'If an account exists with this email, a reset link has been dispatched.');
      }
    } catch (err) {
      setError(err.message || 'Failed to request reset link.');
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
          <h2 className="text-xl sm:text-2xl font-black font-['Manrope'] tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Enter your account email and we'll send you a secure password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 leading-relaxed">
            <FaExclamationCircle className="shrink-0 text-sm mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex flex-col items-center gap-2 text-center leading-relaxed">
            <FaCheckCircle className="text-base text-emerald-500" />
            <span>{success}</span>
            <Link 
              to="/login" 
              className="mt-2 py-2 px-4 rounded-xl bg-[#C2272D] hover:bg-[#A51E23] text-white font-bold text-xs"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Account Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <FaEnvelope size={12} />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="name@example.com"
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
                  <span>Sending Link...</span>
                </>
              ) : (
                'Request Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
