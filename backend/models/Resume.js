const mongoose = require('mongoose');

const parsedDataSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  skills: [String],
  technicalSkills: [String],
  softSkills: [String],
  summary: { type: String, default: '' },
  experience: [mongoose.Schema.Types.Mixed],
  education: [mongoose.Schema.Types.Mixed],
  projects: [mongoose.Schema.Types.Mixed],
  certifications: [String],
  achievements: [String],
  languages: [String],
  awards: [String]
}, { _id: false });

const scoreDetailSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  reason: { type: String, default: '' },
  tips: [String]
}, { _id: false });

const atsBreakdownSchema = new mongoose.Schema({
  layout: scoreDetailSchema,
  formatting: scoreDetailSchema,
  keyword: scoreDetailSchema,
  grammar: scoreDetailSchema,
  readability: scoreDetailSchema,
  experience: scoreDetailSchema,
  education: scoreDetailSchema,
  projects: scoreDetailSchema,
  skills: scoreDetailSchema,
  achievement: scoreDetailSchema,
  professionalism: scoreDetailSchema,
  impact: scoreDetailSchema
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  grammar: { type: String, default: '' },
  sentenceQuality: { type: String, default: '' },
  tone: { type: String, default: '' },
  projects: { type: String, default: '' },
  experience: { type: String, default: '' },
  education: { type: String, default: '' },
  skills: { type: String, default: '' },
  leadership: { type: String, default: '' },
  achievements: { type: String, default: '' },
  actionVerbs: { type: String, default: '' },
  numbers: { type: String, default: '' },
  impact: { type: String, default: '' },
  missingSections: [String],
  weakBulletPoints: [String],
  repeatedWords: [String],
  passiveVoice: [String],
  careerLevel: { type: String, default: '' }
}, { _id: false });

const aiSuggestionSchema = new mongoose.Schema({
  section: { type: String, default: '' },
  currentText: { type: String, default: '' },
  improvedText: { type: String, default: '' },
  explanation: { type: String, default: '' },
  atsIncrease: { type: Number, default: 0 }
}, { _id: false });

const grammarCheckerSchema = new mongoose.Schema({
  errors: [{
    word: String,
    errorType: String,
    suggestion: String,
    context: String
  }],
  passiveVoiceCount: { type: Number, default: 0 },
  weakWordsCount: { type: Number, default: 0 },
  repeatedWordsCount: { type: Number, default: 0 }
}, { _id: false });

const readabilitySchema = new mongoose.Schema({
  readingTime: { type: Number, default: 0 }, // in minutes
  tone: { type: String, default: '' },
  complexity: { type: String, default: '' },
  sentenceLength: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
}, { _id: false });

const sectionHealthSchema = new mongoose.Schema({
  education: { type: String, default: 'Missing' },
  experience: { type: String, default: 'Missing' },
  projects: { type: String, default: 'Missing' },
  skills: { type: String, default: 'Missing' },
  achievements: { type: String, default: 'Missing' },
  summary: { type: String, default: 'Missing' },
  certificates: { type: String, default: 'Missing' },
  languages: { type: String, default: 'Missing' }
}, { _id: false });

const jobMatchSchema = new mongoose.Schema({
  jobTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  matchPercentage: { type: Number, default: 0 },
  matchedKeywords: [String],
  missingKeywords: [String],
  matchedSkills: [String],
  missingSkills: [String],
  interviewChance: { type: String, default: 'Low' },
  aiSuggestions: { type: String, default: '' }
}, { _id: false });

const communityRatingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  layout: { type: Number, required: true, min: 1, max: 5 },
  projects: { type: Number, required: true, min: 1, max: 5 },
  skills: { type: Number, required: true, min: 1, max: 5 },
  experience: { type: Number, required: true, min: 1, max: 5 },
  design: { type: Number, required: true, min: 1, max: 5 },
  ats: { type: Number, required: true, min: 1, max: 5 },
  overall: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, default: '' }
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' }
}, { timestamps: true });

const resumeSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    publicId: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    fileType: { type: String, enum: ['pdf', 'doc', 'docx'], default: 'pdf' },
    extractedText: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Parsed Data & Scores
    parsedData: parsedDataSchema,
    atsScore: { type: Number, default: 0 },
    atsBreakdown: atsBreakdownSchema,
    aiAnalysis: aiAnalysisSchema,
    aiSuggestions: [aiSuggestionSchema],
    keywords: {
      matched: { type: [String], default: [] },
      missing: { type: [String], default: [] }
    },
    grammarChecker: grammarCheckerSchema,
    readability: readabilitySchema,
    sectionHealth: sectionHealthSchema,
    
    // Job Match logs
    jobMatches: [jobMatchSchema],

    // Community reviews and reactions
    ratings: [communityRatingSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [reportSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
