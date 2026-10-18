import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaClock,
  FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaFacebook,
  FaCheckCircle, FaExclamationCircle
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
  
  // If it's already a clean URL, return it directly
  if (/^(f|ht)tps?:\/\//i.test(trimmed) && !trimmed.includes('<')) {
    return trimmed;
  }
  
  // Regex to match src attribute inside iframe or HTML string
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1].replace(/&amp;/g, '&');
  }
  return trimmed;
};

const Contact = ({ settingsData, aboutData, onShowToast }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [settings, setSettings] = useState(settingsData || null);
  const [aboutSettings, setAboutSettings] = useState(aboutData || null);
  const [selectedLocationIdx, setSelectedLocationIdx] = useState(0);

  // Sync props to state
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  useEffect(() => {
    if (aboutData) {
      setAboutSettings(aboutData);
    }
  }, [aboutData]);

  const defaultFields = [
    { id: '1', name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'e.g. John Doe' },
    { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'e.g. john@example.com' },
    { id: '3', name: 'phone_number', label: 'Phone Number', type: 'tel', required: false, placeholder: '+91 98765 43210' },
    { id: '4', name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Project Inquiry / Job Opportunity' },
    { id: '5', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Tell me about your project, timeline, or inquiry...' }
  ];

  const formFields = settings?.contactFormFields?.length ? settings.contactFormFields : defaultFields;

  // Pre-populate empty form state based on loaded fields
  useEffect(() => {
    setFormData(prev => {
      const initialData = { ...prev };
      formFields.forEach(f => {
        if (initialData[f.name] === undefined) {
          initialData[f.name] = '';
        }
      });
      return initialData;
    });
  }, [settings]);

  useEffect(() => {
    if (settingsData && aboutData) return;
    const loadSettings = async () => {
      try {
        const [res, aboutRes] = await Promise.all([
          api.getSettings().catch(() => null),
          api.getAbout().catch(() => null)
        ]);
        if (res?.success) {
          setSettings(res.data);
        }
        if (aboutRes?.success) {
          setAboutSettings(aboutRes.data);
        }
      } catch (err) {
        console.error('Failed to load contact settings:', err.message);
      }
    };
    loadSettings();
  }, [settingsData, aboutData]);

  // Resolve active/selected location details
  const activeLocation = settings?.locations?.length > 0 
    ? settings.locations[selectedLocationIdx] 
    : null;

  const emailVal = activeLocation?.email || aboutSettings?.aboutContactInfo?.email || settings?.email || 'shekhartauhid@gmail.com';
  const phoneVal = activeLocation?.phone || aboutSettings?.aboutContactInfo?.phone || settings?.phone || '+91 9142725562';
  const addressVal = activeLocation?.address || aboutSettings?.aboutContactInfo?.address || settings?.address || 'Amritsar, Punjab, India';
  const workingHoursVal = activeLocation?.workingHours || settings?.workingHours || 'Mon - Fri: 9:00 AM - 6:00 PM';
  const mapEmbedRaw = activeLocation?.mapEmbed || settings?.mapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108604.38204859068!2d74.80284487532353!3d31.633979268875355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4d74.87226424999999!3m2!1m2!1s0x391964aa569e7355%3A0xe021a60ccab1c0ef!2sAmritsar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
  const mapEmbedVal = extractIframeSrc(mapEmbedRaw);

  const contactDetails = [
    { title: 'Email', value: emailVal, href: `mailto:${emailVal}`, icon: <FaEnvelope className="text-[#C2272D]" /> },
    { title: 'Phone', value: phoneVal, href: `tel:${phoneVal.replace(/\s+/g, '')}`, icon: <FaPhone className="text-[#00FFFF]" /> },
    { title: 'Location', value: addressVal, href: null, icon: <FaMapMarkerAlt className="text-[#C2272D]" /> },
    { title: 'Working Hours', value: workingHoursVal, href: null, icon: <FaClock className="text-emerald-500" /> }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (status) setStatus(null);
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      // Sync phone and phone_number aliases
      if (name === 'phone') next.phone_number = val;
      if (name === 'phone_number') next.phone = val;
      return next;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      // Ensure phone and phone_number are populated if either is filled
      const payload = { ...formData };
      if (payload.phone && !payload.phone_number) payload.phone_number = payload.phone;
      if (payload.phone_number && !payload.phone) payload.phone = payload.phone_number;

      const res = await api.createMessage(payload);
      if (res?.success) {
        const successMsg = res.message || 'Thank you! Your message has been sent successfully. I will respond to you shortly.';
        setStatus({ type: 'success', message: successMsg });
        if (onShowToast) onShowToast('Message Sent Successfully!');
        
        // Reset form inputs
        const resetData = {};
        formFields.forEach(f => {
          resetData[f.name] = '';
        });
        setFormData(resetData);
      } else {
        const errorMsg = res?.message || 'Failed to send message. Please verify all required fields.';
        setStatus({ type: 'error', message: errorMsg });
        if (onShowToast) onShowToast(errorMsg);
      }
    } catch (error) {
      const errorMsg = error.message || 'An error occurred while connecting. Please try again.';
      setStatus({ type: 'error', message: errorMsg });
      if (onShowToast) onShowToast(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const socialLinks = settings?.socialLinks || {};
  const socialPlatforms = [
    { key: 'github', icon: <FaGithub />, color: 'hover:bg-slate-800' },
    { key: 'linkedin', icon: <FaLinkedin />, color: 'hover:bg-blue-700' },
    { key: 'twitter', icon: <FaTwitter />, color: 'hover:bg-sky-500' },
    { key: 'instagram', icon: <FaInstagram />, color: 'hover:bg-pink-600' },
    { key: 'youtube', icon: <FaYoutube />, color: 'hover:bg-red-600' },
    { key: 'facebook', icon: <FaFacebook />, color: 'hover:bg-blue-600' }
  ].filter(p => socialLinks[p.key]);

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-24 lg:py-28 bg-[#F8FAFC]/70 dark:bg-transparent relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>Get In Touch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Let's Start a Conversation
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] max-w-xl mx-auto leading-relaxed">
            Have a project in mind, seeking full-stack engineering expertise, or just want to connect? Send a note below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Contact Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4.5 w-full"
          >
            {/* Multiple Locations Tabs */}
            {settings?.locations?.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-1 p-1.5 bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-white/10">
                {settings.locations.map((loc, idx) => (
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

            {/* Social Links Block */}
            {socialPlatforms.length > 0 && (
              <div className="bg-white dark:bg-[#111111] p-4.5 xs:p-5 sm:p-5.5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm text-left flex flex-col gap-3.5 sm:gap-4">
                <span className="text-xs sm:text-[13px] md:text-sm font-bold font-title text-[#525252] dark:text-[#9CA3AF] uppercase tracking-wider block">
                  Social Channels
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

            {/* Embedded Google Map */}
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

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-7 w-full"
          >
            <form 
              onSubmit={handleFormSubmit} 
              className="bg-white dark:bg-[#111111] p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-md flex flex-col gap-5 sm:gap-6 text-left"
            >
              
              {/* Form Inputs Grid: 1 column on mobile, 2 columns on tablet/desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {formFields.map((field, fIdx) => {
                  const isFullWidth = field.type === 'textarea' || field.type === 'checkbox' || field.type === 'radio' || formFields.length <= 2;
                  
                  return (
                    <div 
                      key={field.id || fIdx} 
                      className={`flex flex-col gap-1.5 ${isFullWidth ? 'sm:col-span-2' : 'sm:col-span-1'}`}
                    >
                      {field.type !== 'checkbox' && (
                        <label htmlFor={field.name} className="text-sm sm:text-[15px] font-semibold text-[#171717] dark:text-white flex items-center justify-between">
                          <span>
                            {field.label} {field.required && <span className="text-[#C2272D]">*</span>}
                          </span>
                        </label>
                      )}

                      {field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          rows="4"
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20 text-[15px] sm:text-base transition-all resize-none placeholder-slate-400 min-h-[110px]"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20 text-[15px] sm:text-base transition-all min-h-[46px]"
                        >
                          <option value="">Select option...</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center gap-3 py-1">
                          <input
                            type="checkbox"
                            id={field.name}
                            name={field.name}
                            checked={!!formData[field.name]}
                            onChange={handleInputChange}
                            required={field.required}
                            className="w-5 h-5 accent-[#C2272D] rounded focus:ring-[#C2272D] cursor-pointer"
                          />
                          <label htmlFor={field.name} className="text-sm sm:text-[15px] font-medium text-[#171717] dark:text-white cursor-pointer select-none">
                            {field.label} {field.required && <span className="text-[#C2272D]">*</span>}
                          </label>
                        </div>
                      ) : field.type === 'radio' ? (
                        <div className="flex flex-wrap gap-4 py-1">
                          {field.options?.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2 text-sm sm:text-[15px] font-medium text-[#171717] dark:text-white cursor-pointer select-none">
                              <input
                                type="radio"
                                name={field.name}
                                value={opt}
                                checked={formData[field.name] === opt}
                                onChange={handleInputChange}
                                required={field.required}
                                className="w-4.5 h-4.5 accent-[#C2272D] cursor-pointer"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          id={field.name}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] focus:ring-2 focus:ring-[#C2272D]/20 dark:focus:ring-[#00FFFF]/20 text-[15px] sm:text-base transition-all placeholder-slate-400 min-h-[46px]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Feedback Banner */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border ${
                      status.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-[#C2272D]/10 border-[#C2272D]/30 text-[#C2272D] dark:text-red-400'
                    }`}
                  >
                    {status.type === 'success' ? (
                      <FaCheckCircle className="shrink-0 text-base" />
                    ) : (
                      <FaExclamationCircle className="shrink-0 text-base" />
                    )}
                    <span className="leading-relaxed">{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] sm:min-h-[52px] py-3.5 sm:py-4 px-6 sm:px-8 bg-[#C2272D] hover:bg-[#A51E23] disabled:bg-slate-400 text-white rounded-full font-semibold text-[15px] sm:text-[16px] shadow-md shadow-[#C2272D]/25 hover:shadow-xl hover:shadow-[#C2272D]/40 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer mt-1 hover:scale-[1.02] active:scale-[0.98] btn-shine-effect group"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={15} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
