import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaCheckCircle, FaPaperclip, FaExclamationTriangle, 
  FaCalendarAlt, FaDollarSign, FaShieldAlt, FaTrash, FaShoppingBag 
} from 'react-icons/fa';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatDualPrice } from '../utils/priceFormatter';

const ServiceOrderPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedPkg = searchParams.get('package') || 'Standard';

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(Boolean(slug));
  const [availableServices, setAvailableServices] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    selectedService: '',
    packageName: preselectedPkg,
    budget: '',
    projectType: 'Web Development',
    deadline: '',
    timelineExpectation: '2-4 Weeks',
    description: ''
  });

  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Fetch service details if slug is provided
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const loadData = async () => {
      try {
        if (slug) {
          const decodedSlug = decodeURIComponent(slug || '').trim();
          const res = await api.getServiceBySlug(decodedSlug);
          if (res.success && res.data) {
            setService(res.data);
            const initialPkg = res.data.packages?.find(p => p.name.toLowerCase() === preselectedPkg.toLowerCase()) || res.data.packages?.[0];
            setFormData(prev => ({
              ...prev,
              selectedService: res.data.title,
              packageName: initialPkg ? initialPkg.name : preselectedPkg,
              budget: initialPkg ? initialPkg.price : (res.data.price || '$149'),
              timelineExpectation: initialPkg ? `${initialPkg.deliveryDays} Days` : '1-2 Weeks'
            }));
          }
        }

        // Also fetch active services list in case user wants to pick another
        const allRes = await api.getServices();
        if (allRes.success && allRes.data) {
          setAvailableServices(allRes.data);
          if (!slug && allRes.data.length > 0) {
            const firstSvc = allRes.data[0];
            const firstPkg = firstSvc.packages?.find(p => p.name.toLowerCase() === preselectedPkg.toLowerCase()) || firstSvc.packages?.[0];
            setFormData(prev => ({
              ...prev,
              selectedService: firstSvc.title,
              packageName: firstPkg ? firstPkg.name : 'Standard',
              budget: firstPkg ? firstPkg.price : (firstSvc.price || '$99'),
              timelineExpectation: firstPkg ? `${firstPkg.deliveryDays} Days` : '1-2 Weeks'
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching service order context:', err);
      } finally {
        setLoadingService(false);
      }
    };

    loadData();
  }, [slug]);

  // When package tier changes, auto update budget suggestion and timeline
  const handlePackageSelect = (pkgName) => {
    let priceSuggestion = formData.budget;
    let timelineSuggestion = formData.timelineExpectation;
    if (service?.packages && service.packages.length > 0) {
      const match = service.packages.find(p => p.name.toLowerCase() === pkgName.toLowerCase());
      if (match) {
        priceSuggestion = match.price;
        timelineSuggestion = `${match.deliveryDays} Days`;
      }
    }
    setFormData(prev => ({
      ...prev,
      packageName: pkgName,
      budget: priceSuggestion,
      timelineExpectation: timelineSuggestion
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit.');
        e.target.value = '';
        return;
      }
      setAttachment(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('companyName', formData.companyName);
      data.append('selectedService', formData.selectedService);
      if (service?._id) {
        data.append('serviceId', service._id);
      }
      data.append('packageName', formData.packageName);
      data.append('budget', formData.budget);
      data.append('projectType', formData.projectType);
      data.append('deadline', formData.deadline);
      data.append('timelineExpectation', formData.timelineExpectation);
      data.append('description', formData.description);
      data.append('requestType', 'order');

      if (attachment) {
        data.append('attachment', attachment);
      }

      const res = await api.createOrder(data);
      if (res.success) {
        setOrderConfirmation(res);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit order request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#C2272D] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              to={slug ? `/services/${slug}` : '/services'}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#C2272D] transition"
            >
              <FaArrowLeft /> Back to {slug ? service?.title || 'Service Details' : 'Services'}
            </Link>
          </div>

          {orderConfirmation ? (
            /* Success Confirmation Screen */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle size={40} />
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-slate-900 dark:text-white">
                Order Request Submitted!
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-8">
                Your order has been safely registered in our database and our engineering team has been notified.
              </p>

              <div className="max-w-md mx-auto bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-8 text-left">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Order Reference Code
                  </span>
                  <span className="font-mono text-base font-bold text-[#C2272D]">
                    {orderConfirmation.referenceId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-500 dark:text-slate-400">Selected Service:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.selectedService}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-500 dark:text-slate-400">Package Tier:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.packageName}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-500 dark:text-slate-400">Proposed Budget:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formData.budget}</span>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A receipt has been dispatched to <strong className="text-slate-700 dark:text-slate-200">{formData.email}</strong>. We will review your project specs and respond within 24 hours.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/"
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition"
                  >
                    Return Home
                  </Link>
                  <Link
                    to="/services"
                    className="w-full sm:w-auto px-6 py-3 bg-[#C2272D] hover:bg-[#a51d23] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-[#C2272D]/20"
                  >
                    Browse Other Services
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Order Submission Form */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center shrink-0">
                  <FaShoppingBag size={22} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Place Service Order
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    {service ? `Ordering: ${service.title}` : 'Fill in project parameters to initiate development'}
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
                  <FaExclamationTriangle className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Package Tier Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    1. Select Package Tier
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Basic', 'Standard', 'Premium', 'Custom'].map((pkg) => {
                      const isSelected = formData.packageName.toLowerCase() === pkg.toLowerCase();
                      const matchPkg = service?.packages?.find(p => p.name.toLowerCase() === pkg.toLowerCase());
                      const priceInfo = matchPkg ? formatDualPrice(matchPkg.price) : null;

                      return (
                        <button
                          key={pkg}
                          type="button"
                          onClick={() => handlePackageSelect(pkg)}
                          className={`p-3.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between min-h-[72px] ${
                            isSelected
                              ? 'bg-[#C2272D] text-white border-[#C2272D] shadow-md shadow-[#C2272D]/20'
                              : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-extrabold text-xs">{pkg}</span>
                            {matchPkg && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                              }`}>
                                {matchPkg.deliveryDays}d
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-white' : 'text-[#C2272D] dark:text-[#00FFFF]'}`}>
                            {priceInfo ? `${priceInfo.primary} ${priceInfo.secondary ? priceInfo.secondary : ''}` : (pkg === 'Custom' ? 'Custom Quote' : '$99')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Service Selection (if not locked by slug) */}
                {!service && availableServices.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Selected Service *
                    </label>
                    <select
                      name="selectedService"
                      required
                      value={formData.selectedService}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    >
                      {availableServices.map(s => (
                        <option key={s._id} value={s.title}>{s.title} ({s.price})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Client Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="alex@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9142725562"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
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
                      onChange={handleInputChange}
                      placeholder="Organization Name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>

                {/* Project Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Proposed Budget *
                    </label>
                    <input
                      type="text"
                      name="budget"
                      required
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="$149 or Flexible"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Project Type
                    </label>
                    <input
                      type="text"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      placeholder="MVP, Redesign, API integration"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                      Target Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>

                {/* Description / Scope */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Project Scope & Requirements *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a comprehensive breakdown of your required features, target users, any reference links, tech stack preferences, and integration endpoints..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#C2272D]"
                  />
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    Attach Wireframe / Brief / Specs (Max 50MB)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 hover:border-[#C2272D] text-xs font-semibold flex items-center gap-2 transition">
                      <FaPaperclip />
                      <span>{attachment ? 'Replace File' : 'Choose Attachment'}</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {attachment && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">{attachment.name}</span>
                        <span className="text-slate-400">({(attachment.size / 1024 / 1024).toFixed(1)} MB)</span>
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit & Guarantee */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <FaShieldAlt className="text-emerald-500" />
                    <span>Protected by anti-duplicate verification & SSL encryption</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-8 py-3.5 bg-[#C2272D] hover:bg-[#a51d23] text-white font-bold rounded-xl shadow-lg shadow-[#C2272D]/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Submit Order Request &rarr;</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceOrderPage;
