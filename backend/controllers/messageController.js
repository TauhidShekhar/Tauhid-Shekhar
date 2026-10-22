const Message = require('../models/Message');
const { sendContactAdminNotification, sendContactUserConfirmation } = require('../utils/emailService');

// @desc    Get all messages
// @route   GET /api/contact
// @access  Private (Admin only)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const createMessage = async (req, res) => {
  try {
    // 0. Anti-Spam Honeypot check
    if (req.body._ts_hp && String(req.body._ts_hp).trim()) {
      return res.json({
        success: true,
        message: 'Thank you! Your message has been received.'
      });
    }

    const Setting = require('../models/Setting');
    const settings = await Setting.findOne();

    let name = req.body.name || '';
    let email = req.body.email || '';
    let phone = req.body.phone || req.body.phone_number || req.body.mobile || '';
    let subject = req.body.subject || 'Direct Website Contact Inquiry';
    let message = req.body.message || '';
    const dynamicFields = {};

    // Standard Simple Contact Form Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanEmail && !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // 1. Duplicate submission protection (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await Message.findOne({
      email: cleanEmail,
      message: cleanMessage,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this message. Please wait a few minutes before trying again.'
      });
    }

    // 2. Create message in MongoDB
    const newMessage = await Message.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      subject: subject ? subject.trim() : 'No Subject',
      message: cleanMessage,
      dynamicFields
    });

    // 3. Send email notifications in the background (no await)
    const adminEmail = settings?.email || 'shekhartauhid@gmail.com';
    sendContactAdminNotification(adminEmail, newMessage, req.ip || req.connection?.remoteAddress || '127.0.0.1')
      .catch((err) => console.error('Admin Email failed:', err.message));
    sendContactUserConfirmation(cleanEmail, newMessage)
      .catch((err) => console.error('User Email failed:', err.message));

    // 4. Broadcast live update to socket clients
    const io = req.app.get('io');
    if (io) {
      io.emit('new_contact_message', newMessage);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Mark message as read
// @route   PATCH /api/contact/:id/read
// @access  Private (Admin only)
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private (Admin only)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle archive status of message
// @route   PATCH /api/contact/:id/archive
// @access  Private (Admin only)
const toggleArchive = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    message.isArchived = !message.isArchived;
    await message.save();
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reply to a contact message
// @route   POST /api/contact/:id/reply
// @access  Private (Admin only)
const replyMessage = async (req, res) => {
  try {
    const { replyText } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message text is required.' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    message.reply = replyText.trim();
    message.repliedAt = new Date();
    message.isRead = true;
    await message.save();

    // Send the email reply
    const { sendContactAdminReply } = require('../utils/emailService');
    await sendContactAdminReply(message.email, message.name, message.message, replyText.trim());

    res.json({ success: true, message: 'Reply sent successfully!', data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, createMessage, markAsRead, deleteMessage, toggleArchive, replyMessage };
