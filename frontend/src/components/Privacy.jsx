import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaLock } from 'react-icons/fa';
import { api } from '../services/api';

const Privacy = () => {
  const navigate = useNavigate();
  const [privacyContent, setPrivacyContent] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const loadSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data?.privacyContent) {
          setPrivacyContent(res.data.privacyContent);
        }
      } catch (err) {
        console.error('Failed to load privacy content:', err.message);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-transparent text-slate-800 dark:text-slate-100 py-20 px-6 transition-colors duration-350 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-blue/10 dark:bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[900px] mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
        >
          <FaArrowLeft size={12} /> Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10 text-left">
          <div className="p-4 bg-green-500/10 dark:bg-green-500/5 text-green-500 rounded-2xl border border-green-500/20">
            <FaShieldAlt size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-title tracking-tight text-black dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">Our commitment to protecting your personal data, credentials, and digital footprint.</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="glass p-8 md:p-12 rounded-[28px] border border-slate-200/60 dark:border-white/5 shadow-md text-left leading-relaxed text-sm md:text-base">
          {privacyContent ? (
            <div className="whitespace-pre-wrap text-slate-650 dark:text-slate-350">
              {privacyContent}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full" /> 1. Information We Collect
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  We collect information that you directly provide when registering, building a resume, sending messages, or creating posts. This includes your name, email address, password hash, bio details, and profile photos. Additionally, we automatically collect basic system telemetry (IP address, browser type, device information) to secure sessions and optimize layout sizing.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-primary-blue rounded-full" /> 2. How We Use Your Data
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  Your data is solely used to authenticate your session, maintain database consistency for your saved resume drafts and orders, present notifications, verify security access levels, and run the automated coding and resume analysis engines. We do not sell or trade your data with external brokers under any circumstances.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-primary-purple rounded-full" /> 3. Cookies & Session Storage
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  We use secure, HttpOnly session cookies for user authentication and authorization (e.g. access and refresh tokens). We also use Local Storage to store temporary draft states (such as active edits in the resume builder) to prevent data loss upon unexpected page reloads. You can disable cookies in your browser settings, but it will impact your ability to log in.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full" /> 4. Data Protection & Security
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  We apply advanced cryptographic hashing algorithms (bcrypt salt 12) for account credentials. Security controls are configured on all backend API routes, and access/refresh tokens are rotated dynamically to block token hijack attempts. While we deploy multiple defensive layers, no online system is completely immune to risks, so we urge you to use strong passwords.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-yellow-500 rounded-full" /> 5. Data Access and Deletion Rights
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  You retain complete control over your personal profile data. You can inspect, edit, or remove your profile information directly from your Account Dashboard. If you wish to delete your account and all associated community posts, please get in touch with our system support at shekhartauhid@gmail.com.
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-white/5 pt-6 mt-8 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Last Updated: July 2026</span>
            <span className="flex items-center gap-1.5 text-green-500">
              <FaLock size={10} /> Data Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
