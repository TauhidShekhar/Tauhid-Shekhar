import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaCheck, FaExternalLinkAlt, FaGithub, 
  FaExclamationCircle, FaHeart, FaRegHeart, FaComments, 
  FaShareAlt, FaLaptopCode, FaTags, FaRocket, FaUserCircle, FaTrash
} from 'react-icons/fa';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCacheBustedUrl } from '../utils/cacheBuster';

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImage, setActiveImage] = useState('');
  const [saved, setSaved] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const decodedSlug = decodeURIComponent(slug || '').trim();
        const res = await api.getProjectBySlug(decodedSlug);
        if (res.success && res.data) {
          setProject(res.data);
          setActiveImage(res.data.image || '');
          setComments(res.data.comments || []);
          setRelatedProjects(res.relatedProjects || []);

          if (res.data.slug && res.data.slug !== slug) {
            window.history.replaceState(null, '', `/projects/${res.data.slug}`);
          }
        } else {
          setError('Project not found or unavailable.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  // Check if project is saved by current user
  useEffect(() => {
    if (user && project?._id) {
      api.getSavedProjects().then(res => {
        if (res.success && Array.isArray(res.data)) {
          setSaved(res.data.some(p => p._id === project._id));
        }
      }).catch(() => {});
    }
  }, [user, project]);

  // Inject Schema.org CreativeWork JSON-LD
  useEffect(() => {
    if (!project) return;

    const schemaId = 'project-details-json-ld';
    let script = document.getElementById(schemaId);
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      'name': project.title,
      'headline': project.title,
      'description': project.description,
      'programmingLanguage': project.tech || ['React', 'Node.js', 'JavaScript'],
      'codeRepository': project.github || 'https://github.com/tauhidshekhar',
      'url': `https://tauhidshekhar.com/projects/${project.slug || project._id}`,
      'image': project.image,
      'author': {
        '@type': 'Person',
        'name': 'Tauhid Shekhar',
        'url': 'https://tauhidshekhar.com'
      },
      'creator': {
        '@type': 'Person',
        'name': 'Tauhid Shekhar'
      },
      'genre': project.tag || 'Web Development'
    };

    script.innerHTML = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [project]);

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    try {
      if (saved) {
        await api.removeSavedProject(project._id);
        setSaved(false);
      } else {
        await api.saveProject(project._id);
        setSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title || 'Project by Tauhid Shekhar',
        text: project?.description || '',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setSubmittingComment(true);
    try {
      const res = await api.addProjectComment(project._id, commentText.trim());
      if (res.success && res.data) {
        setComments(res.data);
        setCommentText('');
      }
    } catch (err) {
      alert(err.message || 'Could not post feedback.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      const res = await api.deleteProjectComment(project._id, commentId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      alert(err.message || 'Could not delete feedback.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-28 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded mb-8" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-4" />
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-white/10 rounded mb-8" />
          <div className="w-full aspect-[16/9] bg-slate-200 dark:bg-white/10 rounded-3xl mb-8" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-28 text-center">
          <FaExclamationCircle size={48} className="text-[#C2272D] mb-4" />
          <h1 className="text-3xl font-extrabold mb-2 font-title">Project Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
            {error || 'The requested project could not be found or has been removed.'}
          </p>
          <div className="flex gap-4">
            <Link
              to="/#projects"
              className="px-6 py-3 bg-[#C2272D] hover:bg-[#a51d23] text-white font-semibold rounded-xl transition shadow-md"
            >
              Back to Portfolio
            </Link>
            <Link
              to="/services"
              className="px-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 font-semibold rounded-xl transition"
            >
              Explore Services
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = [project.image, ...(project.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#070709] text-[#171717] dark:text-[#F3F4F6] flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-4 mb-6 text-sm">
            <ol className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/#projects" className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition">Projects</Link>
              </li>
              <li>/</li>
              <li className="text-[#171717] dark:text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                {project.title}
              </li>
            </ol>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-[#00FFFF] text-slate-600 dark:text-slate-300 hover:text-[#00FFFF] transition flex items-center gap-1.5 text-xs font-semibold"
                title="Share Project"
              >
                <FaShareAlt size={12} />
                <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold ${
                  saved 
                    ? 'border-[#C2272D] bg-[#C2272D]/10 text-[#C2272D]' 
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-[#C2272D]'
                }`}
                title={saved ? 'Remove from Saved' : 'Save Project'}
              >
                {saved ? <FaHeart size={13} className="text-[#C2272D]" /> : <FaRegHeart size={13} />}
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </nav>

          {/* Project Header Banner */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20">
                {project.tag || 'Web App'}
              </span>
              {project.subtitle && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  • {project.subtitle}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-title tracking-tight text-[#171717] dark:text-white mb-4">
              {project.title}
            </h1>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#C2272D] hover:bg-[#a51d23] text-white font-semibold rounded-xl shadow-lg shadow-[#C2272D]/25 transition flex items-center gap-2 text-sm"
                >
                  <FaExternalLinkAlt size={13} />
                  <span>View Live Deployment</span>
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white font-semibold rounded-xl transition flex items-center gap-2 text-sm border border-slate-700/50"
                >
                  <FaGithub size={15} />
                  <span>Source Code</span>
                </a>
              )}
              <Link
                to={`/services/order?project=${encodeURIComponent(project.title)}`}
                className="px-5 py-2.5 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 text-cyan-600 dark:text-[#00FFFF] font-semibold rounded-xl border border-cyan-500/30 transition flex items-center gap-2 text-sm"
              >
                <FaRocket size={13} />
                <span>Order Similar Solution</span>
              </Link>
            </div>
          </header>

          {/* Interactive Browser Frame & Screenshot Gallery */}
          <section aria-label="Project Preview Gallery" className="mb-12">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-900">
              {/* Browser bar */}
              <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C2272D]" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 max-w-lg mx-auto bg-slate-950/80 rounded-lg px-4 py-1 text-xs text-slate-400 font-mono text-center truncate border border-white/5">
                  https://tauhidshekhar.com/projects/{project.slug || project._id}
                </div>
                <div className="text-[11px] font-bold text-[#00FFFF] tracking-widest hidden sm:block">
                  PREVIEW
                </div>
              </div>

              {/* Main Image */}
              <div className="w-full aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={getCacheBustedUrl(activeImage || project.image, project.updatedAt)}
                  alt={`${project.title} screenshot`}
                  className="w-full h-full object-cover object-top transition duration-500 hover:scale-[1.01]"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>

            {/* Thumbnails row */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-3 scrollbar-thin mt-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-24 sm:w-28 aspect-video rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      activeImage === img
                        ? 'border-[#C2272D] dark:border-[#00FFFF] shadow-md scale-95'
                        : 'border-slate-200 dark:border-white/10 hover:border-[#C2272D]/50 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Switch to screenshot ${idx + 1}`}
                  >
                    <img
                      src={getCacheBustedUrl(img, project.updatedAt)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Left 2 Cols: Description, Features & Discussion */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview & Problem Solved */}
              <article className="p-6 sm:p-8 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold font-title text-[#171717] dark:text-white mb-4 flex items-center gap-2.5">
                  <span className="w-2 h-5 rounded-full bg-[#C2272D]" />
                  Project Overview & Problem Solved
                </h2>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {project.description}
                </div>
              </article>

              {/* Key Features */}
              {project.features && project.features.length > 0 && (
                <section className="p-6 sm:p-8 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold font-title text-[#171717] dark:text-white mb-6 flex items-center gap-2.5">
                    <span className="w-2 h-5 rounded-full bg-[#00FFFF]" />
                    Key Architecture & Features
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {project.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex gap-3 items-start text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#00FFFF]/10 text-cyan-600 dark:text-[#00FFFF] flex items-center justify-center shrink-0 mt-0.5">
                          <FaCheck size={10} />
                        </span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Community Comments & Feedback */}
              <section className="p-6 sm:p-8 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold font-title text-[#171717] dark:text-white flex items-center gap-2.5">
                    <span className="w-2 h-5 rounded-full bg-[#C2272D]" />
                    Feedback & Technical Discussion
                  </h2>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                    {comments.length} Comments
                  </span>
                </div>

                {/* Form to add comment */}
                <form onSubmit={handlePostComment} className="mb-8">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={user ? "Write your technical question, feedback, or review..." : "Sign in to leave feedback or ask questions..."}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181818] text-[#171717] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] text-sm resize-none mb-3"
                    disabled={submittingComment}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-5 py-2.5 bg-[#C2272D] hover:bg-[#a51d23] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <FaComments size={14} />
                      <span>{submittingComment ? 'Posting...' : 'Post Feedback'}</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No feedback yet. Be the first developer or client to leave feedback!
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div
                        key={c._id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex gap-3.5 items-start"
                      >
                        {c.userAvatar ? (
                          <img
                            src={c.userAvatar}
                            alt={c.userName || 'User'}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center font-bold text-xs shrink-0">
                            {(c.userName || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#171717] dark:text-white">
                              {c.userName || 'Anonymous Developer'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                              {(user?.role === 'Admin' || user?._id === c.userId) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(c._id)}
                                  className="text-slate-400 hover:text-red-500 transition p-1"
                                  title="Delete feedback"
                                >
                                  <FaTrash size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Right 1 Col: Tech Stack & Inquiry CTA */}
            <aside className="space-y-6">
              {/* Tech Stack Box */}
              <div className="p-6 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h3 className="text-lg font-bold font-title text-[#171717] dark:text-white mb-4 flex items-center gap-2">
                  <FaLaptopCode className="text-[#00FFFF]" />
                  <span>Tech Stack & Libraries</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(project.tech || []).map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Order / Inquiry Card */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C2272D]/20 blur-3xl pointer-events-none" />
                <h3 className="text-xl font-bold font-title text-white mb-2">
                  Need a similar website or app?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
                  I build custom, high-speed MERN stack web applications, REST APIs, and UI/UX solutions tailored to your business needs.
                </p>
                <div className="space-y-3">
                  <Link
                    to={`/services/order?project=${encodeURIComponent(project.title)}`}
                    className="w-full py-3 bg-[#C2272D] hover:bg-[#a51d23] text-white font-bold rounded-xl text-center text-sm transition block shadow-lg shadow-[#C2272D]/30"
                  >
                    Request Custom Quote
                  </Link>
                  <Link
                    to="/services"
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-center text-sm transition block"
                  >
                    View All Services & Pricing
                  </Link>
                </div>
              </div>

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <div className="p-6 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <h3 className="text-base font-bold font-title text-[#171717] dark:text-white mb-4">
                    More {project.tag} Projects
                  </h3>
                  <div className="space-y-3.5">
                    {relatedProjects.map((rp) => (
                      <Link
                        key={rp._id}
                        to={`/projects/${rp.slug || rp._id}`}
                        className="flex gap-3 items-center group"
                      >
                        <img
                          src={getCacheBustedUrl(rp.image, rp.updatedAt)}
                          alt={rp.title}
                          className="w-16 h-12 object-cover rounded-xl border border-slate-200 dark:border-white/10 group-hover:scale-105 transition"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#171717] dark:text-white group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition truncate">
                            {rp.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {rp.subtitle || rp.tag}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
