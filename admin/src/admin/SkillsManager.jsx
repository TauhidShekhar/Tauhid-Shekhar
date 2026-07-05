import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaTrash, FaEdit, FaPlusCircle, FaTimes, FaCheck } from 'react-icons/fa';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 80,
    category: 'frontend',
    displayOrder: 0
  });

  const categories = [
    { id: 'programming', name: 'Programming' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'database', name: 'Database' },
    { id: 'tools', name: 'Tools' },
    { id: 'concepts', name: 'Concepts' }
  ];

  const fetchSkills = async () => {
    try {
      const res = await api.getSkills();
      if (res.success) {
        setSkills(res.data);
      }
    } catch (err) {
      console.error('Error fetching skills list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentage' || name === 'displayOrder' ? Number(value) : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const res = await api.updateSkill(currentId, formData);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          setFormData({ name: '', percentage: 80, category: 'frontend', displayOrder: 0 });
          fetchSkills();
        }
      } else {
        const res = await api.createSkill(formData);
        if (res.success) {
          setFormData({ name: '', percentage: 80, category: 'frontend', displayOrder: 0 });
          fetchSkills();
        }
      }
    } catch (err) {
      alert(err.message || 'Action failed');
      setLoading(false);
    }
  };

  const handleEditClick = (skill) => {
    setIsEditing(true);
    setCurrentId(skill._id);
    setFormData({
      name: skill.name,
      percentage: skill.percentage,
      category: skill.category,
      displayOrder: skill.displayOrder || 0
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    setLoading(true);
    try {
      const res = await api.deleteSkill(id);
      if (res.success) {
        fetchSkills();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', percentage: 80, category: 'frontend', displayOrder: 0 });
  };

  if (loading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white">Skills Manager</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, update, or remove portfolio technical skills.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-4 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Technical Skill' : 'Create New Skill'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            {/* Skill Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skill Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. React.js, Express.js"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Percentage */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="percentage" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expertise Percentage</label>
                <span className="text-sm font-extrabold text-primary-blue">{formData.percentage}%</span>
              </div>
              <input
                type="range"
                id="percentage"
                name="percentage"
                min="0"
                max="100"
                value={formData.percentage}
                onChange={handleInputChange}
                className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Display Order */}
            <div className="flex flex-col gap-2">
              <label htmlFor="displayOrder" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Display Sorting Order</label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex gap-3 mt-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-center text-sm font-bold border border-slate-200 dark:border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FaTimes /> Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-center text-sm font-bold shadow-lg shadow-primary-blue/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FaCheck /> {isEditing ? 'Save Changes' : 'Publish Skill'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Skills List */}
        <div className="lg:col-span-8 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Skills Directory</h3>

          {skills.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-450 dark:text-slate-400">
              No skills published yet. Complete the form to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-250 dark:border-white/5 text-slate-500 dark:text-slate-450 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">Order</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Percentage</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-white/5 text-sm">
                  {skills.map((skill) => (
                    <tr key={skill._id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-slate-400">{skill.displayOrder || 0}</td>
                      <td className="py-4 font-bold text-black dark:text-white">{skill.name}</td>
                      <td className="py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">
                          {skill.category}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3 w-32">
                          <span className="font-extrabold text-primary-blue shrink-0 w-8">{skill.percentage}%</span>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-blue" style={{ width: `${skill.percentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEditClick(skill)}
                            className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                            title="Edit"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(skill._id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                            title="Delete"
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

export default SkillsManager;
