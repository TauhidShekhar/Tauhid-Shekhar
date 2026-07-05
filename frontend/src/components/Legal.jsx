import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaGavel, FaShieldAlt } from 'react-icons/fa';
import { api } from '../services/api';

const Legal = () => {
  const navigate = useNavigate();
  const [legalContent, setLegalContent] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const loadSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data?.legalContent) {
          setLegalContent(res.data.legalContent);
        }
      } catch (err) {
        console.error('Failed to load legal content:', err.message);
      }
    };
    loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 py-20 px-6 transition-colors duration-350 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-blue/10 dark:bg-primary-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

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
          <div className="p-4 bg-primary-blue/10 dark:bg-primary-blue/5 text-primary-blue rounded-2xl border border-primary-blue/20">
            <FaGavel size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-title tracking-tight text-black dark:text-white">Legal Notice</h1>
            <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">General disclaimer, legal disclosures, and terms of website ownership.</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="glass p-8 md:p-12 rounded-[28px] border border-slate-200/60 dark:border-white/5 shadow-md text-left leading-relaxed text-sm md:text-base">
          {legalContent ? (
            <div className="whitespace-pre-wrap text-slate-650 dark:text-slate-350">
              {legalContent}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-primary-blue rounded-full" /> 1. Disclaimer
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  The information, software, and services provided on this website are on an "as is" and "as available" basis without any warranties of any kind. While we strive to present accurate and updated information, we do not guarantee the completeness, accuracy, or availability of the site contents or related tools.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-primary-purple rounded-full" /> 2. Intellectual Property Rights
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  All visual designs, custom code, layouts, graphics, and portfolio assets displayed on this site are the exclusive property of Tauhid Shekhar unless explicitly stated otherwise. No part of this website may be reproduced, modified, distributed, or sold without express prior written consent from the site owner.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-orange-500 rounded-full" /> 3. Limitation of Liability
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  Under no circumstances shall the website owners, developers, or contributors be held liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the site tools, including but not limited to the AI resume builder, community systems, or consulting features.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-green-500 rounded-full" /> 4. Third-Party Integrations
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  This portal incorporates API integrations (including AI generation engines, file parsers, and external payment hubs). By utilizing these features, you acknowledge and agree that your inputs are subject to the terms and privacy regulations of those respective third-party service providers.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold font-title text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-yellow-500 rounded-full" /> 5. Applicable Law
                </h2>
                <p className="text-slate-650 dark:text-slate-350">
                  These legal disclosures and any disputes arising from the usage of this platform shall be governed by, and construed in accordance with, the laws applicable in the region of operation, without regard to conflict of law principles.
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-white/5 pt-6 mt-8 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Last Updated: July 2026</span>
            <span className="flex items-center gap-1.5 text-primary-blue">
              <FaShieldAlt size={10} /> Fully Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
