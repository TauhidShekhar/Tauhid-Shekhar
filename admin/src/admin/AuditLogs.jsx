import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaHistory, FaSearch, FaFilter, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';

const RESOURCES = ['All', 'Project', 'Skill', 'Experience', 'Education', 'Certificate', 'Achievement', 'User', 'Form', 'Message', 'Order', 'Setting', 'Media'];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchAction, setSearchAction] = useState('');
  const [selectedResource, setSelectedResource] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (searchAction.trim()) params.action = searchAction.trim();
      if (selectedResource && selectedResource !== 'All') params.resource = selectedResource;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.getAuditLogs(params);
      if (res.success) {
        setLogs(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.count || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, searchAction, selectedResource, startDate, endDate]);

  const clearFilters = () => {
    setSearchAction('');
    setSelectedResource('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(searchAction || (selectedResource && selectedResource !== 'All') || startDate || endDate);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-left animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white flex items-center gap-2.5">
            <FaShieldAlt className="text-[#C2272D] dark:text-[#00FFFF]" />
            <span>System Audit Logs</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable log of administrative operations, security mutations, and account sessions.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
          Total Logs: <span className="text-[#C2272D] dark:text-[#00FFFF]">{totalCount}</span>
        </div>
      </div>

      <div className="glass p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-5">
        
        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Action search */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Search action (e.g. CREATE, LOGIN)..."
              value={searchAction}
              onChange={(e) => {
                setSearchAction(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#141414] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#C2272D] dark:focus:border-[#00FFFF]"
            />
          </div>

          {/* Resource filter */}
          <div className="relative">
            <select
              value={selectedResource}
              onChange={(e) => {
                setSelectedResource(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#141414] text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {RESOURCES.map((res) => (
                <option key={res} value={res}>Entity: {res}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#141414] text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              title="Filter from date"
            />
          </div>

          {/* Date To & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#141414] text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              title="Filter to date"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading audit trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-xs sm:text-sm text-slate-400">
            No audit logs match your filter criteria.
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 px-3">Actor / Admin</th>
                    <th className="pb-3 px-3">Action</th>
                    <th className="pb-3 px-3">Resource Entity</th>
                    <th className="pb-3 pl-3 text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {logs.map((log) => {
                    const time = log.createdAt || log.timestamp;
                    const dateFormatted = time ? new Date(time).toLocaleString() : 'N/A';
                    return (
                      <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {log.user ? `${log.user.fullName} (@${log.user.username})` : 'System / Automated'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                            String(log.action).includes('CREATE') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            String(log.action).includes('UPDATE') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                            String(log.action).includes('DELETE') ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {log.resource || '-'}
                        </td>
                        <td className="py-3.5 pl-3 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {log.ip || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold uppercase transition-colors hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Page <span className="font-bold text-black dark:text-white">{page}</span> of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold uppercase transition-colors hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
