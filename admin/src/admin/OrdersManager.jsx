import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { 
  FaTrash, FaCheckCircle, FaSearch, FaFileCsv, 
  FaShoppingBag, FaClock, FaCalendarAlt, FaDownload, 
  FaBuilding, FaPaperclip, FaPhoneAlt, FaComments, 
  FaStickyNote, FaUser, FaPlus 
} from 'react-icons/fa';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('all'); // all, order, inquiry
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Notes Modal state
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching service orders & inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time socket updates
  useEffect(() => {
    const rawApiUrl = import.meta.env.VITE_API_URL;
    const socketUrl = (rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl !== 'null')
      ? rawApiUrl.replace('/api', '')
      : (window.location.port === '5173' || window.location.port === '5174'
          ? `${window.location.protocol}//${window.location.hostname}:5000`
          : 'https://tauhid-shekhar-portfolio.onrender.com');
    const socket = io(socketUrl, { withCredentials: true });

    socket.on('new_service_order', (newOrder) => {
      setOrders(prev => {
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

    // Request Type Tab filter
    if (activeTab !== 'all') {
      result = result.filter(o => (o.requestType || 'order') === activeTab);
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(o => o.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        (o.referenceId || '').toLowerCase().includes(q) ||
        (o.name || '').toLowerCase().includes(q) ||
        (o.email || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q) ||
        (o.companyName || '').toLowerCase().includes(q) ||
        (o.selectedService || '').toLowerCase().includes(q) ||
        (o.budget || '').toLowerCase().includes(q) ||
        (o.description || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredOrders(result);
  }, [orders, activeTab, searchQuery, statusFilter, sortBy]);

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
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    try {
      const res = await api.deleteOrder(id);
      if (res.success) {
        setOrders(prev => prev.filter(o => o._id !== id));
      }
    } catch (err) {
      alert('Deletion failed: ' + err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedOrderForNotes) return;
    setAddingNote(true);
    try {
      const res = await api.addOrderNote(selectedOrderForNotes._id, {
        note: newNoteText.trim(),
        author: 'Admin'
      });
      if (res.success && res.data) {
        setOrders(prev => prev.map(o => o._id === res.data._id ? res.data : o));
        setSelectedOrderForNotes(res.data);
        setNewNoteText('');
      }
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert('No records to export');

    const headers = [
      'Reference ID', 'Type', 'Client Name', 'Email Address', 'Phone Number', 
      'Company Name', 'Selected Service', 'Package Tier', 'Budget', 
      'Target Deadline', 'Description', 'Status', 'Date Placed'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredOrders.map(o => [
      escapeCsv(o.referenceId),
      escapeCsv(o.requestType || 'order'),
      escapeCsv(o.name),
      escapeCsv(o.email),
      escapeCsv(o.phone || 'N/A'),
      escapeCsv(o.companyName || 'N/A'),
      escapeCsv(o.selectedService),
      escapeCsv(o.packageName || 'Custom'),
      escapeCsv(o.budget),
      escapeCsv(o.deadline ? new Date(o.deadline).toLocaleDateString() : 'N/A'),
      escapeCsv(o.description),
      escapeCsv(o.status),
      escapeCsv(new Date(o.createdAt).toLocaleString())
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Service_Requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const classes = {
      'New': 'bg-amber-500/10 text-amber-500 border-amber-500/25',
      'Pending Review': 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      'Contacted': 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      'Quotation Sent': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
      'In Progress': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      'Rejected': 'bg-red-500/10 text-red-400 border-red-500/25',
      'Cancelled': 'bg-slate-500/10 text-slate-400 border-slate-500/25'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${classes[status] || 'bg-slate-500/10 text-slate-400'}`}>
        {status}
      </span>
    );
  };

  const totalOrdersCount = orders.filter(o => (o.requestType || 'order') === 'order').length;
  const totalInquiriesCount = orders.filter(o => o.requestType === 'inquiry').length;
  const newRequestsCount = orders.filter(o => o.status === 'New').length;

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#C2272D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <FaShoppingBag className="text-[#C2272D]" /> Service Orders & Inquiries
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming client orders, scope briefs, attachments, status progression, and internal notes.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border border-transparent dark:border-white/5 transition"
        >
          <FaFileCsv size={14} className="text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Orders</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{totalOrdersCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Service Inquiries</span>
          <span className="text-2xl font-black text-[#00FFFF]">{totalInquiriesCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New / Unprocessed</span>
          <span className={`text-2xl font-black ${newRequestsCount > 0 ? 'text-[#C2272D]' : 'text-slate-400'}`}>
            {newRequestsCount}
          </span>
        </div>
      </div>

      {/* Tabs Bar: All, Orders, Inquiries */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        {[
          { id: 'all', label: `All Requests (${orders.length})` },
          { id: 'order', label: `Service Orders (${totalOrdersCount})` },
          { id: 'inquiry', label: `Inquiries (${totalInquiriesCount})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
        <div className="relative w-full sm:flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            placeholder="Search by reference ID, client name, email, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Contacted">Contacted</option>
            <option value="Quotation Sent">Quotation Sent</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            No matching service records found.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOrder = (order.requestType || 'order') === 'order';
            return (
              <div
                key={order._id}
                className="p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-4"
              >
                {/* Header Meta Line */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[#C2272D] border border-slate-200 dark:border-white/10">
                      {order.referenceId || 'TS-REF'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isOrder ? 'bg-[#C2272D]/10 text-[#C2272D]' : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {isOrder ? 'Service Order' : 'Service Inquiry'}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <FaClock size={11} />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Client Info & Parameters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs py-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Client Name</span>
                    <h5 className="font-bold text-slate-900 dark:text-white">{order.name}</h5>
                    <a href={`mailto:${order.email}`} className="text-slate-500 hover:text-[#C2272D] truncate block">
                      {order.email}
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Service & Tier</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{order.selectedService}</span>
                    <span className="text-slate-400">{order.packageName || 'Custom'} Tier</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Budget & Deadline</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{order.budget}</span>
                    <span className="text-slate-400">
                      {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Flexible Timeline'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Phone & Company</span>
                    <span className="text-slate-700 dark:text-slate-300 block">{order.phone || 'N/A'}</span>
                    <span className="text-slate-400 truncate block">{order.companyName || 'Individual'}</span>
                  </div>
                </div>

                {/* Description Scope */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <h6 className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    {isOrder ? 'Project Scope & Requirements' : 'Inquiry Message'}
                  </h6>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {order.description}
                  </p>
                </div>

                {/* Attachment Link if present */}
                {order.attachment?.url && (
                  <div className="flex items-center gap-2 text-xs">
                    <FaPaperclip className="text-slate-400" />
                    <span className="text-slate-500">Attachment:</span>
                    <a
                      href={order.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#00FFFF] hover:underline flex items-center gap-1"
                    >
                      <FaDownload size={10} /> {order.attachment.fileName || 'Download File'}
                    </a>
                  </div>
                )}

                {/* Action Bar: Status Change, Notes Modal, Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quotation Sent">Quotation Sent</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderForNotes(order)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                    >
                      <FaStickyNote size={11} className="text-[#00FFFF]" />
                      <span>Admin Notes ({order.adminNotes?.length || 0})</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition"
                      title="Delete Record"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Internal Admin Notes Modal */}
      {selectedOrderForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-white/10">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FaStickyNote className="text-[#00FFFF]" /> Internal Admin Notes
                </h4>
                <span className="font-mono text-xs text-slate-400">
                  {selectedOrderForNotes.referenceId} &bull; {selectedOrderForNotes.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForNotes(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Existing Notes list */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {(!selectedOrderForNotes.adminNotes || selectedOrderForNotes.adminNotes.length === 0) ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  No internal notes recorded yet.
                </div>
              ) : (
                selectedOrderForNotes.adminNotes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-xs">
                    <p className="text-slate-800 dark:text-slate-200 mb-1 whitespace-pre-wrap">{note.note}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>By: {note.author || 'Admin'}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                required
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter internal follow-up note, quote details, meeting summary..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForNotes(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={addingNote}
                  className="px-5 py-2 bg-[#C2272D] hover:bg-[#a51d23] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <FaPlus size={10} />
                  <span>{addingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
