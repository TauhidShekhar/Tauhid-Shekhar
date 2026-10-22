import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import {
  FaWpforms,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperclip,
  FaTrash,
  FaArrowLeft,
  FaShareAlt,
  FaQrcode,
  FaCopy,
  FaClock,
  FaTimes,
  FaDownload,
  FaLock,
  FaCheck,
  FaExternalLinkAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaGlobe,
  FaCloudUploadAlt,
  FaFilePdf,
  FaHome
} from 'react-icons/fa';

export default function DynamicPublicForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClosed, setIsClosed] = useState(false);

  // Form input data: { [fieldKey]: value }
  const [formData, setFormData] = useState({});
  // Selected files: { [fieldKey]: [File objects] }
  const [selectedFiles, setSelectedFiles] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Unsaved Changes Confirmation Modal
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // QR & Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [dragOverField, setDragOverField] = useState(null);

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPublicFormBySlug(slug);
      if (res?.success && res.data) {
        setForm(res.data);
        setIsClosed(Boolean(res.isClosed));

        // Initialize default form values
        const initial = {};
        (res.data.fields || []).forEach((field) => {
          if (field.defaultValue !== undefined && field.defaultValue !== null) {
            initial[field.key] = field.defaultValue;
          } else if (field.type === 'checkbox') {
            initial[field.key] = [];
          } else if (field.type === 'consent' || field.type === 'yesNo') {
            initial[field.key] = false;
          } else {
            initial[field.key] = '';
          }
        });
        setFormData(initial);

        // Pre-generate QR code for this URL
        const fullUrl = window.location.href;
        QRCode.toDataURL(fullUrl, {
          width: 320,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        }).then(setQrCodeDataUrl).catch(() => {});
      } else {
        setError('The requested form could not be found or is not currently available.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load this form.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has entered any information
  const isFormDirty = () => {
    if (!form || submittedSuccess) return false;
    const hasText = Object.values(formData).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'boolean') return v === true;
      return typeof v === 'string' && v.trim().length > 0;
    });
    const hasFiles = Object.values(selectedFiles).some((files) => Array.isArray(files) && files.length > 0);
    return hasText || hasFiles;
  };

  // Window beforeunload prompt to protect unsaved work
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, selectedFiles, submittedSuccess]);

  // Safe Exit execution preserving previous scroll & route
  const performSafeExit = () => {
    setShowUnsavedModal(false);
    if (location.state?.from) {
      navigate(location.state.from);
      if (location.state.scrollY !== undefined) {
        setTimeout(() => {
          window.scrollTo({ top: location.state.scrollY, behavior: 'smooth' });
        }, 80);
      }
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/forms');
    }
  };

  // User requests to Close or go Back
  const handleRequestExit = (e) => {
    if (e) e.preventDefault();
    if (isFormDirty()) {
      setShowUnsavedModal(true);
    } else {
      performSafeExit();
    }
  };

  // Handle generic input change
  const handleInputChange = (fieldKey, value) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  // Handle Checkbox list toggles
  const handleCheckboxToggle = (fieldKey, optionValue) => {
    const current = Array.isArray(formData[fieldKey]) ? formData[fieldKey] : [];
    const updated = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    handleInputChange(fieldKey, updated);
  };

  // Handle File selection
  const handleFileChange = (fieldKey, filesList, isMultiple = false, validation = {}) => {
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    const validFiles = [];
    const allowed = validation.allowedExtensions || [];
    const maxSizeMB = validation.maxFileSizeMB || 15;

    for (const file of filesArray) {
      const ext = `.${file.name.split('.').pop().toLowerCase()}`;
      if (allowed.length > 0 && !allowed.includes(ext)) {
        setFieldErrors((prev) => ({
          ...prev,
          [fieldKey]: `Invalid file format (${ext}). Allowed: ${allowed.join(', ')}`
        }));
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          [fieldKey]: `File exceeds maximum allowed size of ${maxSizeMB} MB.`
        }));
        return;
      }

      validFiles.push(file);
    }

    setSelectedFiles((prev) => {
      const existing = prev[fieldKey] || [];
      return {
        ...prev,
        [fieldKey]: isMultiple ? [...existing, ...validFiles] : [validFiles[0]]
      };
    });

    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  const handleRemoveFile = (fieldKey, index) => {
    setSelectedFiles((prev) => {
      const list = prev[fieldKey] || [];
      const updated = list.filter((_, i) => i !== index);
      return { ...prev, [fieldKey]: updated };
    });
  };

  // Client-side validation before sending
  const validateForm = () => {
    const errors = {};
    (form.fields || []).forEach((field) => {
      if (field.hidden || field.type === 'heading') return;

      const val = formData[field.key];
      const attached = selectedFiles[field.key] || [];

      // Required validation
      if (field.required) {
        if (['file', 'resume', 'multipleFile'].includes(field.type)) {
          if (attached.length === 0) {
            errors[field.key] = `${field.label} is required. Please attach a file.`;
          }
        } else if (field.type === 'consent') {
          if (!val) {
            errors[field.key] = 'You must accept the terms / consent to proceed.';
          }
        } else if (field.type === 'checkbox') {
          if (!Array.isArray(val) || val.length === 0) {
            errors[field.key] = `Please select at least one option for ${field.label}.`;
          }
        } else if (val === undefined || val === null || String(val).trim() === '') {
          errors[field.key] = `${field.label} is required.`;
        }
      }

      // Format validations
      if (val && typeof val === 'string' && val.trim()) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            errors[field.key] = 'Please enter a valid email address.';
          }
        } else if (field.type === 'url') {
          try {
            const testUrl = val.startsWith('http') ? val : `https://${val}`;
            new URL(testUrl);
          } catch (_) {
            errors[field.key] = 'Please provide a valid website URL.';
          }
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isClosed) return;

    if (!validateForm()) {
      const firstErrorKey = Object.keys(fieldErrors)[0];
      const el = document.getElementById(`field-wrapper-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    try {
      const submissionFormData = new FormData();
      submissionFormData.append('data', JSON.stringify(formData));

      Object.keys(selectedFiles).forEach((fieldKey) => {
        const filesList = selectedFiles[fieldKey] || [];
        filesList.forEach((file) => {
          submissionFormData.append(fieldKey, file);
        });
      });

      const res = await api.submitPublicForm(slug, submissionFormData);
      if (res?.success) {
        setSubmittedSuccess(true);
        setSubmissionResult(res);

        if (form.redirectUrl) {
          let count = 4;
          setRedirectCountdown(count);
          const timer = setInterval(() => {
            count -= 1;
            setRedirectCountdown(count);
            if (count <= 0) {
              clearInterval(timer);
              window.location.href = form.redirectUrl;
            }
          }, 1000);
        }
      } else {
        alert(res?.message || 'Submission failed. Please check your inputs.');
      }
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        alert(err.message || 'Submission encountered an error. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedSuccess(false);
    setSubmissionResult(null);
    setRedirectCountdown(null);
    const initial = {};
    (form.fields || []).forEach((field) => {
      initial[field.key] = field.defaultValue || '';
    });
    setFormData(initial);
    setSelectedFiles({});
    setFieldErrors({});
  };

  const handleShareClick = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: form?.title || 'Tauhid Shekhar Form',
          text: form?.description || 'Please fill out this form:',
          url
        });
      } catch (_) {}
    } else {
      setShowShareModal(true);
    }
  };

  // Helper icon for inputs
  const getFieldIcon = (type) => {
    switch (type) {
      case 'fullName':
      case 'firstLastName':
        return <FaUser size={13} className="text-slate-400" />;
      case 'email':
        return <FaEnvelope size={13} className="text-slate-400" />;
      case 'phone':
        return <FaPhone size={13} className="text-slate-400" />;
      case 'date':
        return <FaCalendarAlt size={13} className="text-slate-400" />;
      case 'url':
        return <FaGlobe size={13} className="text-slate-400" />;
      case 'resume':
        return <FaFilePdf size={13} className="text-[#C2272D]" />;
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-black text-slate-800 dark:text-white transition-colors font-['Inter']">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#C2272D] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-['Inter'] transition-colors">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30">
            <FaExclamationTriangle size={24} />
          </div>
          <h2 className="text-xl font-black font-['Manrope']">Form Unavailable</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {error || 'This form does not exist, is currently turned OFF, or has been archived.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/forms')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white transition-colors cursor-pointer"
            >
              Back to Forms Center
            </button>
            <button
              onClick={handleRequestExit}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submission Confirmed Screen
  if (submittedSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-['Inter'] transition-colors">
        <div className="max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 text-center space-y-5 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <FaCheckCircle size={32} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C2272D] dark:text-[#00FFFF]">
              Submission Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Manrope']">
              Thank You!
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {submissionResult?.message || form.confirmationMessage}
          </p>

          {submissionResult?.submissionId && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 font-mono text-xs text-slate-500 dark:text-slate-400 inline-block">
              Reference ID: <span className="text-slate-900 dark:text-white font-bold">#{submissionResult.submissionId.toString().slice(-8)}</span>
            </div>
          )}

          {redirectCountdown !== null && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Redirecting you in <strong className="text-[#C2272D] dark:text-[#00FFFF]">{redirectCountdown}</strong> seconds...
            </p>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRequestExit}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white shadow-md shadow-[#C2272D]/20 transition-all text-center cursor-pointer"
            >
              Return to Previous Page
            </button>
            <Link
              to="/forms"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-center"
            >
              Explore Forms Center
            </Link>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-['Inter'] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Decorative Brand Accent Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-[#C2272D]/5 dark:bg-[#C2272D]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 dark:bg-[#00FFFF]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-5 relative z-10">
        
        {/* Top Bar: Breadcrumb + Back & Share controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate">
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <FaHome size={11} />
              <span>Home</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <Link to="/forms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Forms Center
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-[#C2272D] dark:text-[#00FFFF] font-bold truncate max-w-[180px] sm:max-w-xs">
              {form.title}
            </span>
          </nav>

          {/* Quick Back & Share Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRequestExit}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors px-3 py-1.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-xs cursor-pointer"
            >
              <FaArrowLeft size={10} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors px-3 py-1.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-xs cursor-pointer"
            >
              <FaShareAlt size={11} className="text-[#C2272D]" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors px-3 py-1.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-xs cursor-pointer"
              title="Show QR Code"
            >
              <FaQrcode size={11} className="text-[#00FFFF]" />
              <span>QR Code</span>
            </button>
          </div>
        </div>

        {/* Closed or Expired Notice */}
        {isClosed && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <FaClock size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <strong className="block font-bold mb-0.5">This Form is Currently Closed</strong>
                This form has been paused or its submission deadline has passed. It is not currently accepting new entries.
              </div>
            </div>
            <Link
              to="/forms"
              className="px-3 py-1.5 rounded-xl bg-amber-200 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold whitespace-nowrap text-[11px] shrink-0"
            >
              Browse Active Forms &rarr;
            </Link>
          </div>
        )}

        {/* Form Container Card */}
        <div className="rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-md overflow-hidden relative">
          
          {/* Card Header with Close (✕) Button */}
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5 bg-gradient-to-b from-slate-50/60 to-transparent dark:from-[#161616] dark:to-transparent relative">
            
            {/* Close Button at top-right */}
            <button
              type="button"
              onClick={handleRequestExit}
              title="Close Form & Return"
              className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-[#C2272D] hover:bg-rose-50 dark:hover:bg-white/10 transition-all cursor-pointer shadow-xs"
              aria-label="Close Form"
            >
              <FaTimes size={16} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#C2272D]/15 text-[#C2272D] dark:text-[#00FFFF] text-[11px] font-bold tracking-wider uppercase mb-3 border border-[#C2272D]/20 dark:border-[#C2272D]/30">
              <FaWpforms size={11} />
              <span>Tauhid Shekhar Verified</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-['Manrope'] pr-10">
              {form.title}
            </h1>

            {form.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl">
                {form.description}
              </p>
            )}

            {form.closingDate && !isClosed && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <FaClock size={11} className="text-[#C2272D] dark:text-[#00FFFF]" />
                <span>Deadline: {new Date(form.closingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Honeypot anti-spam field */}
            <input type="text" name="_ts_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            {(form.fields || []).map((field, idx) => {
              if (field.hidden) return null;

              // Section Heading Field
              if (field.type === 'heading') {
                return (
                  <div key={field.id || idx} className="pt-5 pb-2 border-b border-slate-100 dark:border-white/5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-['Manrope'] flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#C2272D] rounded-full inline-block" />
                      <span>{field.label}</span>
                    </h3>
                    {field.helpText && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{field.helpText}</p>
                    )}
                  </div>
                );
              }

              const errorMsg = fieldErrors[field.key];
              const value = formData[field.key] ?? '';
              const attached = selectedFiles[field.key] || [];
              const fieldIcon = getFieldIcon(field.type);

              return (
                <div
                  key={field.id || idx}
                  id={`field-wrapper-${field.key}`}
                  className="space-y-1.5 text-left"
                >
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    {field.label}
                    {field.required && <span className="text-[#C2272D] ml-1 font-extrabold">*</span>}
                  </label>

                  {/* Render based on field type */}
                  {field.type === 'textarea' ? (
                    <textarea
                      disabled={isClosed || submitting}
                      value={value}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || 'Type your message or details here...'}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C2272D]/20 transition-all ${
                        errorMsg
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF]'
                      }`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      disabled={isClosed || submitting}
                      value={value}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C2272D]/20 transition-all cursor-pointer ${
                        errorMsg
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-200 dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF]'
                      }`}
                    >
                      <option value="">{field.placeholder || 'Select an option...'}</option>
                      {(field.options || []).map((opt, oi) => (
                        <option key={oi} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'radio' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(field.options || []).map((opt, oi) => {
                        const isSelected = value === opt;
                        return (
                          <label
                            key={oi}
                            className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-rose-50/70 dark:bg-[#C2272D]/15 border-[#C2272D] text-slate-900 dark:text-white font-bold shadow-xs'
                                : 'bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.key}
                              value={opt}
                              checked={isSelected}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              disabled={isClosed || submitting}
                              className="text-[#C2272D] focus:ring-0"
                            />
                            <span className="text-xs">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === 'checkbox' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(field.options || []).map((opt, oi) => {
                        const checked = Array.isArray(value) && value.includes(opt);
                        return (
                          <label
                            key={oi}
                            className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-rose-50/70 dark:bg-[#C2272D]/15 border-[#C2272D] text-slate-900 dark:text-white font-bold shadow-xs'
                                : 'bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxToggle(field.key, opt)}
                              disabled={isClosed || submitting}
                              className="rounded text-[#C2272D] focus:ring-0"
                            />
                            <span className="text-xs">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === 'yesNo' ? (
                    <div className="flex items-center gap-3 pt-1">
                      {[
                        { label: 'Yes', val: true },
                        { label: 'No', val: false }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          disabled={isClosed || submitting}
                          onClick={() => handleInputChange(field.key, item.val)}
                          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            value === item.val
                              ? 'bg-[#C2272D] text-white border-[#C2272D] shadow-md shadow-[#C2272D]/20'
                              : 'bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : ['file', 'resume', 'multipleFile'].includes(field.type) ? (
                    /* File Upload Zone */
                    <div className="space-y-2">
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverField(field.key);
                        }}
                        onDragLeave={() => setDragOverField(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverField(null);
                          handleFileChange(field.key, e.dataTransfer.files, field.type === 'multipleFile', field.validation);
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all ${
                          dragOverField === field.key
                            ? 'border-[#C2272D] bg-rose-50/50 dark:bg-[#C2272D]/10'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1A1A1A]'
                        }`}
                      >
                        <FaCloudUploadAlt size={24} className="mx-auto text-slate-400 mb-1" />
                        <label className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] hover:underline cursor-pointer block">
                          <span>Click to browse device</span>
                          <input
                            type="file"
                            multiple={field.type === 'multipleFile'}
                            accept={
                              field.type === 'resume'
                                ? '.pdf'
                                : (field.validation?.allowedExtensions || []).join(',')
                            }
                            onChange={(e) =>
                              handleFileChange(field.key, e.target.files, field.type === 'multipleFile', field.validation)
                            }
                            disabled={isClosed || submitting}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {field.type === 'resume'
                            ? 'Supported: PDF resume documents (Max 15 MB)'
                            : `Supported: ${
                                (field.validation?.allowedExtensions || []).length > 0
                                  ? field.validation.allowedExtensions.join(', ')
                                  : 'All standard formats'
                              }`}
                        </p>
                      </div>

                      {/* Attached files list */}
                      {attached.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {attached.map((f, fi) => (
                            <div
                              key={fi}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200"
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <FaFilePdf size={12} className="text-[#C2272D] shrink-0" />
                                <span className="truncate font-medium">{f.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(field.key, fi)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                title="Remove file"
                              >
                                <FaTrash size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : field.type === 'consent' ? (
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 hover:border-slate-300 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => handleInputChange(field.key, e.target.checked)}
                        disabled={isClosed || submitting}
                        className="mt-0.5 rounded text-[#C2272D] focus:ring-0"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {field.label}
                      </span>
                    </label>
                  ) : (
                    /* Default inputs: text, email, phone, number, url, date */
                    <div className="relative">
                      {fieldIcon && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2">
                          {fieldIcon}
                        </span>
                      )}
                      <input
                        type={
                          field.type === 'email'
                            ? 'email'
                            : field.type === 'phone'
                            ? 'tel'
                            : field.type === 'number'
                            ? 'number'
                            : field.type === 'url'
                            ? 'url'
                            : field.type === 'date'
                            ? 'date'
                            : 'text'
                        }
                        disabled={isClosed || submitting}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder || 'Your response...'}
                        className={`w-full py-3 pr-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#C2272D]/20 transition-all ${
                          fieldIcon ? 'pl-11' : 'pl-4'
                        } ${
                          errorMsg
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-[#C2272D] dark:focus:border-[#00FFFF]'
                        }`}
                      />
                    </div>
                  )}

                  {/* Help text */}
                  {field.helpText && !errorMsg && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{field.helpText}</p>
                  )}

                  {/* Validation error */}
                  {errorMsg && (
                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1.5 pt-0.5">
                      <FaExclamationTriangle size={10} />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>
              );
            })}

            {/* Action Bar: Submit + Back */}
            <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3">
              <button
                type="submit"
                disabled={isClosed || submitting}
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider bg-[#C2272D] hover:bg-[#a81f25] disabled:opacity-40 disabled:hover:bg-[#C2272D] text-white shadow-xl shadow-[#C2272D]/25 hover:shadow-2xl hover:shadow-[#C2272D]/35 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Manrope']"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting safely...</span>
                  </>
                ) : (
                  <span>{form.appearance?.submitButtonText || 'Submit Form'}</span>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={handleRequestExit}
                  className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer font-semibold"
                >
                  &larr; Cancel & Return
                </button>
                <div className="flex items-center gap-1.5">
                  <FaLock size={10} />
                  <span>SSL Encrypted & Protected</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
              <FaExclamationTriangle size={20} />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-['Manrope']">
              Unsaved Changes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You have entered information in this form. If you leave now, your entries will be discarded.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={performSafeExit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white transition-colors cursor-pointer"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / QR Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-['Manrope']">Share Form</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {qrCodeDataUrl && (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-inner border border-slate-200">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-44 h-44 mx-auto object-contain"
                />
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="truncate pr-2">{window.location.href}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#C2272D] text-white text-[11px] font-bold shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
