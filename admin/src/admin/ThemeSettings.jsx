import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaSave, FaCog } from 'react-icons/fa';

const ThemeSettings = () => {
  const [theme, setTheme] = useState({
    defaultMode: 'dark',
    primaryColor: '#0071e3'
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setTheme({
            defaultMode: res.data.theme?.defaultMode || 'dark',
            primaryColor: res.data.theme?.primaryColor || '#0071e3'
          });
        }
      } catch (err) {
        console.error('Failed to load theme settings:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTheme(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLoading(true);

    try {
      // Fetch setting first
      const settingsRes = await api.getSettings();
      if (settingsRes.success && settingsRes.data) {
        const updatedSettings = {
          ...settingsRes.data,
          theme
        };
        const res = await api.updateSettings(updatedSettings);
        if (res.success) {
          setSuccess('Theme settings updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update theme settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && theme.primaryColor === '') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Theme Configurations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure site defaults, primary accent colors, and CSS tokens.</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm max-w-[500px]">
        <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
          <FaCog className="text-primary-blue" /> Layout Styling & Accents
        </h3>

        {success && (
          <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
            {success}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-xs">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">Default Theme Mode</label>
            <select
              name="defaultMode"
              value={theme.defaultMode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="dark">Force Dark Mode</option>
              <option value="light">Force Light Mode</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">Accent Theme Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="primaryColor"
                value={theme.primaryColor}
                onChange={handleInputChange}
                className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/5 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                name="primaryColor"
                value={theme.primaryColor}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaSave /> Save Theme settings
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ThemeSettings;
