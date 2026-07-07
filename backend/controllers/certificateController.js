const Certificate = require('../models/Certificate');

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Public
const getCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({}).sort({ displayOrder: 1, date: -1 });
    res.json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a certificate
// @route   POST /api/certificates
// @access  Private/Admin
const createCertificate = async (req, res, next) => {
  try {
    const { title, issuer, date, credentialId, credentialUrl, category, displayOrder, image: bodyImage, pdf: bodyPdf, pdfUrl } = req.body;
    let image = bodyImage || {};
    let pdf = bodyPdf || {};

    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'certificates');
      image = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    }

    const certificate = await Certificate.create({
      title,
      issuer,
      date: date ? new Date(date) : null,
      credentialId,
      credentialUrl,
      image,
      pdf,
      pdfUrl,
      category,
      displayOrder: displayOrder ? Number(displayOrder) : 0
    });

    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private/Admin
const updateCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const updates = { ...req.body };
    if (updates.displayOrder) updates.displayOrder = Number(updates.displayOrder);
    if (updates.date) updates.date = new Date(updates.date);

    let oldImageId = null;

    if (req.file) {
      const { uploadToCloudinary } = require('../middleware/upload');
      
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'certificates');
      updates.image = {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };

      if (certificate.image && certificate.image.publicId) {
        oldImageId = certificate.image.publicId;
      }
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (oldImageId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(oldImageId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    res.json({ success: true, data: updatedCertificate });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (certificate.image && certificate.image.publicId) {
      const { deleteFromCloudinary } = require('../middleware/upload');
      await deleteFromCloudinary(certificate.image.publicId).catch(err => console.error('Cloudinary delete error:', err.message));
    }

    await certificate.deleteOne();
    res.json({ success: true, message: 'Certificate deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate
};
