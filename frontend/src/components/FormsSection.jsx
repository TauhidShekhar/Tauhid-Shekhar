import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import {
  FaWpforms,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaCopy,
  FaCheck,
  FaFileAlt,
  FaUserTie,
  FaGraduationCap,
  FaCalendarCheck,
  FaExternalLinkAlt
} from 'react-icons/fa';

const DEFAULT_FALLBACK_FORMS = [
  {
    _id: '1',
    title: 'Job Application Form',
    slug: 'job-application',
    description: 'Apply for software engineering, frontend, full-stack, or tech consulting roles. Submit qualifications and portfolio.',
    templateCategory: 'Careers',
    fieldCount: 10,
    estimatedMinutes: 3,
    status: 'Published'
  },
  {
    _id: '2',
    title: 'Resume Submission Form',
    slug: 'resume-submission',
    description: 'Directly upload your PDF resume, link your GitHub/LinkedIn, and drop into our verified talent pool.',
    templateCategory: 'Careers',
    fieldCount: 6,
    estimatedMinutes: 2,
    status: 'Published'
  },
  {
    _id: '3',
    title: 'Client Project Brief & Inquiry',
    slug: 'contact-form',
    description: 'Share your web development, enterprise software, or API architecture project requirements for an accurate proposal.',
    templateCategory: 'Inquiries',
    fieldCount: 8,
    estimatedMinutes: 3,
    status: 'Published'
  },
  {
    _id: '4',
    title: 'Internship Application Form',
    slug: 'internship-application',
    description: 'Hands-on mentorship, code reviews, and production project building opportunities for students and aspiring developers.',
    templateCategory: 'Careers',
    fieldCount: 8,
    estimatedMinutes: 3,
    status: 'Published'
  },
  {
    _id: '5',
    title: 'Tech Workshop & Event Registration',
    slug: 'event-registration',
    description: 'Reserve your seat for upcoming developer webinars, full-stack deep-dives, and coding sessions.',
    templateCategory: 'Events',
    fieldCount: 5,
    estimatedMinutes: 1,
    status: 'Published'
  },
  {
    _id: '6',
    title: 'General Technical Inquiry',
    slug: 'general-enquiry',
    description: 'Send general queries, research collaboration requests, or ask technical questions regarding our work.',
    templateCategory: 'General',
    fieldCount: 5,
    estimatedMinutes: 2,
    status: 'Published'
  }
];

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'careers':
      return <FaUserTie className="text-[#C2272D]" />;
    case 'events':
      return <FaCalendarCheck className="text-[#00FFFF]" />;
    case 'inquiries':
      return <FaFileAlt className="text-emerald-500" />;
    default:
      return <FaWpforms className="text-[#C2272D]" />;
  }
};

const FormsSection = () => {
  const [forms, setForms] = useState(DEFAULT_FALLBACK_FORMS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchForms = async () => {
      try {
        const res = await api.getPublicForms('all');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          if (isMounted) setForms(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch public forms for homepage section, showing fallback templates:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchForms();
    return () => { isMounted = false; };
  }, []);

  const categories = ['All', ...new Set(forms.map(f => f.templateCategory || 'General'))];

  const filteredForms = forms.filter(f => {
    if (selectedCategory === 'All') return true;
    return (f.templateCategory || 'General').toLowerCase() === selectedCategory.toLowerCase();
  });

  const handleCopyLink = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2200);
  };

  return (
    <section id="forms" className="scroll-mt-24 py-20 sm:py-24 lg:py-28 bg-[#FFFFFF] dark:bg-transparent relative border-t border-slate-100 dark:border-white/5 transition-colors">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#C2272D]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-[#00FFFF]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <FaWpforms size={13} />
            <span>Dynamic Applications & Inquiries</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Forms & Interactive Portals
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed">
            Apply for open roles, submit resume PDFs, outline client project briefs, or register for community workshops through our dynamic, secure forms.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-title uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/30 scale-105'
                    : 'bg-slate-100 dark:bg-white/5 text-[#525252] dark:text-[#9CA3AF] hover:text-[#171717] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Forms Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredForms.map((form, idx) => {
            const category = form.templateCategory || 'General';
            const estTime = form.estimatedMinutes || (form.fields?.length ? Math.ceil(form.fields.length / 3) : 2);
            
            return (
              <motion.div
                key={form._id || form.slug || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group relative bg-[#F8FAFC] dark:bg-[#111111] rounded-2xl sm:rounded-3xl border border-[#E5E7EB] dark:border-white/10 p-5 sm:p-6 flex flex-col justify-between hover:border-[#C2272D] dark:hover:border-[#00FFFF] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Card Header: Category & Active Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Accepting
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg sm:text-xl font-bold font-title text-[#171717] dark:text-white group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition-colors leading-snug">
                    {form.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {form.description || 'Fill out the form fields with your requirements or background details.'}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <FaClock size={11} className="opacity-70" />
                      ~{estTime} min to complete
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>Direct Admin Delivery</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3">
                  <Link
                    to={`/forms/${form.slug}`}
                    state={{ from: '/#forms', scrollY: window.scrollY }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2272D] hover:bg-[#A51E23] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#C2272D]/20 hover:shadow-md transition-all group-hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Fill Form</span>
                    <FaArrowRight size={11} className="transition-transform group-hover:translate-x-1" />
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, form.slug)}
                    title="Copy shareable direct link"
                    className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-[#00FFFF] hover:border-[#C2272D]/30 transition-all cursor-pointer shrink-0"
                    aria-label="Copy Form Link"
                  >
                    {copiedSlug === form.slug ? (
                      <FaCheck size={14} className="text-emerald-500" />
                    ) : (
                      <FaCopy size={14} />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner: View Full Forms Portal */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#C2272D]/10 via-[#00FFFF]/10 to-transparent border border-[#C2272D]/20 dark:border-[#00FFFF]/20 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white">
              Need a Custom Form or Full Forms Directory?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Explore our complete directory of published forms, generate QR codes, or create unlimited new dynamic forms via the Admin Dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/forms"
              state={{ from: '/#forms', scrollY: window.scrollY }}
              className="px-5 py-2.5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold text-xs sm:text-sm hover:opacity-90 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Forms Directory</span>
              <FaExternalLinkAlt size={11} />
            </Link>
            
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-full bg-[#C2272D]/10 hover:bg-[#C2272D]/20 text-[#C2272D] dark:text-[#00FFFF] font-bold text-xs sm:text-sm border border-[#C2272D]/30 dark:border-[#00FFFF]/30 transition-all cursor-pointer"
            >
              General Contact &rarr;
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FormsSection;
