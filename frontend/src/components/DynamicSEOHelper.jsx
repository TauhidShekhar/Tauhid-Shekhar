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
    const path = location.pathname;
    const baseSiteUrl = seo?.siteUrl || 'https://tauhidshekhar.com';
    const siteName = seo?.siteName || 'Tauhid Shekhar';
    
    // Default meta fallback
    let title = seo?.metaTitle || 'Tauhid Shekhar | Full-Stack Software Engineer & MERN Developer';
    let description = seo?.metaDescription || 'Official portfolio of Tauhid Shekhar, Full-Stack Web Developer & MERN Engineer specializing in React.js, Node.js, Express, MongoDB, REST APIs, and modern responsive interfaces.';
    let keywords = seo?.metaKeywords || 'Tauhid Shekhar, Full Stack Developer, MERN Stack, React Developer, Node.js Engineer, Web Developer Portfolio, Delhi India';
    let canonical = `${baseSiteUrl}${path === '/' ? '' : path}`;
    let ogTitle = seo?.ogTitle || title;
    let ogDescription = seo?.ogDescription || description;
    let ogImage = seo?.ogImage?.url || `${baseSiteUrl}/assits/Profile_Pic.png`;
    let robotsIndex = 'index, follow';

    // Route-specific metadata mapping
    if (path.startsWith('/projects/')) {
      const slugPart = path.replace('/projects/', '').replace(/-/g, ' ');
      const formattedTitle = slugPart ? slugPart.charAt(0).toUpperCase() + slugPart.slice(1) : 'Showcase';
      title = `${formattedTitle} | Projects & Case Studies - ${siteName}`;
      description = `Detailed technical case study, architecture, features, and source code of ${formattedTitle} built by ${siteName}.`;
      keywords = `${formattedTitle}, Software Project, React Application, MERN Stack Case Study, Full Stack Developer Portfolio`;
    } else if (path === '/projects') {
      title = `Projects & Case Studies | ${siteName} - Full-Stack Engineer`;
      description = 'Explore interactive web applications, SaaS platforms, e-commerce solutions, and open-source software built by Tauhid Shekhar.';
      keywords = 'Web Applications, React Projects, MERN Stack Portfolio, Full Stack Developer India, Case Studies';
    } else if (path === '/forms' || path === '/forms-center') {
      title = `Dynamic Forms Center & Client Inquiries | ${siteName}`;
      description = 'Submit project briefs, recruitment requests, consultation inquiries, and feedback directly to Tauhid Shekhar.';
      keywords = 'Forms Center, Project Inquiries, Client Briefs, Web Development Quote, Hire Developer';
    } else if (path.startsWith('/forms/')) {
      const formSlug = path.replace('/forms/', '').replace(/-/g, ' ');
      const formattedFormTitle = formSlug ? formSlug.charAt(0).toUpperCase() + formSlug.slice(1) : 'Inquiry';
      title = `${formattedFormTitle} | Forms Center - ${siteName}`;
      description = `Secure online form for ${formattedFormTitle}. Submit your specifications and project details directly.`;
    } else if (path.startsWith('/community/post/')) {
      title = `Community Discussion & Developer Post | DevCommunity - ${siteName}`;
      description = 'Read technical discussions, developer thoughts, code questions, and resources in the DevCommunity.';
    } else if (path.startsWith('/community/projects')) {
      title = `Project Discussions & Showcases | DevCommunity - ${siteName}`;
      description = 'Explore open-source project discussions, code feedback, and architectural reviews by fellow software engineers.';
      keywords = 'Software Projects, React Showcases, Code Review, MERN discussions';
    } else if (path.startsWith('/community/doubts')) {
      title = `Doubts Lounge & Code Help | DevCommunity - ${siteName}`;
      description = 'Ask technical programming questions, debug React and Node.js code snippets, and collaborate with developers.';
    } else if (path.startsWith('/community/resources')) {
      title = `Developer Resources & Curated Tools | ${siteName}`;
      description = 'Free cheatsheets, developer templates, roadmaps, and MERN stack learning resources.';
    } else if (path.startsWith('/community/jobs') || path.startsWith('/community/career-hub')) {
      title = `Developer Careers & Job Board | ${siteName}`;
      description = 'Discover tech job opportunities, freelance gigs, and hiring advice for junior and full-stack software engineers.';
    } else if (path.startsWith('/community/leaderboard')) {
      title = `Developer Leaderboard & Badges | DevCommunity - ${siteName}`;
      description = 'Top contributing community developers, challenge solvers, and active coders in the TS Ecosystem.';
    } else if (path.startsWith('/community')) {
      title = `DevCommunity Platform & Code Hub | ${siteName}`;
      description = 'Join our active developer community, discuss MERN stack engineering, ask questions, and share code portfolios.';
      keywords = 'Developer Community, Code Forum, MERN discussions, coding platform';
    } else if (path === '/services') {
      title = `Services & Engineering Solutions | ${siteName}`;
      description = 'Explore professional web development, MERN stack solutions, React frontend engineering, and REST API development services.';
      keywords = 'Web Development Services, MERN Stack Development, React Developer, Backend API Services, Freelance Engineer';
    } else if (path.startsWith('/services/')) {
      if (path.endsWith('/order')) {
        title = `Place Service Order | ${siteName}`;
        description = 'Submit your service order requirements, timeline expectations, and project specifications.';
      } else {
        title = `Service Details & Packages | ${siteName}`;
        description = 'Comprehensive service specifications, deliverables, milestone timelines, and pricing packages.';
      }
    } else if (path.startsWith('/features')) {
      title = `Platform Features & Interactive Capabilities | ${siteName}`;
      description = 'Explore interactive command palettes, AI ATS resume analyzer, real-time CMS sync, and responsive portfolio tools.';
    } else if (path.startsWith('/legal')) {
      title = `Legal Notice & Imprint | ${siteName}`;
      description = 'Legal disclosures, platform ownership, and intellectual property statements for Tauhid Shekhar.';
    } else if (path.startsWith('/terms')) {
      title = `Terms of Service | ${siteName}`;
      description = 'User terms, acceptable use policy, and guidelines for Tauhid Shekhar website and community platform.';
    } else if (path.startsWith('/privacy')) {
      title = `Privacy Policy & Data Protection | ${siteName}`;
      description = 'Privacy commitment, cookie usage, and personal data management policies under GDPR/CCPA standards.';
    } else if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password') || path.startsWith('/recover-account')) {
      title = `Sign In | ${siteName}`;
      description = 'Sign in to your account to continue.';
      robotsIndex = 'noindex, nofollow';
    } else if (path.startsWith('/user/dashboard') || path.startsWith('/dashboard') || path.startsWith('/admin')) {
      title = `Control Dashboard | ${siteName}`;
      description = 'Administrative platform overview and account settings.';
      robotsIndex = 'noindex, nofollow';
    }

    // 1. Inject DOM Title
    document.title = title;

    // 2. Inject Meta description
    updateOrCreateMeta('description', description);

    // 3. Inject Meta keywords
    updateOrCreateMeta('keywords', keywords);

    // 4. Inject Robots meta (controls crawling of private vs public routes)
    updateOrCreateMeta('robots', robotsIndex);

    // 5. Inject Canonical link
    updateOrCreateLink('canonical', 'canonical', canonical);

    // 6. OpenGraph Tags
    updateOrCreateMeta('og:title', ogTitle, 'property');
    updateOrCreateMeta('og:description', ogDescription, 'property');
    if (ogImage) {
      updateOrCreateMeta('og:image', ogImage, 'property');
    }
    updateOrCreateMeta('og:type', 'website', 'property');
    updateOrCreateMeta('og:url', canonical, 'property');
    updateOrCreateMeta('og:site_name', siteName, 'property');

    // 7. Twitter Card Tags
    updateOrCreateMeta('twitter:card', seo?.twitterCard || 'summary_large_image');
    updateOrCreateMeta('twitter:title', ogTitle);
    updateOrCreateMeta('twitter:description', ogDescription);
    if (ogImage) {
      updateOrCreateMeta('twitter:image', ogImage);
    }

    // 8. Inject JSON-LD Schema Settings
    injectSchemaLD(seo || {}, path, title, description, canonical);

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
      'url': data.siteUrl || 'https://tauhidshekhar.com',
      'description': description,
      'inLanguage': 'en-US'
    });

    // 2. Person / Professional profile schema
    defaultSchemas.push({
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': data.author || 'Tauhid Shekhar',
      'alternateName': 'TS',
      'url': data.siteUrl || 'https://tauhidshekhar.com',
      'image': `${data.siteUrl || 'https://tauhidshekhar.com'}/assits/Profile_Pic.png`,
      'sameAs': [
        'https://github.com/tauhidshekhar',
        'https://linkedin.com/in/tauhidshekhar'
      ],
      'jobTitle': 'Full-Stack Software Engineer & MERN Developer',
      'knowsAbout': [
        'JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 
        'RESTful APIs', 'Tailwind CSS', 'Next.js', 'Full-Stack Web Development', 
        'UI/UX Design', 'Technical SEO', 'Web Performance'
      ],
      'alumniOf': {
        '@type': 'EducationalOrganization',
        'name': 'Indira Gandhi National Open University (IGNOU)'
      }
    });

    // 3. Breadcrumb list schema based on path
    const pathParts = path.split('/').filter(Boolean);
    const domain = data.siteUrl || 'https://tauhidshekhar.com';
    if (pathParts.length > 0) {
      const itemListElement = [{
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': domain
      }];
      
      let currentAcc = '';
      pathParts.forEach((part, index) => {
        currentAcc += `/${part}`;
        itemListElement.push({
          '@type': 'ListItem',
          'position': index + 2,
          'name': part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
          'item': `${domain}${currentAcc}`
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
