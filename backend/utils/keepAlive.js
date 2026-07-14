const https = require('https');
const http = require('http');

/**
 * Periodically pings the server to prevent cold starts on Render/serverless hosting platforms.
 * Fires every 14 minutes (Render's sleep threshold is 15 minutes).
 */
const startKeepAlive = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const backendUrl = process.env.BACKEND_URL || 'https://tauhid-shekhar-portfolio.onrender.com';

  if (!isProd && process.env.FORCE_KEEP_ALIVE !== 'true') {
    console.log('Keep-alive ping is disabled in non-production environments.');
    return;
  }

  const url = `${backendUrl}/api/health`;
  console.log(`Initializing keep-alive self-ping target: ${url}`);

  // Run ping every 14 minutes (840,000 ms)
  setInterval(() => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Keep-Alive self-ping successful: Code ${res.statusCode} at ${new Date().toISOString()}`);
      });
    }).on('error', (error) => {
      console.warn(`Keep-Alive self-ping failed: ${error.message}`);
    });
  }, 14 * 60 * 1000);
};

module.exports = startKeepAlive;
