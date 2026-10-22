import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaSave, FaCog, FaSun, FaMoon } from 'react-icons/fa';

const ThemeSettings = () => {
  const [theme, setTheme] = useState({
    defaultMode: 'dark',
    primaryColor: '#C2272D'
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
            primaryColor: res.data.theme?.primaryColor || '#C2272D'
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
      const settingsRes = await api.getSettings();
      if (settingsRes.success && settingsRes.data) {
        const updatedSettings = {
          ...settingsRes.data,
          theme
        };
        const res = await api.updateSettings(updatedSettings);
        if (res.success) {
          setSuccess('Theme configurations saved successfully!');
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update theme settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-left animate-fade-in max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white flex items-center gap-2.5">
          <FaCog className="text-[#C2272D] dark:text-[#00FFFF]" />
          <span>Theme Configurations</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure site brand defaults, primary accent colors, and global visual tokens.
        </p>
      </div>

      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm max-w-[560px]">
        <h3 className="text-base font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
          <FaCog className="text-[#C2272D] dark:text-[#00FFFF]" />
          <span>Layout Styling & Default Accents</span>
        </h3>

        {success && (
          <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            {success}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-xs">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Default Platform Mode
            </label>
            <select
              name="defaultMode"
              value={theme.defaultMode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="dark">Dark Theme (Default TS Cyan & Red)</option>
              <option value="light">Light Theme (Clean Crisp Surfaces)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="primaryColor"
                value={theme.primaryColor}
                onChange={handleInputChange}
                className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                name="primaryColor"
                value={theme.primaryColor}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-fit px-8 py-3 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl font-bold shadow-md shadow-[#C2272D]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaSave /> <span>Save Theme Settings</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ThemeSettings;
