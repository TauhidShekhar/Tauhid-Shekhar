import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaImages, FaTrash, FaUpload, FaSearch, FaFilePdf, FaFileVideo, FaFileArchive, FaFileAlt } from 'react-icons/fa';

const MediaLibrary = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchMedia = async () => {
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (search) params.search = search;

      const res = await api.getMedia(params);
      if (res.success) {
        setMediaList(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching media:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filterType, search]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Select a file to upload first.');

    setUploading(true);
    const data = new FormData();
    data.append('file', selectedFile);

    try {
      const res = await api.uploadMedia(data);
      if (res.success) {
        setSelectedFile(null);
        e.target.reset();
        fetchMedia();
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file permanently?')) return;
    setLoading(true);
    try {
      const res = await api.deleteMedia(id);
      if (res.success) {
        fetchMedia();
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === 'image') return <FaImages className="text-primary-blue" />;
    if (type === 'video') return <FaFileVideo className="text-primary-purple" />;
    if (type === 'pdf') return <FaFilePdf className="text-red-500" />;
    if (type === 'archive') return <FaFileArchive className="text-yellow-600" />;
    return <FaFileAlt className="text-slate-400" />;
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Media Library</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Universal file repository supporting images, videos, and PDFs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload box */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            <FaUpload className="text-primary-blue" /> Upload Resource
          </h3>
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <input type="file" onChange={handleFileChange} required className="text-xs text-slate-500 cursor-pointer" />
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Upload File'
              )}
            </button>
          </form>
        </div>

        {/* Browser */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-405">
                <FaSearch size={12} />
              </span>
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none"
              />
            </div>
            
            {/* Filter */}
            <div className="flex gap-2">
              {['all', 'image', 'video', 'pdf', 'document', 'archive'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer border transition-colors ${
                    filterType === type 
                      ? 'bg-primary-blue border-primary-blue text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-550 dark:text-slate-405'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {loading && mediaList.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
            </div>
          ) : mediaList.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No media files match your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaList.map((m) => (
                <div key={m._id} className="p-3.5 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{getIcon(m.fileType)}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-black dark:text-white truncate">{m.fileName}</h4>
                      <span className="text-[9px] text-slate-400 block uppercase mt-0.5">
                        {m.fileType} • {(m.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 text-[9px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20 rounded-md">
                      Open
                    </a>
                    <button onClick={() => handleDelete(m._id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg cursor-pointer">
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
