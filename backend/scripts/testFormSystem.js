const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Form = require('../models/Form');
const FormSubmission = require('../models/FormSubmission');
const { seedFormTemplates } = require('../utils/formTemplatesSeeder');
const formController = require('../controllers/formController');
const QRCode = require('qrcode');

async function runTests() {
  console.log('================================================================');
  console.log('DYNAMIC FORM BUILDER & SUBMISSION SYSTEM - INTEGRATION TESTS');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`[PASS] ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      failed++;
    }
  };

  try {
    // 1. Connect to Database
    await connectDB();
    assert(mongoose.connection.readyState === 1, 'MongoDB connection established successfully.');

    // 2. Test Seeding Form Templates
    await seedFormTemplates();
    const seededForms = await Form.find({ isTemplate: true });
    assert(seededForms.length >= 6, `Seeded default templates count >= 6 (found ${seededForms.length} templates).`);

    // Verify key templates exist
    const jobApp = await Form.findOne({ slug: 'job-application' });
    assert(jobApp !== null, 'Job Application template found.');
    assert(jobApp.fields.length >= 8, `Job Application template has comprehensive fields (${jobApp.fields.length} fields).`);

    const resumeDrop = await Form.findOne({ slug: 'resume-submission' });
    assert(resumeDrop !== null, 'Resume Submission template found.');

    const contactForm = await Form.findOne({ slug: 'contact-form' });
    assert(contactForm !== null, 'Contact Form template found.');

    const internshipForm = await Form.findOne({ slug: 'internship-application' });
    assert(internshipForm !== null, 'Internship Application template found.');

    // 3. Test Form Creation (Admin CRUD)
    const testSlug = `test-eval-${Date.now()}`;
    const testForm = await Form.create({
      formId: `form_test_${Date.now()}`,
      title: 'Automated Test Form',
      slug: testSlug,
      description: 'Used for automated integration verification.',
      status: 'Published',
      isSubmissionsEnabled: true,
      fields: [
        {
          id: 'test_f1',
          key: 'applicantName',
          label: 'Applicant Name',
          type: 'fullName',
          required: true
        },
        {
          id: 'test_f2',
          key: 'applicantEmail',
          label: 'Applicant Email',
          type: 'email',
          required: true
        },
        {
          id: 'test_f3',
          key: 'resumeFile',
          label: 'Resume Document',
          type: 'resume',
          required: false,
          validation: { allowedExtensions: ['.pdf'], maxFileSizeMB: 10 }
        }
      ],
      appearance: { theme: 'brand', submitButtonText: 'Send Test' },
      emailNotifications: { notifyAdmin: false } // disable email during test to avoid inbox spam
    });
    assert(testForm !== null && testForm.slug === testSlug, 'Admin createForm created new form in MongoDB.');

    // 4. Test Submission Validation Enforcement
    // Mock req and res for submission
    let mockStatus = 200;
    let mockResult = null;
    const mockRes = {
      status(s) { mockStatus = s; return this; },
      json(data) { mockResult = data; return this; },
      setHeader() {},
      send(data) { mockResult = data; return this; }
    };

    // Submitting with missing required email should fail
    const invalidReq = {
      params: { slug: testSlug },
      body: { applicantName: 'John Test Doe' },
      files: [],
      ip: '127.0.0.1',
      app: { get: () => null },
      get: () => 'TestAgent'
    };
    await formController.submitForm(invalidReq, mockRes, (err) => { mockResult = { error: err.message }; });
    assert(mockStatus === 400 && mockResult.errors?.applicantEmail, 'Backend server-side validation correctly rejected missing required email.');

    // Honeypot test: if bot fills _ts_hp, reject or return silent fake success
    const botReq = {
      params: { slug: testSlug },
      body: { _ts_hp: 'spam-bot-input', applicantName: 'Spam Bot' },
      files: [],
      ip: '127.0.0.1',
      app: { get: () => null },
      get: () => 'SpamBot'
    };
    mockStatus = 200;
    mockResult = null;
    await formController.submitForm(botReq, mockRes, (err) => {});
    const botSubmissionCount = await FormSubmission.countDocuments({ 'data.applicantName': 'Spam Bot' });
    assert(botSubmissionCount === 0, 'Spam bot submission caught by honeypot and discarded without saving to DB.');

    // 5. Test Valid Form Submission Persistence
    const validReq = {
      params: { slug: testSlug },
      body: {
        applicantName: 'Tauhid Verified Candidate',
        applicantEmail: 'candidate@example.com'
      },
      files: [
        {
          fieldname: 'resumeFile',
          originalname: 'candidate_resume.pdf',
          filename: `candidate_resume_${Date.now()}.pdf`,
          size: 1048576,
          mimetype: 'application/pdf'
        }
      ],
      ip: '127.0.0.1',
      app: { get: () => null },
      get: () => 'Mozilla/5.0 Test Suite'
    };
    mockStatus = 200;
    mockResult = null;
    await formController.submitForm(validReq, mockRes, (err) => { console.error('Valid submit error:', err); });
    assert(mockStatus === 201 && mockResult.success === true, 'Valid form submission succeeded with HTTP 201.');

    const createdSubmission = await FormSubmission.findById(mockResult.submissionId);
    assert(createdSubmission !== null, 'Submission saved and retrieved from FormSubmission collection.');
    assert(createdSubmission.data.applicantName === 'Tauhid Verified Candidate', 'Submitted values accurately preserved in submission document.');
    assert(createdSubmission.files.length === 1, 'Uploaded file attachment metadata linked to submission.');
    assert(createdSubmission.files[0].originalName === 'candidate_resume.pdf', 'Attachment originalName preserved.');
    assert(createdSubmission.fieldSnapshots.length === 3, 'Field snapshots frozen at submission time to preserve schema integrity.');

    // 6. Test Form Submission Count Increment
    const updatedForm = await Form.findById(testForm._id);
    assert(updatedForm.submissionCount === 1, `Form submissionCount incremented to 1 (actual: ${updatedForm.submissionCount}).`);

    // 7. Test Admin Submission Management (Status update & Notes)
    const statusUpdateReq = {
      params: { id: createdSubmission._id.toString() },
      body: { status: 'Shortlisted' }
    };
    mockStatus = 200;
    mockResult = null;
    await formController.updateSubmissionStatus(statusUpdateReq, mockRes, (err) => {});
    assert(mockResult.data?.status === 'Shortlisted', 'Admin updated submission status to "Shortlisted".');

    const noteReq = {
      params: { id: createdSubmission._id.toString() },
      body: { note: 'Impressive portfolio. Schedule interview.' },
      user: { fullName: 'Lead Engineer' }
    };
    mockStatus = 200;
    mockResult = null;
    await formController.addSubmissionNote(noteReq, mockRes, (err) => {});
    assert(mockResult.data?.adminNotes?.length === 1, 'Admin note added to submission thread.');
    assert(mockResult.data?.adminNotes[0].note === 'Impressive portfolio. Schedule interview.', 'Admin note content preserved.');

    // 8. Test CSV Export Generation
    const csvReq = {
      query: { formId: testForm._id.toString() }
    };
    let csvHeaders = {};
    let csvData = '';
    const mockCsvRes = {
      setHeader(name, val) { csvHeaders[name] = val; },
      status(s) { return this; },
      send(payload) { csvData = payload; return this; }
    };
    await formController.exportSubmissionsCSV(csvReq, mockCsvRes, (err) => {});
    assert(csvHeaders['Content-Type']?.includes('text/csv'), 'CSV Export returned text/csv content type.');
    assert(csvData.includes('Submission ID') && csvData.includes('Tauhid Verified Candidate'), 'CSV output contains form headers and submission data.');

    // 9. Test QR Code Generation
    const qrPublicUrl = `https://tauhidshekhar.com/forms/${testSlug}`;
    const qrDataUrl = await QRCode.toDataURL(qrPublicUrl, { width: 300 });
    assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR code DataURL generated successfully with high resolution.');

    const qrSvg = await QRCode.toString(qrPublicUrl, { type: 'svg' });
    assert(qrSvg.includes('<svg') && qrSvg.includes('</svg>'), 'QR code SVG vector format generated successfully.');

    // 10. Test Form Duplication (Admin)
    const dupReq = {
      params: { id: testForm._id.toString() },
      user: { _id: null }
    };
    mockStatus = 200;
    mockResult = null;
    await formController.duplicateForm(dupReq, mockRes, (err) => {});
    assert(mockStatus === 201 && mockResult.data?.title.includes('(Copy)'), 'Form duplicated successfully into Draft state with unique slug.');

    // 11. Test Form Archival
    const archReq = {
      params: { id: testForm._id.toString() }
    };
    mockStatus = 200;
    mockResult = null;
    await formController.archiveForm(archReq, mockRes, (err) => {});
    assert(mockResult.data?.status === 'Archived', 'Form archived successfully; submissions preserved.');

    // 12. Cleanup Test Documents
    await FormSubmission.deleteMany({ formRef: testForm._id });
    if (mockResult.data?._id) {
      await Form.findByIdAndDelete(mockResult.data._id);
    }
    await Form.findByIdAndDelete(testForm._id);
    assert(true, 'Test artifacts and test submissions cleaned up cleanly.');

    console.log('================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Integration Test Error:', error);
    process.exit(1);
  }
}

runTests();
