import React, { useEffect, useState } from 'react';
import GlobalLoader from '../ui/GlobalLoader';

const AppLoader = ({ isLoading, onFinished }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Remove the HTML inline loaders immediately as React has now taken over rendering
    const htmlLoader = document.getElementById('premium-splash-wrapper') || document.getElementById('instant-loader');
    if (htmlLoader) {
      htmlLoader.remove();
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Once loading is complete, wait 800ms to ensure animation displays smoothly, then fade out
      const timer = setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onFinished]);

  return <GlobalLoader visible={visible} instant={true} />;
};

export default AppLoader;
