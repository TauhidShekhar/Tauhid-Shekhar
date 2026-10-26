const { z } = require('zod');

// ---------------------------------------------------------------------------
// Validation middleware factory
// ---------------------------------------------------------------------------
// Parses req.body against the provided Zod schema.  On success the cleaned
// data is placed on req.validatedBody so controllers never touch raw input.
// ---------------------------------------------------------------------------
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = (result.error.errors || result.error.issues || []).map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validatedBody = result.data;
  next();
};

// ===========================================================================
// Auth schemas
// ===========================================================================

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    username: z
      .string({ required_error: 'Username is required' })
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores'
      )
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .toLowerCase()
      .trim(),
    phone: z.string().trim().optional(),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Email or username is required' })
    .min(1, 'Email or username is required')
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

const changePasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string({
      required_error: 'Please confirm your new password',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
});

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string({
      required_error: 'Please confirm your password',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const recoverAccountSchema = z.object({
  identifier: z
    .string({ required_error: 'Username or email is required' })
    .min(1, 'Username or email is required')
    .trim(),
});

const verifyRecoveryOtpSchema = z
  .object({
    identifier: z
      .string({ required_error: 'Username or email is required' })
      .min(1, 'Username or email is required')
      .trim(),
    otp: z
      .string({ required_error: 'OTP code is required' })
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^[0-9]+$/, 'OTP must be numeric'),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ===========================================================================
// Contact schema
// ===========================================================================

const contactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  subject: z.string().max(200, 'Subject must not exceed 200 characters').trim().optional(),
  phone: z.string().trim().optional(),
  message: z
    .string({ required_error: 'Message is required' })
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters')
    .trim(),
});

// ===========================================================================
// Project schema
// ===========================================================================

const projectSchema = z.object({
  title: z
    .string({ required_error: 'Project title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  subtitle: z.string().max(300).trim().optional(),
  tag: z.string().max(50).trim().optional(),
  tech: z.array(z.string().trim()).optional().default([]),
  image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  github: z.string().url('GitHub link must be a valid URL').optional().or(z.literal('')),
  demo: z.string().url('Demo link must be a valid URL').optional().or(z.literal('')),
  features: z.array(z.string().trim()).optional().default([]),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description is required')
    .trim(),
  status: z.enum(['active', 'archived']).optional().default('active'),
  featured: z.boolean().optional().default(false),
});

// ===========================================================================
// Skill schema
// ===========================================================================

const skillSchema = z.object({
  name: z
    .string({ required_error: 'Skill name is required' })
    .min(1, 'Skill name is required')
    .max(100)
    .trim(),
  percentage: z
    .number({ required_error: 'Percentage is required' })
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage must not exceed 100'),
  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required')
    .trim(),
  iconName: z.string().trim().optional(),
  displayOrder: z.number().int().min(0).optional().default(0),
});

// ===========================================================================
// Blog schema
// ===========================================================================

const blogSchema = z.object({
  title: z
    .string({ required_error: 'Blog title is required' })
    .min(1, 'Title is required')
    .max(300, 'Title must not exceed 300 characters')
    .trim(),
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must not exceed 500 characters').trim().optional(),
  tags: z.array(z.string().trim()).optional().default([]),
  category: z.string().max(100).trim().optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  metaTitle: z.string().max(200).trim().optional(),
  metaDescription: z.string().max(320).trim().optional(),
});

// ===========================================================================
// Order schema
// ===========================================================================

const orderSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  phone: z.string().trim().optional().or(z.literal('')),
  companyName: z.string().trim().optional().or(z.literal('')),
  selectedService: z
    .string({ required_error: 'Selected service is required' })
    .min(1, 'Selected service is required')
    .trim(),
  budget: z.string().trim().optional().or(z.literal('')),
  projectType: z.string().trim().optional().or(z.literal('')),
  deadline: z.string().trim().optional().or(z.literal('')),
  timelineExpectation: z.string().trim().optional().or(z.literal('')),
  description: z
    .string({ required_error: 'Description is required' })
    .min(5, 'Description must be at least 5 characters')
    .trim(),
  requestType: z.enum(['order', 'inquiry']).optional(),
  serviceId: z.string().trim().optional().or(z.literal('')),
  packageName: z.string().trim().optional().or(z.literal('')),
});

// ===========================================================================
// Exports
// ===========================================================================

module.exports = {
  validate,
  // Auth
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  recoverAccountSchema,
  verifyRecoveryOtpSchema,
  // Content
  contactSchema,
  projectSchema,
  skillSchema,
  blogSchema,
  orderSchema,
};
