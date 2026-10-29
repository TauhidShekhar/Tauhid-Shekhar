const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const Form = require('../models/Form');
const FormSubmission = require('../models/FormSubmission');
const { sendEmail } = require('../config/email');
const { UPLOAD_DIR } = require('../middleware/formUpload');

// HTML entity escaping helper to prevent XSS in email notifications
const escapeHtml = (str) => {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Safe CSV sanitizer to prevent formula injection
const sanitizeForCsv = (value) => {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  str = str.replace(/"/g, '""');
  // If starts with =, +, -, @, \t, \r, prepend single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
};

// Generate base application URL
const getBaseUrl = () => {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/$/, '');
  return 'https://tauhidshekhar.com';
};

const getAdminBaseUrl = () => {
  if (process.env.ADMIN_URL) return process.env.ADMIN_URL.replace(/\/$/, '');
  return 'https://tauhidshekhar.com/admin';
};

// ---------------------------------------------------------------------------
// ADMIN: Form Management CRUD
// ---------------------------------------------------------------------------

// Create new form
exports.createForm = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      status,
      isSubmissionsEnabled,
      closingDate,
      fields,
      confirmationMessage,
      redirectUrl,
      emailNotifications,
      appearance,
      placements,
      isTemplate,
      templateCategory,
      category,
      categoryId
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Form title is required.' });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return res.status(400).json({ success: false, message: 'A valid URL slug is required.' });
    }

    const slugExists = await Form.findOne({ slug: cleanSlug });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: `The slug "${cleanSlug}" is already in use. Please choose a different title or slug.`
      });
    }

    const formId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newForm = await Form.create({
      formId,
      title: title.trim(),
      slug: cleanSlug,
      description: description || '',
      status: status || 'Draft',
      isSubmissionsEnabled: isSubmissionsEnabled !== false,
      closingDate: closingDate || null,
      fields: Array.isArray(fields) ? fields : [],
      confirmationMessage: confirmationMessage || 'Thank you! Your submission has been received successfully.',
      redirectUrl: redirectUrl || '',
      emailNotifications: emailNotifications || {
        notifyAdmin: true,
        adminEmails: ['shekhartauhid@gmail.com'],
        notifyUser: false,
        userEmailFieldKey: 'email',
        customSubject: '',
        customMessage: ''
      },
      appearance: appearance || {
        theme: 'brand',
        submitButtonText: 'Submit',
        accentColor: '#C2272D'
      },
      placements: Array.isArray(placements) ? placements : ['directory', 'standalone'],
      category: category || 'General',
      categoryId: categoryId || null,
      isTemplate: Boolean(isTemplate),
      templateCategory: templateCategory || 'Custom',
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Form created successfully.',
      data: newForm
    });
  } catch (error) {
    next(error);
  }
};

// Get all forms for admin
exports.getAdminForms = async (req, res, next) => {
  try {
    const { status, search, category } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category) {
      filter.templateCategory = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const forms = await Form.find(filter).sort({ createdAt: -1 });

    // Enhance forms with live submission counts and unread count
    const formSummaries = await Promise.all(
      forms.map(async (f) => {
        const totalSubmissions = await FormSubmission.countDocuments({ formRef: f._id });
        const newSubmissions = await FormSubmission.countDocuments({ formRef: f._id, status: 'New' });
        const obj = f.toObject();
        obj.submissionCount = totalSubmissions;
        obj.newSubmissionsCount = newSubmissions;
        return obj;
      })
    );

    res.json({
      success: true,
      count: formSummaries.length,
      data: formSummaries
    });
  } catch (error) {
    next(error);
  }
};

