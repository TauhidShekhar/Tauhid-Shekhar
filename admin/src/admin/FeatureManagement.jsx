import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaToggleOn, 
  FaToggleOff, FaRocket, FaImage, FaCalendarAlt, FaInfoCircle
} from 'react-icons/fa';

const CATEGORIES = ['Portfolio', 'Community', 'ATS Checker', 'AI Suite', 'Services', 'Management'];
const ICONS = ['FaUser', 'FaUsers', 'FaSparkles', 'FaRocket', 'FaBriefcase', 'FaGift', 'FaShieldAlt', 'FaCog'];

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Portfolio');
  const [icon, setIcon] = useState('FaCog');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [loginRequired, setLoginRequired] = useState(false);
  const [isNewFeature, setIsNewFeature] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Fetch all features
  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await api.getAllFeatures();
      if (res.success) {
        setFeatures(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setCategory('Portfolio');
    setIcon('FaCog');
    setDescription('');
    setScreenshotUrl('');
    setVersion('1.0.0');
    setReleaseDate(new Date().toISOString().substring(0, 10));
    setLoginRequired(false);
    setIsNewFeature(true);
    setIsFeatured(false);
    setIsPublished(true);
  };

  const handleEditClick = (feat) => {
    setIsEditing(true);
    setEditId(feat._id);
    setName(feat.name);
    setCategory(feat.category);
    setIcon(feat.icon || 'FaCog');
    setDescription(feat.description);
    setScreenshotUrl(feat.screenshot?.url || '');
    setVersion(feat.version || '1.0.0');
    setReleaseDate(new Date(feat.releaseDate).toISOString().substring(0, 10));
    setLoginRequired(feat.loginRequired);
    setIsNewFeature(feat.isNewFeature);
    setIsFeatured(feat.isFeatured);
    setIsPublished(feat.isPublished);
  };

  const handleTogglePublish = async (feat) => {
    try {
      const res = await api.updateFeature(feat._id, { isPublished: !feat.isPublished });
      if (res.success) {
        setFeatures(prev => prev.map(f => f._id === feat._id ? { ...f, isPublished: !f.isPublished } : f));
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      category,
      icon,
      description,
      screenshot: screenshotUrl ? { url: screenshotUrl, publicId: '' } : undefined,
      version,
      releaseDate: new Date(releaseDate),
      loginRequired,
      isNewFeature,
      isFeatured,
      isPublished
    };

    try {
      if (isEditing) {
        const res = await api.updateFeature(editId, payload);
        if (res.success) {
          setSuccess('Feature updated successfully!');
          resetForm();
          fetchFeatures();
        }
      } else {
        const res = await api.createFeature(payload);
        if (res.success) {
          setSuccess('Feature created successfully!');
          resetForm();
          fetchFeatures();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save feature.');
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feature?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.deleteFeature(id);
      if (res.success) {
        setSuccess('Feature deleted successfully!');
        fetchFeatures();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete feature');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white flex items-center gap-2.5">
            <FaRocket className="text-[#C2272D] dark:text-[#00FFFF]" />
            <span>Feature Flags & Releases</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toggle platform capabilities, control public rollouts, and configure feature metadata.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <FaCheck /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Creator / Editor Form (col-span-5) */}
        <div className="lg:col-span-5 glass border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3 mb-4 flex items-center gap-2">
            <FaRocket className="text-[#C2272D] dark:text-[#00FFFF]" />
            <span>{isEditing ? 'Edit Feature Details' : 'Register New Feature'}</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Feature Name</label>
              <input 
                type="text" 
                required
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ATS Resume Checker"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Icon Selection</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Description</label>
              <textarea 
                required
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a clear short description of this feature..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF] resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Screenshot URL</label>
              <input 
                type="text" 
                value={screenshotUrl} 
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="e.g. /assits/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Version</label>
                <input 
                  type="text" 
                  value={version} 
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Release Date</label>
                <input 
                  type="date" 
                  value={releaseDate} 
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Login Required</span>
                <button
                  type="button"
                  onClick={() => setLoginRequired(!loginRequired)}
                  className="text-lg cursor-pointer"
                >
                  {loginRequired ? <FaToggleOn size={24} className="text-[#00FFFF]" /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Mark as New</span>
                <button
                  type="button"
                  onClick={() => setIsNewFeature(!isNewFeature)}
                  className="text-lg cursor-pointer"
                >
                  {isNewFeature ? <FaToggleOn size={24} className="text-[#00FFFF]" /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Featured</span>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className="text-lg cursor-pointer"
                >
                  {isFeatured ? <FaToggleOn size={24} className="text-[#00FFFF]" /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Published Status</span>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className="text-lg cursor-pointer"
                >
                  {isPublished ? <FaToggleOn size={24} className="text-[#C2272D]" /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 dark:border-white/5 pt-4 mt-1">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-white/10"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#C2272D]/20"
              >
                {isEditing ? 'Save Changes' : 'Publish Feature'}
              </button>
            </div>
          </form>
        </div>

        {/* Features Directory Index Table (col-span-7) */}
        <div className="lg:col-span-7 glass border border-slate-200 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-3 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Registered Features Index ({features.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-16 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-3 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
            </div>
          ) : features.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-xs">
              No features registered yet. Add your first feature above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    <th className="py-2.5 pr-3">Feature Name</th>
                    <th className="py-2.5 pr-3">Category</th>
                    <th className="py-2.5 pr-3">Version</th>
                    <th className="py-2.5 pr-3">Toggle Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {features.map(feat => (
                    <tr key={feat._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{feat.name}</span>
                          {feat.isNewFeature && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-bold uppercase">New</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-500 font-semibold">{feat.category}</td>
                      <td className="py-3 pr-3 font-semibold text-slate-400">v{feat.version}</td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(feat)}
                          className="flex items-center gap-1.5 cursor-pointer text-left"
                          title="Click to toggle published status"
                        >
                          {feat.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ON
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 border border-slate-200 dark:border-white/10 text-[9px] font-bold uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> OFF
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(feat)}
                            className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            title="Edit Feature"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(feat._id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete Feature"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
      
    </div>
  );
};

export default FeatureManagement;
