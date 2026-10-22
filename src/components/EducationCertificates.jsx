import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGraduationCap,
  FaAward,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaStar,
  FaUniversity,
  FaCertificate,
  FaTrophy,
  FaMedal,
  FaSearch,
  FaTimes,
  FaCopy,
  FaCheck,
  FaDownload,
  FaMapMarkerAlt,
  FaEye,
  FaCode,
  FaShieldAlt,
  FaLayerGroup
} from 'react-icons/fa';
import { getCacheBustedUrl } from '../utils/cacheBuster';

// Fallback initial data in case database is empty
const defaultEducation = [
  {
    _id: 'default-edu-1',
    degree: 'Bachelor of Computer Applications (BCA)',
    school: 'Global Group of Institutes, Amritsar',
    duration: '2023 - 2026',
    grade: 'CGPA: 8.5 / 10',
    status: 'Pursuing (Final Year)',
    fieldOfStudy: 'Computer Science & Software Applications',
    location: 'Amritsar, Punjab',
    honors: 'Academic Honors • CGPA 8.5',
    description: 'Specializing in Database Management Systems (DBMS), Advanced Object-Oriented Programming (C++ / Java), Full-Stack Web Architectures, Data Structures & Algorithms, and Computer Networking.'
  },
  {
    _id: 'default-edu-2',
    degree: 'Class XII (Senior Secondary / BSEB)',
    school: 'Bihar School Examination Board, Patna',
    duration: '2021 - 2023',
    grade: 'Percentage: 56%',
    status: 'Completed',
    fieldOfStudy: 'Pure Sciences (Mathematics, Physics, Chemistry)',
    location: 'Patna, Bihar',
    honors: 'Higher Secondary Science Stream',
    description: 'Completed Higher Secondary schooling with intensive coursework in Advanced Mathematics, Modern Physics, and Analytical Chemistry.'
  },
  {
    _id: 'default-edu-3',
    degree: 'Class X (Secondary Matriculation / BSEB)',
    school: 'Bihar School Examination Board, Patna',
    duration: 'Passing Year: 2021',
    grade: 'Percentage: 77.8% (First Division)',
    status: 'Completed',
    fieldOfStudy: 'General Sciences & Mathematics',
    location: 'Patna, Bihar',
    honors: 'First Division Honors',
    description: 'Completed Secondary Matriculation examination with First Division standing and high marks in Mathematics, Science, and Social Sciences.'
  }
];

const defaultCertificates = [
  {
    _id: 'default-cert-1',
    title: 'Full Stack MERN Web Development',
    issuer: 'Online Learning Platform / Apna College',
    date: '2024-12-01',
    category: 'Full Stack Web Engineering',
    credentialId: 'MERN-TS-2024-VERIFIED',
    credentialUrl: 'https://github.com/TauhidShekhar',
    pdfUrl: 'https://res.cloudinary.com/jzn3g5bv/raw/upload/v1785755014/portfolio/media_library/iehvrphh1gr3ztzqlcyi',
    image: {
      url: 'https://res.cloudinary.com/jzn3g5bv/image/upload/v1785755019/portfolio/media_library/e7xp3c2w1mfmozcnklia.png'
    }
  },
  {
    _id: 'default-cert-2',
    title: 'Advanced Photoshop Core Principles',
    issuer: 'Creative Design Academy',
    date: '2023-08-01',
    category: 'UI/UX & Visual Design',
    credentialId: 'CDA-PS-7749',
    credentialUrl: 'https://github.com/TauhidShekhar',
    image: {
      url: 'assits/Star_rating_4.5.png'
    }
  }
];

