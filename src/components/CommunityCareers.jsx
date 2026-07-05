import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { FaBriefcase, FaPlus, FaMapMarkerAlt, FaClock, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

const CommunityCareers = () => {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [showCreator, setShowCreator] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [requirements, setRequirements] = useState('');
  const [description, setDescription] = useState('');

  const jobTypes = ['All', 'Full-time', 'Part-time', 'Internship', 'Freelance'];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type && type !== 'All') params.type = type;
      if (search) params.search = search;
      
      const res = await api.getCommunityJobs(params);
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [type]);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const requirementsArray = requirements.split(',').map(r => r.trim()).filter(Boolean);
      const res = await api.postCommunityJob({
        title,
        company,
        location: location || 'Remote',
        jobType,
        description,
        requirements: requirementsArray
      });

      if (res.success) {
        setJobs(prev => [res.data, ...prev]);
        setShowCreator(false);
        setTitle('');
        setCompany('');
        setLocation('');
        setRequirements('');
        setDescription('');
      }
    } catch (err) {
      alert('Failed to post opening: ' + err.message);
    }
  };

  const handleApply = async (jobId) => {
    try {
      const res = await api.applyToCommunityJob(jobId);
      if (res.success) {
        setJobs(prev => prev.map(j => {
          if (j._id === jobId) {
            const list = j.applicants || [];
            return { ...j, applicants: [...list, user.id] };
          }
          return j;
        }));
        alert('Application submitted successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-5 rounded-3xl shadow-sm text-left">
        <div>
          <h2 className="text-lg font-black font-title text-black dark:text-white">Career Board</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Post and apply for tech vacancies</p>
        </div>
        {!showCreator && (
          <button
            onClick={() => setShowCreator(true)}
            className="px-5 py-2.5 bg-primary-blue hover:bg-accent-blue text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <FaPlus /> Post Opening
          </button>
        )}
      </div>

      {/* Post job opening form */}
      {showCreator && (
        <form onSubmit={handleJobSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] flex flex-col gap-4 text-left shadow-md">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
            <h4 className="text-sm font-black font-title text-black dark:text-white">Post Career Opportunity</h4>
            <button 
              type="button" 
              onClick={() => setShowCreator(false)}
              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Junior React Developer"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="e.g. Google DeepMind"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London / Remote"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employment Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-blue text-xs"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirements (comma separated)</label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="React, CSS, Git"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description & Application Steps</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Outline the responsibilities, tech stack, and application pathways."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-blue text-xs transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-fit px-8 py-3 bg-primary-blue hover:bg-accent-blue text-white rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Post opening
          </button>
        </form>
      )}

      {/* Filter widgets */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search job listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-primary-blue transition-colors"
          />
          <button onClick={fetchJobs} className="absolute top-2.5 right-3 text-slate-400 hover:text-primary-blue text-xs font-bold">Go</button>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {jobTypes.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                (type === t || (t === 'All' && !type)) 
                  ? 'bg-primary-blue border-primary-blue text-white' 
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-350'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Active Jobs Deck */}
      {loading ? (
        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="p-10 border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-400 rounded-3xl">
          No job openings posted yet. Post a vacancy to hire from the community!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map(job => {
            const hasApplied = (job.applicants || []).includes(user.id);
            return (
              <div key={job._id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-all text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-black font-title text-base text-black dark:text-white leading-snug">{job.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-primary-blue/10 text-primary-blue border border-primary-blue/20 rounded-md">
                      {job.jobType}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-500 mb-4">{job.company}</h4>
                  
                  <div className="flex gap-4 text-xs text-slate-500 font-bold mb-4 flex-wrap">
                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><FaClock /> {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.map(req => (
                        <span key={req} className="text-[9px] font-bold px-2.5 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-md text-slate-500">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-stretch md:items-end gap-2.5 w-full md:w-auto">
                  <span className="text-[10px] text-slate-400 font-bold text-left md:text-right uppercase block">
                    {(job.applicants || []).length} Applicants
                  </span>
                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={hasApplied}
                    className={`w-full md:w-fit px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                      hasApplied 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500 cursor-not-allowed' 
                        : 'bg-primary-blue border-primary-blue text-white hover:bg-accent-blue shadow-sm'
                    }`}
                  >
                    {hasApplied ? <><FaCheckCircle /> Applied</> : <><FaPaperPlane /> Apply Now</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CommunityCareers;
