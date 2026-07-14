/**
 * Cloudinary URL Optimization Utility
 * Transforms raw Cloudinary URLs into optimized versions with
 * automatic format (AVIF/WebP), quality, and responsive width.
 */

const CLOUDINARY_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/)(?:image|video)\/upload\/(.*)/;

// Standard responsive breakpoints
const DEFAULT_SIZES = [320, 640, 768, 1024, 1440, 1920];

/**
 * Inject Cloudinary transformation parameters into a URL.
 * Non-Cloudinary URLs pass through unchanged.
 *
 * @param {string} url       - Original image URL
 * @param {object} options
 * @param {number} [options.width]   - Desired pixel width
 * @param {string} [options.quality] - Quality setting (default: 'auto')
 * @param {string} [options.format]  - Format (default: 'auto' → AVIF/WebP)
 * @param {string} [options.crop]    - Crop mode (default: 'limit')
 * @returns {string} Optimized URL
 */
export const getOptimizedUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url || '';

  const match = url.match(CLOUDINARY_REGEX);
  if (!match) return url; // Not a Cloudinary URL — pass through

  const [, base, rest] = match;
  const {
    width,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  // Build transformation chain
  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) {
    transforms.push(`w_${width}`, `c_${crop}`);
  }

  const transformStr = transforms.join(',');

  // Check if the rest already has transformations (e.g. "v1234567/folder/file.jpg")
  // Insert our transforms before the existing path
  return `${base}image/upload/${transformStr}/${rest}`;
};

/**
 * Generate a srcSet string for responsive images.
 *
 * @param {string}   url   - Original Cloudinary image URL
 * @param {number[]} [sizes] - Array of widths (default: standard breakpoints)
 * @returns {string} srcSet attribute value
 */
export const getSrcSet = (url, sizes = DEFAULT_SIZES) => {
  if (!url || typeof url !== 'string') return '';

  const match = url.match(CLOUDINARY_REGEX);
  if (!match) return ''; // Can't generate srcSet for non-Cloudinary URLs

  return sizes
    .map((w) => `${getOptimizedUrl(url, { width: w })} ${w}w`)
    .join(', ');
};

/**
 * Get the default sizes attribute for responsive images.
 * @returns {string} sizes attribute value
 */
export const getDefaultSizes = () =>
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

/**
 * Check if a URL is a Cloudinary URL.
 * @param {string} url
 * @returns {boolean}
 */
export const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return CLOUDINARY_REGEX.test(url);
};
