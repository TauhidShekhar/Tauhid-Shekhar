import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaQuoteLeft, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    rating: 5,
    content: '',
    featured: false,
    displayOrder: 0
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const res = await api.getTestimonials();
      if (res.success) {
        setTestimonials(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'rating' || name === 'displayOrder' 
          ? Number(value) 
          : value
    }));
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    try {
      if (isEditing) {
        const res = await api.updateTestimonial(currentId, data);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchTestimonials();
        }
      } else {
        const res = await api.createTestimonial(data);
        if (res.success) {
          resetForm();
          fetchTestimonials();
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      company: '',
      rating: 5,
      content: '',
      featured: false,
      displayOrder: 0
    });
    setAvatarFile(null);
  };

  const handleEditClick = (t) => {
    setIsEditing(true);
    setCurrentId(t._id);
    setFormData({
      name: t.name,
      role: t.role || '',
      company: t.company || '',
      rating: t.rating || 5,
      content: t.content,
      featured: t.featured || false,
      displayOrder: t.displayOrder || 0
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setLoading(true);
    try {
      const res = await api.deleteTestimonial(id);
      if (res.success) {
        fetchTestimonials();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Testimonials Manager</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage feedback, client endorsements, and review ratings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Testimonial' : 'Add Testimonial'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Client Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Role/Position</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g. CEO"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Google"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Rating (1-5)</label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleInputChange}
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Feedback Content</label>
              <textarea
                name="content"
                rows="4"
                value={formData.content}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-slate-350"
                />
                <label htmlFor="featured" className="text-xs font-bold text-slate-500">Featured Review</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Client Photo (Avatar)</label>
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
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish Testimonial'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Endorsements List</h3>

          {testimonials.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No testimonials created yet. Add one to show client feedback.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {testimonials.map((t) => (
                <div key={t._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-start gap-4 hover:scale-[1.01] transition-transform duration-350 text-left">
                  {t.avatar?.url ? (
                    <img src={t.avatar.url} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-white/5 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-blue/15 text-primary-blue font-bold flex items-center justify-center shrink-0">
                      {t.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white">{t.name}</h4>
                        <span className="text-xs text-slate-400">{t.role} at {t.company}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="p-1.5 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                          title="Edit"
                        >
                          <FaEdit size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                          title="Delete"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-350 mt-2 line-clamp-2 italic leading-relaxed">
                      "{t.content}"
                    </p>
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

export default TestimonialsManager;
