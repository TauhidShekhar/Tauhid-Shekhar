import React, { useEffect } from 'react';

const AppLoader = ({ isLoading, onFinished }) => {
  useEffect(() => {
    const htmlLoader = document.getElementById('premium-splash-wrapper') || document.getElementById('instant-loader');
    if (htmlLoader) {
      htmlLoader.remove();
    }
    if (onFinished) onFinished();
  }, [onFinished]);

  if (!isLoading) return null;
  return null;
};

export default AppLoader;
