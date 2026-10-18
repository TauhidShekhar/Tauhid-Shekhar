import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaCodeBranch, FaStar, FaHistory, FaCode } from 'react-icons/fa';

const GitHubStats = () => {
  const username = 'TauhidShekhar';
  const [imgErrors, setImgErrors] = useState({
    stats: false,
    langs: false,
    streak: false
  });

  const statsTheme = 'tokyonight';
  const streakTheme = 'tokyonight';

  // Using reliable parameters
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=${statsTheme}&border_radius=16&hide_border=true&bg_color=121214`;
  const langsUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${statsTheme}&border_radius=16&hide_border=true&bg_color=121214`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=${streakTheme}&border_radius=16&hide_border=true&background=121214`;

  // Premium CSS fallback stats
  const fallbackLangs = [
    { name: 'JavaScript', percentage: 48.5, color: 'bg-yellow-500' },
    { name: 'React / Next.js', percentage: 28.3, color: 'bg-cyan-500' },
    { name: 'Node.js / Express', percentage: 15.2, color: 'bg-green-500' },
    { name: 'HTML5 / CSS3', percentage: 8.0, color: 'bg-orange-500' }
  ];

  const fallbackStats = [
    { label: 'Total Stars', value: '18', icon: <FaStar className="text-amber-400" size={18} /> },
    { label: 'Total Commits', value: '412', icon: <FaCodeBranch className="text-[#C2272D] dark:text-[#00FFFF]" size={18} /> },
    { label: 'PRs Merged', value: '34', icon: <FaHistory className="text-[#00FFFF]" size={18} /> },
    { label: 'Repositories', value: '12', icon: <FaGithub className="text-[#525252] dark:text-[#D1D5DB]" size={18} /> }
  ];

  const fallbackStreak = [
    { label: 'Total Contributions', value: '66', desc: 'Active Dev Cycle' },
    { label: 'Current Streak', value: '0', desc: 'Code Submissions' },
    { label: 'Longest Streak', value: '5', desc: 'Consecutive Days' }
  ];

  return (
    <section id="github" className="py-24 bg-white/70 dark:bg-transparent relative text-left">
      <div className="max-w-[1280px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 mb-3">
            Open Source & Git
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            GitHub Contributions
          </h2>
          <p className="mt-3 text-base text-[#525252] dark:text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed">
            Continuous development activity, code commits, repositories, and technical contributions.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-10"
        >
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Languages Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#111111] p-4 xs:p-6 md:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex flex-col items-center min-h-[220px] justify-between">
              <h3 className="text-xl font-bold font-title text-[#171717] dark:text-white mb-4 w-full text-left flex items-center gap-2">
                <FaCode size={18} className="text-[#00FFFF]" /> Top Languages
              </h3>
              
              {!imgErrors.langs ? (
                <div className="w-full flex justify-center select-none filter dark:drop-shadow-[0_0_15px_rgba(0,255,255,0.05)]">
                  <img
                    src={langsUrl}
                    alt={`${username} GitHub Top Languages`}
                    onError={() => setImgErrors(prev => ({ ...prev, langs: true }))}
                    className="max-w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* CSS progress-bar rendering if external badge server fails */
                <div className="w-full flex flex-col gap-3 py-2 px-1">
                  {fallbackLangs.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-bold text-[#525252] dark:text-[#D1D5DB]">
                        <span>{item.name}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <div style={{ width: `${item.percentage}%` }} className={`h-full ${item.color} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Counter Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#111111] p-4 xs:p-6 md:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex flex-col items-center min-h-[220px] justify-between">
              <h3 className="text-xl font-bold font-title text-[#171717] dark:text-white mb-4 w-full text-left flex items-center gap-2">
                <FaHistory size={18} className="text-[#C2272D] dark:text-[#00FFFF]" /> GitHub Streak
              </h3>
              
              {!imgErrors.streak ? (
                <div className="w-full flex justify-center select-none filter dark:drop-shadow-[0_0_15px_rgba(194,39,45,0.05)]">
                  <img
                    src={streakUrl}
                    alt={`${username} GitHub Streak Stats`}
                    onError={() => setImgErrors(prev => ({ ...prev, streak: true }))}
                    className="max-w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Fallback streak metrics */
                <div className="grid grid-cols-3 gap-2 xs:gap-3 w-full py-4 text-center">
                  {fallbackStreak.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 p-2 xs:p-3 sm:p-3.5 bg-white dark:bg-white/5 rounded-xl border border-[#E5E7EB] dark:border-white/10">
                      <span className="text-[9px] xs:text-[10px] font-bold text-[#525252] dark:text-[#D1D5DB] uppercase tracking-wider">{item.label}</span>
                      <span className="text-lg xs:text-xl font-black text-[#171717] dark:text-white leading-tight">{item.value}</span>
                      <span className="text-[9px] xs:text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Profile Stats Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#111111] p-4 xs:p-6 md:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex flex-col items-center lg:col-span-2 min-h-[220px] justify-between">
              <h3 className="text-xl font-bold font-title text-[#171717] dark:text-white mb-4 w-full text-left flex items-center gap-2">
                <FaGithub size={20} className="text-[#C2272D] dark:text-[#00FFFF]" /> Profile Overview
              </h3>
              
              {!imgErrors.stats ? (
                <div className="w-full flex justify-center select-none filter dark:drop-shadow-[0_0_20px_rgba(194,39,45,0.05)]">
                  <img
                    src={statsUrl}
                    alt={`${username} GitHub Profile Stats`}
                    onError={() => setImgErrors(prev => ({ ...prev, stats: true }))}
                    className="max-w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Fallback stats cards */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full py-4 text-center">
                  {fallbackStats.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-white/5 rounded-xl border border-[#E5E7EB] dark:border-white/10">
                      <div className="mb-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">{item.icon}</div>
                      <span className="text-2xl font-black text-[#171717] dark:text-white mb-0.5">{item.value}</span>
                      <span className="text-xs font-bold text-[#525252] dark:text-[#D1D5DB] uppercase tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action CTA to visit GitHub */}
          <div className="text-center mt-4">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-full font-bold text-base shadow-md shadow-[#C2272D]/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-center"
            >
              <FaGithub size={18} /> Explore GitHub Profile
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubStats;
