/**
 * Core Web Vitals vanilla performance observer monitoring tool.
 * Observes LCP, FID, CLS, FCP, TTFB and logs them.
 */
export const monitorWebVitals = (onReport) => {
  const isDev = import.meta.env.DEV;

  try {
    // 1. First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportMetric('FCP', entry.startTime, onReport, isDev);
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    // 2. Largest Contentful Paint (LCP)
    let lcpValue = 0;
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      lcpValue = lastEntry.startTime;
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 3. Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 4. First Input Delay (FID)
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const delay = entry.processingStart - entry.startTime;
        reportMetric('FID', delay, onReport, isDev);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Report LCP and CLS on visibility hidden / page unload
    const reportFinalMetrics = () => {
      if (lcpValue > 0) reportMetric('LCP', lcpValue, onReport, isDev);
      reportMetric('CLS', clsValue, onReport, isDev);
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportFinalMetrics();
      }
    });
    window.addEventListener('pagehide', reportFinalMetrics);

    // 5. Time to First Byte (TTFB)
    if (performance.navigation) {
      const [nav] = performance.getEntriesByType('navigation');
      if (nav) {
        const ttfb = nav.responseStart - nav.requestStart;
        reportMetric('TTFB', ttfb, onReport, isDev);
      }
    }
  } catch (e) {
    if (isDev) console.warn('PerformanceObserver not fully supported in this browser:', e.message);
  }
};

const reportMetric = (name, value, onReport, isDev) => {
  const rounded = Math.round(value * 100) / 100;
  
  if (onReport) {
    onReport({ name, value: rounded });
  }

  if (isDev) {
    let color = '#22c55e'; // Green
    if (name === 'LCP' && rounded > 2500) color = '#ef4444'; // Red
    else if (name === 'FCP' && rounded > 1800) color = '#f59e0b'; // Orange
    else if (name === 'CLS' && rounded > 0.1) color = '#f59e0b';
    
    console.log(
      `%c[Web Vitals] ${name}: ${rounded}${name === 'CLS' ? '' : 'ms'}`,
      `color: ${color}; font-weight: bold;`
    );
  }
};
export default monitorWebVitals;
