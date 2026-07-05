import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaGithub, FaExternalLinkAlt, FaCode, FaThumbsUp, 
  FaComment, FaPlus, FaTimes, FaSpinner, FaSearch, FaUser 
} from 'react-icons/fa';

const CommunityProjectDiscussions = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProgress, setFilterProgress] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Show / Hide Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [commentDrawerProject, setCommentDrawerProject] = useState(null);
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [techUsed, setTechUsed] = useState('');
  const [progress, setProgress] = useState('Idea');
  const [lookingFor, setLookingFor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        setScreenshotUrl(res.url);
      }
    } catch (err) {
      alert('Screenshot upload failed: ' + err.message);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProgress !== 'All') params.progress = filterProgress;
      if (searchQuery) params.search = searchQuery;
      const res = await api.getCommunityProjects(params);
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filterProgress, searchQuery]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        githubUrl,
        liveUrl,
        techUsed,
        progress,
        lookingFor,
        screenshots: screenshotUrl ? [screenshotUrl] : []
      };
      const res = await api.createCommunityProject(payload);
      if (res.success) {
        setProjects([res.data, ...projects]);
        setShowAddModal(false);
        // Reset
        setTitle('');
        setDescription('');
        setGithubUrl('');
        setLiveUrl('');
        setTechUsed('');
        setProgress('Idea');
        setLookingFor('');
        setScreenshotUrl('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (projectId) => {
    try {
      const res = await api.likeCommunityProject(projectId);
      if (res.success) {
        setProjects(projects.map(p => 
          p._id === projectId ? { ...p, likes: res.likes } : p
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment || !commentDrawerProject) return;
    try {
      const res = await api.commentOnCommunityProject(commentDrawerProject._id, newComment);
      if (res.success) {
        const updatedComments = res.data;
        setProjects(projects.map(p => 
          p._id === commentDrawerProject._id ? { ...p, comments: updatedComments } : p
        ));
        setCommentDrawerProject({ ...commentDrawerProject, comments: updatedComments });
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await api.deleteCommunityProject(projectId);
      if (res.success) {
        setProjects(projects.filter(p => p._id !== projectId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4 sm:p-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black font-title text-black dark:text-white flex items-center gap-2">
            <FaCode className="text-primary-blue" /> Project Discussions
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">Showcase your products, find contributors, and collaborate with developers.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15 w-fit"
        >
          <FaPlus /> Share Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['All', 'Idea', 'In Progress', 'Beta', 'Completed'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterProgress(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterProgress === p
                  ? 'bg-primary-blue text-white'
                  : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 text-xs" />
          <input
            type="text"
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 focus:border-primary-blue"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FaSpinner className="animate-spin text-2xl text-primary-blue" />
          <p className="text-xs text-slate-450 font-bold">Loading showcase...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <FaCode size={40} className="text-slate-300 dark:text-slate-350 mb-3" />
          <p className="text-sm font-black text-black dark:text-white">No projects posted yet</p>
          <p className="text-xs text-slate-450 mt-1 max-w-sm">Be the first to share your creative project with the developer community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300 relative group"
            >
              {/* Top Details */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="font-black font-title text-base text-black dark:text-white group-hover:text-primary-blue transition-colors">
                      {project.title}
                    </h3>
                    {/* Author */}
                    <div className="flex items-center gap-2 mt-1.5">
                      {project.author?.avatar?.url ? (
                        <img 
                          src={project.author.avatar.url} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-white/10" 
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                          <FaUser size={10} className="text-slate-400" />
                        </div>
                      )}
                      <span className="text-[10px] font-extrabold text-slate-550 dark:text-slate-300">
                        {project.author?.fullName || 'Anonymous'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 font-bold ml-1.5">
                        {project.progress}
                      </span>
                    </div>
                  </div>

                  {/* Delete Option for Author */}
                  {(project.author?._id === user?.id || user?.role === 'Admin') && (
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-slate-400 hover:text-red-500 text-xs p-1"
                      title="Delete Project"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {/* Project Screenshot Banner */}
                {project.screenshots && project.screenshots[0] && (
                  <div className="h-40 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-white/5">
                    <img src={project.screenshots[0]} alt="Screenshot" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-xs text-slate-655 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Badges */}
                {project.techUsed?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techUsed.map((tech) => (
                      <span 
                        key={tech} 
                        className="px-2 py-1 bg-primary-blue/5 border border-primary-blue/10 text-primary-blue rounded-md text-[9px] font-black"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Looking For Collaboration */}
                {project.lookingFor?.length > 0 && (
                  <div className="mb-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-left">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wider mb-1">Looking For:</p>
                    <div className="flex flex-wrap gap-1">
                      {project.lookingFor.map(role => (
                        <span key={role} className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          • {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-2 flex justify-between items-center">
                <div className="flex gap-3">
                  {/* GitHub */}
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary-blue"
                    >
                      <FaGithub /> GitHub
                    </a>
                  )}
                  {/* Live URL */}
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-primary-blue"
                    >
                      <FaExternalLinkAlt /> Live Demo
                    </a>
                  )}
                </div>

                <div className="flex gap-4">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(project._id)}
                    className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                      project.likes?.includes(user?.id) 
                        ? 'text-primary-blue' 
                        : 'text-slate-450 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    <FaThumbsUp /> {project.likes?.length || 0}
                  </button>

                  {/* Comment Toggle */}
                  <button
                    onClick={() => setCommentDrawerProject(project)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <FaComment /> {project.comments?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
              <h2 className="text-lg font-black font-title text-black dark:text-white">Share Your Project</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Project Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. GitLens for VS Code" 
                  className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Explain what your project does, the technical problems you solved, and how developers can participate." 
                  rows="4"
                  className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Project Cover / Screenshot Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleScreenshotUpload} 
                  className="w-full text-xs text-slate-500 border border-slate-200 dark:border-white/5 p-2 rounded-xl"
                />
                {screenshotUrl && (
                  <img src={screenshotUrl} alt="Preview" className="w-40 h-20 object-cover rounded-xl border border-slate-250 mt-1" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">GitHub Repository</label>
                  <input 
                    type="url" 
                    value={githubUrl} 
                    onChange={e => setGithubUrl(e.target.value)} 
                    placeholder="https://github.com/..." 
                    className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Live Website Demo</label>
                  <input 
                    type="url" 
                    value={liveUrl} 
                    onChange={e => setLiveUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Tech Used (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={techUsed} 
                    onChange={e => setTechUsed(e.target.value)} 
                    placeholder="React, Tailwind, Node.js" 
                    className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Project Progress</label>
                  <select 
                    value={progress} 
                    onChange={e => setProgress(e.target.value)} 
                    className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Beta">Beta</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Roles Needed (Comma-separated)</label>
                <input 
                  type="text" 
                  value={lookingFor} 
                  onChange={e => setLookingFor(e.target.value)} 
                  placeholder="Contributors, Designers, Back-End Developer" 
                  className="w-full text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-white/5 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md shadow-primary-blue/15"
                >
                  {submitting ? 'Submitting...' : 'Post Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer / Side Modal */}
      {commentDrawerProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-end">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200/60 dark:border-white/5 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
                <h2 className="text-base font-black font-title text-black dark:text-white truncate max-w-[280px]">
                  Comments on "{commentDrawerProject.title}"
                </h2>
                <button 
                  onClick={() => setCommentDrawerProject(null)}
                  className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
                {commentDrawerProject.comments?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-450 font-bold">No feedback yet. Leave the first comment!</p>
                  </div>
                ) : (
                  commentDrawerProject.comments.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-left border border-slate-150 dark:border-transparent">
                      <div className="flex items-center gap-2 mb-1">
                        {c.author?.avatar?.url ? (
                          <img 
                            src={c.author.avatar.url} 
                            alt="" 
                            className="w-4 h-4 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-250 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                            U
                          </div>
                        )}
                        <span className="text-[10px] font-black text-black dark:text-white">
                          {c.author?.fullName || 'Anonymous'}
                        </span>
                        <span className="text-[8px] text-slate-400 ml-auto">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 dark:text-slate-350 font-medium">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Footer */}
            <form onSubmit={handleAddComment} className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4 flex gap-2">
              <input 
                type="text" 
                placeholder="Give feedback or request features..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 text-xs text-black dark:text-white border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl focus:border-primary-blue"
                required
              />
              <button 
                type="submit" 
                className="px-4.5 py-3 bg-primary-blue text-white rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityProjectDiscussions;
