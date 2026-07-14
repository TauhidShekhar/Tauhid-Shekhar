import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaTrash, FaEdit, FaPlusCircle, FaTimes, FaCheck, FaGlobe, FaGithub, FaCloudUploadAlt, FaSearch,
  FaChevronUp, FaChevronDown, FaArrowUp, FaArrowDown, FaGripVertical
} from 'react-icons/fa';
import ImageCropperModal from '../components/ui/ImageCropperModal';

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

  // Image Cropping States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropAspect, setCropAspect] = useState(16/9);
  const [cropTitle, setCropTitle] = useState('Edit Image');
  const [cropCallback, setCropCallback] = useState(null);

  // Reordering, Sorting & Bulk Selection states
  const [sortBy, setSortBy] = useState('displayOrder');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPositionInput, setBulkPositionInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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
    images: [],
    displayOrder: 0
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
      onThumbnailSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onThumbnailSelect(file);
    }
  };

  const onThumbnailSelect = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif'];
    const fileName = file.name || '';
    const isHEIC = fileName.toLowerCase().endsWith('.heic') || fileName.toLowerCase().endsWith('.heif');
    
    if (!allowedTypes.includes(file.type) && !isHEIC) {
      alert('Supported formats: JPG, JPEG, PNG, WEBP, HEIC, SVG');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Thumbnail size must be less than 10MB');
      return;
    }

    setCropFile(file);
    setCropAspect(16/9);
    setCropTitle('Crop Project Thumbnail (16:9)');
    setCropCallback(() => handleFileUpload);
    setCropModalOpen(true);
  };

  const handleFileUpload = async (file) => {
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
      images: formData.images || [],
      displayOrder: formData.displayOrder ? Number(formData.displayOrder) : 0
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
      images: [],
      displayOrder: 0
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
      images: project.images || [],
      displayOrder: project.displayOrder || 0
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

  // Save new order to backend
  const saveNewOrders = async (orderedList) => {
    try {
      const orders = orderedList.map((p, index) => ({
        id: p._id,
        displayOrder: index + 1
      }));
      const res = await api.reorderProjects(orders);
      if (res.success) {
        fetchProjects();
      } else {
        alert(res.message || 'Failed to save new project order');
      }
    } catch (err) {
      console.error('Reorder request error:', err);
      alert('Error updating project sorting order');
    }
  };

  // Drag and drop handlers for rows
  const handleRowDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleRowDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRowDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...sortedProjects];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    saveNewOrders(list);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Quick Move handlers
  const moveProjectToTop = (index) => {
    const list = [...sortedProjects];
    const item = list[index];
    list.splice(index, 1);
    list.unshift(item);
    saveNewOrders(list);
  };

  const moveProjectUp = (index) => {
    if (index === 0) return;
    const list = [...sortedProjects];
    const item = list[index];
    list[index] = list[index - 1];
    list[index - 1] = item;
    saveNewOrders(list);
  };

  const moveProjectDown = (index) => {
    if (index === sortedProjects.length - 1) return;
    const list = [...sortedProjects];
    const item = list[index];
    list[index] = list[index + 1];
    list[index + 1] = item;
    saveNewOrders(list);
  };

  const moveProjectToBottom = (index) => {
    const list = [...sortedProjects];
    const item = list[index];
    list.splice(index, 1);
    list.push(item);
    saveNewOrders(list);
  };

  // Bulk Selection handlers
  const toggleProjectSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleProjectSelectAll = () => {
    const displayedIds = displayedProjects.map(p => p._id);
    const allSelected = displayedIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !displayedIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...displayedIds])]);
    }
  };

  const moveSelectedProjectsToTop = () => {
    if (selectedIds.length === 0) return;
    const selected = sortedProjects.filter(p => selectedIds.includes(p._id));
    const unselected = sortedProjects.filter(p => !selectedIds.includes(p._id));
    const newList = [...selected, ...unselected];
    saveNewOrders(newList);
    setSelectedIds([]);
  };

  const moveSelectedProjectsToBottom = () => {
    if (selectedIds.length === 0) return;
    const selected = sortedProjects.filter(p => selectedIds.includes(p._id));
    const unselected = sortedProjects.filter(p => !selectedIds.includes(p._id));
    const newList = [...unselected, ...selected];
    saveNewOrders(newList);
    setSelectedIds([]);
  };

  const assignSelectedProjectsPosition = () => {
    const targetPos = parseInt(bulkPositionInput, 10);
    if (isNaN(targetPos) || targetPos < 1 || targetPos > sortedProjects.length) {
      alert(`Please enter a valid position between 1 and ${sortedProjects.length}`);
      return;
    }
    if (selectedIds.length === 0) return;

    const selected = sortedProjects.filter(p => selectedIds.includes(p._id));
    const unselected = sortedProjects.filter(p => !selectedIds.includes(p._id));

    const targetIdx = targetPos - 1;
    const newList = [...unselected];
    newList.splice(targetIdx, 0, ...selected);

    saveNewOrders(newList);
    setSelectedIds([]);
    setBulkPositionInput('');
  };

  // Search & Filter computation
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterTag === 'all' || p.tag === filterTag;
    return matchesSearch && matchesFilter;
  });

  // Sorting calculation
  const getSortedProjects = () => {
    const list = [...filteredProjects];
    if (sortBy === 'displayOrder') {
      return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    if (sortBy === 'latest') {
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    if (sortBy === 'alpha-asc') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'alpha-desc') {
      return list.sort((a, b) => b.title.localeCompare(a.title));
    }
    return list;
  };
  const sortedProjects = getSortedProjects();

  // Pagination calculation
  const disablePagination = sortBy === 'displayOrder';
  const totalPages = disablePagination ? 1 : Math.ceil(sortedProjects.length / itemsPerPage);
  const displayedProjects = disablePagination 
    ? sortedProjects 
    : sortedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Display Order */}
            <div className="flex flex-col gap-2">
              <label htmlFor="displayOrder" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Display Order</label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder || 0}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
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
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={displayedProjects.length > 0 && displayedProjects.every(p => selectedIds.includes(p._id))}
                  onChange={toggleProjectSelectAll}
                  className="rounded border-slate-350 dark:border-white/10 text-primary-blue focus:ring-primary-blue cursor-pointer"
                  title="Select all on this page"
                />
                <h3 className="text-lg font-bold font-title text-black dark:text-white">Projects Directory</h3>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap gap-2 w-full xl:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:flex-initial">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search projects..."
                    className="w-full md:w-36 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
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

                {/* Sort By Selector */}
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs cursor-pointer"
                >
                  <option value="displayOrder">Order (Drag & Drop)</option>
                  <option value="latest">Latest Created</option>
                  <option value="oldest">Oldest Created</option>
                  <option value="alpha-asc">Alphabetical (A-Z)</option>
                  <option value="alpha-desc">Alphabetical (Z-A)</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {selectedIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-6 rounded-xl bg-primary-blue/5 border border-primary-blue/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-blue dark:text-blue-400">{selectedIds.length} Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={moveSelectedProjectsToTop}
                    className="px-2.5 py-1.5 rounded-lg bg-primary-blue hover:bg-accent-blue text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Move selected to top"
                  >
                    <FaArrowUp size={10} /> Top
                  </button>
                  <button
                    onClick={moveSelectedProjectsToBottom}
                    className="px-2.5 py-1.5 rounded-lg bg-primary-blue hover:bg-accent-blue text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Move selected to bottom"
                  >
                    <FaArrowDown size={10} /> Bottom
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={bulkPositionInput}
                      onChange={(e) => setBulkPositionInput(e.target.value)}
                      placeholder="Pos"
                      className="w-14 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
                    />
                    <button
                      onClick={assignSelectedProjectsPosition}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            )}

            {displayedProjects.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-450 dark:text-slate-400">
                No matching projects found.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedProjects.map((proj, idx) => {
                  const isSelected = selectedIds.includes(proj._id);
                  const isDragOverThis = dragOverIndex === idx;
                  return (
                    <div
                      key={proj._id}
                      draggable={sortBy === 'displayOrder'}
                      onDragStart={(e) => handleRowDragStart(e, idx)}
                      onDragOver={(e) => handleRowDragOver(e, idx)}
                      onDragEnd={handleRowDragEnd}
                      onDrop={(e) => handleRowDrop(e, idx)}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-all duration-350 text-left relative ${
                        isDragOverThis 
                          ? 'border-primary-blue bg-primary-blue/5 scale-[1.01] shadow-md shadow-primary-blue/5' 
                          : isSelected 
                            ? 'border-primary-blue/30 bg-primary-blue/5'
                            : 'border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Checkbox for selection */}
                      <div className="flex items-center self-center shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProjectSelect(proj._id)}
                          className="rounded border-slate-350 dark:border-white/10 text-primary-blue focus:ring-primary-blue cursor-pointer"
                        />
                      </div>

                      {/* Drag handle */}
                      {sortBy === 'displayOrder' && (
                        <div className="text-slate-400 dark:text-slate-650 self-center cursor-grab active:cursor-grabbing p-1 hover:text-slate-600 dark:hover:text-slate-400 shrink-0">
                          <FaGripVertical size={14} />
                        </div>
                      )}

                      {/* Project Thumbnail Image */}
                      <img
                        src={proj.image || 'assits/Project2.jpg'}
                        alt={proj.title}
                        className="w-20 aspect-[16/9] rounded-lg object-cover border border-slate-200 dark:border-white/5 shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-black dark:text-white leading-tight truncate">{proj.title}</h4>
                            <div className="flex gap-1.5 items-center mt-1">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                                {proj.tag}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/35 text-[10px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-wide">
                                Order: {proj.displayOrder || 0}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Quick Move Buttons (Only if sort is by displayOrder) */}
                            {sortBy === 'displayOrder' && (
                              <div className="flex gap-0.5 mr-1 bg-slate-150 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200/50 dark:border-white/5">
                                <button
                                  type="button"
                                  onClick={() => moveProjectToTop(idx)}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-500 hover:text-primary-blue hover:bg-slate-200 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                                  title="Move to top"
                                >
                                  <FaChevronUp size={9} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveProjectUp(idx)}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-500 hover:text-primary-blue hover:bg-slate-200 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                                  title="Move up"
                                >
                                  <FaArrowUp size={9} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveProjectDown(idx)}
                                  disabled={idx === displayedProjects.length - 1}
                                  className="p-1 rounded text-slate-500 hover:text-primary-blue hover:bg-slate-200 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                                  title="Move down"
                                >
                                  <FaArrowDown size={9} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveProjectToBottom(idx)}
                                  disabled={idx === displayedProjects.length - 1}
                                  className="p-1 rounded text-slate-500 hover:text-primary-blue hover:bg-slate-200 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                                  title="Move to bottom"
                                >
                                  <FaChevronDown size={9} />
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEditClick(proj)}
                              className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                              title="Edit"
                            >
                              <FaEdit size={11} />
                            </button>
                            <button
                              type="button"
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
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      type="button"
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
                      type="button"
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
      <ImageCropperModal
        isOpen={cropModalOpen}
        file={cropFile}
        aspectRatio={cropAspect}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={cropCallback}
        title={cropTitle}
      />
    </div>
  );
};

export default ProjectsManager;
