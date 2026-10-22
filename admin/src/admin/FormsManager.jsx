import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../services/api';
import {
  FaWpforms,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCopy,
  FaQrcode,
  FaShareAlt,
  FaEye,
  FaFileCsv,
  FaCheck,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaClone,
  FaArchive,
  FaGlobe,
  FaEnvelope,
  FaPalette,
  FaCog,
  FaList,
  FaSearch,
  FaFilter,
  FaDownload,
  FaPaperclip,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaStickyNote,
  FaExternalLinkAlt,
  FaLayerGroup,
  FaArrowLeft,
  FaUndo,
  FaTags
} from 'react-icons/fa';

const FIELD_TYPES = [
  { type: 'fullName', label: 'Full Name', category: 'Contact', icon: '👤' },
  { type: 'firstLastName', label: 'First & Last Name', category: 'Contact', icon: '👥' },
  { type: 'email', label: 'Email Address', category: 'Contact', icon: '✉️' },
  { type: 'phone', label: 'Mobile / Phone Number', category: 'Contact', icon: '📱' },
  { type: 'text', label: 'Short Text Input', category: 'General', icon: '✏️' },
  { type: 'textarea', label: 'Long Text / Paragraph', category: 'General', icon: '📝' },
  { type: 'number', label: 'Number', category: 'General', icon: '🔢' },
  { type: 'date', label: 'Date Picker', category: 'General', icon: '📅' },
  { type: 'select', label: 'Dropdown / Select', category: 'Choices', icon: '▾' },
  { type: 'radio', label: 'Radio Buttons (Single Choice)', category: 'Choices', icon: '🔘' },
  { type: 'checkbox', label: 'Checkboxes (Multiple Choice)', category: 'Choices', icon: '☑️' },
  { type: 'yesNo', label: 'Yes / No Choice', category: 'Choices', icon: '⚖️' },
  { type: 'file', label: 'General File Upload', category: 'Files', icon: '📁' },
  { type: 'resume', label: 'Resume / CV PDF Upload', category: 'Files', icon: '📄' },
  { type: 'multipleFile', label: 'Multiple Files Upload', category: 'Files', icon: '📚' },
  { type: 'url', label: 'Website / Portfolio URL', category: 'General', icon: '🔗' },
  { type: 'address', label: 'Full Address', category: 'Contact', icon: '📍' },
  { type: 'heading', label: 'Section Header & Description', category: 'Layout', icon: '📌' },
  { type: 'consent', label: 'Consent / Terms Checkbox', category: 'Legal', icon: '🛡️' }
];

const PLACEMENT_OPTIONS = [
  { id: 'directory', label: 'Public Forms Directory (/forms)', desc: 'List in the website forms catalog' },
  { id: 'contact', label: 'Contact Page (/contact)', desc: 'Surface as inquiry option on Contact page' },
  { id: 'careers', label: 'Careers & Jobs Hub', desc: 'Display on Careers and hiring sections' },
  { id: 'internship', label: 'Internships Hub', desc: 'Display for students and interns' },
  { id: 'community', label: 'Community Platform', desc: 'Available for members in community hub' },
  { id: 'standalone', label: 'Standalone Direct Link Only', desc: 'Accessible via shareable link & QR code' }
];

