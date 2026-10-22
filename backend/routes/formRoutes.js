const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const formCategoryController = require('../controllers/formCategoryController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');
const { uploadFormFiles } = require('../middleware/formUpload');
const { formSubmissionLimiter } = require('../middleware/rateLimiter');

// ---------------------------------------------------------------------------
// CATEGORIES ROUTES (Public gets active; Admin gets full CRUD)
// ---------------------------------------------------------------------------
router.get('/categories', optionalAuth, formCategoryController.getCategories);
router.post('/categories', requireAuth, requireAdmin, formCategoryController.createCategory);
router.put('/categories/:id', requireAuth, requireAdmin, formCategoryController.updateCategory);
router.put('/categories/:id/toggle-active', requireAuth, requireAdmin, formCategoryController.toggleCategoryActive);
router.delete('/categories/:id', requireAuth, requireAdmin, formCategoryController.deleteCategory);

// ---------------------------------------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------------------------------------

// Get list of publicly visible forms (for directory or placement query)
router.get('/public', formController.getPublicForms);
router.get('/', formController.getPublicForms);

// Get single form by slug (optionalAuth allows admins to preview unpublished drafts)
router.get('/public/:slug', optionalAuth, formController.getPublicFormBySlug);

// Get QR Code for form URL
router.get('/:slug/qr', formController.getFormQrCode);

// Public Form Submission with file upload support & rate limiting
router.post(
  '/:slug/submit',
  formSubmissionLimiter,
  uploadFormFiles.any(),
  formController.submitForm
);

// ---------------------------------------------------------------------------
// ADMIN PROTECTED ROUTES
// ---------------------------------------------------------------------------

// Secure file viewing/downloading (Admin only)
router.get('/files/:fileId', requireAuth, requireAdmin, formController.secureFileDownload);

// Form CRUD operations
router.get('/admin/all', requireAuth, requireAdmin, formController.getAdminForms);
router.post('/admin', requireAuth, requireAdmin, formController.createForm);
router.get('/admin/:id', requireAuth, requireAdmin, formController.getFormById);
router.put('/admin/:id', requireAuth, requireAdmin, formController.updateForm);
router.post('/admin/:id/duplicate', requireAuth, requireAdmin, formController.duplicateForm);
router.put('/admin/:id/archive', requireAuth, requireAdmin, formController.archiveForm);
router.delete('/admin/:id', requireAuth, requireAdmin, formController.deleteForm);
router.get('/admin/:formId/analytics', requireAuth, requireAdmin, formController.getFormAnalytics);

// Submissions management
router.get('/admin/submissions/list', requireAuth, requireAdmin, formController.getSubmissions);
router.get('/admin/submissions/export', requireAuth, requireAdmin, formController.exportSubmissionsCSV);
router.get('/admin/submissions/:id', requireAuth, requireAdmin, formController.getSubmissionById);
router.put('/admin/submissions/:id/status', requireAuth, requireAdmin, formController.updateSubmissionStatus);
router.post('/admin/submissions/:id/notes', requireAuth, requireAdmin, formController.addSubmissionNote);
router.delete('/admin/submissions/:id', requireAuth, requireAdmin, formController.deleteSubmission);

module.exports = router;
