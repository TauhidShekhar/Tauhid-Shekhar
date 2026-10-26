import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaLaptopCode, FaServer, FaReact, FaPaintBrush, 
  FaClock, FaCheck, FaCartPlus, FaComments, FaArrowRight, 
  FaTimes, FaFilter, FaStar, FaSync, FaShieldAlt, FaShareAlt
} from 'react-icons/fa';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InquireModal from '../components/InquireModal';
import ServiceShareModal from '../components/ServiceShareModal';
import { formatDualPrice } from '../utils/priceFormatter';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [currency, setCurrency] = useState('both'); // 'both' | 'USD' | 'INR'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inquire Modal state
  const [inquireService, setInquireService] = useState(null);
  const [isInquireOpen, setIsInquireOpen] = useState(false);

  // Share Modal state
  const [shareService, setShareService] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Fetch Services & Categories
  const fetchServicesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {};
      if (selectedCategory && selectedCategory !== 'All') {
        queryParams.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }
      if (sortBy && sortBy !== 'default') {
        queryParams.sort = sortBy;
      }

      const [servicesRes, catRes] = await Promise.all([
        api.getServices(queryParams),
        api.getServiceCategories()
      ]);

      if (servicesRes.success) {
        setServices(servicesRes.data || []);
      }

      if (catRes.success && Array.isArray(catRes.data)) {
        const names = catRes.data.map(c => c.name);
        setCategories(['All', ...new Set(names)]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, [selectedCategory, sortBy]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServicesData();
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('default');
  };

  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'FaReact':
        return <FaReact className="text-[#00FFFF]" size={24} />;
      case 'FaServer':
        return <FaServer className="text-[#00FFFF]" size={24} />;
      case 'FaPaintBrush':
        return <FaPaintBrush className="text-[#C2272D]" size={24} />;
      default:
        return <FaLaptopCode className="text-[#C2272D]" size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#C2272D] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 uppercase tracking-widest inline-block mb-3">
              Professional Engineering & Design
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-title tracking-tight mb-4 text-slate-900 dark:text-white">
              Tailored Services & Solutions
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Complete, end-to-end full stack web applications, interactive React frontends, high-performance REST APIs, and creative digital assets. Guaranteed turnaround and transparent milestone-based deliverables.
            </p>

            {/* Currency Preference Selector */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm mb-6 text-xs font-bold">
              <span className="text-[11px] text-slate-400 px-2 uppercase tracking-wider">Currency:</span>
              <button
                type="button"
                onClick={() => setCurrency('both')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currency === 'both' 
                    ? 'bg-[#C2272D] text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                USD & INR (Dual)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currency === 'INR' 
                    ? 'bg-[#C2272D] text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currency === 'USD' 
                    ? 'bg-[#C2272D] text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Search and Filters Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services, tech stacks, deliverables..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-[#C2272D] shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-[#C2272D] shadow-sm cursor-pointer text-slate-800 dark:text-white"
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="fastest">Fastest Turnaround</option>
                <option value="newest">Recently Added</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#C2272D] hover:bg-[#a51d23] text-white text-xs font-bold rounded-2xl transition shadow-md shadow-[#C2272D]/20 shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
              <FaFilter className="mx-auto text-slate-400 mb-3" size={32} />
              <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">No services match your criteria</h3>
              <p className="text-xs text-slate-500 mb-6">Try searching for other terms or resetting your active filters.</p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-xs font-bold transition cursor-pointer text-slate-800 dark:text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => {
                const deliverables = (svc.deliverables && svc.deliverables.length > 0)
                  ? svc.deliverables.slice(0, 4).map(d => d.title)
                  : (svc.features || []).slice(0, 4);

                const priceData = formatDualPrice(svc.price, currency);
                const packages = svc.packages || [];

                return (
                  <motion.div
                    key={svc._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-[#C2272D]/50 dark:hover:border-[#00FFFF]/50 rounded-3xl p-6 md:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-200 group"
                  >
                    {/* Top Right Badges & Share Icon */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                      {svc.featured && (
                        <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                          <FaStar size={9} /> Featured
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareService(svc);
                          setIsShareOpen(true);
                        }}
                        className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#C2272D] hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shadow-sm"
                        title={`Share ${svc.title}`}
                        aria-label={`Share ${svc.title}`}
                      >
                        <FaShareAlt size={10} />
                      </button>
                    </div>

                    <div>
                      {/* Top Bar: Icon & Category */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center shrink-0">
                          {getServiceIcon(svc.iconName)}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-[#C2272D] uppercase tracking-wider block">
                            {svc.category || 'Engineering'}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <FaClock size={10} className="text-slate-400" />
                              {svc.timeline?.estimatedDays || 7} Days
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium">
                              <FaSync size={10} className="text-slate-400" />
                              {svc.timeline?.revisionsIncluded || 'Unlimited'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Title & Short Description */}
                      <h3 className="text-lg font-bold font-title text-slate-900 dark:text-white mb-2 group-hover:text-[#C2272D] transition">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {svc.shortDescription || svc.desc}
                      </p>

                      {/* Package Tiers Preview Chips */}
                      {packages.length > 0 && (
                        <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                            Available Package Tiers:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {packages.map((pkg, pIdx) => {
                              const pkgPrice = formatDualPrice(pkg.price, currency);
                              return (
                                <Link
                                  key={pIdx}
                                  to={`/services/${svc.slug}/order?package=${encodeURIComponent(pkg.name)}`}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                                    pkg.isPopular
                                      ? 'bg-[#C2272D]/10 text-[#C2272D] border-[#C2272D]/30 hover:bg-[#C2272D] hover:text-white'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-400'
                                  }`}
                                  title={`Click to order ${pkg.name} (${pkg.deliveryDays} Days)`}
                                >
                                  {pkg.name}: {pkgPrice.primary}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Deliverables / Features Tags */}
                      <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                          Core Deliverables:
                        </span>
                        {deliverables.map((del, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <FaCheck size={10} className="text-emerald-500 shrink-0" />
                            <span className="truncate">{del}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                          Starting From
                        </span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-[#C2272D] font-title">
                            {priceData.primary}
                          </span>
                          {priceData.secondary && (
                            <span className="text-xs text-slate-400 font-bold ml-1.5">
                              {priceData.secondary}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Link
                          to={`/services/${svc.slug}`}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>View Details</span>
                          <FaArrowRight size={10} />
                        </Link>
                        <Link
                          to={`/services/${svc.slug}/order`}
                          className="py-2.5 px-3 rounded-xl bg-[#C2272D] hover:bg-[#a51d23] text-white text-xs font-bold text-center transition shadow-md shadow-[#C2272D]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FaCartPlus size={11} />
                          <span>Order</span>
                        </Link>
                      </div>

                      {/* Inquire & Share Dual Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInquireService(svc);
                            setIsInquireOpen(true);
                          }}
                          className="py-2 px-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                        >
                          <FaComments size={11} />
                          <span>Inquire</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareService(svc);
                            setIsShareOpen(true);
                          }}
                          className="py-2 px-2 text-[11px] font-bold text-[#C2272D] dark:text-[#00FFFF] hover:opacity-85 transition flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/20"
                          title={`Share ${svc.title}`}
                        >
                          <FaShareAlt size={10} />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Inquiry Modal */}
      <InquireModal
        isOpen={isInquireOpen}
        onClose={() => {
          setIsInquireOpen(false);
          setInquireService(null);
        }}
        service={inquireService}
      />

      {/* Share Service Modal */}
      <ServiceShareModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setShareService(null);
        }}
        service={shareService}
      />
    </div>
  );
};

export default ServicesPage;
