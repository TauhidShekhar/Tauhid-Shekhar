import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaGithub, FaExternalLinkAlt, FaBookOpen, FaTimes, FaCheck, FaHeart, FaRegHeart, FaUserCircle, FaExpand, FaCompress } from 'react-icons/fa';
import { getCacheBustedUrl } from '../utils/cacheBuster';

const ProjectGallery = ({ mainImage, images, title, updatedAt }) => {
  const [activeImg, setActiveImg] = useState(mainImage);
  const allImages = [mainImage, ...(images || [])].filter(Boolean);

  useEffect(() => {
    setActiveImg(mainImage);
  }, [mainImage]);

  return (
    <div className="flex flex-col gap-3 mb-6 sm:mb-8 w-full select-none">
      {/* Mac Window Desktop Frame */}
      <div className="w-full rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-white/10 shadow-xl bg-slate-900">
        {/* Top Browser Bar */}
        <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-800/90 border-b border-slate-700/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#C2272D]/90" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400/90" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400/90" />
          </div>
          <div className="flex-1 max-w-md mx-auto bg-slate-950/70 rounded-lg px-3 py-1 text-[10px] sm:text-[11px] text-slate-400 font-mono text-center truncate border border-white/5">
            https://tauhidshekhar.app/projects/{encodeURIComponent((title || 'showcase').toLowerCase().replace(/\s+/g, '-'))}
          </div>
          <div className="w-12 text-right hidden sm:block">
            <span className="text-[10px] font-bold text-[#00FFFF] uppercase tracking-widest">LIVE</span>
          </div>
        </div>
        {/* Main Image Viewport */}
        <div className="w-full aspect-[16/9] bg-slate-950 overflow-hidden flex items-center justify-center relative group">
          <img 
            src={getCacheBustedUrl(activeImg || mainImage, updatedAt)} 
            alt={title || "Project showcase active"} 
            className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-[1.02]" 
            loading="lazy" 
            decoding="async" 
          />
        </div>
      </div>
      
      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto py-1 scrollbar-thin">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImg(img)}
              className={`w-18 sm:w-20 aspect-video rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                activeImg === img ? 'border-[#C2272D] dark:border-[#00FFFF] scale-95 shadow-md' : 'border-slate-200/50 dark:border-white/10 hover:border-[#C2272D]/50'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img src={getCacheBustedUrl(img, updatedAt)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const defaultProjects = [
  {
    _id: '1',
    title: 'Course Selling Platform',
    tag: 'website',
    subtitle: 'MERN Stack LMS',
    tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT'],
    image: 'assits/Project1.jpg',
    github: 'https://github.com/TauhidShekhar',
    demo: 'https://github.com/TauhidShekhar',
    features: [
      'Dedicated dashboards for Admin, Teacher, and Student roles.',
      'Secure token-based JWT authentication and protected routing.',
      'Integrated course purchasing workflow and progress tracking.',
      'File uploads for homework assignments and PDF course notes.',
      'Streaming features for recorded video lessons.'
    ],
    description: 'A comprehensive Learning Management System designed to handle course listings, student study tracks, lecturer material uploads, and transactional purchasing paths using Mongo schemas and Express endpoints.'
  },
  {
    _id: '2',
    title: 'Gym & Fitness Hub',
    tag: 'website',
    subtitle: 'Responsive React SPA',
    tech: ['React.js', 'JavaScript', 'CSS3', 'Responsive Design'],
    image: 'assits/Project2.jpg',
    github: 'https://github.com/TauhidShekhar',
    demo: 'https://github.com/TauhidShekhar',
    features: [
      'Interactive trainer profiling dashboards.',
      'Dynamic membership package comparison grids.',
      'Cross-browser responsive mobile booking forms.',
      'Performant assets loading and custom responsive layout.'
    ],
    description: 'A beautiful single-page dashboard displaying gym details, trainer portfolios, scheduling systems, and membership plans optimized for tablets and smartphones.'
  },
  {
    _id: '3',
    title: 'Fast Delivery Food App',
    tag: 'website',
    subtitle: 'HTML5/CSS3 Responsive Menu',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI'],
    image: 'assits/Project3.jpg',
    github: 'https://github.com/TauhidShekhar',
    demo: 'https://github.com/TauhidShekhar',
    features: [
      'Highly responsive fluid grid menu layout.',
      'Vanilla JS cart adding and calculation scripts.',
      'Optimized CSS typography, shadows, and smooth transitions.',
      'Frictionless mobile navigation and collapsible menus.'
    ],
    description: 'An interactive menu interface focusing on food items search, lazy-loading thumbnails, item filters, and fast performance.'
  },
  {
    _id: '4',
    title: 'Portfolio Website',
    tag: 'website',
    subtitle: 'HTML5/CSS3 Personal Showcase',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    image: 'assits/Project2.jpg',
    github: 'https://github.com/TauhidShekhar',
    demo: 'https://github.com/TauhidShekhar',
    features: [
      'Designed a modern personal portfolio showcasing development projects, technical skills, and contact information.',
      'Structured semantic HTML5 layout with clean styling using custom CSS properties.',
      'Fully responsive layout optimized for mobile, tablet, and desktop viewports.',
      'SEO-friendly structure with quick assets load performance.'
    ],
    description: 'A professional frontend developer portfolio built using HTML5, CSS3, and JavaScript, designed to present projects and contact inquiries clearly to recruiters.'
  },
  {
    _id: '5',
    title: 'Thumbnails & Brand Identity',
    tag: 'graphic',
    subtitle: 'Graphic Design Campaign',
    tech: ['Photoshop', 'Illustrator', 'Canva', 'AI Design'],
    image: 'assits/project4.jpg',
    github: 'https://github.com/TauhidShekhar',
    demo: 'https://github.com/TauhidShekhar',
    features: [
      '300+ custom high CTR YouTube thumbnails.',
      'Branding design kits: logos, banners, posters.',
      'Consistent vector illustration assets in Illustrator.',
      'Adobe Photoshop rendering pipelines.'
    ],
    description: 'A professional curation of high-performing thumbnail designs and brand identities constructed for YouTube content creators and business agencies.'
  }
];

const Projects = ({ projectsData, error, isCachedData, lastUpdated, onRetry }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  const triggerBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const modalContentRef = useRef(null);

  const [projectItems, setProjectItems] = useState(() => {
    let list = Array.isArray(projectsData) && projectsData.length > 0 ? projectsData : [];
    if (list.length === 0) {
      try {
        const cached = localStorage.getItem('tauhid_portfolio_cached_v2');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.data?.projects?.length) list = parsed.data.projects;
        }
      } catch (_) {}
    }
    return list.map(p => ({
      ...p,
      subtitle: p.subtitle || `${(p.tag || 'Project').toUpperCase()} Project`
    }));
  });

  useEffect(() => {
    if (Array.isArray(projectsData) && projectsData.length > 0) {
      setProjectItems(projectsData.map(p => ({
        ...p,
        subtitle: p.subtitle || `${(p.tag || 'Project').toUpperCase()} Project`
      })));
    } else if (!projectsData || projectsData.length === 0) {
      try {
        const cached = localStorage.getItem('tauhid_portfolio_cached_v2');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.data?.projects?.length) {
            setProjectItems(parsed.data.projects.map(p => ({
              ...p,
              subtitle: p.subtitle || `${(p.tag || 'Project').toUpperCase()} Project`
            })));
            return;
          }
        }
      } catch (_) {}
      setProjectItems([]);
    }
  }, [projectsData]);

  useEffect(() => {
    if (user) {
      const fetchSavedIds = async () => {
        try {
          const res = await api.getSavedProjects();
          if (res.success) {
            setSavedIds((res.data || []).map(p => p._id));
          }
        } catch (err) {
          console.error('Failed to load saved projects ids:', err.message);
        }
      };
      fetchSavedIds();
    } else {
      setSavedIds([]);
    }
  }, [user]);

  const openModal = (project, e) => {
    triggerBtnRef.current = e?.currentTarget || document.activeElement;
    setActiveCaseStudy(project);
  };

  const closeModal = () => {
    setActiveCaseStudy(null);
    setIsFullscreen(false);
    setTimeout(() => {
      if (triggerBtnRef.current && typeof triggerBtnRef.current.focus === 'function') {
        triggerBtnRef.current.focus({ preventScroll: true });
      }
    }, 50);
  };

  // Lock background body scrolling & reset modal scroll to top & set accessible focus
  useEffect(() => {
    if (activeCaseStudy) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
        closeBtnRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeCaseStudy]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeCaseStudy) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCaseStudy]);

  if (projectsData === null) {
    return (
      <section id="projects" className="scroll-mt-24 py-24 sm:py-28 bg-[#F8FAFC]/70 dark:bg-transparent relative">
        <div className="max-w-[1400px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14 sm:mb-16 animate-pulse">
            <div className="h-6 w-36 bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 rounded-full mx-auto mb-3" />
            <div className="h-10 w-64 bg-slate-200 dark:bg-white/10 rounded-xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="rounded-3xl border border-[#E5E7EB] dark:border-white/10 overflow-hidden bg-white dark:bg-[#111111] p-6 flex flex-col gap-4 animate-pulse">
                <div className="w-full aspect-[16/9] bg-slate-150 dark:bg-white/5 rounded-2xl" />
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-slate-150 dark:bg-white/5 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-slate-150 dark:bg-white/5 rounded-lg" />
                  <div className="h-6 w-16 bg-slate-150 dark:bg-white/5 rounded-lg" />
                  <div className="h-6 w-16 bg-slate-150 dark:bg-white/5 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const handleFavoriteClick = async (projectId) => {
    if (!user) {
      alert('Please log in or register to bookmark projects!');
      return;
    }
    try {
      const res = await api.toggleSaveProject(projectId);
      if (res.success) {
        if (res.isSaved) {
          setSavedIds(prev => [...prev, projectId]);
        } else {
          setSavedIds(prev => prev.filter(id => id !== projectId));
        }
      }
    } catch (err) {
      console.error('Favorite action failed:', err.message);
    }
  };

  const handlePostComment = async (e, projectId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const res = await api.addProjectComment(projectId, newCommentText.trim());
      if (res.success) {
        setProjectItems(prev => prev.map(p => p._id === projectId ? { ...p, comments: res.data } : p));
        setActiveCaseStudy(prev => ({ ...prev, comments: res.data }));
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Post comment error:', err.message);
    }
  };

  const handleDeleteComment = async (projectId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await api.deleteProjectComment(projectId, commentId);
      if (res.success) {
        setProjectItems(prev => prev.map(p => p._id === projectId ? { ...p, comments: res.data } : p));
        setActiveCaseStudy(prev => ({ ...prev, comments: res.data }));
      }
    } catch (err) {
      console.error('Delete comment error:', err.message);
    }
  };

  const filters = [
    { id: 'all', label: 'All Work' },
    { id: 'website', label: 'Websites' },
    { id: 'graphic', label: 'Graphic Design' },
    { id: 'branding', label: 'Branding' },
    { id: 'ui', label: 'UI Design' }
  ];

  const filteredProjects = activeFilter === 'all'
    ? projectItems
    : projectItems.filter(p => p.tag === activeFilter);

  return (
    <section id="projects" className="scroll-mt-24 py-24 sm:py-28 bg-[#F8FAFC]/70 dark:bg-transparent relative">
      <div className="max-w-[1400px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>Portfolio Showcase</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Featured Projects & Engineering
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 mb-10 sm:mb-12" role="tablist" aria-label="Project Categories">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              role="tab"
              aria-selected={activeFilter === f.id}
              className={`px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[14px] font-medium tracking-wider uppercase border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#C2272D] border-[#C2272D] text-white shadow-md shadow-[#C2272D]/20 -translate-y-0.5'
                  : 'bg-white dark:bg-[#111111] border-[#E5E7EB] dark:border-white/10 text-[#525252] dark:text-[#D1D5DB] hover:border-[#C2272D] dark:hover:border-[#00FFFF]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Offline / Cached Data Notification Badge */}
        {isCachedData && (
          <div className="max-w-xl mx-auto mb-8 p-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>
                Showing cached portfolio projects {lastUpdated ? `(Snapshot: ${new Date(lastUpdated).toLocaleTimeString()})` : ''}. Live database sync will resume automatically.
              </span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold cursor-pointer transition-colors text-[11px] shrink-0"
              >
                Sync Now
              </button>
            )}
          </div>
        )}

        {/* Error / DB Connection Degraded State */}
        {error && (!projectItems || projectItems.length === 0) ? (
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#111111] border border-red-500/25 shadow-xl text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
              <FaTimes />
            </div>
            <div>
              <h3 className="text-lg font-bold font-title text-slate-900 dark:text-white mb-1">Live Database Connecting</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unable to load fresh projects right now. The database is reconnecting automatically. No outdated static data is displayed.
              </p>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 px-5 py-2.5 rounded-xl bg-[#C2272D] hover:bg-[#A51E23] text-white text-xs font-bold transition-all shadow-md shadow-[#C2272D]/25 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Retry Live Connection
              </button>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm">
            No projects found in this category.
          </div>
        ) : (
          /* Projects Grid */
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-[#111111] rounded-3xl overflow-hidden border border-[#E5E7EB] dark:border-white/10 shadow-md hover:shadow-2xl hover:shadow-[#C2272D]/10 dark:hover:shadow-[#00FFFF]/10 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-2 card-interactive"
              >
                {/* Image & Overlay */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={getCacheBustedUrl(project.image, project.updatedAt)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Heart Bookmark Overlay Button */}
                  <button
                    type="button"
                    onClick={() => handleFavoriteClick(project._id)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md text-[#171717] dark:text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all border border-[#E5E7EB] dark:border-white/10 cursor-pointer"
                    title={savedIds.includes(project._id) ? "Remove from Saved" : "Save Project"}
                    aria-label="Save Project"
                  >
                    {savedIds.includes(project._id) ? (
                      <FaHeart className="text-[#C2272D] transition-colors" size={17} />
                    ) : (
                      <FaRegHeart className="text-slate-400 dark:text-slate-300 hover:text-[#C2272D] transition-colors" size={17} />
                    )}
                  </button>

                  <div className="absolute inset-0 bg-[#000000]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => openModal(project, e)}
                      className="w-12 h-12 rounded-full bg-white text-[#171717] hover:bg-[#00FFFF] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Read More Details"
                      aria-label={`Read More details about ${project.title}`}
                    >
                      <FaBookOpen size={17} />
                    </button>
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-white text-[#171717] hover:bg-[#C2272D] hover:text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                        title="Source Code"
                        aria-label={`GitHub Repository for ${project.title}`}
                      >
                        <FaGithub size={19} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 xs:p-5 sm:p-7 text-left flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#C2272D] dark:text-[#00FFFF] uppercase tracking-wider block mb-1.5">
                      {project.subtitle}
                    </span>
                    <h3 className="text-[19px] sm:text-[20px] md:text-[22px] font-bold font-title text-[#171717] dark:text-white mb-2.5">
                      {project.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] mb-5 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                      {(project.tech || []).map((t) => (
                        <span key={t} className="text-xs sm:text-[13px] font-medium px-2.5 py-1 bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 text-[#525252] dark:text-[#D1D5DB] rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3.5 border-t border-[#E5E7EB] dark:border-white/10 pt-4 sm:pt-5">
                    <button
                      type="button"
                      onClick={(e) => openModal(project, e)}
                      className="w-full xs:flex-1 py-2.5 sm:py-3 bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-white/10 text-[#171717] dark:text-white rounded-xl text-center text-[15px] font-semibold border border-[#E5E7EB] dark:border-white/10 hover:border-[#00FFFF] hover:shadow-md hover:shadow-[#00FFFF]/10 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2"
                      aria-label={`Read More about ${project.title}`}
                    >
                      <FaBookOpen size={14} className="text-[#C2272D] dark:text-[#00FFFF]" />
                      <span>Read More</span>
                    </button>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full xs:flex-1 py-2.5 sm:py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-center text-[15px] font-semibold shadow-md shadow-[#C2272D]/20 hover:shadow-xl hover:shadow-[#C2272D]/35 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 btn-shine-effect"
                      >
                        <span>Live Demo</span> <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        )}

        {/* Redesigned Read More Modal Popup with createPortal */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {activeCaseStudy && (
              <div
                className="fixed inset-0 z-[999999] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-project-title"
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={closeModal}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
                  aria-hidden="true"
                />

                {/* Modal Dialog Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 15 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className={`relative z-10 bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 shadow-2xl flex flex-col overflow-hidden text-left transition-all duration-300 ${
                    isFullscreen
                      ? 'w-screen h-screen max-w-full max-h-full rounded-none border-0'
                      : 'w-full h-full sm:h-[92vh] sm:max-h-[920px] sm:max-w-[1050px] sm:rounded-3xl'
                  }`}
                >
                  {/* Sticky Header Bar */}
                  <div className="sticky top-0 z-30 px-4 py-3 sm:px-6 sm:py-3.5 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C2272D] inline-block shrink-0 shadow-[0_0_8px_#C2272D]" />
                      <span className="text-sm sm:text-base font-bold text-[#171717] dark:text-white truncate font-title">
                        {activeCaseStudy.title}
                      </span>
                      <span className="hidden sm:inline-block text-[11px] font-semibold text-[#525252] dark:text-[#9CA3AF] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/5 shrink-0">
                        {activeCaseStudy.tag || 'Project'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Fullscreen Toggle */}
                      <button
                        type="button"
                        onClick={() => setIsFullscreen(prev => !prev)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-white/10 text-[#525252] dark:text-[#D1D5DB] hover:text-[#00FFFF] hover:border-[#00FFFF] flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                      >
                        {isFullscreen ? <FaCompress size={13} /> : <FaExpand size={13} />}
                      </button>

                      {/* Close Button */}
                      <button
                        ref={closeBtnRef}
                        type="button"
                        onClick={closeModal}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-white/10 text-[#525252] dark:text-[#D1D5DB] hover:bg-[#C2272D] hover:text-white hover:border-[#C2272D] dark:hover:bg-[#C2272D] dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
                        title="Close (Esc)"
                        aria-label="Close project details modal"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div
                    ref={modalContentRef}
                    className="overflow-y-auto flex-1 p-4 xs:p-5 sm:p-7 md:p-8 overscroll-contain text-left scrollbar-thin"
                  >
                    {/* Dynamic Project Showcase Gallery */}
                    <ProjectGallery
                      mainImage={activeCaseStudy.image}
                      images={activeCaseStudy.images}
                      title={activeCaseStudy.title}
                      updatedAt={activeCaseStudy.updatedAt}
                    />

                    {/* Subtitle & Title */}
                    <span className="text-xs font-semibold text-[#C2272D] dark:text-[#00FFFF] uppercase tracking-wider block mb-1">
                      {activeCaseStudy.subtitle || `${(activeCaseStudy.tag || 'Project').toUpperCase()} Project`}
                    </span>
                    <h3 id="modal-project-title" className="text-2xl sm:text-3xl font-bold font-title text-[#171717] dark:text-white mb-3">
                      {activeCaseStudy.title}
                    </h3>

                    {/* Overview Description */}
                    <div className="text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB] mb-6 sm:mb-8 leading-relaxed whitespace-pre-line">
                      {activeCaseStudy.description}
                    </div>

                    {/* Key Features (if available) */}
                    {activeCaseStudy.features && activeCaseStudy.features.length > 0 && (
                      <div className="mb-6 sm:mb-8">
                        <h4 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 rounded-full bg-[#C2272D]" /> Key Features
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                          {activeCaseStudy.features.map((feat, idx) => (
                            <li
                              key={idx}
                              className="flex gap-2.5 items-start text-xs sm:text-sm text-[#525252] dark:text-[#D1D5DB] bg-[#F8FAFC] dark:bg-[#1A1A1A] p-3 rounded-xl border border-[#E5E7EB] dark:border-white/5"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#00FFFF]/10 text-[#00FFFF] flex items-center justify-center shrink-0 mt-0.5">
                                <FaCheck size={9} />
                              </span>
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tech Stack (if available) */}
                    {activeCaseStudy.tech && activeCaseStudy.tech.length > 0 && (
                      <div className="mb-6 sm:mb-8">
                        <h4 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 rounded-full bg-[#00FFFF]" /> Tech Stack & Tooling
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeCaseStudy.tech.map((t) => (
                            <span
                              key={t}
                              className="text-xs sm:text-[13px] font-medium px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-white/10 text-[#171717] dark:text-white rounded-lg shadow-xs"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Challenges & Learnings (if available) */}
                    {(activeCaseStudy.challenges || activeCaseStudy.learnings || activeCaseStudy.takeaways) && (
                      <div className="mb-6 sm:mb-8">
                        <h4 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 rounded-full bg-[#C2272D]" /> Challenges & Key Learnings
                        </h4>
                        <div className="text-xs sm:text-sm text-[#525252] dark:text-[#D1D5DB] bg-[#F8FAFC] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E5E7EB] dark:border-white/10 leading-relaxed whitespace-pre-line">
                          {activeCaseStudy.challenges || activeCaseStudy.learnings || activeCaseStudy.takeaways}
                        </div>
                      </div>
                    )}

                    {/* Discussion & Feedback */}
                    <div className="border-t border-[#E5E7EB] dark:border-white/10 pt-6 mt-6">
                      <h4 className="text-base sm:text-lg font-bold font-title text-[#171717] dark:text-white mb-3 flex items-center justify-between">
                        <span>Discussion & Feedback</span>
                        <span className="text-xs font-normal text-[#525252] dark:text-[#9CA3AF] px-2.5 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10">
                          {activeCaseStudy.comments?.length || 0}
                        </span>
                      </h4>

                      {/* Comments Timeline */}
                      <div className="flex flex-col gap-3 mb-5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                        {(activeCaseStudy.comments || []).map((comm) => (
                          <div
                            key={comm._id}
                            className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-white/10 flex gap-3 text-left items-start"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0 border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center">
                              {comm.userAvatar ? (
                                <img
                                  src={comm.userAvatar}
                                  alt={comm.userName || "Commenter"}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <FaUserCircle className="text-slate-400 dark:text-slate-500 w-full h-full" size={24} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-semibold text-xs text-[#171717] dark:text-white truncate">
                                {comm.userName}
                                </span>
                                <span className="text-[10px] text-[#525252] dark:text-[#9CA3AF]">
                                  {new Date(comm.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-[#525252] dark:text-[#D1D5DB] leading-relaxed break-words">
                                {comm.content}
                              </p>
                            </div>
                            {(user?.role === 'Admin' || (user && comm.userId === user.id)) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(activeCaseStudy._id, comm._id)}
                                className="text-[11px] font-semibold text-[#C2272D] hover:underline cursor-pointer shrink-0 self-start ml-1"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                        {(!activeCaseStudy.comments || activeCaseStudy.comments.length === 0) && (
                          <p className="text-xs text-[#525252] dark:text-[#9CA3AF] italic py-2">
                            No comments yet. Be the first to leave your feedback!
                          </p>
                        )}
                      </div>

                      {/* Post Comment Input */}
                      {user ? (
                        <form onSubmit={(e) => handlePostComment(e, activeCaseStudy._id)} className="flex gap-2 sm:gap-3">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Write feedback or ask a question about this project..."
                            required
                            className="flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#171717] dark:text-white text-xs sm:text-sm focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] transition-colors"
                          />
                          <button
                            type="submit"
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#C2272D]/20 cursor-pointer"
                          >
                            Post
                          </button>
                        </form>
                      ) : (
                        <p className="text-xs text-[#525252] dark:text-[#9CA3AF] leading-relaxed">
                          Please{' '}
                          <Link
                            to="/login"
                            onClick={closeModal}
                            className="text-[#C2272D] dark:text-[#00FFFF] font-semibold hover:underline"
                          >
                            log in
                          </Link>{' '}
                          to post feedback or ask questions on this project.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sticky Bottom Actions Bar */}
                  <div className="sticky bottom-0 z-30 px-4 py-3 sm:px-6 sm:py-3.5 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="py-2.5 px-4 sm:px-5 bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-white/10 text-[#171717] dark:text-white rounded-xl text-xs sm:text-sm font-semibold border border-[#E5E7EB] dark:border-white/10 transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
                    >
                      Back to Projects
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                      {activeCaseStudy.github && (
                        <a
                          href={activeCaseStudy.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-4 sm:px-5 bg-[#F8FAFC] dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-white/10 text-[#171717] dark:text-white rounded-xl text-xs sm:text-sm font-semibold border border-[#E5E7EB] dark:border-white/10 hover:border-[#00FFFF] hover:text-[#00FFFF] transition-all flex items-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
                        >
                          <FaGithub size={14} />
                          <span>GitHub</span>
                        </a>
                      )}
                      {activeCaseStudy.demo && (
                        <a
                          href={activeCaseStudy.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-4 sm:px-5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-[#C2272D]/20 hover:shadow-lg hover:shadow-[#C2272D]/35 transition-all flex items-center gap-1.5 btn-shine-effect focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF]"
                        >
                          <span>Live Demo</span>
                          <FaExternalLinkAlt size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </section>
  );
};

export default Projects;
