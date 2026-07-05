import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaBell, FaCheck, FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';

const CommunityNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.getCommunityNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await api.readCommunityNotifications();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <FaHeart className="text-red-500" />;
      case 'comment':
      case 'reply': return <FaComment className="text-primary-blue" />;
      case 'follow': return <FaUserPlus className="text-green-500" />;
      default: return <FaBell className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 max-w-xl mx-auto text-left shadow-sm">
      <div className="border-b border-slate-100 dark:border-white/5 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black font-title text-black dark:text-white flex items-center gap-2">
            <FaBell /> Notifications
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Stay updated on your interactions</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-black dark:hover:text-white rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
        >
          <FaCheck /> Mark all read
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading Notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-500 rounded-3xl">
          You are all caught up! No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${
                notif.read 
                  ? 'bg-slate-50/50 dark:bg-white/2 border-slate-200/40 dark:border-white/2 opacity-75' 
                  : 'bg-primary-blue/5 border-primary-blue/15 shadow-sm'
              }`}
            >
              <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 rounded-xl shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  <span className="font-bold">@{notif.sender?.username}</span>{' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'comment' && 'commented on your thread'}
                  {notif.type === 'reply' && 'replied to your discussion'}
                  {notif.type === 'follow' && 'started following you'}
                  {notif.post && <span className="font-bold"> "{notif.post.title}"</span>}
                </p>
                <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase">
                  {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CommunityNotifications;
