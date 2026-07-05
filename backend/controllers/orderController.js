const Order = require('../models/Order');
const { sendOrderAdminNotification, sendOrderUserConfirmation } = require('../utils/emailService');
const { uploadToCloudinary, uploadToLocal } = require('../middleware/upload');

// Helper to handle attachments upload
const handleAttachmentUpload = async (file, folder = 'orders') => {
  if (!file) return null;

  // 1. Try Cloudinary upload if configured
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      // Determine Cloudinary resource type
      let resourceType = 'raw';
      if (file.mimetype.startsWith('image/')) resourceType = 'image';
      else if (file.mimetype.startsWith('video/')) resourceType = 'video';

      const result = await uploadToCloudinary(file.buffer, folder, resourceType);
      return {
        url: result.url,
        publicId: result.publicId,
        fileName: file.originalname,
        fileSize: file.size
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local storage:', err.message);
    }
  }

  // 2. Local fallback storage
  try {
    const result = await uploadToLocal(file.buffer, folder);
    return {
      url: result.url,
      publicId: result.publicId,
      fileName: file.originalname,
      fileSize: file.size
    };
  } catch (err) {
    console.error('Local attachment upload failed:', err.message);
    throw new Error('Failed to store attachment file.');
  }
};

// @desc    Create a new service order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      selectedService,
      budget,
      projectType,
      deadline,
      description
    } = req.body;

    if (!name || !email || !selectedService || !budget || !description) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    // 1. Duplicate protection (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await Order.findOne({
      email: email.toLowerCase(),
      description,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an order with these details. Please wait a few minutes.'
      });
    }

    // 2. Upload file attachment if present
    let attachmentData = null;
    if (req.file) {
      attachmentData = await handleAttachmentUpload(req.file);
    }

    // 3. Save order to MongoDB
    const newOrder = await Order.create({
      name,
      email: email.toLowerCase(),
      phone,
      companyName,
      selectedService,
      budget,
      projectType,
      deadline: deadline || null,
      description,
      attachment: attachmentData || undefined,
      status: 'New'
    });

    // 4. Send email notifications
    try {
      await sendOrderAdminNotification('shekhartauhid@gmail.com', newOrder, req.ip || req.connection.remoteAddress);
      await sendOrderUserConfirmation(email.toLowerCase(), newOrder);
    } catch (emailErr) {
      console.error('Order emails failed:', emailErr.message);
    }

    // 5. Emit socket update to connected admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_service_order', newOrder);
    }

    res.status(201).json({
      success: true,
      message: 'Order request submitted successfully!',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all service orders
// @route   GET /api/orders
// @access  Private (Admin only)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'Contacted', 'In Progress', 'Completed', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
};