export default function FormsManager() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'forms';
  const [activeTab, setActiveTab] = useState(initialTab); // 'forms' | 'builder' | 'submissions' | 'templates' | 'categories'

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['forms', 'builder', 'submissions', 'templates', 'categories'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryModal, setCategoryModal] = useState({
    open: false,
    isEditing: false,
    id: null,
    name: '',
    slug: '',
    description: '',
    icon: 'folder',
    color: '#C2272D',
    isActive: true
  });
  const [deleteCatModal, setDeleteCatModal] = useState({
    open: false,
    category: null,
    reassignTo: ''
  });

  // Builder Unsaved Changes / Cancel handling
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const initialFormConfigRef = useRef(null);

  // Builder state
  const [editingFormId, setEditingFormId] = useState(null);
  const [formConfig, setFormConfig] = useState({
    title: '',
    slug: '',
    category: 'General',
    categoryId: null,
    description: '',
    status: 'Draft',
    isSubmissionsEnabled: true,
    closingDate: '',
    fields: [],
    confirmationMessage: 'Thank you! Your submission has been received successfully.',
    redirectUrl: '',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: false,
      userEmailFieldKey: 'email',
      customSubject: '',
      customMessage: ''
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Submit Form',
      accentColor: '#C2272D',
      coverImage: ''
    },
    placements: ['directory', 'standalone']
  });

  // Selected field for editing in builder
  const [selectedFieldIdx, setSelectedFieldIdx] = useState(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Submissions state
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsFilter, setSubmissionsFilter] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [submissionsPagination, setSubmissionsPagination] = useState({ total: 0, totalPages: 1 });
  const [activeSubmissionDetail, setActiveSubmissionDetail] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Share & QR Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFormForShare, setSelectedFormForShare] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Forms filtering & view mode
  const [formsViewFilter, setFormsViewFilter] = useState('all'); // 'all' | 'applications' | 'inquiries' | 'drafts' | 'archived'
  const [formsSearch, setFormsSearch] = useState('');
  const [formsViewMode, setFormsViewMode] = useState('table'); // 'table' | 'cards'

  // Confirm delete modal
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    type: 'form', // 'form' | 'submission'
    id: null,
    title: '',
    submissionCount: 0
  });

  // Show Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const getPublicDomain = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5173';
    }
    return 'https://tauhidshekhar.com';
  };

  // Load forms on mount
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminForms();
      if (res.success) {
        setForms(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load forms.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load submissions whenever filter or form selection changes
  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, selectedFormForSubmissions, submissionsFilter]);

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const params = {
        formId: selectedFormForSubmissions,
        status: submissionsFilter.status,
        search: submissionsFilter.search,
        startDate: submissionsFilter.startDate,
        endDate: submissionsFilter.endDate,
        page: submissionsFilter.page,
        limit: submissionsFilter.limit
      };
      const res = await api.getFormSubmissions(params);
      if (res.success) {
        setSubmissions(res.data);
        if (res.pagination) {
          setSubmissionsPagination(res.pagination);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load submissions.', 'error');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Load categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.getFormCategories();
      if (res?.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Category Actions
  const handleOpenCreateCategory = () => {
    setCategoryModal({
      open: true,
      isEditing: false,
      id: null,
      name: '',
      slug: '',
      description: '',
      icon: 'folder',
      color: '#C2272D',
      isActive: true
    });
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryModal({
      open: true,
      isEditing: true,
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'folder',
      color: cat.color || '#C2272D',
      isActive: cat.isActive !== false
    });
  };

  const handleSaveCategory = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!categoryModal.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }
    const cleanSlug = (categoryModal.slug || categoryModal.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setActionLoading(true);
    try {
      if (categoryModal.isEditing) {
        const res = await api.updateFormCategory(categoryModal.id, {
          name: categoryModal.name.trim(),
          slug: cleanSlug,
          description: categoryModal.description.trim(),
          icon: categoryModal.icon,
          color: categoryModal.color,
          isActive: categoryModal.isActive
        });
        if (res?.success) {
          showToast('Category updated successfully!');
          setCategoryModal({ open: false, isEditing: false, id: null, name: '', slug: '', description: '', icon: 'folder', color: '#C2272D', isActive: true });
          await fetchCategories();
          await fetchForms();
        } else {
          showToast(res?.message || 'Failed to update category.', 'error');
        }
      } else {
        const res = await api.createFormCategory({
          name: categoryModal.name.trim(),
          slug: cleanSlug,
          description: categoryModal.description.trim(),
          icon: categoryModal.icon,
          color: categoryModal.color,
          isActive: categoryModal.isActive
        });
        if (res?.success) {
          showToast('Category created successfully!');
          setCategoryModal({ open: false, isEditing: false, id: null, name: '', slug: '', description: '', icon: 'folder', color: '#C2272D', isActive: true });
          await fetchCategories();
        } else {
          showToast(res?.message || 'Failed to create category.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Error saving category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      const res = await api.toggleFormCategoryActive(cat._id);
      if (res?.success) {
        showToast(`Category "${cat.name}" is now ${res.data.isActive ? 'Active' : 'Inactive'}.`);
        await fetchCategories();
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle category.', 'error');
    }
  };

  const handleDeleteCategoryPrompt = (cat) => {
    const otherCats = categories.filter(c => c._id !== cat._id);
    setDeleteCatModal({
      open: true,
      category: cat,
      reassignTo: otherCats.length > 0 ? otherCats[0]._id : ''
    });
  };

  const handleExecuteDeleteCategory = async () => {
    if (!deleteCatModal.category) return;
    setActionLoading(true);
    try {
      const res = await api.deleteFormCategory(deleteCatModal.category._id, deleteCatModal.reassignTo);
      if (res?.success) {
        showToast(res.message || 'Category deleted safely.');
        setDeleteCatModal({ open: false, category: null, reassignTo: '' });
        await fetchCategories();
        await fetchForms();
      } else {
        showToast(res?.message || 'Failed to delete category.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Switch to new Form Builder
  const handleCreateNewForm = () => {
    setEditingFormId(null);
    const newConfig = {
      title: '',
      slug: '',
      category: categories.length > 0 ? categories[0].name : 'General',
      categoryId: categories.length > 0 ? categories[0]._id : null,
      description: '',
      status: 'Draft',
      isSubmissionsEnabled: true,
      closingDate: '',
      fields: [
        {
          id: `field_${Date.now()}_1`,
          key: 'fullName',
          label: 'Full Name',
          type: 'fullName',
          placeholder: 'Enter your name',
          required: true,
          order: 1
        },
        {
          id: `field_${Date.now()}_2`,
          key: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'you@example.com',
          required: true,
          order: 2
        },
        {
          id: `field_${Date.now()}_3`,
          key: 'message',
          label: 'Message',
          type: 'textarea',
          placeholder: 'How can we help you?',
          required: false,
          order: 3
        }
      ],
      confirmationMessage: 'Thank you! Your submission has been received successfully.',
      redirectUrl: '',
      emailNotifications: {
        notifyAdmin: true,
        adminEmails: ['shekhartauhid@gmail.com'],
        notifyUser: false,
        userEmailFieldKey: 'email',
        customSubject: '',
        customMessage: ''
      },
      appearance: {
        theme: 'brand',
        submitButtonText: 'Submit',
        accentColor: '#C2272D',
        coverImage: ''
      },
      placements: ['directory', 'standalone']
    };
    setFormConfig(newConfig);
    initialFormConfigRef.current = JSON.parse(JSON.stringify(newConfig));
    setSelectedFieldIdx(null);
    setPreviewMode(false);
    setActiveTab('builder');
  };

  // Edit existing form
  const handleEditForm = async (form) => {
    setEditingFormId(form._id);
    const editConfig = {
      ...form,
      category: form.category || 'General',
      categoryId: form.categoryId || null,
      closingDate: form.closingDate ? new Date(form.closingDate).toISOString().split('T')[0] : ''
    };
    setFormConfig(editConfig);
    initialFormConfigRef.current = JSON.parse(JSON.stringify(editConfig));
    setSelectedFieldIdx(null);
    setPreviewMode(false);
    setActiveTab('builder');
  };

  // Unsaved changes & Cancel in builder
  const isFormDirty = () => {
    if (!initialFormConfigRef.current) return false;
    return JSON.stringify(formConfig) !== JSON.stringify(initialFormConfigRef.current);
  };

  const handleCancelBuilder = () => {
    if (!isFormDirty()) {
      setEditingFormId(null);
      setActiveTab('forms');
    } else {
      setShowDiscardModal(true);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    if (editingFormId && initialFormConfigRef.current) {
      setFormConfig(initialFormConfigRef.current);
    }
    setEditingFormId(null);
    setActiveTab('forms');
  };

  // Duplicate form
  const handleDuplicate = async (formId) => {
    setActionLoading(true);
    try {
      const res = await api.duplicateForm(formId);
      if (res.success) {
        showToast('Form duplicated successfully!');
        await fetchForms();
      }
    } catch (err) {
      showToast(err.message || 'Failed to duplicate form.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Archive form
  const handleArchive = async (formId) => {
    setActionLoading(true);
    try {
      const res = await api.archiveForm(formId);
      if (res.success) {
        showToast('Form archived successfully.');
        await fetchForms();
      }
    } catch (err) {
      showToast(err.message || 'Failed to archive form.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Request Delete Form
  const handleDeleteFormPrompt = (form) => {
    setDeleteConfirmModal({
      open: true,
      type: 'form',
      id: form._id,
      title: form.title,
      submissionCount: form.submissionCount || 0
    });
  };

  // Execute Delete
  const handleExecuteDelete = async () => {
    if (!deleteConfirmModal.id) return;
    setActionLoading(true);
    try {
      if (deleteConfirmModal.type === 'form') {
        const res = await api.deleteForm(deleteConfirmModal.id, true);
        if (res.success) {
          showToast('Form and all associated data deleted.');
          await fetchForms();
        }
      } else if (deleteConfirmModal.type === 'submission') {
        const res = await api.deleteSubmission(deleteConfirmModal.id);
        if (res.success) {
          showToast('Submission deleted permanently.');
          setActiveSubmissionDetail(null);
          await fetchSubmissions();
          await fetchForms();
        }
      }
    } catch (err) {
      showToast(err.message || 'Delete operation failed.', 'error');
    } finally {
      setActionLoading(false);
      setDeleteConfirmModal({ open: false, type: 'form', id: null, title: '', submissionCount: 0 });
    }
  };

  // Quick Toggle ON / OFF (isSubmissionsEnabled)
  const handleToggleSubmissions = async (form) => {
    const nextState = !form.isSubmissionsEnabled;
    try {
      const res = await api.updateForm(form._id, { isSubmissionsEnabled: nextState });
      if (res?.success) {
        setForms((prev) => prev.map((f) => (f._id === form._id ? { ...f, isSubmissionsEnabled: nextState } : f)));
        showToast(`"${form.title}" is now turned ${nextState ? 'ON (Accepting Submissions)' : 'OFF (Submissions Closed)'}.`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update submission status.', 'error');
    }
  };

  // Quick Toggle Publish / Draft
  const handleTogglePublish = async (form) => {
    const nextStatus = form.status === 'Published' ? 'Draft' : 'Published';
    try {
      const res = await api.updateForm(form._id, { status: nextStatus });
      if (res?.success) {
        setForms((prev) => prev.map((f) => (f._id === form._id ? { ...f, status: nextStatus } : f)));
        showToast(`"${form.title}" status changed to ${nextStatus}.`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update publication status.', 'error');
    }
  };

  // View Submissions for a specific form
  const handleViewFormSubmissions = (form) => {
    setSelectedFormForSubmissions(form._id);
    setActiveTab('submissions');
  };

  // Open Share & QR Code Modal
  const handleOpenShareModal = async (form) => {
    setSelectedFormForShare(form);
    setCopiedLink(false);
    setShareModalOpen(true);
    const publicUrl = `${getPublicDomain()}/forms/${form.slug}`;
    try {
      const qrData = await QRCode.toDataURL(publicUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeDataUrl(qrData);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  // Download QR Code
  const handleDownloadQr = (format = 'png') => {
    if (!selectedFormForShare) return;
    const publicUrl = `${getPublicDomain()}/forms/${selectedFormForShare.slug}`;
    if (format === 'png' && qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `${selectedFormForShare.slug}-qr.png`;
      link.href = qrCodeDataUrl;
      link.click();
    } else {
      window.open(`/api/forms/${selectedFormForShare.slug}/qr?format=${format}&download=true`, '_blank');
    }
  };

  // Native share or copy link
  const handleNativeShare = async () => {
    if (!selectedFormForShare) return;
    const publicUrl = `${getPublicDomain()}/forms/${selectedFormForShare.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedFormForShare.title,
          text: selectedFormForShare.description || `Submit: ${selectedFormForShare.title}`,
          url: publicUrl
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Save Form (Draft or Publish)
  const handleSaveForm = async (targetStatus) => {
    if (actionLoading) return; // Prevent duplicate clicks
    if (!formConfig.title.trim()) {
      showToast('Please provide a form title.', 'error');
      return;
    }
    if (formConfig.fields.length === 0) {
      showToast('Please add at least one field to your form.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        ...formConfig,
        status: targetStatus || formConfig.status,
        closingDate: formConfig.closingDate ? new Date(formConfig.closingDate) : null
      };

      if (editingFormId) {
        const res = await api.updateForm(editingFormId, payload);
        if (res.success) {
          showToast(`Form updated and ${targetStatus === 'Published' ? 'published' : 'saved'} successfully!`);
          initialFormConfigRef.current = JSON.parse(JSON.stringify(payload));
          await fetchForms();
          setEditingFormId(null);
          setActiveTab('forms');
        } else {
          showToast(res.message || 'Failed to update form.', 'error');
        }
      } else {
        const res = await api.createForm(payload);
        if (res.success) {
          showToast(`Form created and ${targetStatus === 'Published' ? 'published' : 'saved as draft'}!`);
          initialFormConfigRef.current = JSON.parse(JSON.stringify(payload));
          await fetchForms();
          setEditingFormId(null);
          setActiveTab('forms');
        } else {
          showToast(res.message || 'Failed to create form.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save form configuration.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Add field to form
  const handleAddField = (typeObj) => {
    const fieldCount = formConfig.fields.length + 1;
    const cleanKey = `${typeObj.type}_${Date.now().toString(36).substring(4)}`;
    const newField = {
      id: `field_${Date.now()}`,
      key: cleanKey,
      label: typeObj.label,
      type: typeObj.type,
      placeholder: '',
      helpText: '',
      defaultValue: '',
      options: ['select', 'radio', 'checkbox'].includes(typeObj.type)
        ? ['Option 1', 'Option 2', 'Option 3']
        : [],
      required: false,
      validation: {
        minLength: null,
        maxLength: null,
        min: null,
        max: null,
        allowedExtensions: typeObj.type === 'resume' ? ['.pdf'] : [],
        maxFileSizeMB: 10,
        customErrorMessage: ''
      },
      order: fieldCount,
      hidden: false
    };

    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedFieldIdx(formConfig.fields.length);
    setFieldModalOpen(true);
  };

  // Move field order up / down
  const handleMoveField = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= formConfig.fields.length) return;

    const updated = [...formConfig.fields];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((f, i) => {
      f.order = i + 1;
    });

    setFormConfig((prev) => ({ ...prev, fields: updated }));
    if (selectedFieldIdx === index) {
      setSelectedFieldIdx(targetIdx);
    }
  };

  // Delete field from form
  const handleDeleteField = (index) => {
    const updated = formConfig.fields.filter((_, i) => i !== index);
    updated.forEach((f, i) => {
      f.order = i + 1;
    });
    setFormConfig((prev) => ({ ...prev, fields: updated }));
    if (selectedFieldIdx === index) {
      setSelectedFieldIdx(null);
      setFieldModalOpen(false);
    }
  };

  // Update selected field property
  const handleUpdateSelectedField = (prop, value) => {
    if (selectedFieldIdx === null || !formConfig.fields[selectedFieldIdx]) return;
    const updated = [...formConfig.fields];
    if (prop.includes('.')) {
      const [parent, child] = prop.split('.');
      updated[selectedFieldIdx][parent] = {
        ...updated[selectedFieldIdx][parent],
        [child]: value
      };
    } else {
      updated[selectedFieldIdx][prop] = value;
    }
    setFormConfig((prev) => ({ ...prev, fields: updated }));
  };

  // Export submissions to CSV
  const handleExportCsv = () => {
    if (selectedFormForSubmissions === 'all') {
      showToast('Please select a specific form from the dropdown to export CSV.', 'error');
      return;
    }
    const q = new URLSearchParams({
      formId: selectedFormForSubmissions,
      status: submissionsFilter.status,
      startDate: submissionsFilter.startDate,
      endDate: submissionsFilter.endDate
    }).toString();

    window.open(`/api/forms/admin/submissions/export?${q}`, '_blank');
  };

  // Update submission status
  const handleUpdateStatus = async (subId, newStatus) => {
    try {
      const res = await api.updateSubmissionStatus(subId, newStatus);
      if (res.success) {
        showToast(`Status updated to "${newStatus}".`);
        setSubmissions((prev) => prev.map((s) => (s._id === subId ? { ...s, status: newStatus } : s)));
        if (activeSubmissionDetail && activeSubmissionDetail._id === subId) {
          setActiveSubmissionDetail((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  // Add private note
  const handleAddAdminNote = async () => {
    if (!adminNoteInput.trim() || !activeSubmissionDetail) return;
    try {
      const res = await api.addSubmissionNote(activeSubmissionDetail._id, adminNoteInput.trim());
      if (res.success) {
        showToast('Admin note saved.');
        setActiveSubmissionDetail(res.data);
        setSubmissions((prev) => prev.map((s) => (s._id === res.data._id ? res.data : s)));
        setAdminNoteInput('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add note.', 'error');
    }
  };

  // Use Template
  const handleUseTemplate = (template) => {
    setEditingFormId(null);
    const uniqueSlug = `${template.slug}-${Math.random().toString(36).substring(2, 6)}`;
    setFormConfig({
      ...template,
      slug: uniqueSlug,
      title: `${template.title}`,
      status: 'Draft',
      isTemplate: false,
      submissionCount: 0
    });
    setActiveTab('builder');
    showToast(`Loaded "${template.title}" template into builder!`);
  };

  // Calculations for stats cards
  const statsOverview = useMemo(() => {
    const totalForms = forms.length;
    const publishedForms = forms.filter((f) => f.status === 'Published').length;
    const totalSubmissions = forms.reduce((acc, f) => acc + (f.submissionCount || 0), 0);
    const totalNew = forms.reduce((acc, f) => acc + (f.newSubmissionsCount || 0), 0);
    return { totalForms, publishedForms, totalSubmissions, totalNew };
  }, [forms]);

  // Filtered forms according to tab views & search query
  const filteredAdminForms = useMemo(() => {
    return forms.filter((f) => {
      const q = formsSearch.toLowerCase().trim();
      const formCat = (f.category || f.templateCategory || 'General').toLowerCase();
      const matchesSearch =
        !q ||
        f.title?.toLowerCase().includes(q) ||
        f.slug?.toLowerCase().includes(q) ||
        formCat.includes(q);

      if (!matchesSearch) return false;

      if (formsViewFilter === 'all') return true;
      if (formsViewFilter === 'drafts') return f.status === 'Draft';
      if (formsViewFilter === 'archived') return f.status === 'Archived';
      if (formsViewFilter.startsWith('cat_')) {
        const targetSlug = formsViewFilter.replace('cat_', '').toLowerCase();
        const matchedCategory = categories.find(c => c.slug.toLowerCase() === targetSlug);
        const targetName = matchedCategory ? matchedCategory.name.toLowerCase() : targetSlug;
        return formCat === targetName || formCat === targetSlug;
      }
      return formCat === formsViewFilter.toLowerCase();
    });
  }, [forms, formsSearch, formsViewFilter, categories]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-2xl transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white shadow-rose-900/40'
              : 'bg-emerald-600 text-white shadow-emerald-900/40'
          }`}
        >
          {toast.type === 'error' ? <FaExclamationTriangle size={16} /> : <FaCheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-black to-slate-950 p-6 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/20 text-[#00FFFF] text-xs font-bold tracking-wider uppercase mb-2 border border-[#C2272D]/40">
              <FaWpforms size={12} />
              <span>Tauhid Shekhar Enterprise</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-['Manrope']">
              Forms Management & Builder
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-['Inter']">
              Create unlimited dynamic forms, collect submissions and resume PDFs, generate branded QR codes, configure email notifications, and manage candidates in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('templates')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <FaClone size={12} className="text-[#00FFFF]" />
              <span>Templates</span>
            </button>
            <button
              onClick={handleCreateNewForm}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white transition-all flex items-center gap-2 shadow-lg shadow-[#C2272D]/30 cursor-pointer"
            >
              <FaPlus size={12} />
              <span>Create Form</span>
            </button>
          </div>
        </div>

        {/* Brand Accent Highlights */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C2272D]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#00FFFF]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Forms</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{statsOverview.totalForms}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <FaWpforms size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live / Published</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {statsOverview.publishedForms}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <FaGlobe size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submissions</div>
            <div className="text-2xl font-extrabold text-[#C2272D] mt-1">{statsOverview.totalSubmissions}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-[#C2272D] flex items-center justify-center">
            <FaList size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New & Unreviewed</div>
            <div className="text-2xl font-extrabold text-cyan-500 mt-1">{statsOverview.totalNew}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center">
            <FaPaperclip size={18} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaWpforms size={13} />
          <span>All Forms ({forms.length})</span>
        </button>

        <button
          onClick={() => {
            if (!editingFormId && formConfig.title === '') {
              handleCreateNewForm();
            } else {
              setActiveTab('builder');
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'builder'
              ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaEdit size={13} />
          <span>{editingFormId ? 'Form Builder (Editing)' : 'Form Builder'}</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaList size={13} />
          <span>Submissions Management</span>
          {statsOverview.totalNew > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00FFFF] text-slate-900 leading-none">
              {statsOverview.totalNew}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaClone size={13} />
          <span>Prebuilt Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FaLayerGroup size={13} />
          <span>Form Categories ({categories.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ALL FORMS DIRECTORY LIST */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          {/* Sub-Filters Bar: All Forms | Applications | Inquiries | Drafts | Archived */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Forms', count: forms.length },
                ...categories.map(cat => ({
                  id: `cat_${cat.slug}`,
                  label: cat.name,
                  count: forms.filter(f => (f.category || f.templateCategory || '').toLowerCase() === cat.name.toLowerCase()).length
                })),
                { id: 'drafts', label: 'Drafts', count: forms.filter((f) => f.status === 'Draft').length },
                { id: 'archived', label: 'Archived', count: forms.filter((f) => f.status === 'Archived').length }
              ].map((subFilter) => (
                <button
                  key={subFilter.id}
                  type="button"
                  onClick={() => setFormsViewFilter(subFilter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    formsViewFilter === subFilter.id
                      ? 'bg-[#C2272D] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{subFilter.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 dark:bg-white/10 font-mono">
                    {subFilter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Controls: Search & Table / Card View Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <FaSearch size={11} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formsSearch}
                  onChange={(e) => setFormsSearch(e.target.value)}
                  placeholder="Search forms..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFormsViewMode('table')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formsViewMode === 'table' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setFormsViewMode('cards')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formsViewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Cards View"
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C2272D] border-t-transparent rounded-full animate-spin" />
              <span>Loading forms...</span>
            </div>
          ) : filteredAdminForms.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 p-8">
              <FaWpforms size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No forms found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                No forms match the selected filter. Try switching tabs or creating a new form.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleCreateNewForm}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2272D] text-white shadow-md cursor-pointer"
                >
                  Create Custom Form
                </button>
                <button
                  onClick={() => { setFormsViewFilter('all'); setFormsSearch(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : formsViewMode === 'table' ? (
            /* ──────────────── Admin Forms Table ──────────────── */
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3.5 px-4">Form Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Status (ON/OFF)</th>
                    <th className="py-3.5 px-4 text-center">Submissions</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredAdminForms.map((form) => {
                    const publicUrl = `${getPublicDomain()}/forms/${form.slug}`;
                    const isOn = form.isSubmissionsEnabled !== false && form.status === 'Published';
                    const isDraft = form.status === 'Draft';
                    const isArchived = form.status === 'Archived';

                    return (
                      <tr key={form._id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors">
                        {/* Form Name & Slug */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-['Manrope'] line-clamp-1">
                            {form.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                            <span className="truncate max-w-[200px]">/forms/{form.slug}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(publicUrl);
                                showToast('Link copied!');
                              }}
                              className="hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors p-0.5"
                              title="Copy URL"
                            >
                              <FaCopy size={10} />
                            </button>
                            <span>•</span>
                            <span className="text-slate-500">{form.fields?.length || 0} fields</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {form.templateCategory || 'General'}
                          </span>
                        </td>

                        {/* Status (ON / OFF Toggle & Badge) */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSubmissions(form)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black cursor-pointer transition-all shadow-xs ${
                                isOn
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                              }`}
                              title={isOn ? 'Click to Turn OFF (Close Submissions)' : 'Click to Turn ON (Accept Submissions)'}
                            >
                              <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
                              <span>{isOn ? 'ON' : 'OFF'}</span>
                            </button>

                            <span className="text-[10px] font-semibold text-slate-400">
                              {isDraft ? 'Draft' : isArchived ? 'Archived' : form.status}
                            </span>
                          </div>
                        </td>

                        {/* Submissions */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleViewFormSubmissions(form)}
                            className="inline-flex flex-col items-center group cursor-pointer hover:opacity-80"
                            title="View submissions for this form"
                          >
                            <span className="text-sm font-extrabold text-[#C2272D] group-hover:underline">
                              {form.submissionCount || 0}
                            </span>
                            {form.newSubmissionsCount > 0 ? (
                              <span className="text-[10px] font-bold text-cyan-500">
                                {form.newSubmissionsCount} new
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">View</span>
                            )}
                          </button>
                        </td>

                        {/* Last Updated */}
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(form.updatedAt || form.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditForm(form)}
                              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit in Builder"
                            >
                              <FaEdit size={12} />
                            </button>

                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Preview Public Form"
                            >
                              <FaEye size={12} />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleViewFormSubmissions(form)}
                              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View Submissions"
                            >
                              <FaList size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenShareModal(form)}
                              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Share & QR Code"
                            >
                              <FaShareAlt size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(form._id)}
                              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Duplicate Form"
                            >
                              <FaClone size={12} />
                            </button>

                            {form.status !== 'Archived' ? (
                              <button
                                type="button"
                                onClick={() => handleArchive(form._id)}
                                className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Archive Form"
                              >
                                <FaArchive size={12} />
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleDeleteFormPrompt(form)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Form"
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
          ) : (
            /* ──────────────── Cards View ──────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAdminForms.map((form) => {
                const publicUrl = `${getPublicDomain()}/forms/${form.slug}`;
                const isOn = form.isSubmissionsEnabled !== false && form.status === 'Published';

                return (
                  <div
                    key={form._id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top status & category */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => handleToggleSubmissions(form)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer flex items-center gap-1.5 ${
                            isOn
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isOn ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
                          <span>{isOn ? 'ON (Active)' : 'OFF (Closed)'}</span>
                        </button>

                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <span>{form.fields?.length || 0} fields</span>
                          <span>•</span>
                          <span className="text-[#C2272D]">{form.submissionCount || 0} entries</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 font-['Manrope']">
                        {form.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                        {form.description || 'No description provided.'}
                      </p>

                      {/* URL slug badge */}
                      <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        <span className="truncate">/forms/{form.slug}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(publicUrl);
                            showToast('Public link copied to clipboard!');
                          }}
                          title="Copy Link"
                          className="text-slate-400 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors p-1"
                        >
                          <FaCopy size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditForm(form)}
                          className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit in Builder"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          onClick={() => handleViewFormSubmissions(form)}
                          className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                          title="View Submissions"
                        >
                          <FaList size={13} />
                          {form.newSubmissionsCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00FFFF]" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenShareModal(form)}
                          className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Share & QR Code"
                        >
                          <FaQrcode size={13} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(form._id)}
                          className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Duplicate Form"
                        >
                          <FaClone size={13} />
                        </button>
                        {form.status !== 'Archived' ? (
                          <button
                            onClick={() => handleArchive(form._id)}
                            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Archive Form"
                          >
                            <FaArchive size={13} />
                          </button>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          <FaExternalLinkAlt size={10} />
                          <span>View</span>
                        </a>
                        <button
                          onClick={() => handleDeleteFormPrompt(form)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Form"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: FORM BUILDER CANVAS & CONFIGURATION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Builder Top Bar Actions */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
              <select
                value={formConfig.status}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, status: e.target.value }))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published (Live)</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 ml-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formConfig.isSubmissionsEnabled}
                  onChange={(e) => setFormConfig((prev) => ({ ...prev, isSubmissionsEnabled: e.target.checked }))}
                  className="rounded text-[#C2272D] focus:ring-0"
                />
                <span>Accept Submissions</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelBuilder}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Cancel changes and return to forms list"
              >
                <FaArrowLeft size={10} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  previewMode
                    ? 'bg-cyan-500 text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FaEye size={12} />
                <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveForm('Draft')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveForm('Published')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white shadow-md shadow-[#C2272D]/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <FaGlobe size={11} />
                <span>{actionLoading ? 'Saving...' : (editingFormId ? 'Update Form' : 'Publish Form')}</span>
              </button>
            </div>
          </div>

          {previewMode ? (
            /* Live Form Preview Component */
            <div className="p-8 max-w-2xl mx-auto rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-6">
              <div className="text-center space-y-2 border-b border-slate-800 pb-5">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#C2272D]/20 text-[#00FFFF] border border-[#C2272D]/40">
                  Preview Mode
                </span>
                <h2 className="text-2xl font-extrabold text-white font-['Manrope']">{formConfig.title || 'Untitled Form'}</h2>
                <p className="text-xs text-slate-400 font-['Inter']">{formConfig.description || 'Form description preview'}</p>
              </div>

              <div className="space-y-4">
                {formConfig.fields.map((f, i) => (
                  <div key={f.id || i} className="space-y-1 text-left">
                    {f.type === 'heading' ? (
                      <div className="pt-3 pb-1 border-b border-slate-800">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{f.label}</h4>
                        {f.helpText && <p className="text-xs text-slate-400">{f.helpText}</p>}
                      </div>
                    ) : (
                      <>
                        <label className="block text-xs font-bold text-slate-300">
                          {f.label} {f.required && <span className="text-[#C2272D]">*</span>}
                        </label>
                        {f.type === 'textarea' ? (
                          <textarea
                            disabled
                            placeholder={f.placeholder || 'Type here...'}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
                            rows={3}
                          />
                        ) : f.type === 'select' ? (
                          <select disabled className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            <option>Select an option...</option>
                            {(f.options || []).map((opt, oi) => (
                              <option key={oi}>{opt}</option>
                            ))}
                          </select>
                        ) : f.type === 'resume' || f.type === 'file' ? (
                          <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400 bg-slate-900">
                            Upload {f.label} ({f.validation?.allowedExtensions?.join(', ') || 'Any safe format'})
                          </div>
                        ) : f.type === 'consent' ? (
                          <div className="flex items-center gap-2">
                            <input type="checkbox" disabled className="rounded text-[#C2272D]" />
                            <span className="text-xs text-slate-400">{f.label}</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            disabled
                            placeholder={f.placeholder || 'Your answer'}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
                          />
                        )}
                        {f.helpText && <p className="text-[10px] text-slate-500">{f.helpText}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#C2272D] text-white opacity-80"
                >
                  {formConfig.appearance?.submitButtonText || 'Submit Form'}
                </button>
              </div>
            </div>
          ) : (
            /* Visual Builder Layout: Left Fields & Canvas / Right Settings Panels */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Fields Canvas */}
              <div className="lg:col-span-8 space-y-6">
                {/* Basic Meta Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FaCog size={12} />
                    <span>General Form Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Form Title <span className="text-[#C2272D]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formConfig.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormConfig((prev) => ({
                            ...prev,
                            title: val,
                            // Auto generate slug if creating new
                            slug: !editingFormId ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : prev.slug
                          }));
                        }}
                        placeholder="e.g. Senior React Developer Application"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        URL Slug <span className="text-[#C2272D]">*</span>
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500 border border-r-0 border-slate-200 dark:border-slate-700">
                          /forms/
                        </span>
                        <input
                          type="text"
                          value={formConfig.slug}
                          onChange={(e) =>
                            setFormConfig((prev) => ({
                              ...prev,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                            }))
                          }
                          placeholder="job-application"
                          className="flex-1 px-3 py-2.5 rounded-r-xl text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Form Category <span className="text-[#C2272D]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenCreateCategory}
                          className="text-[11px] font-bold text-[#C2272D] hover:underline cursor-pointer"
                        >
                          + New
                        </button>
                      </div>
                      <select
                        value={formConfig.category || 'General'}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = categories.find(c => c.name === val);
                          setFormConfig((prev) => ({
                            ...prev,
                            category: val,
                            categoryId: found?._id || null
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D] cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c._id || c.name} value={c.name}>
                            {c.name} {!c.isActive ? '(Inactive)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description / Instructions
                    </label>
                    <textarea
                      value={formConfig.description}
                      onChange={(e) => setFormConfig((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Explain the purpose of this form and instructions for candidates..."
                      rows={2}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Submission Closing Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formConfig.closingDate || ''}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, closingDate: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Redirect URL after submit (Optional)
                      </label>
                      <input
                        type="url"
                        value={formConfig.redirectUrl || ''}
                        onChange={(e) => setFormConfig((prev) => ({ ...prev, redirectUrl: e.target.value }))}
                        placeholder="https://tauhidshekhar.com/thank-you"
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields Canvas */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Form Fields ({formConfig.fields.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Click any field to configure validations, options, and rules.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFieldModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C2272D] text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <FaPlus size={10} />
                      <span>Add New Field</span>
                    </button>
                  </div>

                  {formConfig.fields.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500">No fields added yet. Choose from the field drawer below.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formConfig.fields.map((field, idx) => (
                        <div
                          key={field.id || idx}
                          onClick={() => {
                            setSelectedFieldIdx(idx);
                            setFieldModalOpen(true);
                          }}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            selectedFieldIdx === idx
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-[#C2272D]'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{field.label}</span>
                                {field.required && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#C2272D] text-white">
                                    REQUIRED
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Type: <span className="text-slate-500 dark:text-slate-300">{field.type}</span> | Key:{' '}
                                <span className="text-slate-500 dark:text-slate-300">{field.key}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveField(idx, -1)}
                              className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <FaArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formConfig.fields.length - 1}
                              onClick={() => handleMoveField(idx, 1)}
                              className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <FaArrowDown size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(idx)}
                              className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer ml-1"
                              title="Delete Field"
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Field Type Palettes */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Quick Add Field Type:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {FIELD_TYPES.map((ft) => (
                        <button
                          key={ft.type}
                          type="button"
                          onClick={() => handleAddField(ft)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-[#C2272D] dark:hover:border-[#00FFFF] text-left transition-all text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
                        >
                          <span className="text-base">{ft.icon}</span>
                          <span className="truncate">{ft.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Notification & Placement Settings */}
              <div className="lg:col-span-4 space-y-6">
                {/* Email Notifications Configuration */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FaEnvelope size={12} className="text-[#C2272D]" />
                    <span>Email Delivery Settings</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formConfig.emailNotifications?.notifyAdmin ?? true}
                        onChange={(e) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            emailNotifications: {
                              ...prev.emailNotifications,
                              notifyAdmin: e.target.checked
                            }
                          }))
                        }
                        className="rounded text-[#C2272D]"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Notify Admin on submission</span>
                    </label>

                    {formConfig.emailNotifications?.notifyAdmin && (
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Admin Recipient Emails (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formConfig.emailNotifications?.adminEmails?.join(', ') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormConfig((prev) => ({
                              ...prev,
                              emailNotifications: {
                                ...prev.emailNotifications,
                                adminEmails: val.split(',').map((s) => s.trim())
                              }
                            }));
                          }}
                          placeholder="shekhartauhid@gmail.com"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConfig.emailNotifications?.notifyUser ?? false}
                          onChange={(e) =>
                            setFormConfig((prev) => ({
                              ...prev,
                              emailNotifications: {
                                ...prev.emailNotifications,
                                notifyUser: e.target.checked
                              }
                            }))
                          }
                          className="rounded text-[#00FFFF]"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Send Confirmation Email to User
                        </span>
                      </label>

                      {formConfig.emailNotifications?.notifyUser && (
                        <div className="space-y-2 mt-2">
                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">Custom User Subject</label>
                            <input
                              type="text"
                              value={formConfig.emailNotifications?.customSubject || ''}
                              onChange={(e) =>
                                setFormConfig((prev) => ({
                                  ...prev,
                                  emailNotifications: {
                                    ...prev.emailNotifications,
                                    customSubject: e.target.value
                                  }
                                }))
                              }
                              placeholder="We have received your application"
                              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-500 mb-1">Custom User Message</label>
                            <textarea
                              value={formConfig.emailNotifications?.customMessage || ''}
                              onChange={(e) =>
                                setFormConfig((prev) => ({
                                  ...prev,
                                  emailNotifications: {
                                    ...prev.emailNotifications,
                                    customMessage: e.target.value
                                  }
                                }))
                              }
                              placeholder="Thank you for getting in touch. We will review your details..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Website Placements Configuration */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FaGlobe size={12} className="text-[#00FFFF]" />
                    <span>Website Placement</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Control where this form appears across the website sections.
                  </p>

                  <div className="space-y-2.5">
                    {PLACEMENT_OPTIONS.map((opt) => {
                      const isChecked = (formConfig.placements || []).includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const curr = formConfig.placements || [];
                              if (e.target.checked) {
                                setFormConfig((prev) => ({ ...prev, placements: [...curr, opt.id] }));
                              } else {
                                setFormConfig((prev) => ({ ...prev, placements: curr.filter((p) => p !== opt.id) }));
                              }
                            }}
                            className="mt-0.5 rounded text-[#C2272D]"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{opt.label}</div>
                            <div className="text-[10px] text-slate-400">{opt.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <FaPalette size={12} />
                    <span>Theme & Appearance</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1">Visual Theme</label>
                      <select
                        value={formConfig.appearance?.theme || 'brand'}
                        onChange={(e) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            appearance: { ...prev.appearance, theme: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="brand">Brand Dark/Cyan/Red (Tauhid Shekhar)</option>
                        <option value="dark">Pure Dark Mode</option>
                        <option value="light">Clean Light Mode</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">Submit Button Text</label>
                      <input
                        type="text"
                        value={formConfig.appearance?.submitButtonText || 'Submit Form'}
                        onChange={(e) =>
                          setFormConfig((prev) => ({
                            ...prev,
                            appearance: { ...prev.appearance, submitButtonText: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: SUBMISSIONS MANAGEMENT & CSV EXPORT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'submissions' && (
        <div className="space-y-5">
          {/* Form-specific filter indicator banner */}
          {selectedFormForSubmissions !== 'all' && (
            <div className="p-3.5 rounded-2xl bg-[#C2272D]/10 border border-[#C2272D]/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C2272D] animate-pulse" />
                <span className="font-bold text-slate-800 dark:text-white">
                  Filtered by Form:{' '}
                  <span className="text-[#C2272D] dark:text-[#00FFFF]">
                    {forms.find((f) => f._id === selectedFormForSubmissions)?.title || 'Selected Form'}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormForSubmissions('all');
                  setSubmissionsFilter((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#C2272D] font-bold text-[11px] shadow-xs cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Show All Forms Submissions
              </button>
            </div>
          )}

          {/* Submissions Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Form Selector */}
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Form:</span>
                <select
                  value={selectedFormForSubmissions}
                  onChange={(e) => {
                    setSelectedFormForSubmissions(e.target.value);
                    setSubmissionsFilter((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Forms ({statsOverview.totalSubmissions} submissions)</option>
                  {forms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.title} ({f.submissionCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                <select
                  value={submissionsFilter.status}
                  onChange={(e) => setSubmissionsFilter((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer"
              >
                <FaFileCsv size={13} />
                <span>Export Form CSV</span>
              </button>
            </div>

            {/* Search Input & Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <FaSearch size={12} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={submissionsFilter.search}
                  onChange={(e) => setSubmissionsFilter((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  placeholder="Search name, email, phone, ID..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">From:</span>
                <input
                  type="date"
                  value={submissionsFilter.startDate}
                  onChange={(e) => setSubmissionsFilter((prev) => ({ ...prev, startDate: e.target.value, page: 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">To:</span>
                <input
                  type="date"
                  value={submissionsFilter.endDate}
                  onChange={(e) => setSubmissionsFilter((prev) => ({ ...prev, endDate: e.target.value, page: 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Submissions List Table */}
          {submissionsLoading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C2272D] border-t-transparent rounded-full animate-spin" />
              <span>Fetching submissions...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 p-8">
              <FaList size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No submissions found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Submissions matching your filter or query will appear here once candidates or clients fill out your forms.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Applicant / Details</th>
                      <th className="px-4 py-3">Form Name</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Files</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.map((sub) => {
                      const name =
                        sub.data?.fullName ||
                        sub.data?.name ||
                        sub.data?.firstNameLastName ||
                        'Anonymous';
                      const email = sub.data?.email || '-';
                      const phone = sub.data?.phone || '';
                      const statusBadges = {
                        New: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
                        Reviewed: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
                        Shortlisted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
                        Accepted: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
                        Rejected: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
                        Archived: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      };

                      return (
                        <tr
                          key={sub._id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{name}</div>
                            <div className="text-[11px] text-slate-500">{email} {phone && `• ${phone}`}</div>
                          </td>

                          <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {sub.formTitleSnapshot}
                          </td>

                          <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                            {new Date(sub.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          <td className="px-4 py-3.5">
                            {sub.files?.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C2272D]/10 text-[#C2272D]">
                                <FaPaperclip size={9} />
                                <span>{sub.files.length} file(s)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <select
                              value={sub.status}
                              onChange={(e) => handleUpdateStatus(sub._id, e.target.value)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer ${
                                statusBadges[sub.status] || statusBadges.New
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveSubmissionDetail(sub)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-[#C2272D] hover:text-white transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    open: true,
                                    type: 'submission',
                                    id: sub._id,
                                    title: name
                                  })
                                }
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                title="Delete"
                              >
                                <FaTrash size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Showing {submissions.length} of {submissionsPagination.total} submissions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={submissionsFilter.page <= 1}
                    onClick={() => setSubmissionsFilter((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Page {submissionsFilter.page} of {submissionsPagination.totalPages || 1}
                  </span>
                  <button
                    disabled={submissionsFilter.page >= submissionsPagination.totalPages}
                    onClick={() => setSubmissionsFilter((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: PREBUILT TEMPLATES GALLERY */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1-Click Ready Form Templates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any template below to customize its questions, fields, and branding without writing any code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'tpl_job',
                title: 'Job Application Form',
                slug: 'job-application',
                category: 'Careers & Hiring',
                desc: 'Collect candidate names, resumes (PDF), skills, experience, portfolio links, and screening questions.',
                badge: 'Popular'
              },
              {
                id: 'tpl_resume',
                title: 'Resume Submission Form',
                slug: 'resume-submission',
                category: 'Talent Pool',
                desc: 'Quick resume drop form for software engineers, designers, and consultants.',
                badge: 'Hiring'
              },
              {
                id: 'tpl_contact',
                title: 'Contact & Inquiry Form',
                slug: 'contact-form',
                category: 'Inquiries',
                desc: 'Modern contact form for direct inquiries, consulting, and collaboration requests.',
                badge: 'Essential'
              },
              {
                id: 'tpl_internship',
                title: 'Internship Application Form',
                slug: 'internship-application',
                category: 'Students & Interns',
                desc: 'College details, graduation year, duration, technical interests, and resume upload.',
                badge: 'Campus'
              },
              {
                id: 'tpl_reg',
                title: 'Event / Workshop Registration',
                slug: 'event-registration',
                category: 'Events',
                desc: 'Register attendees for tech webinars, live masterclasses, and coding workshops.',
                badge: 'Events'
              },
              {
                id: 'tpl_enq',
                title: 'General Enquiry Form',
                slug: 'general-enquiry',
                category: 'General',
                desc: 'Structured category picker and message details for broad inquiries.',
                badge: 'General'
              }
            ].map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tpl.category}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#C2272D]/10 text-[#C2272D]">
                      {tpl.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">{tpl.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3">{tpl.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">/forms/{tpl.slug}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const found = forms.find((f) => f.slug === tpl.slug);
                      if (found) {
                        handleUseTemplate(found);
                      } else {
                        handleCreateNewForm();
                        setFormConfig((prev) => ({
                          ...prev,
                          title: tpl.title,
                          slug: tpl.slug,
                          description: tpl.desc
                        }));
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white shadow-sm transition-all cursor-pointer"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: FORM CATEGORIES MANAGEMENT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Categories Top Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2272D]" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                  Form Categories Management
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create, edit, and organize custom categories for applications, inquiries, registrations, and dynamic forms.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch size={11} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenCreateCategory}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white shadow-md shadow-[#C2272D]/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <FaPlus size={10} />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Categories List Cards / Table */}
          {categoriesLoading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#C2272D] border-t-transparent rounded-full animate-spin" />
              <span>Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 p-8">
              <FaLayerGroup size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No categories found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Create your first form category to organize your application and inquiry forms.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateCategory}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#C2272D] text-white cursor-pointer"
              >
                + Create New Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .filter(cat => !categorySearch || cat.name.toLowerCase().includes(categorySearch.toLowerCase()) || cat.slug.toLowerCase().includes(categorySearch.toLowerCase()))
                .map((cat) => {
                  const formsInCat = forms.filter(f => (f.category || f.templateCategory || '').toLowerCase() === cat.name.toLowerCase());
                  const activeInCat = formsInCat.filter(f => f.status === 'Published' && f.isSubmissionsEnabled !== false);

                  return (
                    <div
                      key={cat._id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex flex-col justify-between transition-all"
                    >
                      <div>
                        {/* Header: Color pill & Status Toggle */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${cat.color || '#C2272D'}15`,
                              color: cat.color || '#C2272D',
                              border: `1px solid ${cat.color || '#C2272D'}30`
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color || '#C2272D' }} />
                            <span>{cat.slug}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleCategoryActive(cat)}
                            title={cat.isActive ? 'Click to deactivate' : 'Click to activate'}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              cat.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{cat.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                          {cat.description || 'No description provided.'}
                        </p>

                        {/* Forms Stats Badge */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">Associated Forms:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formsInCat.length} total ({activeInCat.length} live)
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormsViewFilter(cat.name.toLowerCase());
                            setActiveTab('forms');
                          }}
                          className="text-[11px] font-bold text-[#C2272D] hover:underline cursor-pointer"
                        >
                          View Forms &rarr;
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Category"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryPrompt(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Category"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: SHARE & QR CODE GENERATOR */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {shareModalOpen && selectedFormForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                Share Form & QR Code
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedFormForShare.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan with any smartphone camera to open the form directly.
              </p>
            </div>

            {/* QR Code Canvas Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white inline-block shadow-inner border border-slate-200">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code for ${selectedFormForShare.title}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Copy Public Link Pill */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
              <span className="truncate pr-2">{`${getPublicDomain()}/forms/${selectedFormForShare.slug}`}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${getPublicDomain()}/forms/${selectedFormForShare.slug}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1 rounded-lg bg-[#C2272D] text-white text-[11px] font-bold shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleDownloadQr('png')}
                className="py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaDownload size={11} />
                <span>Download PNG</span>
              </button>
              <button
                onClick={handleNativeShare}
                className="py-2.5 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#C2272D]/20 cursor-pointer"
              >
                <FaShareAlt size={11} />
                <span>Share Form</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: SUBMISSION DETAILS DRAWER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeSubmissionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C2272D]">
                  Submission Details
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                  #{activeSubmissionDetail._id.toString().slice(-8)}
                </h3>
              </div>
              <button
                onClick={() => setActiveSubmissionDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Status & Timestamps */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Submission Status</div>
                <select
                  value={activeSubmissionDetail.status}
                  onChange={(e) => handleUpdateStatus(activeSubmissionDetail._id, e.target.value)}
                  className="mt-1 px-3 py-1 rounded-lg font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                >
                  <option value="New">New</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Received At</div>
                <div className="text-slate-700 dark:text-slate-300 font-semibold mt-1">
                  {new Date(activeSubmissionDetail.createdAt).toLocaleString('en-US')}
                </div>
              </div>
            </div>

            {/* Submitted Form Fields Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Answers</h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(activeSubmissionDetail.data || {}).map(([key, val]) => {
                  if (key === '_ts_hp') return null;
                  const snapshot = (activeSubmissionDetail.fieldSnapshots || []).find((s) => s.key === key);
                  const label = snapshot ? snapshot.label : key;

                  return (
                    <div key={key} className="p-3 text-xs flex flex-col sm:flex-row justify-between gap-2">
                      <span className="font-bold text-slate-500 sm:w-1/3">{label}</span>
                      <span className="text-slate-900 dark:text-white font-medium sm:w-2/3 break-words">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val || '-')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attached Files & Resumes */}
            {activeSubmissionDetail.files?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Uploaded Documents & Resumes ({activeSubmissionDetail.files.length})
                </h4>
                <div className="space-y-2">
                  {activeSubmissionDetail.files.map((file) => (
                    <div
                      key={file.fileId}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FaPaperclip size={14} className="text-[#C2272D] shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{file.originalName}</div>
                          <div className="text-[10px] text-slate-400">
                            {Math.round(file.size / 1024)} KB • {file.mimeType}
                          </div>
                        </div>
                      </div>

                      <a
                        href={`/api/forms/files/${file.fileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white shrink-0 shadow-sm flex items-center gap-1"
                      >
                        <FaDownload size={10} />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Private Admin Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaStickyNote size={12} className="text-amber-500" />
                <span>Private Admin Notes</span>
              </h4>

              <div className="space-y-2">
                {(activeSubmissionDetail.adminNotes || []).map((note, ni) => (
                  <div
                    key={ni}
                    className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                      <span>{note.author || 'Admin'}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{note.note}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAdminNote()}
                  placeholder="Add private note for this applicant..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAdminNote}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Email delivery audit */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-400 uppercase text-[10px]">Email Delivery Audit:</div>
              <div>Admin Notification: {activeSubmissionDetail.emailDeliveryStatus?.adminEmailSent ? '✅ Delivered' : '⚠️ Pending or Disabled'}</div>
              <div>User Confirmation: {activeSubmissionDetail.emailDeliveryStatus?.userEmailSent ? '✅ Sent to User' : 'Not configured or pending'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: FIELD EDITOR MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {fieldModalOpen && selectedFieldIdx !== null && formConfig.fields[selectedFieldIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                Configure Field: {formConfig.fields[selectedFieldIdx].label}
              </h3>
              <button
                onClick={() => setFieldModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Field Label</label>
                <input
                  type="text"
                  value={formConfig.fields[selectedFieldIdx].label}
                  onChange={(e) => handleUpdateSelectedField('label', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Field Type</label>
                  <select
                    value={formConfig.fields[selectedFieldIdx].type}
                    onChange={(e) => handleUpdateSelectedField('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.type} value={ft.type}>
                        {ft.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Internal Key / Name</label>
                  <input
                    type="text"
                    value={formConfig.fields[selectedFieldIdx].key}
                    onChange={(e) =>
                      handleUpdateSelectedField('key', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Placeholder Text</label>
                <input
                  type="text"
                  value={formConfig.fields[selectedFieldIdx].placeholder || ''}
                  onChange={(e) => handleUpdateSelectedField('placeholder', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Help / Subtext</label>
                <input
                  type="text"
                  value={formConfig.fields[selectedFieldIdx].helpText || ''}
                  onChange={(e) => handleUpdateSelectedField('helpText', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Options editor for choice fields */}
              {['select', 'radio', 'checkbox'].includes(formConfig.fields[selectedFieldIdx].type) && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Options (One per line)
                  </label>
                  <textarea
                    value={(formConfig.fields[selectedFieldIdx].options || []).join('\n')}
                    onChange={(e) =>
                      handleUpdateSelectedField(
                        'options',
                        e.target.value.split('\n').filter((opt) => opt.trim() !== '')
                      )
                    }
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              )}

              {/* Validation Rules */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formConfig.fields[selectedFieldIdx].required || false}
                    onChange={(e) => handleUpdateSelectedField('required', e.target.checked)}
                    className="rounded text-[#C2272D]"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Required Field (frontend & backend enforcement)
                  </span>
                </label>

                {formConfig.fields[selectedFieldIdx].type === 'resume' && (
                  <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-[11px] text-[#C2272D] border border-rose-200/50 dark:border-rose-900/30">
                    PDF format is automatically enforced for Resume / CV Uploads with maximum 10MB file limit.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setFieldModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2272D] text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteConfirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <FaExclamationTriangle size={20} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                Confirm Permanent Deletion
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>"{deleteConfirmModal.title}"</strong>?
                {deleteConfirmModal.submissionCount > 0 && (
                  <span className="block mt-2 font-bold text-rose-500">
                    Warning: This form has {deleteConfirmModal.submissionCount} submission(s) and uploaded files which will also be permanently deleted.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ open: false, type: 'form', id: null, title: '', submissionCount: 0 })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: UNSAVED CHANGES CONFIRMATION (CANCEL / DISCARD) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <FaExclamationTriangle size={20} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                Discard Unsaved Changes?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                You have unsaved changes in this form. If you discard now, your recent field edits and configuration adjustments will be lost and the form will remain in its last saved state.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-all"
              >
                Stay in Editor
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-all shadow-md shadow-rose-600/20"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE / EDIT CATEGORY */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {categoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveCategory}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                {categoryModal.isEditing ? 'Edit Form Category' : 'Create New Form Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModal(prev => ({ ...prev, open: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name <span className="text-[#C2272D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryModal.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryModal(prev => ({
                      ...prev,
                      name: val,
                      slug: !prev.isEditing ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : prev.slug
                    }));
                  }}
                  placeholder="e.g. Course Enrollment, Hackathons"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL / Internal Slug <span className="text-[#C2272D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryModal.slug}
                  onChange={(e) => setCategoryModal(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  placeholder="course-enrollment"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryModal.description}
                  onChange={(e) => setCategoryModal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explain what types of forms belong in this category..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={categoryModal.color}
                      onChange={(e) => setCategoryModal(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={categoryModal.color}
                      onChange={(e) => setCategoryModal(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-2.5 py-1.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryModal.isActive}
                      onChange={(e) => setCategoryModal(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded text-[#C2272D] focus:ring-0"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Active (Selectable)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCategoryModal(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white cursor-pointer shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : (categoryModal.isEditing ? 'Update Category' : 'Save Category')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: SAFE CATEGORY DELETION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {deleteCatModal.open && deleteCatModal.category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center gap-2 text-rose-600">
              <FaExclamationTriangle size={18} />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Manrope']">
                Delete Category Safely
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove category <strong>"{deleteCatModal.category.name}"</strong>? Existing forms and submissions will <strong>never</strong> be deleted.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reassign associated forms to:
              </label>
              <select
                value={deleteCatModal.reassignTo}
                onChange={(e) => setDeleteCatModal(prev => ({ ...prev, reassignTo: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {categories.filter(c => c._id !== deleteCatModal.category._id).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteCatModal({ open: false, category: null, reassignTo: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteDeleteCategory}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md disabled:opacity-50"
              >
                {actionLoading ? 'Reassigning...' : 'Reassign & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