// Get single form by ID for admin
exports.getFormById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const form = await Form.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { formId: id }, { slug: id }]
    });

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    const submissionCount = await FormSubmission.countDocuments({ formRef: form._id });
    const newSubmissions = await FormSubmission.countDocuments({ formRef: form._id, status: 'New' });

    const result = form.toObject();
    result.submissionCount = submissionCount;
    result.newSubmissionsCount = newSubmissions;

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// Update form
exports.updateForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const form = await Form.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { formId: id }]
    });

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    // Slug check if slug is modified
    if (updateData.slug && updateData.slug !== form.slug) {
      const cleanSlug = updateData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existingSlug = await Form.findOne({ slug: cleanSlug, _id: { $ne: form._id } });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: `The slug "${cleanSlug}" is already taken by another form.`
        });
      }
      updateData.slug = cleanSlug;
    }

    // Fields formatting
    if (updateData.fields && Array.isArray(updateData.fields)) {
      updateData.fields = updateData.fields.map((f, idx) => ({
        ...f,
        order: f.order !== undefined ? f.order : idx + 1
      }));
    }

    const updatedForm = await Form.findByIdAndUpdate(form._id, { $set: updateData }, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Form updated successfully.',
      data: updatedForm
    });
  } catch (error) {
    next(error);
  }
};

// Duplicate form
exports.duplicateForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const original = await Form.findById(id);

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original form not found.' });
    }

    const uniqueTag = Math.random().toString(36).substring(2, 6);
    const newTitle = `${original.title} (Copy)`;
    const newSlug = `${original.slug}-copy-${uniqueTag}`;
    const newFormId = `form_${Date.now()}_${uniqueTag}`;

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.__v;

    duplicateData.formId = newFormId;
    duplicateData.title = newTitle;
    duplicateData.slug = newSlug;
    duplicateData.status = 'Draft';
    duplicateData.submissionCount = 0;
    duplicateData.viewCount = 0;
    duplicateData.createdBy = req.user ? req.user._id : null;

    const newForm = await Form.create(duplicateData);

    res.status(201).json({
      success: true,
      message: 'Form duplicated successfully as a new draft.',
      data: newForm
    });
  } catch (error) {
    next(error);
  }
};

// Archive form
exports.archiveForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const form = await Form.findByIdAndUpdate(
      id,
      { $set: { status: 'Archived', isSubmissionsEnabled: false } },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    res.json({
      success: true,
      message: 'Form has been archived. Existing submissions are safely preserved.',
      data: form
    });
  } catch (error) {
    next(error);
  }
};

// Delete form (Requires confirmation; deletes submissions or warns)
exports.deleteForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmDelete } = req.body;

    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    const submissionCount = await FormSubmission.countDocuments({ formRef: form._id });

    if (submissionCount > 0 && !confirmDelete) {
      return res.status(400).json({
        success: false,
        requiresConfirmation: true,
        submissionCount,
        message: `This form has ${submissionCount} submission(s). To delete it and all its submissions permanently, please confirm deletion or consider archiving instead.`
      });
    }

    // Clean up local files from submissions
    const submissions = await FormSubmission.find({ formRef: form._id });
    for (const sub of submissions) {
      if (Array.isArray(sub.files)) {
        for (const file of sub.files) {
          if (file.storedName) {
            const filePath = path.join(UPLOAD_DIR, file.storedName);
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (_) {}
            }
          }
        }
      }
    }

    await FormSubmission.deleteMany({ formRef: form._id });
    await Form.findByIdAndDelete(form._id);

    res.json({
      success: true,
      message: 'Form and all associated data have been deleted permanently.'
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUBLIC: Form Discovery & Rendering
// ---------------------------------------------------------------------------

// Get list of publicly visible forms (for /forms directory or page placements)
exports.getPublicForms = async (req, res, next) => {
  try {
    const { placement } = req.query;
    const filter = {
      status: 'Published',
      isSubmissionsEnabled: true
    };

    if (placement && placement !== 'all') {
      filter.placements = placement;
    }

    const forms = await Form.find(filter)
      .select('title slug description status appearance closingDate isSubmissionsEnabled templateCategory category categoryId submissionCount fields')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: forms.length,
      data: forms
    });
  } catch (error) {
    next(error);
  }
};

