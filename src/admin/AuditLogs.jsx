import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaHistory, FaSearch } from 'react-icons/fa';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchAction, setSearchAction] = useState('');

  const fetchLogs = async () => {
    try {
      const params = { page, limit: 15 };
      if (searchAction) params.action = searchAction;

      const res = await api.getAuditLogs(params);
      if (res.success) {
        setLogs(res.data || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, searchAction]);

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">System Audit Logs</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor administrator actions, database mutations, and session logins.</p>
      </div>

      <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-x-auto">
        <div className="flex justify-between items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch size={12} />
            </span>
            <input
              type="text"
              placeholder="Filter by action (e.g. LOGIN)..."
              value={searchAction}
              onChange={(e) => {
                setSearchAction(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none"
            />
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-450">
            No audit logs match filter criteria.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Resource</th>
                  <th className="pb-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-black dark:text-white">
                      {log.user ? `${log.user.fullName} (@${log.user.username})` : 'System / Seed'}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded font-black text-[9px] ${
                        log.action.includes('CREATE') ? 'bg-green-500/10 text-green-500' :
                        log.action.includes('UPDATE') ? 'bg-primary-blue/10 text-primary-blue' :
                        log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                        'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                      } uppercase`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-slate-650 dark:text-slate-350">
                      {log.resource || '-'}
                    </td>
                    <td className="py-3 font-mono text-slate-450">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-150 dark:border-white/5 pt-4 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[10px] font-bold text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50"
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
