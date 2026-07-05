import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token, password, confirmPassword);
      if (res.success) {
        setSuccess(res.message || 'Password reset successfully!');
        setTimeout(() => {
          navigate('/admin/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Reset request failed');
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
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-blue transition-colors mb-6">
          <FaArrowLeft /> Back to Website
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary-blue/10 flex items-center justify-center mx-auto mb-4 border border-primary-blue/20">
            <FaLock className="text-primary-blue" size={24} />
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight text-black dark:text-white">New Password</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Set Account Access</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-500 text-xl font-bold">✓</div>
            <h4 className="text-lg font-bold font-title text-black dark:text-white">Password Updated</h4>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{success}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-pulse mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
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
                  placeholder="Min 6 characters"
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
            <div className="flex items-center gap-2">
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
