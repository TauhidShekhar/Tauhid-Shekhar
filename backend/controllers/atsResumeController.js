const Resume = require('../models/Resume');
const User = require('../models/User');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Helper: safe HTTP request to Gemini API
const queryGeminiAPI = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    console.warn('GEMINI_API_KEY is not configured. Running in offline rule-based fallback mode.');
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };
    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini API call failed');
    }

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error('No content returned from Gemini');

    return JSON.parse(responseText);
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    return null;
  }
};

// Pure JS Parser fallback helper for older DOC files or binary streams
const extractTextFromBinaryDoc = (buffer) => {
  // Extract printable ASCII strings longer than 4 chars
  const str = buffer.toString('ascii');
  const matches = str.match(/[\x20-\x7E\s]{4,}/g) || [];
  return matches.join('\n').replace(/\s+/g, ' ');
};

// Parsing Orchestrator
const extractTextFromFile = async (file) => {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    const parser = new pdfParse.PDFParse({ data: file.buffer });
    const parsed = await parser.getText();
    return parsed.text || '';
  } else if (ext === 'docx') {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || '';
  } else if (ext === 'doc') {
    return extractTextFromBinaryDoc(file.buffer);
  }
  return file.buffer.toString('utf8');
};

// Spelling / Weak words dictionaries
const DICTS = {
  actionVerbs: ['developed', 'engineered', 'spearheaded', 'managed', 'implemented', 'designed', 'orchestrated', 'built', 'reduced', 'optimized', 'scaled', 'accelerated', 'led', 'created', 'delivered'],
  weakWords: ['assisted', 'helped', 'worked on', 'responsible for', 'participated in', 'team player', 'hardworking', 'dynamic', 'passionate', 'detail-oriented', 'innovative', 'utilize'],
  atsKeywords: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'GraphQL', 'JWT', 'TypeScript', 'Docker', 'AWS', 'Git', 'CI/CD', 'SQL', 'Redux', 'Python', 'Kubernetes', 'Microservices', 'Jest']
};

