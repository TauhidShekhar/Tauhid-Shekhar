import React, { useEffect, useState } from 'react';
import './GlobalLoader.css';

/**
 * GlobalLoader Component
 * Professional fullscreen loading overlay.
 * Renders the brand logo with premium GPU-accelerated transition effects.
 */
const GlobalLoader = ({ visible = true }) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setFadeOut(false);
    } else {
      setFadeOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 400); // matches CSS fade-out transition
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div className={`global-loader-overlay ${fadeOut ? 'global-loader-fade-out' : ''}`}>
      <div className="global-loader-container">
        <div style={{ width: '220px', height: '220px' }}>
          {/* SVG Brand Logo with fade, scale, rotation & glow */}
          <svg className="global-loader-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="loader-neon-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="loader-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f3ff" />
                <stop offset="100%" stopColor="#0071e3" />
              </linearGradient>
            </defs>

            {/* Outer circle */}
            <circle 
              className="loader-ring" 
              cx="100" 
              cy="100" 
              r="70" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              fill="none" 
              strokeLinecap="round" 
            />

            {/* Glowing rotation ring */}
            <circle 
              className="loader-ring-glow" 
              cx="100" 
              cy="100" 
              r="70" 
              stroke="url(#loader-cyan-gradient)" 
              strokeWidth="4" 
              fill="none" 
              filter="url(#loader-neon-cyan)" 
              strokeLinecap="round" 
            />

            {/* Crown */}
            <path 
              className="loader-crown" 
              d="M 100,48 L 114,68 L 132,62 C 128,78 114,84 100,84 C 86,84 72,78 68,62 L 86,68 Z" 
              fill="#00f3ff" 
              filter="url(#loader-neon-cyan)" 
            />

            {/* Eyes */}
            <g className="loader-eyes">
              <path d="M 78,98 Q 85,92 92,98 Q 85,102 78,98 Z" fill="#00f3ff" />
              <path d="M 108,98 Q 115,92 122,98 Q 115,102 108,98 Z" fill="#00f3ff" />
            </g>

            {/* Text branding */}
            <text className="loader-txt-tauhid" x="100" y="122" fill="#ffffff">TAUHID</text>
            <text className="loader-txt-shekhar" x="100" y="138" fill="#00f3ff" filter="url(#loader-neon-cyan)">SHEKHAR</text>

            {/* Bouncing dots */}
            <g className="loader-dots">
              <circle cx="84" cy="154" r="4.5" fill="#ffffff" />
              <circle cx="100" cy="154" r="4.5" fill="#00f3ff" filter="url(#loader-neon-cyan)" />
              <circle cx="116" cy="154" r="4.5" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Spinner */}
        <div className="loader-spinner-circle"></div>

        {/* Loading text status with animated CSS dots */}
        <div className="loader-text-status">
          Preparing Experience
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
