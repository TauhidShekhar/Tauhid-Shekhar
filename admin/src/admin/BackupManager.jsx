import React, { useState } from 'react';
import { api } from '../services/api';
import { FaDatabase, FaDownload, FaUpload, FaExclamationTriangle } from 'react-icons/fa';

const BackupManager = () => {
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleRestoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Select backup JSON file');
    if (!window.confirm('WARNING: Restoring will overwrite existing data. Proceed?')) return;

    setRestoring(true);
    setStatusMsg('Parsing and importing database snapshot...');
    
    const data = new FormData();
    data.append('backup', selectedFile);

    try {
      const res = await api.restoreBackup(data);
      if (res.success) {
        setStatusMsg('Database restored successfully!');
        setSelectedFile(null);
        e.target.reset();
      }
    } catch (err) {
      setStatusMsg(`Restore failed: ${err.message}`);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left animate-fade-in">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Backup & Restore</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Export full database snapshots as JSON or restore previous versions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Export Card */}
        <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
          <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2">
            <FaDatabase className="text-primary-blue" /> Export Database
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Download a full JSON file backup containing all projects, skills, messages, blog articles, and settings data. Save this file to preserve your portfolio state.
          </p>
          <a
            href={api.exportBackupUrl}
            download
            className="w-fit px-6 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <FaDownload /> Download JSON Snapshot
          </a>
        </div>

        {/* Restore Card */}
        <div className="glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col gap-5">
          <h3 className="text-lg font-bold font-title text-black dark:text-white flex items-center gap-2">
            <FaUpload className="text-primary-purple" /> Restore Database
          </h3>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed flex gap-3">
            <FaExclamationTriangle className="shrink-0 mt-0.5" size={14} />
            <p>CRITICAL WARNING: Restoring from a backup file will completely delete and overwrite all current items in your database. This action is irreversible.</p>
          </div>

          <form onSubmit={handleRestoreSubmit} className="flex flex-col gap-4 text-xs">
            <input type="file" accept=".json" onChange={handleFileChange} required className="text-xs text-slate-500 cursor-pointer" />
            
            {statusMsg && (
              <p className="text-[11px] font-bold text-primary-blue">{statusMsg}</p>
            )}

            <button
              type="submit"
              disabled={restoring}
              className="w-full py-3.5 bg-red-500 hover:bg-red-650 text-white rounded-xl font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {restoring ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaUpload /> Run Restore Import
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
