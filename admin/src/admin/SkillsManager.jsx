import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaTrash, FaEdit, FaPlusCircle, FaTimes, FaCheck, FaGlobe, FaGithub, FaCloudUploadAlt, FaSearch,
  FaChevronUp, FaChevronDown, FaArrowUp, FaArrowDown, FaGripVertical 
} from 'react-icons/fa';
import ImageCropperModal from '../components/ui/ImageCropperModal';

const getAutoLogoUrl = (skillName) => {
  const name = skillName.toLowerCase().trim();
  const mapping = {
    'html': { icon: 'html5', version: 'original' },
    'html5': { icon: 'html5', version: 'original' },
    'css': { icon: 'css3', version: 'original' },
    'css3': { icon: 'css3', version: 'original' },
    'javascript': { icon: 'javascript', version: 'original' },
    'js': { icon: 'javascript', version: 'original' },
    'javascript (es6)': { icon: 'javascript', version: 'original' },
    'typescript': { icon: 'typescript', version: 'original' },
    'ts': { icon: 'typescript', version: 'original' },
    'react': { icon: 'react', version: 'original' },
    'react.js': { icon: 'react', version: 'original' },
    'reactjs': { icon: 'react', version: 'original' },
    'next.js': { icon: 'nextjs', version: 'original' },
    'nextjs': { icon: 'nextjs', version: 'original' },
    'node.js': { icon: 'nodejs', version: 'original' },
    'nodejs': { icon: 'nodejs', version: 'original' },
    'express.js': { icon: 'express', version: 'original' },
    'expressjs': { icon: 'express', version: 'original' },
    'express': { icon: 'express', version: 'original' },
    'mongodb': { icon: 'mongodb', version: 'original' },
    'mongo': { icon: 'mongodb', version: 'original' },
    'mysql': { icon: 'mysql', version: 'original' },
    'postgresql': { icon: 'postgresql', version: 'original' },
    'postgres': { icon: 'postgresql', version: 'original' },
    'firebase': { icon: 'firebase', version: 'original' },
    'git': { icon: 'git', version: 'original' },
    'github': { icon: 'github', version: 'original' },
    'docker': { icon: 'docker', version: 'original' },
    'vs code': { icon: 'vscode', version: 'original' },
    'vscode': { icon: 'vscode', version: 'original' },
    'visual studio code': { icon: 'vscode', version: 'original' },
    'tailwind css': { icon: 'tailwindcss', version: 'original' },
    'tailwind': { icon: 'tailwindcss', version: 'original' },
    'tailwindcss': { icon: 'tailwindcss', version: 'original' },
    'bootstrap': { icon: 'bootstrap', version: 'original' },
    'python': { icon: 'python', version: 'original' },
    'java': { icon: 'java', version: 'original' },
    'c': { icon: 'c', version: 'original' },
    'c++': { icon: 'cplusplus', version: 'original' },
    'c / c++': { icon: 'cplusplus', version: 'original' },
    'cpp': { icon: 'cplusplus', version: 'original' },
    'php': { icon: 'php', version: 'original' },
    'laravel': { icon: 'laravel', version: 'original' },
    'angular': { icon: 'angular', version: 'original' },
    'vue.js': { icon: 'vuejs', version: 'original' },
    'vuejs': { icon: 'vuejs', version: 'original' },
    'vue': { icon: 'vuejs', version: 'original' },
    'redux': { icon: 'redux', version: 'original' },
    'linux': { icon: 'linux', version: 'original' },
    'figma': { icon: 'figma', version: 'original' },
    'canva': { icon: 'canva', version: 'original' },
    'adobe photoshop': { icon: 'photoshop', version: 'original' },
    'photoshop': { icon: 'photoshop', version: 'original' },
    'adobe illustrator': { icon: 'illustrator', version: 'original' },
    'illustrator': { icon: 'illustrator', version: 'original' },
    'go': { icon: 'go', version: 'original-wordmark' },
    'golang': { icon: 'go', version: 'original-wordmark' },
    'graphql': { icon: 'graphql', version: 'plain' },
    'kubernetes': { icon: 'kubernetes', version: 'plain' },
    'k8s': { icon: 'kubernetes', version: 'plain' },
    'aws': { icon: 'amazonwebservices', version: 'original' },
    'amazon web services': { icon: 'amazonwebservices', version: 'original' },
    'sass': { icon: 'sass', version: 'original' },
    'scss': { icon: 'sass', version: 'original' },
    'jquery': { icon: 'jquery', version: 'original' },
    'webpack': { icon: 'webpack', version: 'original' },
    'npm': { icon: 'npm', version: 'original-wordmark' },
    'yarn': { icon: 'yarn', version: 'original' },
    'rust': { icon: 'rust', version: 'original' },
    'sqlite': { icon: 'sqlite', version: 'original' },
    'redis': { icon: 'redis', version: 'original' },
    'django': { icon: 'django', version: 'plain' },
    'flask': { icon: 'flask', version: 'original' },
    'spring': { icon: 'spring', version: 'original' },
    'spring boot': { icon: 'spring', version: 'original' }
  };

  const match = mapping[name];
  if (match) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${match.icon}/${match.icon}-${match.version}.svg`;
  }
  const alphanumericName = name.replace(/[^a-z0-9]/g, '');
  if (alphanumericName && alphanumericName.length > 1) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${alphanumericName}/${alphanumericName}-original.svg`;
  }
  return '';
};