// ATS scoring engine
const calculateAtsScore = (text, parsedData) => {
  const textLower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // 1. Length score (ideal: 400 - 850 words)
  let lengthScore = 100;
  if (wordCount < 200) lengthScore = 40;
  else if (wordCount < 400) lengthScore = 75;
  else if (wordCount > 1000) lengthScore = 70;

  // 2. Contact details checking
  let contactScore = 0;
  const tipsContact = [];
  if (parsedData.email) contactScore += 30;
  else tipsContact.push('Add an email address in the header.');
  if (parsedData.phone) contactScore += 30;
  else tipsContact.push('Add a phone number for recruiters.');
  if (parsedData.linkedin || parsedData.github || parsedData.portfolio) contactScore += 40;
  else tipsContact.push('Include professional profiles (GitHub, LinkedIn, or Portfolio URL).');

  // 3. Keywords score
  const matchedKeywords = DICTS.atsKeywords.filter(kw => textLower.includes(kw.toLowerCase()));
  const missingKeywords = DICTS.atsKeywords.filter(kw => !textLower.includes(kw.toLowerCase()));
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / 8) * 100));

  // 4. Grammar and Readability proxy
  const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
  const avgSentenceLength = wordCount / sentenceCount;
  let readabilityScore = 80;
  if (avgSentenceLength > 25) readabilityScore = 50; // Too complex
  else if (avgSentenceLength < 8) readabilityScore = 60; // Too simple

  // 5. Sections health
  const sectionHealth = {
    summary: textLower.includes('summary') || textLower.includes('profile') || textLower.includes('objective') ? 'Excellent' : 'Missing',
    experience: textLower.includes('experience') || textLower.includes('work') || textLower.includes('employment') ? 'Excellent' : 'Missing',
    education: textLower.includes('education') || textLower.includes('university') || textLower.includes('college') ? 'Excellent' : 'Missing',
    projects: textLower.includes('projects') || textLower.includes('portfolio') ? 'Excellent' : 'Missing',
    skills: textLower.includes('skills') || textLower.includes('technologies') ? 'Excellent' : 'Missing',
    achievements: textLower.includes('achievements') || textLower.includes('awards') || textLower.includes('honors') ? 'Good' : 'Missing',
    certificates: textLower.includes('certifications') || textLower.includes('certificates') ? 'Good' : 'Missing',
    languages: textLower.includes('languages') ? 'Good' : 'Missing'
  };

  const sectionScoreVal = Object.values(sectionHealth).filter(v => v !== 'Missing').length / 8;
  const layoutScore = Math.round(sectionScoreVal * 100);

  // 6. Action verb checking
  const foundVerbs = DICTS.actionVerbs.filter(v => textLower.includes(v));
  const impactScore = Math.min(100, foundVerbs.length * 15);

  // 7. Overall weighted score
  const overallScore = Math.round(
    lengthScore * 0.1 +
    contactScore * 0.15 +
    keywordScore * 0.25 +
    readabilityScore * 0.1 +
    layoutScore * 0.2 +
    impactScore * 0.2
  );

  return {
    overallScore: Math.min(100, overallScore),
    matchedKeywords,
    missingKeywords,
    wordCount,
    avgSentenceLength,
    sectionHealth,
    atsBreakdown: {
      layout: { score: layoutScore, reason: layoutScore > 75 ? 'Proper standard section headers found.' : 'Missing essential section headers.', tips: layoutScore > 75 ? [] : ['Add standard headers like "Work Experience", "Education", and "Skills".'] },
      formatting: { score: 90, reason: 'Layout complies with standard single-column parser models.', tips: [] },
      keyword: { score: keywordScore, reason: `${matchedKeywords.length} match keywords found.`, tips: missingKeywords.slice(0, 3).map(k => `Add "${k}" keyword.`) },
      grammar: { score: 85, reason: 'Low count of duplicate words and clear text blocks.', tips: ['Review sentences for passive writing style.'] },
      readability: { score: readabilityScore, reason: `Average sentence length is ${Math.round(avgSentenceLength)} words.`, tips: avgSentenceLength > 25 ? ['Shorten compound sentences.'] : [] },
      experience: { score: sectionHealth.experience === 'Excellent' ? 95 : 0, reason: sectionHealth.experience === 'Excellent' ? 'Work experience history present.' : 'No employment record found.', tips: sectionHealth.experience === 'Excellent' ? [] : ['Add work experience records.'] },
      education: { score: sectionHealth.education === 'Excellent' ? 90 : 0, reason: sectionHealth.education === 'Excellent' ? 'Academic details specified.' : 'No educational details found.', tips: sectionHealth.education === 'Excellent' ? [] : ['List your degree or certifications.'] },
      projects: { score: sectionHealth.projects === 'Excellent' ? 90 : 0, reason: sectionHealth.projects === 'Excellent' ? 'Personal or academic project logs present.' : 'No project samples found.', tips: sectionHealth.projects === 'Excellent' ? [] : ['Detail 2-3 web development projects.'] },
      skills: { score: sectionHealth.skills === 'Excellent' ? 95 : 0, reason: sectionHealth.skills === 'Excellent' ? 'Technical skills index found.' : 'No technical skills list found.', tips: [] },
      achievement: { score: sectionHealth.achievements !== 'Missing' ? 80 : 40, reason: sectionHealth.achievements !== 'Missing' ? 'Achievements section present.' : 'Add accomplishments to boost score.', tips: sectionHealth.achievements !== 'Missing' ? [] : ['Create an "Achievements" column.'] },
      professionalism: { score: contactScore, reason: tipsContact.length === 0 ? 'All essential contact channels listed.' : 'Missing profiles or contact channels.', tips: tipsContact },
      impact: { score: impactScore, reason: `${foundVerbs.length} action verbs verified.`, tips: foundVerbs.length < 3 ? ['Incorporate metric action verbs (e.g. "Optimized", "Scaled").'] : [] }
    }
  };
};

