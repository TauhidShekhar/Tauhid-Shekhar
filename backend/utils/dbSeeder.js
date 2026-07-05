const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Setting = require('../models/Setting');
const SEO = require('../models/SEO');
const Hero = require('../models/Hero');
const About = require('../models/About');
const Service = require('../models/Service');

const seedAll = async () => {
  try {
    console.log('Starting DB Seeder verification...');

    // 1. Seed Projects
    const projectsCount = await Project.countDocuments({});
    if (projectsCount === 0) {
      const defaultProjects = [
        {
          title: 'Course Selling Platform',
          tag: 'website',
          subtitle: 'MERN Stack LMS',
          tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT'],
          image: 'assits/Project1.jpg',
          github: 'https://github.com/TauhidShekhar',
          demo: 'https://github.com/TauhidShekhar',
          features: [
            'Dedicated dashboards for Admin, Teacher, and Student roles.',
            'Secure token-based JWT authentication and protected routing.',
            'Integrated course purchasing workflow and progress tracking.',
            'File uploads for homework assignments and PDF course notes.',
            'Streaming features for recorded video lessons.'
          ],
          description: 'A comprehensive Learning Management System designed to handle course listings, student study tracks, lecturer material uploads, and transactional purchasing paths using Mongo schemas and Express endpoints.',
          displayOrder: 1,
          status: 'active'
        },
        {
          title: 'Gym & Fitness Hub',
          tag: 'website',
          subtitle: 'Responsive React SPA',
          tech: ['React.js', 'JavaScript', 'CSS3', 'Responsive Design'],
          image: 'assits/Project2.jpg',
          github: 'https://github.com/TauhidShekhar',
          demo: 'https://github.com/TauhidShekhar',
          features: [
            'Interactive trainer profiling dashboards.',
            'Dynamic membership package comparison grids.',
            'Cross-browser responsive mobile booking forms.',
            'Performant assets loading and custom responsive layout.'
          ],
          description: 'A beautiful single-page dashboard displaying gym details, trainer portfolios, scheduling systems, and membership plans optimized for tablets and smartphones.',
          displayOrder: 2,
          status: 'active'
        },
        {
          title: 'Fast Delivery Food App',
          tag: 'website',
          subtitle: 'HTML5/CSS3 Responsive Menu',
          tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI'],
          image: 'assits/Project3.jpg',
          github: 'https://github.com/TauhidShekhar',
          demo: 'https://github.com/TauhidShekhar',
          features: [
            'Highly responsive fluid grid menu layout.',
            'Vanilla JS cart adding and calculation scripts.',
            'Optimized CSS typography, shadows, and smooth transitions.',
            'Frictionless mobile navigation and collapsible menus.'
          ],
          description: 'An interactive menu interface focusing on food items search, lazy-loading thumbnails, item filters, and fast performance.',
          displayOrder: 3,
          status: 'active'
        },
        {
          title: 'Portfolio Website',
          tag: 'website',
          subtitle: 'HTML5/CSS3 Personal Showcase',
          tech: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
          image: 'assits/Project2.jpg',
          github: 'https://github.com/TauhidShekhar',
          demo: 'https://github.com/TauhidShekhar',
          features: [
            'Designed a modern personal portfolio showcasing development projects, technical skills, and contact information.',
            'Structured semantic HTML5 layout with clean styling using custom CSS properties.',
            'Fully responsive layout optimized for mobile, tablet, and desktop viewports.',
            'SEO-friendly structure with quick assets load performance.'
          ],
          description: 'A professional frontend developer portfolio built using HTML5, CSS3, and JavaScript, designed to present projects and contact inquiries clearly to recruiters.',
          displayOrder: 4,
          status: 'active'
        },
        {
          title: 'Thumbnails & Brand Identity',
          tag: 'graphic',
          subtitle: 'Graphic Design Campaign',
          tech: ['Photoshop', 'Illustrator', 'Canva', 'AI Design'],
          image: 'assits/project4.jpg',
          github: 'https://github.com/TauhidShekhar',
          demo: 'https://github.com/TauhidShekhar',
          features: [
            '300+ custom high CTR YouTube thumbnails.',
            'Branding design kits: logos, banners, posters.',
            'Consistent vector illustration assets in Illustrator.',
            'Adobe Photoshop rendering pipelines.'
          ],
          description: 'A professional curation of high-performing thumbnail designs and brand identities constructed for YouTube content creators and business agencies.',
          displayOrder: 5,
          status: 'active'
        }
      ];
      await Project.insertMany(defaultProjects);
      console.log('Seeded projects collection successfully.');
    }

    // 2. Seed Skills
    const skillsCount = await Skill.countDocuments({});
    if (skillsCount === 0) {
      const defaultSkills = [
        { name: 'C / C++', percentage: 80, category: 'programming', iconName: 'SiCplusplus' },
        { name: 'Python', percentage: 75, category: 'programming', iconName: 'SiPython' },
        { name: 'JavaScript (ES6)', percentage: 85, category: 'programming', iconName: 'SiJavascript' },
        { name: 'HTML5', percentage: 95, category: 'frontend', iconName: 'SiHtml5' },
        { name: 'CSS3', percentage: 90, category: 'frontend', iconName: 'FaCss3Alt' },
        { name: 'React.js', percentage: 82, category: 'frontend', iconName: 'SiReact' },
        { name: 'Bootstrap', percentage: 85, category: 'frontend', iconName: 'SiBootstrap' },
        { name: 'Responsive Design', percentage: 92, category: 'frontend', iconName: 'FaLaptopCode' },
        { name: 'Node.js', percentage: 80, category: 'backend', iconName: 'SiNodedotjs' },
        { name: 'Express.js', percentage: 82, category: 'backend', iconName: 'SiExpress' },
        { name: 'REST API', percentage: 88, category: 'backend', iconName: 'FaServer' },
        { name: 'JWT Authentication', percentage: 85, category: 'backend', iconName: 'SiJsonwebtokens' },
        { name: 'MongoDB', percentage: 85, category: 'database', iconName: 'SiMongodb' },
        { name: 'MySQL', percentage: 80, category: 'database', iconName: 'SiMysql' },
        { name: 'Git', percentage: 85, category: 'tools', iconName: 'SiGit' },
        { name: 'GitHub', percentage: 90, category: 'tools', iconName: 'SiGithub' },
        { name: 'VS Code', percentage: 92, category: 'tools', iconName: 'FaCode' },
        { name: 'Postman', percentage: 88, category: 'tools', iconName: 'SiPostman' },
        { name: 'Netlify', percentage: 85, category: 'tools', iconName: 'SiNetlify' },
        { name: 'Vercel', percentage: 85, category: 'tools', iconName: 'SiVercel' },
        { name: 'CRUD Operations', percentage: 90, category: 'concepts', iconName: 'FaDatabase' },
        { name: 'MVC Architecture', percentage: 82, category: 'concepts', iconName: 'FaLightbulb' },
        { name: 'API Integration', percentage: 88, category: 'concepts', iconName: 'FaTools' },
        { name: 'Responsive UI Design', percentage: 92, category: 'concepts', iconName: 'FaLaptopCode' }
      ];
      await Skill.insertMany(defaultSkills);
      console.log('Seeded skills collection successfully.');
    }

    // 3. Seed Experiences
    const expCount = await Experience.countDocuments({});
    if (expCount === 0) {
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
      await Experience.insertMany(defaultExperiences);
      console.log('Seeded experiences collection successfully.');
    }

    // 4. Seed Educations
    const eduCount = await Education.countDocuments({});
    if (eduCount === 0) {
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
      await Education.insertMany(defaultEducation);
      console.log('Seeded education collection successfully.');
    }

    // 5. Seed Certificates
    const certCount = await Certificate.countDocuments({});
    if (certCount === 0) {
      const defaultCertificates = [
        {
          title: 'Full Stack MERN Web Development',
          issuer: 'Online Learning Platform / Udemy',
          date: new Date('2024-12-01'),
          credentialUrl: 'https://github.com/TauhidShekhar',
          image: { url: 'assits/Star_rating_4.5.png' }
        },
        {
          title: 'Advanced Photoshop Core Principles',
          issuer: 'Creative Design Academy',
          date: new Date('2023-08-01'),
          credentialUrl: 'https://github.com/TauhidShekhar',
          image: { url: 'assits/Star_rating_4.5.png' }
        }
      ];
      await Certificate.insertMany(defaultCertificates);
      console.log('Seeded certificates collection successfully.');
    }

    // 6. Seed Achievements
    const achCount = await Achievement.countDocuments({});
    if (achCount === 0) {
      const defaultAchievements = [
        {
          title: 'Full Stack Development Projects',
          description: 'Built multiple high-performance responsive web applications using MERN technologies.',
          icon: 'FaAward',
          date: new Date()
        },
        {
          title: 'Data Structures & Algorithms (DSA)',
          description: 'Deep interest and active practice in Full Stack Development and Data Structures & Algorithms.',
          icon: 'FaAward',
          date: new Date()
        },
        {
          title: 'Technical Content Creator',
          description: 'Technical content creator on professional networking and video platforms like LinkedIn and YouTube.',
          icon: 'FaAward',
          date: new Date()
        }
      ];
      await Achievement.insertMany(defaultAchievements);
      console.log('Seeded achievements collection successfully.');
    }

    // 7. Seed Setting
    const settingCount = await Setting.countDocuments({});
    if (settingCount === 0) {
      const defaultSetting = {
        siteName: 'Tauhid Shekhar',
        siteTagline: 'Creative Full Stack Developer & Graphic Designer',
        email: 'tauhidshekhar@gmail.com',
        phone: '+91 9142725562',
        whatsapp: 'https://wa.me/919142725562',
        resumeUrl: 'assits/Tauhid_Shekhar_Resume.pdf',
        aboutContent: 'I am a highly motivated computer application student specializing in MERN development and UI/Graphic branding campaigns.',
        footerText: 'Creative Graphic Designer & Full Stack Web Developer. Bridging logical systems engineering with responsive frontend interfaces.',
        copyrightText: '© 2026 Tauhid Shekhar. All Rights Reserved.',
        socialLinks: {
          github: 'https://github.com/TauhidShekhar',
          linkedin: 'https://linkedin.com/in/TauhidShekhar',
          twitter: 'https://twitter.com/TauhidShekhar',
          instagram: 'https://instagram.com/TauhidShekhar',
          youtube: 'https://youtube.com/TauhidShekhar'
        }
      };
      await Setting.create(defaultSetting);
      console.log('Seeded default configurations successfully.');
    }

    // 8. Seed SEO
    const seoCount = await SEO.countDocuments({});
    if (seoCount === 0) {
      const defaultSEO = {
        siteName: 'Tauhid Shekhar',
        siteUrl: 'http://localhost:5173',
        metaTitle: 'Tauhid Shekhar | Creative MERN Stack Developer',
        metaDescription: 'Personal showcase portfolio of Tauhid Shekhar built with MERN technologies and optimized layout models.',
        metaKeywords: 'developer, portfolio, MERN stack, graphic designer, Amritsar, Patna',
        ogTitle: 'Tauhid Shekhar | MERN Stack Developer',
        ogDescription: 'Personal showcase portfolio of Tauhid Shekhar'
      };
      await SEO.create(defaultSEO);
      console.log('Seeded default SEO metrics successfully.');
    }

    // 9. Seed Hero
    const heroCount = await Hero.countDocuments({});
    if (heroCount === 0) {
      const defaultHero = {
        siteName: 'Tauhid Shekhar',
        heroHeading: "Hi, I'm",
        heroDescription: 'Results-oriented Full Stack Web Developer with practical experience in building responsive web applications using HTML5, CSS3, JavaScript, React.js, Node.js, Express.js, MongoDB, and MySQL.',
        heroImage: { url: 'assits/Profile_Pic.png', publicId: '' },
        heroBackground: { url: '', publicId: '' },
        heroRoles: ['Full Stack Developer', 'MERN Stack Developer', 'React Developer', 'Backend Developer'],
        resumeUrl: 'assits/Resume-file.pdf',
        socialLinks: {
          github: 'https://github.com/TauhidShekhar',
          linkedin: 'https://www.linkedin.com/in/tauhidshekhar/',
          twitter: '',
          instagram: '',
          youtube: '',
          facebook: ''
        },
        heroCtaButtons: {
          showHireMe: true,
          showContactMe: true,
          showResume: true
        }
      };
      await Hero.create(defaultHero);
      console.log('Seeded default Hero configurations successfully.');
    }

    // 10. Seed About
    const aboutCount = await About.countDocuments({});
    if (aboutCount === 0) {
      const defaultAbout = {
        aboutTitle: 'About Me',
        aboutSkillsSummary: 'Full Stack Web Developer & Graphic Designer',
        aboutContent: 'I am a highly motivated computer application student specializing in MERN development and UI/Graphic branding campaigns.',
        profilePicture: { url: 'assits/Profile-Img.png', publicId: '' },
        aboutStats: {
          yearsExp: '2-3',
          projects: '50+',
          clients: '30+'
        },
        coreStrengths: [
          { title: 'Problem Solving', desc: 'Analytical approach to complex debugging, scripting, and code structures.' },
          { title: 'Quick Learner', desc: 'Rapid adaptation to emerging web frameworks, packages, and design tools.' },
          { title: 'Team Collaboration', desc: 'Cooperative alignment in workflows, clear peer reviews, and group sprints.' },
          { title: 'Communication', desc: 'Articulate documentation, transparent project updates, and active feedback loops.' },
          { title: 'Adaptability', desc: 'Versatile adjustment to project requirements, shifting technologies, and layout specs.' }
        ],
        languages: [
          { name: 'Hindi', level: 'Native' },
          { name: 'English', level: 'Professional Working Proficiency' }
        ],
        aboutPersonalInfo: [
          { label: 'Freelance', value: 'Available' },
          { label: 'Age', value: '21' },
          { label: 'Address', value: 'Patna, Bihar, India' }
        ],
        aboutContactInfo: {
          email: 'shekhartauhid@gmail.com',
          phone: '+91 9142725562',
          address: 'Amritsar, Punjab, India'
        },
        resumeUrl: 'assits/Resume-file.pdf'
      };
      await About.create(defaultAbout);
      console.log('Seeded default About configurations successfully.');
    }

    // 11. Seed Services
    const serviceCount = await Service.countDocuments({});
    if (serviceCount === 0) {
      const defaultServices = [
        {
          title: 'MERN Stack Web Development',
          desc: 'End-to-end full stack web applications integrating React frontends with Node.js/Express.js REST APIs and MongoDB databases.',
          price: '$149',
          features: ['Admin & Teacher Dashboards', 'JWT Authentication', 'MongoDB Schema Modeling', 'CRUD Operations'],
          iconName: 'FaLaptopCode',
          displayOrder: 0
        },
        {
          title: 'Frontend Development',
          desc: 'Converting graphic layouts (Figma/Adobe) into clean, semantic HTML5, CSS3, and modern interactive React.js modules.',
          price: '$99',
          features: ['Responsive UI Layouts', 'Apple Style Animations', 'Speed Optimization', 'Cross-browser Compatibility'],
          iconName: 'FaReact',
          displayOrder: 1
        },
        {
          title: 'REST API & Backend Development',
          desc: 'Architecting secure backend servers, integrating third-party endpoints, database connections, and session management.',
          price: '$79',
          features: ['Express.js Routing', 'JWT & Auth Guards', 'MySQL & MongoDB integration', 'Error handling middleware'],
          iconName: 'FaServer',
          displayOrder: 2
        },
        {
          title: 'Thumbnail & Graphic Design',
          desc: 'Eye-catching, high-converting YouTube thumbnails, banners, posters, and professional brand assets designed to secure clicks.',
          price: '$15',
          features: ['YouTube Thumbnail Packages', 'Instagram Ads/Posts', 'Custom Brand Logos', 'Adobe Suite Production'],
          iconName: 'FaPaintBrush',
          displayOrder: 3
        }
      ];
      await Service.create(defaultServices);
      console.log('Seeded default Services configurations successfully.');
    }

  } catch (error) {
    console.error('Error during automatic data seeding:', error.message);
  }
};

module.exports = { seedAll };
