const Order = require('../models/Order');
const {
  sendOrderAdminNotification,
  sendOrderUserConfirmation,
  sendInquiryAdminNotification,
  sendInquiryUserConfirmation,
  getAdminNotificationEmail
} = require('../utils/emailService');
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

// @desc    Create a new service order or inquiry
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
      serviceId,
      packageName,
      budget,
      projectType,
      deadline,
      timelineExpectation,
      description,
      requestType = 'order'
    } = req.body;

    if (!name || !email || !selectedService || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, service selection, and description are required.'
      });
    }

    // 1. Anti-duplicate protection (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await Order.findOne({
      email: email.toLowerCase(),
      description,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A submission with these details was recently received. Please check your inbox or wait a few minutes before resubmitting.',
        referenceId: duplicate.referenceId
      });
    }

    // 2. Upload file attachment if present
    let attachmentData = null;
    if (req.file) {
      attachmentData = await handleAttachmentUpload(req.file);
    }

    // 3. Save order to MongoDB
    const isOrder = requestType === 'order';
    const newOrder = await Order.create({
      requestType: isOrder ? 'order' : 'inquiry',
      serviceId: serviceId || undefined,
      packageName: packageName || (isOrder ? 'Standard' : 'Inquiry'),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      companyName: companyName ? companyName.trim() : '',
      selectedService: selectedService.trim(),
      budget: budget ? budget.trim() : (isOrder ? 'Flexible / To Discuss' : 'N/A (Inquiry)'),
      projectType: projectType ? projectType.trim() : '',
      deadline: deadline || null,
      timelineExpectation: timelineExpectation ? timelineExpectation.trim() : '',
      description: description.trim(),
      attachment: attachmentData || undefined,
      status: 'New'
    });

    // 4. Send asynchronous email notifications (NEVER fail order if email fails)
    try {
      const clientIp = req.ip || req.connection?.remoteAddress || 'N/A';
      const adminTarget = await getAdminNotificationEmail(isOrder ? 'order' : 'inquiry');

      if (isOrder) {
        await Promise.allSettled([
          sendOrderAdminNotification(adminTarget, newOrder, clientIp),
          sendOrderUserConfirmation(newOrder.email, newOrder)
        ]);
      } else {
        await Promise.allSettled([
          sendInquiryAdminNotification(adminTarget, newOrder, clientIp),
          sendInquiryUserConfirmation(newOrder.email, newOrder)
        ]);
      }
    } catch (emailErr) {
      console.warn('Asynchronous email notification caught error (order remains saved):', emailErr.message);
    }

    // 5. Emit socket update to connected admins
    const io = req.app.get('io');
    if (io) {
      io.emit('new_service_order', newOrder);
    }

    res.status(201).json({
      success: true,
      message: isOrder
        ? `Service order placed successfully! Reference Code: ${newOrder.referenceId}`
        : `Service inquiry submitted successfully! Reference Code: ${newOrder.referenceId}`,
      referenceId: newOrder.referenceId,
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all service orders and inquiries with filtering & pagination
// @route   GET /api/orders
// @access  Private (Admin only)
const getOrders = async (req, res) => {
  try {
    const {
      requestType,
      status,
      search,
      page = 1,
      limit = 50,
      sortBy = 'newest'
    } = req.query;

    const filter = {};

    if (requestType && requestType !== 'all') {
      filter.requestType = requestType;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { referenceId: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { selectedService: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const sortObj = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('serviceId', 'title slug price category')
        .lean(),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin only)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('serviceId', 'title slug price category');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
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
    const allowed = [
      'New',
      'Pending Review',
      'Contacted',
      'Quotation Sent',
      'In Progress',
      'Completed',
      'Rejected',
      'Cancelled'
    ];

    if (!allowed.includes(status)) {
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

// @desc    Add admin note to order
// @route   POST /api/orders/:id/notes
// @access  Private (Admin only)
const addOrderNote = async (req, res) => {
  try {
    const { note, author } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.adminNotes.push({
      note: note.trim(),
      author: author || req.user?.name || 'Admin',
      createdAt: new Date()
    });

    await order.save();
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
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export orders to CSV
// @route   GET /api/orders/export/csv
// @access  Private (Admin only)
const exportOrdersCsv = async (req, res) => {
  try {
    const { requestType } = req.query;
    const filter = {};
    if (requestType && requestType !== 'all') {
      filter.requestType = requestType;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const headers = [
      'Reference ID',
      'Type',
      'Date',
      'Client Name',
      'Email',
      'Phone',
      'Company',
      'Service',
      'Package',
      'Budget',
      'Deadline',
      'Status',
      'Description'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = orders.map(o => [
      escapeCsv(o.referenceId),
      escapeCsv(o.requestType),
      escapeCsv(new Date(o.createdAt).toISOString().split('T')[0]),
      escapeCsv(o.name),
      escapeCsv(o.email),
      escapeCsv(o.phone),
      escapeCsv(o.companyName),
      escapeCsv(o.selectedService),
      escapeCsv(o.packageName),
      escapeCsv(o.budget),
      escapeCsv(o.deadline ? new Date(o.deadline).toISOString().split('T')[0] : 'N/A'),
      escapeCsv(o.status),
      escapeCsv(o.description)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`tauhid-orders-${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  addOrderNote,
  deleteOrder,
  exportOrdersCsv
};
