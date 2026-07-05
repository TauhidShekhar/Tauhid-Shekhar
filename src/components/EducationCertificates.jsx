import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FaGraduationCap, FaAward, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle, FaStar } from 'react-icons/fa';

const EducationCertificates = () => {
  const [activeTab, setActiveTab] = useState('education');
  const [educationList, setEducationList] = useState([]);
  const [certsList, setCertsList] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);

  const defaultEducation = [
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      school: 'Global Group of Institutes, Amritsar',
      duration: '2023 - 2026',
      grade: 'CGPA: 8.5 / 10',
      description: 'Focusing on database architectures, Object Oriented Programming in C++, Frontend Web structures, and Internet applications.'
    },
    {
      degree: 'Class XII (BSEB)',
      school: 'Bihar School Examination Board, Patna',
      duration: 'Passing Year: 2023',
      grade: 'Percentage: 56%',
      description: 'Completed Higher Secondary schooling with studies in Core Science subjects (Mathematics, Physics, Chemistry).'
    },
    {
      degree: 'Class X (BSEB)',
      school: 'Bihar School Examination Board, Patna',
      duration: 'Passing Year: 2021',
      grade: 'Percentage: 77.8%',
      description: 'Completed Secondary school matriculation exams with a first division standing.'
    }
  ];

  const defaultCertificates = [
    {
      title: 'Full Stack MERN Web Development',
      issuer: 'Online Learning Platform / Udemy',
      date: 'Dec 2024',
      credentialUrl: 'https://github.com/TauhidShekhar',
      image: { url: 'assits/Star_rating_4.5.png' }
    },
    {
      title: 'Advanced Photoshop Core Principles',
      issuer: 'Creative Design Academy',
      date: 'Aug 2023',
      credentialUrl: 'https://github.com/TauhidShekhar',
      image: { url: 'assits/Star_rating_4.5.png' }
    }
  ];

  const defaultAchievements = [
    {
      title: 'Full Stack Development Projects',
      description: 'Built multiple high-performance responsive web applications using MERN technologies.',
      icon: 'FaAward'
    },
    {
      title: 'Data Structures & Algorithms (DSA)',
      description: 'Deep interest and active practice in Full Stack Development and Data Structures & Algorithms.',
      icon: 'FaAward'
    },
    {
      title: 'Technical Content Creator',
      description: 'Technical content creator on professional networking and video platforms like LinkedIn and YouTube.',
      icon: 'FaAward'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eduRes, certRes, achRes] = await Promise.all([
          api.getEducation(),
          api.getCertificates(),
          api.getAchievements()
        ]);

        if (eduRes.success && eduRes.data && eduRes.data.length > 0) {
          setEducationList(eduRes.data);
        } else {
          setEducationList(defaultEducation);
        }

        if (certRes.success && certRes.data && certRes.data.length > 0) {
          setCertsList(certRes.data);
        } else {
          setCertsList(defaultCertificates);
        }

        if (achRes.success && achRes.data && achRes.data.length > 0) {
          setAchievementsList(achRes.data);
        } else {
          setAchievementsList(defaultAchievements);
        }
      } catch (err) {
        setEducationList(defaultEducation);
        setCertsList(defaultCertificates);
        setAchievementsList(defaultAchievements);
      }
    };
    loadData();
  }, []);

  const getAchievementIcon = (iconName) => {
    return <FaAward className="text-primary-blue" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-900/40 relative">
      {/* Anchors for routing link jumps */}
      <div id="education" className="absolute top-0" />
      <div id="achievements" className="absolute top-[35%]" />
      <div id="certificates" className="absolute top-[70%]" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-16 select-none border-b border-slate-200/50 dark:border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-2.5 pb-3 text-lg md:text-xl font-black font-title tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === 'education'
                ? 'text-primary-blue border-primary-blue'
                : 'text-slate-450 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FaGraduationCap size={18} /> Education
          </button>
          
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2.5 pb-3 text-lg md:text-xl font-black font-title tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'text-primary-blue border-primary-blue'
                : 'text-slate-450 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FaCheckCircle size={15} /> Achievements
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2.5 pb-3 text-lg md:text-xl font-black font-title tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === 'certificates'
                ? 'text-primary-blue border-primary-blue'
                : 'text-slate-450 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FaAward size={16} /> Certifications
          </button>
        </div>

        {/* Tab Contents */}
        <div className="max-w-[840px] mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'education' && (
              <motion.div
                key="education"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="relative pl-6 md:pl-12 border-l-2 border-slate-200 dark:border-white/5 flex flex-col gap-10 text-left"
              >
                {educationList.map((edu, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="relative">
                    {/* Bullet */}
                    <div className="absolute -left-[42px] md:-left-[66px] top-1.5 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center shadow-md z-10">
                      <FaGraduationCap className="text-primary-blue" size={18} />
                    </div>

                    {/* Card */}
                    <div className="glass p-6 md:p-8 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black font-title text-black dark:text-white leading-tight">
                            {edu.degree}
                          </h3>
                          <span className="text-sm font-bold text-slate-550 dark:text-slate-400">
                            {edu.school}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs font-bold text-slate-550 dark:text-slate-400 font-title shrink-0 w-fit">
                          <FaCalendarAlt size={12} className="text-primary-blue" />
                          {edu.duration}
                        </span>
                      </div>

                      {edu.grade && (
                        <div className="text-sm font-extrabold text-primary-blue font-title mb-3">
                          {edu.grade}
                        </div>
                      )}

                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-6 text-left"
              >
                {achievementsList.map((ach, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="glass p-6 md:p-8 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm flex items-start gap-5 hover:scale-[1.01] transition-transform duration-300"
                  >
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 shadow-inner">
                      {getAchievementIcon(ach.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-black font-title text-black dark:text-white mb-2">
                        {ach.title}
                      </h3>
                      <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                        {ach.description || ach.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'certificates' && (
              <motion.div
                key="certificates"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
              >
                {certsList.map((cert, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <div className="glass p-6 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-full hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        {/* Rating decoration logo */}
                        <div className="aspect-[4/1] w-32 overflow-hidden mb-6 filter dark:invert">
                          <img src={cert.image?.url || 'assits/Star_rating_4.5.png'} alt="Certificate Badge" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black font-title text-black dark:text-white mb-2 leading-tight">
                          {cert.title || cert.name}
                        </h3>
                        <div className="text-xs font-bold text-primary-blue font-title mb-4">
                          {cert.issuer}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4 mt-6">
                        <span className="text-[11px] font-bold text-slate-400">
                          {cert.date ? new Date(cert.date).toLocaleDateString() : ''}
                        </span>
                        {(cert.credentialUrl || cert.link) && (
                          <a
                            href={cert.credentialUrl || cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-blue transition-colors"
                          >
                            Credential <FaExternalLinkAlt size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default EducationCertificates;
