import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaCheck, FaClock, FaTags, FaShieldAlt, 
  FaLaptopCode, FaServer, FaReact, FaPaintBrush, FaExternalLinkAlt, 
  FaGithub, FaQuestionCircle, FaChevronDown, FaComments, FaCartPlus, 
  FaExclamationCircle, FaStar, FaSync, FaShareAlt
} from 'react-icons/fa';
import { api } from '../services/api';
import InquireModal from '../components/InquireModal';
import ServiceShareModal from '../components/ServiceShareModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatDualPrice } from '../utils/priceFormatter';

const ServiceDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('both'); // 'both' | 'USD' | 'INR'

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchServiceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const decodedSlug = decodeURIComponent(slug || '').trim();
        const res = await api.getServiceBySlug(decodedSlug);
        if (res.success && res.data) {
          setService(res.data);
          setRelatedServices(res.relatedServices || []);
          if (res.data.slug && res.data.slug !== slug) {
            window.history.replaceState(null, '', `/services/${res.data.slug}`);
          }
          if (res.data.packages && res.data.packages.length > 0) {
            const popular = res.data.packages.find(p => p.isPopular) || res.data.packages[0];
            setSelectedPackage(popular);
          }
        } else {
          setError('Service not found or unpublished.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [slug]);

  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'FaReact':
        return <FaReact className="text-[#00FFFF]" size={32} />;
      case 'FaServer':
        return <FaServer className="text-[#00FFFF]" size={32} />;
      case 'FaPaintBrush':
        return <FaPaintBrush className="text-[#C2272D]" size={32} />;
      default:
        return <FaLaptopCode className="text-[#C2272D]" size={32} />;
    }
  };

  const handleOrderRedirect = (pkgName) => {
    const targetPkg = pkgName || selectedPackage?.name || 'Standard';
    navigate(`/services/${slug}/order?package=${encodeURIComponent(targetPkg)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-28 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded mb-8" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-4" />
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-white/10 rounded mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-2xl md:col-span-2" />
            <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-28 text-center">
          <FaExclamationCircle size={48} className="text-[#C2272D] mb-4" />
          <h1 className="text-3xl font-extrabold mb-2">Service Not Available</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            {error || 'The requested service may be archived, drafted, or does not exist.'}
          </p>
          <Link
            to="/services"
            className="px-6 py-3 bg-[#C2272D] hover:bg-[#a51d23] text-white font-semibold rounded-xl transition cursor-pointer"
          >
            Explore All Services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const packagesList = (service.packages && service.packages.length > 0) ? service.packages : [
    {
      name: 'Basic',
      price: service.price || '$99',
      description: 'Essential core features, clean implementation and base deliverables.',
      deliveryDays: 5,
      revisions: '2 Revisions',
      features: service.features?.slice(0, 3) || ['Clean semantic code', 'Responsive layout', 'Basic documentation'],
      isPopular: false
    },
    {
      name: 'Standard',
      price: '$199',
      description: 'Full production-ready solution with advanced features and optimizations.',
      deliveryDays: 10,
      revisions: 'Unlimited',
      features: service.features || ['Full feature scope', 'Modern responsive UI', 'API integrations', 'Deployment assist'],
      isPopular: true
    },
    {
      name: 'Premium',
      price: '$349',
      description: 'Enterprise grade execution, priority delivery, and extended support.',
      deliveryDays: 15,
      revisions: 'Unlimited',
      features: [...(service.features || []), 'High performance audit', 'SEO & security best practices', '30-day post-launch support'],
      isPopular: false
    }
  ];

  const defaultProcess = [
    { step: 1, title: 'Discovery & Consultation', description: 'Reviewing requirements, tech stack evaluation, and wireframing expectations.' },
    { step: 2, title: 'Architecture & Design', description: 'Database schema modeling, UI component blueprints, and security specs.' },
    { step: 3, title: 'Core Implementation', description: 'Writing semantic, modular, and performant code with progress updates.' },
    { step: 4, title: 'Testing & Optimization', description: 'Cross-browser verification, responsive testing, and speed profiling.' },
    { step: 5, title: 'Deployment & Setup', description: 'Server deployment, CI/CD pipeline hookup, and SSL configuration.' },
    { step: 6, title: 'Handover & Support', description: 'Source code handoff, video walkthroughs, and warranty support.' }
  ];

  const processSteps = (service.process && service.process.length > 0) ? service.process : defaultProcess;
  const startingPriceData = formatDualPrice(service.price, currency);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#C2272D] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Breadcrumb Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-[#C2272D] transition">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-[#C2272D] transition">Services</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">{service.title}</span>
          </div>
        </div>

        {/* Hero Banner Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-br dark:from-[#0d1322] dark:to-[#070b14] p-6 sm:p-8 md:p-12 shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C2272D]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20">
                    {service.category || 'Web Development'}
                  </span>
                  {service.featured && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5">
                      <FaStar size={11} /> Featured Service
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 flex items-center gap-1.5 font-medium">
                    <FaClock size={11} /> {service.timeline?.estimatedDays || 7} Days Turnaround
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 flex items-center gap-1.5 font-medium">
                    <FaSync size={11} /> {service.timeline?.revisionsIncluded || 'Unlimited'} Revisions
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-title tracking-tight mb-4 text-slate-900 dark:text-white">
                  {service.title}
                </h1>

                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {service.shortDescription || service.desc}
                </p>

                {/* Currency Switcher in Service Header */}
                <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm mb-6 text-xs font-bold">
                  <span className="text-[10px] text-slate-400 px-2 uppercase tracking-wider">Currency:</span>
                  <button
                    type="button"
                    onClick={() => setCurrency('both')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      currency === 'both' ? 'bg-[#C2272D] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Both ($ & ₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('INR')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      currency === 'INR' ? 'bg-[#C2272D] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ₹ INR
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      currency === 'USD' ? 'bg-[#C2272D] text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    $ USD
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => handleOrderRedirect()}
                    className="px-6 py-3.5 bg-[#C2272D] hover:bg-[#a51d23] text-white font-bold rounded-xl shadow-lg shadow-[#C2272D]/25 transition flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <FaCartPlus />
                    <span>Order This Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInquireOpen(true)}
                    className="px-5 py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-white/10 transition flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <FaComments />
                    <span>Inquire / Custom Scope</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsShareOpen(true)}
                    className="px-4 py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-white/10 transition flex items-center gap-2 cursor-pointer text-sm"
                    title="Share this service"
                  >
                    <FaShareAlt className="text-[#C2272D] dark:text-[#00FFFF]" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Pricing Highlights Box */}
              <div className="shrink-0 w-full lg:w-80 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-white/10">
                  {getServiceIcon(service.iconName)}
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Starting Price
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#C2272D] mb-1 font-title">
                  {startingPriceData.primary}
                </div>
                {startingPriceData.secondary && (
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                    {startingPriceData.secondary}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Guaranteed turnaround with milestone updates and source code ownership.
                </p>
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <FaShieldAlt /> 100% Quality & Verification Guarantee
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Scope & Deliverables */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Scope Overview & Deliverables */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold font-title mb-4 text-slate-900 dark:text-white">
                  Overview & Execution Strategy
                </h2>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base space-y-4 whitespace-pre-line">
                  {service.fullDescription || service.desc || 'We architect solutions tailored specifically to project demands, ensuring clean architecture, high scalability, and seamless integration.'}
                </div>
              </div>

              {/* What's Included / Deliverables */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold font-title mb-6 text-slate-900 dark:text-white">
                  Included Deliverables & Artifacts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(service.deliverables && service.deliverables.length > 0) ? (
                    service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <FaCheck size={12} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    (service.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <FaCheck size={12} />
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{feat}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Timeline Specs & Client Requirements */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-title mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClock className="text-[#C2272D]" /> Timeline & Specifications
                </h3>
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400">Estimated Turnaround</span>
                    <span className="font-bold text-slate-900 dark:text-white">{service.timeline?.estimatedDays || 7} Days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400">Revisions Included</span>
                    <span className="font-bold text-slate-900 dark:text-white">{service.timeline?.revisionsIncluded || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400">Pricing Model</span>
                    <span className="font-bold capitalize text-slate-900 dark:text-white">
                      {(service.pricingModel || 'Starting At').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400">Technical Support</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">30 Days Included</span>
                  </div>
                </div>

                {service.timeline?.clientDependencies && service.timeline.clientDependencies.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Client Inputs Needed:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {service.timeline.clientDependencies.map((dep, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C2272D]" />
                          <span>{dep}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Quick Inquiry Box */}
              <div className="bg-gradient-to-br from-[#C2272D]/10 to-cyan-500/10 border border-[#C2272D]/20 rounded-2xl p-6 text-center">
                <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">Need a custom scope or feature?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Have unique business logic, specific APIs, or urgent deadline?
                </p>
                <button
                  type="button"
                  onClick={() => setIsInquireOpen(true)}
                  className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 hover:border-[#C2272D] text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Discuss Custom Quote
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Packages Comparison Table */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C2272D]/10 text-[#C2272D] uppercase tracking-wider mb-2 inline-block">
              Clear Tiered Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-title mb-3 text-slate-900 dark:text-white">
              Transparent Packages & Inclusions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select the tier that aligns with your scale, deliverables, and launch timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packagesList.map((pkg, idx) => {
              const isPopular = pkg.isPopular;
              const pkgPriceData = formatDualPrice(pkg.price, currency);

              return (
                <div
                  key={idx}
                  className={`relative rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                    isPopular
                      ? 'bg-white dark:bg-slate-900 border-[#C2272D] shadow-2xl shadow-[#C2272D]/15 md:scale-105 z-10'
                      : 'bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C2272D] text-white shadow-md">
                      Most Popular Tier
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold font-title text-slate-900 dark:text-white">{pkg.name}</h3>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold">
                        <FaClock size={10} /> {pkg.deliveryDays} Days
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 min-h-[36px] leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="mb-6">
                      <div className="text-3xl sm:text-4xl font-black text-[#C2272D] font-title">
                        {pkgPriceData.primary}
                      </div>
                      {pkgPriceData.secondary && (
                        <div className="text-xs font-bold text-slate-400 mt-0.5">
                          {pkgPriceData.secondary} / full project
                        </div>
                      )}
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 gap-2 mb-6 py-2 border-y border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FaSync size={11} className="text-[#C2272D]" />
                        <span>{pkg.revisions || 'Unlimited'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <FaShieldAlt size={11} className="text-emerald-500" />
                        <span>30-Day Support</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-8">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Included in this package:
                      </span>
                      {(pkg.features || []).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <FaCheck className="text-emerald-500 shrink-0 mt-0.5" size={11} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOrderRedirect(pkg.name)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-[#C2272D] hover:bg-[#a51d23] text-white shadow-lg shadow-[#C2272D]/20'
                        : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <FaCartPlus size={13} />
                    <span>Select {pkg.name} Package</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6-Step Workflow Process */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold font-title mb-2 text-slate-900 dark:text-white">
                How We Deliver
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                A battle-tested 6-step engineering methodology ensuring seamless execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processSteps.map((step, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#C2272D]/10 text-[#C2272D] font-mono font-bold flex items-center justify-center text-sm mb-3">
                    0{step.step || idx + 1}
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{step.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-title mb-2 text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Clear answers regarding delivery, revisions, source code ownership, and warranties.
              </p>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-slate-800 dark:text-white cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FaQuestionCircle className="text-[#C2272D] shrink-0" />
                        <span>{faq.question}</span>
                      </span>
                      <FaChevronDown
                        className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#C2272D]' : ''
                        }`}
                        size={12}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="border-t border-slate-200 dark:border-white/10 pt-12">
              <h3 className="text-xl font-bold font-title mb-6 text-slate-900 dark:text-white">
                Other Recommended Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedServices.map((rel, idx) => {
                  const relPrice = formatDualPrice(rel.price, currency);
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-sm hover:border-[#C2272D] transition"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-[#C2272D] uppercase tracking-wider block mb-1">
                          {rel.category || 'Service'}
                        </span>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">{rel.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                          {rel.shortDescription || rel.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Starts At</span>
                          <span className="text-sm font-bold text-[#C2272D]">{relPrice.primary}</span>
                        </div>
                        <Link
                          to={`/services/${rel.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Inquiry Modal */}
      <InquireModal
        isOpen={isInquireOpen}
        onClose={() => setIsInquireOpen(false)}
        service={service}
      />

      {/* Share Service Modal */}
      <ServiceShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        service={service}
      />
    </div>
  );
};

export default ServiceDetails;