const defaultAchievements = [
  {
    _id: 'default-ach-1',
    title: 'Full Stack Enterprise Projects',
    category: 'Engineering Milestone',
    description: 'Engineered scalable enterprise web applications, real-time community dashboards, dynamic form engines, and authenticated cloud CMS ecosystems using MERN & Tailwind CSS.',
    icon: 'FaCode',
    date: '2024 - Present'
  },
  {
    _id: 'default-ach-2',
    title: 'Data Structures & Algorithms (DSA)',
    category: 'Algorithmic Mastery',
    description: 'Active problem solver with deep conceptual mastery in Array manipulations, Recursion, Dynamic Programming, Graphs, and computational complexity optimization.',
    icon: 'FaTrophy',
    date: 'Ongoing Practice'
  },
  {
    _id: 'default-ach-3',
    title: 'Technical Content & Community Creator',
    category: 'Leadership & Mentorship',
    description: 'Dedicated tech content creator and educator across LinkedIn, YouTube, and developer forums, sharing insights on Full Stack development, modern JavaScript, and UI design patterns.',
    icon: 'FaAward',
    date: 'Active Community'
  }
];

const EducationCertificates = ({ educationData, certificatesData, achievementsData }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'education', 'certificates', 'achievements'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Sync state with incoming props or fallback
  const educationList = useMemo(() => {
    return Array.isArray(educationData) && educationData.length > 0 ? educationData : defaultEducation;
  }, [educationData]);

  const certsList = useMemo(() => {
    return Array.isArray(certificatesData) && certificatesData.length > 0 ? certificatesData : defaultCertificates;
  }, [certificatesData]);

  const achievementsList = useMemo(() => {
    return Array.isArray(achievementsData) && achievementsData.length > 0 ? achievementsData : defaultAchievements;
  }, [achievementsData]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCertificate(null);
    };
    if (selectedCertificate) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedCertificate]);

  const handleCopyCredential = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Search filtering
  const q = searchQuery.toLowerCase().trim();

  const filteredEducation = useMemo(() => {
    if (!q) return educationList;
    return educationList.filter(
      (e) =>
        e.degree?.toLowerCase().includes(q) ||
        e.school?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.grade?.toLowerCase().includes(q) ||
        e.fieldOfStudy?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [educationList, q]);

  const filteredCertificates = useMemo(() => {
    if (!q) return certsList;
    return certsList.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.issuer?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.credentialId?.toLowerCase().includes(q)
    );
  }, [certsList, q]);

  const filteredAchievements = useMemo(() => {
    if (!q) return achievementsList;
    return achievementsList.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
    );
  }, [achievementsList, q]);

  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'FaTrophy':
        return <FaTrophy className="text-amber-500 text-xl md:text-2xl" />;
      case 'FaMedal':
        return <FaMedal className="text-cyan-400 text-xl md:text-2xl" />;
      case 'FaCode':
        return <FaCode className="text-[#C2272D] dark:text-[#00FFFF] text-xl md:text-2xl" />;
      case 'FaStar':
        return <FaStar className="text-amber-400 text-xl md:text-2xl" />;
      default:
        return <FaAward className="text-[#C2272D] dark:text-[#00FFFF] text-xl md:text-2xl" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <section id="education" className="scroll-mt-24 py-20 lg:py-28 bg-slate-50/70 dark:bg-black/40 text-slate-900 dark:text-white relative overflow-hidden text-left transition-colors duration-300">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C2272D]/10 dark:bg-[#C2272D]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-[#00FFFF]/10 dark:bg-[#00FFFF]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Anchor targets for direct navbar link jumps */}
      <div id="achievements" className="absolute top-[35%]" />
      <div id="certificates" className="absolute top-[65%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        
        {/* ==================== 1. SECTION HEADER ==================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 dark:bg-[#C2272D]/15 text-[#C2272D] dark:text-[#00FFFF] text-xs sm:text-sm font-extrabold tracking-wider uppercase border border-rose-500/25 dark:border-[#C2272D]/30 shadow-sm backdrop-blur-sm">
            <FaGraduationCap size={14} className="animate-pulse" />
            <span>Academic Excellence & Verified Honors</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Manrope'] tracking-tight text-slate-900 dark:text-white">
            Academic & Honors
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-['Inter'] leading-relaxed max-w-2xl mx-auto">
            Comprehensive overview of university qualifications, professional certifications, algorithmic accomplishments, and recognized tech milestones.
          </p>
        </div>

        {/* ==================== 2. PROMINENT IMPACT STATS BAR ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Degree Stat */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-rose-500/10 text-[#C2272D] flex items-center justify-center font-bold">
                <FaGraduationCap size={18} />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                BCA Degree
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Global Institutes • CGPA 8.5
              </div>
            </div>
          </div>

          {/* Certifications Stat */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-[#00FFFF]/10 text-cyan-600 dark:text-[#00FFFF] flex items-center justify-center font-bold">
                <FaCertificate size={18} />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Verified
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                {certsList.length}+ Certifications
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                MERN & Graphic Design
              </div>
            </div>
          </div>

          {/* Honors Stat */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <FaTrophy size={18} />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Honors
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                {achievementsList.length} Milestones
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                DSA, Full-Stack & Mentorship
              </div>
            </div>
          </div>

          {/* Authenticity Stat */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <FaShieldAlt size={18} />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                100% Genuine
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                Authenticated
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Verified Board & Institute Marks
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 3. CONTROLS: TABS & SEARCH BAR ==================== */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Segment Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/25'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <FaLayerGroup size={13} />
              <span>All Highlights</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {educationList.length + certsList.length + achievementsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('education')}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'education'
                  ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/25'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <FaGraduationCap size={14} />
              <span>Academics</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {educationList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'certificates'
                  ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/25'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <FaCertificate size={13} />
              <span>Certifications</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {certsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'achievements'
                  ? 'bg-[#C2272D] text-white shadow-md shadow-[#C2272D]/25'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <FaTrophy size={13} />
              <span>Honors</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                {achievementsList.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <FaSearch size={12} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search degrees, certs, skills..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#C2272D] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <FaTimes size={11} />
              </button>
            )}
          </div>
        </div>

        {/* ==================== 4. MAIN CONTENT PANELS ==================== */}
        <div>
          {/* 4A. ALL HIGHLIGHTS OVERVIEW */}
          {activeTab === 'all' && (
            <div className="space-y-12">
              {/* Featured Academic Degree */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-rose-500/10 text-[#C2272D] flex items-center justify-center">
                      <FaGraduationCap size={15} />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                      Higher Academic Degrees
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('education')}
                    className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View all ({educationList.length})</span>
                    <FaExternalLinkAlt size={9} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEducation.slice(0, 3).map((edu) => renderEducationCard(edu))}
                </div>
              </div>

              {/* Featured Industry Certifications */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#00FFFF]/10 text-cyan-600 dark:text-[#00FFFF] flex items-center justify-center">
                      <FaCertificate size={15} />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                      Verified Industry Credentials
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View all ({certsList.length})</span>
                    <FaExternalLinkAlt size={9} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCertificates.slice(0, 2).map((cert) => renderCertificateCard(cert))}
                </div>
              </div>

              {/* Featured Honors & Milestones */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <FaTrophy size={15} />
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                      Honors & Distinctions
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View all ({achievementsList.length})</span>
                    <FaExternalLinkAlt size={9} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredAchievements.slice(0, 3).map((ach) => renderAchievementCard(ach))}
                </div>
              </div>
            </div>
          )}

          {/* 4B. DEDICATED ACADEMIC DEGREES TAB */}
          {activeTab === 'education' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {filteredEducation.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8">
                  <FaGraduationCap size={36} className="mx-auto text-slate-400 mb-3" />
                  <h4 className="text-base font-bold">No academic records match your search</h4>
                  <p className="text-xs text-slate-500 mt-1">Try clearing your search query above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {filteredEducation.map((edu) => renderEducationCard(edu, true))}
                </div>
              )}
            </motion.div>
          )}

          {/* 4C. DEDICATED CERTIFICATIONS TAB */}
          {activeTab === 'certificates' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {filteredCertificates.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8">
                  <FaCertificate size={36} className="mx-auto text-slate-400 mb-3" />
                  <h4 className="text-base font-bold">No certifications match your search</h4>
                  <p className="text-xs text-slate-500 mt-1">Try clearing your search query above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCertificates.map((cert) => renderCertificateCard(cert, true))}
                </div>
              )}
            </motion.div>
          )}

          {/* 4D. DEDICATED HONORS & ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {filteredAchievements.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8">
                  <FaTrophy size={36} className="mx-auto text-slate-400 mb-3" />
                  <h4 className="text-base font-bold">No honors or achievements match your search</h4>
                  <p className="text-xs text-slate-500 mt-1">Try clearing your search query above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map((ach) => renderAchievementCard(ach, true))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ==================== 5. FOOTER VERIFICATION BADGE ==================== */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <FaCheckCircle size={22} />
            </div>
            <div>
              <div className="text-base font-extrabold font-['Manrope'] flex items-center gap-2">
                <span>Verified Academic & Industry Credential Portfolio</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-0.5">
                Every listed credential, university qualification, and score is verified through legitimate board certificates, university records, and institutional transcripts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-2xl bg-[#C2272D] hover:bg-[#a81f25] text-white text-xs font-bold shadow-lg shadow-[#C2272D]/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Request Verification Docs</span>
              <FaExternalLinkAlt size={10} />
            </a>
          </div>
        </div>

      </div>

      {/* ==================== 6. INTERACTIVE CERTIFICATE MODAL ==================== */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Modal"
              >
                <FaTimes size={14} />
              </button>

              <div className="space-y-6 text-left">
                {/* Header */}
                <div className="pr-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-[#00FFFF]/10 text-cyan-600 dark:text-[#00FFFF] border border-[#00FFFF]/30 mb-2">
                    <FaCertificate size={11} />
                    <span>{selectedCertificate.category || 'Professional Credential'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-['Manrope'] text-slate-900 dark:text-white">
                    {selectedCertificate.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Issuer: {selectedCertificate.issuer}
                    </span>
                    {selectedCertificate.date && (
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={10} className="text-[#C2272D]" />
                        <span>Issued: {new Date(selectedCertificate.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Certificate Preview Image */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/5 dark:bg-black/50 p-2 sm:p-4 flex items-center justify-center min-h-[260px] overflow-hidden">
                  <img
                    src={getCacheBustedUrl(selectedCertificate.image?.url || 'assits/Star_rating_4.5.png', selectedCertificate.updatedAt)}
                    alt={selectedCertificate.title}
                    className="max-h-[380px] w-auto max-w-full rounded-xl object-contain shadow-md"
                  />
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  {selectedCertificate.credentialId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Credential Identification:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                          {selectedCertificate.credentialId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCredential(selectedCertificate.credentialId)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white cursor-pointer"
                          title="Copy Credential ID"
                        >
                          {copiedId === selectedCertificate.credentialId ? (
                            <FaCheck size={11} className="text-emerald-500" />
                          ) : (
                            <FaCopy size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {selectedCertificate.pdfUrl && (
                      <a
                        href={selectedCertificate.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <FaDownload size={11} />
                        <span>Download PDF</span>
                      </a>
                    )}

                    {(selectedCertificate.credentialUrl || selectedCertificate.link) && (
                      <a
                        href={selectedCertificate.credentialUrl || selectedCertificate.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white flex items-center gap-1.5 shadow-md shadow-[#C2272D]/25 transition-all"
                      >
                        <span>Verify On Authority</span>
                        <FaExternalLinkAlt size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );

  // Helper renderers for clean visual layout
  function renderEducationCard(edu, isDedicated = false) {
    return (
      <div
        key={edu._id}
        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl dark:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden text-left"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2272D] to-[#00FFFF] opacity-75" />

        <div className="space-y-4">
          {/* Status & Duration Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-rose-500/10 text-[#C2272D] border border-rose-500/20">
              {edu.status || 'Academic Degree'}
            </span>

            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <FaCalendarAlt size={11} className="text-[#C2272D]" />
              <span>{edu.duration}</span>
            </span>
          </div>

          {/* Degree Title & Institution */}
          <div>
            <h4 className="text-xl font-black font-['Manrope'] text-slate-900 dark:text-white group-hover:text-[#C2272D] dark:group-hover:text-[#00FFFF] transition-colors leading-snug">
              {edu.degree}
            </h4>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 mt-1.5">
              <FaUniversity size={12} className="text-slate-400 shrink-0" />
              <span>{edu.school}</span>
            </div>
            {edu.location && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
                <FaMapMarkerAlt size={10} className="text-[#C2272D]" />
                <span>{edu.location}</span>
              </div>
            )}
          </div>

          {/* Prominent Score Highlight Pill */}
          {edu.grade && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold shadow-sm">
              <FaStar size={12} className="text-amber-500" />
              <span>Score Standing: {edu.grade}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-['Inter'] leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
            {edu.description}
          </p>
        </div>

        {/* Footer verification pill */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <FaCheckCircle size={11} />
            <span>Authenticated Qualification</span>
          </span>
          {edu.link && (
            <a
              href={edu.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C2272D] dark:text-[#00FFFF] hover:underline flex items-center gap-1"
            >
              <span>Institution</span>
              <FaExternalLinkAlt size={9} />
            </a>
          )}
        </div>
      </div>
    );
  }

  function renderCertificateCard(cert, isDedicated = false) {
    return (
      <div
        key={cert._id}
        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl dark:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden text-left"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00FFFF] to-[#C2272D] opacity-75" />

        <div className="space-y-4">
          {/* Category & Date */}
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25">
              {cert.category || 'Professional Certification'}
            </span>

            {cert.date && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <FaCalendarAlt size={11} className="text-[#00FFFF]" />
                <span>{new Date(cert.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
              </span>
            )}
          </div>

          {/* Certificate Image Thumbnail with View Overlay */}
          <div
            onClick={() => setSelectedCertificate(cert)}
            className="w-full h-36 sm:h-44 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden relative cursor-pointer group/thumb flex items-center justify-center p-3"
          >
            <img
              src={getCacheBustedUrl(cert.image?.url || 'assits/Star_rating_4.5.png', cert.updatedAt)}
              alt={cert.title}
              className="w-full h-full object-contain filter group-hover/thumb:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs">
              <FaEye size={14} />
              <span>Click to Inspect Full Certificate</span>
            </div>
          </div>

          {/* Title & Issuer */}
          <div>
            <h4 className="text-xl font-black font-['Manrope'] text-slate-900 dark:text-white group-hover:text-[#00FFFF] transition-colors leading-snug">
              {cert.title}
            </h4>
            <div className="text-xs font-bold text-[#C2272D] dark:text-[#00FFFF] mt-1">
              Issued by: {cert.issuer}
            </div>
          </div>

          {/* Credential ID row */}
          {cert.credentialId && (
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 text-[11px] font-medium">Credential ID:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  {cert.credentialId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCredential(cert.credentialId)}
                  className="text-slate-400 hover:text-black dark:hover:text-white p-1 cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId === cert.credentialId ? (
                    <FaCheck size={10} className="text-emerald-500" />
                  ) : (
                    <FaCopy size={10} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedCertificate(cert)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FaEye size={12} className="text-[#C2272D]" />
            <span>Inspect</span>
          </button>

          {(cert.credentialUrl || cert.link) && (
            <a
              href={cert.credentialUrl || cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2272D] hover:bg-[#a81f25] text-white flex items-center gap-1.5 shadow-md shadow-[#C2272D]/20 transition-all cursor-pointer"
            >
              <span>Verify Online</span>
              <FaExternalLinkAlt size={10} />
            </a>
          )}
        </div>
      </div>
    );
  }

  function renderAchievementCard(ach, isDedicated = false) {
    return (
      <div
        key={ach._id}
        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-xl dark:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden text-left"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-[#C2272D] opacity-75" />

        <div className="space-y-4">
          {/* Icon and Category */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm">
              {getAchievementIcon(ach.icon)}
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
              {ach.category || 'Distinction'}
            </span>
          </div>

          {/* Title */}
          <div>
            <h4 className="text-xl font-black font-['Manrope'] text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
              {ach.title}
            </h4>
            {ach.date && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <FaCalendarAlt size={10} />
                <span>{typeof ach.date === 'string' && ach.date.includes('-') ? new Date(ach.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ach.date}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-['Inter'] leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
            {ach.description}
          </p>
        </div>

        {/* Milestone Indicator */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
          <span className="flex items-center gap-1">
            <FaMedal size={11} />
            <span>Recognized Milestone</span>
          </span>
          <span className="text-slate-400">Tauhid Shekhar</span>
        </div>
      </div>
    );
  }
};

export default EducationCertificates;
