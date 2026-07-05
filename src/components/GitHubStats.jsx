import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaCodeBranch, FaStar, FaHistory, FaCode, FaHeart } from 'react-icons/fa';

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
    { label: 'Total Stars', value: '18', icon: <FaStar className="text-yellow-500" size={18} /> },
    { label: 'Total Commits', value: '412', icon: <FaCodeBranch className="text-primary-blue" size={18} /> },
    { label: 'PRs Merged', value: '34', icon: <FaHistory className="text-primary-purple" size={18} /> },
    { label: 'Repositories', value: '12', icon: <FaGithub className="text-slate-600 dark:text-slate-400" size={18} /> }
  ];

  const fallbackStreak = [
    { label: 'Total Contributions', value: '66', desc: 'Feb 24 - Present' },
    { label: 'Current Streak', value: '0', desc: 'Jul 2' },
    { label: 'Longest Streak', value: '5', desc: 'Oct 20 - Oct 24' }
  ];

  return (
    <section id="github" className="py-24 bg-slate-50 dark:bg-[#09090b] relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">Code Activity</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">GitHub Contributions</h2>
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
            <div className="glass p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col items-center min-h-[220px] justify-between">
              <h3 className="text-lg font-bold font-title text-black dark:text-white mb-4 w-full text-left flex items-center gap-2">
                <FaCode size={16} className="text-primary-cyan" /> Top Languages
              </h3>
              
              {!imgErrors.langs ? (
                <div className="w-full flex justify-center select-none filter dark:drop-shadow-[0_0_15px_rgba(0,210,255,0.05)]">
                  <img
                    src={langsUrl}
                    alt={`${username} GitHub Top Languages`}
                    onError={() => setImgErrors(prev => ({ ...prev, langs: true }))}
                    className="max-w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Beautiful CSS progress-bar rendering if Vercel server fails */
                <div className="w-full flex flex-col gap-3 py-2 px-1">
                  {fallbackLangs.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{item.name}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${item.percentage}%` }} className={`h-full ${item.color} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Counter Card */}
            <div className="glass p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col items-center min-h-[220px] justify-between">
              <h3 className="text-lg font-bold font-title text-black dark:text-white mb-4 w-full text-left flex items-center gap-2">
                <FaHistory size={16} className="text-primary-purple" /> GitHub Streak
              </h3>
              
              {!imgErrors.streak ? (
                <div className="w-full flex justify-center select-none filter dark:drop-shadow-[0_0_15px_rgba(134,59,251,0.05)]">
                  <img
                    src={streakUrl}
                    alt={`${username} GitHub Streak Stats`}
                    onError={() => setImgErrors(prev => ({ ...prev, streak: true }))}
                    className="max-w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Premium stats grid fallback */
                <div className="grid grid-cols-3 gap-3 w-full py-4 text-center">
                  {fallbackStreak.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200/40 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{item.label}</span>
                      <span className="text-xl font-black text-black dark:text-white">{item.value}</span>
                      <span className="text-[9px] text-slate-400">{item.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Profile Stats Card */}
            <div className="glass p-6 rounded-[24px] border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col items-center lg:col-span-2 min-h-[220px] justify-between">
              <h3 className="text-lg font-bold font-title text-black dark:text-white mb-4 w-full text-left flex items-center gap-2">
                <FaGithub size={16} className="text-primary-blue" /> Profile Overview
              </h3>
              
              {!imgErrors.stats ? (
                <div className="w-full flex justify-center select-none filter dark:drop-shadow-[0_0_20px_rgba(0,113,227,0.05)]">
                  <img
                    src={statsUrl}
                    alt={`${username} GitHub Profile Stats`}
                    onError={() => setImgErrors(prev => ({ ...prev, stats: true }))}
                    className="max-w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              ) : (
                /* Premium cards grid fallback */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full py-4 text-center">
                  {fallbackStats.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/40 dark:border-white/5">
                      <div className="mb-2 p-2 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">{item.icon}</div>
                      <span className="text-xl font-black text-black dark:text-white mb-0.5">{item.value}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
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
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-slate-900 hover:bg-slate-850 dark:bg-white/10 dark:hover:bg-white/15 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <FaGithub size={16} /> Explore GitHub Profile
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubStats;
