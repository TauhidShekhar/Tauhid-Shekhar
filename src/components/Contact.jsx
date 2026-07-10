import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

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
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return trimmed;
};

const Contact = ({ onShowToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
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
  const mapEmbedRaw = settings?.mapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108604.38204859068!2d74.80284487532353!3d31.633979268875355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4d74.87226424999999!3m2!1m2!1s0x391964aa569e7355%3A0xe021a60ccab1c0ef!2sAmritsar%2C%20Punjab!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
  const mapEmbedVal = extractIframeSrc(mapEmbedRaw);

  const contactDetails = [
    { title: 'Email', value: emailVal, href: `mailto:${emailVal}`, icon: <FaEnvelope className="text-primary-blue" /> },
    { title: 'Phone', value: phoneVal, href: `tel:${phoneVal.replace(/\s+/g, '')}`, icon: <FaPhone className="text-primary-purple" /> },
    { title: 'Location', value: addressVal, href: null, icon: <FaMapMarkerAlt className="text-primary-cyan" /> },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.createMessage(formData);
      if (res.success) {
        onShowToast('Message Sent Successfully!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        onShowToast('Failed to send message. Please try again.');
      }
    } catch (error) {
      onShowToast(error.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
                {/* Mobile Number */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter project/inquiry subject"
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Type your message here..."
                  className="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary-blue hover:bg-accent-blue disabled:bg-slate-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
