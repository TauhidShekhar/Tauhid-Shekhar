import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { 
  FaTrash, FaCheckCircle, FaSearch, FaFileCsv, 
  FaEnvelope, FaEnvelopeOpen, FaInbox, FaArchive, 
  FaSortAmountDown, FaSortAmountUp, FaHistory, FaPhoneAlt 
} from 'react-icons/fa';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState('active'); // active, archived
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  const fetchMessages = async () => {
    try {
      const res = await api.getMessages();
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Real-time socket integration
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    socket.on('new_contact_message', (newMessage) => {
      setMessages(prev => {
        // Prevent duplicate append
        if (prev.some(m => m._id === newMessage._id)) return prev;
        return [newMessage, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter, search, and sort logic
  useEffect(() => {
    let result = [...messages];

    // Filter by tab
    if (viewTab === 'active') {
      result = result.filter(m => !m.isArchived);
    } else {
      result = result.filter(m => m.isArchived);
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.subject || '').toLowerCase().includes(query) ||
        m.message.toLowerCase().includes(query) ||
        (m.phone || '').toLowerCase().includes(query)
      );
    }

    // Sort query
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredMessages(result);
  }, [messages, searchQuery, viewTab, sortBy]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.markMessageRead(id);
      if (res.success) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
      }
    } catch (err) {
      console.error('Failed to update read state:', err);
    }
  };

  const handleToggleArchive = async (id) => {
    try {
      const res = await api.toggleMessageArchive(id);
      if (res.success) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, isArchived: !m.isArchived } : m));
      }
    } catch (err) {
      console.error('Failed to toggle archive state:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this message?')) return;
    try {
      const res = await api.deleteMessage(id);
      if (res.success) {
        setMessages(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Deletion failed:', err);
    }
  };

  const handleExportCSV = () => {
    const listToExport = filteredMessages;
    if (listToExport.length === 0) return alert('No messages to export in current view');

    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Read Status', 'Archived Status', 'Date Submitted'];
    const rows = listToExport.map(m => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.email.replace(/"/g, '""')}"`,
      `"${(m.phone || 'N/A').replace(/"/g, '""')}"`,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      m.isRead ? 'Read' : 'Unread',
      m.isArchived ? 'Archived' : 'Active',
      `"${new Date(m.createdAt).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `messages_export_${viewTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistic summaries
  const totalCount = messages.length;
  const activeCount = messages.filter(m => !m.isArchived).length;
  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

  if (loading && messages.length === 0) {
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
            <FaEnvelope className="text-primary-blue" /> Contact Messages
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, read, and manage client inquiries submitted from your portfolio contact form.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shadow-md shadow-green-600/10"
        >
          <FaFileCsv size={14} /> Export CSV
        </button>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Inquiries</span>
          <span className="text-3xl font-black text-black dark:text-white">{totalCount}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Inbox</span>
          <span className="text-3xl font-black text-primary-blue">{activeCount}</span>
        </div>
        <div className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-950 flex flex-col gap-1.5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unread Messages</span>
          <span className={`text-3xl font-black ${unreadCount > 0 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-600'}`}>{unreadCount}</span>
        </div>
      </div>

      {/* Controls: Search, Tabs, Sorting */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full border-b border-slate-100 dark:border-white/5 pb-4">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <FaSearch className="absolute left-4 top-3 text-slate-450" size={12} />
          <input
            type="text"
            placeholder="Search by client, email, phone, or body content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
          />
        </div>

        {/* Tab Selection & Sorts */}
        <div className="flex items-center gap-4 justify-between w-full lg:w-auto">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl">
            <button
              onClick={() => setViewTab('active')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewTab === 'active' 
                  ? 'bg-white dark:bg-slate-800 text-primary-blue shadow-sm' 
                  : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FaInbox size={11} /> Inbox ({messages.filter(m => !m.isArchived).length})
              </span>
            </button>
            <button
              onClick={() => setViewTab('archived')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewTab === 'archived' 
                  ? 'bg-white dark:bg-slate-800 text-primary-blue shadow-sm' 
                  : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <FaArchive size={11} /> Archive ({messages.filter(m => m.isArchived).length})
              </span>
            </button>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex flex-col gap-4">
        {filteredMessages.map((msg) => (
          <div
            key={msg._id}
            className={`glass p-6 rounded-2xl border transition-all flex flex-col gap-4 bg-white dark:bg-slate-950 ${
              msg.isRead
                ? 'border-slate-200/65 dark:border-white/5 opacity-80'
                : 'border-primary-blue/30 dark:border-primary-blue/15 shadow-sm'
            }`}
          >
            {/* Meta details */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <span className={`p-2.5 rounded-xl ${msg.isRead ? 'bg-slate-100 dark:bg-white/5 text-slate-450' : 'bg-primary-blue/10 text-primary-blue'} shrink-0`}>
                  {msg.isRead ? <FaEnvelopeOpen size={14} /> : <FaEnvelope size={14} />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-black dark:text-white leading-tight">{msg.name}</h4>
                    {!msg.isRead && (
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-wider rounded border border-amber-500/20">New</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-slate-450 dark:text-slate-400 mt-1">
                    <a href={`mailto:${msg.email}`} className="hover:text-primary-blue transition-colors">{msg.email}</a>
                    {msg.phone && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                        <a href={`tel:${msg.phone.replace(/\s+/g, '')}`} className="hover:text-primary-blue flex items-center gap-1">
                          <FaPhoneAlt size={10} /> {msg.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp & Actions */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FaHistory size={11} /> {new Date(msg.createdAt).toLocaleString()}
                </span>
                <div className="flex gap-2.5">
                  {/* Mark as read */}
                  {!msg.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(msg._id)}
                      className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-xl transition-colors cursor-pointer border border-green-500/10"
                      title="Mark inquiry as read"
                    >
                      <FaCheckCircle size={13} />
                    </button>
                  )}

                  {/* Archive */}
                  <button
                    onClick={() => handleToggleArchive(msg._id)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-xl transition-colors cursor-pointer border border-transparent dark:border-white/5"
                    title={msg.isArchived ? "Unarchive Message" : "Archive Message"}
                  >
                    {msg.isArchived ? <FaInbox size={13} /> : <FaArchive size={13} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer border border-red-500/10"
                    title="Delete permanently"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Subject and content */}
            <div className="text-left">
              <h5 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2">Subject: {msg.subject || '(No Subject)'}</h5>
              <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed whitespace-pre-wrap max-w-4xl">
                {msg.message}
              </p>
            </div>
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="glass p-16 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-450 italic text-xs">
            {searchQuery ? 'No inquiries match your query filter.' : `Your ${viewTab} inquiries list is empty.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesInbox;