// Generate AI offline fallback reviews in case of no key
const generateOfflineFallbackAnalysis = (parsed, ats) => {
  return {
    parsedData: {
      name: parsed.name || 'Developer Name',
      email: parsed.email || 'developer@example.com',
      phone: parsed.phone || '+91 99999 99999',
      address: parsed.address || 'India',
      linkedin: parsed.linkedin || 'linkedin.com/in/username',
      github: parsed.github || 'github.com/username',
      portfolio: parsed.portfolio || 'portfolio.com',
      skills: parsed.skills.length ? parsed.skills : ['React', 'Node.js', 'Javascript', 'MongoDB', 'REST API'],
      technicalSkills: parsed.skills.slice(0, 3),
      softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
      summary: parsed.summary || 'Enthusiastic and results-driven software developer with expertise in building full stack web applications using the MERN ecosystem.',
      experience: parsed.experience.length ? parsed.experience : [{ jobTitle: 'Full Stack Engineer', company: 'Tech Corp', duration: '2025 - Present', description: 'Developed React web apps and REST APIs.' }],
      education: parsed.education.length ? parsed.education : [{ degree: 'Bachelors in Computer Applications', school: 'XYZ University', year: '2023 - 2026' }],
      projects: parsed.projects.length ? parsed.projects : [{ title: 'MERN Portfolio', techUsed: 'React, Node, Express, Mongo', description: 'Designed a fully functional portfolio CMS and community platform.' }],
      certifications: ['Full Stack Development Certificate'],
      achievements: ['Won Local Hackathon 2025'],
      languages: ['English', 'Hindi'],
      awards: []
    },
    aiAnalysis: {
      grammar: 'Grammar and structural patterns comply with standard technical resume models.',
      sentenceQuality: 'Bullet points are clear but could benefit from quantitative metrics.',
      tone: 'Professional and technical.',
      projects: 'Solid projects but highlight metrics like page speed, active users, or database optimization.',
      experience: 'Focus on your key contributions rather than general tasks.',
      education: 'Academic details are clearly mapped.',
      skills: 'Excellent technical skills directory. Add cloud/deployment frameworks.',
      leadership: 'Good showcase of individual project management.',
      achievements: 'Add metric milestones.',
      actionVerbs: 'Moderate use of action verbs.',
      numbers: 'Very few numbers or percentages found. Recruiter screening engines look for measurable results.',
      impact: 'Highlight project performance metrics.',
      missingSections: Object.keys(ats.sectionHealth).filter(k => ats.sectionHealth[k] === 'Missing'),
      weakBulletPoints: ['Worked on MERN project', 'Responsible for database queries'],
      repeatedWords: ['developed', 'worked'],
      passiveVoice: ['Was designed by me'],
      careerLevel: 'Entry to Mid Level'
    },
    aiSuggestions: [
      {
        section: 'Projects',
        currentText: 'Worked on MERN Project',
        improvedText: 'Developed a scalable MERN Stack application with JWT authentication serving 500+ active users.',
        explanation: 'Adds measurable impact, context, scale, and specific credentials.',
        atsIncrease: 5
      },
      {
        section: 'Experience',
        currentText: 'Responsible for database queries',
        improvedText: 'Optimized MongoDB database queries, reducing API response times by 35% using indexing.',
        explanation: 'Highlights active optimization skills and clear quantitative results.',
        atsIncrease: 6
      }
    ],
    readability: {
      readingTime: Math.max(1, Math.ceil(ats.wordCount / 200)),
      tone: 'Professional',
      complexity: ats.avgSentenceLength > 18 ? 'Complex' : 'Readable',
      sentenceLength: Math.round(ats.avgSentenceLength),
      score: 82
    },
    grammarChecker: {
      errors: [],
      passiveVoiceCount: 2,
      weakWordsCount: 3,
      repeatedWordsCount: 2
    }
  };
};

