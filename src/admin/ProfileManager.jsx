import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaSave } from 'react-icons/fa';

const ProfileManager = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLoading(true);

    const data = new FormData();
    data.append('fullName', fullName);
    data.append('phone', phone);
    if (avatarFile) {
      data.append('avatar', avatarFile);
    }

    try {
      const res = await updateProfile(data);
      if (res.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Profile Manager</h2>
        <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">Configure your personal contact card and dashboard avatar.</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm max-w-[500px]">
        {success && (
          <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
          <div className="flex items-center gap-4 mb-4">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border border-slate-250 dark:border-white/5" />
            ) : (
              <FaUserCircle className="text-slate-400" size={64} />
            )}
            <div className="flex flex-col gap-1.5">
              <span className="font-bold text-slate-550 dark:text-slate-455 uppercase">Update Avatar</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-slate-500 cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-550 dark:text-slate-455 uppercase">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
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
                <FaSave /> Save profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileManager;
