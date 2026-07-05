import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileContract, FaRegHandshake } from 'react-icons/fa';
import { api } from '../services/api';

const Terms = () => {
  const navigate = useNavigate();
  const [termsContent, setTermsContent] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const loadSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data?.termsContent) {
          setTermsContent(res.data.termsContent);
        }
      } catch (err) {
        console.error('Failed to load terms content:', err.message);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 py-20 px-6 transition-colors duration-350 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-purple/10 dark:bg-primary-purple/5 rounded-full blur-[120px] pointer-events-none" />
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
          <div className="p-4 bg-primary-purple/10 dark:bg-primary-purple/5 text-primary-purple rounded-2xl border border-primary-purple/20">
            <FaFileContract size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-title tracking-tight text-black dark:text-white">Terms of Service</h1>
            <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">Rules, agreements, and code of conduct for users of our MERN ecosystem.</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="glass p-8 md:p-12 rounded-[28px] border border-slate-200/60 dark:border-white/5 shadow-md text-left leading-relaxed text-sm md:text-base">
          {termsContent ? (
            <div className="whitespace-pre-wrap text-slate-650 dark:text-slate-350">
              {termsContent}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-primary-purple rounded-full" /> 1. Agreement to Terms
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  By accessing our website, community forums, or specialized tools, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these rules, you must discontinue accessing the platform immediately.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-primary-blue rounded-full" /> 2. User Accounts & Registration
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  To utilize certain features (like posting in groups, messaging, code submissions, or store checkouts), you must register an account. You agree to provide accurate, current, and complete registration information, and to safeguard your login details. You are solely responsible for all activities occurring under your credentials.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full" /> 3. Code of Conduct
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  You agree to use this platform in accordance with applicable laws and community guidelines. Prohibited activities include posting abusive or toxic material, spreading malicious code, attempting unauthorized system access, spamming other users, or using automated scripts (bots, scrapers) without explicit permission.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full" /> 4. User-Generated Content
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  You retain ownership of any text, code, templates, or files that you upload to the community feed, discussion groups, or resume hub. However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to host, display, and distribute it for the purposes of platform operations.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-yellow-500 rounded-full" /> 5. Account Suspension & Termination
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  We reserve the right, without liability or prior notice, to suspend, throttle, or terminate your user account if we determine that you have violated these terms, engaged in fraudulent activities, or disrupted the community experience for other members.
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-white/5 pt-6 mt-8 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Last Updated: July 2026</span>
            <span className="flex items-center gap-1.5 text-primary-purple">
              <FaRegHandshake size={12} /> Respect & Integrity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
