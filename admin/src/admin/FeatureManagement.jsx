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
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-left">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">Feature Management</h1>
          <p className="text-xs text-slate-400 mt-1">Add, edit, publish, and toggle release updates for onboarding discovery tour workflows.</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 border border-red-550/20 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <FaInfoCircle /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 text-green-500 border border-green-550/20 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <FaCheck /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Creator / Editor Form (col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
            {isEditing ? 'Edit Feature Details' : 'Register New Feature'}
          </h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Feature Name</label>
              <input 
                type="text" 
                required
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ATS Resume Checker"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Icon Selection</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                >
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Description</label>
              <textarea 
                required
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a clear short description of this feature..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Screenshot URL</label>
              <input 
                type="text" 
                value={screenshotUrl} 
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="e.g. http://localhost:5000/uploads/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Version</label>
                <input 
                  type="text" 
                  value={version} 
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Release Date</label>
                <input 
                  type="date" 
                  value={releaseDate} 
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Login Required</span>
                <button
                  type="button"
                  onClick={() => setLoginRequired(!loginRequired)}
                  className="text-lg text-purple-650 cursor-pointer"
                >
                  {loginRequired ? <FaToggleOn size={24} /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Mark as New</span>
                <button
                  type="button"
                  onClick={() => setIsNewFeature(!isNewFeature)}
                  className="text-lg text-purple-650 cursor-pointer"
                >
                  {isNewFeature ? <FaToggleOn size={24} /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Featured</span>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className="text-lg text-purple-650 cursor-pointer"
                >
                  {isFeatured ? <FaToggleOn size={24} /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Published</span>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className="text-lg text-purple-650 cursor-pointer"
                >
                  {isPublished ? <FaToggleOn size={24} /> : <FaToggleOff size={24} className="text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 dark:border-white/5 pt-4 mt-1">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Publish Feature'}
              </button>
            </div>
          </form>
        </div>

        {/* Features Directory Index Table (col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm overflow-hidden">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
            Published Features Index ({features.length})
          </h2>

          {loading ? (
            <div className="p-16 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-3 border-purple-500/20 border-t-purple-500 animate-spin" />
            </div>
          ) : features.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-xs">
              No features registered yet. Add your first feature above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] text-slate-450 uppercase font-black tracking-wider">
                    <th className="py-2.5 pr-3">Feature Name</th>
                    <th className="py-2.5 pr-3">Category</th>
                    <th className="py-2.5 pr-3">Version</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map(feat => (
                    <tr key={feat._id} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-3 font-bold text-slate-900 dark:text-white">{feat.name}</td>
                      <td className="py-3 pr-3 text-slate-500 font-semibold">{feat.category}</td>
                      <td className="py-3 pr-3 font-semibold text-slate-400">v{feat.version}</td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {feat.isPublished ? (
                            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[8px] font-bold uppercase">Pub</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-550/10 text-slate-455 text-[8px] font-bold uppercase">Draft</span>
                          )}
                          {feat.isNewFeature && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-650/15 text-purple-400 text-[8px] font-bold uppercase">New</span>
                          )}
                          {feat.loginRequired && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-655/15 text-slate-500 text-[8px] font-bold uppercase">Lock</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(feat)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                            title="Edit Feature"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(feat._id)}
                            className="p-1.5 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
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
