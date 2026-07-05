import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaAward, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const EducationManager = () => {
  const [edus, setEdus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    degree: '',
    school: '',
    duration: '',
    grade: '',
    description: '',
    displayOrder: 0
  });

  const fetchEdus = async () => {
    try {
      const res = await api.getEducation();
      if (res.success) {
        setEdus(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching education records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdus();
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

    try {
      if (isEditing) {
        const res = await api.updateEducation(currentId, formData);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchEdus();
        }
      } else {
        const res = await api.createEducation(formData);
        if (res.success) {
          resetForm();
          fetchEdus();
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      degree: '',
      school: '',
      duration: '',
      grade: '',
      description: '',
      displayOrder: 0
    });
  };

  const handleEditClick = (e) => {
    setIsEditing(true);
    setCurrentId(e._id);
    setFormData({
      degree: e.degree,
      school: e.school,
      duration: e.duration,
      grade: e.grade || '',
      description: e.description || '',
      displayOrder: e.displayOrder || 0
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    try {
      const res = await api.deleteEducation(id);
      if (res.success) {
        fetchEdus();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  if (loading && edus.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Education Details</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage academic qualifications, degrees, and institutions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Qualification' : 'Add Qualification'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Degree/Certificate Name</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                required
                placeholder="e.g. Bachelor of Science"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Institute/University/Board</label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                required
                placeholder="e.g. XYZ University"
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
                  placeholder="e.g. 2020 - 2024"
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Grade/Score (Optional)</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                placeholder="e.g. 85%, GPA 8.5"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Description (Optional)</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
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
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish record'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Timeline Directory</h3>

          {edus.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No education records added yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {edus.map((e) => (
                <div key={e._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-start gap-4 hover:scale-[1.01] transition-transform duration-350 text-left">
                  <div className="w-10 h-10 rounded-full bg-primary-purple/15 text-primary-purple font-bold flex items-center justify-center shrink-0">
                    <FaAward />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-black dark:text-white truncate">{e.degree}</h4>
                        <span className="text-xs text-slate-400">{e.school} • {e.duration}</span>
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

export default EducationManager;
