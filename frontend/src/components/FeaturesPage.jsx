import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  FaRocket, FaSearch, FaMagic, FaGift, FaUsers, FaUser, 
  FaBriefcase, FaCog, FaCheckCircle, FaExclamationCircle, FaShieldAlt,
  FaSun, FaMoon 
} from 'react-icons/fa';

const CATEGORIES = ['All', 'Portfolio', 'Community', 'ATS Checker', 'AI Suite', 'Services', 'Management'];

// Fallback seed features if none in DB
const DEFAULT_FEATURES = [
  {
    name: 'Interactive Portfolio Showcase',
    category: 'Portfolio',
    icon: 'FaUser',
    description: 'Explore active developer projects, verified educational credentials, skill sets, and professional timeline histories through a modern, fully-responsive dashboard.',
    loginRequired: false,
    isNewFeature: false,
    isFeatured: true,
    version: '1.0.0'
  },
  {
    name: 'Developer Community Center',
    category: 'Community',
    icon: 'FaUsers',
    description: 'Connect and discuss topics with fellow developers. Features full feed timeline, group creation engines, resource attachments, and threaded commenting.',
    loginRequired: true,
    isNewFeature: false,
    isFeatured: true,
    version: '1.2.0'
  },
  {
    name: 'ATS Automated Resume Scanner',
    category: 'ATS Checker',
    icon: 'FaMagic',
    description: 'Analyze your resume against ATS tracking algorithms. Receive comprehensive match scores, formatting checks, and missing keyword identification logs.',
    loginRequired: true,
    isNewFeature: true,
    isFeatured: true,
    version: '1.3.2'
  },
  {
    name: 'AI Developer Assistant Suite',
    category: 'AI Suite',
    icon: 'FaRocket',
    description: 'Leverage generative AI algorithms to auto-review coding snippets, generate markdown blogs, and write optimized resume summaries.',
    loginRequired: true,
    isNewFeature: true,
    isFeatured: true,
    version: '1.4.0'
  },
  {
    name: 'Premium Freelancing Services',
    category: 'Services',
    icon: 'FaBriefcase',
    description: 'Browse, customize, and order premium development services directly from the site. Track project invoices, deliveries, and status updates.',
    loginRequired: true,
    isNewFeature: false,
    isFeatured: false,
    version: '1.1.0'
  },
  {
    name: 'Gamified Dev Achievements',
    category: 'Management',
    icon: 'FaGift',
    description: 'Earn experience points (XP) and developer coins by participating in discussion feeds, solving daily coding challenges, and maintaining login streaks.',
    loginRequired: true,
    isNewFeature: true,
    isFeatured: false,
    version: '1.2.5'
  },
  {
    name: 'Dark & Light Theme Console',
    category: 'Portfolio',
    icon: 'FaCog',
    description: 'Switch site interfaces dynamically using a custom theme management console, supporting responsive layouts and custom accessibility overrides.',
    loginRequired: false,
    isNewFeature: false,
    isFeatured: false,
    version: '1.0.1'
  },
  {
    name: 'Secure Two-Factor Authentication',
    category: 'Management',
    icon: 'FaShieldAlt',
    description: 'Enable hardware keys or authenticator codes for securing your administrative dashboards and client configurations.',
    loginRequired: true,
    isNewFeature: false,
    isFeatured: false,
    isComingSoon: true,
    version: '2.0.0'
  }
];

