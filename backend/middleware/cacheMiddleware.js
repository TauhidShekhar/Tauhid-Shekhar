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
      // Flush all cache keys on write operations (POST, PUT, DELETE, PATCH)
      cacheStorage.clear();
      return next();
    }

    // Check if client explicitly requested fresh data
    const isNoCache = 
      req.headers['cache-control'] === 'no-cache' ||
      req.headers['pragma'] === 'no-cache' ||
      req.query?.refresh === 'true' ||
      req.query?.nocache === 'true';

    let urlForCache = req.originalUrl || req.url;
    try {
      const parsedUrl = new URL(urlForCache, 'http://localhost');
      if (!isNoCache) {
        parsedUrl.searchParams.delete('t');
        parsedUrl.searchParams.delete('_t');
      }
      urlForCache = parsedUrl.pathname + parsedUrl.search;
    } catch (_) {}

    const key = `${keyPrefix}:${urlForCache}`;
    const cached = cacheStorage.get(key);

    // If cache hit, not expired, and client did not request fresh data: return cached
    if (!isNoCache && cached && cached.expiry > Date.now()) {
      hitCount += 1;
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    } else if (cached && (!isNoCache || cached.expiry <= Date.now())) {
      // Delete expired or invalidated entry
      cacheStorage.delete(key);
    }

    missCount += 1;
    res.setHeader('X-Cache', isNoCache ? 'BYPASS' : 'MISS');

    // Intercept res.json to capture response body
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode === 200 && body && body.success) {
        // Cache TTL: 10 minutes (600 seconds) for higher freshness
        cacheStorage.set(key, {
          data: body,
          expiry: Date.now() + 600 * 1000
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
