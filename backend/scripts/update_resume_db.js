const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateResumeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio_db');
    console.log('Connected to MongoDB');

    const Resume = mongoose.model('Resume', new mongoose.Schema({}, { strict: false }));
    const Setting = mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));
    const Hero = mongoose.model('Hero', new mongoose.Schema({}, { strict: false }));
    const About = mongoose.model('About', new mongoose.Schema({}, { strict: false }));

    const resumeUrl = '/assits/Resume-file.pdf';

    const updateData = {
      title: 'Tauhid Shekhar - Full-Stack MERN Developer Resume',
      fileName: 'Resume-file.pdf',
      fileUrl: resumeUrl,
      fileType: 'pdf',
      status: 'Approved',
      atsScore: 98,
      parsedData: {
        name: 'TAUHID SHEKHAR',
        email: 'shekhartauhid@gmail.com',
        phone: '+91 9142725562',
        address: 'Noida / Gurugram, India',
        linkedin: 'https://www.linkedin.com/in/TauhidShekhar',
        github: 'https://github.com/TauhidShekhar',
        portfolio: 'https://tauhidshekhar.vercel.app',
        skills: [
          'React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript',
          'REST APIs', 'JWT', 'MySQL', 'Java', 'Python', 'Tailwind CSS', 'Git', 'GitHub'
        ],
        technicalSkills: [
          'React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST APIs', 'JWT', 'MySQL'
        ],
        softSkills: [
          'Problem Solving', 'Fast Learner', 'Collaboration', 'Clean Code Architecture'
        ],
        summary: 'Results-driven Full-Stack MERN Developer passionate about building robust, scalable web applications with seamless user experiences. Experienced in developing responsive frontends with React and designing high-performance REST APIs with Node.js and Express. Proficient in database modeling with MongoDB and MySQL.',
        experience: [
          {
            jobTitle: 'Full-Stack MERN Developer',
            company: 'Self-Employed / Freelance Projects',
            duration: '2024 - Present',
            description: 'Engineered full-stack applications with React, Node.js, Express, and MongoDB, integrating secure JWT auth and payment workflows.'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Applications (BCA)',
            school: 'Global Group of Institutes, Amritsar',
            year: '2023 - 2026',
            cgpa: '8.0/10'
          }
        ],
        projects: [
          {
            title: 'Course sellingPlatform (MERN Stack LMS)',
            techUsed: 'React.js, Node.js, Express.js, MongoDB, JWT',
            description: 'Full-stack course marketplace with authentication, instructor dashboard, and secure media access.'
          },
          {
            title: 'Developer Portfolio',
            techUsed: 'React.js, Tailwind CSS, Framer Motion, Express',
            description: 'Interactive portfolio featuring real-time ATS analysis, dynamic projects, and community hubs.'
          },
          {
            title: 'Gym Fitness Website',
            techUsed: 'React.js, Vite, Tailwind CSS',
            description: 'Modern fitness platform featuring workout catalogs, BMI calculator, and membership plans.'
          },
          {
            title: 'Food Delivery Website',
            techUsed: 'React.js, Tailwind CSS, REST APIs',
            description: 'Food ordering platform with cart management and smooth checkout flow.'
          }
        ],
        languages: ['English', 'Hindi']
      },
      updatedAt: new Date()
    };

    const activeResume = await Resume.findOneAndUpdate(
      { isActive: true },
      { $set: updateData },
      { new: true, upsert: true }
    );
    console.log('Updated active resume:', activeResume._id, activeResume.fileUrl);

    await Setting.updateMany({}, { $set: { resumeUrl: resumeUrl } });
    console.log('Updated Setting resumeUrl');

    await Hero.updateMany({}, { $set: { resumeUrl: resumeUrl } });
    console.log('Updated Hero resumeUrl');

    await About.updateMany({}, { $set: { resumeUrl: resumeUrl } });
    console.log('Updated About resumeUrl');

    console.log('All DB records successfully updated with new resume!');
    process.exit(0);
  } catch (err) {
    console.error('Update script failed:', err);
    process.exit(1);
  }
};

updateResumeDatabase();
