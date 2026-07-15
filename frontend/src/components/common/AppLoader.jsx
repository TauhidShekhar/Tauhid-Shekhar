import React, { useEffect, useState } from 'react';
import './AppLoader.css';

const AppLoader = ({ isLoading, onFinished }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Once loading is complete, wait 800ms to ensure animation displays smoothly, then fade out
      const timer = setTimeout(() => {
        setFadeOut(true);
        const exitTimer = setTimeout(() => {
          setVisible(false);
          if (onFinished) onFinished();
        }, 400); // matches the CSS fade transition
        return () => clearTimeout(exitTimer);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onFinished]);

  if (!visible) return null;

  return (
    <div className={`app-preloader-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <div className="center-init-glow"></div>
        <svg className="splash-logo-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
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
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="100%" stopColor="#0071e3" />
            </linearGradient>
          </defs>
          <circle className="ring-circle" cx="100" cy="100" r="70" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle className="ring-glow-sweep" cx="100" cy="100" r="70" stroke="url(#cyan-gradient)" strokeWidth="4" fill="none" filter="url(#neon-glow-sweep)" strokeLinecap="round" />
          <path className="crown-path" d="M 100,48 L 114,68 L 132,62 C 128,78 114,84 100,84 C 86,84 72,78 68,62 L 86,68 Z" fill="#00f3ff" filter="url(#neon-cyan)" />
          <g className="eyes-group">
            <path className="eye-left" d="M 78,98 Q 85,92 92,98 Q 85,102 78,98 Z" fill="#00f3ff" />
            <path className="eye-right" d="M 108,98 Q 115,92 122,98 Q 115,102 108,98 Z" fill="#00f3ff" />
          </g>
          <text className="text-brand-tauhid" x="100" y="122" fontFamily="'Outfit', -apple-system, sans-serif" fontWeight="900" fontSize="16.5" fill="#ffffff" letterSpacing="2" textAnchor="middle">TAUHID</text>
          <text className="text-brand-shekhar" x="100" y="138" fontFamily="'Outfit', -apple-system, sans-serif" fontWeight="900" fontSize="13" fill="#00f3ff" letterSpacing="1.5" textAnchor="middle" filter="url(#neon-cyan)">SHEKHAR</text>
          <g className="dots-group">
            <circle className="dot-l" cx="84" cy="154" r="4.5" fill="#ffffff" />
            <circle className="dot-c" cx="100" cy="154" r="4.5" fill="#00f3ff" filter="url(#neon-cyan)" />
            <circle className="dot-r" cx="116" cy="154" r="4.5" fill="#ffffff" />
          </g>
          <g className="burst-particles">
            <circle className="b-p" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '-30px', '--ty': '-30px' }} />
            <circle className="b-p" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '30px', '--ty': '-30px' }} />
            <circle className="b-p" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '30px', '--ty': '30px' }} />
            <circle className="b-p" cx="100" cy="100" r="2" fill="#00f3ff" style={{ '--tx': '-30px', '--ty': '30px' }} />
            <circle className="b-p" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '0px', '--ty': '-40px' }} />
            <circle className="b-p" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '40px', '--ty': '0px' }} />
            <circle className="b-p" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '0px', '--ty': '40px' }} />
            <circle className="b-p" cx="100" cy="100" r="1.5" fill="#ffffff" style={{ '--tx': '-40px', '--ty': '0px' }} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AppLoader;
