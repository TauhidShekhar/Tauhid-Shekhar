import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FaFolderOpen, FaPlus, FaDownload, FaSearch, FaFileAlt } from 'react-icons/fa';

const CommunityResources = () => {
  const { user } = useAuth();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCreator, setShowCreator] = useState(false);

  // Upload state variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('');
  const [tags, setTags] = useState('');

  const categories = ['All', 'Cheat Sheets', 'Source Code', 'PDF Ebooks', 'Lecture Notes', 'ZIP Packages'];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      
      const res = await api.getCommunityResources(params);
      if (res.success) {
        setResources(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      const sizeInBytes = parseInt(fileSize, 10) * 1024 * 1024 || 2 * 1024 * 1024; // default 2MB
      const res = await api.uploadCommunityResource({
        title,
        description,
        fileUrl,
        fileType,
        fileSize: sizeInBytes,
        category: category === 'All' || !category ? 'Cheat Sheets' : category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });

      if (res.success) {
        setResources(prev => [res.data, ...prev]);
        setShowCreator(false);
        setTitle('');
        setDescription('');
        setFileUrl('');
        setFileSize('');
        setTags('');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleDownload = async (resourceId, downloadUrl) => {
    try {
      const res = await api.downloadCommunityResource(resourceId);
      if (res.success) {
        setResources(prev => prev.map(r => r._id === resourceId ? { ...r, downloadsCount: res.downloads } : r));
        window.open(downloadUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-5 rounded-3xl shadow-sm text-left">
        <div>
          <h2 className="text-lg font-black font-title text-black dark:text-white">Resource Center</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Share notes, templates & ZIP libraries</p>
        </div>
        {!showCreator && (
          <button
            onClick={() => setShowCreator(true)}
            className="px-5 py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <FaPlus /> Share File
          </button>
        )}
      </div>

      {/* Upload file dialog */}
      {showCreator && (
        <form onSubmit={handleUploadSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] flex flex-col gap-4 text-left shadow-md">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
            <h4 className="text-sm font-black font-title text-black dark:text-white">Share Resource Document</h4>
            <button 
              type="button" 
              onClick={() => setShowCreator(false)}
              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Git Commands Cheat Sheet"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Download URL</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                required
                placeholder="https://example.com/sheet.pdf"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Type</label>
              <input
                type="text"
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                required
                placeholder="e.g. PDF, ZIP, JS"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Size (MB)</label>
              <input
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                required
                placeholder="e.g. 5"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="git, cheatsheet"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="What content is inside this shared file resource?"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Upload Resource
          </button>
        </form>
      )}

      {/* Filter and search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-blue transition-colors"
          />
          <button onClick={fetchResources} className="absolute top-2.5 right-3 text-slate-400 hover:text-primary-blue text-xs font-bold">Go</button>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                (category === c || (c === 'All' && !category)) 
                  ? 'bg-primary-blue border-primary-blue text-white' 
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-350'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Resources timeline grids */}
      {loading ? (
        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 rounded-3xl">
          No resources uploaded yet. Share a document or package with the community!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map(res => (
            <div key={res._id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-left">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="p-3.5 bg-primary-blue/10 text-primary-blue border border-primary-blue/20 rounded-2xl shrink-0">
                    <FaFileAlt size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-black dark:text-white leading-snug truncate">{res.title}</h3>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">
                      Shared by @{res.uploadedBy?.username || 'Host'} • {res.category}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4 line-clamp-3">
                  {res.description}
                </p>
                {res.tags && res.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {res.tags.map(t => (
                      <span key={t} className="text-[8px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-white/5 rounded-md text-slate-500 dark:text-slate-500 border border-slate-100">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {res.fileType} • {Math.round((res.fileSize || 0) / (1024 * 1024) * 10) / 10} MB
                </span>
                <button
                  onClick={() => handleDownload(res._id, res.fileUrl)}
                  className="px-4 py-2 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FaDownload size={10} /> Download ({res.downloadsCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CommunityResources;
