import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  FaGraduationCap,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSearch,
  FaCertificate,
  FaTrophy,
  FaUniversity,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaExternalLinkAlt,
  FaCheckCircle
} from 'react-icons/fa';

const EducationManager = () => {
  const [edus, setEdus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    degree: '',
    school: '',
    duration: '',
    status: 'Completed',
    fieldOfStudy: '',
    location: '',
    grade: '',
    honors: '',
    link: '',
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
    setFormData((prev) => ({
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
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      degree: '',
      school: '',
      duration: '',
      status: 'Completed',
      fieldOfStudy: '',
      location: '',
      grade: '',
      honors: '',
      link: '',
      description: '',
      displayOrder: 0
    });
  };

  const handleEditClick = (e) => {
    setIsEditing(true);
    setCurrentId(e._id);
    setFormData({
      degree: e.degree || '',
      school: e.school || '',
      duration: e.duration || '',
      status: e.status || 'Completed',
      fieldOfStudy: e.fieldOfStudy || '',
      location: e.location || '',
      grade: e.grade || '',
      honors: e.honors || '',
      link: e.link || '',
      description: e.description || '',
      displayOrder: e.displayOrder || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) return;
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

  const filteredEdus = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return edus;
    return edus.filter(
      (e) =>
        e.degree?.toLowerCase().includes(q) ||
        e.school?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.grade?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [edus, search]);

  return (
    <div className="flex flex-col gap-8 text-left font-['Inter']">
      
      {/* ==================== 1. ACADEMIC & HONORS SUITE NAVIGATION ==================== */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2272D] mb-1">
            <FaGraduationCap size={14} />
            <span>Academic & Honors Management Suite</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-['Manrope'] text-slate-900 dark:text-white">
            Academic Qualifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage degrees, universities, examination boards, percentages, and coursework details.
          </p>
        </div>

        {/* Quick Suite Jump Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto overflow-x-auto">
          <Link
            to="/admin/education"
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-[#C2272D] text-white shadow-sm whitespace-nowrap"
          >
            <FaGraduationCap size={13} />
            <span>Education</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25">{edus.length}</span>
          </Link>

          <Link
            to="/admin/certificates"
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            <FaCertificate size={12} />
            <span>Certifications</span>
          </Link>

          <Link
            to="/admin/achievements"
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            <FaTrophy size={12} />
            <span>Achievements</span>
          </Link>
        </div>
      </div>

      {/* ==================== 2. MAIN LAYOUT: FORM & DIRECTORY ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FORM (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black font-['Manrope'] text-slate-900 dark:text-white flex items-center gap-2">
              {isEditing ? <FaEdit className="text-[#C2272D]" /> : <FaPlusCircle className="text-[#C2272D]" />}
              <span>{isEditing ? 'Edit Qualification' : 'Add New Qualification'}</span>
            </h3>
            {isEditing && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Editing Record
              </span>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Degree Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Degree / Board Qualification *
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleInputChange}
                required
                placeholder="e.g. Bachelor of Computer Applications (BCA)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D] transition-colors"
              />
            </div>

            {/* School / Institute */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Institute / University / Board *
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                required
                placeholder="e.g. Global Group of Institutes, Amritsar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D] transition-colors"
              />
            </div>

            {/* Duration & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Duration / Passing Year *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 2023 - 2026 or 2023"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Academic Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pursuing (In Progress)">Pursuing (In Progress)</option>
                  <option value="Pursuing (Final Year)">Pursuing (Final Year)</option>
                </select>
              </div>
            </div>

            {/* Grade & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Grade / CGPA / Percentage
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="e.g. CGPA: 8.5 / 10 or 77.8%"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Campus / City Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Amritsar, Punjab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
                />
              </div>
            </div>

            {/* Field of Study & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Major / Field of Study
                </label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Applications"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
                />
              </div>
            </div>

            {/* Institution / Board Website Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Official Institution Link (Optional)
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D]"
              />
            </div>

            {/* Description / Coursework */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Description / Core Coursework
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mention key subjects, project topics, or academic achievements..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#C2272D] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-[#C2272D] hover:bg-[#a81f25] text-white rounded-xl text-xs font-bold shadow-md shadow-[#C2272D]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <FaCheck />
                <span>{isEditing ? 'Save Changes' : 'Publish Qualification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* DIRECTORY LIST (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <FaSearch size={12} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search qualifications by degree, institute, grade..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#C2272D]"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {filteredEdus.length} of {edus.length}
            </span>
          </div>

          {/* Cards List */}
          {filteredEdus.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <FaGraduationCap size={36} className="mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">No qualifications found</h4>
              <p className="text-xs text-slate-500 mt-1">Add your first qualification using the form.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEdus.map((e) => (
                <div
                  key={e._id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-[#C2272D] border border-rose-500/20">
                          {e.status || 'Academic'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <FaCalendarAlt size={10} className="text-[#C2272D]" />
                          <span>{e.duration}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-black font-['Manrope'] text-slate-900 dark:text-white">
                        {e.degree}
                      </h4>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <FaUniversity size={11} className="text-slate-400" />
                        <span>{e.school}</span>
                        {e.location && (
                          <span className="text-slate-400 text-[11px]">({e.location})</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditClick(e)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#C2272D] hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(e._id)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-500 transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Highlights row */}
                  {e.grade && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-extrabold w-fit">
                      <FaStar size={10} className="text-amber-500" />
                      <span>{e.grade}</span>
                    </div>
                  )}

                  {e.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                      {e.description}
                    </p>
                  )}
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
