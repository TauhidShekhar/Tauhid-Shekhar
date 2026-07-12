import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { FaPaintBrush, FaLaptopCode, FaBriefcase, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const defaultExperiences = [
  {
    role: 'Lead Graphic Designer & Branding Specialist',
    company: 'Freelance & Client Collaborations',
    duration: '2023 - Present',
    type: 'design',
    description: 'Produced visual marketing assets and established custom branding identities for international clients and online content creators.',
    points: [
      'Designed 300+ viral YouTube Thumbnails, increasing average click-through rates (CTR) by up to 15%.',
      'Engineered professional logos, brand books, typography guidelines, and complete branding assets.',
      'Created high-converting marketing creatives for Instagram, Facebook, banners, and posters.',
      'Managed tight delivery schedules (24-48 hours turnaround) while maintaining client communication.'
    ]
  },
  {
    role: 'Full Stack & MERN Development Learning',
    company: 'Self-Directed Projects & Academic Studies',
    duration: '2023 - Present',
    type: 'development',
    description: 'Developed practical expertise in modern web technologies, building full stack projects and studying data structures.',
    points: [
      'Built full stack MERN web applications, integrating Node.js REST APIs with React frontends.',
      'Implemented secure user flows: JWT authentication, private routes, and MongoDB database modeling.',
      'Coded responsive web interfaces, utilizing semantic HTML5, modern CSS layouts, and UI frameworks.',
      'Practiced version control using Git & GitHub, deploying applications to Netlify and Vercel.'
    ]
  }
];

const Experience = ({ experienceData }) => {
  const [experiences, setExperiences] = useState(() => {
    return (experienceData && experienceData.length > 0) ? experienceData : [];
  });

  if (experienceData === null) {
    return (
      <section id="experience" className="py-24 bg-white dark:bg-slate-900/40 relative animate-pulse">
        <div className="max-w-[960px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="h-4 w-28 bg-purple-500/20 rounded mx-auto mb-2" />
            <div className="h-10 w-64 bg-slate-200 dark:bg-white/10 rounded mx-auto" />
          </div>
          <div className="flex flex-col gap-8">
            {[1, 2].map(n => (
              <div key={n} className="p-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col gap-3">
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-4 w-1/4 bg-slate-150 dark:bg-white/5 rounded" />
                <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    if (experienceData && experienceData.length > 0) {
      setExperiences(experienceData);
    } else {
      setExperiences([]);
    }
  }, [experienceData]);

  const getIcon = (type) => {
    if (type === 'design') return <FaPaintBrush className="text-[#863bfb]" />;
    if (type === 'development') return <FaLaptopCode className="text-primary-blue" />;
    return <FaBriefcase className="text-slate-450" />;
  };

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="experience" className="py-24 bg-white dark:bg-slate-900/40 relative">
      <div className="max-w-[960px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary-blue font-title mb-2">My Timeline</h3>
          <h2 className="text-3xl md:text-5xl font-black font-title tracking-tight text-black dark:text-white">Professional Experience</h2>
        </div>

        <motion.div
          variants={timelineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative pl-6 md:pl-12 border-l-2 border-slate-200 dark:border-white/5 flex flex-col gap-12"
        >
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative"
            >
              {/* Dot Icon */}
              <div className="absolute -left-[42px] md:-left-[66px] top-1.5 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-md z-10 hover:scale-110 transition-transform duration-300">
                {getIcon(exp.type)}
              </div>

              {/* Card */}
              <div className="glass p-6 md:p-8 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black font-title text-black dark:text-white leading-snug">
                      {exp.role}
                    </h3>
                    <span className="text-sm font-bold text-primary-blue font-title">
                      {exp.company}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs font-bold text-slate-500 dark:text-slate-400 font-title shrink-0 w-fit">
                    <FaCalendarAlt size={12} className="text-primary-blue" />
                    {exp.duration}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {exp.description}
                </p>

                {exp.points && exp.points.length > 0 && (
                  <ul className="grid grid-cols-1 gap-3 text-left">
                    {exp.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex gap-3 items-start text-sm text-slate-500 dark:text-slate-400">
                        <FaCheckCircle className="text-green-500 shrink-0 mt-0.5" size={14} />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
