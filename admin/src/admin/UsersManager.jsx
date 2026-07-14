import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import { 
  FaUserShield, FaUserEdit, FaTrash, FaCheck, FaTimes, FaSearch, 
  FaFilter, FaFileCsv, FaKey, FaChevronLeft, FaChevronRight, FaInfoCircle, 
  FaShieldAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaEllipsisV, FaLock 
} from 'react-icons/fa';

const UsersManager = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort and Paginate State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name-az, name-za, last-login
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected User for Detail View/Edit Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: 'User',
    status: 'Active',
    isEmailVerified: false,
    isPhoneVerified: false,
    password: '',
    forcePasswordReset: false
  });

  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const rawApiUrl = import.meta.env.VITE_API_URL;
    const socketUrl = (rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl !== 'null')
      ? rawApiUrl.replace('/api', '')
      : (window.location.port === '5173' || window.location.port === '5174'
          ? `${window.location.protocol}//${window.location.hostname}:5000`
          : 'https://tauhid-shekhar-portfolio.onrender.com');

    const socket = io(socketUrl, { withCredentials: true });

    socket.on('content_update', (payload) => {
      // Refresh user list if a user-related mutation happens
      if (payload && (payload.path?.includes('/users') || payload.path?.includes('/auth'))) {
        fetchUsers();
      }
    });

    socket.on('user_update', () => {
      fetchUsers();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter and Sort Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    
    // Map status based on schema status or fallback to active flag
    const currentStatus = u.status || (u.isActive ? 'Active' : 'Suspended');
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;

    const matchesVerification = 
      verificationFilter === 'All' ||
      (verificationFilter === 'Verified' && u.isEmailVerified) ||
      (verificationFilter === 'Unverified' && !u.isEmailVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'name-az') return a.fullName.localeCompare(b.fullName);
    if (sortBy === 'name-za') return b.fullName.localeCompare(a.fullName);
    if (sortBy === 'last-login') {
      if (!a.lastLogin) return 1;
      if (!b.lastLogin) return -1;
      return new Date(b.lastLogin) - new Date(a.lastLogin);
    }
    return 0;
  });

  // Paginated elements
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      alert('No user data to export');
      return;
    }
    const headers = [
      'Full Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 
      'Email Verified', 'Phone Verified', 'Registration Date', 'Last Login Time'
    ];
    
    const rows = filteredUsers.map(u => [
      `"${u.fullName}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      `"${u.role}"`,
      `"${u.status || (u.isActive ? 'Active' : 'Suspended')}"`,
      u.isEmailVerified ? 'Yes' : 'No',
      u.isPhoneVerified ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleDateString(),
      u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio_users_directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Edit Modal & Populate details
  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    setModalForm({
      fullName: u.fullName || '',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'User',
      status: u.status || (u.isActive ? 'Active' : 'Suspended'),
      isEmailVerified: u.isEmailVerified || false,
      isPhoneVerified: u.isPhoneVerified || false,
      password: '',
      forcePasswordReset: u.mustChangePassword || false
    });
    setModalError('');
    setModalSuccess('');
    setShowModal(true);
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setModalForm(prev => ({ ...prev, password: pass }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setActionLoading(true);

    try {
      const res = await api.adminUpdateUser(selectedUser._id, modalForm);
      if (res.success) {
        setModalSuccess('User account updated successfully!');
        fetchUsers();
        setTimeout(() => {
          setShowModal(false);
          setSelectedUser(null);
        }, 1500);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to update user details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Action Toggles
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if (!window.confirm(`Are you sure you want to change user status to ${newStatus}?`)) return;

    try {
      const res = await api.adminUpdateUser(id, { status: newStatus });
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently delete ${name}? This action is irreversible.`)) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        fetchUsers();
        if (showModal) setShowModal(false);
      }
    } catch (err) {
      alert(err.message || 'Delete operation failed');
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Users Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage user profiles, credentials, roles, security, and verification statuses.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <FaFileCsv size={14} /> Export Directory (CSV)
        </button>
      </div>

      {/* SEARCH, FILTER & SORT CONTROL BAR */}
      <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-550/5 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase whitespace-nowrap">Role</span>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase whitespace-nowrap">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase whitespace-nowrap">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-az">Name (A-Z)</option>
              <option value="name-za">Name (Z-A)</option>
              <option value="last-login">Last Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* USERS DATA TABLE */}
      <div className="glass rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-205 dark:border-white/5 text-slate-500 uppercase font-bold tracking-wider">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-white/5">
              {currentUsers.map((u) => {
                const isSelf = u._id === currentUser.id;
                const status = u.status || (u.isActive ? 'Active' : 'Suspended');
                return (
                  <tr key={u._id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                    {/* User profile details column */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {u.avatar?.url ? (
                          <img src={u.avatar.url} alt={u.fullName} className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-white/5 shadow-sm" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-primary-blue/10 text-primary-blue font-extrabold flex items-center justify-center border border-primary-blue/20">
                            {u.fullName[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-black dark:text-white flex items-center gap-1.5 leading-snug">
                            {u.fullName}
                            {isSelf && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-450 dark:text-slate-400 rounded text-[8px] font-black tracking-widest uppercase">Self</span>}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">@{u.username} • {u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role column */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg font-black uppercase tracking-wider text-[8px] border ${
                        u.role === 'Admin' 
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status column */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg font-black uppercase tracking-wider text-[8px] border ${
                        status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        status === 'Suspended' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {status}
                      </span>
                    </td>

                    {/* Verification column */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`flex items-center gap-1 text-[9px] font-bold ${u.isEmailVerified ? 'text-green-500' : 'text-slate-400'}`}>
                          {u.isEmailVerified ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />} Email
                        </span>
                        <span className={`flex items-center gap-1 text-[9px] font-bold ${u.isPhoneVerified ? 'text-green-500' : 'text-slate-400'}`}>
                          {u.isPhoneVerified ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />} Phone
                        </span>
                      </div>
                    </td>

                    {/* Registration column */}
                    <td className="px-6 py-4.5 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Last login column */}
                    <td className="px-6 py-4.5 text-slate-500 whitespace-nowrap">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : <span className="italic text-slate-400">Never</span>}
                    </td>

                    {/* Actions column */}
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                          title="Manage Account Details"
                        >
                          <FaUserEdit size={12} />
                        </button>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(u._id, status)}
                              className={`p-2 rounded-lg border cursor-pointer ${
                                status === 'Active' 
                                  ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20' 
                                  : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'
                              }`}
                              title={status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                            >
                              {status === 'Active' ? <FaTimes size={12} /> : <FaCheck size={12} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id, u.fullName)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                              title="Permanently Delete User"
                            >
                              <FaTrash size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                    No users found matching current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Page {currentPage} of {totalPages} ({filteredUsers.length} Users)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg border border-slate-250 dark:border-white/10 text-slate-550 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <FaChevronLeft size={10} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg border border-slate-250 dark:border-white/10 text-slate-555 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL VIEW & ACTIONS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-white/10 rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/60 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-primary-blue" />
                <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">Account Administration details</h3>
              </div>
              <button 
                onClick={() => { setShowModal(false); setSelectedUser(null); }} 
                className="text-slate-400 hover:text-black dark:hover:text-white cursor-pointer p-1"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal content body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-left">
              {modalError && (
                <div className="p-4 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold leading-relaxed">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-4 mb-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold leading-relaxed">
                  {modalSuccess}
                </div>
              )}

              <form onSubmit={handleSaveUser} className="flex flex-col gap-6">
                {/* Profile metadata row */}
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                  {selectedUser.avatar?.url ? (
                    <img src={selectedUser.avatar.url} alt="Profile" className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/5 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20 font-black text-lg flex items-center justify-center">
                      {selectedUser.fullName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-black text-black dark:text-white leading-snug">{selectedUser.fullName}</h4>
                    <span className="text-[10px] text-slate-400 block">Registered: {new Date(selectedUser.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Edit forms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-450 uppercase font-black">Full Name</label>
                    <input
                      type="text"
                      required
                      value={modalForm.fullName}
                      onChange={(e) => setModalForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-450 uppercase font-black">Username</label>
                    <input
                      type="text"
                      required
                      value={modalForm.username}
                      onChange={(e) => setModalForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-450 uppercase font-black">Email Address</label>
                    <input
                      type="email"
                      required
                      value={modalForm.email}
                      onChange={(e) => setModalForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-450 uppercase font-black">Phone Number</label>
                    <input
                      type="text"
                      value={modalForm.phone}
                      onChange={(e) => setModalForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white"
                    />
                  </div>
                </div>

                {/* Role and status drop-downs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-450 uppercase font-black">Account Role</label>
                    <select
                      value={modalForm.role}
                      disabled={selectedUser._id === currentUser.id}
                      onChange={(e) => setModalForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white focus:outline-none"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-455 uppercase font-black">Account Status</label>
                    <select
                      value={modalForm.status}
                      disabled={selectedUser._id === currentUser.id}
                      onChange={(e) => setModalForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Banned">Banned</option>
                    </select>
                  </div>
                </div>

                {/* Email / Phone Verification Toggle Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.isEmailVerified}
                      onChange={(e) => setModalForm(prev => ({ ...prev, isEmailVerified: e.target.checked }))}
                      className="rounded border-slate-350 text-primary-blue focus:ring-primary-blue cursor-pointer w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-355 text-xs block">Email Address Verified</span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Allows notifications & emails</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.isPhoneVerified}
                      onChange={(e) => setModalForm(prev => ({ ...prev, isPhoneVerified: e.target.checked }))}
                      className="rounded border-slate-355 text-primary-blue focus:ring-primary-blue cursor-pointer w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-355 text-xs block">Phone Number Verified</span>
                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">OTP logins & recovery</span>
                    </div>
                  </label>
                </div>

                {/* Password reset controls */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-white/5 rounded-2xl flex flex-col gap-3.5">
                  <h5 className="font-black text-slate-455 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <FaKey className="text-primary-blue" /> Reset Credentials / Password
                  </h5>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-end">
                    <div className="flex-1 w-full flex flex-col gap-1 text-left">
                      <label className="text-[9px] text-slate-455 uppercase font-bold">New Account Password</label>
                      <input
                        type="text"
                        placeholder="Leave blank to keep current password"
                        value={modalForm.password}
                        onChange={(e) => setModalForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-black dark:text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-3.5 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-355 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl font-bold text-[10px] cursor-pointer transition-colors w-full sm:w-auto h-9"
                    >
                      Generate Password
                    </button>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={modalForm.forcePasswordReset}
                      onChange={(e) => setModalForm(prev => ({ ...prev, forcePasswordReset: e.target.checked }))}
                      className="rounded border-slate-350 text-primary-blue focus:ring-primary-blue cursor-pointer w-4.5 h-4.5"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Force password change on next login alert</span>
                  </label>
                </div>

                {/* Login session history */}
                {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h5 className="font-black text-slate-450 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                      <FaHistory /> Login Session Logs (Last 5 Logs)
                    </h5>
                    <div className="border border-slate-200/60 dark:border-white/5 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950">
                      <table className="w-full border-collapse text-left text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 font-black uppercase text-slate-455 text-[8px] tracking-wider">
                            <th className="px-4 py-2">Timestamp</th>
                            <th className="px-4 py-2">Device</th>
                            <th className="px-4 py-2">IP Address</th>
                            <th className="px-4 py-2">Browser</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 dark:divide-white/5 text-slate-500">
                          {selectedUser.loginHistory.slice(-5).reverse().map((log, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/40 dark:hover:bg-white/5">
                              <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="px-4 py-2 font-bold text-black dark:text-white">{log.device} ({log.os})</td>
                              <td className="px-4 py-2 font-mono">{log.ip}</td>
                              <td className="px-4 py-2">{log.browser}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Modal footer save details */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                  {selectedUser._id !== currentUser.id ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(selectedUser._id, selectedUser.fullName)}
                      className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold cursor-pointer transition-colors text-[10px] uppercase tracking-wider"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setSelectedUser(null); }}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-205/60 dark:border-white/5 rounded-xl font-bold cursor-pointer hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-black uppercase tracking-wider shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {actionLoading ? 'Saving changes...' : 'Save Member Details'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
