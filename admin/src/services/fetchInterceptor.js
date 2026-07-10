// Safe Storage wrapper to handle cases where localStorage is disabled or restricted in Incognito/InPrivate modes
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key) || window[`__mem_${key}`];
    } catch (_) {
      return window[`__mem_${key}`] || null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
    window[`__mem_${key}`] = value;
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
    delete window[`__mem_${key}`];
  }
};

// Parse token query parameters (fallback for OAuth redirects in Incognito/Private tabs)
try {
  const urlParams = new URLSearchParams(window.location.search);
  const urlAccessToken = urlParams.get('accessToken');
  const urlRefreshToken = urlParams.get('refreshToken');
  
  if (urlAccessToken) {
    safeStorage.setItem('accessToken', urlAccessToken);
  }
  if (urlRefreshToken) {
    safeStorage.setItem('refreshToken', urlRefreshToken);
  }
  
  if (urlAccessToken || urlRefreshToken) {
    // Remove query params from browser URL to keep it clean and secure
    urlParams.delete('accessToken');
    urlParams.delete('refreshToken');
    const newSearch = urlParams.toString();
    const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
  }
} catch (_) {}

// Intercept all native fetch calls globally to inject fallback Bearer / Refresh Token headers
(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    const urlString = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    const isApiRequest = urlString && (urlString.includes('/api/') || urlString.includes(':5000/api'));
    
    if (isApiRequest) {
      options = options || {};
      options.headers = options.headers || {};
      
      // Ensure headers is a plain object or Headers instance
      let finalHeaders = {};
      if (options.headers instanceof Headers) {
        options.headers.forEach((val, key) => {
          finalHeaders[key] = val;
        });
      } else if (typeof options.headers === 'object') {
        finalHeaders = { ...options.headers };
      }
      
      const storedAccessToken = safeStorage.getItem('accessToken');
      const storedRefreshToken = safeStorage.getItem('refreshToken');
      
      // Inject Authorization Bearer token header if present
      if (storedAccessToken && !finalHeaders['Authorization'] && !finalHeaders['authorization']) {
        finalHeaders['Authorization'] = `Bearer ${storedAccessToken}`;
      }
      
      // Inject fallback refresh token header if present
      if (storedRefreshToken && !finalHeaders['x-refresh-token']) {
        finalHeaders['x-refresh-token'] = storedRefreshToken;
      }
      
      options.headers = finalHeaders;
      
      // Always include credentials to enable cookies where supported
      options.credentials = 'include';
    }
    
    const response = await originalFetch(url, options);
    
    if (isApiRequest) {
      try {
        const clonedResponse = response.clone();
        const json = await clonedResponse.json();
        if (json && json.success) {
          if (json.accessToken) {
            safeStorage.setItem('accessToken', json.accessToken);
          }
          if (json.refreshToken) {
            safeStorage.setItem('refreshToken', json.refreshToken);
          }
        }
      } catch (_) {
        // Response clone reading failure - skip silently
      }
      
      // Clear token store on explicit 401 Unauthorized token failures
      if (response.status === 401) {
        safeStorage.removeItem('accessToken');
        safeStorage.removeItem('refreshToken');
      }
    }
    
    return response;
  };
})();

export { safeStorage };
