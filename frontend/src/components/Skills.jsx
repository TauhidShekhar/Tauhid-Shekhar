import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  SiCplusplus, SiPython, SiJavascript, SiHtml5, SiReact, SiBootstrap, 
  SiNodedotjs, SiExpress, SiMongodb, SiMysql, SiGit, SiGithub, 
  SiPostman, SiNetlify, SiVercel, SiJsonwebtokens
} from 'react-icons/si';
import { FaCode, FaLaptopCode, FaServer, FaDatabase, FaTools, FaLightbulb, FaCss3Alt } from 'react-icons/fa';
const getAutoLogoUrl = (skillName) => {
  const name = skillName.toLowerCase().trim();
  const mapping = {
    'html': { icon: 'html5', version: 'original' },
    'html5': { icon: 'html5', version: 'original' },
    'css': { icon: 'css3', version: 'original' },
    'css3': { icon: 'css3', version: 'original' },
    'javascript': { icon: 'javascript', version: 'original' },
    'js': { icon: 'javascript', version: 'original' },
    'javascript (es6)': { icon: 'javascript', version: 'original' },
    'typescript': { icon: 'typescript', version: 'original' },
    'ts': { icon: 'typescript', version: 'original' },
    'react': { icon: 'react', version: 'original' },
    'react.js': { icon: 'react', version: 'original' },
    'reactjs': { icon: 'react', version: 'original' },
    'next.js': { icon: 'nextjs', version: 'original' },
    'nextjs': { icon: 'nextjs', version: 'original' },
    'node.js': { icon: 'nodejs', version: 'original' },
    'nodejs': { icon: 'nodejs', version: 'original' },
    'express.js': { icon: 'express', version: 'original' },
    'expressjs': { icon: 'express', version: 'original' },
    'express': { icon: 'express', version: 'original' },
    'mongodb': { icon: 'mongodb', version: 'original' },
    'mongo': { icon: 'mongodb', version: 'original' },
    'mysql': { icon: 'mysql', version: 'original' },
    'postgresql': { icon: 'postgresql', version: 'original' },
    'postgres': { icon: 'postgresql', version: 'original' },
    'firebase': { icon: 'firebase', version: 'original' },
    'git': { icon: 'git', version: 'original' },
    'github': { icon: 'github', version: 'original' },
    'docker': { icon: 'docker', version: 'original' },
    'vs code': { icon: 'vscode', version: 'original' },
    'vscode': { icon: 'vscode', version: 'original' },
    'visual studio code': { icon: 'vscode', version: 'original' },
    'tailwind css': { icon: 'tailwindcss', version: 'original' },
    'tailwind': { icon: 'tailwindcss', version: 'original' },
    'tailwindcss': { icon: 'tailwindcss', version: 'original' },
    'bootstrap': { icon: 'bootstrap', version: 'original' },
    'python': { icon: 'python', version: 'original' },
    'java': { icon: 'java', version: 'original' },
    'c': { icon: 'c', version: 'original' },
    'c++': { icon: 'cplusplus', version: 'original' },
    'c / c++': { icon: 'cplusplus', version: 'original' },
    'cpp': { icon: 'cplusplus', version: 'original' },
    'php': { icon: 'php', version: 'original' },
    'laravel': { icon: 'laravel', version: 'original' },
    'angular': { icon: 'angular', version: 'original' },
    'vue.js': { icon: 'vuejs', version: 'original' },
    'vuejs': { icon: 'vuejs', version: 'original' },
    'vue': { icon: 'vuejs', version: 'original' },
    'redux': { icon: 'redux', version: 'original' },
    'linux': { icon: 'linux', version: 'original' },
    'figma': { icon: 'figma', version: 'original' },
    'canva': { icon: 'canva', version: 'original' },
    'adobe photoshop': { icon: 'photoshop', version: 'original' },
    'photoshop': { icon: 'photoshop', version: 'original' },
    'adobe illustrator': { icon: 'illustrator', version: 'original' },
    'illustrator': { icon: 'illustrator', version: 'original' },
    'go': { icon: 'go', version: 'original-wordmark' },
    'golang': { icon: 'go', version: 'original-wordmark' },
    'graphql': { icon: 'graphql', version: 'plain' },
    'kubernetes': { icon: 'kubernetes', version: 'plain' },
    'k8s': { icon: 'kubernetes', version: 'plain' },
    'aws': { icon: 'amazonwebservices', version: 'original' },
    'amazon web services': { icon: 'amazonwebservices', version: 'original' },
    'sass': { icon: 'sass', version: 'original' },
    'scss': { icon: 'sass', version: 'original' },
    'jquery': { icon: 'jquery', version: 'original' },
    'webpack': { icon: 'webpack', version: 'original' },
    'npm': { icon: 'npm', version: 'original-wordmark' },
    'yarn': { icon: 'yarn', version: 'original' },
    'rust': { icon: 'rust', version: 'original' },
    'sqlite': { icon: 'sqlite', version: 'original' },
    'redis': { icon: 'redis', version: 'original' },
    'django': { icon: 'django', version: 'plain' },
    'flask': { icon: 'flask', version: 'original' },
    'spring': { icon: 'spring', version: 'original' },
    'spring boot': { icon: 'spring', version: 'original' }
  };

  const match = mapping[name];
  if (match) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${match.icon}/${match.icon}-${match.version}.svg`;
  }
  const alphanumericName = name.replace(/[^a-z0-9]/g, '');
  if (alphanumericName && alphanumericName.length > 1) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${alphanumericName}/${alphanumericName}-original.svg`;
  }
  return '';
};

