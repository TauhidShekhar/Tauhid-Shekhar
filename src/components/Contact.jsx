import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaClock,
  FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaFacebook,
  FaCheckCircle, FaExclamationCircle, FaUser, FaCommentDots,
  FaTimes, FaUndo
} from 'react-icons/fa';

const formatExternalLink = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(f|ht)tps?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const extractIframeSrc = (input) => {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^(f|ht)tps?:\/\//i.test(trimmed) && !trimmed.includes('<')) {
    return trimmed;
  }
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].replace(/&amp;/g, '&');
  }
  return trimmed;
};

const Contact = ({ settingsData, aboutData, onShowToast }) => {
  // Simple, dedicated inquiry form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    _ts_hp: '' // Anti-spam honeypot
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string, senderName?: string }
  const [isFormClosed, setIsFormClosed] = useState(false);
  const [settings, setSettings] = useState(settingsData || null);
  const [aboutSettings, setAboutSettings] = useState(aboutData || null);
  const [selectedLocationIdx, setSelectedLocationIdx] = useState(0);

  // Sync props to state
  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  useEffect(() => {
    if (aboutData) setAboutSettings(aboutData);
  }, [aboutData]);

  useEffect(() => {
    if (settingsData && aboutData) return;
    const loadSettings = async () => {
      try {
        const [settingsRes, aboutRes] = await Promise.all([
          api.getSettings().catch(() => null),
          api.getAbout().catch(() => null)
        ]);
        if (settingsRes?.success) setSettings(settingsRes.data);
        if (aboutRes?.success) setAboutSettings(aboutRes.data);
      } catch (err) {
        console.error('Failed to load contact info:', err.message);
      }
    };
    loadSettings();
  }, [settingsData, aboutData]);

  const socialLinks = settings?.socialLinks || aboutSettings?.socialLinks || {};
  const socialPlatforms = [
    { key: 'github', icon: <FaGithub />, color: 'hover:bg-[#24292e]' },
    { key: 'linkedin', icon: <FaLinkedin />, color: 'hover:bg-[#0077b5]' },
    { key: 'twitter', icon: <FaTwitter />, color: 'hover:bg-[#1da1f2]' },
    { key: 'instagram', icon: <FaInstagram />, color: 'hover:bg-[#e1306c]' },
    { key: 'youtube', icon: <FaYoutube />, color: 'hover:bg-[#ff0000]' },
    { key: 'facebook', icon: <FaFacebook />, color: 'hover:bg-[#1877f2]' }
  ].filter(p => socialLinks[p.key]);

  const emailVal = settings?.email || aboutSettings?.email || 'shekhartauhid@gmail.com';
  const phoneVal = settings?.phone || aboutSettings?.phone || '+91 91427 25562';
  const workingHoursVal = settings?.workingHours || 'Mon - Fri: 9:00 AM - 6:00 PM IST';
  const mapEmbedVal = extractIframeSrc(settings?.mapEmbedUrl || '');

  const locationsList = (settings?.locations && settings.locations.length > 0)
    ? settings.locations
    : (settings?.address ? [{ title: 'Primary Office', address: settings.address }] : [{ title: 'Headquarters', address: 'Patna, Bihar, India' }]);

  const activeLoc = locationsList[selectedLocationIdx] || locationsList[0];
  const addressVal = activeLoc?.address || 'Patna, Bihar, India';

  const contactDetails = [
    { title: 'Email', value: emailVal, href: `mailto:${emailVal}`, icon: <FaEnvelope className="text-[#C2272D]" /> },
    { title: 'Phone / WhatsApp', value: phoneVal, href: `tel:${phoneVal.replace(/\s+/g, '')}`, icon: <FaPhone className="text-[#00FFFF]" /> },
    { title: 'Location', value: addressVal, href: null, icon: <FaMapMarkerAlt className="text-[#C2272D]" /> },
    { title: 'Working Hours', value: workingHoursVal, href: null, icon: <FaClock className="text-emerald-500" /> }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (status) setStatus(null);
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      _ts_hp: ''
    });
    setFieldErrors({});
    setStatus(null);
    if (onShowToast) onShowToast('Form fields cleared.');
  };

  const handleCloseForm = () => {
    setIsFormClosed(true);
    setStatus(null);
    if (onShowToast) onShowToast('Contact form minimized. Click Reopen Form to compose a message.');
  };

  const handleReopenForm = () => {
    setIsFormClosed(false);
  };

  const handleBackToPortfolio = (e) => {
    if (e) e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    window.history.pushState(null, '', '#home');
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.message.trim()) {
      errors.message = 'Please enter your message or project inquiry';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double clicks

    if (!validateForm()) {
      if (onShowToast) onShowToast('Please fill out all required fields correctly.');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        phone_number: formData.phone.trim(),
        subject: `Direct Contact Inquiry from ${formData.name.trim()}`,
        message: formData.message.trim(),
        _ts_hp: formData._ts_hp
      };

      const res = await api.createMessage(payload);
      if (res?.success) {
        setStatus({
          type: 'success',
          message: res.message || 'Thank you! Your message has been safely saved and forwarded to Gmail. Tauhid will respond shortly.',
          senderName: formData.name.trim()
        });
        if (onShowToast) onShowToast('Message Sent & Delivered to Gmail!');

        // Clear form inputs on success
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          _ts_hp: ''
        });
        setFieldErrors({});
      } else {
        const errorMsg = res?.message || 'Failed to deliver message. Please verify fields and try again.';
        setStatus({ type: 'error', message: errorMsg });
        if (onShowToast) onShowToast(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.message || 'Connection error. Please try again or reach out via direct email.';
      setStatus({ type: 'error', message: errorMsg });
      if (onShowToast) onShowToast(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const messageLength = (formData.message || '').length;

  return (
    <section 
      id="contact" 
      tabIndex="-1" 
      aria-label="Contact Section"
      className="py-16 sm:py-20 md:py-24 relative overflow-hidden focus:outline-none scroll-mt-24"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16"
        >
          <span className="text-xs sm:text-sm font-bold font-title text-[#C2272D] dark:text-[#00FFFF] uppercase tracking-wider block mb-2 sm:mb-3">
            Get In Touch
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black font-title tracking-tight text-[#171717] dark:text-white mb-3 sm:mb-4">
            Let's Build Something <span className="text-[#C2272D]">Together</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#525252] dark:text-[#D1D5DB] font-normal leading-relaxed">
            Have a project in mind, need technical consultation, or want to discuss full-stack development? Send a message directly.
          </p>
        </motion.div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Direct Info & Socials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 w-full"
          >
            {locationsList.length > 1 && (
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-[#E5E7EB] dark:border-white/10 mb-1">
                {locationsList.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLocationIdx(idx)}
                    type="button"
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-title uppercase tracking-wider transition-all cursor-pointer ${
                      selectedLocationIdx === idx
                        ? 'bg-[#C2272D] text-white shadow-md'
                        : 'bg-transparent text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF]'
                    }`}
                  >
                    {loc.title || `Location ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {contactDetails.map((detail, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#111111] p-4.5 xs:p-5 sm:p-5.5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex items-center gap-4 sm:gap-5 hover:border-[#C2272D] dark:hover:border-[#00FFFF] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 text-left card-interactive group cursor-pointer"
              >
                <div className="w-12 h-12 xs:w-13 xs:h-13 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-[#E5E7EB] dark:border-white/10 text-[#C2272D] dark:text-[#00FFFF] text-lg sm:text-xl md:text-2xl shadow-xs group-hover:scale-110 transition-transform duration-300">
                  {detail.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-[13px] md:text-sm font-bold font-title text-[#525252] dark:text-[#9CA3AF] uppercase tracking-wider block mb-1">
                    {detail.title}
                  </span>
                  {detail.href ? (
                    <a 
                      href={detail.href} 
                      className="text-[15px] xs:text-base sm:text-[17px] md:text-[18px] font-semibold text-[#171717] dark:text-white hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors [overflow-wrap:anywhere] block leading-snug"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <span className="text-[15px] xs:text-base sm:text-[17px] md:text-[18px] font-semibold text-[#171717] dark:text-white block [overflow-wrap:anywhere] leading-snug">
                      {detail.value}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {socialPlatforms.length > 0 && (
              <div className="bg-white dark:bg-[#111111] p-4.5 xs:p-5 sm:p-5.5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm text-left flex flex-col gap-3.5 sm:gap-4">
                <span className="text-xs sm:text-[13px] md:text-sm font-bold font-title text-[#525252] dark:text-[#9CA3AF] uppercase tracking-wider block">
                  Connect Across Networks
                </span>
                <div className="flex flex-wrap gap-2.5 sm:gap-3.5">
                  {socialPlatforms.map((platform, pIdx) => (
                    <a
                      key={pIdx}
                      href={formatExternalLink(socialLinks[platform.key])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-11 h-11 xs:w-12 xs:h-12 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] transition-all duration-200 hover:text-white hover:scale-110 active:scale-95 ${platform.color} shadow-xs text-lg sm:text-xl`}
                      aria-label={`Connect on ${platform.key}`}
                    >
                      {platform.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {mapEmbedVal && (
              <div className="bg-white dark:bg-[#111111] p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden h-[180px] sm:h-[220px]">
                <iframe
                  title="Google Map location"
                  src={mapEmbedVal}
                  className="w-full h-full border-none rounded-xl sm:rounded-2xl"
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            )}
          </motion.div>

          {/* Right Column: Simple Dedicated Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-7 w-full"
          >
            {isFormClosed ? (
              <div className="bg-white dark:bg-[#111111] p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-md text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 text-[#C2272D] dark:text-[#00FFFF] flex items-center justify-center text-2xl">
                  <FaEnvelope />
                </div>
                <h3 className="text-xl font-bold font-title text-[#171717] dark:text-white">
                  Contact Form is Minimized
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  You can reopen the contact form at any time to send a quick message, or scroll back to explore portfolio projects.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleReopenForm}
                    className="px-6 py-2.5 rounded-full bg-[#C2272D] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#A51E23] transition-all cursor-pointer"
                  >
                    Reopen Contact Form
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToPortfolio}
                    className="px-6 py-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-[#171717] dark:text-white text-xs sm:text-sm font-bold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Back to Portfolio
                  </button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={handleFormSubmit} 
                noValidate
                className="bg-white dark:bg-[#111111] p-5 xs:p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-md flex flex-col gap-5 sm:gap-6 text-left relative"
              >
                {/* Honeypot anti-spam bot field (hidden from view) */}
                <input
                  type="text"
                  name="_ts_hp"
                  value={formData._ts_hp}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                  tabIndex="-1"
                  autoComplete="off"
                />

                {/* Form Card Top Controls: Header title + Close/Clear */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C2272D] animate-ping" />
                    <span className="text-xs sm:text-sm font-bold font-title uppercase tracking-wider text-[#171717] dark:text-white">
                      Quick Inquiry Channel
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      title="Clear form inputs"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FaUndo size={11} />
                      <span className="hidden sm:inline font-medium">Clear</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseForm}
                      title="Close / Minimize form"
                      className="p-2 rounded-xl text-slate-400 hover:text-[#C2272D] hover:bg-[#C2272D]/10 dark:hover:bg-white/5 transition-all cursor-pointer"
                      aria-label="Close form"
                    >
                      <FaTimes size={15} />
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid: Name, Email, Phone (optional), Message */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label htmlFor="contact_name" className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <FaUser size={11} className="text-[#C2272D] opacity-80" />
                      <span>Full Name</span>
                      <span className="text-[#C2272D]">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Alex Johnson"
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl border text-[14px] sm:text-[15px] transition-all placeholder-slate-400 min-h-[46px] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none ${
                        fieldErrors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                          : 'border-[#E5E7EB] dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20'
                      }`}
                    />
                    {fieldErrors.name && (
                      <span className="text-[11px] font-medium text-red-500">{fieldErrors.name}</span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label htmlFor="contact_email" className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <FaEnvelope size={11} className="text-[#C2272D] opacity-80" />
                      <span>Email Address</span>
                      <span className="text-[#C2272D]">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. alex@company.com"
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl border text-[14px] sm:text-[15px] transition-all placeholder-slate-400 min-h-[46px] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none ${
                        fieldErrors.email 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                          : 'border-[#E5E7EB] dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20'
                      }`}
                    />
                    {fieldErrors.email && (
                      <span className="text-[11px] font-medium text-red-500">{fieldErrors.email}</span>
                    )}
                  </div>

                  {/* Mobile / Phone (Optional) */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="contact_phone" className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FaPhone size={11} className="text-[#00FFFF] opacity-80" />
                        <span>Mobile / WhatsApp</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">Optional</span>
                    </label>
                    <input
                      type="tel"
                      id="contact_phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 91427 25562"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20 text-[14px] sm:text-[15px] transition-all placeholder-slate-400 min-h-[46px]"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="contact_message" className="text-xs sm:text-sm font-semibold text-[#171717] dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FaCommentDots size={11} className="text-[#00FFFF] opacity-80" />
                        <span>Message / Inquiry</span>
                        <span className="text-[#C2272D]">*</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">
                        {messageLength} / 1000
                      </span>
                    </label>
                    <textarea
                      id="contact_message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="4"
                      maxLength={1000}
                      placeholder="Tell me about your project, timeline, requirements, or inquiry..."
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl border text-[14px] sm:text-[15px] transition-all resize-none placeholder-slate-400 min-h-[120px] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none ${
                        fieldErrors.message 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                          : 'border-[#E5E7EB] dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20'
                      }`}
                    />
                    {fieldErrors.message && (
                      <span className="text-[11px] font-medium text-red-500">{fieldErrors.message}</span>
                    )}
                  </div>
                </div>

                {/* Status Feedback Banner */}
                <AnimatePresence>
                  {status && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`p-4 sm:p-5 rounded-2xl flex flex-col gap-2 border ${
                        status.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[#C2272D]/10 border-[#C2272D]/30 text-[#C2272D] dark:text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 font-bold text-sm">
                        {status.type === 'success' ? (
                          <FaCheckCircle className="shrink-0 text-base text-emerald-500" />
                        ) : (
                          <FaExclamationCircle className="shrink-0 text-base text-[#C2272D]" />
                        )}
                        <span>{status.type === 'success' ? 'Message Sent Successfully!' : 'Submission Notice'}</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed opacity-95">
                        {status.message}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Action Controls: Send Message + Reset */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 min-h-[48px] sm:min-h-[52px] py-3.5 sm:py-4 px-6 sm:px-8 bg-[#C2272D] hover:bg-[#A51E23] disabled:bg-slate-400 text-white rounded-full font-semibold text-[15px] sm:text-[16px] shadow-md shadow-[#C2272D]/25 hover:shadow-xl hover:shadow-[#C2272D]/40 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-[0.98] btn-shine-effect group"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={14} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={submitting}
                    className="w-full sm:w-auto px-5 py-3 rounded-full border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