// Get single public form by slug
exports.getPublicFormBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const form = await Form.findOne({ slug: slug.toLowerCase() });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'The requested form could not be found or may have been removed.'
      });
    }

    // Non-admins can only see Published forms
    const isAdmin = req.user && req.user.role === 'Admin';
    if (!isAdmin && form.status !== 'Published') {
      return res.status(403).json({
        success: false,
        message: 'This form is currently not published or accessible to the public.'
      });
    }

    // Check if form is closed
    let isClosed = !form.isSubmissionsEnabled || form.status === 'Closed' || form.status === 'Archived';
    if (form.closingDate && new Date(form.closingDate) < new Date()) {
      isClosed = true;
    }

    // Increment view count atomically
    Form.findByIdAndUpdate(form._id, { $inc: { viewCount: 1 } }).exec();

    // Sanitize email notification settings for public consumption
    const safeForm = form.toObject();
    delete safeForm.emailNotifications?.adminEmails;

    res.json({
      success: true,
      isClosed,
      data: safeForm
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUBLIC: Form Submission
// ---------------------------------------------------------------------------

exports.submitForm = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Honeypot check for spam bots
    if (req.body._ts_hp) {
      return res.json({
        success: true,
        message: 'Thank you for your submission!'
      });
    }

    const form = await Form.findOne({ slug: slug.toLowerCase() });

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    if (form.status !== 'Published' || !form.isSubmissionsEnabled) {
      return res.status(403).json({
        success: false,
        message: 'This form is currently closed and cannot accept new submissions.'
      });
    }

    if (form.closingDate && new Date(form.closingDate) < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'The submission deadline for this form has expired.'
      });
    }

    // Parse submitted form data
    let submittedData = {};
    if (req.body.data) {
      try {
        submittedData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      } catch (_) {
        submittedData = req.body;
      }
    } else {
      submittedData = { ...req.body };
      delete submittedData._ts_hp;
    }

    // Process attached files
    const attachedFiles = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        attachedFiles.push({
          fieldKey: file.fieldname,
          fileId,
          originalName: file.originalname,
          storedName: file.filename,
          path: `/uploads/form_submissions/${file.filename}`,
          size: file.size,
          mimeType: file.mimetype,
          isSecure: true
        });
      }
    }

    // Validate fields against Form schema
    const validationErrors = {};
    const fieldSnapshots = [];

    for (const field of form.fields) {
      if (field.hidden || field.type === 'heading') {
        continue;
      }

      fieldSnapshots.push({
        id: field.id,
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options
      });

      const val = submittedData[field.key];
      const hasFile = attachedFiles.some((f) => f.fieldKey === field.key);

      // Check required
      if (field.required) {
        if (field.type === 'file' || field.type === 'resume' || field.type === 'multipleFile') {
          if (!hasFile) {
            validationErrors[field.key] = `${field.label} is required. Please upload a file.`;
          }
        } else if (field.type === 'consent' || field.type === 'checkbox') {
          if (!val || val === 'false' || val === false) {
            validationErrors[field.key] = `Please accept ${field.label} to proceed.`;
          }
        } else if (val === undefined || val === null || String(val).trim() === '') {
          validationErrors[field.key] = `${field.label} is required.`;
        }
      }

      // Check email format
      if (field.type === 'email' && val && String(val).trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val).trim())) {
          validationErrors[field.key] = 'Please provide a valid email address.';
        }
      }

      // Check phone format
      if (field.type === 'phone' && val && String(val).trim()) {
        const phoneRegex = /^[\d\s+\-().]{6,25}$/;
        if (!phoneRegex.test(String(val).trim())) {
          validationErrors[field.key] = 'Please provide a valid phone number.';
        }
      }

      // Check string min/max length
      if (val && typeof val === 'string') {
        if (field.validation?.minLength && val.length < field.validation.minLength) {
          validationErrors[field.key] = `${field.label} must be at least ${field.validation.minLength} characters.`;
        }
        if (field.validation?.maxLength && val.length > field.validation.maxLength) {
          validationErrors[field.key] = `${field.label} cannot exceed ${field.validation.maxLength} characters.`;
        }
      }

      // Check numeric min/max
      if (field.type === 'number' && val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (isNaN(num)) {
          validationErrors[field.key] = `${field.label} must be a number.`;
        } else {
          if (field.validation?.min !== null && field.validation?.min !== undefined && num < field.validation.min) {
            validationErrors[field.key] = `${field.label} must be at least ${field.validation.min}.`;
          }
          if (field.validation?.max !== null && field.validation?.max !== undefined && num > field.validation.max) {
            validationErrors[field.key] = `${field.label} cannot exceed ${field.validation.max}.`;
          }
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted fields.',
        errors: validationErrors
      });
    }

    // Save submission to database FIRST
    const submission = await FormSubmission.create({
      formRef: form._id,
      formId: form.formId,
      formTitleSnapshot: form.title,
      category: form.category || 'General',
      formVersion: 1,
      fieldSnapshots,
      data: submittedData,
      files: attachedFiles,
      status: 'New',
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.get('user-agent') || ''
    });

    // Increment form submission count
    await Form.findByIdAndUpdate(form._id, { $inc: { submissionCount: 1 } });

    // Notify connected socket clients in real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('form_new_submission', {
        formId: form.formId,
        formSlug: form.slug,
        formTitle: form.title,
        submissionId: submission._id,
        createdAt: submission.createdAt
      });
    }

    // Trigger Email Notifications (bounded, never crashing submission)
    const emailDelivery = {
      adminEmailSent: false,
      adminEmailError: '',
      userEmailSent: false,
      userEmailError: '',
      sentAt: null
    };

    const adminViewUrl = `${getAdminBaseUrl()}/forms?tab=submissions&formId=${form._id}&submissionId=${submission._id}`;

    // Format submitted fields for HTML email table
    let submittedFieldsHtml = '';
    for (const [k, v] of Object.entries(submittedData)) {
      if (k === '_ts_hp') continue;
      const matchingField = form.fields.find((f) => f.key === k);
      const label = matchingField ? matchingField.label : k;
      const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v || '-');
      submittedFieldsHtml += `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;width:35%;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#334155;">${escapeHtml(valStr)}</td>
        </tr>
      `;
    }

    // Format file attachments links for email
    let filesHtml = '';
    if (attachedFiles.length > 0) {
      filesHtml = `
        <div style="margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          <h4 style="margin:0 0 10px 0;font-size:13px;text-transform:uppercase;color:#475569;">Uploaded Attachments (${attachedFiles.length}):</h4>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#0284c7;">
            ${attachedFiles
              .map(
                (f) =>
                  `<li><strong>${escapeHtml(f.originalName)}</strong> (${Math.round(f.size / 1024)} KB) - <a href="${adminViewUrl}" style="color:#C2272D;text-decoration:underline;">View in Admin Panel</a></li>`
              )
              .join('')}
          </ul>
        </div>
      `;
    }

    // 1. Send Admin Email Notification
    if (form.emailNotifications?.notifyAdmin) {
      const adminRecipients =
        form.emailNotifications.adminEmails && form.emailNotifications.adminEmails.length > 0
          ? form.emailNotifications.adminEmails
          : ['shekhartauhid@gmail.com'];

      const adminSubject = `[New Submission] ${form.title} (#${submission._id.toString().slice(-6)})`;

      const adminEmailBody = `
        <div style="font-family:'Inter',Segoe UI,Arial,sans-serif;max-width:650px;margin:0 auto;color:#1e293b;">
          <div style="background:#000000;padding:24px 30px;border-top:4px solid #C2272D;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;color:#ffffff;font-size:20px;font-family:'Manrope',sans-serif;">Tauhid Shekhar Website</h2>
            <p style="margin:4px 0 0;color:#00FFFF;font-size:13px;font-weight:600;">Dynamic Form Submission Notification</p>
          </div>
          <div style="background:#ffffff;padding:28px 30px;border:1px solid #e2e8f0;border-top:none;">
            <p style="font-size:15px;margin-top:0;">You have received a new submission for <strong>${escapeHtml(form.title)}</strong>.</p>
            <div style="background:#f1f5f9;padding:12px 16px;border-radius:6px;font-size:13px;margin-bottom:20px;">
              <strong>Submission ID:</strong> ${submission._id}<br/>
              <strong>Received At:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST<br/>
              <strong>Status:</strong> <span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:4px;font-weight:bold;">New</span>
            </div>
            
            <h3 style="margin:20px 0 10px;font-size:15px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:6px;">Submitted Details:</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;background:#ffffff;">
              <tbody>
                ${submittedFieldsHtml}
              </tbody>
            </table>

            ${filesHtml}

            <div style="margin-top:30px;text-align:center;">
              <a href="${adminViewUrl}" style="display:inline-block;padding:12px 28px;background:#C2272D;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:6px;font-size:14px;">Open in Admin Dashboard</a>
            </div>
          </div>
          <div style="padding:16px 30px;text-align:center;font-size:12px;color:#94a3b8;background:#f8fafc;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
            This is an automated notification from Tauhid Shekhar Dynamic Form Builder.
          </div>
        </div>
      `;

      try {
        for (const recipient of adminRecipients) {
          if (recipient && recipient.includes('@')) {
            await sendEmail(recipient.trim(), adminSubject, adminEmailBody);
          }
        }
        emailDelivery.adminEmailSent = true;
        emailDelivery.sentAt = new Date();
      } catch (err) {
        console.error('[Form Builder] Admin notification email error:', err.message);
        emailDelivery.adminEmailError = err.message;
      }
    }

    // 2. Send User Confirmation Email if enabled
    const userEmailKey = form.emailNotifications?.userEmailFieldKey || 'email';
    const userEmailVal = submittedData[userEmailKey];

    if (form.emailNotifications?.notifyUser && userEmailVal && String(userEmailVal).includes('@')) {
      const userSubject = form.emailNotifications.customSubject || `We received your submission - ${form.title}`;
      const userCustomMsg =
        form.emailNotifications.customMessage ||
        'Thank you for getting in touch. We have received your submission and will get back to you shortly.';

      const userEmailBody = `
        <div style="font-family:'Inter',Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <div style="background:#000000;padding:24px 30px;border-top:4px solid #C2272D;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;color:#ffffff;font-size:20px;font-family:'Manrope',sans-serif;">Tauhid Shekhar</h2>
            <p style="margin:4px 0 0;color:#00FFFF;font-size:13px;font-weight:600;">Confirmation of Submission</p>
          </div>
          <div style="background:#ffffff;padding:28px 30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
            <p style="font-size:15px;margin-top:0;">Hello,</p>
            <p style="font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(userCustomMsg)}</p>

            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin:24px 0;font-size:13px;">
              <strong>Form:</strong> ${escapeHtml(form.title)}<br/>
              <strong>Reference ID:</strong> #${submission._id.toString().slice(-8)}<br/>
              <strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>

            <p style="font-size:13px;color:#64748b;">If you need to make changes or have any questions, you can contact us at <a href="mailto:shekhartauhid@gmail.com" style="color:#C2272D;">shekhartauhid@gmail.com</a>.</p>
          </div>
        </div>
      `;

      try {
        await sendEmail(userEmailVal.trim(), userSubject, userEmailBody);
        emailDelivery.userEmailSent = true;
      } catch (err) {
        console.error('[Form Builder] User confirmation email error:', err.message);
        emailDelivery.userEmailError = err.message;
      }
    }

    // Save final email delivery status to submission
    await FormSubmission.findByIdAndUpdate(submission._id, {
      $set: { emailDeliveryStatus: emailDelivery }
    });

    res.status(201).json({
      success: true,
      message: form.confirmationMessage || 'Thank you! Your submission has been received successfully.',
      submissionId: submission._id,
      redirectUrl: form.redirectUrl || null
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// ADMIN: Submissions Management
// ---------------------------------------------------------------------------

// Get submissions list for admin (filtered by formId, status, date, search)
exports.getSubmissions = async (req, res, next) => {
  try {
    const { formId, status, category, search, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (formId && formId !== 'all') {
      const formDoc = await Form.findOne({
        $or: [{ _id: formId.match(/^[0-9a-fA-F]{24}$/) ? formId : null }, { formId }]
      });
      if (formDoc) {
        filter.formRef = formDoc._id;
      } else {
        filter.formId = formId;
      }
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { 'data.fullName': { $regex: q, $options: 'i' } },
        { 'data.email': { $regex: q, $options: 'i' } },
        { 'data.phone': { $regex: q, $options: 'i' } },
        { formTitleSnapshot: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { _id: q.match(/^[0-9a-fA-F]{24}$/) ? q : null }
      ].filter((condition) => Object.values(condition)[0] !== null);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      FormSubmission.find(filter)
        .populate('formRef', 'title slug fields appearance')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      FormSubmission.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single submission details
exports.getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await FormSubmission.findById(id).populate('formRef');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

// Update submission status
exports.updateSubmissionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['New', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected', 'Archived'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid submission status.' });
    }

    const submission = await FormSubmission.findByIdAndUpdate(id, { $set: { status } }, { new: true });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({
      success: true,
      message: `Submission status updated to "${status}".`,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// Add private admin note
exports.addSubmissionNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty.' });
    }

    const authorName = req.user?.fullName || req.user?.username || 'Admin';

    const submission = await FormSubmission.findByIdAndUpdate(
      id,
      {
        $push: {
          adminNotes: {
            note: note.trim(),
            author: authorName,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({
      success: true,
      message: 'Admin note added.',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// Delete single submission
exports.deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await FormSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    // Delete local files
    if (Array.isArray(submission.files)) {
      for (const file of submission.files) {
        if (file.storedName) {
          const filePath = path.join(UPLOAD_DIR, file.storedName);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
            } catch (_) {}
          }
        }
      }
    }

    await FormSubmission.findByIdAndDelete(id);

    // Decrement form count
    await Form.findByIdAndUpdate(submission.formRef, { $inc: { submissionCount: -1 } });

    res.json({
      success: true,
      message: 'Submission deleted permanently.'
    });
  } catch (error) {
    next(error);
  }
};

// Export submissions to CSV
exports.exportSubmissionsCSV = async (req, res, next) => {
  try {
    const { formId, startDate, endDate, status } = req.query;

    if (!formId || formId === 'all') {
      return res.status(400).json({
        success: false,
        message: 'Please select a specific form to export submissions.'
      });
    }

    const form = await Form.findOne({
      $or: [{ _id: formId.match(/^[0-9a-fA-F]{24}$/) ? formId : null }, { formId }]
    });

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    const filter = { formRef: form._id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const submissions = await FormSubmission.find(filter).sort({ createdAt: -1 });

    // Derive CSV columns dynamically from form fields
    const formFields = form.fields.filter((f) => f.type !== 'heading');
    const headerCols = ['Submission ID', 'Submitted Date', 'Status', ...formFields.map((f) => f.label), 'Files', 'IP Address'];

    let csvContent = headerCols.map(sanitizeForCsv).join(',') + '\r\n';

    for (const sub of submissions) {
      const row = [
        sub._id.toString(),
        new Date(sub.createdAt).toISOString(),
        sub.status
      ];

      for (const field of formFields) {
        const val = sub.data ? sub.data[field.key] : '';
        row.push(val);
      }

      // Files list
      const fileNames = (sub.files || []).map((f) => f.originalName).join('; ');
      row.push(fileNames);
      row.push(sub.ipAddress || '');

      csvContent += row.map(sanitizeForCsv).join(',') + '\r\n';
    }

    const safeFilename = `${form.slug}_submissions_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// ADMIN & SECURE: File Access
// ---------------------------------------------------------------------------

exports.secureFileDownload = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    // Look up file in FormSubmission
    const submission = await FormSubmission.findOne({ 'files.fileId': fileId });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    const fileMeta = submission.files.find((f) => f.fileId === fileId);
    if (!fileMeta) {
      return res.status(404).json({ success: false, message: 'File metadata not found.' });
    }

    // Path traversal safety
    const safeFilename = path.basename(fileMeta.storedName);
    const resolvedPath = path.resolve(UPLOAD_DIR, safeFilename);

    if (!resolvedPath.startsWith(path.resolve(UPLOAD_DIR))) {
      return res.status(403).json({ success: false, message: 'Unauthorized path traversal access.' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, message: 'The physical file was not found on the server.' });
    }

    // Send file with proper headers
    res.setHeader('Content-Type', fileMeta.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileMeta.originalName)}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// QR Code Generation
// ---------------------------------------------------------------------------

exports.getFormQrCode = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { format = 'png', download } = req.query;

    const form = await Form.findOne({ slug: slug.toLowerCase() });
    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    const formPublicUrl = `${getBaseUrl()}/forms/${form.slug}`;

    if (format === 'svg') {
      const svgString = await QRCode.toString(formPublicUrl, {
        type: 'svg',
        color: {
          dark: '#C2272D',
          light: '#FFFFFF'
        },
        margin: 2
      });

      res.setHeader('Content-Type', 'image/svg+xml');
      if (download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-qr.svg"`);
      }
      return res.send(svgString);
    }

    if (format === 'dataUrl') {
      const dataUrl = await QRCode.toDataURL(formPublicUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return res.json({ success: true, dataUrl, formUrl: formPublicUrl });
    }

    // Default to PNG buffer
    const pngBuffer = await QRCode.toBuffer(formPublicUrl, {
      type: 'png',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.setHeader('Content-Type', 'image/png');
    if (download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-qr.png"`);
    }
    res.send(pngBuffer);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// Form Analytics
// ---------------------------------------------------------------------------

exports.getFormAnalytics = async (req, res, next) => {
  try {
    const { formId } = req.params;

    const form = await Form.findOne({
      $or: [{ _id: formId.match(/^[0-9a-fA-F]{24}$/) ? formId : null }, { formId }]
    });

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    const totalSubmissions = await FormSubmission.countDocuments({ formRef: form._id });

    // Today start in midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const submissionsToday = await FormSubmission.countDocuments({
      formRef: form._id,
      createdAt: { $gte: today }
    });

    // Breakdown by status
    const statusCounts = await FormSubmission.aggregate([
      { $match: { formRef: form._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusMap = {
      New: 0,
      Reviewed: 0,
      Shortlisted: 0,
      Accepted: 0,
      Rejected: 0,
      Archived: 0
    };
    statusCounts.forEach((s) => {
      if (s._id) statusMap[s._id] = s.count;
    });

    // Submissions in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await FormSubmission.find({
      formRef: form._id,
      createdAt: { $gte: sevenDaysAgo }
    })
      .select('status createdAt data.fullName data.email files')
      .sort({ createdAt: -1 })
      .limit(10);

    // Email delivery failures count
    const emailFailures = await FormSubmission.countDocuments({
      formRef: form._id,
      $or: [{ 'emailDeliveryStatus.adminEmailError': { $ne: '' } }, { 'emailDeliveryStatus.userEmailError': { $ne: '' } }]
    });

    res.json({
      success: true,
      data: {
        formId: form.formId,
        title: form.title,
        slug: form.slug,
        status: form.status,
        viewCount: form.viewCount || 0,
        totalSubmissions,
        submissionsToday,
        statusBreakdown: statusMap,
        emailFailures,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
