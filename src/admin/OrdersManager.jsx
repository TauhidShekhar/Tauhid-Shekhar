import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaTrash, FaCheckCircle, FaSearch, FaFileCsv, FaShoppingBag, FaClock, FaCheck, FaBan } from 'react-icons/fa';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data);
        setFilteredOrders(res.data);
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

  useEffect(() => {
    let temp = [...orders];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      temp = temp.filter(o => 
        o.name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query) ||
        o.budget.toLowerCase().includes(query) ||
        o.serviceType.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      temp = temp.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(temp);
  }, [searchQuery, statusFilter, orders]);

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
    if (orders.length === 0) return alert('No orders to export');

    const headers = ['Name', 'Email', 'Service Type', 'Budget Requirement', 'Description', 'Status', 'Date'];
    const rows = orders.map(o => [
      `"${o.name.replace(/"/g, '""')}"`,
      `"${o.email.replace(/"/g, '""')}"`,
      `"${o.serviceType.replace(/"/g, '""')}"`,
      `"${o.budget.replace(/"/g, '""')}"`,
      `"${o.description.replace(/"/g, '""')}"`,
      `"${o.status}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
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
      'Pending': 'bg-yellow-500/10 text-yellow-550 border-yellow-500/25',
      'In Progress': 'bg-blue-500/10 text-blue-550 border-blue-500/25',
      'Completed': 'bg-green-500/10 text-green-550 border-green-500/25',
      'Cancelled': 'bg-red-500/10 text-red-550 border-red-500/25'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black tracking-wide uppercase ${classes[status] || ''}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title tracking-tight text-black dark:text-white flex items-center gap-3">
            <FaShoppingBag className="text-primary-blue" /> Service Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review client project scopes, budgets, details, and change status of order request sheets.
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer border border-transparent dark:border-white/5 transition-colors self-start md:self-auto"
        >
          <FaFileCsv size={14} /> Export CSV
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <FaSearch className="absolute left-4 top-3.5 text-slate-400" size={12} />
          <input
            type="text"
            placeholder="Search by client, service type, or budget..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
          />
        </div>

        {/* Status Dropdown Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-[180px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-primary-blue"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Inbox list */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="glass p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-5 items-start bg-white dark:bg-slate-950"
          >
            {/* Left Content */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h4 className="text-sm font-black text-black dark:text-white">{order.name}</h4>
                <a href={`mailto:${order.email}`} className="text-xs font-semibold text-primary-blue hover:underline">{order.email}</a>
                {order.phone && (
                  <>
                    <span className="text-[10px] text-slate-400">&bull;</span>
                    <a href={`tel:${order.phone.replace(/\s+/g, '')}`} className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline">{order.phone}</a>
                  </>
                )}
                <span className="text-[10px] text-slate-400">&bull;</span>
                <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
                {getStatusBadge(order.status)}
              </div>

              {/* Scope & Budget Details */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 py-1.5 border-y border-slate-100 dark:border-white/5 text-xs font-bold text-slate-655 dark:text-slate-350">
                <div>
                  <span className="text-slate-400 uppercase text-[9px] mr-1.5 tracking-wider">Service:</span>
                  <span>{order.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] mr-1.5 tracking-wider">Budget Requirement:</span>
                  <span className="text-primary-blue">{order.budget}</span>
                </div>
              </div>

              {/* Message Scope */}
              <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed max-w-[90%] whitespace-pre-wrap">
                {order.description}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex md:flex-col gap-2.5 items-end justify-between h-full shrink-0 self-stretch md:self-auto min-w-[120px]">
              {/* Change Status Dropdown */}
              <div className="flex flex-col gap-1 w-full text-left md:text-right">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Update Status</span>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-[10px] focus:outline-none focus:border-primary-blue cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteOrder(order._id)}
                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors cursor-pointer self-end"
                title="Delete order sheet record"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="glass p-12 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 italic">
            No service orders found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManager;
