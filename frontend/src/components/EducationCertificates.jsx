import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { FaGraduationCap, FaAward, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle, FaStar } from 'react-icons/fa';
import { getCacheBustedUrl } from '../utils/cacheBuster';

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

const EducationCertificates = ({ educationData, certificatesData, achievementsData }) => {
  const [activeTab, setActiveTab] = useState('education');
  const [educationList, setEducationList] = useState(() => {
    return (educationData && educationData.length > 0) ? educationData : [];
  });
  const [certsList, setCertsList] = useState(() => {
    return (certificatesData && certificatesData.length > 0) ? certificatesData : [];
  });
  const [achievementsList, setAchievementsList] = useState(() => {
    return (achievementsData && achievementsData.length > 0) ? achievementsData : [];
  });

  if (educationData === null && certificatesData === null) {
    return (
      <section id="education" className="py-24 bg-white dark:bg-[#000000] relative animate-pulse">
        <div className="max-w-[960px] mx-auto px-6 md:px-12">
          <div className="h-10 w-64 bg-slate-200 dark:bg-white/10 rounded mx-auto mb-16 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(n => (
              <div key={n} className="h-48 bg-slate-50 dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    if (educationData && educationData.length > 0) {
      setEducationList(educationData);
    } else {
      setEducationList([]);
    }
  }, [educationData]);

  useEffect(() => {
    if (certificatesData && certificatesData.length > 0) {
      setCertsList(certificatesData);
    } else {
      setCertsList([]);
    }
  }, [certificatesData]);

  useEffect(() => {
    if (achievementsData && achievementsData.length > 0) {
      setAchievementsList(achievementsData);
    } else {
      setAchievementsList([]);
    }
  }, [achievementsData]);

  const getAchievementIcon = (iconName) => {
    return <FaAward className="text-[#C2272D] dark:text-[#00FFFF]" />;
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
    <section className="py-24 bg-white dark:bg-[#000000] relative text-left">
      {/* Anchors for routing link jumps */}
      <div id="education" className="absolute top-0" />
      <div id="achievements" className="absolute top-[35%]" />
      <div id="certificates" className="absolute top-[70%]" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 mb-3">
            Academic & Honors
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold font-title tracking-tight text-[#171717] dark:text-white">
            Education & Certifications
          </h2>
          <p className="mt-3 text-base text-[#525252] dark:text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed">
            Formal computer applications degree, professional verified certifications, and core milestones.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-14 select-none border-b border-slate-200 dark:border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center gap-2.5 pb-3 text-base md:text-lg font-semibold font-title tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === 'education'
                ? 'text-[#C2272D] border-[#C2272D] dark:text-[#00FFFF] dark:border-[#00FFFF]'
                : 'text-[#525252] dark:text-[#D1D5DB] border-transparent hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            <FaGraduationCap size={18} /> Education
          </button>
          
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2.5 pb-3 text-base md:text-lg font-semibold font-title tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'text-[#C2272D] border-[#C2272D] dark:text-[#00FFFF] dark:border-[#00FFFF]'
                : 'text-[#525252] dark:text-[#D1D5DB] border-transparent hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            <FaCheckCircle size={16} /> Achievements
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2.5 pb-3 text-base md:text-lg font-semibold font-title tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === 'certificates'
                ? 'text-[#C2272D] border-[#C2272D] dark:text-[#00FFFF] dark:border-[#00FFFF]'
                : 'text-[#525252] dark:text-[#D1D5DB] border-transparent hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            <FaAward size={17} /> Certifications
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
                className="relative pl-7 xs:pl-8 md:pl-12 border-l-2 border-slate-200 dark:border-white/10 flex flex-col gap-8 md:gap-10 text-left"
              >
                {educationList.map((edu, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="relative">
                    {/* Bullet */}
                    <div className="absolute -left-[43px] xs:-left-[47px] md:-left-[66px] top-1.5 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-md z-10">
                      <FaGraduationCap className="text-[#C2272D] dark:text-[#00FFFF]" size={18} />
                    </div>

                    {/* Card */}
                    <div className="bg-[#F8FAFC] dark:bg-[#111111] p-5 xs:p-6 md:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg md:text-[20px] font-bold font-title text-[#171717] dark:text-white leading-tight">
                            {edu.degree}
                          </h3>
                          <span className="text-sm font-semibold text-[#525252] dark:text-[#D1D5DB]">
                            {edu.school}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-[#525252] dark:text-[#D1D5DB] font-title shrink-0 w-fit">
                          <FaCalendarAlt size={12} className="text-[#C2272D] dark:text-[#00FFFF]" />
                          {edu.duration}
                        </span>
                      </div>

                      {edu.grade && (
                        <div className="text-sm font-bold text-[#C2272D] dark:text-[#00FFFF] font-title mb-2.5">
                          {edu.grade}
                        </div>
                      )}

                      <p className="text-base text-[#525252] dark:text-[#D1D5DB] leading-relaxed">
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
                    className="bg-[#F8FAFC] dark:bg-[#111111] p-6 md:p-8 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex items-start gap-5 hover:scale-[1.01] transition-transform duration-300"
                  >
                    <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                      {getAchievementIcon(ach.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold font-title text-[#171717] dark:text-white mb-2">
                        {ach.title}
                      </h3>
                      <p className="text-base text-[#525252] dark:text-[#D1D5DB] leading-relaxed">
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
                    <div className="bg-[#F8FAFC] dark:bg-[#111111] p-6 rounded-2xl border border-[#E5E7EB] dark:border-white/10 shadow-sm flex flex-col justify-between h-full hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        {/* Rating decoration logo */}
                        <div className="aspect-[4/1] w-32 overflow-hidden mb-6 filter dark:invert">
                          <img src={getCacheBustedUrl(cert.image?.url || 'assits/Star_rating_4.5.png', cert.updatedAt)} alt="Certificate Badge" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold font-title text-[#171717] dark:text-white mb-2 leading-tight">
                          {cert.title || cert.name}
                        </h3>
                        <div className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] font-title mb-4">
                          {cert.issuer}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-[#E5E7EB] dark:border-white/10 pt-4 mt-6">
                        <span className="text-xs font-bold text-slate-400">
                          {cert.date ? new Date(cert.date).toLocaleDateString() : ''}
                        </span>
                        {(cert.credentialUrl || cert.link) && (
                          <a
                            href={cert.credentialUrl || cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-[#525252] dark:text-[#D1D5DB] hover:text-[#C2272D] dark:hover:text-[#00FFFF] transition-colors"
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
