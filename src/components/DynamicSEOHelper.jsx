import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const DynamicSEOHelper = () => {
  const location = useLocation();
  const [seo, setSeo] = useState(null);

  // Fetch SEO parameters on mount
  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const res = await api.getSEO();
        if (res.success && res.data) {
          setSeo(res.data);
          injectGlobalScripts(res.data);
        }
      } catch (err) {
        console.error('Dynamic SEO fetch failed:', err.message);
      }
    };
    fetchSEO();
  }, []);

  // Update headers on route changes
  useEffect(() => {
    if (!seo) return;

    const path = location.pathname;
    
    // Default meta fallback
    let title = seo.metaTitle || 'Tauhid Shekhar | Portfolio';
    let description = seo.metaDescription || '';
    let keywords = seo.metaKeywords || '';
    let canonical = `${seo.siteUrl || 'https://tauhidshekhar.vercel.app'}${path}`;
    let ogTitle = seo.ogTitle || title;
    let ogDescription = seo.ogDescription || description;
    let ogImage = seo.ogImage?.url || '';

    // Route-specific metadata mapping
    if (path.startsWith('/community')) {
      title = `DevCommunity Platform | ${seo.siteName || 'Tauhid Shekhar'}`;
      description = 'Join our active developer community, discuss MERN stack engineering, ask questions, and share code portfolios.';
      keywords = 'Developer Community, Code Forum, MERN discussions, coding platform';
    } else if (path.startsWith('/features')) {
      title = `Features Checklist | ${seo.siteName || 'Tauhid Shekhar'}`;
      description = 'Explore interactive command palettes, AI developer tools, dynamic location switchers, and real-time CMS sync features.';
    } else if (path.startsWith('/legal') || path.startsWith('/terms') || path.startsWith('/privacy')) {
      title = `Legal Policies | ${seo.siteName || 'Tauhid Shekhar'}`;
      description = 'Privacy policies, service agreements, and terms of service guidelines.';
    } else if (path.startsWith('/login') || path.startsWith('/register')) {
      title = `Auth Portal | ${seo.siteName || 'Tauhid Shekhar'}`;
      description = 'Sign in or register your profile to unlock custom portfolios, service orders, and tech forums.';
    } else if (path.startsWith('/user/dashboard') || path.startsWith('/dashboard')) {
      title = `User Workspace | ${seo.siteName || 'Tauhid Shekhar'}`;
      description = 'Admin panel and user account overview dashboards.';
    }

    // 1. Inject DOM Title
    document.title = title;

    // 2. Inject Meta description
    updateOrCreateMeta('description', description);

    // 3. Inject Meta keywords
    updateOrCreateMeta('keywords', keywords);

    // 4. Inject Canonical link
    updateOrCreateLink('canonical', 'canonical', canonical);

    // 5. OpenGraph Tags
    updateOrCreateMeta('og:title', ogTitle, 'property');
    updateOrCreateMeta('og:description', ogDescription, 'property');
    if (ogImage) {
      updateOrCreateMeta('og:image', ogImage, 'property');
    }
    updateOrCreateMeta('og:type', 'website', 'property');
    updateOrCreateMeta('og:url', canonical, 'property');

    // 6. Twitter Card Tags
    updateOrCreateMeta('twitter:card', seo.twitterCard || 'summary_large_image');
    updateOrCreateMeta('twitter:title', ogTitle);
    updateOrCreateMeta('twitter:description', ogDescription);
    if (ogImage) {
      updateOrCreateMeta('twitter:image', ogImage);
    }

    // 7. Inject JSON-LD Schema Settings
    injectSchemaLD(seo, path, title, description, canonical);

  }, [location, seo]);

  // Helper: Manage Meta tags dynamically
  const updateOrCreateMeta = (name, content, attribute = 'name') => {
    let el = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attribute, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Helper: Manage Link tags dynamically
  const updateOrCreateLink = (id, rel, href) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('id', id);
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // Inject tracking scripts (GTag, Clarity, FB Pixel, Favicon, Logo)
  const injectGlobalScripts = (data) => {
    // A. Favicon Link
    if (data.favicon?.url) {
      let icon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.setAttribute('rel', 'icon');
        document.head.appendChild(icon);
      }
      icon.setAttribute('href', data.favicon.url);
    }

    // B. Search Console Site Verification Tag
    if (data.googleSearchConsoleId) {
      updateOrCreateMeta('google-site-verification', data.googleSearchConsoleId);
    }

    // C. Google Analytics (gtag.js)
    if (data.googleAnalyticsId && !document.getElementById('gtag-script')) {
      const scriptSrc = document.createElement('script');
      scriptSrc.id = 'gtag-script';
      scriptSrc.async = true;
      scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`;
      document.head.appendChild(scriptSrc);

      const scriptCode = document.createElement('script');
      scriptCode.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${data.googleAnalyticsId}');
      `;
      document.head.appendChild(scriptCode);
    }

    // D. Microsoft Clarity
    if (data.microsoftClarityId && !document.getElementById('clarity-script')) {
      const scriptCode = document.createElement('script');
      scriptCode.id = 'clarity-script';
      scriptCode.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${data.microsoftClarityId}");
      `;
      document.head.appendChild(scriptCode);
    }

    // E. Facebook Pixel
    if (data.facebookPixel && !document.getElementById('fb-pixel-script')) {
      const scriptCode = document.createElement('script');
      scriptCode.id = 'fb-pixel-script';
      scriptCode.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${data.facebookPixel}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(scriptCode);
    }

    // F. Custom Head scripts
    if (data.customHeadScripts) {
      const container = document.createElement('div');
      container.innerHTML = data.customHeadScripts;
      Array.from(container.childNodes).forEach(node => {
        if (node.tagName === 'SCRIPT') {
          const s = document.createElement('script');
          s.innerHTML = node.innerHTML;
          Array.from(node.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
          document.head.appendChild(s);
        } else if (node.nodeType === 1) {
          document.head.appendChild(node.cloneNode(true));
        }
      });
    }
  };

  // Inject Dynamic JSON-LD Schema
  const injectSchemaLD = (data, path, title, description, canonical) => {
    let script = document.getElementById('json-ld-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

    // Parse custom schemas if any, else default dynamically
    let customSchema = {};
    try {
      customSchema = JSON.parse(data.schemaSettings || '{}');
    } catch (_) {}

    const defaultSchemas = [];

    // 1. WebSite Schema
    defaultSchemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': data.siteName || 'Tauhid Shekhar',
      'url': data.siteUrl || 'https://tauhidshekhar.vercel.app',
      'description': data.metaDescription
    });

    // 2. Person / Professional profile schema
    defaultSchemas.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': data.author || 'Tauhid Shekhar',
      'url': data.siteUrl || 'https://tauhidshekhar.vercel.app',
      'sameAs': [
        'https://github.com/tauhidshekhar',
        'https://linkedin.com/in/tauhidshekhar'
      ],
      'jobTitle': 'Full-Stack Software Engineer',
      'worksFor': {
        '@type': 'Organization',
        'name': data.siteName || 'Tauhid Shekhar Portfolio'
      }
    });

    // 3. Breadcrumb list schema based on path
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const itemListElement = [{
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': data.siteUrl || 'https://tauhidshekhar.vercel.app'
      }];
      
      let currentAcc = '';
      pathParts.forEach((part, index) => {
        currentAcc += `/${part}`;
        itemListElement.push({
          '@type': 'ListItem',
          'position': index + 2,
          'name': part.charAt(0).toUpperCase() + part.slice(1),
          'item': `${data.siteUrl || 'https://tauhidshekhar.vercel.app'}${currentAcc}`
        });
      });

      defaultSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': itemListElement
      });
    }

    // Merge custom schema settings with defaults
    const combinedSchema = [...defaultSchemas];
    if (Object.keys(customSchema).length > 0) {
      combinedSchema.push(customSchema);
    }

    script.innerHTML = JSON.stringify(combinedSchema);
  };

  return null;
};

export default DynamicSEOHelper;
