import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaSave, FaLock, FaGlobe } from 'react-icons/fa';

const DEFAULT_LEGAL = `1. Disclaimer
The information, software, and services provided on this website are on an "as is" and "as available" basis without any warranties of any kind. While we strive to present accurate and updated information, we do not guarantee the completeness, accuracy, or availability of the site contents or related tools.

2. Intellectual Property Rights
All visual designs, custom code, layouts, graphics, and portfolio assets displayed on this site are the exclusive property of Tauhid Shekhar unless explicitly stated otherwise. No part of this website may be reproduced, modified, distributed, or sold without express prior written consent from the site owner.

3. Limitation of Liability
Under no circumstances shall the website owners, developers, or contributors be held liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the site tools, including but not limited to the AI resume builder, community systems, or consulting features.

4. Third-Party Integrations
This portal incorporates API integrations (including AI generation engines, file parsers, and external payment hubs). By utilizing these features, you acknowledge and agree that your inputs are subject to the terms and privacy regulations of those respective third-party service providers.

5. Applicable Law
These legal disclosures and any disputes arising from the usage of this platform shall be governed by, and construed in accordance with, the laws applicable in the region of operation, without regard to conflict of law principles.`;

const DEFAULT_TERMS = `1. Agreement to Terms
By accessing our website, community forums, or specialized tools, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these rules, you must discontinue accessing the platform immediately.

2. User Accounts & Registration
To utilize certain features (like posting in groups, messaging, code submissions, or store checkouts), you must register an account. You agree to provide accurate, current, and complete registration information, and to safeguard your login details. You are solely responsible for all activities occurring under your credentials.

3. Code of Conduct
You agree to use this platform in accordance with applicable laws and community guidelines. Prohibited activities include posting abusive or toxic material, spreading malicious code, attempting unauthorized system access, spamming other users, or using automated scripts (bots, scrapers) without explicit permission.

4. User-Generated Content
You retain ownership of any text, code, templates, or files that you upload to the community feed, discussion groups, or resume hub. However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to host, display, and distribute it for the purposes of platform operations.

5. Account Suspension & Termination
We reserve the right, without liability or prior notice, to suspend, throttle, or terminate your user account if we determine that you have violated these terms, engaged in fraudulent activities, or disrupted the community experience for other members.`;

const DEFAULT_PRIVACY = `1. Information We Collect
We collect information that you directly provide when registering, building a resume, sending messages, or creating posts. This includes your name, email address, password hash, bio details, and profile photos. Additionally, we automatically collect basic system telemetry (IP address, browser type, device information) to secure sessions and optimize layout sizing.

2. How We Use Your Data
Your data is solely used to authenticate your session, maintain database consistency for your saved resume drafts and orders, present notifications, verify security access levels, and run the automated coding and resume analysis engines. We do not sell or trade your data with external brokers under any circumstances.

3. Cookies & Session Storage
We use secure, HttpOnly session cookies for user authentication and authorization (e.g. access and refresh tokens). We also use Local Storage to store temporary draft states (such as active edits in the resume builder) to prevent data loss upon unexpected page reloads. You can disable cookies in your browser settings, but it will impact your ability to log in.

4. Data Protection & Security
We apply advanced cryptographic hashing algorithms (bcrypt salt 12) for account credentials. Security controls are configured on all backend API routes, and access/refresh tokens are rotated dynamically to block token hijack attempts. While we deploy multiple defensive layers, no online system is completely immune to risks, so we urge you to use strong passwords.

5. Data Access and Deletion Rights
You retain complete control over your personal profile data. You can inspect, edit, or remove your profile information directly from your Account Dashboard. If you wish to delete your account and all associated community posts, please get in touch with our system support at shekhartauhid@gmail.com.`;

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    title: '',
    metaDescription: '',
    keywords: '',
    email: '',
    phone: '',
    whatsapp: '',
    resumeUrl: '',
    copyrightText: '',
    legalContent: '',
    termsContent: '',
    privacyContent: ''
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
            copyrightText: res.data.copyrightText || '',
            legalContent: res.data.legalContent || DEFAULT_LEGAL,
            termsContent: res.data.termsContent || DEFAULT_TERMS,
            privacyContent: res.data.privacyContent || DEFAULT_PRIVACY
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

            {/* Legal / Policy Updates Section */}
            <div className="border-t border-slate-200 dark:border-white/5 pt-6 mt-4 flex flex-col gap-5">
              <h4 className="text-sm font-black font-title uppercase tracking-widest text-slate-400">Compliance & Legal Policies</h4>
              
              {/* Legal Disclaimer */}
              <div className="flex flex-col gap-2">
                <label htmlFor="legalContent" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-title">Legal Disclaimer & Notice</label>
                <textarea
                  id="legalContent"
                  name="legalContent"
                  rows="6"
                  value={settings.legalContent}
                  onChange={handleSettingsChange}
                  placeholder="Enter custom Legal disclaimer content here... (Leave blank to use website template defaults)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-y"
                />
              </div>

              {/* Terms of Service */}
              <div className="flex flex-col gap-2">
                <label htmlFor="termsContent" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-title">Terms of Service</label>
                <textarea
                  id="termsContent"
                  name="termsContent"
                  rows="6"
                  value={settings.termsContent}
                  onChange={handleSettingsChange}
                  placeholder="Enter custom Terms of Service here... (Leave blank to use website template defaults)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-y"
                />
              </div>

              {/* Privacy Policy */}
              <div className="flex flex-col gap-2">
                <label htmlFor="privacyContent" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-title">Privacy Policy</label>
                <textarea
                  id="privacyContent"
                  name="privacyContent"
                  rows="6"
                  value={settings.privacyContent}
                  onChange={handleSettingsChange}
                  placeholder="Enter custom Privacy Policy here... (Leave blank to use website template defaults)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-y"
                />
              </div>
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
