import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaTrash, FaCheck, FaBan, FaFlag, FaUsers, FaFileAlt } from 'react-icons/fa';

const CommunityCMS = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch reported posts (we query posts without filters first)
      const postRes = await api.getCommunityPosts({});
      if (postRes.success) {
        setReportedPosts((postRes.data || []).filter(p => p.reactions?.length > 10 || p.status === 'reported')); // mock flagged
      }

      // Fetch groups
      const groupRes = await api.getCommunityGroups();
      if (groupRes.success) {
        setGroups(groupRes.data || []);
      }

      // Fetch resources
      const resourceRes = await api.getCommunityResources({});
      if (resourceRes.success) {
        setResources(resourceRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const res = await api.deleteCommunityPost(id);
      if (res.success) {
        setReportedPosts(prev => prev.filter(p => p._id !== id));
        setMsg('Post removed successfully!');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDismissPost = async (post) => {
    try {
      // Mock dismissing by updating status
      const res = await api.updateCommunityPost(post._id, { ...post, status: 'active' });
      if (res.success) {
        setReportedPosts(prev => prev.filter(p => p._id !== post._id));
        setMsg('Flags dismissed successfully.');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-black min-h-screen text-slate-800 dark:text-slate-100 text-left">
      <div className="mb-8">
        <h1 className="text-xl font-black font-title text-black dark:text-white uppercase tracking-wider">
          Community Moderation Platform
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Manage reported posts, groups, and resource downloads
        </p>
      </div>

      {msg && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 pb-3 mb-6">
        {['posts', 'groups', 'resources'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
              activeTab === t 
                ? 'bg-primary-blue border-primary-blue text-white shadow-sm' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-500'
            }`}
          >
            {t === 'posts' && 'Reported Posts'}
            {t === 'groups' && 'Groups Board'}
            {t === 'resources' && 'Resources Manager'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 font-bold text-xs uppercase tracking-wider p-10 text-center">Loading platform metrics...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 shadow-sm overflow-hidden">
          
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-4">
              {reportedPosts.map(post => (
                <div key={post._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-black dark:text-white leading-snug">{post.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">By @{post.author?.username} • Category: {post.category}</p>
                    <p className="text-xs text-slate-500 mt-2.5 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleDismissPost(post)}
                      className="px-3.5 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FaCheck /> Dismiss
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              ))}
              {reportedPosts.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center p-6">No reported posts or flagged threads in queue.</p>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="flex flex-col gap-4">
              {groups.map(g => (
                <div key={g._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-xs text-black dark:text-white flex items-center gap-1.5"><FaUsers className="text-primary-blue" /> {g.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Owner: {g.owner?.fullName || 'Host'} • {g.members?.length || 0} Members</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete group?')) return;
                      // Mock deleting group
                      alert('Delete action triggered');
                    }}
                    className="px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FaTrash /> Terminate
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="flex flex-col gap-4">
              {resources.map(res => (
                <div key={res._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-xs text-black dark:text-white flex items-center gap-1.5"><FaFileAlt className="text-primary-blue" /> {res.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Category: {res.category} • Downloads: {res.downloadsCount || 0}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete resource?')) return;
                      alert('Delete action triggered');
                    }}
                    className="px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default CommunityCMS;
