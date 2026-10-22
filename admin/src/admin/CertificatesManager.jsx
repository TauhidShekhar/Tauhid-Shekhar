import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { FaCertificate, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes, FaGlobe, FaCloudUploadAlt, FaSearch, FaFilePdf, FaGraduationCap, FaTrophy } from 'react-icons/fa';

const CertificatesManager = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    credentialId: '',
    credentialUrl: '',
    category: '',
    displayOrder: 0,
    imageUrl: '',
    imagePublicId: '',
    pdfUrl: ''
  });

  // Uploading states
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const [dragOverImg, setDragOverImg] = useState(false);

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [dragOverPdf, setDragOverPdf] = useState(false);

  const fetchCerts = async () => {
    try {
      const res = await api.getCertificates();
      if (res.success) {
        setCerts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  // Upload handlers
  const handleFileUpload = async (file, type) => {
    if (type === 'image') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Supported formats: JPG, JPEG, PNG, WEBP, SVG');
        return;
      }
      setUploadingImg(true);
      setImgProgress(15);
    } else {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Supported format: PDF only');
        return;
      }
      setUploadingPdf(true);
      setPdfProgress(15);
    }

    try {
      const formPayload = new FormData();
      formPayload.append('file', file);

      const interval = setInterval(() => {
        if (type === 'image') {
          setImgProgress(prev => (prev >= 90 ? 90 : prev + 15));
        } else {
          setPdfProgress(prev => (prev >= 90 ? 90 : prev + 15));
        }
      }, 100);

      const res = await api.uploadMedia(formPayload);
      clearInterval(interval);

      if (type === 'image') {
        setImgProgress(100);
        if (res.success && res.data?.fileUrl) {
          setFormData(prev => ({ 
            ...prev, 
            imageUrl: res.data.fileUrl, 
            imagePublicId: res.data.publicId || '' 
          }));
        }
      } else {
        setPdfProgress(100);
        if (res.success && res.data?.fileUrl) {
          setFormData(prev => ({ ...prev, pdfUrl: res.data.fileUrl }));
        }
      }
    } catch (err) {
      alert(err.message || 'File upload failed');
    } finally {
      setTimeout(() => {
        if (type === 'image') {
          setUploadingImg(false);
          setImgProgress(0);
        } else {
          setUploadingPdf(false);
          setPdfProgress(0);
        }
      }, 400);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? Number(value) : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title,
      issuer: formData.issuer,
      date: formData.date,
      credentialId: formData.credentialId,
      credentialUrl: formData.credentialUrl,
      category: formData.category,
      displayOrder: formData.displayOrder,
      image: {
        url: formData.imageUrl,
        publicId: formData.imagePublicId
      },
      pdfUrl: formData.pdfUrl
    };

    try {
      if (isEditing) {
        const res = await api.updateCertificate(currentId, payload);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchCerts();
        }
      } else {
        const res = await api.createCertificate(payload);
        if (res.success) {
          resetForm();
          fetchCerts();
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
      issuer: '',
      date: '',
      credentialId: '',
      credentialUrl: '',
      category: '',
      displayOrder: 0,
      imageUrl: '',
      imagePublicId: '',
      pdfUrl: ''
    });
  };

  const handleEditClick = (c) => {
    setIsEditing(true);
    setCurrentId(c._id);
    setFormData({
      title: c.title,
      issuer: c.issuer,
      date: c.date ? c.date.slice(0, 10) : '',
      credentialId: c.credentialId || '',
      credentialUrl: c.credentialUrl || '',
      category: c.category || '',
      displayOrder: c.displayOrder || 0,
      imageUrl: c.image?.url || '',
      imagePublicId: c.image?.publicId || '',
      pdfUrl: c.pdfUrl || ''
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    setLoading(true);
    try {
      const res = await api.deleteCertificate(id);
      if (res.success) {
        fetchCerts();
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
  const filteredCerts = certs.filter(c => {
    return c.title.toLowerCase().includes(search.toLowerCase()) || 
           c.issuer.toLowerCase().includes(search.toLowerCase());
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
  const displayedCerts = filteredCerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && certs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Suite Navigation */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2272D] mb-1">
            <FaCertificate size={14} />
            <span>Academic & Honors Management Suite</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-['Manrope'] text-slate-900 dark:text-white">
            Professional Certifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish, inspect, and organize verified industry credentials and badges.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto">
          <Link
            to="/admin/education"
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            <FaGraduationCap size={13} />
            <span>Education</span>
          </Link>

          <Link
            to="/admin/certificates"
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-[#C2272D] text-white shadow-sm whitespace-nowrap"
          >
            <FaCertificate size={12} />
            <span>Certifications</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25">{certs.length}</span>
          </Link>

          <Link
            to="/admin/achievements"
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            <FaTrophy size={12} />
            <span>Achievements</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Certificate' : 'Add Certificate'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Credential Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Issuer</label>
              <input
                type="text"
                name="issuer"
                value={formData.issuer}
                onChange={handleInputChange}
                required
                placeholder="e.g. Google, IBM, Udemy"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Date Issued</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Credential ID</label>
              <input
                type="text"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Verification URL</label>
              <input
                type="url"
                name="credentialUrl"
                value={formData.credentialUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g. Web Development"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            {/* Badge Image Upload Block */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Badge Image (Local Device)</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverImg(true); }}
                onDragLeave={() => setDragOverImg(false)}
                onDrop={(e) => { e.preventDefault(); setDragOverImg(false); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file, 'image'); }}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragOverImg ? 'border-primary-blue bg-primary-blue/5' : 'border-slate-250 dark:border-white/10 hover:border-primary-blue/60'
                }`}
              >
                {formData.imageUrl ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden group">
                    <img src={formData.imageUrl} alt="Badge Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <label htmlFor="replace-badge-file" className="px-2 py-1 bg-white text-black text-[9px] font-black rounded cursor-pointer hover:bg-slate-100">
                        Replace
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imagePublicId: '' }))}
                        className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white text-[9px] font-black rounded cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <FaCloudUploadAlt size={22} className="text-slate-400 dark:text-slate-500" />
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-350">Drag badge image here or</p>
                    <label htmlFor="badge-image-file" className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-[9px] font-black rounded-lg cursor-pointer hover:bg-slate-200">
                      Browse Files
                    </label>
                  </div>
                )}
                <input type="file" id="badge-image-file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleFileUpload(f, 'image'); }} className="hidden" />
                <input type="file" id="replace-badge-file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) handleFileUpload(f, 'image'); }} className="hidden" />
              </div>

              {uploadingImg && (
                <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                  <div style={{ width: `${imgProgress}%` }} className="bg-primary-blue h-full transition-all duration-300 rounded-full" />
                </div>
              )}
            </div>

            {/* Certificate PDF Upload Block */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Credential PDF File (Local Device)</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOverPdf(true); }}
                onDragLeave={() => setDragOverPdf(false)}
                onDrop={(e) => { e.preventDefault(); setDragOverPdf(false); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file, 'pdf'); }}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragOverPdf ? 'border-primary-purple bg-primary-purple/5' : 'border-slate-250 dark:border-white/10 hover:border-primary-purple/60'
                }`}
              >
                {formData.pdfUrl ? (
                  <div className="flex items-center gap-2">
                    <FaFilePdf size={18} className="text-red-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">PDF Uploaded</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pdfUrl: '' }))}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[9px] font-black rounded border border-red-550/20 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <FaCloudUploadAlt size={22} className="text-slate-400 dark:text-slate-500" />
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-350">Drag certificate PDF here or</p>
                    <label htmlFor="certificate-pdf-file" className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-[9px] font-black rounded-lg cursor-pointer hover:bg-slate-200">
                      Browse Files
                    </label>
                  </div>
                )}
                <input type="file" id="certificate-pdf-file" accept="application/pdf" onChange={(e) => { const f = e.target.files[0]; if (f) handleFileUpload(f, 'pdf'); }} className="hidden" />
              </div>

              {uploadingPdf && (
                <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                  <div style={{ width: `${pdfProgress}%` }} className="bg-primary-purple h-full transition-all duration-300 rounded-full" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-bold border cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FaTimes /> Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish Credential'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-title text-black dark:text-white">Credentials Directory</h3>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search credentials..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs w-44"
              />
              <FaSearch className="absolute left-3 top-2.5 text-slate-400" size={10} />
            </div>
          </div>

          {displayedCerts.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No matching certificates found.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayedCerts.map((c) => (
                <div key={c._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-start gap-4 hover:scale-[1.01] transition-transform duration-350 text-left">
                  {c.image?.url ? (
                    <img src={c.image.url} alt={c.title} className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/5 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-blue/15 text-primary-blue font-bold flex items-center justify-center shrink-0">
                      <FaCertificate />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white truncate">{c.title}</h4>
                        <span className="text-xs text-slate-400">{c.issuer} • {c.date ? new Date(c.date).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-1.5 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                          title="Edit"
                        >
                          <FaEdit size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                          title="Delete"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {c.credentialUrl && (
                        <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary-blue font-bold hover:underline">
                          <FaGlobe /> Verify credential
                        </a>
                      )}
                      {c.pdfUrl && (
                        <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold hover:underline">
                          <FaFilePdf /> Download PDF Certificate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-xs text-slate-650 dark:text-slate-400 disabled:opacity-50 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-slate-400 font-bold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-xs text-slate-650 dark:text-slate-400 disabled:opacity-50 cursor-pointer"
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
  );
};

export default CertificatesManager;
