import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaClock,
  FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaFacebook 
} from 'react-icons/fa';

const Contact = ({ onShowToast }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [res, aboutRes] = await Promise.all([
          api.getSettings(),
          api.getAbout()
        ]);
        if (res.success) {
          setSettings(res.data);
          
          // Pre-populate empty form state based on loaded fields
          const defaultFields = [
            { id: '1', name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Enter your name' },
            { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'Enter your email' },
            { id: '3', name: 'phone', label: 'Mobile Number', type: 'text', required: false, placeholder: 'Enter mobile number' },
            { id: '4', name: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Enter project/inquiry subject' },
            { id: '5', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Type your message here...' }
          ];
          const formFields = res.data?.contactFormFields?.length ? res.data.contactFormFields : defaultFields;
          const initialData = {};
          formFields.forEach(f => {
            initialData[f.name] = '';
          });
          setFormData(initialData);
        }
        if (aboutRes.success) {
          setAboutSettings(aboutRes.data);
        }
      } catch (err) {
        console.error('Failed to load contact settings:', err.message);
      }
    };
    loadSettings();
  }, []);

  const emailVal = aboutSettings?.aboutContactInfo?.email || settings?.email || 'shekhartauhid@gmail.com';
  const phoneVal = aboutSettings?.aboutContactInfo?.phone || settings?.phone || '+91 9142725562';
  const addressVal = aboutSettings?.aboutContactInfo?.address || settings?.address || 'Amritsar, Punjab, India';
  const workingHoursVal = settings?.workingHours || 'Mon - Fri: 9:00 AM - 6:00 PM';
  const mapEmbedVal = settings?.mapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108604.38204859068!2d74.80284487532353!3d31.633979268875355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4d74.87226424999999!3m2!1m2!1s0x391964aa569e7355%3A0xe021a60ccab1c0ef!2sAmritsar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

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
    { key: 'youtube', icon: <FaYoutube />, color: 'hover:bg-red-650' },
    { key: 'facebook', icon: <FaFacebook />, color: 'hover:bg-blue-600' }
  ].filter(p => socialLinks[p.key]);

  return (
    <section id="contact" className="py-24 bg-white dark:bg-slate-900/40 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">Get In Touch</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">Contact Me</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {contactDetails.map((detail, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-5 hover:scale-[1.01] transition-all duration-300 text-left"
              >
                <div className="p-3.5 rounded-xl bg-slate-550/5 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-white/5 shadow-inner">
                  {detail.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">{detail.title}</h4>
                  {detail.href ? (
                    <a href={detail.href} className="text-base font-bold text-black dark:text-white hover:text-primary-blue dark:hover:text-primary-blue transition-colors">
                      {detail.value}
                    </a>
                  ) : (
                    <span className="text-base font-bold text-black dark:text-white">{detail.value}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Social Links Block */}
            {socialPlatforms.length > 0 && (
              <div className="glass p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm text-left flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connect With Me</h4>
                <div className="flex gap-3">
                  {socialPlatforms.map((platform, pIdx) => (
                    <a
                      key={pIdx}
                      href={socialLinks[platform.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-xl bg-slate-550/5 dark:bg-slate-900 border border-slate-200/40 dark:border-white/5 flex items-center justify-center text-slate-655 dark:text-slate-300 transition-all duration-300 hover:text-white ${platform.color} shadow-sm`}
                    >
                      {platform.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Google Map */}
            {mapEmbedVal && (
              <div className="glass p-3 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden h-[240px]">
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
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-7"
          >
            <form onSubmit={handleFormSubmit} className="glass p-8 md:p-10 rounded-[30px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col gap-6 text-left">
              
              {formFields.map((field, fIdx) => (
                <div key={field.id || fIdx} className="flex flex-col gap-2">
                  {field.type !== 'checkbox' && (
                    <label htmlFor={field.name} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
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
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      required={field.required}
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-2.5 py-1">
                      <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        checked={!!formData[field.name]}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-4 h-4 text-primary-blue border-slate-250 dark:border-white/10 rounded focus:ring-primary-blue"
                      />
                      <label htmlFor={field.name} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                    </div>
                  ) : field.type === 'radio' ? (
                    <div className="flex flex-wrap gap-4 py-1">
                      {field.options?.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-350 cursor-pointer">
                          <input
                            type="radio"
                            name={field.name}
                            value={opt}
                            checked={formData[field.name] === opt}
                            onChange={handleInputChange}
                            required={field.required}
                            className="w-4 h-4 text-primary-blue focus:ring-primary-blue"
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
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                    />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-blue hover:bg-accent-blue disabled:bg-slate-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Message <FaPaperPlane size={12} />
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
