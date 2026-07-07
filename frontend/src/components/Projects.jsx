import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaGithub, FaExternalLinkAlt, FaBookOpen, FaTimes, FaCheck, FaHeart, FaRegHeart } from 'react-icons/fa';

const ProjectGallery = ({ mainImage, images }) => {
  const [activeImg, setActiveImg] = useState(mainImage);
  const allImages = [mainImage, ...(images || [])].filter(Boolean);

  useEffect(() => {
    setActiveImg(mainImage);
  }, [mainImage]);

  if (allImages.length <= 1) {
    return (
      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 mb-8">
        <img src={mainImage} alt="Project main" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mb-8 w-full">
      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-inner bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <img src={activeImg} alt="Showcase active" className="w-full h-full object-cover transition-all duration-300" />
      </div>
      
      {/* Thumbnails Row */}
      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImg(img)}
            className={`w-20 aspect-video rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
              activeImg === img ? 'border-primary-blue scale-95 shadow-sm' : 'border-slate-200/50 dark:border-white/5 hover:border-slate-400'
            }`}
          >
            <img src={img} alt="Thumbnail preview" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const [projectItems, setProjectItems] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getProjects();
        if (res.success && res.data.length > 0) {
          setProjectItems(res.data.map(p => ({
            ...p,
            subtitle: p.subtitle || `${p.tag.toUpperCase()} Project`
          })));
        } else {
          setProjectItems(defaultProjects);
        }
      } catch (err) {
        setProjectItems(defaultProjects);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = activeFilter === 'all'
    ? projectItems
    : projectItems.filter(p => p.tag === activeFilter);

  return (
    <section id="projects" className="py-24 bg-white dark:bg-slate-900/40 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">My Work</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">Featured Projects</h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold font-title tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/20 -translate-y-0.5'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-[24px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
              >
                {/* Image & Overlay */}
                <div className="relative aspect-[16/9] overflow-hidden group">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Heart Bookmark Overlay Button */}
                  <button
                    onClick={() => handleFavoriteClick(project._id)}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all border border-slate-200/50 dark:border-white/5 cursor-pointer"
                    title={savedIds.includes(project._id) ? "Remove from Saved" : "Save Project"}
                  >
                    {savedIds.includes(project._id) ? (
                      <FaHeart className="text-red-500 transition-colors" size={15} />
                    ) : (
                      <FaRegHeart className="text-slate-400 dark:text-slate-300 hover:text-red-500 transition-colors" size={15} />
                    )}
                  </button>

                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setActiveCaseStudy(project)}
                      className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      title="Case Study"
                    >
                      <FaBookOpen size={16} />
                    </button>
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        title="Source Code"
                      >
                        <FaGithub size={18} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 md:p-8 text-left">
                  <span className="text-xs font-bold text-primary-blue uppercase tracking-wider block mb-1">
                    {project.subtitle}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black font-title text-black dark:text-white mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-650 dark:text-slate-350 mb-6 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(project.tech || []).map((t) => (
                      <span key={t} className="text-xs font-bold px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
                    <button
                      onClick={() => setActiveCaseStudy(project)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-center text-sm font-bold border border-slate-200 dark:border-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Case Study
                    </button>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary-blue/10 transition-all flex items-center justify-center gap-2"
                      >
                        Live Demo <FaExternalLinkAlt size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Case Study Modal Popup */}
        <AnimatePresence>
          {activeCaseStudy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12 overflow-y-auto"
              onClick={() => setActiveCaseStudy(null)}
            >
              <motion.div
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 w-full max-w-[800px] rounded-[30px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveCaseStudy(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer hover:bg-red-500 hover:text-white transition-all duration-300 z-10"
                >
                  <FaTimes />
                </button>

                <div className="overflow-y-auto p-6 md:p-10 text-left">
                  {/* Dynamic Project Showcase Gallery */}
                  <ProjectGallery mainImage={activeCaseStudy.image} images={activeCaseStudy.images} />

                  <span className="text-xs font-bold text-primary-blue uppercase tracking-wider block mb-1">
                    {activeCaseStudy.subtitle}
                  </span>
                  <h3 className="text-2xl md:text-4xl font-black font-title text-black dark:text-white mb-4">
                    {activeCaseStudy.title}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {activeCaseStudy.description}
                  </p>

                  <h4 className="text-lg font-bold font-title text-black dark:text-white mb-4">Key Features</h4>
                  <ul className="grid grid-cols-1 gap-3 mb-8">
                    {(activeCaseStudy.features || []).map((feat, idx) => (
                      <li key={idx} className="flex gap-3 items-start text-sm text-slate-500 dark:text-slate-400">
                        <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                          <FaCheck size={10} />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-lg font-bold font-title text-black dark:text-white mb-4">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {(activeCaseStudy.tech || []).map((t) => (
                      <span key={t} className="text-xs font-bold px-4 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Project Comments & Reviews Discussion */}
                  <div className="border-t border-slate-200/60 dark:border-white/5 pt-8 mt-8 text-left">
                    <h4 className="text-lg font-bold font-title text-black dark:text-white mb-4">
                      Discussion & Feedback ({activeCaseStudy.comments?.length || 0})
                    </h4>

                    {/* Comments Timeline */}
                    <div className="flex flex-col gap-3.5 mb-6 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                      {(activeCaseStudy.comments || []).map((comm) => (
                        <div key={comm._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex gap-3 text-left items-start">
                          <div className="w-8.5 h-8.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                            {comm.userAvatar ? (
                              <img src={comm.userAvatar} alt="Commenter Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <FaUserCircle className="text-slate-400 dark:text-slate-500 w-full h-full" size={24} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-bold text-xs text-black dark:text-white truncate">{comm.userName}</span>
                              <span className="text-[9px] text-slate-400 font-bold">{new Date(comm.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed break-words">{comm.content}</p>
                          </div>
                          {(user?.role === 'Admin' || (user && comm.userId === user.id)) && (
                            <button
                              onClick={() => handleDeleteComment(activeCaseStudy._id, comm._id)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 cursor-pointer shrink-0 self-start mt-0.5"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                      {(!activeCaseStudy.comments || activeCaseStudy.comments.length === 0) && (
                        <p className="text-xs text-slate-400 italic">No comments yet. Be the first to leave your feedback!</p>
                      )}
                    </div>

                    {/* Post Comment Input Bar */}
                    {user ? (
                      <form onSubmit={(e) => handlePostComment(e, activeCaseStudy._id)} className="flex gap-3">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Write a feedback or ask a question about this project..."
                          required
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue transition-colors"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          Post
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Please <Link to="/login" onClick={() => setActiveCaseStudy(null)} className="text-primary-blue font-bold hover:underline">log in</Link> to post feedback or ask questions on this project.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
                    <button
                      onClick={() => setActiveCaseStudy(null)}
                      className="flex-1 py-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-center text-sm font-bold border border-slate-200 dark:border-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Back to Projects
                    </button>
                    {activeCaseStudy.demo && (
                      <a
                        href={activeCaseStudy.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary-blue/10 transition-all flex items-center justify-center gap-2"
                      >
                        Visit Live Site <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                    {activeCaseStudy.github && (
                      <a
                        href={activeCaseStudy.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-center text-sm font-bold border border-slate-200 dark:border-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        View GitHub <FaGithub size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Projects;
