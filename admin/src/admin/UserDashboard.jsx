import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  FaUserCircle, FaLock, FaHistory, FaGlobe, FaSignOutAlt, 
  FaUserEdit, FaShieldAlt, FaHeart, FaShoppingBag, FaExclamationTriangle, FaUsers 
} from 'react-icons/fa';

const UserDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const clientUrl = (import.meta.env.VITE_CLIENT_URL && import.meta.env.VITE_CLIENT_URL !== 'undefined' && import.meta.env.VITE_CLIENT_URL !== 'null')
    ? import.meta.env.VITE_CLIENT_URL
    : (isLocal ? 'http://localhost:5173' : 'https://tauhidshekhar.vercel.app');

  const [activeTab, setActiveTab] = useState('profile'); // profile, saved, orders, security, history, account
  
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || '');
  
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // History, Bookmarks, and Orders states
  const [history, setHistory] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSavedProjects = async () => {
    try {
      const res = await api.getSavedProjects();
      if (res.success) {
        setSavedProjects(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load bookmarked projects:', err.message);
    }
  };

  const loadUserOrders = async () => {
    try {
      const res = await api.getUserOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err.message);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getProfile();
        if (res.success && res.user) {
          setHistory(res.user.loginHistory || []);
        }
      } catch (err) {
        console.error('Failed to load profile history:', err.message);
      }
    };
    loadProfile();
    loadSavedProjects();
    loadUserOrders();
  }, []);

  useEffect(() => {
    const handleShortcuts = (e) => {
      // Esc -> Back to website
      if (e.key === 'Escape') {
        navigate('/');
      }
      // Alt + H -> Go Home
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigate('/');
      }
      // Alt + D -> Go Dashboard
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/user/dashboard');
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [navigate]);

  const getBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
        <Link to="/" className="hover:text-primary-blue transition-colors">Home</Link>
        <span>/</span>
        <Link to="/user/dashboard" className="hover:text-primary-blue transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-350 uppercase tracking-wider">{activeTab}</span>
      </div>
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('phone', phone);
      formData.append('username', username);
      formData.append('email', email);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await updateProfile(formData);
      if (res.success) {
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Profile update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword, confirmPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveProject = async (projectId) => {
    try {
      const res = await api.toggleSaveProject(projectId);
      if (res.success) {
        setSavedProjects(prev => prev.filter(p => p._id !== projectId));
        setSuccess('Project removed from favorites!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This action is irreversible.')) return;
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        alert('Your account has been deleted successfully.');
        logout();
        navigate('/admin/login');
      }
    } catch (err) {
      setError(err.message || 'Account deletion failed.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row">
      
      {/* User Dashboard Sidebar */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-white/5 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* User profile header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-white/5 mb-6">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-blue/30 mb-3.5">
              {avatarPreview ? (
                <img src={avatarPreview} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="text-slate-400 w-full h-full" />
              )}
            </div>
            <h3 className="text-sm font-black font-title tracking-tight text-black dark:text-white truncate max-w-[200px]">
              {user?.fullName}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-blue/10 text-primary-blue rounded-md border border-primary-blue/20 mt-1 uppercase tracking-wider">
              {user?.role} Profile
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 text-left">
            <button
              onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <FaUserEdit size={14} /> Profile Settings
            </button>
            <button
              onClick={() => { setActiveTab('saved'); setError(''); setSuccess(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <FaHeart size={14} className={activeTab === 'saved' ? 'text-white' : 'text-red-500'} /> Saved Projects
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setError(''); setSuccess(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <FaShoppingBag size={14} /> My Service Orders
            </button>
            <button
              onClick={() => { setActiveTab('security'); setError(''); setSuccess(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <FaShieldAlt size={14} /> Security Settings
            </button>
            <button
              onClick={() => { setActiveTab('history'); setError(''); setSuccess(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <FaHistory size={14} /> Login History
            </button>
            <button
              onClick={() => { setActiveTab('account'); setError(''); setSuccess(''); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/15'
                  : 'text-slate-500 hover:bg-red-500/5 hover:text-red-500'
              }`}
            >
              <FaExclamationTriangle size={14} /> Account Deletion
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-primary-blue transition-colors text-left"
          >
            <FaGlobe /> Live Portfolio Web
          </Link>
          <a
            href={`${clientUrl}/community`}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold text-slate-550 dark:text-slate-400 hover:text-primary-blue transition-colors text-left"
          >
            <FaUsers /> DevCommunity Platform
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 text-left overflow-y-auto max-h-screen">
        <div className="max-w-2xl">
          {/* Breadcrumbs & Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {getBreadcrumbs()}
            <a
              href={clientUrl}
              className="w-fit flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-330 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/5"
            >
              <span>&larr; Back to Website</span>
            </a>
          </div>

          <h2 className="text-2xl font-black font-title tracking-tight text-black dark:text-white mb-1">
            User Workspace
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Manage your personal profile, bookmarks and service orders
          </p>

          {error && (
            <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold leading-relaxed">
              {success}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
              {/* Profile Pic Upload */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle className="text-slate-400 w-full h-full" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <label htmlFor="avatar-file" className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                    Upload Avatar Image
                  </label>
                  <input
                    type="file"
                    id="avatar-file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">PNG, JPG or WEBP up to 5MB</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          )}

          {/* TAB: SAVED PROJECTS */}
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Projects you have favorited from our work index.
              </p>
              {savedProjects.length === 0 ? (
                <div className="border border-dashed border-slate-300 dark:border-white/10 p-8 text-center text-slate-400 rounded-2xl">
                  No favorited projects yet. Browse the main site and click the heart icon on any project card!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedProjects.map(proj => (
                    <div key={proj._id} className="border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-4 flex flex-col gap-3">
                      <div className="w-full aspect-video rounded-xl overflow-hidden">
                        <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-sm text-black dark:text-white leading-snug">{proj.title}</h4>
                        <span className="text-[10px] font-bold text-primary-blue uppercase block mt-0.5">{proj.subtitle}</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <a
                          href={proj.demo || proj.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-lg text-center text-xs font-bold transition-all border border-slate-205/60 dark:border-white/5"
                        >
                          View Live
                        </a>
                        <button
                          onClick={() => handleUnsaveProject(proj._id)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold border border-red-500/20 cursor-pointer"
                        >
                          Unfavorite
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Review and track the status of your submitted service requirements and budget options.
              </p>
              {orders.length === 0 ? (
                <div className="border border-dashed border-slate-300 dark:border-white/10 p-8 text-center text-slate-400 rounded-2xl">
                  You have not submitted any service orders yet. Select a service on the homepage to start!
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.map(order => (
                    <div key={order._id} className="border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-black dark:text-white leading-snug">{order.serviceType}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Submitted: {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          order.status === 'Completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                          order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          order.status === 'Active' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                          order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed">{order.description}</p>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Budget Requirement</span>
                        <span className="text-xs font-black text-primary-blue">{order.budget}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Retype new password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-sm transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer mt-2"
              >
                {loading ? 'Updating Password...' : 'Update Account Password'}
              </button>
            </form>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Review your recent active account login sessions and devices.
              </p>
              
              <div className="border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-150 dark:border-white/5 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        <th className="px-5 py-3">Timestamp</th>
                        <th className="px-5 py-3">Device / OS</th>
                        <th className="px-5 py-3">Browser</th>
                        <th className="px-5 py-3">IP Address</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                      {history.slice(0, 10).map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-black dark:text-white">
                            {log.device} ({log.os})
                          </td>
                          <td className="px-5 py-3.5 text-slate-655 dark:text-slate-350">
                            {log.browser}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-500">
                            {log.ip}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              log.success 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-5 py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                            No login logs recorded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNT DELETION */}
          {activeTab === 'account' && (
            <div className="flex flex-col gap-6">
              <div className="p-5 border border-red-500/25 bg-red-500/5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                  <FaExclamationTriangle /> Danger Zone
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Permanently delete your profile and account settings. This action is irreversible. All your session history and saved bookmarks will be deleted.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-fit px-5 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
                >
                  Delete Account permanently
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
