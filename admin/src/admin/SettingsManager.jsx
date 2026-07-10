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

const extractIframeSrc = (input) => {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
};

const SettingsManager = () => {
  const [settings, setSettings] = useState({
    title: '',
    siteName: '',
    siteTagline: '',
    metaDescription: '',
    keywords: '',
    email: '',
    phone: '',
    whatsapp: '',
    resumeUrl: '',
    copyrightText: '',
    legalContent: '',
    termsContent: '',
    privacyContent: '',
    mapEmbed: '',
    workingHours: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      youtube: '',
      facebook: ''
    },
    contactFormFields: [],
    locations: [],
    maintenanceMode: false,
    websiteStatus: { enabled: true },
    announcementBanner: { show: false, text: '', link: '' },
    cookieSettings: { show: true, text: 'We use cookies to improve your user experience.' },
    customFooterScripts: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [heroBackgroundFile, setHeroBackgroundFile] = useState(null);

  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [heroBackgroundPreview, setHeroBackgroundPreview] = useState('');

  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    optionsInput: ''
  });
  const [editingFieldId, setEditingFieldId] = useState(null);

  // Map Locations state
  const [newLocation, setNewLocation] = useState({
    title: '',
    address: '',
    mapEmbed: '',
    workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
    email: '',
    phone: '',
  });
  const [editingLocationId, setEditingLocationId] = useState(null);
  
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
            siteName: res.data.siteName || '',
            siteTagline: res.data.siteTagline || '',
            metaDescription: res.data.metaDescription || '',
            keywords: res.data.keywords || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            whatsapp: res.data.whatsapp || '',
            resumeUrl: res.data.resumeUrl || '',
            copyrightText: res.data.copyrightText || '',
            legalContent: res.data.legalContent || DEFAULT_LEGAL,
            termsContent: res.data.termsContent || DEFAULT_TERMS,
            privacyContent: res.data.privacyContent || DEFAULT_PRIVACY,
            mapEmbed: res.data.mapEmbed || '',
            workingHours: res.data.workingHours || 'Mon - Fri: 9:00 AM - 6:00 PM',
            socialLinks: {
              github: res.data.socialLinks?.github || '',
              linkedin: res.data.socialLinks?.linkedin || '',
              twitter: res.data.socialLinks?.twitter || '',
              instagram: res.data.socialLinks?.instagram || '',
              youtube: res.data.socialLinks?.youtube || '',
              facebook: res.data.socialLinks?.facebook || ''
            },
            contactFormFields: res.data.contactFormFields || [],
            locations: res.data.locations || [],
            maintenanceMode: res.data.maintenanceMode || false,
            websiteStatus: res.data.websiteStatus || { enabled: true },
            announcementBanner: res.data.announcementBanner || { show: false, text: '', link: '' },
            cookieSettings: res.data.cookieSettings || { show: true, text: 'We use cookies to improve your user experience.' },
            customFooterScripts: res.data.customFooterScripts || ''
          });

          if (res.data.logo?.url) setLogoPreview(res.data.logo.url);
          if (res.data.favicon?.url) setFaviconPreview(res.data.favicon.url);
          if (res.data.heroImage?.url) setHeroImagePreview(res.data.heroImage.url);
          if (res.data.profilePicture?.url) setProfilePicturePreview(res.data.profilePicture.url);
          if (res.data.heroBackground?.url) setHeroBackgroundPreview(res.data.heroBackground.url);
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

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleAddField = () => {
    if (!newField.label.trim()) return;
    const name = newField.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_+|_+$)/g, '');
    const options = newField.optionsInput.split(',').map(o => o.trim()).filter(Boolean);
    
    const fieldData = {
      id: editingFieldId || Date.now().toString(),
      name,
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder.trim(),
      options
    };

    setSettings(prev => {
      let fields = [...(prev.contactFormFields || [])];
      if (editingFieldId) {
        fields = fields.map(f => f.id === editingFieldId ? fieldData : f);
        setEditingFieldId(null);
      } else {
        fields.push(fieldData);
      }
      return { ...prev, contactFormFields: fields };
    });

    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      optionsInput: ''
    });
  };

  const handleEditField = (field) => {
    setEditingFieldId(field.id);
    setNewField({
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || '',
      optionsInput: field.options?.join(', ') || ''
    });
  };

  const handleDeleteField = (id) => {
    setSettings(prev => ({
      ...prev,
      contactFormFields: (prev.contactFormFields || []).filter(f => f.id !== id)
    }));
  };

  const handleAddLocation = () => {
    if (!newLocation.title || !newLocation.address || !newLocation.mapEmbed) {
      alert('Title, Address, and Google Maps Embed URL are required.');
      return;
    }

    setSettings(prev => {
      const updatedLocations = [...(prev.locations || [])];
      const parsedMapEmbed = extractIframeSrc(newLocation.mapEmbed);
      const cleanLocation = { ...newLocation, mapEmbed: parsedMapEmbed };
      
      if (editingLocationId !== null) {
        // Edit mode
        updatedLocations[editingLocationId] = {
          ...updatedLocations[editingLocationId],
          ...cleanLocation
        };
      } else {
        // Add mode
        const isFirst = updatedLocations.length === 0;
        updatedLocations.push({
          ...cleanLocation,
          isPrimary: isFirst
        });
      }

      return {
        ...prev,
        locations: updatedLocations
      };
    });

    setNewLocation({
      title: '',
      address: '',
      mapEmbed: '',
      workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
      email: '',
      phone: '',
    });
    setEditingLocationId(null);
  };

  const handleEditLocation = (index) => {
    const loc = settings.locations[index];
    setNewLocation({
      title: loc.title || '',
      address: loc.address || '',
      mapEmbed: loc.mapEmbed || '',
      workingHours: loc.workingHours || 'Mon - Fri: 9:00 AM - 6:00 PM',
      email: loc.email || '',
      phone: loc.phone || '',
    });
    setEditingLocationId(index);
  };

  const handleDeleteLocation = (index) => {
    if (!window.confirm('Are you sure you want to delete this map location?')) return;
    setSettings(prev => {
      let updatedLocations = (prev.locations || []).filter((_, idx) => idx !== index);
      if (prev.locations[index]?.isPrimary && updatedLocations.length > 0) {
        updatedLocations[0].isPrimary = true;
      }
      return {
        ...prev,
        locations: updatedLocations
      };
    });
    if (editingLocationId === index) {
      setEditingLocationId(null);
      setNewLocation({
        title: '',
        address: '',
        mapEmbed: '',
        workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
        email: '',
        phone: '',
      });
    }
  };

  const handleSetPrimaryLocation = (index) => {
    setSettings(prev => {
      const updatedLocations = (prev.locations || []).map((loc, idx) => ({
        ...loc,
        isPrimary: idx === index
      }));
      const selectedLoc = updatedLocations[index];
      return {
        ...prev,
        locations: updatedLocations,
        mapEmbed: selectedLoc.mapEmbed || prev.mapEmbed,
        address: selectedLoc.address || prev.address,
        workingHours: selectedLoc.workingHours || prev.workingHours,
        email: selectedLoc.email || prev.email,
        phone: selectedLoc.phone || prev.phone
      };
    });
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else if (field === 'favicon') {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    } else if (field === 'heroImage') {
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    } else if (field === 'profilePicture') {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    } else if (field === 'heroBackground') {
      setHeroBackgroundFile(file);
      setHeroBackgroundPreview(URL.createObjectURL(file));
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setLoading(true);
    try {
      const cleanedMapEmbed = extractIframeSrc(settings.mapEmbed);
      const updatedSettings = { ...settings, mapEmbed: cleanedMapEmbed };

      const data = new FormData();
      Object.keys(updatedSettings).forEach(key => {
        if (
          key === 'socialLinks' || 
          key === 'locations' || 
          key === 'contactFormFields' || 
          key === 'announcementBanner' || 
          key === 'cookieSettings' || 
          key === 'websiteStatus' ||
          key === 'theme' ||
          key === 'navbarConfig' ||
          key === 'heroCtaButtons' ||
          key === 'aboutStats'
        ) {
          data.append(key, JSON.stringify(updatedSettings[key]));
        } else {
          data.append(key, updatedSettings[key]);
        }
      });

      if (logoFile) data.append('logo', logoFile);
      if (faviconFile) data.append('favicon', faviconFile);
      if (heroImageFile) data.append('heroImage', heroImageFile);
      if (profilePictureFile) data.append('profilePicture', profilePictureFile);
      if (heroBackgroundFile) data.append('heroBackground', heroBackgroundFile);

      const res = await api.updateSettings(data);
      if (res.success) {
        setSaveSuccess('Success! Your changes have been permanently saved to the database and are now live on the website.');
        if (res.data.logo?.url) setLogoPreview(res.data.logo.url);
        if (res.data.favicon?.url) setFaviconPreview(res.data.favicon.url);
        if (res.data.heroImage?.url) setHeroImagePreview(res.data.heroImage.url);
        if (res.data.profilePicture?.url) setProfilePicturePreview(res.data.profilePicture.url);
        if (res.data.heroBackground?.url) setHeroBackgroundPreview(res.data.heroBackground.url);

        setLogoFile(null);
        setFaviconFile(null);
        setHeroImageFile(null);
        setProfilePictureFile(null);
        setHeroBackgroundFile(null);
        
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
        <form onSubmit={handleSettingsSubmit} className="lg:col-span-8 glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-6">
          <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-white/5 pb-4">
            <FaGlobe className="text-primary-blue" /> Website Identity, Status & Assets
          </h3>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
              {saveSuccess}
            </div>
          )}

          {/* Section: Website Identity */}
          <div className="flex flex-col gap-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">1. Website Identity</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="siteName" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website Name</label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleSettingsChange}
                  required
                  placeholder="e.g. Tauhid Shekhar"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="siteTagline" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website Tagline</label>
                <input
                  type="text"
                  id="siteTagline"
                  name="siteTagline"
                  value={settings.siteTagline || ''}
                  onChange={handleSettingsChange}
                  placeholder="e.g. Full Stack MERN Developer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                />
              </div>
            </div>

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
          </div>

          {/* Section: Website Assets (Images/Media) */}
          <div className="flex flex-col gap-5 border-t border-slate-200 dark:border-white/5 pt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">2. Website Assets & Media</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Website Logo</label>
                {logoPreview && (
                  <img src={logoPreview} alt="Logo Preview" className="h-16 w-auto object-contain self-start rounded border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950 p-1" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20 cursor-pointer"
                />
              </div>

              {/* Favicon */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Favicon (.ico/.png)</label>
                {faviconPreview && (
                  <img src={faviconPreview} alt="Favicon Preview" className="h-8 w-8 object-contain self-start rounded border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950 p-1" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'favicon')}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20 cursor-pointer"
                />
              </div>

              {/* Profile Picture */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profile Picture</label>
                {profilePicturePreview && (
                  <img src={profilePicturePreview} alt="Profile Preview" className="h-16 w-16 object-cover rounded-full border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profilePicture')}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20 cursor-pointer"
                />
              </div>

              {/* Hero Image */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hero Banner Illustration</label>
                {heroImagePreview && (
                  <img src={heroImagePreview} alt="Hero Preview" className="h-16 w-auto object-contain self-start rounded border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950 p-1" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'heroImage')}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20 cursor-pointer"
                />
              </div>
            </div>

            {/* Hero Background */}
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hero Section Background Image</label>
              {heroBackgroundPreview && (
                <img src={heroBackgroundPreview} alt="Hero Background Preview" className="h-20 w-full object-cover rounded border border-slate-200 dark:border-white/5" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'heroBackground')}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Status & Maintenance Mode */}
          <div className="flex flex-col gap-5 border-t border-slate-200 dark:border-white/5 pt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">3. Status, Notices & Custom Scripts</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Maintenance Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase font-title">Maintenance Mode</span>
                  <span className="text-[10px] text-slate-400">Blocks site access and shows maintenance view.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-blue"></div>
                </label>
              </div>

              {/* Website Status Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase font-title">Website Enabled</span>
                  <span className="text-[10px] text-slate-400">Toggles whether the portfolio is public.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.websiteStatus?.enabled}
                    onChange={(e) => handleNestedSettingChange('websiteStatus', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-blue"></div>
                </label>
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase font-title">Announcement Banner</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementBanner?.show}
                    onChange={(e) => handleNestedSettingChange('announcementBanner', 'show', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-blue"></div>
                </label>
              </div>
              
              {settings.announcementBanner?.show && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Banner Text</label>
                    <input
                      type="text"
                      value={settings.announcementBanner?.text || ''}
                      onChange={(e) => handleNestedSettingChange('announcementBanner', 'text', e.target.value)}
                      placeholder="e.g. Currently open for full-time software engineering roles!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Action Link URL</label>
                    <input
                      type="text"
                      value={settings.announcementBanner?.link || ''}
                      onChange={(e) => handleNestedSettingChange('announcementBanner', 'link', e.target.value)}
                      placeholder="e.g. /community or https://linkedin.com..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cookie Notice Settings */}
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase font-title">Cookie Notice Consent Banner</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cookieSettings?.show}
                    onChange={(e) => handleNestedSettingChange('cookieSettings', 'show', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-blue"></div>
                </label>
              </div>

              {settings.cookieSettings?.show && (
                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Notice text</label>
                  <input
                    type="text"
                    value={settings.cookieSettings?.text || ''}
                    onChange={(e) => handleNestedSettingChange('cookieSettings', 'text', e.target.value)}
                    placeholder="We use cookies to improve your user experience."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                  />
                </div>
              )}
            </div>

            {/* Custom Scripts (Footer) */}
            <div className="flex flex-col gap-2">
              <label htmlFor="customFooterScripts" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custom Footer Scripts</label>
              <textarea
                id="customFooterScripts"
                name="customFooterScripts"
                rows="3"
                value={settings.customFooterScripts || ''}
                onChange={handleSettingsChange}
                placeholder="e.g. <!-- Custom body scripts or chat widgets -->"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors resize-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="flex flex-col gap-5 border-t border-slate-200 dark:border-white/5 pt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-title">4. Contact Information & Hours</h4>
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

            {/* Google Map embed link & Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="mapEmbed" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Google Maps Embed URL</label>
                <input
                  type="text"
                  id="mapEmbed"
                  name="mapEmbed"
                  value={settings.mapEmbed}
                  onChange={handleSettingsChange}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="workingHours" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Working Hours</label>
                <input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  value={settings.workingHours}
                  onChange={handleSettingsChange}
                  placeholder="e.g. Mon - Fri: 9:00 AM - 6:00 PM"
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

            {/* Office Locations & Maps Manager */}
            <div className="border-t border-slate-200 dark:border-white/5 pt-6 mt-4 flex flex-col gap-4 text-left">
              <h4 className="text-sm font-black font-title uppercase tracking-widest text-slate-400">Office Locations & Maps</h4>
              
              {/* Existing Locations list */}
              <div className="flex flex-col gap-3">
                {settings.locations?.map((loc, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">{loc.title}</span>
                        {loc.isPrimary && (
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded">
                            Active Map
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{loc.address}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{loc.workingHours} | {loc.email || 'No email'} | {loc.phone || 'No phone'}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {!loc.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryLocation(idx)}
                          className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                        >
                          Set Active Map
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditLocation(idx)}
                        className="text-xs font-bold text-primary-blue hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(idx)}
                        className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {(!settings.locations || settings.locations.length === 0) && (
                  <div className="text-xs italic text-slate-400">No custom locations added. Using default map location.</div>
                )}
              </div>

              {/* Add / Edit Location Sub-form */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 flex flex-col gap-4 mt-2">
                <h5 className="text-xs font-bold text-slate-850 dark:text-slate-200">
                  {editingLocationId !== null ? '✏️ Edit Location Details' : '➕ Add New Office Location'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Location Title *</label>
                    <input
                      type="text"
                      value={newLocation.title}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Headquarters / Amritsar Office"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue bg-slate-100 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Address *</label>
                    <input
                      type="text"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="e.g. Delhi, Sangam Vihar, India"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue bg-slate-100 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Google Maps Embed URL *</label>
                  <input
                    type="text"
                    value={newLocation.mapEmbed}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, mapEmbed: e.target.value }))}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue bg-slate-100 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5">Go to Google Maps {"→"} Share {"→"} Embed a map {"→"} Copy iframe src link.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Working Hours</label>
                    <input
                      type="text"
                      value={newLocation.workingHours}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, workingHours: e.target.value }))}
                      placeholder="e.g. Mon - Fri: 9:00 AM - 6:00 PM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue bg-slate-100 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Location Email</label>
                    <input
                      type="email"
                      value={newLocation.email}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. shekhartauhid@gmail.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue bg-slate-100 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Location Phone</label>
                    <input
                      type="text"
                      value={newLocation.phone}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +91 9142725562"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue bg-slate-100 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    {editingLocationId !== null ? 'Save Location' : 'Add Location'}
                  </button>
                  {editingLocationId !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLocationId(null);
                        setNewLocation({
                          title: '',
                          address: '',
                          mapEmbed: '',
                          workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
                          email: '',
                          phone: '',
                        });
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-400 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
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



            {/* Social Media Links Card */}
            <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm mt-6">
              <h3 className="text-sm font-bold font-title text-black dark:text-white mb-4">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['github', 'linkedin', 'twitter', 'instagram', 'youtube', 'facebook'].map((platform) => (
                  <div key={platform} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">{platform} Profile URL</label>
                    <input
                      type="text"
                      name={platform}
                      value={settings.socialLinks?.[platform] || ''}
                      onChange={handleSocialLinkChange}
                      placeholder={`https://${platform}.com/username`}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form Builder Card */}
            <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm mt-6">
              <h3 className="text-base font-bold font-title text-black dark:text-white mb-2">Dynamic Contact Form Builder</h3>
              <p className="text-xs text-slate-500 mb-6">Customize the inputs for your website's contact form. Changes sync instantly.</p>
              
              {/* Current Fields List */}
              <div className="flex flex-col gap-3 mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Form Fields</h4>
                {settings.contactFormFields?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {settings.contactFormFields.map((field, idx) => (
                      <div key={field.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-5-0 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-400 uppercase text-[9px]">{field.type}</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{field.label}</span>
                          {field.required && <span className="text-red-500 text-xs font-bold">* Required</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditField(field)}
                            className="text-xs font-bold text-primary-blue hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteField(field.id)}
                            className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No fields defined. Using default contact form fields.</p>
                )}
              </div>

              {/* Add/Edit field builder inputs */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">{editingFieldId ? 'Edit Field' : 'Create New Form Field'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Field Label</label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g. Your Phone Number"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-455 uppercase">Field Type</label>
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    >
                      <option value="text">Text Input</option>
                      <option value="email">Email Address</option>
                      <option value="tel">Phone Number</option>
                      <option value="number">Numeric Input</option>
                      <option value="textarea">Multi-line Text (Textarea)</option>
                      <option value="select">Dropdown Select</option>
                      <option value="checkbox">Single Checkbox</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="date">Date Selection</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Placeholder text</label>
                    <input
                      type="text"
                      value={newField.placeholder}
                      onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                      placeholder="e.g. Enter phone number..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="field_req"
                      checked={newField.required}
                      onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                      className="w-4 h-4 text-primary-blue rounded"
                    />
                    <label htmlFor="field_req" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">Required Field</label>
                  </div>
                </div>

                {/* Options list input (for dropdown/radio) */}
                {(newField.type === 'select' || newField.type === 'radio') && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Dropdown / Radio Options (comma separated)</label>
                    <input
                      type="text"
                      value={newField.optionsInput}
                      onChange={(e) => setNewField(prev => ({ ...prev, optionsInput: e.target.value }))}
                      placeholder="e.g. Graphic Design, Web Development, SEO, App Launch"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-4 py-2 bg-primary-purple text-white text-xs font-bold rounded-lg hover:bg-opacity-90 cursor-pointer"
                  >
                    {editingFieldId ? 'Save Field Changes' : 'Add Field'}
                  </button>
                  {editingFieldId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFieldId(null);
                        setNewField({ label: '', type: 'text', required: false, placeholder: '', optionsInput: '' });
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-400 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Unified Save Configurations Button */}
            <button
              type="submit"
              className="w-full md:w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
            >
              <FaSave /> Save All Configurations
            </button>
          </form>

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
