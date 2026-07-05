import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { 
  FaTrash, FaCheckCircle, FaSearch, FaFileCsv, 
  FaShoppingBag, FaClock, FaCalendarAlt, FaDownload, 
  FaBuilding, FaPaperclip, FaChevronRight, FaPhoneAlt 
} from 'react-icons/fa';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching service orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time socket updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    socket.on('new_service_order', (newOrder) => {
      setOrders(prev => {
        // Prevent duplicate appending
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtering, search, and sorting logic
  useEffect(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query) ||
        (o.phone || '').toLowerCase().includes(query) ||
        (o.companyName || '').toLowerCase().includes(query) ||
        o.selectedService.toLowerCase().includes(query) ||
        o.budget.toLowerCase().includes(query) ||
        (o.projectType || '').toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, sortBy]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateOrderStatus(id, status);
      if (res.success) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this order request?')) return;
    try {
      const res = await api.deleteOrder(id);
      if (res.success) {
        setOrders(prev => prev.filter(o => o._id !== id));
      }
    } catch (err) {
      alert('Deletion failed: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert('No orders to export');

    const headers = [
      'Client Name', 'Email Address', 'Phone Number', 'Company Name', 
      'Selected Service', 'Budget requirement', 'Project Type', 
      'Target Deadline', 'Description details', 'Attachment File URL', 
      'Order Status', 'Date Placed'
    ];
    const rows = filteredOrders.map(o => [
      `"${o.name.replace(/"/g, '""')}"`,
      `"${o.email.replace(/"/g, '""')}"`,
      `"${(o.phone || 'N/A').replace(/"/g, '""')}"`,
      `"${(o.companyName || 'N/A').replace(/"/g, '""')}"`,
      `"${o.selectedService.replace(/"/g, '""')}"`,
      `"${o.budget.replace(/"/g, '""')}"`,
      `"${(o.projectType || 'N/A').replace(/"/g, '""')}"`,
      `"${o.deadline ? new Date(o.deadline).toLocaleDateString() : 'N/A'}"`,
      `"${o.description.replace(/"/g, '""')}"`,
      `"${o.attachment?.url || 'None'}"`,
      `"${o.status}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Service_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const classes = {
      'New': 'bg-amber-500/10 text-amber-500 border-amber-500/25',
      'Contacted': 'bg-purple-500/10 text-purple-500 border-purple-500/25',
      'In Progress': 'bg-blue-500/10 text-blue-550 border-blue-500/25',
      'Completed': 'bg-green-500/10 text-green-550 border-green-500/25',
      'Rejected': 'bg-red-500/10 text-red-550 border-red-500/25'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black tracking-wider uppercase ${classes[status] || ''}`}>
        {status}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Stats Counters
  const totalOrders = orders.length;
  const newOrders = orders.filter(o => o.status === 'New').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white flex items-center gap-3">
            <FaShoppingBag className="text-primary-blue" /> Service Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review client project descriptions, budget proposals, timeline deadlines, and change request status sheets.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer border border-transparent dark:border-white/5 transition-colors"
        >
          <FaFileCsv size={14} /> Export CSV
        </button>
      </div>

      {/* Stats summary widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total orders placed</span>
          <span className="text-3xl font-black text-black dark:text-white">{totalOrders}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">New / Unprocessed Orders</span>
          <span className={`text-3xl font-black ${newOrders > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400 dark:text-slate-600'}`}>{newOrders}</span>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full border-b border-slate-100 dark:border-white/5 pb-4">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <FaSearch className="absolute left-4 top-3 text-slate-450" size={12} />
          <input
            type="text"
            placeholder="Search by client, company, service selection, budget, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status select filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-[150px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Sorting option select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-[155px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-5 items-start bg-white dark:bg-slate-955"
          >
            {/* Left Content */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Header: Client Meta Details */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-slate-100 dark:border-white/5 pb-3 w-full">
                <h4 className="text-sm font-black text-black dark:text-white leading-tight flex items-center gap-2">
                  {order.name}
                  {order.status === 'New' && (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider rounded border border-amber-500/20">New Request</span>
                  )}
                </h4>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <a href={`mailto:${order.email}`} className="text-xs font-semibold text-primary-blue hover:underline">{order.email}</a>
                {order.phone && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                    <a href={`tel:${order.phone.replace(/\s+/g, '')}`} className="text-xs font-semibold text-slate-655 dark:text-slate-400 hover:underline flex items-center gap-1">
                      <FaPhoneAlt size={10} /> {order.phone}
                    </a>
                  </>
                )}
                {order.companyName && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FaBuilding size={10} className="text-slate-400" /> {order.companyName}
                    </span>
                  </>
                )}
                <span className="text-slate-300 dark:text-slate-750 ml-auto hidden md:inline">&bull;</span>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Scope Grid details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-b border-slate-100 dark:border-white/5 text-xs w-full">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Service Selected</span>
                  <span className="font-extrabold text-black dark:text-slate-200">{order.selectedService}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Proposed Budget</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-500">{order.budget}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Project Type</span>
                  <span className="font-extrabold text-slate-655 dark:text-slate-300">{order.projectType || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Timeline / Deadline</span>
                  <span className="font-extrabold text-slate-655 dark:text-slate-300 flex items-center gap-1">
                    <FaCalendarAlt size={10} className="text-slate-400" />
                    {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Message Scope */}
              <div className="text-left w-full">
                <h5 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Project Scope Details</h5>
                <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed max-w-4xl whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>

              {/* File attachment preview card if uploaded */}
              {order.attachment && order.attachment.url && (
                <div className="w-fit p-3 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-primary-blue/10 text-primary-blue shrink-0">
                    <FaPaperclip size={12} />
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-black dark:text-white max-w-[200px] truncate">{order.attachment.fileName}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{formatFileSize(order.attachment.fileSize)}</span>
                  </div>
                  <a
                    href={order.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue rounded-lg transition-colors ml-4"
                    title="Download attachment file"
                  >
                    <FaDownload size={10} />
                  </a>
                </div>
              )}
            </div>

            {/* Right Side: Actions Panel */}
            <div className="flex md:flex-col justify-between items-end gap-4 self-stretch md:self-auto shrink-0 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-4 md:pt-0 md:pl-4">
              {/* Order status selection dropdown */}
              <div className="flex flex-col gap-1 w-full text-left md:text-right">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Update Order Status</span>
                <div className="relative mt-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary-blue cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Status and delete wrappers */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:inline">
                  {getStatusBadge(order.status)}
                </div>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer border border-red-500/10"
                  title="Permanently remove order sheet"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="glass p-16 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-center text-slate-450 italic text-xs">
            No service orders match your query filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManager;
