import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaClock,
  FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaFacebook 
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
    // Decode HTML entities like &amp; to &
    return match[1].replace(/&amp;/g, '&');
  }
  return trimmed;
};

const Contact = ({ settingsData, aboutData, onShowToast }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
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

  // Pre-populate empty form state based on loaded fields
  useEffect(() => {
    if (settings) {
      const defaultFields = [
        { id: '1', name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Enter your name' },
        { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'Enter your email' },
        { id: '3', name: 'phone', label: 'Mobile Number', type: 'text', required: false, placeholder: 'Enter mobile number' },
        { id: '4', name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Enter project/inquiry subject' },
        { id: '5', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Type your message here...' }
      ];
      const formFields = settings.contactFormFields?.length ? settings.contactFormFields : defaultFields;
      setFormData(prev => {
        const initialData = { ...prev };
        formFields.forEach(f => {
          if (initialData[f.name] === undefined) {
            initialData[f.name] = '';
          }
        });
        return initialData;
      });
    }
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
    { title: 'Email', value: emailVal, href: `mailto:${emailVal}`, icon: <FaEnvelope className="text-primary-blue" /> },
    { title: 'Phone', value: phoneVal, href: `tel:${phoneVal.replace(/\s+/g, '')}`, icon: <FaPhone className="text-primary-purple" /> },
    { title: 'Location', value: addressVal, href: null, icon: <FaMapMarkerAlt className="text-primary-cyan" /> },
    { title: 'Working Hours', value: workingHoursVal, href: null, icon: <FaClock className="text-green-500" /> }
  ];

  const defaultFields = [
    { id: '1', name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Enter your name' },
    { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'Enter your email' },
    { id: '3', name: 'phone', label: 'Mobile Number', type: 'text', required: false, placeholder: 'Enter mobile number' },
    { id: '4', name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Enter project/inquiry subject' },
    { id: '5', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Type your message here...' }
  ];

  const formFields = settings?.contactFormFields?.length ? settings.contactFormFields : defaultFields;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.createMessage(formData);
      if (res.success) {
        onShowToast('Message Sent Successfully!');
        // Reset form inputs
        const resetData = {};
        formFields.forEach(f => {
          resetData[f.name] = '';
        });
        setFormData(resetData);
      } else {
        onShowToast('Failed to send message. Please try again.');
      }
    } catch (error) {
      onShowToast(error.message || 'An error occurred. Please try again.');
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
    <section id="contact" className="scroll-mt-24 py-24 sm:py-28 bg-[#F8FAFC] dark:bg-[#000000] relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>Get In Touch</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Let's Start a Conversation
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          
          {/* Left: Contact Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col gap-5"
          >
            {/* Multiple Locations Tabs */}
            {settings?.locations?.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-1 p-1.5 bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-white/10">
                {settings.locations.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLocationIdx(idx)}
                    type="button"
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
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
                className="bg-white dark:bg-[#111111] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex items-center gap-4 hover:border-[#C2272D] dark:hover:border-[#00FFFF] transition-all duration-200 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-[#E5E7EB] dark:border-white/10 text-[#C2272D] dark:text-[#00FFFF] text-xl shadow-sm">
                  {detail.icon}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#525252] dark:text-[#9CA3AF] uppercase tracking-wider block mb-0.5">{detail.title}</h3>
                  {detail.href ? (
                    <a href={detail.href} className="text-base font-semibold text-[#171717] dark:text-white hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors">
                      {detail.value}
                    </a>
                  ) : (
                    <span className="text-base font-semibold text-[#171717] dark:text-white">{detail.value}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Social Links Block */}
            {socialPlatforms.length > 0 && (
              <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm text-left flex flex-col gap-3.5">
                <h3 className="text-xs font-bold text-[#525252] dark:text-[#9CA3AF] uppercase tracking-wider">Social Channels</h3>
                <div className="flex flex-wrap gap-3">
                  {socialPlatforms.map((platform, pIdx) => (
                    <a
                      key={pIdx}
                      href={formatExternalLink(socialLinks[platform.key])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-11 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center text-[#525252] dark:text-[#D1D5DB] transition-all duration-200 hover:text-white ${platform.color} shadow-sm`}
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
              <div className="bg-white dark:bg-[#111111] p-3 rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden h-[240px]">
                <iframe
                  title="Google Map location"
                  src={mapEmbedVal}
                  className="w-full h-full border-none rounded-2xl"
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
            className="lg:col-span-7"
          >
            <form onSubmit={handleFormSubmit} className="bg-white dark:bg-[#111111] p-8 sm:p-10 md:p-12 rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-md flex flex-col gap-6 text-left">
              
              {formFields.map((field, fIdx) => (
                <div key={field.id || fIdx} className="flex flex-col gap-1.5">
                  {field.type !== 'checkbox' && (
                    <label htmlFor={field.name} className="text-[15px] font-semibold text-[#171717] dark:text-white">
                      {field.label} {field.required && <span className="text-[#C2272D]">*</span>}
                    </label>
                  )}

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      required={field.required}
                      rows="5"
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-base transition-colors resize-none placeholder-slate-400"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      required={field.required}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-base transition-colors"
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
                        className="w-4.5 h-4.5 accent-[#C2272D] rounded focus:ring-[#C2272D]"
                      />
                      <label htmlFor={field.name} className="text-[15px] font-medium text-[#171717] dark:text-white cursor-pointer">
                        {field.label} {field.required && <span className="text-[#C2272D]">*</span>}
                      </label>
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="flex flex-wrap gap-4 py-1">
                      {field.options?.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 text-[15px] font-medium text-[#171717] dark:text-white cursor-pointer">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            checked={formData[field.name] === opt}
                            onChange={handleInputChange}
                            required={field.required}
                            className="w-4.5 h-4.5 accent-[#C2272D]"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-base transition-colors placeholder-slate-400"
                    />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-8 bg-[#C2272D] hover:bg-[#A51E23] disabled:bg-slate-400 text-white rounded-full font-semibold text-[16px] shadow-md shadow-[#C2272D]/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-3 hover:scale-[1.01] active:scale-[0.99]"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPaperPlane size={15} />
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
