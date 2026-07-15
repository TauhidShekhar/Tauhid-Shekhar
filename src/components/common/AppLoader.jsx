import React, { useEffect, useState } from 'react';
import './AppLoader.css';

const AppLoader = ({ isLoading, onFinished }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let minTimeElapsed = false;
    let loadingFinished = false;

    // Minimum display time of 1000ms to allow animations to play smoothly
    const timer = setTimeout(() => {
      minTimeElapsed = true;
      if (loadingFinished || !isLoading) {
        triggerFadeOut();
      }
    }, 1000);

    if (!isLoading) {
      loadingFinished = true;
      if (minTimeElapsed) {
        triggerFadeOut();
      }
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  const triggerFadeOut = () => {
    setFadeOut(true);
    // Wait for the fade-out CSS animation (500ms) to complete before unmounting
    const timer = setTimeout(() => {
      visible && setVisible(false);
      if (onFinished) onFinished();
    }, 500);
    return () => clearTimeout(timer);
  };

  if (!visible) return null;

  return (
    <div className={`app-preloader-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loader-content">
        {/* Glowing Outer Progress Ring */}
        <div className="loader-ring-wrapper">
          <div className="loader-progress-ring"></div>
        </div>

        {/* Animated Custom Logo */}
        <div className="loader-logo-wrapper">
          <svg className="loader-logo-svg" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="loaderLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="loaderLogoGlow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Hexagon Outline */}
            <polygon 
              points="50,15 82,33.5 82,66.5 50,85 18,66.5 18,33.5" 
              fill="none" 
              stroke="url(#loaderLogoGrad)" 
              strokeWidth="4" 
              className="hexagon-shape"
            />
            {/* Stylized TS Initials */}
            <path 
              d="M38,36 H62 M50,36 V64 M40,64 H60 M38,48 H48" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="5.5" 
              strokeLinecap="round" 
              className="logo-letters"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
