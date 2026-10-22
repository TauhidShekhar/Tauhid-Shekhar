const Project = require('../models/Project');

const defaultProjectsToReconcile = [
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

/**
 * Safely reconciles default projects without overwriting any existing records or admin modifications.
 */
const reconcileProjects = async () => {
  try {
    const existingProjects = await Project.find({}).select('title').lean();
    const existingTitles = new Set(
      existingProjects.map(p => (p.title || '').trim().toLowerCase())
    );

    let createdCount = 0;
    let existingCount = 0;

    for (const projectData of defaultProjectsToReconcile) {
      const normalizedTitle = (projectData.title || '').trim().toLowerCase();
      if (existingTitles.has(normalizedTitle)) {
        existingCount++;
      } else {
        await Project.create(projectData);
        existingTitles.add(normalizedTitle);
        createdCount++;
        console.log(`[ProjectReconciler] Safely seeded missing project: "${projectData.title}"`);
      }
    }

    const totalCount = await Project.countDocuments();
    return {
      success: true,
      created: createdCount,
      existing: existingCount,
      total: totalCount
    };
  } catch (error) {
    console.error('[ProjectReconciler] Error during project reconciliation:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  reconcileProjects,
  defaultProjectsToReconcile
};
