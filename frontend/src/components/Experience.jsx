import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    return (experienceData && experienceData.length > 0) ? experienceData : defaultExperiences;
  });

  useEffect(() => {
    if (experienceData && experienceData.length > 0) {
      setExperiences(experienceData);
    } else {
      setExperiences(defaultExperiences);
    }
  }, [experienceData]);

  const getIcon = (type) => {
    if (type === 'design') return <FaPaintBrush className="text-[#C2272D]" size={20} />;
    if (type === 'development') return <FaLaptopCode className="text-[#00FFFF]" size={20} />;
    return <FaBriefcase className="text-[#C2272D]" size={20} />;
  };

  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="experience" className="py-24 sm:py-28 bg-white dark:bg-[#000000] relative">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2272D]/10 dark:bg-[#00FFFF]/10 border border-[#C2272D]/20 dark:border-[#00FFFF]/30 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-semibold tracking-wider uppercase mb-3">
            <span>Career Milestones</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Professional Experience
          </h2>
        </div>

        <motion.div
          variants={timelineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative pl-6 sm:pl-12 border-l-2 border-[#E5E7EB] dark:border-white/10 flex flex-col gap-10"
        >
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative"
            >
              {/* Timeline Icon Badge */}
              <div className="absolute -left-[45px] sm:-left-[69px] top-2 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white dark:bg-[#111111] border-2 border-[#E5E7EB] dark:border-white/10 flex items-center justify-center shadow-lg z-10 hover:scale-125 hover:rotate-6 transition-all duration-300 cursor-pointer">
                {getIcon(exp.type)}
              </div>

              {/* Experience Card */}
              <div className="bg-[#F8FAFC] dark:bg-[#111111] p-6 sm:p-7 rounded-3xl border border-[#E5E7EB] dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-[#C2272D]/10 dark:hover:shadow-[#00FFFF]/10 hover:border-[#C2272D] dark:hover:border-[#00FFFF] hover:-translate-y-1.5 transition-all duration-300 card-interactive">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                  <div>
                    <h3 className="text-lg sm:text-[20px] font-bold font-title text-[#171717] dark:text-white leading-snug">
                      {exp.role}
                    </h3>
                    <span className="text-[15px] font-semibold text-[#C2272D] dark:text-[#00FFFF] font-title">
                      {exp.company}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white dark:bg-white/5 border border-[#E5E7EB] dark:border-white/10 text-xs sm:text-[13px] font-medium text-[#525252] dark:text-[#D1D5DB] font-title shrink-0 w-fit">
                    <FaCalendarAlt size={12} className="text-[#C2272D] dark:text-[#00FFFF]" />
                    <span>{exp.duration}</span>
                  </span>
                </div>

                <p className="text-base text-[#525252] dark:text-[#D1D5DB] mb-5 leading-relaxed">
                  {exp.description}
                </p>

                {exp.points && exp.points.length > 0 && (
                  <ul className="grid grid-cols-1 gap-2.5 text-left">
                    {exp.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex gap-3 items-start text-sm sm:text-base text-[#525252] dark:text-[#D1D5DB]">
                        <FaCheckCircle className="text-[#C2272D] dark:text-[#00FFFF] shrink-0 mt-1" size={15} />
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
