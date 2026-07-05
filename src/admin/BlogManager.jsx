import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaBook, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes, FaGlobe } from 'react-icons/fa';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: ''
  });

  const [coverImageFile, setCoverImageFile] = useState(null);

  const fetchBlogs = async () => {
    try {
      const res = await api.getBlogs();
      if (res.success) {
        setBlogs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setCoverImageFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (coverImageFile) {
      data.append('coverImage', coverImageFile);
    }

    try {
      if (isEditing) {
        const res = await api.updateBlog(currentId, data);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchBlogs();
        }
      } else {
        const res = await api.createBlog(data);
        if (res.success) {
          resetForm();
          fetchBlogs();
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
      content: '',
      excerpt: '',
      category: '',
      tags: '',
      status: 'draft',
      metaTitle: '',
      metaDescription: ''
    });
    setCoverImageFile(null);
  };

  const handleEditClick = (blog) => {
    setIsEditing(true);
    setCurrentId(blog._id);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || '',
      category: blog.category || '',
      tags: (blog.tags || []).join(', '),
      status: blog.status || 'draft',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || ''
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setLoading(true);
    try {
      const res = await api.deleteBlog(id);
      if (res.success) {
        fetchBlogs();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Blog Manager</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publish and edit technical articles on your portfolio site.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Blog Post' : 'Write New Article'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Article Title</label>
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Excerpt (Brief info)</label>
              <input
                type="text"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Content body</label>
              <textarea
                name="content"
                rows="6"
                value={formData.content}
                onChange={handleInputChange}
                required
                placeholder="Write rich HTML or text articles..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
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
                  placeholder="e.g. React"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g. webdev, javascript, coding"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Cover Image file</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500"
              />
            </div>

            <div className="flex gap-3 mt-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-bold border cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FaTimes /> Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FaCheck /> {isEditing ? 'Save changes' : 'Publish post'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Articles Index</h3>

          {blogs.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No articles written yet. Write one to publish.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {blogs.map((b) => (
                <div key={b._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-start gap-4 hover:scale-[1.01] transition-transform duration-350">
                  {b.coverImage?.url && (
                    <img src={b.coverImage.url} alt={b.title} className="w-20 aspect-[16/9] rounded-lg object-cover border border-slate-200 dark:border-white/5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white truncate">{b.title}</h4>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'} uppercase tracking-wider`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                          title="Edit"
                        >
                          <FaEdit size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(b._id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                          title="Delete"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
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

export default BlogManager;
