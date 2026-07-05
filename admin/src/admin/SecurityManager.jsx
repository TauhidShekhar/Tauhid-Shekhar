import React, { useState } from 'react';
import { api } from '../services/api';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { FaShieldAlt, FaSave } from 'react-icons/fa';

const SecurityManager = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword, confirmPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Account Security</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Change credentials and secure your backend sessions.</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm max-w-[500px]">
        <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
          <FaShieldAlt className="text-primary-blue" /> Update Password
        </h3>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <PasswordStrength password={newPassword} />

          <button
            type="submit"
            disabled={loading}
            className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaSave /> Update password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityManager;
