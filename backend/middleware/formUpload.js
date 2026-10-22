const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure destination directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'form_submissions');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Dangerous extensions that must never be accepted under any circumstances
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.bin', '.php', '.phtml', '.php3',
  '.php4', '.php5', '.phps', '.js', '.mjs', '.cjs', '.vbs', '.scr', '.msi',
  '.com', '.pif', '.jar', '.py', '.pl', '.cgi', '.html', '.htm', '.xhtml',
  '.svg', '.dll', '.so', '.dylib', '.lnk', '.inf', '.reg'
]);

// Allowed safe extensions for resumes and documents
const DEFAULT_ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt',
  '.jpg', '.jpeg', '.png', '.webp',
  '.zip', '.rar', '.7z'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const filename = `${sanitizedBase}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return cb(new Error(`Security Alert: Files with extension "${ext}" are strictly prohibited.`), false);
  }

  if (!DEFAULT_ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type "${ext}" is not supported. Please upload a PDF, document, or image.`), false);
  }

  cb(null, true);
};

// Max file size: 25 MB per file
const uploadFormFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 10
  }
});

module.exports = {
  uploadFormFiles,
  UPLOAD_DIR,
  DANGEROUS_EXTENSIONS,
  DEFAULT_ALLOWED_EXTENSIONS
};
