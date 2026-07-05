import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaAward, FaCoins, FaCheckCircle, FaStar, FaCrown, FaCompass, 
  FaBookOpen, FaUsers, FaArrowUp, FaCalendarCheck, FaGift, FaTasks
} from 'react-icons/fa';

const RewardsDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [quizSolved, setQuizSolved] = useState(() => {
    try {
      const date = localStorage.getItem('portfolio_quiz_done_date');
      return date === new Date().toDateString();
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const checkChallenge = async () => {
      try {
        const res = await api.getDailyChallenge();
        if (res.success) {
          setChallengeSolved(res.data.isSolved);
        }
      } catch (_) {}
    };
    checkChallenge();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getRewardsDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleClaimReward = async (missionId) => {
    setClaiming(true);
    try {
      const res = await api.claimMissionReward(missionId);
      if (res.success) {
        setMsg(`Claimed successfully! Received +${res.rewards.xp} XP and +${res.rewards.coins} Coins!`);
        setTimeout(() => setMsg(''), 4000);
        loadDashboard();
      }
    } catch (err) {
      alert(err.message || 'Failed to claim reward.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center bg-[#121217] border border-white/5 rounded-3xl min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-3 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const profile = data?.profile || {
    xp: 0,
    coins: 0,
    level: 1,
    rank: 'Bronze Starter',
    dailyStreak: 0,
    weeklyStreak: 0,
    monthlyStreak: 0,
    trustScore: 100,
    contributionScore: 0,
    badges: []
  };

  const daily = data?.missions?.daily;
  const weekly = data?.missions?.weekly;

  // Next level threshold calculation
  const getNextLevelXP = (level) => {
    if (level >= 20) return 100000;
    if (level >= 10) return 25000;
    if (level >= 5) return 5000;
    if (level >= 4) return 1000;
    if (level >= 3) return 500;
    if (level >= 2) return 250;
    return 100;
  };

  const nextXP = getNextLevelXP(profile.level);
  const currentLevelMinXP = profile.level === 1 ? 0 : getNextLevelXP(profile.level - 1);
  const percent = Math.min(100, Math.max(0, ((profile.xp - currentLevelMinXP) / (nextXP - currentLevelMinXP)) * 100));

  const badgeTemplates = [
    { name: 'Beginner', icon: <FaCompass />, desc: 'Awarded on first profile completion.' },
    { name: 'Explorer', icon: <FaCompass />, desc: 'Awarded on posting your first content thread.' },
    { name: 'Helper', icon: <FaAward />, desc: 'Awarded upon reaching 100 total XP.' },
    { name: 'Contributor', icon: <FaStar />, desc: 'Earned 100 total XP.' },
    { name: 'Rising Star', icon: <FaStar />, desc: 'Earned 500 total XP.' },
    { name: 'Community Guru', icon: <FaCrown />, desc: 'Earned 1500 total XP.' },
    { name: 'Verified Developer', icon: <FaCheckCircle />, desc: 'Unlocked verified identity badge.' },
    { name: 'Premium Member', icon: <FaCrown />, desc: 'Active Premium Store membership benefits.' }
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="mb-2">
        <h1 className="text-xl font-black text-white uppercase tracking-wider">Developer Rewards Hub</h1>
        <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">Track your level, earn coins, and claim missions</p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-bold animate-fade-in flex items-center gap-2">
          <FaGift /> {msg}
        </div>
      )}

      {/* Ranks & Wallet Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Level card */}
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col justify-between min-h-[140px] relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Level Status</span>
              <span className="text-2xl font-black text-white mt-1">Level {profile.level}</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase mt-1 tracking-wider">{profile.rank}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/15 flex items-center justify-center text-purple-400 text-sm font-black">
              L{profile.level}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 mt-4">
            <div className="flex justify-between text-[9px] text-slate-400 font-bold">
              <span>{profile.xp} XP</span>
              <span>{nextXP} XP</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#1c1c24] overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Coin wallet card */}
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col justify-between min-h-[140px] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Developer Coins</span>
              <span className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
                <FaCoins size={22} /> {profile.coins || 0}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Spend coins to unlock customization rewards</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400 text-sm">
              <FaCoins />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 border-t border-white/5 pt-2.5 font-bold uppercase tracking-wider">
            <span>Streak Multiplier</span>
            <span className="text-white">x1.0 Coins</span>
          </div>
        </div>

        {/* Streaks card */}
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col justify-between min-h-[140px] shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Daily Streaks</span>
              <span className="text-2xl font-black text-pink-400 mt-1 flex items-center gap-2">
                🔥 {profile.dailyStreak || 0} Days
              </span>
              <span className="text-[10px] text-slate-450 mt-1 leading-snug">Log in every consecutive day to earn login multipliers</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/15 flex items-center justify-center text-pink-400 text-sm">
              <FaCalendarCheck />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 border-t border-white/5 pt-2.5 font-bold uppercase tracking-wider">
            <span>Trust Score</span>
            <span className="text-green-400">{profile.trustScore || 100}%</span>
          </div>
        </div>

      </div>

      {/* Challenges & Missions Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Mission */}
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaTasks /> Daily Missions</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase">Reset: 23:59 PM</span>
          </div>

          {daily ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-350">Create 2 Posts</span>
                <span className="font-bold text-white">{daily.postsCreated} / {daily.postsRequired}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-350">Post 4 Comments</span>
                <span className="font-bold text-white">{daily.commentsCreated} / {daily.commentsRequired}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-350">Leave 5 Likes</span>
                <span className="font-bold text-white">{daily.likesGiven} / {daily.likesRequired}</span>
              </div>

              <button
                disabled={daily.rewardClaimed || claiming || !(daily.postsCreated >= daily.postsRequired && daily.commentsCreated >= daily.commentsRequired && daily.likesGiven >= daily.likesRequired)}
                onClick={() => handleClaimReward(daily._id)}
                className="mt-2 w-full py-2.5 bg-purple-650 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                {daily.rewardClaimed ? 'Claimed ✔' : 'Claim Daily Reward (+100 XP, +25 Coins)'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-550 italic">No daily mission loaded.</p>
          )}
        </div>

        {/* Weekly Mission */}
        <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
          <div className="flex justify-between border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FaTasks /> Weekly Missions</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase">Reset: Sunday</span>
          </div>

          {weekly ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-350">Create 7 Posts</span>
                <span className="font-bold text-white">{weekly.postsCreated} / {weekly.postsRequired}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-350">Post 20 Comments</span>
                <span className="font-bold text-white">{weekly.commentsCreated} / {weekly.commentsRequired}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-350">Leave 25 Likes</span>
                <span className="font-bold text-white">{weekly.likesGiven} / {weekly.likesRequired}</span>
              </div>

              <button
                disabled={weekly.rewardClaimed || claiming || !(weekly.postsCreated >= weekly.postsRequired && weekly.commentsCreated >= weekly.commentsRequired && weekly.likesGiven >= weekly.likesRequired)}
                onClick={() => handleClaimReward(weekly._id)}
                className="mt-2 w-full py-2.5 bg-purple-650 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                {weekly.rewardClaimed ? 'Claimed ✔' : 'Claim Weekly Reward (+350 XP, +100 Coins)'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-550 italic">No weekly mission loaded.</p>
          )}
        </div>

      </div>

      {/* Daily Perks Checklist */}
      <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="border-b border-white/5 pb-2.5 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Daily Activities Checklist</span>
          <span className="text-[8px] text-purple-400 font-black uppercase">Earn daily coins & XP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Perk 1: Spin Wheel */}
          {(() => {
            const hasSpunToday = profile.spinWheelLastUsed && ((new Date().getTime() - new Date(profile.spinWheelLastUsed).getTime()) / (1000 * 60 * 60)) < 24;
            return (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                hasSpunToday ? 'bg-green-500/5 border-green-500/10 text-green-450' : 'bg-[#181822] border-white/5 text-slate-450'
              }`}>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-white">Daily Spin Wheel</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">{hasSpunToday ? 'Completed' : 'Available'}</span>
                </div>
                <span className="text-lg">{hasSpunToday ? '✔️' : '🎁'}</span>
              </div>
            );
          })()}

          {/* Perk 2: Coding Challenge */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            challengeSolved ? 'bg-green-500/5 border-green-500/10 text-green-450' : 'bg-[#181822] border-white/5 text-slate-450'
          }`}>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-white">Daily Code Arena</span>
              <span className="text-[8px] text-slate-400 mt-0.5">{challengeSolved ? 'Solved' : 'Available'}</span>
            </div>
            <span className="text-lg">{challengeSolved ? '✔️' : '💻'}</span>
          </div>

          {/* Perk 3: Daily Quiz */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            quizSolved ? 'bg-green-500/5 border-green-500/10 text-green-450' : 'bg-[#181822] border-white/5 text-slate-450'
          }`}>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-white">Daily Quiz Arena</span>
              <span className="text-[8px] text-slate-400 mt-0.5">{quizSolved ? 'Completed' : 'Available'}</span>
            </div>
            <span className="text-lg">{quizSolved ? '✔️' : '🧠'}</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-[#121217] border border-white/5 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="border-b border-white/5 pb-2.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Achievements Badges</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {badgeTemplates.map((badge, idx) => {
            const hasBadge = (profile.badges || []).some(b => b.name === badge.name);
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                  hasBadge 
                    ? 'bg-purple-600/5 border-purple-500/15 text-purple-400' 
                    : 'bg-[#181822] border-white/5 text-slate-500 opacity-60'
                }`}
              >
                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                  hasBadge ? 'bg-purple-600/10' : 'bg-white/5'
                }`}>
                  {badge.icon}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[10px] font-black text-white truncate">{badge.name}</span>
                  <span className="text-[8px] text-slate-450 leading-relaxed mt-0.5 line-clamp-2">{badge.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default RewardsDashboard;
