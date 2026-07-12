/**
 * Appends a database-backed version timestamp to URLs to bust browser cache
 * when assets or settings are updated in the Admin panel.
 * 
 * @param {string} url - The target file or image URL
 * @param {string|number|Date} [updatedAt] - The last update timestamp
 * @returns {string} - The cache-busted URL
 */
export const getCacheBustedUrl = (url, updatedAt) => {
  if (!url) return '';
  
  // If it's a base64 string, SVG, or data URL, return it directly
  if (url.startsWith('data:')) {
    return url;
  }

  // Get timestamp from updatedAt or fallback to a constant/session-based cache buster
  const timestamp = updatedAt 
    ? new Date(updatedAt).getTime() 
    : window.__siteLaunchTime || (window.__siteLaunchTime = Date.now());

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};
