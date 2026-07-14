import React, { createContext, useContext, useState, useEffect } from 'react';
import GlobalLoader from '../components/ui/GlobalLoader';

const LoadingContext = createContext({
  loading: false,
  showLoader: () => {},
  hideLoader: () => {}
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [routeLoading, setRouteLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const showLoader = () => setRouteLoading(true);
  const hideLoader = () => setRouteLoading(false);

  // Global listener for API/external trigger events
  useEffect(() => {
    const handleShow = () => setApiLoading(true);
    const handleHide = () => setApiLoading(false);

    window.addEventListener('global-loading-show', handleShow);
    window.addEventListener('global-loading-hide', handleHide);

    return () => {
      window.removeEventListener('global-loading-show', handleShow);
      window.removeEventListener('global-loading-hide', handleHide);
    };
  }, []);

  const loading = routeLoading || apiLoading;

  return (
    <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      <GlobalLoader visible={loading} />
    </LoadingContext.Provider>
  );
};