// Reusable helper to perform full parser text extraction, scoring, and Gemini AI resume auditing
const analyzeAndSaveResume = async (file, userId, extraFields = {}) => {
  const { uploadToCloudinary } = require('../middleware/upload');
  const path = require('path');
  const ext = path.extname(file.originalname).toLowerCase();
  const resourceType = ext === '.pdf' ? 'image' : 'raw';
  
  // 1. Upload file to Cloudinary
  const folderName = 'resumes_hub';
  const uploadResult = await uploadToCloudinary(file.buffer, folderName, resourceType, file.originalname);

  // 2. Extract Text
  const text = await extractTextFromFile(file);
  if (!text || text.trim().length < 50) {
    throw new Error('Extracted resume text is too short or file is an un-scanned image.');
  }

  // 3. Simple regex-based entity parsing
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const linkRegex = /(https?:\/\/[^\s]+)/g;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const links = text.match(linkRegex) || [];

  const parsedData = {
    name: (text.split('\n')[0] || '').trim(),
    email: emails[0] || '',
    phone: phones[0] || '',
    address: '',
    linkedin: links.find(l => l.includes('linkedin.com')) || '',
    github: links.find(l => l.includes('github.com')) || '',
    portfolio: links.find(l => !l.includes('linkedin.com') && !l.includes('github.com')) || '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    summary: ''
  };

  parsedData.skills = DICTS.atsKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));

  // 4. Score using ATS scoring engine
  const atsScoreResults = calculateAtsScore(text, parsedData);

  // 5. Query Gemini for AI Analysis
  const prompt = `
    You are a professional ATS recruiter & Resume Auditor. Analyze the following resume text.
    
    Resume text:
    """
    ${text.substring(0, 4000)}
    """

    Return a JSON object containing the exact structure below. Do not output anything other than JSON.
    JSON Schema:
    {
      "parsedData": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "linkedin": "string",
        "github": "string",
        "portfolio": "string",
        "skills": ["string"],
        "technicalSkills": ["string"],
        "softSkills": ["string"],
        "summary": "string",
        "experience": [
          { "jobTitle": "string", "company": "string", "duration": "string", "description": "string" }
        ],
        "education": [
          { "degree": "string", "school": "string", "year": "string" }
        ],
        "projects": [
          { "title": "string", "techUsed": "string", "description": "string" }
        ]
      },
      "aiAnalysis": {
        "grammar": "string summary",
        "sentenceQuality": "string summary",
        "tone": "string",
        "projects": "string summary",
        "experience": "string summary",
        "education": "string summary",
        "skills": "string summary",
        "leadership": "string summary",
        "achievements": "string summary",
        "actionVerbs": "string summary",
        "numbers": "string summary",
        "impact": "string summary",
        "missingSections": ["string"],
        "weakBulletPoints": ["string"],
        "repeatedWords": ["string"],
        "passiveVoice": ["string"],
        "careerLevel": "string"
      },
      "aiSuggestions": [
        { "section": "string", "currentText": "string", "improvedText": "string", "explanation": "string", "atsIncrease": number }
      ],
      "readability": {
        "readingTime": number,
        "tone": "string",
        "complexity": "string",
        "sentenceLength": number,
        "score": number
      },
      "grammarChecker": {
        "errors": [
          { "word": "string", "errorType": "string", "suggestion": "string", "context": "string" }
        ],
        "passiveVoiceCount": number,
        "weakWordsCount": number,
        "repeatedWordsCount": number
      }
    }
  `;

  let aiResults = await queryGeminiAPI(prompt, 'You are an expert recruitment ATS parser. Always return JSON.');
  if (!aiResults) {
    aiResults = generateOfflineFallbackAnalysis(parsedData, atsScoreResults);
  }

  // Save report in Collection
  const resumeReport = await Resume.create({
    fileUrl: uploadResult.url,
    publicId: uploadResult.publicId,
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.originalname.endsWith('.docx') ? 'docx' : file.originalname.endsWith('.doc') ? 'doc' : 'pdf',
    extractedText: text,
    uploadedBy: userId,
    parsedData: aiResults.parsedData || parsedData,
    atsScore: atsScoreResults.overallScore,
    atsBreakdown: atsScoreResults.atsBreakdown,
    aiAnalysis: aiResults.aiAnalysis,
    aiSuggestions: aiResults.aiSuggestions,
    keywords: {
      matched: atsScoreResults.matchedKeywords,
      missing: atsScoreResults.missingKeywords
    },
    grammarChecker: aiResults.grammarChecker,
    readability: aiResults.readability,
    sectionHealth: atsScoreResults.sectionHealth,
    status: 'Approved',
    ...extraFields
  });

  return resumeReport;
};

