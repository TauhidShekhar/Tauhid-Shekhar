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

        {/* Animated Brand Logo Image */}
        <div className="loader-logo-wrapper">
          <img 
            src="/assits/tauhidshekhar.png" 
            alt="Tauhid Shekhar Logo" 
            className="loader-logo-img"
            onError={(e) => {
              // Fallback to logo2 if main logo fails
              e.target.src = '/assits/logo2.png';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
