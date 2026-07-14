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

  const filteredSkills = activeFilter === 'all' 
    ? skillItems.filter(s => s.isActive !== false) 
    : skillItems.filter(s => s.isActive !== false && (s.category || '').toLowerCase() === activeFilter.toLowerCase());

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
    <section id="skills" className="py-24 bg-slate-50 dark:bg-black relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">Why Choose Me</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">Technical Skills</h2>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold font-title tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                activeFilter.toLowerCase() === cat.id.toLowerCase()
                  ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/20 -translate-y-0.5'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {cat.icon}
              {cat.name}
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
              const logoSrc = skill.logoType === 'custom' && skill.logoUrl ? skill.logoUrl : getAutoLogoUrl(skill.name);
              return (
                <motion.div
                  key={skill.name}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-6 rounded-2xl flex flex-col justify-between shadow-sm border border-slate-100 dark:border-white/5 hover:scale-[1.02] transition-transform duration-300 relative group overflow-hidden"
                  title={`${skill.name} - ${skill.category}`}
                >
                  {/* Mouse hover glow line */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-blue to-primary-cyan opacity-80" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-150 dark:border-white/5">
                        {logoSrc && (
                          <img 
                            src={logoSrc} 
                            alt="" 
                            className="w-8 h-8 object-contain select-none absolute z-10" 
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-400 border border-purple-500/10 flex items-center justify-center font-extrabold text-sm select-none">
                          {skill.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-start">
                        <h4 className="text-sm font-bold text-black dark:text-white font-title leading-none">
                          {skill.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5">
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-primary-blue">
                      {skill.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-200/60 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-primary-blue to-primary-cyan rounded-full"
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
