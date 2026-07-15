import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getOptimizedUrl, getSrcSet, getDefaultSizes, isCloudinaryUrl } from '../../utils/cloudinaryUrl';

/**
 * OptimizedImage — Drop-in replacement for <img> with automatic optimization.
 *
 * Features:
 * - Cloudinary URL auto-optimization (f_auto, q_auto, responsive width)
 * - Responsive srcSet generation for Cloudinary images
 * - Lazy loading by default, eager + fetchpriority="high" for priority images
 * - CSS skeleton shimmer placeholder while loading
 * - onError fallback to prevent broken image icons
 * - Aspect ratio container to prevent CLS
 *
 * @param {object} props
 * @param {string}  props.src          - Image source URL
 * @param {string}  props.alt          - Alt text (required for accessibility)
 * @param {boolean} [props.priority]   - If true, loading="eager" + fetchpriority="high"
 * @param {string}  [props.sizes]      - Custom sizes attribute
 * @param {number}  [props.width]      - Explicit width for Cloudinary optimization
 * @param {string}  [props.fallbackSrc]- Fallback image URL on error
 * @param {string}  [props.aspectRatio]- CSS aspect ratio (e.g., "16/9", "1/1")
 * @param {string}  [props.className]  - CSS class names
 * @param {object}  [props.style]      - Inline styles
 * @param {string}  [props.objectFit]  - CSS object-fit value (default: "cover")
 * @param {function} [props.onLoad]    - Custom onLoad handler
 * @param {function} [props.onError]   - Custom onError handler
 */
const OptimizedImage = ({
  src,
  alt = '',
  priority = false,
  sizes,
  width,
  fallbackSrc,
  aspectRatio,
  className = '',
  style = {},
  objectFit = 'cover',
  onLoad: externalOnLoad,
  onError: externalOnError,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Check if image is already cached/loaded (e.g., browser back-forward cache)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = useCallback((e) => {
    setLoaded(true);
    externalOnLoad?.(e);
  }, [externalOnLoad]);

  const handleError = useCallback((e) => {
    setError(true);
    if (fallbackSrc && e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
      setError(false); // Reset to try fallback
    }
    externalOnError?.(e);
  }, [fallbackSrc, externalOnError]);

  // Determine optimized URL
  const isCloudinary = isCloudinaryUrl(src);
  const optimizedSrc = isCloudinary
    ? getOptimizedUrl(src, { width: width || undefined })
    : (src || '');

  // Generate srcSet for Cloudinary images
  const srcSet = isCloudinary ? getSrcSet(src) : undefined;
  const imgSizes = srcSet ? (sizes || getDefaultSizes()) : undefined;

  // Container styles
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style,
  };

  // Image styles
  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    display: 'block',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  return (
    <div className={`optimized-image-container ${className}`} style={containerStyle}>
      {/* Skeleton shimmer placeholder */}
      {!loaded && !error && (
        <div className="optimized-image-skeleton" aria-hidden="true" />
      )}

      {/* Error state */}
      {error && !fallbackSrc && (
        <div className="optimized-image-error" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        srcSet={srcSet}
        sizes={imgSizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' } : {})}
        onLoad={handleLoad}
        onError={handleError}
        style={imgStyle}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
