import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaSave, FaLock, FaGlobe } from 'react-icons/fa';

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    title: '',
    metaDescription: '',
    keywords: '',
    email: '',
    phone: '',
    whatsapp: '',
    resumeUrl: '',
    copyrightText: ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setSettings({
            title: res.data.title || '',
            metaDescription: res.data.metaDescription || '',
            keywords: res.data.keywords || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            whatsapp: res.data.whatsapp || '',
            resumeUrl: res.data.resumeUrl || '',
            copyrightText: res.data.copyrightText || ''
          });
        }
      } catch (err) {
        console.error('Failed to load portfolio configurations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setLoading(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSaveSuccess('Success! Your changes have been permanently saved to the database and are now live on the website.');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPassError('New passwords do not match');
    }

    try {
      const res = await api.changePassword(passwordData.oldPassword, passwordData.newPassword);
      if (res.success) {
        setPassSuccess('Admin password updated successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPassSuccess(''), 3000);
      }
    } catch (err) {
      setPassError(err.message || 'Password update failed');
    }
  };

  if (loading && settings.title === '') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white">CMS Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure global SEO keywords, contact details, and credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: General Settings Form */}
        <div className="lg:col-span-8 glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            <FaGlobe className="text-primary-blue" /> Website Settings & SEO
          </h3>

          {saveSuccess && (
            <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
              {saveSuccess}
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-5">
            {/* Website Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website SEO Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={settings.title}
                onChange={handleSettingsChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Meta Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="metaDescription" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SEO Meta Description</label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows="3"
                value={settings.metaDescription}
                onChange={handleSettingsChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-none"
              />
            </div>

            {/* Keywords */}
            <div className="flex flex-col gap-2">
              <label htmlFor="keywords" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SEO Meta Keywords (comma separated)</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={settings.keywords}
                onChange={handleSettingsChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={settings.email}
                  onChange={handleSettingsChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={settings.phone}
                  onChange={handleSettingsChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
            </div>

            {/* WhatsApp Link & Resume PDF URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="whatsapp" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">WhatsApp Link</label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={settings.whatsapp}
                  onChange={handleSettingsChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="resumeUrl" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resume PDF Path</label>
                <input
                  type="text"
                  id="resumeUrl"
                  name="resumeUrl"
                  value={settings.resumeUrl}
                  onChange={handleSettingsChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
            </div>

            {/* Footer Copyright Text */}
            <div className="flex flex-col gap-2">
              <label htmlFor="copyrightText" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Footer Copyright Text</label>
              <input
                type="text"
                id="copyrightText"
                name="copyrightText"
                value={settings.copyrightText}
                onChange={handleSettingsChange}
                required
                placeholder="e.g. © 2026 Tauhid Shekhar. All Rights Reserved."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <FaSave /> Save Configurations
            </button>
          </form>
        </div>

        {/* Right: Security & Password Change */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            <FaLock className="text-primary-purple" /> Credentials Security
          </h3>

          {passSuccess && (
            <div className="p-4 mb-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
              {passSuccess}
            </div>
          )}

          {passError && (
            <div className="p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {passError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {/* Old Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="oldPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minlength="6"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary-purple hover:bg-[#722ce3] text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-purple/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <FaLock /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
