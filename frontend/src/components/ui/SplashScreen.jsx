import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

/**
 * Premium SplashScreen Component
 * Compatible with React, Next.js, Vite, and Tailwind CSS.
 * 
 * Features:
 * - 60 FPS GPU-accelerated CSS animations.
 * - Under-1s execution on fast loads.
 * - Continuous pulsing fallback if resources take longer.
 * - LocalStorage tracking to only show on the first visit.
 */
const SplashScreen = ({ minDuration = 1000, onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [pulseLoop, setPulseLoop] = useState(false);

  useEffect(() => {
    // Check if user has already visited in this session
    const hasSeen = sessionStorage.getItem('splash_seen');
    if (hasSeen) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const startTime = Date.now();
    let isLoaded = false;

    // Monitor page resources load
    const handleLoad = () => {
      isLoaded = true;
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDuration - elapsedTime);

      // Wait until minDuration is complete before fading out
      setTimeout(() => {
        fadeAndRemove();
      }, remainingTime);
    };

    const fadeAndRemove = () => {
      const splashEl = document.getElementById('premium-splash-wrapper');
      if (splashEl) {
        splashEl.classList.add('splash-fade-out');
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem('splash_seen', 'true');
          onComplete?.();
        }, 300); // match CSS fade-out transition
      } else {
        setVisible(false);
        sessionStorage.setItem('splash_seen', 'true');
        onComplete?.();
      }
    };

    // Listen to document ready state
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Safety timeout: If resources take too long, transition to pulsing loop
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        setPulseLoop(true);
      }
    }, minDuration - 100);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, [minDuration, onComplete]);

  if (!visible) return null;

  return (
    <div id="premium-splash-wrapper" className={`premium-splash-overlay ${pulseLoop ? 'pulse-loop-active' : ''}`}>
      <div className="logo-container">
        {/* Glow particle at start */}
        <div className="center-init-glow" />

        <svg className="splash-logo-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Premium Neon Glow Filters */}
            <filter id="neon-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="neon-glow-sweep" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00f3ff" />
              <stop offset="100%" stop-color="#0071e3" />
            </linearGradient>
          </defs>

          {/* Outer circle drawing clockwise */}
          <circle
            className="ring-circle"
            cx="100"
            cy="100"
            r="70"
            stroke="#ffffff"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Glow sweep layer (active during rotation phase) */}
          <circle
            className="ring-glow-sweep"
            cx="100"
            cy="100"
            r="70"
            stroke="url(#cyan-gradient)"
            strokeWidth="4"
            fill="none"
            filter="url(#neon-glow-sweep)"
            strokeLinecap="round"
          />

          {/* Premium crown SVG path */}
          <path
            className="crown-path"
            d="M 100,48 L 114,68 L 132,62 C 128,78 114,84 100,84 C 86,84 72,78 68,62 L 86,68 Z"
            fill="#00f3ff"
            filter="url(#neon-cyan)"
          />

          {/* Almond-shaped premium eyes */}
          <g className="eyes-group">
            <path
              className="eye-left"
              d="M 78,98 Q 85,92 92,98 Q 85,102 78,98 Z"
              fill="#00f3ff"
            />
            <path
              className="eye-right"
              d="M 108,98 Q 115,92 122,98 Q 115,102 108,98 Z"
              fill="#00f3ff"
            />
          </g>

          {/* Premium slide-in texts */}
          <text
            className="text-brand-tauhid"
            x="100"
            y="122"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="16.5"
            fill="#ffffff"
            letterSpacing="2"
            textAnchor="middle"
          >
            TAUHID
          </text>
          
          <text
            className="text-brand-shekhar"
            x="100"
            y="138"
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="900"
            fontSize="13"
            fill="#00f3ff"
            letterSpacing="1.5"
            textAnchor="middle"
            filter="url(#neon-cyan)"
          >
            SHEKHAR
          </text>

          {/* Staggered bouncing dots */}
          <g className="dots-group">
            <circle className="splash-dot dot-l" cx="84" cy="154" r="4.5" fill="#ffffff" />
            <circle className="splash-dot dot-c" cx="100" cy="154" r="4.5" fill="#00f3ff" filter="url(#neon-cyan)" />
            <circle className="splash-dot dot-r" cx="116" cy="154" r="4.5" fill="#ffffff" />
          </g>

          {/* Micro burst particles */}
          <g className="burst-particles">
            <circle className="b-p p1" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '-30px', '--ty': '-30px' }} />
            <circle className="b-p p2" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '30px', '--ty': '-30px' }} />
            <circle className="b-p p3" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '30px', '--ty': '30px' }} />
            <circle className="b-p p4" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '-30px', '--ty': '30px' }} />
            <circle className="b-p p5" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '0px', '--ty': '-40px' }} />
            <circle className="b-p p6" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '40px', '--ty': '0px' }} />
            <circle className="b-p p7" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '0px', '--ty': '40px' }} />
            <circle className="b-p p8" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '-40px', '--ty': '0px' }} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SplashScreen;
