import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaGlobe, FaSave } from 'react-icons/fa';

const SEOManager = () => {
  const [seo, setSeo] = useState({
    siteName: '',
    siteUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    robotsTxt: '',
    customHeadScripts: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');

  const [ogImageFile, setOgImageFile] = useState(null);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const res = await api.getSEO();
        if (res.success && res.data) {
          setSeo({
            siteName: res.data.siteName || '',
            siteUrl: res.data.siteUrl || '',
            metaTitle: res.data.metaTitle || '',
            metaDescription: res.data.metaDescription || '',
            metaKeywords: res.data.metaKeywords || '',
            ogTitle: res.data.ogTitle || '',
            ogDescription: res.data.ogDescription || '',
            googleAnalyticsId: res.data.googleAnalyticsId || '',
            googleSearchConsoleId: res.data.googleSearchConsoleId || '',
            robotsTxt: res.data.robotsTxt || '',
            customHeadScripts: res.data.customHeadScripts || ''
          });
        }
      } catch (err) {
        console.error('Failed to load SEO configs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSEO();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setOgImageFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setLoading(true);

    const data = new FormData();
    Object.keys(seo).forEach(key => {
      data.append(key, seo[key]);
    });

    if (ogImageFile) {
      data.append('ogImage', ogImageFile);
    }

    try {
      const res = await api.updateSEO(data);
      if (res.success) {
        setSaveSuccess('SEO Settings updated successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update SEO settings.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && seo.siteName === '') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">SEO & Social Meta</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure search index parameters, OpenGraph meta, and analytic tracker IDs.</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
          <FaGlobe className="text-primary-blue" /> Search Console & OG configurations
        </h3>

        {saveSuccess && (
          <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
            {saveSuccess}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Site Name</label>
              <input type="text" name="siteName" value={seo.siteName} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Site URL</label>
              <input type="url" name="siteUrl" value={seo.siteUrl} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Meta Title</label>
            <input type="text" name="metaTitle" value={seo.metaTitle} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Meta Description</label>
            <textarea name="metaDescription" rows="3" value={seo.metaDescription} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Meta Keywords (comma separated)</label>
            <input type="text" name="metaKeywords" value={seo.metaKeywords} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Google Analytics ID</label>
              <input type="text" name="googleAnalyticsId" value={seo.googleAnalyticsId} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Google Search Console ID</label>
              <input type="text" name="googleSearchConsoleId" value={seo.googleSearchConsoleId} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Robots.txt Content</label>
            <textarea name="robotsTxt" rows="3" value={seo.robotsTxt} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">OpenGraph Banner Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-slate-500" />
          </div>

          <button type="submit" className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2">
            <FaSave /> Save SEO configurations
          </button>
        </form>
      </div>
    </div>
  );
};

export default SEOManager;