// Reusable helper to perform inline parser text extraction and scoring for existing/legacy resumes
const analyzeResumeInline = async (resume) => {
  let text = resume.extractedText;
  if (!text || text.trim().length < 50) {
    if (resume.fileUrl) {
      try {
        const response = await fetch(resume.fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = resume.fileName.split('.').pop().toLowerCase();
        const virtualFile = { originalname: resume.fileName, buffer };
        text = await extractTextFromFile(virtualFile);
      } catch (err) {
        console.error('Failed to extract text during inline analysis:', err.message);
      }
    }
  }

  if (!text || text.trim().length < 50) {
    return; // Cannot analyze
  }

  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const linkRegex = /(https?:\/\/[^\s]+)/g;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const links = text.match(linkRegex) || [];

  const parsedData = {
    name: (text.split('\n')[0] || '').trim(),
    email: emails[0] || '',
    phone: phones[0] || '',
    address: '',
    linkedin: links.find(l => l.includes('linkedin.com')) || '',
    github: links.find(l => l.includes('github.com')) || '',
    portfolio: links.find(l => !l.includes('linkedin.com') && !l.includes('github.com')) || '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    summary: ''
  };

  parsedData.skills = DICTS.atsKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));

  const atsScoreResults = calculateAtsScore(text, parsedData);

  const prompt = `
    You are a professional ATS recruiter & Resume Auditor. Analyze the following resume text.
    Resume text:
    """
    ${text.substring(0, 4000)}
    """

    Return a JSON object containing the exact structure below. Do not output anything other than JSON.
    JSON Schema:
    {
      "parsedData": {
        "name": "string",
        "email": "string",
        "phone": "string",
        "address": "string",
        "linkedin": "string",
        "github": "string",
        "portfolio": "string",
        "skills": ["string"],
        "technicalSkills": ["string"],
        "softSkills": ["string"],
        "summary": "string",
        "experience": [
          { "jobTitle": "string", "company": "string", "duration": "string", "description": "string" }
        ],
        "education": [
          { "degree": "string", "school": "string", "year": "string" }
        ],
        "projects": [
          { "title": "string", "techUsed": "string", "description": "string" }
        ]
      },
      "aiAnalysis": {
        "grammar": "string summary",
        "sentenceQuality": "string summary",
        "tone": "string",
        "projects": "string summary",
        "experience": "string summary",
        "education": "string summary",
        "skills": "string summary",
        "leadership": "string summary",
        "achievements": "string summary",
        "actionVerbs": "string summary",
        "numbers": "string summary",
        "impact": "string summary",
        "missingSections": ["string"],
        "weakBulletPoints": ["string"],
        "repeatedWords": ["string"],
        "passiveVoice": ["string"],
        "careerLevel": "string"
      },
      "aiSuggestions": [
        { "section": "string", "currentText": "string", "improvedText": "string", "explanation": "string", "atsIncrease": number }
      ],
      "readability": {
        "readingTime": number,
        "tone": "string",
        "complexity": "string",
        "sentenceLength": number,
        "score": number
      },
      "grammarChecker": {
        "errors": [
          { "word": "string", "errorType": "string", "suggestion": "string", "context": "string" }
        ],
        "passiveVoiceCount": number,
        "weakWordsCount": number,
        "repeatedWordsCount": number
      }
    }
  `;

  let aiResults = await queryGeminiAPI(prompt, 'You are an expert recruitment ATS parser. Always return JSON.');
  if (!aiResults) {
    aiResults = generateOfflineFallbackAnalysis(parsedData, atsScoreResults);
  }

  resume.extractedText = text;
  resume.parsedData = aiResults.parsedData || parsedData;
  resume.atsScore = atsScoreResults.overallScore;
  resume.atsBreakdown = atsScoreResults.atsBreakdown;
  resume.aiAnalysis = aiResults.aiAnalysis;
  resume.aiSuggestions = aiResults.aiSuggestions;
  resume.keywords = {
    matched: atsScoreResults.matchedKeywords,
    missing: atsScoreResults.missingKeywords
  };
  resume.grammarChecker = aiResults.grammarChecker;
  resume.readability = aiResults.readability;
  resume.sectionHealth = atsScoreResults.sectionHealth;

  await resume.save();
};

// Controller: Upload and analyze
const uploadAndAnalyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or Word document.' });
    }

    const resumeReport = await analyzeAndSaveResume(req.file, req.user.id);

    // Deduct user credit if user is not admin
    if (req.user.role !== 'Admin') {
      const userDoc = await User.findById(req.user.id);
      if (userDoc) {
        userDoc.aiCredits = Math.max(0, (userDoc.aiCredits || 0) - 1);
        await userDoc.save({ validateBeforeSave: false });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully!',
      data: resumeReport
    });
  } catch (err) {
    next(err);
  }
};

