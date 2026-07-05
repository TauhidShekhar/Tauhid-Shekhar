import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaHistory, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ExperienceManager = () => {
  const [exps, setExps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    duration: '',
    description: '',
    pointsInput: '',
    type: 'development',
    displayOrder: 0
  });

  const fetchExps = async () => {
    try {
      const res = await api.getExperience();
      if (res.success) {
        setExps(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching experiences:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExps();
  }, []);

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

    const points = formData.pointsInput.split('\n').map(p => p.trim()).filter(Boolean);
    const submissionData = {
      role: formData.role,
      company: formData.company,
      duration: formData.duration,
      description: formData.description,
      points,
      type: formData.type,
      displayOrder: formData.displayOrder
    };

    try {
      if (isEditing) {
        const res = await api.updateExperience(currentId, submissionData);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchExps();
        }
      } else {
        const res = await api.createExperience(submissionData);
        if (res.success) {
          resetForm();
          fetchExps();
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      role: '',
      company: '',
      duration: '',
      description: '',
      pointsInput: '',
      type: 'development',
      displayOrder: 0
    });
  };

  const handleEditClick = (e) => {
    setIsEditing(true);
    setCurrentId(e._id);
    setFormData({
      role: e.role,
      company: e.company,
      duration: e.duration,
      description: e.description || '',
      pointsInput: (e.points || []).join('\n'),
      type: e.type || 'development',
      displayOrder: e.displayOrder || 0
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    setLoading(true);
    try {
      const res = await api.deleteExperience(id);
      if (res.success) {
        fetchExps();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  if (loading && exps.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Work Experience</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your employment timeline, job roles, and contributions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Position' : 'Add Position'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Role/Position</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                placeholder="e.g. Frontend Developer"
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
                required
                placeholder="e.g. Google"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 2024 - Present"
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
              >
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Short description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Contributions (one per line)</label>
              <textarea
                name="pointsInput"
                rows="4"
                value={formData.pointsInput}
                onChange={handleInputChange}
                placeholder="Built responsive CMS layouts&#10;Integrated REST API routes"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
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
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish Position'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Positions Directory</h3>

          {exps.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No positions added yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exps.map((e) => (
                <div key={e._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-start gap-4 hover:scale-[1.01] transition-transform duration-350 text-left">
                  <div className="w-10 h-10 rounded-full bg-primary-blue/15 text-primary-blue font-bold flex items-center justify-center shrink-0">
                    <FaHistory />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white truncate">{e.role}</h4>
                        <span className="text-xs text-slate-400">{e.company} • {e.duration}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditClick(e)}
                          className="p-1.5 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                          title="Edit"
                        >
                          <FaEdit size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(e._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
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

export default ExperienceManager;
