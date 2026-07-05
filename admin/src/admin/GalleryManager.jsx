import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaImages, FaPlusCircle, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const GalleryManager = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    displayOrder: 0
  });

  const [imageFile, setImageFile] = useState(null);

  const fetchGallery = async () => {
    try {
      const res = await api.getGallery();
      if (res.success) {
        setGallery(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? Number(value) : value
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image file first');
    
    setUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    data.append('image', imageFile);

    try {
      const res = await api.createGalleryItem(data);
      if (res.success) {
        resetForm();
        fetchGallery();
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      displayOrder: 0
    });
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    setLoading(true);
    try {
      const res = await api.deleteGalleryItem(id);
      if (res.success) {
        fetchGallery();
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
      setLoading(false);
    }
  };

  if (loading && gallery.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Media Gallery</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload and manage visual assets, designs, or profile screenshots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            <FaPlusCircle className="text-primary-blue" /> Add Gallery Image
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Asset Title</label>
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Design"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-slate-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaPlusCircle /> Add to Gallery
                </>
              )}
            </button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Gallery Assets</h3>

          {gallery.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No gallery images uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item._id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-250 dark:border-white/5 shadow-sm">
                  <img src={item.image.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center">
                    <h5 className="text-xs font-bold text-white leading-tight mb-1">{item.title}</h5>
                    <span className="text-[9px] text-slate-350 uppercase tracking-widest mb-3">{item.category}</span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
                      title="Delete Image"
                    >
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

export default GalleryManager;
