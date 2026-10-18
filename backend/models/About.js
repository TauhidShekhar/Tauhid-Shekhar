const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    aboutTitle: { type: String, default: 'About Me' },
    aboutSkillsSummary: { type: String, default: 'Full Stack Web Developer & Graphic Designer' },
    aboutContent: { 
      type: String, 
      default: 'I am a highly motivated computer application student specializing in MERN development and UI/Graphic branding campaigns.' 
    },
    profilePicture: {
      url: { type: String, default: 'assits/Profile-Img.png' },
      publicId: { type: String, default: '' }
    },
    aboutStats: {
      yearsExp: { type: String, default: '2-3' },
      projects: { type: String, default: '50+' },
      clients: { type: String, default: '30+' }
    },
    coreStrengths: {
      type: [{ title: String, desc: String }],
      default: [
        { title: 'Problem Solving', desc: 'Analytical approach to complex debugging, scripting, and code structures.' },
        { title: 'Quick Learner', desc: 'Rapid adaptation to emerging web frameworks, packages, and design tools.' },
        { title: 'Team Collaboration', desc: 'Cooperative alignment in workflows, clear peer reviews, and group sprints.' },
        { title: 'Communication', desc: 'Articulate documentation, transparent project updates, and active feedback loops.' },
        { title: 'Adaptability', desc: 'Versatile adjustment to project requirements, shifting technologies, and layout specs.' }
      ]
    },
    languages: {
      type: [{ name: String, level: String }],
      default: [
        { name: 'Hindi', level: 'Native' },
        { name: 'English', level: 'Professional Working Proficiency' }
      ]
    },
    aboutPersonalInfo: {
      type: [{ label: String, value: String }],
      default: [
        { label: 'Freelance', value: 'Available' },
        { label: 'Age', value: '21' },
        { label: 'Address', value: 'Patna, Bihar, India' }
      ]
    },
    aboutContactInfo: {
      email: { type: String, default: 'shekhartauhid@gmail.com' },
      phone: { type: String, default: '+91 9142725562' },
      address: { type: String, default: 'Amritsar, Punjab, India' }
    },
    resumeUrl: { type: String, default: 'assits/Resume-file.pdf' },
    currentWork: {
      isEmployed: { type: Boolean, default: false },
      companyName: { type: String, default: '' },
      role: { type: String, default: '' },
      joiningDate: { type: String, default: '' },
      employmentType: { type: String, default: 'Full-time' },
      location: { type: String, default: '' },
      details: { type: String, default: '' },
      companyUrl: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);
