const express = require('express');
const router = express.Router();
const { getCertificates, createCertificate, updateCertificate, deleteCertificate } = require('../controllers/certificateController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

router.route('/')
  .get(getCertificates)
  .post(requireAuth, requireAdmin, upload.single('image'), createCertificate);

router.route('/:id')
  .put(requireAuth, requireAdmin, upload.single('image'), updateCertificate)
  .delete(requireAuth, requireAdmin, deleteCertificate);

module.exports = router;
