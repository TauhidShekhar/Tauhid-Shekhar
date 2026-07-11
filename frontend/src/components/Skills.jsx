import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { 
  SiCplusplus, SiPython, SiJavascript, SiHtml5, SiReact, SiBootstrap, 
  SiNodedotjs, SiExpress, SiMongodb, SiMysql, SiGit, SiGithub, 
  SiPostman, SiNetlify, SiVercel, SiJsonwebtokens
} from 'react-icons/si';
import { FaCode, FaLaptopCode, FaServer, FaDatabase, FaTools, FaLightbulb, FaCss3Alt } from 'react-icons/fa';

const getIcon = (name, category) => {
  const key = name.toLowerCase();
  if (key.includes('c++') || key.includes('c /')) return <SiCplusplus className="text-[#00599C]" />;
  if (key.includes('python')) return <SiPython className="text-[#3776AB]" />;
  if (key.includes('javascript')) return <SiJavascript className="text-[#F7DF1E]" />;
  if (key.includes('html')) return <SiHtml5 className="text-[#E34F26]" />;
  if (key.includes('css')) return <FaCss3Alt className="text-[#1572B6]" />;
  if (key.includes('react')) return <SiReact className="text-[#61DAFB]" />;
  if (key.includes('bootstrap')) return <SiBootstrap className="text-[#7952B3]" />;
  if (key.includes('node')) return <SiNodedotjs className="text-[#339933]" />;
  if (key.includes('express')) return <SiExpress className="text-black dark:text-white" />;
  if (key.includes('mongodb')) return <SiMongodb className="text-[#47A248]" />;
  if (key.includes('mysql')) return <SiMysql className="text-[#4479A1]" />;
  if (key.includes('git')) return <SiGit className="text-[#F05032]" />;
  if (key.includes('github')) return <SiGithub className="text-black dark:text-white" />;
  if (key.includes('postman')) return <SiPostman className="text-[#FF6C37]" />;
  if (key.includes('netlify')) return <SiNetlify className="text-[#00C7B7]" />;
  if (key.includes('vercel')) return <SiVercel className="text-black dark:text-white" />;
  if (key.includes('jwt')) return <SiJsonwebtokens className="text-[#000000] dark:text-white" />;
  
  if (category === 'programming') return <FaCode className="text-primary-blue" />;
  if (category === 'frontend') return <FaLaptopCode className="text-primary-cyan" />;
  if (category === 'backend') return <FaServer className="text-primary-purple" />;
  if (category === 'database') return <FaDatabase className="text-green-500" />;
  return <FaTools className="text-slate-400" />;
};

const Skills = ({ skillsData }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [skillItems, setSkillItems] = useState(() => {
    const list = (skillsData && skillsData.length > 0) ? skillsData : defaultSkills;
    return list.map(skill => ({
      ...skill,
      icon: getIcon(skill.name, skill.category)
    }));
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'programming', name: 'Programming', icon: <FaCode size={13} /> },
    { id: 'frontend', name: 'Frontend', icon: <FaLaptopCode size={13} /> },
    { id: 'backend', name: 'Backend', icon: <FaServer size={13} /> },
    { id: 'database', name: 'Database', icon: <FaDatabase size={13} /> },
    { id: 'tools', name: 'Tools', icon: <FaTools size={13} /> },
    { id: 'concepts', name: 'Concepts', icon: <FaLightbulb size={13} /> },
  ];

  const defaultSkills = [
    { name: 'C / C++', percentage: 80, category: 'programming' },
    { name: 'Python', percentage: 75, category: 'programming' },
    { name: 'JavaScript (ES6)', percentage: 85, category: 'programming' },
    { name: 'HTML5', percentage: 95, category: 'frontend' },
    { name: 'CSS3', percentage: 90, category: 'frontend' },
    { name: 'React.js', percentage: 82, category: 'frontend' },
    { name: 'Bootstrap', percentage: 85, category: 'frontend' },
    { name: 'Responsive Design', percentage: 92, category: 'frontend' },
    { name: 'Node.js', percentage: 80, category: 'backend' },
    { name: 'Express.js', percentage: 82, category: 'backend' },
    { name: 'REST API', percentage: 88, category: 'backend' },
    { name: 'JWT Authentication', percentage: 85, category: 'backend' },
    { name: 'MongoDB', percentage: 85, category: 'database' },
    { name: 'MySQL', percentage: 80, category: 'database' },
    { name: 'Git', percentage: 85, category: 'tools' },
    { name: 'GitHub', percentage: 90, category: 'tools' },
    { name: 'VS Code', percentage: 92, category: 'tools' },
    { name: 'Postman', percentage: 88, category: 'tools' },
    { name: 'Netlify', percentage: 85, category: 'tools' },
    { name: 'Vercel', percentage: 85, category: 'tools' },
    { name: 'CRUD Operations', percentage: 90, category: 'concepts' },
    { name: 'MVC Architecture', percentage: 82, category: 'concepts' },
    { name: 'API Integration', percentage: 88, category: 'concepts' },
    { name: 'Responsive UI Design', percentage: 92, category: 'concepts' },
  ];



  useEffect(() => {
    if (skillsData && skillsData.length > 0) {
      setSkillItems(skillsData.map(skill => ({
        ...skill,
        icon: getIcon(skill.name, skill.category)
      })));
    } else if (skillsData) {
      setSkillItems(defaultSkills.map(skill => ({
        ...skill,
        icon: getIcon(skill.name, skill.category)
      })));
    }
  }, [skillsData]);

  useEffect(() => {
    if (skillsData) return;
    const fetchSkills = async () => {
      try {
        const res = await api.getSkills();
        if (res.success && res.data.length > 0) {
          setSkillItems(res.data.map(skill => ({
            ...skill,
            icon: getIcon(skill.name, skill.category)
          })));
        } else {
          setSkillItems(defaultSkills.map(skill => ({
            ...skill,
            icon: getIcon(skill.name, skill.category)
          })));
        }
      } catch (err) {
        // Safe local fallback if backend is offline
        setSkillItems(defaultSkills.map(skill => ({
          ...skill,
          icon: getIcon(skill.name, skill.category)
        })));
      }
    };
    fetchSkills();
  }, [skillsData]);

  const filteredSkills = activeFilter === 'all' 
    ? skillItems 
    : skillItems.filter(skill => skill.category === activeFilter);

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
                activeFilter === cat.id
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
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-6 rounded-2xl flex flex-col justify-between shadow-sm border border-slate-100 dark:border-white/5 hover:scale-[1.02] transition-transform duration-300 relative group overflow-hidden"
              >
                {/* Mouse hover glow line */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-blue to-primary-cyan opacity-80" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl filter drop-shadow-sm select-none">
                      {skill.icon}
                    </span>
                    <h4 className="text-base font-bold text-black dark:text-white font-title">
                      {skill.name}
                    </h4>
                  </div>
                  <span className="text-sm font-extrabold text-primary-blue">
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
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