const CATEGORY_LOGOS = {
  'Programming': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  'Frontend': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
  'Backend': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
  'Database': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',
  'Tools': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
  'Concepts': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg'
};

const getSkillLogoUrl = (skill) => {
  if (skill.logoType === 'custom' && skill.logoUrl) {
    return skill.logoUrl;
  }
  const autoUrl = getAutoLogoUrl(skill.name);
  if (autoUrl) {
    return autoUrl;
  }
  if (skill.useCategoryFallback !== false) {
    const prim = skill.primaryCategory || (skill.categories && skill.categories[0]) || skill.category || 'Frontend';
    const norm = prim.charAt(0).toUpperCase() + prim.slice(1).toLowerCase();
    let matchKey = 'Frontend';
    if (norm === 'programming') matchKey = 'Programming';
    else if (norm === 'frontend') matchKey = 'Frontend';
    else if (norm === 'backend') matchKey = 'Backend';
    else if (norm === 'database') matchKey = 'Database';
    else if (norm === 'tools') matchKey = 'Tools';
    else if (norm === 'concepts') matchKey = 'Concepts';
    return CATEGORY_LOGOS[matchKey] || CATEGORY_LOGOS['Frontend'];
  }
  return '';
};

const defaultSkills = [
  { name: 'C / C++', percentage: 80, category: 'Programming' },
  { name: 'Python', percentage: 75, category: 'Programming' },
  { name: 'JavaScript (ES6)', percentage: 85, category: 'Programming' },
  { name: 'HTML5', percentage: 95, category: 'Frontend' },
  { name: 'CSS3', percentage: 90, category: 'Frontend' },
  { name: 'React.js', percentage: 82, category: 'Frontend' },
  { name: 'Bootstrap', percentage: 85, category: 'Frontend' },
  { name: 'Responsive Design', percentage: 92, category: 'Frontend' },
  { name: 'Node.js', percentage: 80, category: 'Backend' },
  { name: 'Express.js', percentage: 82, category: 'Backend' },
  { name: 'REST API', percentage: 88, category: 'Backend' },
  { name: 'JWT Authentication', percentage: 85, category: 'Backend' },
  { name: 'MongoDB', percentage: 85, category: 'Database' },
  { name: 'MySQL', percentage: 80, category: 'Database' },
  { name: 'Git', percentage: 85, category: 'Tools' },
  { name: 'GitHub', percentage: 90, category: 'Tools' },
  { name: 'VS Code', percentage: 92, category: 'Tools' },
  { name: 'Postman', percentage: 88, category: 'Tools' },
  { name: 'Netlify', percentage: 85, category: 'Tools' },
  { name: 'Vercel', percentage: 85, category: 'Tools' },
  { name: 'CRUD Operations', percentage: 90, category: 'Concepts' },
  { name: 'MVC Architecture', percentage: 82, category: 'Concepts' },
  { name: 'API Integration', percentage: 88, category: 'Concepts' },
  { name: 'Responsive UI Design', percentage: 92, category: 'Concepts' },
];

