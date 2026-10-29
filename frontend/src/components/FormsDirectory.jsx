import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from './Navbar';
import Footer from './Footer';
import {
  FaWpforms,
  FaSearch,
  FaArrowRight,
  FaClock,
  FaCopy,
  FaCheck,
  FaFolderOpen,
  FaSortAmountDown,
  FaShieldAlt,
  FaUserTie,
  FaFileAlt,
  FaCalendarCheck,
  FaLayerGroup,
  FaTimes,
  FaFilter
} from 'react-icons/fa';

export default function FormsDirectory() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, catsRes] = await Promise.all([
        api.getPublicForms('all').catch(() => ({ success: false, data: [] })),
        api.getFormCategories().catch(() => ({ success: false, data: [] }))
      ]);

      const loadedForms = formsRes?.success && Array.isArray(formsRes.data)
        ? formsRes.data.filter(f => f.isSubmissionsEnabled !== false && (!f.status || f.status === 'Published'))
        : [];

      setForms(loadedForms);

      // Extract dynamic categories from DB records and active forms
      const dbCategories = catsRes?.success && Array.isArray(catsRes.data)
        ? catsRes.data.filter(c => c.isActive !== false).map(c => c.name)
        : [];

      const formCategories = loadedForms
        .map(f => f.category || f.templateCategory)
        .filter(Boolean);

      const mergedCategories = ['All', ...new Set([...dbCategories, ...formCategories])];
      setCategoriesList(mergedCategories);
    } catch (err) {
      console.error('Failed to load forms center data:', err.message);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered & Sorted forms list
  const filteredForms = forms
    .filter((f) => {
      const q = search.toLowerCase().trim();
      const formCat = f.category || f.templateCategory || 'General';
      const matchesSearch = !q ||
        f.title?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        formCat.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'All' ||
        formCat.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'popular') {
        return (b.submissionCount || 0) - (a.submissionCount || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // Default: newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const handleCopyLink = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'careers':
        return <FaUserTie size={11} className="text-[#C2272D]" />;
      case 'events':
        return <FaCalendarCheck size={11} className="text-[#00FFFF]" />;
      case 'inquiries':
        return <FaFileAlt size={11} className="text-emerald-500" />;
      default:
        return <FaLayerGroup size={11} className="text-[#C2272D]" />;
    }
  };

  const isFiltered = search.trim().length > 0 || selectedCategory !== 'All';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-['Inter'] flex flex-col justify-between transition-colors duration-200">
      
      {/* ── 1. Global Website Navbar ── */}
      <Navbar />

      {/* ── 2. Forms Center Main Content ── */}
      <main className="flex-grow pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Background Decorative Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C2272D]/10 dark:bg-[#C2272D]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00FFFF]/10 dark:bg-[#00FFFF]/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-[#C2272D] dark:text-[#00FFFF] font-bold">Forms Center</span>
          </nav>

          {/* Page Header */}
          <div className="text-center space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 text-[#C2272D] dark:text-[#00FFFF] text-xs font-bold tracking-wider uppercase border border-[#C2272D]/20 dark:border-[#00FFFF]/30 shadow-xs">
              <FaWpforms size={12} />
              <span>Public Applications & Inquiries</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-['Manrope']">
              Forms Center
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explore open applications, workshop registrations, job openings, and official inquiry questionnaires.
            </p>
          </div>

          {/* Search, Filter, Sort & Counter Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/90 dark:border-white/10 shadow-md backdrop-blur-md space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <FaSearch size={12} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search forms by title, keyword, or category..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Clear search"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                  <FaSortAmountDown size={11} />
                  <span>Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A - Z)</option>
                  <option value="popular">Most Submissions</option>
                </select>
              </div>
            </div>

            {/* Dynamic Category Filter Pills & Clear Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar flex-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/25'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Status/Count & Reset Filters */}
              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Showing <strong className="text-slate-800 dark:text-white">{filteredForms.length}</strong> of {forms.length}
                </span>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                    className="inline-flex items-center gap-1 font-bold text-[#C2272D] hover:underline cursor-pointer"
                  >
                    <FaTimes size={10} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Forms Listing Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[#C2272D] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Loading active forms from database...</span>
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-[#111114]/50 p-8 shadow-sm">
              <FaFolderOpen size={42} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white font-title">
                {forms.length === 0 ? 'No Active Forms Currently Available' : 'No Matching Forms Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                {forms.length === 0
                  ? 'Official application forms and inquiry questionnaires will appear here once published by the administrator.'
                  : `No forms matched your search criteria for "${search || selectedCategory}". Try selecting another category or clearing your search.`}
              </p>
              {forms.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white cursor-pointer shadow-sm transition-all"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => {
                const category = form.category || form.templateCategory || 'General';
                const reqFields = (form.fields || [])
                  .filter(f => f.required && !f.hidden && f.type !== 'heading')
                  .slice(0, 3)
                  .map(f => f.label || f.name);

                const estTime = form.fields?.length ? Math.max(1, Math.ceil(form.fields.length / 3)) : 2;

                return (
                  <div
                    key={form._id || form.slug}
                    className="p-6 rounded-3xl bg-white dark:bg-[#111114] border border-slate-200/90 dark:border-white/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] shadow-sm hover:shadow-xl dark:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                  >
                    <div>
                      {/* Category & Status Bar */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                          {getCategoryIcon(category)}
                          <span>{category}</span>
                        </span>

                        {/* Open Status Badge */}
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Accepting Entries</span>
                        </span>
                      </div>

                      {/* Form Title */}
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition-colors font-['Manrope'] line-clamp-1">
                        {form.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed min-h-[36px]">
                        {form.description || 'Fill out the form fields with your requirements or background details.'}
                      </p>

                      {/* Required Information Summary */}
                      {reqFields.length > 0 && (
                        <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-[#C2272D] dark:text-[#00FFFF] block mb-0.5">
                            Key Deliverables / Fields:
                          </span>
                          <span className="truncate block">
                            {reqFields.join(' • ')}{form.fields?.length > 3 ? '...' : ''}
                          </span>
                        </div>
                      )}

                      {/* Time Estimate & Submissions */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <FaClock size={11} className="text-[#C2272D] dark:text-[#00FFFF]" />
                          <span>~{estTime} mins</span>
                        </span>

                        {form.closingDate ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            Closes {new Date(form.closingDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Open Submissions</span>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar: Share + Open Form */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, form.slug)}
                        className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#C2272D] dark:hover:text-[#00FFFF] bg-slate-50 dark:bg-[#1A1A1E] border border-slate-200 dark:border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Copy Shareable Link"
                      >
                        {copiedSlug === form.slug ? <FaCheck size={12} className="text-emerald-500" /> : <FaCopy size={12} />}
                        <span className="text-[11px] font-bold">{copiedSlug === form.slug ? 'Copied' : 'Share'}</span>
                      </button>

                      <Link
                        to={`/forms/${form.slug}`}
                        state={{ from: '/forms', scrollY: window.scrollY }}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white flex items-center justify-center gap-2 shadow-md shadow-[#C2272D]/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                      >
                        <span>Open Form</span>
                        <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Security & Data Protection Guarantee Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-100 dark:bg-[#111114] border border-slate-200 dark:border-white/10 flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#C2272D]/10 text-[#C2272D] dark:text-[#00FFFF] flex items-center justify-center text-lg shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                SSL Encrypted & Data Protected
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                All form submissions are securely encrypted, stored in dedicated databases, and dispatched directly to verified administrators.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ── 3. Global Website Footer ── */}
      <Footer />
    </div>
  );
}
