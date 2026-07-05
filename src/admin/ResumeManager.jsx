import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaFilePdf, FaUpload, FaTrash, FaCheckCircle, FaDownload } from 'react-icons/fa';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchResumes = async () => {
    try {
      const res = await api.getResumes();
      if (res.success) {
        setResumes(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a PDF file first');

    setUploading(true);
    const data = new FormData();
    data.append('resume', selectedFile);

    try {
      const res = await api.uploadResume(data);
      if (res.success) {
        setSelectedFile(null);
        // Clear input element
        e.target.reset();
        fetchResumes();
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setLoading(true);
    try {
      const res = await api.deleteResume(id);
      if (res.success) {
        fetchResumes();
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
      setLoading(false);
    }
  };

  if (loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-black font-title text-black dark:text-white">Resume Manager</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload and replace active PDF resumes for recruiters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload form */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6 flex items-center gap-2">
            <FaUpload className="text-primary-blue" /> Upload New Resume
          </h3>

          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Select PDF Document</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-slate-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl font-bold text-sm shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaUpload /> Upload & Set Active
                </>
              )}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="lg:col-span-7 glass p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
          <h3 className="text-lg font-bold font-title text-black dark:text-white mb-6">Resume Archives</h3>

          {resumes.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              No resumes uploaded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {resumes.map((r) => (
                <div key={r._id} className="p-4 rounded-xl border border-slate-200/40 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center shrink-0">
                      <FaFilePdf size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-black dark:text-white truncate">{r.fileName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/25 rounded-md uppercase tracking-wider">
                        <FaCheckCircle /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 cursor-pointer"
                        title="Delete Archive"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-primary-blue/10 hover:bg-primary-blue/20 text-primary-blue border border-primary-blue/20 cursor-pointer flex items-center justify-center"
                      title="Download PDF"
                    >
                      <FaDownload size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