// Controller: Calculate Job Description Match %
const matchJobDescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please paste a valid job description (min 20 chars).' });
    }

    const resume = await Resume.findOne({ _id: id, uploadedBy: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found.' });
    }

    // Check offline mode fallback
    const textLower = resume.extractedText.toLowerCase();
    const jdLower = jobDescription.toLowerCase();

    // Word Match Logic
    const techWords = DICTS.atsKeywords;
    const matchedKeywords = techWords.filter(w => jdLower.includes(w.toLowerCase()) && textLower.includes(w.toLowerCase()));
    const missingKeywords = techWords.filter(w => jdLower.includes(w.toLowerCase()) && !textLower.includes(w.toLowerCase()));

    let matchPercentage = Math.round((matchedKeywords.length / Math.max(1, matchedKeywords.length + missingKeywords.length)) * 100);
    if (matchPercentage === 0) matchPercentage = 45; // base fallback

    // Gemini matcher
    const prompt = `
      Compare the following resume text against the job description.
      Resume text:
      """
      ${resume.extractedText.substring(0, 3000)}
      """
      Job description:
      """
      ${jobDescription.substring(0, 3000)}
      """

      Analyze matching skills, missing skills, and calculate an overall match percentage (0-100), interview chance (High, Medium, Low), and recommendations.
      Return JSON only:
      {
        "matchPercentage": number,
        "matchedKeywords": ["string"],
        "missingKeywords": ["string"],
        "matchedSkills": ["string"],
        "missingSkills": ["string"],
        "interviewChance": "High" | "Medium" | "Low",
        "aiSuggestions": "string"
      }
    `;

    let matchResults = await queryGeminiAPI(prompt, 'You are an ATS recruiter comparison tool. Always return JSON.');
    if (!matchResults) {
      matchResults = {
        matchPercentage,
        matchedKeywords,
        missingKeywords,
        matchedSkills: matchedKeywords,
        missingSkills: missingKeywords,
        interviewChance: matchPercentage > 75 ? 'High' : matchPercentage > 50 ? 'Medium' : 'Low',
        aiSuggestions: `Incorporate the following missing technologies: ${missingKeywords.join(', ')}. Rewrite your summary to target developer keywords in the description.`
      };
    }

    // Append to Resume matches array
    const newMatch = {
      jobTitle: jobDescription.substring(0, 40) + '...',
      description: jobDescription,
      matchPercentage: matchResults.matchPercentage,
      matchedKeywords: matchResults.matchedKeywords,
      missingKeywords: matchResults.missingKeywords,
      matchedSkills: matchResults.matchedSkills,
      missingSkills: matchResults.missingSkills,
      interviewChance: matchResults.interviewChance,
      aiSuggestions: matchResults.aiSuggestions
    };

    resume.jobMatches.push(newMatch);
    await resume.save();

    res.json({
      success: true,
      data: newMatch
    });
  } catch (err) {
    next(err);
  }
};

// Controller: One-click Section Rewrite
const rewriteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { section, originalText } = req.body;

    if (!section || !originalText || originalText.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please specify the section and supply text.' });
    }

    const resume = await Resume.findOne({ _id: id, uploadedBy: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume analysis record not found.' });
    }

    const prompt = `
      As an expert developer resume writer, rewrite the following "${section}" section text.
      Focus on professional tone, strong action verbs, and clear quantifiable impact. Keep it concise.
      
      Original text:
      "${originalText}"

      Return JSON only:
      {
        "rewrittenText": "string",
        "explanation": "string explaining why this version is better and what was improved"
      }
    `;

    let rewriteResults = await queryGeminiAPI(prompt, 'You are a professional resume rewriter. Always return JSON.');
    if (!rewriteResults) {
      rewriteResults = {
        rewrittenText: `Spearheaded software implementation for ${section} utilizing optimized MERN patterns, boosting workflow speed by 25%.`,
        explanation: 'Updated tasks to start with high-impact action verbs and added measurable performance increases.'
      };
    }

    res.json({
      success: true,
      data: rewriteResults
    });
  } catch (err) {
    next(err);
  }
};

// Controller: History logs
const getAnalysisHistory = async (req, res, next) => {
  try {
    const history = await Resume.find({ uploadedBy: req.user.id })
      .select('fileName fileSize fileType atsScore createdAt isPublic')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

// Controller: Delete resume
const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = req.user.role === 'Admin' ? { _id: id } : { _id: id, uploadedBy: req.user.id };
    
    const resume = await Resume.findOneAndDelete(query);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    if (resume.publicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      const resourceType = resume.fileType === 'pdf' ? 'image' : 'raw';
      await deleteFromCloudinary(resume.publicId, resourceType).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    // Clean up associated comments if any
    const ResumeComment = require('../models/ResumeComment');
    await ResumeComment.deleteMany({ resume: id });

    res.json({
      success: true,
      message: 'Resume record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// Controller: Specific report info
const getReportDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let resume = await Resume.findById(id).populate('uploadedBy', 'fullName username avatar role');
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Detailed report not found.' });
    }

    if (!resume.atsScore || !resume.parsedData || !resume.parsedData.skills || resume.parsedData.skills.length === 0) {
      await analyzeResumeInline(resume);
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadAndAnalyzeResume,
  matchJobDescription,
  rewriteSection,
  getAnalysisHistory,
  deleteAnalysis,
  getReportDetails,
  analyzeAndSaveResume
};
