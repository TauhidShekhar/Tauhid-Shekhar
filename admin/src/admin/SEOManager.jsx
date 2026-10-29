import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaGlobe, FaSave, FaChartBar, FaRobot, FaUpload, FaImage } from 'react-icons/fa';

const SEOManager = () => {
  const [seo, setSeo] = useState({
    siteName: '',
    siteUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    author: '',
    ogTitle: '',
    ogDescription: '',
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    microsoftClarityId: '',
    facebookPixel: '',
    robotsTxt: '',
    schemaSettings: '{}',
    customHeadScripts: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // File states
  const [ogImageFile, setOgImageFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  
  // Previews
  const [ogImagePreview, setOgImagePreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

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
            author: res.data.author || '',
            ogTitle: res.data.ogTitle || '',
            ogDescription: res.data.ogDescription || '',
            googleAnalyticsId: res.data.googleAnalyticsId || '',
            googleSearchConsoleId: res.data.googleSearchConsoleId || '',
            microsoftClarityId: res.data.microsoftClarityId || '',
            facebookPixel: res.data.facebookPixel || '',
            robotsTxt: res.data.robotsTxt || '',
            schemaSettings: typeof res.data.schemaSettings === 'object' ? JSON.stringify(res.data.schemaSettings, null, 2) : res.data.schemaSettings || '{}',
            customHeadScripts: res.data.customHeadScripts || ''
          });
          
          if (res.data.ogImage?.url) setOgImagePreview(res.data.ogImage.url);
          if (res.data.favicon?.url) setFaviconPreview(res.data.favicon.url);
          if (res.data.logo?.url) setLogoPreview(res.data.logo.url);
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

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === 'ogImage') {
      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
    } else if (field === 'favicon') {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    } else if (field === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setLoading(true);

    // Validate JSON schema
    try {
      JSON.parse(seo.schemaSettings);
    } catch (err) {
      alert('Invalid JSON format in Schema Settings. Please verify syntax.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(seo).forEach(key => {
      data.append(key, seo[key]);
    });

    if (ogImageFile) data.append('ogImage', ogImageFile);
    if (faviconFile) data.append('favicon', faviconFile);
    if (logoFile) data.append('logo', logoFile);

    try {
      const res = await api.updateSEO(data);
      if (res.success) {
        setSaveSuccess('SEO settings and assets updated successfully!');
        if (res.data.ogImage?.url) setOgImagePreview(res.data.ogImage.url);
        if (res.data.favicon?.url) setFaviconPreview(res.data.favicon.url);
        if (res.data.logo?.url) setLogoPreview(res.data.logo.url);
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
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">SEO & Webmaster Console</h2>
        <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
          Configure page crawlers, brand image settings, tracking identifiers, and JSON-LD structured schemas.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold animate-pulse">
          {saveSuccess}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-8 text-xs">
        
        {/* SECTION 1: Meta Definitions */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm bg-white dark:bg-[#121217]">
          <h3 className="text-sm font-black font-title text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <FaGlobe className="text-primary-blue" /> Page Metadata & Site Identifiers
          </h3>
          
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Site Name / Brand</label>
                <input type="text" name="siteName" value={seo.siteName} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Website URL</label>
                <input type="url" name="siteUrl" value={seo.siteUrl} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Author Name</label>
                <input type="text" name="author" value={seo.author} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Default Meta Title</label>
              <input type="text" name="metaTitle" value={seo.metaTitle} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Default Meta Description</label>
              <textarea name="metaDescription" rows="3" value={seo.metaDescription} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Global Keywords (comma separated)</label>
              <input type="text" name="metaKeywords" value={seo.metaKeywords} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* SECTION 2: Brand Assets Upload */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm bg-white dark:bg-[#121217]">
          <h3 className="text-sm font-black font-title text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <FaImage className="text-primary-blue" /> Search Engine & OG Assets
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Favicon */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-white/5 text-center">
              <span className="font-bold text-slate-550 dark:text-slate-450 uppercase text-[10px]">Site Favicon (.ico/png)</span>
              <div className="w-12 h-12 mx-auto rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-center bg-white dark:bg-black overflow-hidden p-1">
                {faviconPreview ? <img src={faviconPreview} alt="Favicon Preview" className="object-contain w-full h-full" /> : <FaGlobe size={18} className="text-slate-400" />}
              </div>
              <label className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-all">
                <FaUpload /> Upload Favicon
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'favicon')} className="hidden" />
              </label>
            </div>

            {/* Logo */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-white/5 text-center">
              <span className="font-bold text-slate-550 dark:text-slate-450 uppercase text-[10px]">Site Brand Logo (.png)</span>
              <div className="w-12 h-12 mx-auto rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-center bg-white dark:bg-black overflow-hidden p-1">
                {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="object-contain w-full h-full" /> : <FaGlobe size={18} className="text-slate-400" />}
              </div>
              <label className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-all">
                <FaUpload /> Upload Logo
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
              </label>
            </div>

            {/* OG Image */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-white/5 text-center">
              <span className="font-bold text-slate-550 dark:text-slate-450 uppercase text-[10px]">Social OG Banner (1200x630)</span>
              <div className="w-24 h-12 mx-auto rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-center bg-white dark:bg-black overflow-hidden">
                {ogImagePreview ? <img src={ogImagePreview} alt="OG Preview" className="object-cover w-full h-full" /> : <FaImage size={18} className="text-slate-400" />}
              </div>
              <label className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer transition-all">
                <FaUpload /> Upload OG Image
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ogImage')} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: Tracking Configs */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm bg-white dark:bg-[#121217]">
          <h3 className="text-sm font-black font-title text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <FaChartBar className="text-primary-blue" /> Webmaster Verification & Trackers
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Google Analytics Tracking ID (G-XXXXXX)</label>
              <input type="text" name="googleAnalyticsId" value={seo.googleAnalyticsId} onChange={handleInputChange} placeholder="G-XXXXXXXXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Google Search Console Tag (content attribute)</label>
              <input type="text" name="googleSearchConsoleId" value={seo.googleSearchConsoleId} onChange={handleInputChange} placeholder="google-site-verification content string" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Microsoft Clarity Tracking Code</label>
              <input type="text" name="microsoftClarityId" value={seo.microsoftClarityId} onChange={handleInputChange} placeholder="Microsoft Clarity Project ID" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Facebook Pixel ID</label>
              <input type="text" name="facebookPixel" value={seo.facebookPixel} onChange={handleInputChange} placeholder="Facebook Pixel ID number" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* SECTION 4: Crawling & Structures */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm bg-white dark:bg-[#121217]">
          <h3 className="text-sm font-black font-title text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <FaRobot className="text-primary-blue" /> Crawling Guidelines & JSON-LD Schemas
          </h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Robots.txt Specifications</label>
                <a href={`${seo.siteUrl || 'https://tauhidshekhar.com'}/robots.txt`} target="_blank" rel="noreferrer" className="text-[10px] text-primary-blue font-bold hover:underline">View live robots.txt</a>
              </div>
              <textarea name="robotsTxt" rows="4" value={seo.robotsTxt} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono text-[11px]" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">JSON-LD Structured Data Schema Config</label>
                <a href={`${seo.siteUrl || 'https://tauhidshekhar.com'}/sitemap.xml`} target="_blank" rel="noreferrer" className="text-[10px] text-primary-blue font-bold hover:underline">View live sitemap.xml</a>
              </div>
              <textarea name="schemaSettings" rows="6" value={seo.schemaSettings} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono text-[11px]" />
              <span className="text-[10px] text-slate-450 mt-0.5">Please specify as stringified key-value configurations for the dynamic JSON-LD schema builder.</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-slate-550 dark:text-slate-450 uppercase">Custom Head Code Injector</label>
              <textarea name="customHeadScripts" rows="3" value={seo.customHeadScripts} onChange={handleInputChange} placeholder="<script>...</script> or meta tags" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono text-[11px]" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <FaSave /> Save SEO configurations
          </button>
        </div>
      </form>
    </div>
  );
};

export default SEOManager;
