import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaLaptopCode, FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes, FaServer, FaReact, FaPaintBrush } from 'react-icons/fa';

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    price: '',
    featuresInput: '',
    iconName: 'FaLaptopCode',
    displayOrder: 0
  });

  const icons = [
    { name: 'Laptop & Code', value: 'FaLaptopCode' },
    { name: 'React & Frontend', value: 'FaReact' },
    { name: 'Server & Backend', value: 'FaServer' },
    { name: 'Paint & Design', value: 'FaPaintBrush' }
  ];

  const fetchServices = async () => {
    try {
      const res = await api.getServices();
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
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

    const features = formData.featuresInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const submissionData = {
      title: formData.title,
      desc: formData.desc,
      price: formData.price,
      features,
      iconName: formData.iconName,
      displayOrder: formData.displayOrder
    };

    try {
      if (isEditing) {
        const res = await api.updateService(currentId, submissionData);
        if (res.success) {
          setIsEditing(false);
          setCurrentId(null);
          resetForm();
          fetchServices();
        }
      } else {
        const res = await api.createService(submissionData);
        if (res.success) {
          resetForm();
          fetchServices();
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
      desc: '',
      price: '',
      featuresInput: '',
      iconName: 'FaLaptopCode',
      displayOrder: 0
    });
  };

  const handleEditClick = (s) => {
    setIsEditing(true);
    setCurrentId(s._id);
    setFormData({
      title: s.title,
      desc: s.desc || '',
      price: s.price || '',
      featuresInput: (s.features || []).join('\n'),
      iconName: s.iconName || 'FaLaptopCode',
      displayOrder: s.displayOrder || 0
    });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setLoading(true);
    try {
      const res = await api.deleteService(id);
      if (res.success) {
        fetchServices();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
      setLoading(false);
    }
  };

  const getIconElement = (iconName) => {
    switch (iconName) {
      case 'FaLaptopCode': return <FaLaptopCode className="text-primary-blue" size={16} />;
      case 'FaReact': return <FaReact className="text-primary-cyan" size={16} />;
      case 'FaServer': return <FaServer className="text-primary-purple" size={16} />;
      case 'FaPaintBrush': return <FaPaintBrush className="text-pink-500" size={16} />;
      default: return <FaLaptopCode className="text-primary-blue" size={16} />;
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Services Manager</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure development packages, consulting prices, and features.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-primary-purple" /> : <FaPlusCircle className="text-primary-blue" />}
            {isEditing ? 'Edit Service' : 'Add Service'}
          </h3>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Service Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. MERN Stack Web Development"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Description</label>
              <textarea
                name="desc"
                rows="3"
                value={formData.desc}
                onChange={handleInputChange}
                required
                placeholder="Brief summary of the package..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Starting Price</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. $149"
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
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Visual Icon</label>
              <select
                name="iconName"
                value={formData.iconName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
              >
                {icons.map(ic => (
                  <option key={ic.value} value={ic.value}>{ic.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Service Features (One per line)</label>
              <textarea
                name="featuresInput"
                rows="4"
                value={formData.featuresInput}
                onChange={handleInputChange}
                placeholder="JWT Authentication&#10;MongoDB Schema Design&#10;REST API Integration"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-primary-blue/15 transition-all flex items-center justify-center gap-1.5"
              >
                <FaCheck /> {isEditing ? 'Update Service' : 'Create Service'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-slate-150 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl font-bold text-xs cursor-pointer border border-slate-200 dark:border-white/5"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List of Services */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {services.length === 0 ? (
            <div className="glass p-8 text-center text-slate-400 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
              No services found. Add your first service package.
            </div>
          ) : (
            services.map(s => (
              <div key={s._id} className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 text-left">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shadow-inner mt-1">
                    {getIconElement(s.iconName)}
                  </div>
                  <div>
                    <h4 className="font-bold font-title text-black dark:text-white">{s.title}</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-bold px-2.5 py-1 bg-primary-blue/10 text-primary-blue rounded-md">
                        {s.price}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Order: {s.displayOrder}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEditClick(s)}
                    className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                    title="Edit Service"
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(s._id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                    title="Delete Service"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesManager;
