const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== 'undefined' && envUrl !== 'null') return envUrl;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  if (port === '5173' || port === '5174') {
    return `${protocol}//${hostname}:5000/api`;
  }
  return 'https://tauhid-shekhar-portfolio.onrender.com/api';
};
const API_BASE = getApiBase();

let authFailureCallback = null;

export const registerAuthFailureCallback = (callback) => {
  authFailureCallback = callback;
};

const checkResponse = async (response) => {
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && authFailureCallback) {
      authFailureCallback();
    }
    const error = new Error(result.message || 'API request failed');
    error.status = response.status;
    error.errors = result.errors;
    throw error;
  }
  return result;
};

const inflightRequests = new Map();

const apiRequest = async (endpoint, options = {}) => {
  const method = options.method ? options.method.toUpperCase() : 'GET';
  
  // Deduplicate concurrent GET requests
  if (method === 'GET') {
    if (inflightRequests.has(endpoint)) {
      return inflightRequests.get(endpoint);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let url = `${API_BASE}${endpoint}`;

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Crucial for HttpOnly cookies on cross-origin requests
        cache: 'no-store', // Disable browser caching for fresh database data
      });
      return await checkResponse(response);
    } finally {
      if (method === 'GET') {
        inflightRequests.delete(endpoint);
      }
    }
  })();

  if (method === 'GET') {
    inflightRequests.set(endpoint, requestPromise);
  }

  return requestPromise;
};

// Helper for multipart/form-data requests (file uploads)
const apiUploadRequest = async (endpoint, formData, options = {}) => {
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...options.headers,
  };
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers
  });

  return checkResponse(response);
};


