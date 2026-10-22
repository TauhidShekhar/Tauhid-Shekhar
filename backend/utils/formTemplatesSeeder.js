const Form = require('../models/Form');

const DEFAULT_TEMPLATES = [
  {
    formId: 'tpl_job_application',
    title: 'Job Application Form',
    slug: 'job-application',
    description: 'Apply for open developer, designer, and engineering roles at Tauhid Shekhar.',
    status: 'Published',
    isSubmissionsEnabled: true,
    isTemplate: true,
    templateCategory: 'Careers',
    confirmationMessage: 'Thank you for applying! Our team will review your application and resume and get back to you shortly.',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: true,
      userEmailFieldKey: 'email',
      customSubject: 'Application Received - Tauhid Shekhar',
      customMessage: 'We have received your job application. We appreciate your interest in working with us!'
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Submit Application',
      accentColor: '#C2272D'
    },
    placements: ['directory', 'careers', 'standalone'],
    fields: [
      {
        id: 'f_heading_1',
        key: 'section_personal',
        label: 'Personal & Contact Information',
        type: 'heading',
        helpText: 'Please provide your basic contact details.',
        order: 1
      },
      {
        id: 'f_full_name',
        key: 'fullName',
        label: 'Full Name',
        type: 'fullName',
        placeholder: 'e.g. Alex Johnson',
        required: true,
        order: 2
      },
      {
        id: 'f_email',
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
        order: 3
      },
      {
        id: 'f_phone',
        key: 'phone',
        label: 'Mobile / WhatsApp Number',
        type: 'phone',
        placeholder: '+91 98765 43210',
        required: true,
        order: 4
      },
      {
        id: 'f_heading_2',
        key: 'section_prof',
        label: 'Professional Experience & Background',
        type: 'heading',
        helpText: 'Tell us about your background and qualifications.',
        order: 5
      },
      {
        id: 'f_position',
        key: 'position',
        label: 'Position Applied For',
        type: 'select',
        required: true,
        options: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Mobile App Developer', 'DevOps / Cloud Engineer'],
        order: 6
      },
      {
        id: 'f_experience',
        key: 'experienceYears',
        label: 'Years of Professional Experience',
        type: 'select',
        required: true,
        options: ['Entry Level (0-1 yrs)', '1-3 years', '3-5 years', '5+ years'],
        order: 7
      },
      {
        id: 'f_skills',
        key: 'skills',
        label: 'Core Skills & Technologies',
        type: 'textarea',
        placeholder: 'e.g. React, Node.js, TypeScript, Next.js, MongoDB, Tailwind CSS...',
        required: true,
        order: 8
      },
      {
        id: 'f_portfolio',
        key: 'portfolioUrl',
        label: 'Portfolio / GitHub / LinkedIn URL',
        type: 'url',
        placeholder: 'https://github.com/yourhandle',
        required: false,
        order: 9
      },
      {
        id: 'f_resume',
        key: 'resume',
        label: 'Upload Resume / CV (PDF)',
        type: 'resume',
        helpText: 'Accepted format: PDF only. Max size: 10MB.',
        required: true,
        validation: {
          allowedExtensions: ['.pdf'],
          maxFileSizeMB: 10
        },
        order: 10
      },
      {
        id: 'f_cover',
        key: 'coverNote',
        label: 'Brief Introduction / Cover Note',
        type: 'textarea',
        placeholder: 'Share why you are excited to join our team...',
        required: false,
        order: 11
      },
      {
        id: 'f_consent',
        key: 'consent',
        label: 'I confirm that the information provided is accurate and true to the best of my knowledge.',
        type: 'consent',
        required: true,
        order: 12
      }
    ]
  },
  {
    formId: 'tpl_resume_drop',
    title: 'Resume Submission Form',
    slug: 'resume-submission',
    description: 'Send your resume directly for future engineering, development, and consulting opportunities.',
    status: 'Published',
    isSubmissionsEnabled: true,
    isTemplate: true,
    templateCategory: 'Careers',
    confirmationMessage: 'Your resume has been saved to our talent directory. We will reach out when a matching opportunity arises!',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: true,
      userEmailFieldKey: 'email',
      customSubject: 'Resume Received - Tauhid Shekhar Talent Network',
      customMessage: 'Thank you for submitting your resume. We have added it to our talent pool.'
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Submit Resume',
      accentColor: '#00FFFF'
    },
    placements: ['directory', 'careers', 'standalone'],
    fields: [
      {
        id: 'f_res_name',
        key: 'fullName',
        label: 'Full Name',
        type: 'fullName',
        placeholder: 'Your name',
        required: true,
        order: 1
      },
      {
        id: 'f_res_email',
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
        order: 2
      },
      {
        id: 'f_res_phone',
        key: 'phone',
        label: 'Phone Number',
        type: 'phone',
        placeholder: '+91 98765 43210',
        required: true,
        order: 3
      },
      {
        id: 'f_res_role',
        key: 'currentRole',
        label: 'Current Role / Specialization',
        type: 'text',
        placeholder: 'e.g. Senior Frontend Engineer',
        required: true,
        order: 4
      },
      {
        id: 'f_res_file',
        key: 'resumeFile',
        label: 'Resume Document',
        type: 'resume',
        helpText: 'PDF format preferred. Maximum file size: 10MB.',
        required: true,
        validation: {
          allowedExtensions: ['.pdf', '.doc', '.docx'],
          maxFileSizeMB: 10
        },
        order: 5
      },
      {
        id: 'f_res_notice',
        key: 'noticePeriod',
        label: 'Notice Period / Availability',
        type: 'select',
        options: ['Immediate', '15 Days', '30 Days', '60 Days or more'],
        required: false,
        order: 6
      },
      {
        id: 'f_res_consent',
        key: 'consent',
        label: 'I consent to having my information and resume stored for talent review purposes.',
        type: 'consent',
        required: true,
        order: 7
      }
    ]
  },
  {
    formId: 'tpl_contact_form',
    title: 'Contact Form',
    slug: 'contact-form',
    description: 'Get in touch for software projects, tech consultancy, or business inquiries.',
    status: 'Published',
    isSubmissionsEnabled: true,
    isTemplate: true,
    templateCategory: 'General',
    confirmationMessage: 'Thanks for reaching out! We have received your message and will reply within 24 hours.',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: true,
      userEmailFieldKey: 'email',
      customSubject: 'Message Received - Tauhid Shekhar',
      customMessage: 'Thank you for reaching out. We have received your inquiry and will be in touch shortly.'
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Send Message',
      accentColor: '#C2272D'
    },
    placements: ['directory', 'contact', 'standalone'],
    fields: [
      {
        id: 'f_cnt_name',
        key: 'fullName',
        label: 'Full Name',
        type: 'fullName',
        placeholder: 'Your name',
        required: true,
        order: 1
      },
      {
        id: 'f_cnt_email',
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'your.email@domain.com',
        required: true,
        order: 2
      },
      {
        id: 'f_cnt_phone',
        key: 'phone',
        label: 'Mobile Number',
        type: 'phone',
        placeholder: '+91 98765 43210',
        required: false,
        order: 3
      },
      {
        id: 'f_cnt_subject',
        key: 'subject',
        label: 'Subject',
        type: 'text',
        placeholder: 'What would you like to discuss?',
        required: true,
        order: 4
      },
      {
        id: 'f_cnt_message',
        key: 'message',
        label: 'Your Message',
        type: 'textarea',
        placeholder: 'Please share details about your inquiry or project requirements...',
        required: true,
        validation: { minLength: 10 },
        order: 5
      },
      {
        id: 'f_cnt_pref',
        key: 'preferredChannel',
        label: 'Preferred Contact Method',
        type: 'radio',
        options: ['Email', 'Phone Call', 'WhatsApp'],
        defaultValue: 'Email',
        required: false,
        order: 6
      }
    ]
  },
  {
    formId: 'tpl_internship_app',
    title: 'Internship Application Form',
    slug: 'internship-application',
    description: 'Apply for software development, full-stack, and design internships.',
    status: 'Published',
    isSubmissionsEnabled: true,
    isTemplate: true,
    templateCategory: 'Careers',
    confirmationMessage: 'Internship application submitted! We will evaluate your profile and contact you for an interview.',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: true,
      userEmailFieldKey: 'email',
      customSubject: 'Internship Application Received - Tauhid Shekhar',
      customMessage: 'We received your internship application. Thank you for your interest!'
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Apply for Internship',
      accentColor: '#00FFFF'
    },
    placements: ['directory', 'internship', 'standalone'],
    fields: [
      {
        id: 'f_int_name',
        key: 'fullName',
        label: 'Full Name',
        type: 'fullName',
        placeholder: 'Your full name',
        required: true,
        order: 1
      },
      {
        id: 'f_int_email',
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'student@university.edu',
        required: true,
        order: 2
      },
      {
        id: 'f_int_phone',
        key: 'phone',
        label: 'Mobile / WhatsApp Number',
        type: 'phone',
        placeholder: '+91 98765 43210',
        required: true,
        order: 3
      },
      {
        id: 'f_int_college',
        key: 'collegeName',
        label: 'College / University Name',
        type: 'text',
        placeholder: 'e.g. Delhi University / IIT / NIT',
        required: true,
        order: 4
      },
      {
        id: 'f_int_degree',
        key: 'degreeAndYear',
        label: 'Degree & Graduation Year',
        type: 'text',
        placeholder: 'e.g. B.Tech Computer Science (2027)',
        required: true,
        order: 5
      },
      {
        id: 'f_int_domain',
        key: 'domain',
        label: 'Domain of Interest',
        type: 'select',
        options: ['Full Stack Web Development', 'Frontend (React / Tailwind)', 'Backend (Node.js / Express)', 'UI/UX Design', 'AI & Machine Learning'],
        required: true,
        order: 6
      },
      {
        id: 'f_int_resume',
        key: 'resume',
        label: 'Resume / CV (PDF)',
        type: 'resume',
        required: true,
        validation: { allowedExtensions: ['.pdf'], maxFileSizeMB: 10 },
        order: 7
      },
      {
        id: 'f_int_duration',
        key: 'durationMonths',
        label: 'Available Duration (Months)',
        type: 'number',
        placeholder: 'e.g. 3 or 6',
        validation: { min: 1, max: 12 },
        required: true,
        order: 8
      },
      {
        id: 'f_int_why',
        key: 'whyJoin',
        label: 'Why do you want this internship?',
        type: 'textarea',
        placeholder: 'Tell us what you hope to learn and build...',
        required: false,
        order: 9
      },
      {
        id: 'f_int_consent',
        key: 'consent',
        label: 'I confirm that I am currently a student or recent graduate available for internship work.',
        type: 'consent',
        required: true,
        order: 10
      }
    ]
  },
  {
    formId: 'tpl_event_registration',
    title: 'Registration Form',
    slug: 'event-registration',
    description: 'Register for upcoming workshops, developer masterclasses, and tech webinars.',
    status: 'Published',
    isSubmissionsEnabled: true,
    isTemplate: true,
    templateCategory: 'Events',
    confirmationMessage: 'Registration successful! Check your email for your confirmation details and event access link.',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: true,
      userEmailFieldKey: 'email',
      customSubject: 'Registration Confirmed - Tauhid Shekhar Events',
      customMessage: 'Your registration is confirmed. We look forward to seeing you at the event!'
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Complete Registration',
      accentColor: '#C2272D'
    },
    placements: ['directory', 'community', 'standalone'],
    fields: [
      {
        id: 'f_reg_fname',
        key: 'firstNameLastName',
        label: 'First & Last Name',
        type: 'firstLastName',
        placeholder: 'First and Last name',
        required: true,
        order: 1
      },
      {
        id: 'f_reg_email',
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
        order: 2
      },
      {
        id: 'f_reg_phone',
        key: 'phone',
        label: 'Phone Number',
        type: 'phone',
        placeholder: '+91 98765 43210',
        required: true,
        order: 3
      },
      {
        id: 'f_reg_org',
        key: 'organization',
        label: 'Company / Organization / College',
        type: 'text',
        placeholder: 'e.g. Microsoft / Self-Employed',
        required: false,
        order: 4
      },
      {
        id: 'f_reg_attendance',
        key: 'attendanceMode',
        label: 'Attendance Mode',
        type: 'radio',
        options: ['Online Webinar (Virtual)', 'In-Person (Live Session)'],
        defaultValue: 'Online Webinar (Virtual)',
        required: true,
        order: 5
      },
      {
        id: 'f_reg_notes',
        key: 'specialRequirements',
        label: 'Questions or Special Requests',
        type: 'textarea',
        placeholder: 'Any questions for the speaker or accessibility needs...',
        required: false,
        order: 6
      },
      {
        id: 'f_reg_terms',
        key: 'agreeTerms',
        label: 'I agree to the event code of conduct and registration terms.',
        type: 'consent',
        required: true,
        order: 7
      }
    ]
  },
  {
    formId: 'tpl_general_enquiry',
    title: 'General Enquiry Form',
    slug: 'general-enquiry',
    description: 'Have a question or request? Fill out this enquiry form and we will assist you.',
    status: 'Published',
    isSubmissionsEnabled: true,
    isTemplate: true,
    templateCategory: 'General',
    confirmationMessage: 'Your enquiry has been received. A team member will follow up with you promptly.',
    emailNotifications: {
      notifyAdmin: true,
      adminEmails: ['shekhartauhid@gmail.com'],
      notifyUser: true,
      userEmailFieldKey: 'email',
      customSubject: 'Enquiry Received - Tauhid Shekhar',
      customMessage: 'Thank you for your enquiry. We have received your request and will get back to you.'
    },
    appearance: {
      theme: 'brand',
      submitButtonText: 'Submit Enquiry',
      accentColor: '#C2272D'
    },
    placements: ['directory', 'standalone'],
    fields: [
      {
        id: 'f_enq_name',
        key: 'fullName',
        label: 'Your Name',
        type: 'fullName',
        placeholder: 'Full name',
        required: true,
        order: 1
      },
      {
        id: 'f_enq_email',
        key: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'name@domain.com',
        required: true,
        order: 2
      },
      {
        id: 'f_enq_category',
        key: 'category',
        label: 'Enquiry Category',
        type: 'select',
        options: ['Project Collaboration', 'Consultancy & Advisory', 'Tech Speaking & Workshops', 'Mentorship', 'Other Questions'],
        required: true,
        order: 3
      },
      {
        id: 'f_enq_desc',
        key: 'details',
        label: 'Enquiry Details',
        type: 'textarea',
        placeholder: 'Provide comprehensive details about what you need...',
        required: true,
        order: 4
      }
    ]
  }
];

const seedFormTemplates = async () => {
  try {
    for (const tpl of DEFAULT_TEMPLATES) {
      const exists = await Form.findOne({ formId: tpl.formId });
      if (!exists) {
        // Also ensure slug isn't taken
        const slugExists = await Form.findOne({ slug: tpl.slug });
        if (!slugExists) {
          await Form.create(tpl);
          console.log(`[Form Builder] Seeded default template: "${tpl.title}" (${tpl.slug})`);
        }
      }
    }
  } catch (error) {
    console.error('[Form Builder] Error seeding form templates:', error.message);
  }
};

module.exports = { seedFormTemplates, DEFAULT_TEMPLATES };
