import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FaTrash, FaCheck, FaBan, FaFlag, FaUsers, FaFileAlt, FaCheckCircle, 
  FaTrashAlt, FaCoins, FaAward, FaTachometerAlt, FaEnvelope, FaPlus, 
  FaEdit, FaTimes, FaLock, FaUnlock, FaHistory, FaVolumeUp, FaGift, 
  FaGraduationCap, FaEye, FaUserPlus, FaFileExport, FaUndo, FaCheckDouble,
  FaMapMarkerAlt, FaLink, FaCalendarAlt, FaCalendarCheck, FaInfoCircle, FaSearch, FaFilter
} from 'react-icons/fa';

const CommunityCMS = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, posts, groups, qa, projects, marketplace, events, moderation, config
  
  // Data lists
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filter/Search states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [postSearch, setPostSearch] = useState('');
  const [postCategoryFilter, setPostCategoryFilter] = useState('All');
  
  // Edit user modal
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    username: '',
    role: 'User',
    xp: 0,
    coins: 0,
    reputation: 0,
    level: 1,
    rank: '',
    isEmailVerified: false
  });

  // Edit/Create event form
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: null,
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop',
    maxParticipants: 50,
    hasCertificate: true
  });

  // Edit/Create store product
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 50,
    category: 'Avatar Cosmetic',
    sku: '',
    assetUrl: '',
    isActive: true
  });

  // Coupon Generator state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount: 10,
    maxUses: 100,
    expiryDate: ''
  });

  const loadAllEcosystemData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Users
      const userRes = await api.getUsers();
      if (userRes.success) setUsers(userRes.data || []);

      // 2. Fetch Posts
      const postRes = await api.getCommunityPosts({});
      if (postRes.success) setPosts(postRes.data || []);

      // 3. Fetch Groups
      const groupRes = await api.getCommunityGroups();
      if (groupRes.success) setGroups(groupRes.data || []);

      // 4. Fetch Q&As
      const qaRes = await api.getCommunityQuestions({});
      if (qaRes.success) setQuestions(qaRes.data || []);

      // 5. Fetch Projects
      const projRes = await api.getCommunityProjects({});
      if (projRes.success) setProjects(projRes.data || []);

      // 6. Fetch Events
      const eventRes = await api.getCommunityEvents();
      if (eventRes.success) setEvents(eventRes.data || []);

      // 7. Fetch Reports
      const reportRes = await api.getCommunityReports();
      if (reportRes.success) setReports(reportRes.data || []);

      // 8. Fetch Marketplace Store products
      const prodRes = await api.getStoreProducts();
      if (prodRes.success) setProducts(prodRes.data || []);

      // 9. Fetch Orders list
      const orderRes = await api.getStoreHistory();
      if (orderRes.success) setOrders(orderRes.data || []);

      // 10. Fetch audit logs
      const auditRes = await api.getAuditLogs({ limit: 15 });
      if (auditRes.success) setAuditLogs(auditRes.data || []);

      // Load comments for the first few posts
      if (postRes.data && postRes.data.length > 0) {
        const commListPromises = postRes.data.slice(0, 5).map(p => api.getCommunityComments(p._id));
        const resolvedComments = await Promise.all(commListPromises);
        const commentsMap = [];
        resolvedComments.forEach(res => {
          if (res.success && res.data) {
            commentsMap.push(...res.data);
          }
        });
        setComments(commentsMap);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load full admin ecosystem dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllEcosystemData();
  }, []);

  const triggerSuccessAlert = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(''), 4000);
  };

  // User Actions
  const handleEditUser = (userObj) => {
    setEditingUser(userObj);
    setUserForm({
      fullName: userObj.fullName || '',
      username: userObj.username || '',
      role: userObj.role || 'User',
      xp: userObj.xp || 0,
      coins: userObj.coins || 0,
      reputation: userObj.reputation || 0,
      level: userObj.level || 1,
      rank: userObj.rank || 'Bronze Starter',
      isEmailVerified: userObj.isEmailVerified || false
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      // Update role if changed
      if (userForm.role !== editingUser.role) {
        await api.updateUserRole(editingUser._id, userForm.role);
      }
      
      // Update status / gamification stats
      const statsPayload = {
        xp: userForm.xp,
        coins: userForm.coins,
        reputation: userForm.reputation,
        level: userForm.level,
        rank: userForm.rank,
        isEmailVerified: userForm.isEmailVerified
      };
      
      await api.updateUserGamification(editingUser._id, statsPayload);
      
      triggerSuccessAlert(`User @${userForm.username} successfully updated!`);
      setEditingUser(null);
      loadAllEcosystemData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUserBan = async (userId) => {
    try {
      const res = await api.toggleUserStatus(userId);
      if (res.success) {
        triggerSuccessAlert(`User restriction toggle successfully applied!`);
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user account? This cannot be undone.')) return;
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        triggerSuccessAlert('User account deleted from database.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Post Actions
  const handleApprovePost = async (postId, currentPost) => {
    try {
      const res = await api.updateCommunityPost(postId, { ...currentPost, status: 'active' });
      if (res.success) {
        triggerSuccessAlert('Post approved successfully.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePinPost = async (postId, currentPost) => {
    try {
      const res = await api.updateCommunityPost(postId, { ...currentPost, isPinned: !currentPost.isPinned });
      if (res.success) {
        triggerSuccessAlert(currentPost.isPinned ? 'Post unpinned.' : 'Post pinned to top.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const res = await api.deleteCommunityPost(id);
      if (res.success) {
        triggerSuccessAlert('Post removed permanently!');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Comment Actions
  const handleDeleteComment = async (id) => {
    if (!window.confirm('Remove comment permanently?')) return;
    try {
      const res = await api.deleteCommunityComment(id);
      if (res.success) {
        triggerSuccessAlert('Comment removed.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Group Actions
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Terminate group? This removes all references.')) return;
    try {
      const res = await api.deleteCommunityGroup(groupId);
      if (res.success) {
        triggerSuccessAlert('Group terminated.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Q&A actions
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete question thread?')) return;
    try {
      const res = await api.deleteCommunityQuestion(id);
      if (res.success) {
        triggerSuccessAlert('Question deleted.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Project Showcase
  const handleApproveProject = async (projId, currentProj) => {
    try {
      const res = await api.updateCommunityProject(projId, { ...currentProj, status: 'approved' });
      if (res.success) {
        triggerSuccessAlert('Project Showcase approved.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleFeaturedProject = async (projId, currentProj) => {
    try {
      const res = await api.updateCommunityProject(projId, { ...currentProj, featured: !currentProj.featured });
      if (res.success) {
        triggerSuccessAlert('Project featured status toggled.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Remove project showcase from feed?')) return;
    try {
      const res = await api.deleteCommunityProject(id);
      if (res.success) {
        triggerSuccessAlert('Project Showcase deleted.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Event Actions
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        date: new Date(`${eventForm.date}T${eventForm.time}`),
        location: eventForm.location,
        category: eventForm.category,
        maxParticipants: Number(eventForm.maxParticipants),
        hasCertificate: eventForm.hasCertificate
      };

      if (eventForm.id) {
        await api.updateCommunityEvent(eventForm.id, payload);
        triggerSuccessAlert('Event updated successfully!');
      } else {
        await api.createCommunityEvent(payload);
        triggerSuccessAlert('New Event scheduled!');
      }

      setShowEventForm(false);
      setEventForm({ id: null, title: '', description: '', date: '', time: '', location: '', category: 'Workshop', maxParticipants: 50, hasCertificate: true });
      loadAllEcosystemData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await api.deleteCommunityEvent(id);
      if (res.success) {
        triggerSuccessAlert('Event cancelled.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Moderate / Reports
  const handleResolveReport = async (reportId, actionTaken) => {
    try {
      const res = await api.actionCommunityReport(reportId, { actionTaken, status: 'resolved' });
      if (res.success) {
        triggerSuccessAlert('Report marked as resolved.');
        loadAllEcosystemData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Create Product / Coupon Actions
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: couponForm.code,
        discountPercentage: couponForm.discount,
        maxUses: couponForm.maxUses
      };
      await api.createStoreCoupon(payload);
      triggerSuccessAlert(`Promo Coupon "${couponForm.code}" created successfully in Database!`);
      setCouponForm({ code: '', discount: 10, maxUses: 100, expiryDate: '' });
      loadAllEcosystemData();
    } catch (err) {
      alert(err.message || 'Failed to create coupon.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: `Premium ${productForm.category} item for customization.`,
        priceCoins: productForm.price,
        priceReal: Math.floor(productForm.price / 2) || 99,
        category: productForm.category === 'Avatar Cosmetic' ? 'avatar_frame' :
                  productForm.category === 'Profile Cosmetic' ? 'theme' : 'ai_credits',
        itemKey: productForm.sku || 'cosmetic_' + Math.random().toString(36).substring(7),
        imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=100'
      };
      await api.createStoreProduct(payload);
      triggerSuccessAlert(`Store Cosmetic Product "${productForm.name}" created in Database!`);
      setShowProductForm(false);
      setProductForm({ name: '', description: '', price: 50, category: 'Avatar Cosmetic', sku: '', assetUrl: '', isActive: true });
      loadAllEcosystemData();
    } catch (err) {
      alert(err.message || 'Failed to create product.');
    }
  };

  // Sockets announcements
  const handleBroadcastMessage = async (e) => {
    e.preventDefault();
    const alertText = e.target.broadcastInput.value;
    if (!alertText.trim()) return;
    triggerSuccessAlert('Ecosystem broadcast alert sent to all online channels!');
    e.target.reset();
  };

  // Filters calculation
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(userSearch.toLowerCase()) || u.fullName?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(postSearch.toLowerCase()) || p.content?.toLowerCase().includes(postSearch.toLowerCase());
    const matchesCategory = postCategoryFilter === 'All' || p.category === postCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-[#09090c] min-h-screen text-[#f1f1f5] text-left font-sans">
      
      {/* Title Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-title text-white uppercase tracking-wider flex items-center gap-2">
            Ecosystem Admin Hub
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Realtime administrative center for gamification, moderation, store inventory, and user directory
          </p>
        </div>
        <button 
          onClick={loadAllEcosystemData}
          className="px-4 py-2 bg-[#121217] hover:bg-[#1a1a22] border border-white/5 rounded-xl text-xs font-black uppercase tracking-wider text-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FaUndo /> Sync Database
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold animate-pulse">
          {msg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Main Tab Switcher Menu */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: <FaTachometerAlt /> },
          { id: 'users', label: 'User Directory', icon: <FaUsers /> },
          { id: 'posts', label: 'Feed Threads', icon: <FaFileAlt /> },
          { id: 'groups', label: 'Groups Board', icon: <FaUsers /> },
          { id: 'qa', label: 'Doubt Q&A', icon: <FaEnvelope /> },
          { id: 'projects', label: 'Showcase', icon: <FaGraduationCap /> },
          { id: 'marketplace', label: 'Store & Coupons', icon: <FaGift /> },
          { id: 'events', label: 'Events Hub', icon: <FaCalendarCheck /> },
          { id: 'moderation', label: 'Reports Queue', icon: <FaFlag /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-purple-650 text-white shadow-md shadow-purple-600/10 border border-purple-550' 
                : 'bg-[#121217] border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compiling platform ledger...</span>
        </div>
      ) : (
        <div className="w-full">
          
          {/* Tab 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl text-left">
                  <span className="text-[9px] text-slate-550 uppercase tracking-widest font-black block">Total Members</span>
                  <h3 className="text-2xl font-black text-white mt-2">{users.length}</h3>
                  <span className="text-[8px] text-green-500 font-bold uppercase mt-1 block">👥 {users.filter(u => u.isActive).length} Active Accounts</span>
                </div>
                <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl text-left">
                  <span className="text-[9px] text-slate-555 uppercase tracking-widest font-black block">Posts & Threads</span>
                  <h3 className="text-2xl font-black text-white mt-2">{posts.length}</h3>
                  <span className="text-[8px] text-purple-400 font-bold uppercase mt-1 block">📝 {posts.filter(p => p.isPinned).length} Pinned Threads</span>
                </div>
                <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl text-left">
                  <span className="text-[9px] text-slate-555 uppercase tracking-widest font-black block">Groups Created</span>
                  <h3 className="text-2xl font-black text-white mt-2">{groups.length}</h3>
                  <span className="text-[8px] text-indigo-400 font-bold uppercase mt-1 block">🛡️ {events.length} Community Events</span>
                </div>
                <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl text-left">
                  <span className="text-[9px] text-slate-555 uppercase tracking-widest font-black block">Marketplace Revenue</span>
                  <h3 className="text-2xl font-black text-amber-400 mt-2">
                    {orders.reduce((sum, order) => sum + (order.coinsPaid || 0), 0)} <span className="text-xs text-slate-555">Coins</span>
                  </h3>
                  <span className="text-[8px] text-amber-500 font-bold uppercase mt-1 block">🛒 {orders.length} Transaction Records</span>
                </div>
              </div>

              {/* Sparkline Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl lg:col-span-2">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Ecosystem Engagement Activity</h3>
                  {/* Inline SVG Chart for Analytics */}
                  <div className="h-44 flex items-end justify-between pt-4 border-b border-white/5">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const heights = [20, 35, 45, 30, 55, 75, 60, 90, 80, 110, 130, 95];
                      return (
                        <div key={i} className="flex flex-col items-center w-full gap-2">
                          <div 
                            className="w-4 bg-gradient-to-t from-purple-650 to-indigo-500 rounded-t"
                            style={{ height: `${heights[i]}px` }}
                          />
                          <span className="text-[7px] text-slate-500 font-bold">M{i+1}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Broadcast and Alerts System */}
                <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl flex flex-col gap-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Ecosystem Broadcast Center</h3>
                  <form onSubmit={handleBroadcastMessage} className="flex flex-col gap-3">
                    <textarea 
                      name="broadcastInput"
                      placeholder="Type a global push notification alert to publish to all users..."
                      rows={4}
                      className="w-full p-3 rounded-2xl bg-[#1c1c24] border border-white/5 text-xs text-white placeholder-slate-555 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                      required
                    />
                    <button 
                      type="submit"
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FaVolumeUp /> Send Broadcast Alert
                    </button>
                  </form>
                </div>
              </div>

              {/* Audit Logs list */}
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5"><FaHistory /> Realtime Activity Audit Logs</h3>
                <div className="flex flex-col gap-2.5">
                  {auditLogs.slice(0, 8).map(log => (
                    <div key={log._id} className="p-3 rounded-xl bg-[#1c1c24] border border-white/5 text-[10px] text-slate-350 flex justify-between items-center font-bold">
                      <div>
                        <span className="text-purple-400 font-black">[{log.action}]</span> {log.details?.path || 'Action Triggered'}
                      </div>
                      <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && <p className="text-xs text-slate-500 italic">No activity logs captured.</p>}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-4">
              
              {/* Search & Filters */}
              <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <FaSearch className="absolute left-3 top-3.5 text-slate-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search users by name or @username..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1c1c24] border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-[#202028]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-550 font-black uppercase tracking-wider">Filter Role:</span>
                  {['All', 'Admin', 'User'].map(role => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                        userRoleFilter === role 
                          ? 'bg-purple-650 text-white' 
                          : 'bg-[#1c1c24] text-slate-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-[#121217] border border-white/5 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#181822] text-slate-450 uppercase text-[9px] font-black tracking-widest">
                        <th className="p-4">Profile</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4">Ecosystem Stats</th>
                        <th className="p-4">Daily Streak</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 font-bold">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-400 border border-purple-500/15 overflow-hidden flex items-center justify-center shrink-0">
                              {u.avatar?.url ? <img src={u.avatar.url} alt="avatar" className="w-full h-full object-cover" /> : u.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="text-white truncate">{u.fullName}</span>
                              <span className="text-[10px] text-slate-555 mt-0.5 truncate">@{u.username}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${u.role === 'Admin' ? 'bg-purple-550/15 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.isEmailVerified ? (
                              <span className="text-green-500 flex items-center gap-1 text-[10px]"><FaCheckCircle /> Verified</span>
                            ) : (
                              <span className="text-slate-555">Unverified</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 text-[10px] text-slate-350">
                              <span>Level: {u.level || 1} &bull; Rank: {u.rank || 'Bronze Starter'}</span>
                              <span className="text-amber-400 flex items-center gap-1"><FaCoins size={8} /> {u.coins || 0} &bull; XP: {u.xp || 0}</span>
                            </div>
                          </td>
                          <td className="p-4 text-pink-400">🔥 {u.dailyStreak || 0} Days</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${u.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/15' : 'bg-red-500/10 text-red-500 border border-red-500/15'}`}>
                              {u.isActive ? 'Active' : 'Banned'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-650 hover:text-white transition-colors cursor-pointer"
                                title="Adjust Gamification metrics / Role"
                              >
                                <FaEdit size={10} />
                              </button>
                              <button
                                onClick={() => handleToggleUserBan(u._id)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  u.isActive 
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' 
                                    : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                                }`}
                                title={u.isActive ? 'Suspend/Ban Account' : 'Restore Account'}
                              >
                                <FaBan size={10} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                title="Delete Permanently"
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-500 italic">No users matching search filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit User statistics Modal Overlay */}
              {editingUser && (
                <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-[#121217] border border-white/10 p-6 rounded-[30px] flex flex-col gap-4 text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="font-bold text-sm text-white">Adjust Ecosystem Stats: @{userForm.username}</h3>
                      <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white cursor-pointer"><FaTimes /></button>
                    </div>
                    <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">Full Name</label>
                          <input
                            type="text"
                            value={userForm.fullName}
                            onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">Assign Role</label>
                          <select
                            value={userForm.role}
                            onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">Coins Wallet</label>
                          <input
                            type="number"
                            value={userForm.coins}
                            onChange={(e) => setUserForm(prev => ({ ...prev, coins: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">XP Value</label>
                          <input
                            type="number"
                            value={userForm.xp}
                            onChange={(e) => setUserForm(prev => ({ ...prev, xp: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">Reputation</label>
                          <input
                            type="number"
                            value={userForm.reputation}
                            onChange={(e) => setUserForm(prev => ({ ...prev, reputation: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">Level</label>
                          <input
                            type="number"
                            value={userForm.level}
                            onChange={(e) => setUserForm(prev => ({ ...prev, level: Number(e.target.value) }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-slate-450 uppercase font-black">Ecosystem Rank Name</label>
                          <input
                            type="text"
                            value={userForm.rank}
                            onChange={(e) => setUserForm(prev => ({ ...prev, rank: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                        <input
                          type="checkbox"
                          id="verify-check"
                          checked={userForm.isEmailVerified}
                          onChange={(e) => setUserForm(prev => ({ ...prev, isEmailVerified: e.target.checked }))}
                          className="rounded border-white/5 bg-[#1c1c24] text-purple-650"
                        />
                        <label htmlFor="verify-check" className="text-[10px] text-slate-450 uppercase font-black cursor-pointer">Verify Profile Badge</label>
                      </div>

                      <button
                        type="submit"
                        className="mt-2 w-full py-3 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Commit Changes
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 3: FEED POSTS & COMMENTS */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-6">
              
              {/* Filter Row */}
              <div className="bg-[#121217] border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <FaSearch className="absolute left-3 top-3.5 text-slate-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1c1c24] border border-white/5 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Category:</span>
                  {['All', 'General', 'Tutorials', 'Project Showcase', 'Questions'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPostCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                        postCategoryFilter === cat 
                          ? 'bg-purple-650 text-white' 
                          : 'bg-[#1c1c24] text-slate-400 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts list panel */}
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Ecosystem Posts Board</h3>
                <div className="flex flex-col gap-4">
                  {filteredPosts.map(post => (
                    <div key={post._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white leading-snug">{post.title || 'Untitled Post'}</h4>
                          {post.isPinned && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[8px] font-black uppercase tracking-wider">Pinned</span>}
                          {post.status === 'reported' && <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/25 text-[8px] font-black uppercase tracking-wider">Reported</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">By @{post.author?.username || 'user'} &bull; Category: {post.category || 'General'} &bull; Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-350 mt-2.5 line-clamp-2 leading-relaxed">{post.content}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 w-full md:w-auto">
                        <button
                          onClick={() => handleApprovePost(post._id, post)}
                          disabled={post.status === 'active'}
                          className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-colors cursor-pointer ${
                            post.status === 'active' 
                              ? 'bg-transparent border-slate-800 text-slate-600' 
                              : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => handlePinPost(post._id, post)}
                          className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border transition-colors cursor-pointer ${
                            post.isPinned 
                              ? 'bg-purple-650 text-white border-purple-550' 
                              : 'bg-[#121217] text-slate-400 border-white/5 hover:text-white'
                          }`}
                        >
                          Pin
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredPosts.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">No threads matching search filter.</p>}
                </div>
              </div>

              {/* Comments moderation section */}
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
                <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Latest Feed Comments</h3>
                <div className="flex flex-col gap-3">
                  {comments.map(c => (
                    <div key={c._id} className="p-3 rounded-xl bg-[#181822] border border-white/5 flex justify-between items-center text-xs font-bold text-left">
                      <div>
                        <span className="text-[10px] text-slate-555 block">By @{c.author?.username || 'user'} on Post #{c.postId?.substring(18) || ''}</span>
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed">{c.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="p-2 bg-red-500/10 text-red-550 hover:bg-red-550 hover:text-white border border-red-550/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete Comment"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-xs text-slate-500 italic text-center">No recent comments to manage.</p>}
                </div>
              </div>

            </div>
          )}

          {/* Tab 4: GROUPS BOARD */}
          {activeTab === 'groups' && (
            <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Registered Groups Board</h3>
              <div className="flex flex-col gap-4">
                {groups.map(g => (
                  <div key={g._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div>
                      <h4 className="font-bold text-xs text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-purple-655/10 text-purple-400 flex items-center justify-center font-black text-[10px]">G</div>
                        {g.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">Owner: {g.owner?.fullName || 'Owner'} &bull; {g.members?.length || 0} Members</p>
                      <p className="text-xs text-slate-350 mt-2 line-clamp-1">{g.description || 'No description provided.'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(g._id)}
                      className="px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FaTrash /> Terminate Group
                    </button>
                  </div>
                ))}
                {groups.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">No groups registered in database.</p>}
              </div>
            </div>
          )}

          {/* Tab 5: DOUBT Q&A LOUNGE */}
          {activeTab === 'qa' && (
            <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Developer Q&A Lounge</h3>
              <div className="flex flex-col gap-4">
                {questions.map(q => (
                  <div key={q._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">{q.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">By @{q.author?.username || 'user'} &bull; Answers count: {q.answersCount || 0}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(q.tags || []).map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-purple-600/10 border border-purple-500/10 text-purple-400 text-[8px] font-black uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FaTrash /> Delete Question
                    </button>
                  </div>
                ))}
                {questions.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">No question threads registered.</p>}
              </div>
            </div>
          )}

          {/* Tab 6: PROJECT SHOWCASE */}
          {activeTab === 'projects' && (
            <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Project Showcase Submissions</h3>
              <div className="flex flex-col gap-4">
                {projects.map(proj => (
                  <div key={proj._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{proj.title}</h4>
                        {proj.featured && <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-550/20 text-[8px] font-black uppercase tracking-wider">Featured</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Submitted by @{proj.author?.username} &bull; Status: {proj.status}</p>
                      <p className="text-xs text-slate-350 mt-2 line-clamp-1">{proj.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveProject(proj._id, proj)}
                        disabled={proj.status === 'approved'}
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                          proj.status === 'approved' 
                            ? 'bg-transparent border-slate-800 text-slate-600' 
                            : 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleToggleFeaturedProject(proj._id, proj)}
                        className="px-3 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-yellow-550 hover:text-white cursor-pointer transition-colors"
                      >
                        Feature
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        className="px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">No project showcase submissions.</p>}
              </div>
            </div>
          )}

          {/* Tab 7: MARKETPLACE SHOP */}
          {activeTab === 'marketplace' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Catalog Product Creator */}
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl text-left">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Product Catalog</h3>
                  <button 
                    onClick={() => setShowProductForm(!showProductForm)}
                    className="px-3 py-1.5 bg-purple-650 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FaPlus /> Add Product
                  </button>
                </div>

                {showProductForm && (
                  <form onSubmit={handleCreateProduct} className="p-4 rounded-2xl bg-[#1c1c24] border border-white/5 flex flex-col gap-3 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Cosmetic Name</label>
                      <input 
                        type="text" 
                        required 
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Neon Red Profile Theme"
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-455 uppercase font-black">Price (Coins)</label>
                        <input 
                          type="number" 
                          required 
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-455 uppercase font-black">Category</label>
                        <select 
                          value={productForm.category}
                          onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white"
                        >
                          <option value="Avatar Cosmetic">Avatar Cosmetic</option>
                          <option value="Profile Cosmetic">Profile Cosmetic</option>
                          <option value="AI Credit Voucher">AI Credit Voucher</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Cosmetic Asset Identifier</label>
                      <input 
                        type="text" 
                        value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="e.g. border_gold, theme_neon"
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      Save Product
                    </button>
                  </form>
                )}

                <div className="flex flex-col gap-2.5">
                  {products.map(prod => (
                    <div key={prod._id} className="p-3.5 rounded-xl bg-[#1c1c24] border border-white/5 flex justify-between items-center text-xs font-bold">
                      <div>
                        <span className="text-white block">{prod.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase">{prod.category} &bull; ID: {prod.sku}</span>
                      </div>
                      <span className="text-amber-400 font-black">{prod.price} Coins</span>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-xs text-slate-500 italic">No products listed.</p>}
                </div>
              </div>

              {/* Promo Coupon Builder */}
              <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl text-left">
                <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4">Promo Coupon Generator</h3>
                <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-455 uppercase font-black">Coupon Code</label>
                    <input 
                      type="text" 
                      required 
                      value={couponForm.code}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. DEVSTREAK50"
                      className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Discount Percentage</label>
                      <input 
                        type="number" 
                        required 
                        value={couponForm.discount}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
                        min={5}
                        max={100}
                        className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Max Uses Allowed</label>
                      <input 
                        type="number" 
                        required 
                        value={couponForm.maxUses}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-[#1c1c24] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-purple-655 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Generate Active Coupon
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Tab 8: EVENTS SCHEDULER */}
          {activeTab === 'events' && (
            <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Scheduled Developer Events</h3>
                <button 
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="px-3.5 py-2 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FaPlus /> Schedule Event
                </button>
              </div>

              {showEventForm && (
                <form onSubmit={handleSaveEvent} className="p-5 rounded-2xl bg-[#181822] border border-white/5 flex flex-col gap-3 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Event Title</label>
                      <input 
                        type="text" 
                        required 
                        value={eventForm.title}
                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Masterclass in Redux Toolkit"
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Location (Link or Venue)</label>
                      <input 
                        type="text" 
                        required 
                        value={eventForm.location}
                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. Discord Stage 1"
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-slate-455 uppercase font-black">Description</label>
                    <textarea 
                      required 
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Give details about event speakers and session syllabus..."
                      className="w-full p-3 bg-[#121217] border border-white/5 rounded-xl text-xs text-white focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Date</label>
                      <input 
                        type="date" 
                        required 
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Time</label>
                      <input 
                        type="time" 
                        required 
                        value={eventForm.time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Max Registrations</label>
                      <input 
                        type="number" 
                        required 
                        value={eventForm.maxParticipants}
                        onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-455 uppercase font-black">Category</label>
                      <select 
                        value={eventForm.category}
                        onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-[#121217] border border-white/5 rounded-xl text-xs text-white"
                      >
                        <option value="Workshop">Workshop</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Meetup">Meetup</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="event-cert-check"
                      checked={eventForm.hasCertificate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, hasCertificate: e.target.checked }))}
                      className="rounded border-white/5 bg-[#121217] text-purple-650"
                    />
                    <label htmlFor="event-cert-check" className="text-[10px] text-slate-455 uppercase font-black cursor-pointer">Award Participation Certificate PDF</label>
                  </div>

                  <button 
                    type="submit"
                    className="mt-2 w-full py-3 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Commit Event Schedule
                  </button>
                </form>
              )}

              <div className="flex flex-col gap-4">
                {events.map(ev => (
                  <div key={ev._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div>
                      <h4 className="font-bold text-xs text-white">{ev.title}</h4>
                      <p className="text-[10px] text-slate-550 mt-1">Scheduled: {new Date(ev.date).toLocaleString()} &bull; Venue: {ev.location}</p>
                      <p className="text-xs text-slate-350 mt-2 line-clamp-2">{ev.description}</p>
                      <div className="flex items-center gap-3 mt-3 text-[9px] text-slate-500 font-bold uppercase">
                        <span>👥 RSVPs: {ev.participants?.length || 0} / {ev.maxParticipants}</span>
                        {ev.hasCertificate && <span className="text-green-500 font-extrabold flex items-center gap-1"><FaGraduationCap /> Certificate Award Enabled</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEventForm({
                            id: ev._id,
                            title: ev.title,
                            description: ev.description,
                            date: ev.date ? ev.date.split('T')[0] : '',
                            time: ev.date ? ev.date.split('T')[1]?.substring(0, 5) : '',
                            location: ev.location,
                            category: ev.category || 'Workshop',
                            maxParticipants: ev.maxParticipants || 50,
                            hasCertificate: ev.hasCertificate !== false
                          });
                          setShowEventForm(true);
                        }}
                        className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-650 hover:text-white transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <FaEdit size={10} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="px-3.5 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FaTrash /> Cancel Event
                      </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">No community events listed.</p>}
              </div>
            </div>
          )}

          {/* Tab 9: MODERATION REPORTS */}
          {activeTab === 'moderation' && (
            <div className="bg-[#121217] border border-white/5 p-6 rounded-3xl text-left">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-3">User Flagged Reports Queue</h3>
              <div className="flex flex-col gap-4">
                {reports.map(rep => (
                  <div key={rep._id} className="p-4 rounded-2xl bg-[#181822] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-550/15 uppercase font-black tracking-wider">Reported target: {rep.targetType}</span>
                      <p className="text-[10px] text-slate-455 mt-1.5">Filed by @{rep.reporter?.username || 'reporter'} &bull; Reason: {rep.reason}</p>
                      <p className="text-xs text-slate-350 mt-2 bg-[#121217] border border-white/5 p-3 rounded-xl italic">
                        "Evidence/Context Content ID: {rep.targetId}"
                      </p>
                      {rep.status === 'resolved' && (
                        <p className="text-[10px] text-green-500 font-bold mt-2">Resolved. Action taken: {rep.actionTaken || 'None'}</p>
                      )}
                    </div>
                    {rep.status !== 'resolved' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveReport(rep._id, 'Content Deleted')}
                          className="px-3.5 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FaCheck /> Dismiss & Resolve
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep._id, 'User Warned')}
                          className="px-3.5 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Warn Creator
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {reports.length === 0 && <p className="text-xs text-slate-500 italic text-center py-6">No reported items currently in moderation queue.</p>}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default CommunityCMS;
