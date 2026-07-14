const cacheStorage = new Map();
let hitCount = 0;
let missCount = 0;

/**
 * Retrieves cache metrics for the system performance monitor.
 */
const getCacheStats = () => {
  return {
    keys: cacheStorage.size,
    hits: hitCount,
    misses: missCount,
    hitRate: hitCount + missCount > 0 ? (hitCount / (hitCount + missCount)) * 100 : 0
  };
};

/**
 * Tag-based caching middleware to cache GET requests and flush on write operations.
 * @param {string} keyPrefix - Category prefix for cache keys
 */
const cacheMiddleware = (keyPrefix) => {
  return (req, res, next) => {
    // Check if caching is disabled via env
    if (process.env.DISABLE_CACHE === 'true') {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      // Flush all cache keys on write operations (POST, PUT, DELETE)
      cacheStorage.clear();
      return next();
    }

    let urlForCache = req.originalUrl || req.url;
    try {
      const parsedUrl = new URL(urlForCache, 'http://localhost');
      parsedUrl.searchParams.delete('t');
      urlForCache = parsedUrl.pathname + parsedUrl.search;
    } catch (_) {}

    const key = `${keyPrefix}:${urlForCache}`;
    const cached = cacheStorage.get(key);

    // If cache hit and not expired, return immediately
    if (cached && cached.expiry > Date.now()) {
      hitCount += 1;
      return res.json(cached.data);
    } else if (cached) {
      // Delete expired entry
      cacheStorage.delete(key);
    }

    missCount += 1;

    // Intercept res.json to capture response body
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode === 200 && body && body.success) {
        // Cache TTL: 1 hour (3600 seconds)
        cacheStorage.set(key, {
          data: body,
          expiry: Date.now() + 3600 * 1000
        });
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = {
  cacheMiddleware,
  getCacheStats,
  clearCache: () => cacheStorage.clear()
};
