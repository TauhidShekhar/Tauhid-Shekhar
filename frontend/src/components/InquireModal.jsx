import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaCheckCircle, FaExclamationTriangle, FaComments } from 'react-icons/fa';
import { api } from '../services/api';

const InquireModal = ({ isOpen, onClose, service }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        selectedService: service?.title || 'General Consultation',
        serviceId: service?._id,
        description: formData.description,
        requestType: 'inquiry'
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      description: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 my-8 text-slate-800 dark:text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
            aria-label="Close Modal"
          >
            <FaTimes size={18} />
          </button>

          {successData ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Inquiry Received!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Thank you for reaching out. We have logged your request.
              </p>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 mb-6">
                <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                  Ticket Reference Code
                </span>
                <span className="font-mono text-lg font-bold text-[#C2272D]">
                  {successData.referenceId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                A confirmation has been sent to your email. We typically respond within 24 hours.
              </p>
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 bg-[#C2272D] hover:bg-[#a51d23] text-white font-semibold rounded-xl transition duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-[#00FFFF] flex items-center justify-center">
                  <FaComments size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Inquire About Service</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {service?.title ? `For: ${service.title}` : 'Quick consultation & scope inquiry'}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-2">
                  <FaExclamationTriangle className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tauhid Shekhar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="client@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9142725562"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Acme Inc."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    What would you like to know or discuss? *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your project requirements, questions regarding timeline, tech stack, or specific deliverable needs..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#C2272D] hover:bg-[#a51d23] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#C2272D]/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaPaperPlane size={13} />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InquireModal;