const FeaturesPage = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const VITE_ADMIN_URL = (rawAdminUrl && rawAdminUrl !== 'undefined' && rawAdminUrl !== 'null')
    ? rawAdminUrl
    : (window.location.port === '5173' || window.location.port === '5174'
        ? `${window.location.protocol}//${window.location.hostname}:5174`
        : 'https://tauhidshekhar-admin.vercel.app');
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Fetch Features from API
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.getFeatures();
        if (res.success && res.data && res.data.length > 0) {
          setFeatures(res.data);
        } else {
          // Fall back to seed features
          setFeatures(DEFAULT_FEATURES);
        }
      } catch (err) {
        console.warn('Failed to fetch features:', err.message);
        setFeatures(DEFAULT_FEATURES);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();

    const handleUpdate = () => {
      fetchFeatures();
    };

    window.addEventListener('cms-content-update', handleUpdate);

    return () => {
      window.removeEventListener('cms-content-update', handleUpdate);
    };
  }, []);

  // Filter features based on search and active category
  const filteredFeatures = features.filter(feat => {
    const matchesCategory = activeCategory === 'All' || feat.category === activeCategory;
    const matchesSearch = 
      feat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      feat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderIcon = (name) => {
    switch (name) {
      case 'FaUser': return <FaUser className="text-xl text-purple-400" />;
      case 'FaUsers': return <FaUsers className="text-xl text-purple-400" />;
      case 'FaMagic': return <FaMagic className="text-xl text-purple-400" />;
      case 'FaRocket': return <FaRocket className="text-xl text-purple-400" />;
      case 'FaBriefcase': return <FaBriefcase className="text-xl text-purple-400" />;
      case 'FaGift': return <FaGift className="text-xl text-purple-400" />;
      case 'FaShieldAlt': return <FaShieldAlt className="text-xl text-purple-400" />;
      default: return <FaCog className="text-xl text-purple-400" />;
    }
  };

  return (
    <section className="min-h-screen bg-[#F8FAFC]/70 dark:bg-transparent text-[#171717] dark:text-white pt-24 pb-20 px-6 sm:px-12 relative overflow-hidden text-left transition-colors duration-300">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Back Button & Theme Toggle (Top) */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-305 cursor-pointer shadow-md"
          >
            &larr; Back to Website
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <FaSun className="text-amber-400" /> : <FaMoon className="text-[#C2272D]" />}
            <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Header Block */}
        <div className="flex flex-col gap-2 max-w-2xl animate-fade-in">
          <span className="text-[10px] font-black text-[#C2272D] dark:text-purple-500 uppercase tracking-widest block">System Features</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171717] dark:text-white uppercase tracking-tight leading-none mt-1">
            Explore DevPortfolio Features
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
            Discover the modules, workflows, and integrations built into this portfolio platform. Filter categories or search specifically to find login options and release details.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121217]/50 border border-slate-200 dark:border-white/5 p-4 rounded-3xl backdrop-blur-md shadow-sm">
          {/* Categories Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                  activeCategory === cat 
                    ? 'bg-[#C2272D]/10 dark:bg-purple-600/10 border-[#C2272D]/30 dark:border-purple-500/30 text-[#C2272D] dark:text-purple-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#181822]/80 border border-slate-200 dark:border-white/5 focus:border-[#C2272D] dark:focus:border-purple-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Feature Cards Grid */}
        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <div className="w-10 h-10 rounded-full border-4 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-[#121217]/30 text-slate-500 text-sm italic">
            No features found matching the criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feat, index) => (
              <div 
                key={feat._id || index}
                className="bg-white dark:bg-[#121217]/60 border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col gap-4 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group glassmorphism"
              >
                {/* Visual hover border glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#C2272D]/5 to-[#00FFFF]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Top Badge Row */}
                <div className="flex justify-between items-start z-10">
                  <div className="w-10 h-10 rounded-2xl bg-[#C2272D]/10 dark:bg-purple-600/10 border border-[#C2272D]/15 dark:border-purple-500/15 flex items-center justify-center">
                    {renderIcon(feat.icon)}
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {feat.isComingSoon ? (
                      <span className="px-2 py-0.5 text-[8px] bg-amber-600/20 text-amber-500 dark:text-amber-400 border border-amber-500/20 rounded-md font-bold uppercase">
                        Coming Soon
                      </span>
                    ) : (
                      <>
                        {feat.isNewFeature && (
                          <span className="px-2 py-0.5 text-[8px] bg-[#C2272D]/15 text-[#C2272D] dark:bg-purple-600/20 dark:text-purple-400 border border-[#C2272D]/20 dark:border-purple-500/20 rounded-md font-bold uppercase">
                            New Release
                          </span>
                        )}
                        {feat.loginRequired && (
                          <span className="px-2 py-0.5 text-[8px] bg-slate-200 dark:bg-slate-655/20 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10 rounded-md font-bold uppercase">
                            Login Required
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Content Block */}
                <div className="flex flex-col gap-1 z-10 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {feat.category} &bull; v{feat.version || '1.0.0'}
                  </span>
                  <h3 className="text-sm font-black text-[#171717] dark:text-white tracking-wider group-hover:text-[#C2272D] dark:group-hover:text-purple-400 transition-colors uppercase mt-1">
                    {feat.name}
                  </h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mt-2 h-[72px] overflow-hidden line-clamp-4">
                    {feat.description}
                  </p>
                </div>

                {/* Screenshot Frame (if any) */}
                {feat.screenshot?.url && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-[#181820] border border-white/5 mt-1 z-10">
                    <img src={feat.screenshot.url} alt="screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                {/* Card CTA Footer */}
                <div className="flex gap-2 mt-auto border-t border-white/5 pt-4 z-10">
                  {feat.loginRequired && !user ? (
                    <Link
                      to="/login"
                      className="w-full py-2 bg-[#181822] hover:bg-[#20202d] text-slate-355 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors"
                    >
                      Login to Use
                    </Link>
                  ) : (
                    <button
                      disabled={feat.isComingSoon}
                      className="w-full py-2 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20 text-purple-400 hover:from-purple-600 hover:to-indigo-650 hover:text-white disabled:opacity-50 disabled:hover:from-purple-600/10 disabled:hover:to-indigo-600/10 disabled:hover:text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all"
                    >
                      {feat.isComingSoon ? 'Unavailable' : 'Launch Feature'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button (Bottom) */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-750 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-purple-600/10 hover:shadow-purple-600/20"
          >
            &larr; Back to Website
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesPage;
