import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaTrash, FaEdit, FaPlusCircle, FaTimes, FaCheck, FaGlobe, FaGithub, FaCloudUploadAlt, FaSearch } from 'react-icons/fa';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Pagination states
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Uploading states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'website',
    image: '',
    github: '',
    demo: '',
    description: '',
    techInput: '',
    featuresInput: '',
    images: []
  });

  const [showcaseUploading, setShowcaseUploading] = useState(false);

  const categories = [
    { id: 'website', name: 'Websites' },
    { id: 'graphic', name: 'Graphic Design' },
    { id: 'branding', name: 'Branding' },
    { id: 'ui', name: 'UI Design' }
  ];

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects();
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Error fetching projects list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Supported formats: JPG, JPEG, PNG, WEBP, SVG');
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      const formPayload = new FormData();
      formPayload.append('file', file);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 100);

      const res = await api.uploadMedia(formPayload);
      clearInterval(interval);
      setUploadProgress(100);

      if (res.success && res.data?.fileUrl) {
        setFormData(prev => ({ ...prev, image: res.data.fileUrl }));
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const handleShowcaseFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setShowcaseUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} ignored: Unsupported format.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} ignored: Size must be less than 5MB.`);
        continue;
      }

      try {
        const formPayload = new FormData();
        formPayload.append('file', file);
        const res = await api.uploadMedia(formPayload);
        if (res.success && res.data?.fileUrl) {
          uploadedUrls.push(res.data.fileUrl);
        }
      } catch (err) {
        console.error('Failed to upload showcase image:', err.message);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedUrls]
    }));
    setShowcaseUploading(false);
  };

  const removeShowcaseImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tech = formData.techInput.split(',').map(s => s.trim()).filter(Boolean);
    const features = formData.featuresInput.split('\n').map(s => s.trim()).filter(Boolean);

    const submissionData = {
      title: formData.title,
      subtitle: formData.subtitle,
      tag: formData.tag,
      image: formData.image || 'assits/Project2.jpg',
      github: formData.github,
      demo: formData.demo,
      description: formData.description,
      tech,
      features,
      images: formData.images || []
    };

    try {
      if (isEditing) {
        const res = await api.updateProject(currentId, submissionData);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchProjects();
        }
      } else {
        const res = await api.createProject(submissionData);
        if (res.success) {
          resetForm();
          fetchProjects();
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      tag: 'website',
      image: '',
      github: '',
      demo: '',
      description: '',
      techInput: '',
      featuresInput: '',
      images: []
    });
  };

  const handleEditClick = (project) => {
    setIsEditing(true);
    setCurrentId(project._id);
    setFormData({
      title: project.title,
      subtitle: project.subtitle || '',
      tag: project.tag,
      image: project.image || '',
      github: project.github || '',
      demo: project.demo || '',
      description: project.description || '',
      techInput: (project.tech || []).join(', '),
      featuresInput: (project.features || []).join('\n'),
      images: project.images || []
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setLoading(true);
    try {
      const res = await api.deleteProject(id);
      if (res.success) {
        fetchProjects();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentId(null);
    resetForm();
  };

  // Search & Filter computation
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterTag === 'all' || p.tag === filterTag;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const displayedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white">Projects Manager</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage project descriptions, categories, and repositories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Name</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. MERN Learning Management System"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-2">
              <label htmlFor="subtitle" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subtitle</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="e.g. MERN Stack LMS Dashboard"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Category Tag */}
            <div className="flex flex-col gap-2">
              <label htmlFor="tag" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category Tag</label>
              <select
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Image Drag & Drop / Click Upload Container */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Image / Thumbnail</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDraggingOver 
                    ? 'border-primary-blue bg-primary-blue/5' 
                    : 'border-slate-250 dark:border-white/10 hover:border-primary-blue/60'
                }`}
              >
                {formData.image ? (
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label htmlFor="replace-image-file" className="px-4 py-2 bg-white text-black text-xs font-black rounded-lg cursor-pointer hover:bg-slate-100">
                        Replace
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white text-xs font-black rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FaCloudUploadAlt size={34} className="text-slate-400 dark:text-slate-500" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & drop project thumbnail here</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</p>
                    <label htmlFor="project-image-file" className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-xs font-black cursor-pointer border border-slate-200 dark:border-white/5 transition-colors">
                      Browse Local Files
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  id="project-image-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  id="replace-image-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-1">
                  <div 
                    style={{ width: `${uploadProgress}%` }} 
                    className="bg-primary-blue h-full transition-all duration-300 rounded-full"
                  />
                </div>
              )}

              {/* Fallback URL Input */}
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Or paste custom image path/URL here..."
                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-xs transition-colors"
              />
            </div>

            {/* Showcase Images (Multiple) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Showcase Images (Optional, Multiple)</label>
              
              {/* Flex list of current uploaded showcase images */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 group">
                      <img src={imgUrl} alt="Showcase Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeShowcaseImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button for Showcase */}
              <label
                htmlFor="showcase-images-upload"
                className="w-full py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-xs font-black cursor-pointer border border-slate-200 dark:border-white/5 transition-colors flex items-center justify-center gap-1.5"
              >
                {showcaseUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-800 dark:border-white border-t-transparent rounded-full animate-spin" />
                    Uploading Showcase Images...
                  </>
                ) : (
                  <>
                    <FaPlusCircle size={12} className="text-primary-blue" /> Add Showcase Images
                  </>
                )}
              </label>
              <input
                type="file"
                id="showcase-images-upload"
                multiple
                accept="image/*"
                onChange={handleShowcaseFilesChange}
                className="hidden"
                disabled={showcaseUploading}
              />
            </div>

            {/* Github & Demo links */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="github" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">GitHub Link</label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="demo" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Demo Link</label>
                <input
                  type="text"
                  id="demo"
                  name="demo"
                  value={formData.demo}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-col gap-2">
              <label htmlFor="techInput" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tech Stack (comma separated)</label>
              <input
                type="text"
                id="techInput"
                name="techInput"
                value={formData.techInput}
                onChange={handleInputChange}
                placeholder="React.js, Node.js, Express.js, MongoDB"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Short Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Type project description here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-none"
              />
            </div>

            {/* Features */}
            <div className="flex flex-col gap-2">
              <label htmlFor="featuresInput" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Features (one per line)</label>
              <textarea
                id="featuresInput"
                name="featuresInput"
                rows="4"
                value={formData.featuresInput}
                onChange={handleInputChange}
                placeholder="Admin & teacher dashboards&#10;Secure JWT authentication&#10;Database schema modeling"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors resize-none"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex gap-3 mt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-center text-sm font-bold border border-slate-200 dark:border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FaTimes /> Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary-blue/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish Project'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Projects Directory List */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
            
            {/* Header + Search/Filter block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold font-title text-black dark:text-white">Projects Directory</h3>
              
              <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:flex-initial">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search projects..."
                    className="w-full md:w-44 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400" size={10} />
                </div>
                
                {/* Filter */}
                <select
                  value={filterTag}
                  onChange={(e) => { setFilterTag(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs cursor-pointer"
                >
                  <option value="all">All categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {displayedProjects.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-450 dark:text-slate-400">
                No matching projects found.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-start gap-4 hover:scale-[1.01] transition-transform duration-300 text-left"
                  >
                    <img
                      src={proj.image || 'assits/Project2.jpg'}
                      alt={proj.title}
                      className="w-20 aspect-[16/9] rounded-lg object-cover border border-slate-200 dark:border-white/5 shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-black dark:text-white leading-tight truncate">{proj.title}</h4>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                            {proj.tag}
                          </span>
                        </div>
                        
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEditClick(proj)}
                            className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                            title="Edit"
                          >
                            <FaEdit size={11} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(proj._id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                            title="Delete"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="flex items-center gap-3.5 mt-3 pt-3 border-t border-slate-200/40 dark:border-white/5">
                        {proj.github && (
                          <a href={proj.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-blue">
                            <FaGithub size={11} /> Source
                          </a>
                        )}
                        {proj.demo && (
                          <a href={proj.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-blue">
                            <FaGlobe size={11} /> Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-400 disabled:opacity-50 cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-slate-450 dark:text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-400 disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsManager;