const Skills = ({ skillsData }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'Programming', name: 'Programming', icon: <FaCode size={13} /> },
    { id: 'Frontend', name: 'Frontend', icon: <FaLaptopCode size={13} /> },
    { id: 'Backend', name: 'Backend', icon: <FaServer size={13} /> },
    { id: 'Database', name: 'Database', icon: <FaDatabase size={13} /> },
    { id: 'Tools', name: 'Tools', icon: <FaTools size={13} /> },
    { id: 'Concepts', name: 'Concepts', icon: <FaLightbulb size={13} /> },
  ];

  const [skillItems, setSkillItems] = useState(() => {
    return (skillsData && skillsData.length > 0) ? skillsData : defaultSkills;
  });

  if (skillsData === null) {
    return (
      <section id="skills" className="py-24 bg-slate-50 dark:bg-slate-950/20 relative">
        <div className="max-w-[960px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-4 w-24 bg-purple-500/20 rounded mx-auto mb-2" />
            <div className="h-10 w-48 bg-slate-200 dark:bg-white/10 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-250/50 dark:border-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    if (skillsData && skillsData.length > 0) {
      setSkillItems(skillsData);
    } else {
      setSkillItems(defaultSkills);
    }
  }, [skillsData]);

  const getSkillCategories = (skill) => {
    if (skill.categories && Array.isArray(skill.categories) && skill.categories.length > 0) {
      return skill.categories;
    }
    if (skill.category) {
      return [skill.category];
    }
    return [];
  };

  const filteredSkills = activeFilter === 'all' 
    ? skillItems.filter(s => s.isActive !== false) 
    : skillItems.filter(s => {
        if (s.isActive === false) return false;
        const cats = getSkillCategories(s);
        return cats.some(cat => cat.toLowerCase() === activeFilter.toLowerCase());
      });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="skills" className="py-24 sm:py-28 bg-white dark:bg-[#000000] relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>Core Competencies</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Technical Skills & Tooling
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-12" role="tablist" aria-label="Skill Categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              role="tab"
              aria-selected={activeFilter.toLowerCase() === cat.id.toLowerCase()}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[14px] font-medium tracking-wider uppercase border transition-all duration-200 cursor-pointer ${
                activeFilter.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-[#C2272D] border-[#C2272D] text-white shadow-md shadow-[#C2272D]/20 -translate-y-0.5'
                  : 'bg-[#F8FAFC] dark:bg-[#111111] border-[#E5E7EB] dark:border-white/10 text-[#525252] dark:text-[#D1D5DB] hover:border-[#C2272D] dark:hover:border-[#00FFFF]'
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => {
              const logoSrc = getSkillLogoUrl(skill);
              const cats = getSkillCategories(skill);
              return (
                <motion.div
                  key={skill.name}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#F8FAFC] dark:bg-[#111111] p-5 sm:p-6 rounded-2xl flex flex-col justify-between shadow-sm border border-[#E5E7EB] dark:border-white/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] hover:scale-[1.02] transition-all duration-200 relative group overflow-hidden"
                  title={`${skill.name} - ${cats.join(', ')}`}
                >
                  {/* Left Accent indicator */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#C2272D] to-[#00FFFF] opacity-90" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0 bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-white/10">
                        {logoSrc && (
                          <img 
                            src={logoSrc} 
                            alt="" 
                            className="w-8 h-8 object-contain select-none absolute z-10" 
                            loading="lazy"
                            onError={(e) => {
                              const primaryCat = skill.primaryCategory || cats[0] || 'Frontend';
                              const fallbackLogo = CATEGORY_LOGOS[primaryCat] || CATEGORY_LOGOS['Frontend'];
                              if (skill.useCategoryFallback !== false && e.target.src !== fallbackLogo) {
                                e.target.src = fallbackLogo;
                              } else {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        )}
                        <div className="w-12 h-12 rounded-xl bg-[#C2272D]/10 text-[#C2272D] dark:text-[#00FFFF] flex items-center justify-center font-bold text-sm select-none">
                          {skill.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-start text-left">
                        <h3 className="text-base sm:text-[18px] font-semibold text-[#171717] dark:text-white font-title leading-tight">
                          {skill.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {cats.map((cat) => (
                            <span key={cat} className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-white dark:bg-white/5 text-[#525252] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-white/5">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#C2272D] dark:text-[#00FFFF]">
                      {skill.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-[#C2272D] to-[#00FFFF] rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
