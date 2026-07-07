import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api, registerAuthFailureCallback } from '../services/api';
import socket from '../services/socket';

const AuthContext = createContext(null);

// Key used for persisting minimal auth state in localStorage
const AUTH_STORAGE_KEY = 'portfolio_auth_user';

/**
 * Persist the user object (without sensitive fields) to localStorage so
 * that on page reload we can show a logged-in state immediately while the
 * network request is in-flight to re-validate the session.
 */
const persistUser = (user) => {
  if (user) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        id: user.id || user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        coins: user.coins || 0,
        level: user.level || 1,
        rank: user.rank || 'Bronze Starter',
        xp: user.xp || 0,
        reputation: user.reputation || 0,
        avatarBorder: user.avatarBorder || 'none',
        profileTheme: user.profileTheme || 'default'
      }));
    } catch (_) {
      // localStorage might be unavailable in private mode
    }
  } else {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (_) {}
  }
};

/**
 * Read the persisted user from localStorage.
 * Returns null if nothing stored or JSON is corrupted.
 */
const readPersistedUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Initialise from localStorage so the UI is instantly correct on refresh
  const persistedUser = readPersistedUser();

  const [user, setUser] = useState(persistedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!persistedUser);
  // If we already have a persisted user, skip the skeleton loader
  const [isLoading, setIsLoading] = useState(true);

  // Track whether a refresh is already in-flight
  const refreshInFlight = useRef(false);

  // ---------------------------------------------------------------------------
  // checkAuthStatus – verify session with the server
  // ---------------------------------------------------------------------------
  const checkAuthStatus = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        persistUser(res.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        persistUser(null);
      }
    } catch (err) {
      const status = err?.status || err?.statusCode;
      const errMsg = err?.message || '';
      const isAuthError = 
        status === 401 ||
        status === 403 ||
        errMsg.includes('401') || 
        errMsg.toLowerCase().includes('unauthorized') || 
        errMsg.toLowerCase().includes('authentication') || 
        errMsg.toLowerCase().includes('login') || 
        errMsg.toLowerCase().includes('expired') ||
        errMsg.toLowerCase().includes('no longer exists');

      if (isAuthError) {
        const refreshed = await tryRefreshSession();
        if (!refreshed) {
          setUser(null);
          setIsAuthenticated(false);
          persistUser(null);
        }
      } else {
        // Network or other error – don't log out. Keep existing state.
        console.warn('Auth check failed:', errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // tryRefreshSession – call the refresh-token endpoint to get a new pair
  // ---------------------------------------------------------------------------
  const tryRefreshSession = async () => {
    if (refreshInFlight.current) return false;
    refreshInFlight.current = true;

    try {
      const res = await api.refreshToken();
      if (res.success) {
        // After refresh, re-fetch the profile
        const profileRes = await api.getProfile();
        if (profileRes.success && profileRes.user) {
          setUser(profileRes.user);
          setIsAuthenticated(true);
          persistUser(profileRes.user);
          return true;
        }
      }
    } catch (_) {
      // Refresh failed – session truly expired
    } finally {
      refreshInFlight.current = false;
    }
    return false;
  };

  // On mount: verify session with the server
  useEffect(() => {
    registerAuthFailureCallback(() => {
      setUser(null);
      setIsAuthenticated(false);
      persistUser(null);
    });
    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync socket connection state with auth session
  useEffect(() => {
    if (isAuthenticated && user) {
      socket.connect();
      socket.emit('join_room', user.id || user._id);
    } else {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------
  const login = async (identifier, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, password, rememberMe);
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        persistUser(res.user);
        return res;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------
  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      persistUser(null);
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // updateProfile
  // ---------------------------------------------------------------------------
  const updateProfile = async (formData) => {
    const res = await api.updateProfile(formData);
    if (res.success && res.user) {
      setUser(res.user);
      persistUser(res.user);
    }
    return res;
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'Admin',
    isLoading,
    login,
    logout,
    updateProfile,
    refreshSession: checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
