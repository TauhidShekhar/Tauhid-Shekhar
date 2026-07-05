import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaTrash, FaCheckCircle, FaSearch, FaFileCsv, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';

const MessagesInbox = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await api.getMessages();
      if (res.success) {
        setMessages(res.data);
        setFilteredMessages(res.data);
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

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = messages.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query)
    );
    setFilteredMessages(filtered);
  }, [searchQuery, messages]);

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

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
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
    if (messages.length === 0) return alert('No messages to export');

    const headers = ['Name', 'Email', 'Subject', 'Message', 'Date'];
    const rows = messages.map(m => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.email.replace(/"/g, '""')}"`,
      `"${(m.subject || '').replace(/"/g, '""')}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      `"${new Date(m.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `messages_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white">Messages Inbox</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Read and manage inquiries submitted from your web contact form.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/10 transition-all cursor-pointer flex items-center gap-2"
        >
          <FaFileCsv size={16} /> Export Inbox CSV
        </button>
      </div>

      <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
        {/* Search */}
        <div className="relative mb-6 w-full max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <FaSearch size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, subject, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue dark:focus:border-primary-blue text-sm transition-colors"
          />
        </div>

        {filteredMessages.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-450 dark:text-slate-400">
            {searchQuery ? 'No messages match your search filter.' : 'Your contact inbox is empty.'}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className={`p-6 rounded-2xl border flex flex-col gap-3 transition-all relative ${
                  msg.isRead
                    ? 'bg-slate-50/50 dark:bg-white/5 border-slate-200/40 dark:border-white/5 opacity-80'
                    : 'bg-white dark:bg-slate-900/60 border-primary-blue/20 dark:border-primary-blue/15 shadow-sm'
                }`}
              >
                {/* Meta details */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ${msg.isRead ? 'bg-slate-200/40 text-slate-400 dark:bg-white/5' : 'bg-primary-blue/10 text-primary-blue'} shrink-0`}>
                      {msg.isRead ? <FaEnvelopeOpen size={14} /> : <FaEnvelope size={14} />}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-black dark:text-white leading-tight">{msg.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                        <a href={`mailto:${msg.email}`} className="hover:text-primary-blue">{msg.email}</a>
                        {msg.phone && (
                          <>
                            <span>&bull;</span>
                            <a href={`tel:${msg.phone.replace(/\s+/g, '')}`} className="hover:text-primary-blue">{msg.phone}</a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 font-bold">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {!msg.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(msg._id)}
                          className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 cursor-pointer"
                          title="Mark as Read"
                        >
                          <FaCheckCircle size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                        title="Delete Message"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-left">
                  <h5 className="text-xs font-black text-slate-500 dark:text-slate-450 uppercase tracking-wide mb-2">Subject: {msg.subject || '(No Subject)'}</h5>
                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesInbox;
