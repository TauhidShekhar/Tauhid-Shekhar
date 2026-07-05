import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaUserShield, FaUserEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const UsersManager = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
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
  }, []);

  const handleChangeRole = async (id, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
    if (!window.confirm(`Are you sure you want to change user role to ${newRole}?`)) return;

    try {
      const res = await api.updateUserRole(id, newRole);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.toggleUserStatus(id);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user permanently?')) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Users Directory</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage admin team roles, active sessions, and verification statuses.</p>
      </div>

      <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-250 dark:border-white/5 text-slate-500 uppercase font-bold tracking-wider">
              <th className="pb-3 pr-4">User</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Email Verified</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-white/5">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    {u.avatar?.url ? (
                      <img src={u.avatar.url} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-blue/10 text-primary-blue font-bold flex items-center justify-center">
                        {u.fullName[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-black dark:text-white">{u.fullName}</h4>
                      <span className="text-[10px] text-slate-400">@{u.username} • {u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] ${
                    u.role === 'Admin' ? 'bg-primary-purple/10 text-primary-purple border border-primary-purple/20' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] ${
                    u.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-4 font-bold text-slate-500">
                  {u.isEmailVerified ? 'Yes' : 'No'}
                </td>
                <td className="py-4 text-right">
                  {u._id === currentUser.id ? (
                    <span className="text-[10px] font-bold text-slate-400 italic">Current Session</span>
                  ) : (
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleChangeRole(u._id, u.role)}
                        className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer"
                        title="Change Role"
                      >
                        <FaUserEdit size={11} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`p-2 rounded-lg border cursor-pointer ${
                          u.isActive 
                            ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20' 
                            : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'
                        }`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <FaTimes size={11} /> : <FaCheck size={11} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                        title="Delete User"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManager;