// API Services
export const api = {
  // Auth
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  verifyEmail: async (token) => {
    return apiRequest(`/auth/verify-email/${token}`);
  },
  checkUsernameAvailability: async (username, excludeUserId = '') => {
    return apiRequest(`/auth/check-username?username=${encodeURIComponent(username)}&excludeUserId=${excludeUserId}`);
  },
  login: async (identifier, password, rememberMe = false) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, rememberMe })
    });
  },
  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
  refreshToken: async () => {
    return apiRequest('/auth/refresh-token', { method: 'POST' });
  },
  getProfile: async () => {
    return apiRequest('/auth/me');
  },
  updateProfile: async (formData) => {
    // Expects FormData for avatar upload support
    const response = await fetch(`${API_BASE}/auth/update-profile`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    return checkResponse(response);
  },
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
    });
  },
  logoutAllDevices: async () => {
    return apiRequest('/auth/logout-all', { method: 'POST' });
  },
  downloadPersonalData: async () => {
    // Return the raw response or fetch directly
    const response = await fetch(`${API_BASE}/auth/download-data`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to download personal data');
    return response.json();
  },
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  verifyResetToken: async (token) => {
    return apiRequest('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },
  resetPassword: async (token, password, confirmPassword) => {
    return apiRequest(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword })
    });
  },
  recoverAccount: async (identifier) => {
    return apiRequest('/auth/recover-account', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },
  verifyRecoveryOtp: async (identifier, otp, password, confirmPassword) => {
    return apiRequest('/auth/verify-recovery-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp, password, confirmPassword })
    });
  },
  sendOTP: async () => {
    return apiRequest('/auth/send-otp', { method: 'POST' });
  },
  verifyOTP: async (code) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },
  toggleSaveProject: async (projectId) => {
    return apiRequest(`/auth/saved-projects/${projectId}`, { method: 'POST' });
  },
  getSavedProjects: async () => {
    return apiRequest('/auth/saved-projects');
  },
  deleteAccount: async () => {
    return apiRequest('/auth/delete-account', { method: 'DELETE' });
  },
  getUserOrders: async () => {
    return apiRequest('/auth/my-orders');
  },

  // Skills
  getSkills: async () => {
    return apiRequest('/skills');
  },
  createSkill: async (skillData) => {
    return apiRequest('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData)
    });
  },
  updateSkill: async (id, skillData) => {
    return apiRequest(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData)
    });
  },
  deleteSkill: async (id) => {
    return apiRequest(`/skills/${id}`, { method: 'DELETE' });
  },

  // Projects
  getProjects: async () => {
    return apiRequest('/projects');
  },
  createProject: async (projectData) => {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },
  updateProject: async (id, projectData) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  },
  deleteProject: async (id) => {
    return apiRequest(`/projects/${id}`, { method: 'DELETE' });
  },
  addProjectComment: async (projectId, content) => {
    return apiRequest(`/projects/${projectId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },
  deleteProjectComment: async (projectId, commentId) => {
    return apiRequest(`/projects/${projectId}/comments/${commentId}`, { method: 'DELETE' });
  },

  // Experiences
  getExperience: async () => {
    return apiRequest('/experience');
  },
  createExperience: async (expData) => {
    return apiRequest('/experience', {
      method: 'POST',
      body: JSON.stringify(expData)
    });
  },
  updateExperience: async (id, expData) => {
    return apiRequest(`/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expData)
    });
  },
  deleteExperience: async (id) => {
    return apiRequest(`/experience/${id}`, { method: 'DELETE' });
  },

  // Educations
  getEducation: async () => {
    return apiRequest('/education');
  },
  createEducation: async (eduData) => {
    return apiRequest('/education', {
      method: 'POST',
      body: JSON.stringify(eduData)
    });
  },
  updateEducation: async (id, eduData) => {
    return apiRequest(`/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eduData)
    });
  },
  deleteEducation: async (id) => {
    return apiRequest(`/education/${id}`, { method: 'DELETE' });
  },

  // Blogs
  getBlogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/blogs?${query}`);
  },
  getBlogBySlug: async (slug) => {
    return apiRequest(`/blogs/${slug}`);
  },
  createBlog: async (formData) => {
    const response = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Blog creation failed');
    return result;
  },
  updateBlog: async (id, formData) => {
    const response = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Blog update failed');
    return result;
  },
  deleteBlog: async (id) => {
    return apiRequest(`/blogs/${id}`, { method: 'DELETE' });
  },

  // Testimonials
  getTestimonials: async () => {
    return apiRequest('/testimonials');
  },
  createTestimonial: async (formData) => {
    const response = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Testimonial creation failed');
    return result;
  },
  updateTestimonial: async (id, formData) => {
    const response = await fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Testimonial update failed');
    return result;
  },
  deleteTestimonial: async (id) => {
    return apiRequest(`/testimonials/${id}`, { method: 'DELETE' });
  },

  // Certificates
  getCertificates: async () => {
    return apiRequest('/certificates');
  },
  createCertificate: async (certData) => {
    return apiRequest('/certificates', {
      method: 'POST',
      body: JSON.stringify(certData)
    });
  },
  updateCertificate: async (id, certData) => {
    return apiRequest(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certData)
    });
  },
  deleteCertificate: async (id) => {
    return apiRequest(`/certificates/${id}`, { method: 'DELETE' });
  },

  // Achievements
  getAchievements: async () => {
    return apiRequest('/achievements');
  },
  createAchievement: async (data) => {
    return apiRequest('/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAchievement: async (id, data) => {
    return apiRequest(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteAchievement: async (id) => {
    return apiRequest(`/achievements/${id}`, { method: 'DELETE' });
  },

  // Services
  getServices: async () => {
    return apiRequest('/services');
  },
  createService: async (serviceData) => {
    return apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  },
  updateService: async (id, serviceData) => {
    return apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    });
  },
  deleteService: async (id) => {
    return apiRequest(`/services/${id}`, { method: 'DELETE' });
  },

  // Gallery
  getGallery: async () => {
    return apiRequest('/gallery');
  },
  createGalleryItem: async (formData) => {
    const response = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gallery item creation failed');
    return result;
  },
  updateGalleryItem: async (id, formData) => {
    const response = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gallery item update failed');
    return result;
  },
  deleteGalleryItem: async (id) => {
    return apiRequest(`/gallery/${id}`, { method: 'DELETE' });
  },

  // Resume
  getResumes: async () => {
    return apiRequest('/resume');
  },
  getActiveResume: async () => {
    return apiRequest('/resume/active');
  },
  uploadResume: async (formData) => {
    const response = await fetch(`${API_BASE}/resume`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Resume upload failed');
    return result;
  },
  deleteResume: async (id) => {
    return apiRequest(`/resume/${id}`, { method: 'DELETE' });
  },

  // Media Library
  getMedia: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/media?${query}`);
  },
  uploadMedia: async (formData) => {
    const response = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Media upload failed');
    return result;
  },
  deleteMedia: async (id) => {
    return apiRequest(`/media/${id}`, { method: 'DELETE' });
  },

  // SEO Settings
  getSEO: async () => {
    return apiRequest('/seo');
  },
  updateSEO: async (formData) => {
    const response = await fetch(`${API_BASE}/seo`, {
      method: 'PUT',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'SEO update failed');
    return result;
  },

  getPortfolioAll: async () => {
    return apiRequest('/portfolio/all');
  },

  // Website Settings
  getSettings: async () => {
    return apiRequest('/settings');
  },
  updateSettings: async (settingsData) => {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  },

  // Contact Messages
  getMessages: async () => {
    return apiRequest('/contact');
  },
  sendMessage: async (messageData) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },
  createMessage: async (messageData) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },
  markMessageRead: async (id) => {
    return apiRequest(`/contact/${id}/read`, { method: 'PATCH' });
  },
  deleteMessage: async (id) => {
    return apiRequest(`/contact/${id}`, { method: 'DELETE' });
  },
  toggleMessageArchive: async (id) => {
    return apiRequest(`/contact/${id}/archive`, { method: 'PATCH' });
  },

  // User Management
  getUsers: async () => {
    return apiRequest('/users');
  },
  updateUserRole: async (id, role) => {
    return apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },
  toggleUserStatus: async (id) => {
    return apiRequest(`/users/${id}/status`, { method: 'PUT' });
  },
  deleteUser: async (id) => {
    return apiRequest(`/users/${id}`, { method: 'DELETE' });
  },

  // Hero CMS Endpoints
  getHero: async () => {
    return apiRequest('/hero');
  },
  updateHero: async (heroData) => {
    return apiRequest('/hero', {
      method: 'PUT',
      body: JSON.stringify(heroData)
    });
  },

  // About CMS Endpoints
  getAbout: async () => {
    return apiRequest('/about');
  },
  updateAbout: async (aboutData) => {
    return apiRequest('/about', {
      method: 'PUT',
      body: JSON.stringify(aboutData)
    });
  },

  // Service Orders CMS Endpoints
  createOrder: async (orderData) => {
    if (orderData instanceof FormData) {
      return apiUploadRequest('/orders', orderData);
    }
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  getOrders: async () => {
    return apiRequest('/orders');
  },
  updateOrderStatus: async (id, status) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  deleteOrder: async (id) => {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    });
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/audit-logs?${query}`);
  },

  // Analytics Stats
  getAnalyticsStats: async () => {
    return apiRequest('/analytics/stats');
  },
  trackPageView: async (pageData) => {
    return apiRequest('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(pageData)
    });
  },

  exportBackupUrl: `${API_BASE}/backup/export`,
  restoreBackup: async (formData) => {
    const response = await fetch(`${API_BASE}/backup/restore`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Restore failed');
    return result;
  },

  // ==========================================
  // COMMUNITY MODULE API CALLS
  // ==========================================
  getCommunityPosts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/community/posts?${query}`);
  },
  createCommunityPost: async (payload) => {
    return apiRequest('/community/posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateCommunityPost: async (id, payload) => {
    return apiRequest(`/community/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteCommunityPost: async (id) => {
    return apiRequest(`/community/posts/${id}`, { method: 'DELETE' });
  },
  reactToCommunityPost: async (id, type) => {
    return apiRequest(`/community/posts/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  },
  bookmarkCommunityPost: async (id) => {
    return apiRequest(`/community/posts/${id}/bookmark`, { method: 'POST' });
  },
  votePollOption: async (postId, optionId) => {
    return apiRequest(`/community/posts/${postId}/poll/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionId })
    });
  },
  getCommunityComments: async (postId) => {
    return apiRequest(`/community/posts/${postId}/comments`);
  },
  addCommunityComment: async (postId, content, parentCommentId = null) => {
    return apiRequest(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId })
    });
  },
  deleteCommunityComment: async (commentId) => {
    return apiRequest(`/community/comments/${commentId}`, { method: 'DELETE' });
  },
  updateCommunityComment: async (commentId, content) => {
    return apiRequest(`/community/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },
  getCommunityGroups: async () => {
    return apiRequest('/community/groups');
  },
  getCommunityGroupDetails: async (id) => {
    return apiRequest(`/community/groups/${id}`);
  },
  createCommunityGroup: async (payload) => {
    return apiRequest('/community/groups', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateCommunityGroup: async (id, payload) => {
    return apiRequest(`/community/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteCommunityGroup: async (id) => {
    return apiRequest(`/community/groups/${id}`, { method: 'DELETE' });
  },
  joinLeaveCommunityGroup: async (groupId) => {
    return apiRequest(`/community/groups/${groupId}/join`, { method: 'POST' });
  },
  uploadCommunityGroupAssets: async (id, formData) => {
    const response = await fetch(`${API_BASE}/community/groups/${id}/assets`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Asset upload failed');
    return result;
  },
  manageCommunityGroupMembers: async (id, payload) => {
    return apiRequest(`/community/groups/${id}/members`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  uploadCommunityGroupFile: async (id, formData) => {
    const response = await fetch(`${API_BASE}/community/groups/${id}/files`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'File upload failed');
    return result;
  },

  // Doubt Section (Q&A)
  getCommunityQuestions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/community/questions?${query}`);
  },
  createCommunityQuestion: async (payload) => {
    return apiRequest('/community/questions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getCommunityQuestionDetails: async (id) => {
    return apiRequest(`/community/questions/${id}`);
  },
  deleteCommunityQuestion: async (id) => {
    return apiRequest(`/community/questions/${id}`, { method: 'DELETE' });
  },
  updateCommunityQuestion: async (id, payload) => {
    return apiRequest(`/community/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  voteCommunityQuestion: async (id, voteType) => {
    return apiRequest(`/community/questions/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType })
    });
  },
  bookmarkCommunityQuestion: async (id) => {
    return apiRequest(`/community/questions/${id}/bookmark`, { method: 'POST' });
  },
  createCommunityAnswer: async (questionId, payload) => {
    return apiRequest(`/community/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(typeof payload === 'string' ? { content: payload } : payload)
    });
  },
  voteCommunityAnswer: async (answerId, voteType) => {
    return apiRequest(`/community/answers/${answerId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType })
    });
  },
  acceptCommunityAnswer: async (answerId) => {
    return apiRequest(`/community/answers/${answerId}/accept`, { method: 'POST' });
  },
  deleteCommunityAnswer: async (answerId) => {
    return apiRequest(`/community/answers/${answerId}`, { method: 'DELETE' });
  },
  updateCommunityAnswer: async (answerId, payload) => {
    return apiRequest(`/community/answers/${answerId}`, {
      method: 'PUT',
      body: JSON.stringify(typeof payload === 'string' ? { content: payload } : payload)
    });
  },

  // Project Showcase
  getCommunityProjects: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/community/projects?${query}`);
  },
  createCommunityProject: async (payload) => {
    return apiRequest('/community/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteCommunityProject: async (id) => {
    return apiRequest(`/community/projects/${id}`, { method: 'DELETE' });
  },
  updateCommunityProject: async (id, payload) => {
    return apiRequest(`/community/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  likeCommunityProject: async (id) => {
    return apiRequest(`/community/projects/${id}/like`, { method: 'POST' });
  },
  commentOnCommunityProject: async (id, content) => {
    return apiRequest(`/community/projects/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },
  getCommunityResources: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/community/resources?${query}`);
  },
  uploadCommunityResource: async (payload) => {
    return apiRequest('/community/resources', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  downloadCommunityResource: async (resourceId) => {
    return apiRequest(`/community/resources/${resourceId}/download`, { method: 'POST' });
  },
  deleteCommunityResource: async (resourceId) => {
    return apiRequest(`/community/resources/${resourceId}`, { method: 'DELETE' });
  },
  updateCommunityResource: async (id, payload) => {
    return apiRequest(`/community/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  getCommunityJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/community/jobs?${query}`);
  },
  postCommunityJob: async (payload) => {
    return apiRequest('/community/jobs', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  applyToCommunityJob: async (jobId) => {
    return apiRequest(`/community/jobs/${jobId}/apply`, { method: 'POST' });
  },
  updateCommunityJob: async (id, payload) => {
    return apiRequest(`/community/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteCommunityJob: async (id) => {
    return apiRequest(`/community/jobs/${id}`, { method: 'DELETE' });
  },
  getCommunityLeaderboard: async () => {
    return apiRequest('/community/leaderboard');
  },
  toggleFollowUser: async (userId) => {
    return apiRequest(`/community/users/${userId}/follow`, { method: 'POST' });
  },
  getCommunityUserProfile: async (userId) => {
    return apiRequest(`/community/users/${userId}/profile`);
  },
  getCommunityNotifications: async () => {
    return apiRequest('/community/notifications');
  },
  readCommunityNotifications: async () => {
    return apiRequest('/community/notifications/read', { method: 'PUT' });
  },
  getChatsConversations: async () => {
    return apiRequest('/community/chats/conversations');
  },
  startChatsConversation: async (payload) => {
    return apiRequest('/community/chats/conversations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getChatsMessages: async (conversationId) => {
    return apiRequest(`/community/chats/messages/${conversationId}`);
  },
  uploadCommunityImage: async (formData) => {
    const response = await fetch(`${API_BASE}/community/upload-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Image upload failed');
    return result;
  },
  // Events API
  getCommunityEvents: async (groupId) => {
    return apiRequest(`/community/events${groupId ? `?groupId=${groupId}` : ''}`);
  },
  createCommunityEvent: async (eventData) => {
    return apiRequest('/community/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },
  rsvpCommunityEvent: async (eventId) => {
    return apiRequest(`/community/events/${eventId}/rsvp`, { method: 'POST' });
  },
  deleteCommunityEvent: async (eventId) => {
    return apiRequest(`/community/events/${eventId}`, { method: 'DELETE' });
  },
  updateCommunityEvent: async (id, payload) => {
    return apiRequest(`/community/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  // Reports API
  submitCommunityReport: async (reportData) => {
    return apiRequest('/community/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },
  getCommunityReports: async () => {
    return apiRequest('/community/reports');
  },
  actionCommunityReport: async (reportId, actionData) => {
    return apiRequest(`/community/reports/${reportId}/action`, {
      method: 'POST',
      body: JSON.stringify(actionData)
    });
  },

  // Gamification, Streaks, Challenges, Store & AI Consultant API
  getRewardsDashboard: async () => {
    return apiRequest('/community/rewards/dashboard');
  },
  claimMissionReward: async (missionId) => {
    return apiRequest(`/community/rewards/claim-mission/${missionId}`, { method: 'POST' });
  },
  triggerSpinWheel: async () => {
    return apiRequest('/community/rewards/spin-wheel', { method: 'POST' });
  },
  getEcosystemLeaderboard: async (category = 'xp') => {
    return apiRequest(`/community/rewards/leaderboard-ecosystem?category=${category}`);
  },
  getDailyChallenge: async () => {
    return apiRequest('/community/challenges/today');
  },
  getRandomChallenge: async () => {
    return apiRequest('/community/challenges/random');
  },
  submitChallengeSolution: async (id, code, runOnly = false) => {
    return apiRequest(`/community/challenges/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code, runOnly })
    });
  },
  unlockChallengeHint: async (id, level) => {
    return apiRequest(`/community/challenges/${id}/unlock-hint`, {
      method: 'POST',
      body: JSON.stringify({ level })
    });
  },
  submitQuizScore: async (difficulty, score, totalQuestions) => {
    return apiRequest('/community/challenges/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ difficulty, score, totalQuestions })
    });
  },
  getStoreProducts: async () => {
    return apiRequest('/community/store/products');
  },
  checkoutStoreProduct: async (productId, payload) => {
    return apiRequest(`/community/store/checkout/${productId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getStoreHistory: async () => {
    return apiRequest('/community/store/history');
  },
  refundStoreProduct: async (orderId) => {
    return apiRequest(`/community/store/refund/${orderId}`, {
      method: 'POST'
    });
  },
  aiReviewCode: async (code, language = 'Javascript') => {
    return apiRequest('/community/ai/review-code', {
      method: 'POST',
      body: JSON.stringify({ code, language })
    });
  },
  aiReviewResume: async (resumeText) => {
    return apiRequest('/community/ai/review-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeText })
    });
  },
  aiGenerateContent: async (topic, category = 'General') => {
    return apiRequest('/community/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify({ topic, category })
    });
  },
  getAIChats: async () => {
    return apiRequest('/community/ai/chats');
  },
  createAIChat: async (payload) => {
    return apiRequest('/community/ai/chats', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  sendAIChatMessage: async (chatId, content, attachments = null) => {
    return apiRequest(`/community/ai/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments })
    });
  },
  updateAIChat: async (chatId, payload) => {
    return apiRequest(`/community/ai/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteAIChat: async (chatId) => {
    return apiRequest(`/community/ai/chats/${chatId}`, {
      method: 'DELETE'
    });
  },

  // ATS Resume Analyzer API
  uploadAndAnalyzeResume: async (formData) => {
    return apiUploadRequest('/resume/upload/analyze', formData);
  },
  matchJobDescription: async (id, payload) => {
    return apiRequest(`/resume/job-match/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  rewriteResumeSection: async (id, payload) => {
    return apiRequest(`/resume/rewrite/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getResumeHistory: async () => {
    return apiRequest('/resume/history/logs');
  },
  deleteResumeAnalysis: async (id) => {
    return apiRequest(`/resume/history/logs/${id}`, {
      method: 'DELETE'
    });
  },
  getResumeReportDetails: async (id) => {
    return apiRequest(`/resume/report/details/${id}`);
  },

  // Community Resume Hub API
  getCommunityResumeHub: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/resume/community/hub?${query}`);
  },
  shareResumeToHub: async (id, payload) => {
    return apiRequest(`/resume/community/share/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  submitCommunityReview: async (id, payload) => {
    return apiRequest(`/resume/community/review/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  postResumeComment: async (id, payload) => {
    return apiRequest(`/resume/community/comment/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getResumeComments: async (id) => {
    return apiRequest(`/resume/community/comments/${id}`);
  },
  toggleLikeResume: async (id) => {
    return apiRequest(`/resume/community/like/${id}`, {
      method: 'POST'
    });
  },
  toggleBookmarkResume: async (id) => {
    return apiRequest(`/resume/community/bookmark/${id}`, {
      method: 'POST'
    });
  },
  reportResume: async (id, payload) => {
    return apiRequest(`/resume/community/report/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getResumeLeaderboard: async () => {
    return apiRequest('/resume/community/leaderboard');
  },
  getResumeAnalytics: async () => {
    return apiRequest('/resume/community/analytics');
  },
  getFeatures: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/features?${query}`);
  },
  getAllFeatures: async () => {
    return apiRequest('/features/all');
  },
  createFeature: async (payload) => {
    return apiRequest('/features', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateFeature: async (id, payload) => {
    return apiRequest(`/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteFeature: async (id) => {
    return apiRequest(`/features/${id}`, {
      method: 'DELETE'
    });
  },
  completeOnboarding: async () => {
    return apiRequest('/features/onboarding/complete', {
      method: 'POST'
    });
  },
  resetOnboarding: async () => {
    return apiRequest('/features/onboarding/reset', {
      method: 'POST'
    });
  },
  viewFeatureRelease: async (id) => {
    return apiRequest(`/features/view/${id}`, {
      method: 'POST'
    });
  },
  getWhatsNewFeatures: async () => {
    return apiRequest('/features/whats-new');
  },

  // CMS Draft & Versioning API
  getCmsDraft: async (model, id) => {
    return apiRequest(`/cms/draft/${model}/${id || 'new'}`);
  },
  saveCmsDraft: async (model, id, draftData) => {
    return apiRequest(`/cms/draft/${model}/${id || 'new'}`, {
      method: 'POST',
      body: JSON.stringify({ draftData })
    });
  },
  publishCmsDraft: async (model, id, comment) => {
    return apiRequest(`/cms/publish/${model}/${id || 'new'}`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  },
  getCmsVersions: async (model, id) => {
    return apiRequest(`/cms/versions/${model}/${id}`);
  },
  restoreCmsVersion: async (versionId) => {
    return apiRequest(`/cms/restore/${versionId}`, {
      method: 'POST'
    });
  }
};