const CATEGORY_LOGOS = {
  'Programming': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  'Frontend': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
  'Backend': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
  'Database': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',
  'Tools': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
  'Concepts': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg'
};

const getSkillLogoUrl = (skill) => {
  if (skill.logoType === 'custom' && skill.logoUrl) {
    return skill.logoUrl;
  }
  const autoUrl = getAutoLogoUrl(skill.name);
  if (autoUrl) {
    return autoUrl;
  }
  if (skill.useCategoryFallback !== false) {
    const prim = skill.primaryCategory || (skill.categories && skill.categories[0]) || skill.category || 'Frontend';
    const norm = prim.charAt(0).toUpperCase() + prim.slice(1).toLowerCase();
    let matchKey = 'Frontend';
    if (norm === 'programming') matchKey = 'Programming';
    else if (norm === 'frontend') matchKey = 'Frontend';
    else if (norm === 'backend') matchKey = 'Backend';
    else if (norm === 'database') matchKey = 'Database';
    else if (norm === 'tools') matchKey = 'Tools';
    else if (norm === 'concepts') matchKey = 'Concepts';
    return CATEGORY_LOGOS[matchKey] || CATEGORY_LOGOS['Frontend'];
  }
  return '';
};

const guessRecommendedCategories = (skillName) => {
  const name = skillName.toLowerCase().trim();
  if (name.includes('javascript') || name === 'js' || name.includes('es6')) {
    return ['Programming', 'Frontend', 'Backend'];
  }
  if (name.includes('typescript') || name === 'ts') {
    return ['Programming', 'Frontend', 'Backend'];
  }
  if (name.includes('react') || name === 'reactjs') {
    return ['Programming', 'Frontend'];
  }
  if (name.includes('next.js') || name.includes('nextjs')) {
    return ['Programming', 'Frontend', 'Backend'];
  }
  if (name.includes('node') || name.includes('nodejs')) {
    return ['Programming', 'Backend'];
  }
  if (name.includes('express') || name.includes('expressjs')) {
    return ['Backend'];
  }
  if (name.includes('mongodb') || name === 'mongo') {
    return ['Database', 'Backend'];
  }
  if (name.includes('mysql') || name.includes('postgresql') || name.includes('postgres') || name.includes('sqlite') || name.includes('redis')) {
    return ['Database'];
  }
  if (name.includes('git') || name.includes('github') || name.includes('docker') || name.includes('vscode') || name.includes('vs code') || name.includes('visual studio code') || name.includes('postman') || name.includes('netlify') || name.includes('vercel') || name.includes('npm') || name.includes('yarn')) {
    return ['Tools', 'Programming'];
  }
  if (name.includes('python') || name.includes('java') || name === 'c' || name.includes('c++') || name === 'cpp' || name.includes('php') || name.includes('go') || name.includes('golang') || name.includes('rust')) {
    return ['Programming'];
  }
  if (name.includes('html') || name.includes('css') || name.includes('tailwind') || name.includes('bootstrap') || name.includes('responsive design') || name === 'sass' || name === 'scss') {
    return ['Frontend'];
  }
  if (name.includes('laravel') || name.includes('django') || name.includes('flask') || name.includes('spring')) {
    return ['Programming', 'Backend'];
  }
  if (name.includes('figma') || name.includes('canva') || name.includes('photoshop') || name.includes('illustrator')) {
    return ['Tools'];
  }
  if (name.includes('crud') || name.includes('mvc') || name.includes('api') || name.includes('design pattern') || name.includes('algorithm') || name.includes('data structure')) {
    return ['Concepts'];
  }
  if (name.includes('api') || name.includes('rest') || name.includes('jwt') || name.includes('auth')) {
    return ['Backend', 'Concepts'];
  }
  return ['Frontend']; // fallback default
};

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Image Cropping States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropFile, setCropFile] = useState(null);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 80,
    category: 'Frontend',
    categories: ['Frontend'],
    logoType: 'auto',
    logoUrl: '',
    isActive: true,
    useCategoryFallback: true,
    primaryCategory: 'Frontend',
    displayOrder: 0
  });

  // Sorting, Drag & Drop & Bulk Selection states
  const [sortBy, setSortBy] = useState('displayOrder');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPositionInput, setBulkPositionInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const categories = [
    { id: 'Programming', name: 'Programming' },
    { id: 'Frontend', name: 'Frontend' },
    { id: 'Backend', name: 'Backend' },
    { id: 'Database', name: 'Database' },
    { id: 'Tools', name: 'Tools' },
    { id: 'Concepts', name: 'Concepts' }
  ];

  const fetchSkills = async () => {
    try {
      const res = await api.getSkills();
      if (res.success) {
        setSkills(res.data);
      }
    } catch (err) {
      console.error('Error fetching skills list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const onLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif'];
    const fileName = file.name || '';
    const isHEIC = fileName.toLowerCase().endsWith('.heic') || fileName.toLowerCase().endsWith('.heif');
    
    if (!allowedTypes.includes(file.type) && !isHEIC) {
      alert('Unsupported format. Supported: JPG, PNG, WEBP, HEIC, SVG');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Logo must be less than 10MB');
      return;
    }

    setCropFile(file);
    setCropModalOpen(true);
  };

  const handleLogoUpload = async (file) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    setUploading(true);
    try {
      const res = await api.uploadMedia(uploadData);
      if (res.success) {
        setFormData(prev => ({ ...prev, logoUrl: res.data.fileUrl }));
      } else {
        alert(res.message || 'Upload failed');
      }
    } catch (err) {
      alert(err.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: name === 'percentage' || name === 'displayOrder' ? Number(value) : value
      };
      
      // Auto-suggest categories only on name change when creating a new skill
      if (name === 'name' && value.trim() && !isEditing) {
        const suggested = guessRecommendedCategories(value);
        if (suggested && suggested.length > 0) {
          updated.categories = suggested;
          updated.category = suggested[0] || 'Frontend';
          updated.primaryCategory = suggested[0] || 'Frontend';
        }
      }
      
      return updated;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categories || formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    setLoading(true);

    try {
      if (isEditing) {
        const res = await api.updateSkill(currentId, formData);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          setFormData({ name: '', percentage: 80, category: 'Frontend', categories: ['Frontend'], logoType: 'auto', logoUrl: '', isActive: true, useCategoryFallback: true, primaryCategory: 'Frontend', displayOrder: 0 });
          fetchSkills();
        }
      } else {
        const res = await api.createSkill(formData);
        if (res.success) {
          setFormData({ name: '', percentage: 80, category: 'Frontend', categories: ['Frontend'], logoType: 'auto', logoUrl: '', isActive: true, useCategoryFallback: true, primaryCategory: 'Frontend', displayOrder: 0 });
          fetchSkills();
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
      setLoading(false);
    }
  };

  const handleEditClick = (skill) => {
    setIsEditing(true);
    setCurrentId(skill._id);
    let cats = [];
    if (skill.categories && Array.isArray(skill.categories) && skill.categories.length > 0) {
      cats = skill.categories;
    } else if (skill.category) {
      cats = [skill.category];
    } else {
      cats = ['Frontend'];
    }
    setFormData({
      name: skill.name,
      percentage: skill.percentage,
      category: skill.category || cats[0],
      categories: cats,
      logoType: skill.logoType || 'auto',
      logoUrl: skill.logoUrl || '',
      isActive: skill.isActive !== false,
      useCategoryFallback: skill.useCategoryFallback !== false,
      primaryCategory: skill.primaryCategory || cats[0] || 'Frontend',
      displayOrder: skill.displayOrder || 0
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    setLoading(true);
    try {
      const res = await api.deleteSkill(id);
      if (res.success) {
        fetchSkills();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', percentage: 80, category: 'Frontend', categories: ['Frontend'], logoType: 'auto', logoUrl: '', isActive: true, displayOrder: 0 });
  };

  // Sorting calculations
  const getSortedSkills = () => {
    const list = [...skills];
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
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'alpha-desc') {
      return list.sort((a, b) => b.name.localeCompare(a.name));
    }
    return list;
  };
  const sortedSkills = getSortedSkills();

  // Save new orders
  const saveNewOrders = async (newList) => {
    const updatedWithOrders = newList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));
    setSkills(updatedWithOrders);
    try {
      const orders = updatedWithOrders.map(item => ({
        id: item._id,
        displayOrder: item.displayOrder
      }));
      await api.reorderSkills(orders);
    } catch (err) {
      alert('Error updating orders: ' + err.message);
    }
  };

  // Drag & Drop
  const handleDragStart = (e, index) => {
    if (sortBy !== 'displayOrder') return;
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    if (sortBy !== 'displayOrder') return;
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e, targetIndex) => {
    if (sortBy !== 'displayOrder') return;
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDragOverIndex(null);
      return;
    }

    const reordered = [...sortedSkills];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    await saveNewOrders(reordered);
    setDragOverIndex(null);
  };

  // Quick Move
  const moveSkillToTop = async (index) => {
    const reordered = [...sortedSkills];
    const [moved] = reordered.splice(index, 1);
    reordered.unshift(moved);
    await saveNewOrders(reordered);
  };

  const moveSkillUp = async (index) => {
    if (index === 0) return;
    const reordered = [...sortedSkills];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    await saveNewOrders(reordered);
  };

  const moveSkillDown = async (index) => {
    if (index === sortedSkills.length - 1) return;
    const reordered = [...sortedSkills];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    await saveNewOrders(reordered);
  };

  const moveSkillToBottom = async (index) => {
    const reordered = [...sortedSkills];
    const [moved] = reordered.splice(index, 1);
    reordered.push(moved);
    await saveNewOrders(reordered);
  };

  // Bulk selection functions
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedSkills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedSkills.map(s => s._id));
    }
  };

  const moveSelectedToTop = async () => {
    const selected = sortedSkills.filter(s => selectedIds.includes(s._id));
    const unselected = sortedSkills.filter(s => !selectedIds.includes(s._id));
    const reordered = [...selected, ...unselected];
    await saveNewOrders(reordered);
    setSelectedIds([]);
  };

  const moveSelectedToBottom = async () => {
    const selected = sortedSkills.filter(s => selectedIds.includes(s._id));
    const unselected = sortedSkills.filter(s => !selectedIds.includes(s._id));
    const reordered = [...unselected, ...selected];
    await saveNewOrders(reordered);
    setSelectedIds([]);
  };

  const assignSelectedPosition = async () => {
    const pos = parseInt(bulkPositionInput, 10);
    if (isNaN(pos) || pos < 1 || pos > skills.length) {
      alert(`Please enter a valid position between 1 and ${skills.length}`);
      return;
    }
    const selected = sortedSkills.filter(s => selectedIds.includes(s._id));
    const unselected = sortedSkills.filter(s => !selectedIds.includes(s._id));
    
    const reordered = [...unselected];
    reordered.splice(pos - 1, 0, ...selected);
    await saveNewOrders(reordered);
    setSelectedIds([]);
    setBulkPositionInput('');
  };

  if (loading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-black font-title text-black dark:text-white tracking-tight">Skills Manager</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure and reorder skills shown on the homepage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add / Edit Skill */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm h-fit">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            <FaPlusCircle className="text-primary-blue" />
            {isEditing ? 'Modify Skill' : 'Publish New Skill'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-left">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skill Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. React.js"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Category Multi-Checklist */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</label>
                <button
                  type="button"
                  onClick={() => {
                    const allCatIds = categories.map(c => c.id);
                    const isAllSelected = formData.categories.length === allCatIds.length;
                    setFormData(prev => ({
                      ...prev,
                      categories: isAllSelected ? [] : allCatIds,
                      category: isAllSelected ? '' : allCatIds[0] || '',
                      primaryCategory: isAllSelected ? '' : (prev.primaryCategory || allCatIds[0])
                    }));
                  }}
                  className="text-[10px] font-black uppercase text-primary-blue hover:underline cursor-pointer"
                >
                  {formData.categories.length === categories.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                {categories.map((cat) => {
                  const isChecked = formData.categories.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setFormData(prev => {
                            let nextCats = [...prev.categories];
                            if (isChecked) {
                              nextCats = nextCats.filter(id => id !== cat.id);
                            } else {
                              nextCats.push(cat.id);
                            }
                            let nextPrimary = prev.primaryCategory;
                            if (isChecked && prev.primaryCategory === cat.id) {
                              nextPrimary = nextCats[0] || '';
                            } else if (!isChecked && !prev.primaryCategory) {
                              nextPrimary = cat.id;
                            }
                            return {
                              ...prev,
                              categories: nextCats,
                              category: nextCats[0] || '',
                              primaryCategory: nextPrimary
                            };
                          });
                        }}
                        className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
              {formData.categories.length === 0 && (
                <p className="text-[10px] text-red-500 font-bold">Please select at least one category</p>
              )}
            </div>

            {/* Fallback Option & Primary Category Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fallback Option</label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.useCategoryFallback !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, useCategoryFallback: e.target.checked }))}
                    className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Use Category Logo as Fallback</span>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="primaryCategory" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Primary Category</label>
                <select
                  id="primaryCategory"
                  name="primaryCategory"
                  value={formData.primaryCategory}
                  onChange={handleInputChange}
                  disabled={formData.categories.length === 0}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors cursor-pointer disabled:opacity-55"
                >
                  {formData.categories.map(catId => (
                    <option key={catId} value={catId}>{catId}</option>
                  ))}
                  {formData.categories.length === 0 && (
                    <option value="">No categories selected</option>
                  )}
                </select>
              </div>
            </div>

            {/* Logo Type */}
            <div className="flex flex-col gap-2">
              <label htmlFor="logoType" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logo Mode</label>
              <select
                id="logoType"
                name="logoType"
                value={formData.logoType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors cursor-pointer"
              >
                <option value="auto">Automatic (Official Technology Logo)</option>
                <option value="custom">Custom Upload (Upload Logo Asset)</option>
              </select>
            </div>

            {/* Custom Logo File Uploader */}
            {formData.logoType === 'custom' && (
              <div className="flex flex-col gap-2 p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-250/50 dark:border-white/5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upload Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shrink-0">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400">No image</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onLogoSelect}
                      disabled={uploading}
                      className="hidden"
                      id="logoFilePicker"
                    />
                    <label
                      htmlFor="logoFilePicker"
                      className={`inline-block px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-350 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-lg text-xs font-bold transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Supports PNG, SVG, JPG, WEBP</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Preview Panel */}
            <div className="flex flex-col gap-2 p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-250/50 dark:border-white/5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logo Preview</label>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shrink-0">
                  {(() => {
                    const previewSrc = getSkillLogoUrl(formData);
                    return previewSrc ? (
                      <img 
                        src={previewSrc} 
                        alt="Preview" 
                        className="w-8 h-8 object-contain" 
                        onError={(e) => {
                          const primaryCat = formData.primaryCategory || formData.categories[0] || 'Frontend';
                          const fallbackLogo = CATEGORY_LOGOS[primaryCat] || CATEGORY_LOGOS['Frontend'];
                          if (formData.useCategoryFallback !== false && e.target.src !== fallbackLogo) {
                            e.target.src = fallbackLogo;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-400 border border-purple-500/10 flex items-center justify-center font-extrabold text-sm select-none">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {formData.name || 'Unnamed Skill'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formData.logoType === 'custom' ? 'Custom Upload Logo' : 'Automatic API Logo'} 
                    {formData.useCategoryFallback !== false && ' (Category Fallback Enabled)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Visibility Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                Active / Show on Portfolio
              </label>
            </div>

            {/* Percentage */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="percentage" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expertise Percentage</label>
                <span className="text-sm font-extrabold text-primary-blue">{formData.percentage}%</span>
              </div>
              <input
                type="range"
                id="percentage"
                name="percentage"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={handleInputChange}
                className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Display Order */}
            <div className="flex flex-col gap-2">
              <label htmlFor="displayOrder" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Display Sorting Order</label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex gap-3 mt-4">
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
                className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary-blue/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish Skill'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Skills List */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold font-title text-black dark:text-white">Skills Directory</h3>
            
            {/* Sort Filter Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sort By:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setSelectedIds([]); }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs cursor-pointer"
              >
                <option value="displayOrder">Display Order</option>
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alpha-asc">Alphabetical (A-Z)</option>
                <option value="alpha-desc">Alphabetical (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Controls Bar */}
          {selectedIds.length > 0 && (
            <div className="mb-6 p-4 rounded-xl border border-primary-blue/20 bg-primary-blue/5 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-primary-blue text-white px-2 py-0.5 rounded-full">{selectedIds.length}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Skills Selected</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={moveSelectedToTop}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/5 cursor-pointer flex items-center gap-1"
                >
                  <FaChevronUp size={10} /> Top
                </button>
                <button
                  onClick={moveSelectedToBottom}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/5 cursor-pointer flex items-center gap-1"
                >
                  <FaChevronDown size={10} /> Bottom
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max={skills.length}
                    placeholder="Pos"
                    value={bulkPositionInput}
                    onChange={(e) => setBulkPositionInput(e.target.value)}
                    className="w-14 px-2 py-1 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 rounded text-center text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={assignSelectedPosition}
                    className="px-3 py-1.5 rounded-lg bg-primary-blue text-white text-xs font-bold cursor-pointer"
                  >
                    Set
                  </button>
                </div>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {sortBy === 'displayOrder' && (
            <div className="mb-4 text-left p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              Drag the grip icon <FaGripVertical className="inline mx-0.5" /> or click the arrows to adjust display positioning instantly.
            </div>
          )}

          {skills.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-450 dark:text-slate-400">
              No skills published yet. Complete the form to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-250 dark:border-white/5 text-slate-500 dark:text-slate-450 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-2 w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === sortedSkills.length && sortedSkills.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                      />
                    </th>
                    {sortBy === 'displayOrder' && <th className="pb-3 pr-2 w-8">Grip</th>}
                    <th className="pb-3 pr-4 w-12 text-center">Order</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Percentage</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-white/5 text-sm">
                  {sortedSkills.map((skill, index) => {
                    const isDragged = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;
                    return (
                      <tr 
                        key={skill._id} 
                        draggable={sortBy === 'displayOrder'}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors duration-150 ${isDragged ? 'opacity-40 bg-slate-100 dark:bg-white/5' : ''} ${isDragOver ? 'border-t-2 border-primary-blue' : ''}`}
                      >
                        {/* Checkbox column */}
                        <td className="py-4 pr-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(skill._id)}
                            onChange={() => toggleSelect(skill._id)}
                            className="rounded border-slate-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                          />
                        </td>

                        {/* Grip Column */}
                        {sortBy === 'displayOrder' && (
                          <td className="py-4 pr-2 text-slate-400 cursor-grab active:cursor-grabbing hover:text-primary-blue transition-colors">
                            <FaGripVertical size={13} />
                          </td>
                        )}

                        {/* Order Column */}
                        <td className="py-4 pr-4 font-bold text-center text-slate-400">
                          {skill.displayOrder || 0}
                        </td>

                        {/* Name Column */}
                        <td className="py-4 font-bold text-black dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5">
                              {(() => {
                                const logoSrc = getSkillLogoUrl(skill);
                                return logoSrc ? (
                                  <img 
                                    src={logoSrc} 
                                    alt="" 
                                    className="w-5 h-5 object-contain select-none absolute z-10" 
                                    loading="lazy"
                                    onError={(e) => {
                                      const primaryCat = skill.primaryCategory || (skill.categories && skill.categories[0]) || skill.category || 'Frontend';
                                      const fallbackLogo = CATEGORY_LOGOS[primaryCat] || CATEGORY_LOGOS['Frontend'];
                                      if (skill.useCategoryFallback !== false && e.target.src !== fallbackLogo) {
                                        e.target.src = fallbackLogo;
                                      } else {
                                        e.target.style.display = 'none';
                                      }
                                    }}
                                  />
                                ) : null;
                              })()}
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-400 border border-purple-500/10 flex items-center justify-center font-extrabold text-[10px] select-none">
                                {skill.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="leading-tight">{skill.name}</span>
                              {skill.isActive === false && (
                                <span className="text-[8px] text-red-500 uppercase tracking-widest font-black mt-0.5">Hidden</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(() => {
                              let cats = [];
                              if (skill.categories && Array.isArray(skill.categories) && skill.categories.length > 0) {
                                cats = skill.categories;
                              } else if (skill.category) {
                                cats = [skill.category];
                              }
                              return cats.map(cat => (
                                <span key={cat} className="inline-flex px-2 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                                  {cat}
                                </span>
                              ));
                            })()}
                          </div>
                        </td>

                        {/* Percentage Column */}
                        <td className="py-4">
                          <div className="flex items-center gap-3 w-32">
                            <span className="font-extrabold text-primary-blue shrink-0 w-8">{skill.percentage}%</span>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-blue" style={{ width: `${skill.percentage}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Quick Move Buttons Group */}
                            {sortBy === 'displayOrder' && (
                              <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 border border-slate-200/55 dark:border-white/5 mr-1">
                                <button
                                  onClick={() => moveSkillToTop(index)}
                                  disabled={index === 0}
                                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move to Top"
                                >
                                  <FaChevronUp size={9} className="stroke-[1.5]" />
                                </button>
                                <button
                                  onClick={() => moveSkillUp(index)}
                                  disabled={index === 0}
                                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <FaArrowUp size={9} />
                                </button>
                                <button
                                  onClick={() => moveSkillDown(index)}
                                  disabled={index === sortedSkills.length - 1}
                                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <FaArrowDown size={9} />
                                </button>
                                <button
                                  onClick={() => moveSkillToBottom(index)}
                                  disabled={index === sortedSkills.length - 1}
                                  className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                                  title="Move to Bottom"
                                >
                                  <FaChevronDown size={9} className="stroke-[1.5]" />
                                </button>
                              </div>
                            )}

                            <button
                              onClick={() => handleEditClick(skill)}
                              className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                              title="Edit"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(skill._id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ImageCropperModal
        isOpen={cropModalOpen}
        file={cropFile}
        aspectRatio={1}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleLogoUpload}
        title="Crop Skill Badge/Logo"
      />
    </div>
  );
};

export default SkillsManager;
