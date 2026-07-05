import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FaLaptopCode, FaServer, FaReact, FaPaintBrush, FaTimes, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const Services = () => {
  const defaultServices = [
    {
      title: 'MERN Stack Web Development',
      desc: 'End-to-end full stack web applications integrating React frontends with Node.js/Express.js REST APIs and MongoDB databases.',
      price: '$149',
      iconName: 'FaLaptopCode',
      features: ['Admin & Teacher Dashboards', 'JWT Authentication', 'MongoDB Schema Modeling', 'CRUD Operations']
    },
    {
      title: 'Frontend Development',
      desc: 'Converting graphic layouts (Figma/Adobe) into clean, semantic HTML5, CSS3, and modern interactive React.js modules.',
      price: '$99',
      iconName: 'FaReact',
      features: ['Responsive UI Layouts', 'Apple Style Animations', 'Speed Optimization', 'Cross-browser Compatibility']
    },
    {
      title: 'REST API & Backend Development',
      desc: 'Architecting secure backend servers, integrating third-party endpoints, database connections, and session management.',
      price: '$79',
      iconName: 'FaServer',
      features: ['Express.js Routing', 'JWT & Auth Guards', 'MySQL & MongoDB integration', 'Error handling middleware']
    },
    {
      title: 'Thumbnail & Graphic Design',
      desc: 'Eye-catching, high-converting YouTube thumbnails, banners, posters, and professional brand assets designed to secure clicks.',
      price: '$15',
      iconName: 'FaPaintBrush',
      features: ['YouTube Thumbnail Packages', 'Instagram Ads/Posts', 'Custom Brand Logos', 'Adobe Suite Production']
    }
  ];

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'FaLaptopCode':
        return <FaLaptopCode size={26} className="text-primary-blue" />;
      case 'FaReact':
        return <FaReact size={26} className="text-primary-cyan" />;
      case 'FaServer':
        return <FaServer size={26} className="text-primary-purple" />;
      case 'FaPaintBrush':
        return <FaPaintBrush size={24} className="text-pink-500" />;
      default:
        return <FaLaptopCode size={26} className="text-primary-blue" />;
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.getServices();
        if (res.success && res.data && res.data.length > 0) {
          setServices(res.data);
        } else {
          setServices(defaultServices);
        }
      } catch (err) {
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    serviceType: '',
    budget: '',
    projectType: '',
    deadline: '',
    description: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const openOrderModal = (serviceTitle) => {
    // Map service title to enum options correctly
    let matchedEnum = 'Other Custom Service';
    if (serviceTitle.includes('MERN')) matchedEnum = 'MERN Stack Web Development';
    else if (serviceTitle.includes('Frontend')) matchedEnum = 'Frontend Development';
    else if (serviceTitle.includes('REST')) matchedEnum = 'REST API & Backend Development';
    else if (serviceTitle.includes('Thumbnail')) matchedEnum = 'Thumbnail & Graphic Design';

    setFormData({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      serviceType: matchedEnum,
      budget: '',
      projectType: '',
      deadline: '',
      description: ''
    });
    setAttachment(null);
    setSubmitSuccess(false);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds the 50MB limit.');
        e.target.value = '';
        return;
      }
      setAttachment(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('companyName', formData.companyName);
      submitData.append('selectedService', formData.serviceType); // maps to selectedService in Order model
      submitData.append('budget', formData.budget);
      submitData.append('projectType', formData.projectType);
      submitData.append('deadline', formData.deadline);
      submitData.append('description', formData.description);
      if (attachment) {
        submitData.append('attachment', attachment);
      }

      const res = await api.createOrder(submitData);
      if (res.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          companyName: '',
          serviceType: '',
          budget: '',
          projectType: '',
          deadline: '',
          description: ''
        });
        setAttachment(null);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="services" className="py-24 bg-slate-50 dark:bg-black relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">What I Offer</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">Design & Dev Services</h2>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="glass p-8 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                 {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shadow-inner">
                    {getIcon(service.iconName)}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Starting From</span>
                    <span className="text-3xl font-black text-primary-blue font-title">{service.price}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-black font-title text-black dark:text-white mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-655 dark:text-slate-400 mb-6 leading-relaxed">
                  {service.desc}
                </p>

                {/* Features */}
                <ul className="grid grid-cols-2 gap-3 mb-8">
                  {(service.features || []).map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-blue shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
                <button
                  onClick={() => openOrderModal(service.title)}
                  className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-center text-sm font-extrabold shadow-lg shadow-primary-blue/10 transition-all cursor-pointer"
                >
                  Order Service
                </button>
                <a
                  href="#contact"
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-center text-sm font-extrabold border border-slate-200 dark:border-white/5 transition-all"
                >
                  Inquire Info
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Transactional Service Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg glass p-6 md:p-8 rounded-[28px] border border-slate-200/80 dark:border-white/10 shadow-2xl z-10 text-left bg-white dark:bg-slate-950"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes size={16} />
              </button>

              {/* Title */}
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-black font-title text-black dark:text-white">Order a Service</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Specify your project details and budget requirements to get started.</p>
              </div>

              {submitSuccess ? (
                /* Success animation view */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center gap-4"
                >
                  <FaCheckCircle className="text-green-500 animate-bounce" size={54} />
                  <div>
                    <h4 className="text-lg font-black text-black dark:text-white">Order Placed Successfully!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">Thank you. I have received your service request and will contact you via email shortly.</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 bg-slate-900 dark:bg-white/10 text-white rounded-xl text-xs font-bold mt-2 hover:opacity-90 cursor-pointer"
                  >
                    Close Window
                  </button>
                </motion.div>
              ) : (
                /* Form View */
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold">
                      ❌ {submitError}
                    </div>
                  )}                  {/* Name & Email Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tauhid Shekhar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="client@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                  </div>

                  {/* Phone & Company Name Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name (Optional)</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                  </div>

                  {/* Service type & Budget Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Category</label>
                      <select
                        name="serviceType"
                        required
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      >
                        <option value="" disabled>Select service...</option>
                        <option value="MERN Stack Web Development">MERN Stack Web Dev</option>
                        <option value="Frontend Development">Frontend Development</option>
                        <option value="REST API & Backend Development">REST API & Backend</option>
                        <option value="Thumbnail & Graphic Design">Thumbnail & Graphic Design</option>
                        <option value="Other Custom Service">Other Custom Service</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget / Price Requirement</label>
                      <input
                        type="text"
                        name="budget"
                        required
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="e.g. $150 or $20/hr"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                  </div>

                  {/* Project Type & Target Deadline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Type</label>
                      <input
                        type="text"
                        name="projectType"
                        value={formData.projectType}
                        onChange={handleInputChange}
                        placeholder="e.g. E-commerce Website"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Deadline</label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                  </div>

                  {/* Order Description details */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project details & Information</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Briefly describe what you want built or designed, timeline scope, and any details..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue resize-none"
                    />
                  </div>

                  {/* File Attachment Upload */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attach Brief/Assets (Image, PDF, ZIP &mdash; Max 50MB)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf,.zip,.rar"
                      onChange={handleFileChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs focus:outline-none focus:border-primary-blue cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary-blue hover:bg-accent-blue disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-primary-blue/20 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Submitting Order request...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={10} /> Submit Order Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
