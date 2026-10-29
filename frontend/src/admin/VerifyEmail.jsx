import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { FaArrowLeft, FaSun, FaMoon, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const VerifyEmail = () => {
  const { isDark, toggleTheme } = useTheme();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    let isMounted = true;
    const doVerification = async () => {
      try {
        const res = await api.verifyEmail(token);
        if (isMounted) {
          if (res && res.success) {
            setStatus('success');
            setMessage(res.message || 'Email verified successfully! You can now sign in.');
          } else {
            setStatus('error');
            setMessage(res?.message || 'Verification link is invalid or expired.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'Verification link is invalid or expired.');
        }
      }
    };

    if (token) {
      doVerification();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
    return () => { isMounted = false; };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070709] flex flex-col items-center justify-center p-3 sm:p-6 relative z-20 text-slate-800 dark:text-slate-100 font-['Inter'] transition-colors duration-200 overflow-x-hidden overflow-y-auto">
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#C2272D]/5 dark:bg-[#C2272D]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] my-auto bg-white dark:bg-[#111114] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-black/70 relative z-10 text-center transition-colors duration-200">
        
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-cyan-400 transition-colors py-1"
          >
            <FaArrowLeft size={10} /> Back to Website
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <FaSun className="text-amber-400 text-sm" /> : <FaMoon className="text-slate-600 text-xs" />}
          </button>
        </div>
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-white/10 border-t-[#C2272D] dark:border-t-cyan-400 animate-spin" />
            <h3 className="text-lg font-bold font-['Manrope'] text-slate-900 dark:text-white">Verifying Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-500 text-3xl font-bold">
              <FaCheckCircle />
            </div>
            <h3 className="text-xl font-bold font-['Manrope'] text-slate-900 dark:text-white">Email Verified!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">{message}</p>
            <Link 
              to="/login" 
              className="w-full py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold uppercase tracking-wider mt-4 shadow-lg shadow-[#C2272D]/20 transition-all text-center"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500 text-3xl font-bold">
              <FaTimesCircle />
            </div>
            <h3 className="text-xl font-bold font-['Manrope'] text-slate-900 dark:text-white">Verification Failed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">{message}</p>
            <Link 
              to="/login" 
              className="w-full py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider mt-4 transition-all text-center"
            >
              Back to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
