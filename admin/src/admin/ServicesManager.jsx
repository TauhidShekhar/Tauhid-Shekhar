import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaLaptopCode, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes, 
  FaServer, FaReact, FaPaintBrush, FaCopy, FaSearch, FaFilter, 
  FaStar, FaFolder, FaPlus, FaExternalLinkAlt, FaExclamationTriangle,
  FaClock, FaListUl, FaQuestionCircle, FaGlobe, FaChevronDown
} from 'react-icons/fa';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Editor Modal & Tabs
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // basic, packages, deliverables, faqs, portfolio, seo
  const [isDirty, setIsDirty] = useState(false);

  // Category Manager Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Service Form State
  const initialFormState = {
    title: '',
    slug: '',
    category: 'Web Development',
    status: 'published',
    featured: false,
    price: '$99',
    pricingModel: 'starting_at',
    iconName: 'FaLaptopCode',
    displayOrder: 0,
    shortDescription: '',
    fullDescription: '',
    packages: [
      {
        name: 'Basic',
        price: '$99',
        description: 'Core starter deliverables and responsive layouts.',
        deliveryDays: 5,
        revisions: '2 Revisions',
        featuresInput: 'Responsive design\nClean semantic code\nDocumentation',
        isPopular: false
      },
      {
        name: 'Standard',
        price: '$199',
        description: 'Full feature implementation and API integrations.',
        deliveryDays: 10,
        revisions: 'Unlimited',
        featuresInput: 'Full feature scope\nDatabase integration\nAuthentication\nDeployment assist',
        isPopular: true
      },
      {
        name: 'Premium',
        price: '$349',
        description: 'Enterprise grade delivery, priority support, and high performance.',
        deliveryDays: 15,
        revisions: 'Unlimited',
        featuresInput: 'Complete architecture\nPerformance audit\nSEO & security best practices\n30-day post-launch support',
        isPopular: false
      }
    ],
    deliverables: [
      { title: 'Responsive Frontend Interface', description: 'Cross-browser pixel-perfect React/Tailwind layout.' },
      { title: 'RESTful Backend API', description: 'Secure Express endpoints and controller logic.' },
      { title: 'Database Schema & Seeds', description: 'Optimized MongoDB models and indexes.' }
    ],
    timeline: {
      estimatedDays: 7,
      revisionsIncluded: 'Unlimited',
      clientDependenciesInput: 'Wireframes / design brief\nAccess credentials / API keys\nFeedback on review milestones',
      milestones: [
        { step: 1, title: 'Requirement & Planning', duration: '1-2 Days', description: 'Specifications analysis and wireframing.' },
        { step: 2, title: 'Core Engineering', duration: '3-4 Days', description: 'Architecture, APIs, and frontend integration.' },
        { step: 3, title: 'Testing & Launch', duration: '1-2 Days', description: 'Cross-device verification and deployment.' }
      ]
    },
    faqs: [
      { question: 'What is required from my side to start?', answer: 'We will need your project requirements brief, any reference links or design files, and necessary API credentials if integrating external services.' },
      { question: 'Do you provide revisions after completion?', answer: 'Yes, all packages include dedicated revisions to ensure the deliverable completely satisfies your requirements.' }
    ],
    showPortfolioReferences: true,
    portfolioReferences: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      ogImage: '',
      canonicalUrl: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  const icons = [
    { name: 'Laptop & Code', value: 'FaLaptopCode' },
    { name: 'React & Frontend', value: 'FaReact' },
    { name: 'Server & Backend', value: 'FaServer' },
    { name: 'Paint & Design', value: 'FaPaintBrush' }
  ];

  const fetchInitialData = async () => {
    try {
      const [svcRes, catRes, projRes] = await Promise.all([
        api.getServices({ scope: 'admin' }),
        api.getServiceCategories(),
        api.getProjects()
      ]);

      if (svcRes.success) setServices(svcRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (projRes.success) setProjectsList(projRes.data || []);
    } catch (err) {
      console.error('Error fetching admin services:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Form input changes
  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'displayOrder' ? Number(value) : value)
    }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [name]: value }
    }));
  };

  // Package handlers
  const handlePackageChange = (idx, field, value) => {
    setIsDirty(true);
    setFormData(prev => {
      const updated = [...prev.packages];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, packages: updated };
    });
  };

  // Deliverables handlers
  const addDeliverable = () => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, { title: '', description: '' }]
    }));
  };

  const removeDeliverable = (idx) => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx)
    }));
  };

  const updateDeliverable = (idx, field, val) => {
    setIsDirty(true);
    setFormData(prev => {
      const updated = [...prev.deliverables];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, deliverables: updated };
    });
  };

  // FAQs handlers
  const addFaq = () => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const removeFaq = (idx) => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx)
    }));
  };

  const updateFaq = (idx, field, val) => {
    setIsDirty(true);
    setFormData(prev => {
      const updated = [...prev.faqs];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, faqs: updated };
    });
  };

  // Portfolio Reference handlers
  const addExistingProjectReference = (projectId) => {
    if (!projectId) return;
    setIsDirty(true);
    const existingProject = projectsList.find(p => p._id === projectId);
    if (!existingProject) return;

    setFormData(prev => ({
      ...prev,
      portfolioReferences: [
        ...prev.portfolioReferences,
        {
          projectId: existingProject._id,
          customTitle: existingProject.title,
          customDesc: existingProject.description || '',
          demoUrl: existingProject.demo || '',
          githubUrl: existingProject.github || '',
          imageUrl: existingProject.image || '',
          isCustom: false,
          isPublic: true
        }
      ]
    }));
  };

  const removePortfolioReference = (idx) => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      portfolioReferences: prev.portfolioReferences.filter((_, i) => i !== idx)
    }));
  };

  // Open Editor for Creating
  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentId(null);
    setActiveTab('basic');
    setIsDirty(false);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing
  const handleOpenEdit = (s) => {
    setIsEditing(true);
    setCurrentId(s._id);
    setActiveTab('basic');
    setIsDirty(false);

    // Format packages
    const pkgs = (s.packages && s.packages.length > 0)
      ? s.packages.map(p => ({
          name: p.name,
          price: p.price,
          description: p.description || '',
          deliveryDays: p.deliveryDays || 7,
          revisions: p.revisions || 'Unlimited',
          featuresInput: (p.features || []).join('\n'),
          isPopular: Boolean(p.isPopular)
        }))
      : initialFormState.packages;

    // Client dependencies
    const clientDeps = s.timeline?.clientDependencies
      ? s.timeline.clientDependencies.join('\n')
      : '';

    setFormData({
      title: s.title || '',
      slug: s.slug || '',
      category: s.category || 'Web Development',
      status: s.status || 'published',
      featured: Boolean(s.featured),
      price: s.price || '$99',
      pricingModel: s.pricingModel || 'starting_at',
      iconName: s.iconName || 'FaLaptopCode',
      displayOrder: s.displayOrder || 0,
      shortDescription: s.shortDescription || s.desc || '',
      fullDescription: s.fullDescription || '',
      packages: pkgs,
      deliverables: s.deliverables && s.deliverables.length > 0
        ? s.deliverables.map(d => ({ title: d.title, description: d.description || '' }))
        : initialFormState.deliverables,
      timeline: {
        estimatedDays: s.timeline?.estimatedDays || 7,
        revisionsIncluded: s.timeline?.revisionsIncluded || 'Unlimited',
        clientDependenciesInput: clientDeps,
        milestones: s.timeline?.milestones || initialFormState.timeline.milestones
      },
      faqs: s.faqs && s.faqs.length > 0 ? s.faqs : initialFormState.faqs,
      showPortfolioReferences: s.showPortfolioReferences !== false,
      portfolioReferences: s.portfolioReferences || [],
      seo: {
        metaTitle: s.seo?.metaTitle || '',
        metaDescription: s.seo?.metaDescription || '',
        keywords: s.seo?.keywords || '',
        ogImage: s.seo?.ogImage || '',
        canonicalUrl: s.seo?.canonicalUrl || ''
      }
    });

    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to exit without saving?')) {
      return;
    }
    setIsEditorOpen(false);
    setIsDirty(false);
  };

  // Submit Service Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Transform packages features
    const parsedPackages = formData.packages.map(p => ({
      name: p.name,
      price: p.price,
      description: p.description,
      deliveryDays: Number(p.deliveryDays) || 5,
      revisions: p.revisions,
      features: (p.featuresInput || '').split('\n').map(f => f.trim()).filter(Boolean),
      isPopular: p.isPopular
    }));

    // Transform client dependencies
    const clientDeps = (formData.timeline.clientDependenciesInput || '')
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);

    // Extract features array for backwards compatibility
    const allFeatures = parsedPackages.flatMap(p => p.features);

    const submissionData = {
      title: formData.title,
      slug: formData.slug || undefined,
      category: formData.category,
      status: formData.status,
      featured: formData.featured,
      price: formData.price,
      pricingModel: formData.pricingModel,
      iconName: formData.iconName,
      displayOrder: formData.displayOrder,
      shortDescription: formData.shortDescription,
      desc: formData.shortDescription,
      fullDescription: formData.fullDescription,
      features: allFeatures.slice(0, 8),
      packages: parsedPackages,
      deliverables: formData.deliverables.filter(d => d.title.trim()),
      timeline: {
        estimatedDays: Number(formData.timeline.estimatedDays) || 7,
        revisionsIncluded: formData.timeline.revisionsIncluded,
        clientDependencies: clientDeps,
        milestones: formData.timeline.milestones
      },
      faqs: formData.faqs.filter(f => f.question.trim()),
      showPortfolioReferences: formData.showPortfolioReferences,
      portfolioReferences: formData.portfolioReferences,
      seo: formData.seo
    };

    try {
      if (isEditing) {
        const res = await api.updateService(currentId, submissionData);
        if (res.success) {
          setIsEditorOpen(false);
          setIsDirty(false);
          fetchInitialData();
        }
      } else {
        const res = await api.createService(submissionData);
        if (res.success) {
          setIsEditorOpen(false);
          setIsDirty(false);
          fetchInitialData();
        }
      }
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Duplicate Service
  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      const res = await api.duplicateService(id);
      if (res.success) {
        fetchInitialData();
      }
    } catch (err) {
      alert(err.message || 'Duplication failed');
      setLoading(false);
    }
  };

  // Delete Service
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await api.deleteService(id);
      if (res.success) {
        fetchInitialData();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  // Category Manager Handlers
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await api.createServiceCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim()
      });
      if (res.success) {
        setNewCatName('');
        setNewCatDesc('');
        const updated = await api.getServiceCategories();
        if (updated.success) setCategories(updated.data || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await api.deleteServiceCategory(id);
      if (res.success) {
        const updated = await api.getServiceCategories();
        if (updated.success) setCategories(updated.data || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // Filter & Search services
  const filteredServices = services.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (s.title || '').toLowerCase().includes(q);
      const matchCat = (s.category || '').toLowerCase().includes(q);
      const matchDesc = (s.shortDescription || s.desc || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }
    return true;
  });

  const getIconElement = (iconName) => {
    switch (iconName) {
      case 'FaReact': return <FaReact className="text-[#00FFFF]" size={16} />;
      case 'FaServer': return <FaServer className="text-[#00FFFF]" size={16} />;
      case 'FaPaintBrush': return <FaPaintBrush className="text-[#C2272D]" size={16} />;
      default: return <FaLaptopCode className="text-[#C2272D]" size={16} />;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">
            Services & Packages Manager
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic services, multi-tier pricing, deliverables, portfolio references, and SEO.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-2"
          >
            <FaFolder className="text-[#00FFFF]" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#C2272D] hover:bg-[#a51d23] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-[#C2272D]/20 flex items-center gap-2"
          >
            <FaPlusCircle />
            <span>New Service</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services by title, category, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FaFilter size={12} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="disabled">Disabled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Services Table / Cards List */}
      <div className="space-y-4">
        {loading && services.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Loading services...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            No services match the active query. Click "New Service" to create one.
          </div>
        ) : (
          filteredServices.map((s) => (
            <div
              key={s._id}
              className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center shrink-0 mt-1">
                  {getIconElement(s.iconName)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{s.title}</h3>
                    {s.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                        <FaStar size={9} /> Featured
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      s.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                      s.status === 'draft' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {s.status || 'published'}
                    </span>
                    <span className="text-[11px] text-slate-400">/services/{s.slug}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {s.shortDescription || s.desc}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="font-bold text-[#C2272D]">{s.price}</span>
                    <span>&bull;</span>
                    <span>{s.category || 'General'}</span>
                    <span>&bull;</span>
                    <span>{s.packages?.length || 3} Packages</span>
                    <span>&bull;</span>
                    <span>Order: {s.displayOrder || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <a
                  href={`/services/${s.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
                  title="View Public Page"
                >
                  <FaExternalLinkAlt size={12} />
                </a>
                <button
                  onClick={() => handleDuplicate(s._id)}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00FFFF] transition"
                  title="Duplicate Service"
                >
                  <FaCopy size={12} />
                </button>
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-2.5 rounded-xl bg-[#C2272D]/10 hover:bg-[#C2272D]/20 text-[#C2272D] transition"
                  title="Edit Service"
                >
                  <FaEdit size={13} />
                </button>
                <button
                  onClick={() => handleDeleteClick(s._id)}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition"
                  title="Delete Service"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FaFolder className="text-[#00FFFF]" /> Service Categories
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="space-y-3 mb-6 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. AI & Automation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">Description</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short category summary"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#C2272D] text-white text-xs font-bold rounded-xl hover:bg-[#a51d23] transition"
              >
                + Add Category
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((c) => (
                <div key={c._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{c.name}</h5>
                    <p className="text-[11px] text-slate-400">{c.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c._id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Service Editor Full-Page / Drawer Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 my-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {isEditing ? `Edit Service: ${formData.title}` : 'Create New Service'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tabbed service configuration with validation and preview
                </p>
              </div>
              <button
                onClick={handleCloseEditor}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-100 dark:border-white/10 scrollbar-none">
              {[
                { id: 'basic', label: '1. Basic Info' },
                { id: 'packages', label: '2. Packages & Pricing' },
                { id: 'deliverables', label: '3. Deliverables & Timeline' },
                { id: 'faqs', label: '4. Service FAQs' },
                { id: 'portfolio', label: '5. Portfolio References' },
                { id: 'seo', label: '6. SEO Metadata' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    activeTab === t.id
                      ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Service Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleBasicChange}
                        placeholder="e.g. MERN Stack Web Development"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#C2272D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleBasicChange}
                        placeholder="auto-generated from title"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:border-[#C2272D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleBasicChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                      >
                        {categories.map(c => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Publication Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleBasicChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="disabled">Disabled</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Starting Price *
                      </label>
                      <input
                        type="text"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleBasicChange}
                        placeholder="$149"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-[#C2272D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="displayOrder"
                        value={formData.displayOrder}
                        onChange={handleBasicChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Visual Icon
                      </label>
                      <select
                        name="iconName"
                        value={formData.iconName}
                        onChange={handleBasicChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                      >
                        {icons.map(ic => (
                          <option key={ic.value} value={ic.value}>{ic.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleBasicChange}
                          className="w-4 h-4 accent-[#C2272D] rounded"
                        />
                        <span>Feature this service on homepage & badges</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Short Description (Card Summary) *
                    </label>
                    <textarea
                      name="shortDescription"
                      required
                      rows={2}
                      value={formData.shortDescription}
                      onChange={handleBasicChange}
                      placeholder="Brief 1-2 sentence overview for cards and meta descriptions..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Full Formatted Description (Detail Page Overview)
                    </label>
                    <textarea
                      name="fullDescription"
                      rows={6}
                      value={formData.fullDescription}
                      onChange={handleBasicChange}
                      placeholder="Comprehensive overview of architecture, problem-solving strategy, tech stack, and deliverable standards..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PACKAGES & PRICING */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  <div className="text-xs text-slate-400">
                    Configure the 3 customer tiers (Basic, Standard, Premium) displayed on the Service Details comparison chart.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {formData.packages.map((pkg, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-[#C2272D]">{pkg.name} Tier</h4>
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pkg.isPopular}
                              onChange={(e) => handlePackageChange(idx, 'isPopular', e.target.checked)}
                              className="accent-[#C2272D]"
                            />
                            <span>Popular</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Price</label>
                          <input
                            type="text"
                            value={pkg.price}
                            onChange={(e) => handlePackageChange(idx, 'price', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Turnaround Days</label>
                          <input
                            type="number"
                            value={pkg.deliveryDays}
                            onChange={(e) => handlePackageChange(idx, 'deliveryDays', Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Revisions</label>
                          <input
                            type="text"
                            value={pkg.revisions}
                            onChange={(e) => handlePackageChange(idx, 'revisions', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={pkg.description}
                            onChange={(e) => handlePackageChange(idx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Features (one per line)
                          </label>
                          <textarea
                            rows={4}
                            value={pkg.featuresInput}
                            onChange={(e) => handlePackageChange(idx, 'featuresInput', e.target.value)}
                            placeholder="Feature 1&#10;Feature 2"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DELIVERABLES & TIMELINE */}
              {activeTab === 'deliverables' && (
                <div className="space-y-6">
                  {/* Deliverables Checklist */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        What's Included Deliverables Checklist
                      </h4>
                      <button
                        type="button"
                        onClick={addDeliverable}
                        className="px-3 py-1.5 bg-[#C2272D]/10 hover:bg-[#C2272D]/20 text-[#C2272D] rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <FaPlus size={10} /> Add Deliverable
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.deliverables.map((del, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <input
                            type="text"
                            placeholder="Deliverable Title (e.g. Responsive React UI)"
                            value={del.title}
                            onChange={(e) => updateDeliverable(idx, 'title', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Deliverable description or specification"
                            value={del.description}
                            onChange={(e) => updateDeliverable(idx, 'description', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeDeliverable(idx)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Client Dependencies */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Client Dependencies / Required Inputs (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.timeline.clientDependenciesInput}
                      onChange={(e) => {
                        setIsDirty(true);
                        setFormData(prev => ({
                          ...prev,
                          timeline: { ...prev.timeline, clientDependenciesInput: e.target.value }
                        }));
                      }}
                      placeholder="Wireframes or design assets&#10;API credentials&#10;Feedback at milestones"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: FAQS */}
              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Service-Specific FAQs Accordion
                    </h4>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="px-3 py-1.5 bg-[#C2272D]/10 hover:bg-[#C2272D]/20 text-[#C2272D] rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <FaPlus size={10} /> Add Question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400">FAQ #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold"
                        />
                        <textarea
                          rows={2}
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PORTFOLIO REFERENCES */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Show Portfolio References</h4>
                      <p className="text-[11px] text-slate-400">Display linked projects and case studies on this service's details page.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showPortfolioReferences}
                        onChange={(e) => {
                          setIsDirty(true);
                          setFormData(prev => ({ ...prev, showPortfolioReferences: e.target.checked }));
                        }}
                        className="w-4 h-4 accent-[#C2272D]"
                      />
                    </label>
                  </div>

                  {/* Add Existing Project from DB */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Link Existing Project from Portfolio Database
                    </label>
                    <select
                      onChange={(e) => {
                        addExistingProjectReference(e.target.value);
                        e.target.value = '';
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                    >
                      <option value="">-- Choose a project to link as reference --</option>
                      {projectsList.map(p => (
                        <option key={p._id} value={p._id}>{p.title} ({p.tag})</option>
                      ))}
                    </select>
                  </div>

                  {/* Linked References List */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                      Currently Linked References ({formData.portfolioReferences.length})
                    </h5>

                    {formData.portfolioReferences.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                        No projects linked yet. Select from the dropdown above to showcase relevant work.
                      </div>
                    ) : (
                      formData.portfolioReferences.map((ref, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <div>
                            <h6 className="font-bold text-xs text-slate-900 dark:text-white">{ref.customTitle || 'Linked Project'}</h6>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{ref.customDesc || ref.demoUrl || 'No description'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePortfolioReference(idx)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Remove reference (will NOT delete project from portfolio)"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400 mb-2">
                    Search engine optimization parameters for indexation and OpenGraph previews.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.seo.metaTitle}
                      onChange={handleSeoChange}
                      placeholder="e.g. MERN Stack Web Development Services | Tauhid Shekhar"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      name="metaDescription"
                      value={formData.seo.metaDescription}
                      onChange={handleSeoChange}
                      placeholder="High-converting search snippet summary..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.seo.keywords}
                      onChange={handleSeoChange}
                      placeholder="mern stack, react developer, node.js api, web development services"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditor}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-2.5 bg-[#C2272D] hover:bg-[#a51d23] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-[#C2272D]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <FaCheck />
                  <span>{isEditing ? 'Save Changes' : 'Publish Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
