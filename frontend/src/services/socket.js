import { io } from 'socket.io-client';

const getSocketRoot = () => {
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl !== 'null') {
    return rawApiUrl.replace('/api', '');
  }
  const port = window.location.port;
  if (port === '5173' || port === '5174') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'https://tauhid-shekhar-portfolio.onrender.com';
};

const API_ROOT = getSocketRoot();

const socket = io(API_ROOT, {
  autoConnect: false,
  withCredentials: true
});

export default socket;
