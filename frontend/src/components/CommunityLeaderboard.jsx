import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaCrown, FaAward, FaFire, FaRegSmile } from 'react-icons/fa';

const CommunityLeaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await api.getCommunityLeaderboard();
        if (res.success) {
          setLeaders(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 rounded-[30px] p-6 max-w-2xl mx-auto text-left shadow-sm">
      <div className="border-b border-slate-100 dark:border-white/5 pb-4 mb-6">
        <h2 className="text-lg font-black font-title text-black dark:text-white flex items-center gap-2">
          <FaCrown className="text-yellow-550" /> XP Leaderboard
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Top contributors in our MERN ecosystem</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider">Loading Leaderboard...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaders.map((leader, index) => {
            const level = Math.floor((leader.xp || 0) / 100) + 1;
            
            return (
              <div 
                key={leader._id} 
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 shadow-sm' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank badge */}
                  <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    index === 0 ? 'bg-yellow-500 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-650'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Avatar wrapper */}
                  <div className="w-8.5 h-8.5 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                    {leader.avatar?.url ? (
                      <img src={leader.avatar.url} alt="Leader" className="w-full h-full object-cover" />
                    ) : (
                      <FaRegSmile className="text-slate-400" size={18} />
                    )}
                  </div>

                  {/* Name details */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-black dark:text-white truncate">{leader.fullName}</h4>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-bold uppercase tracking-wide">
                      @{leader.username} • Level {level}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <FaAward className="text-primary-blue" size={12} />
                  <span className="text-xs font-black text-black dark:text-white">{leader.xp || 0} <span className="text-[9px] text-slate-450 uppercase font-bold">XP</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CommunityLeaderboard;
