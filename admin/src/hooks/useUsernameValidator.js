import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useUsernameValidator = (initialUsername = '', excludeUserId = '') => {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    // If the field is blank, reset states
    if (!username) {
      setError('');
      setIsValid(false);
      setIsChecking(false);
      return;
    }

    // 1. Starts with a letter
    if (!/^[a-zA-Z]/.test(username)) {
      setError('Username must start with a letter.');
      setIsValid(false);
      return;
    }

    // 2. Only lowercase letters (no uppercase)
    if (/[A-Z]/.test(username)) {
      setError('Username must be lowercase only.');
      setIsValid(false);
      return;
    }

    // 3. No spaces
    if (/\s/.test(username)) {
      setError('Username must not contain spaces.');
      setIsValid(false);
      return;
    }

    // 4. Allowed characters check
    if (!/^[a-z0-9_.]+$/.test(username)) {
      setError('Username must contain only lowercase letters, numbers, underscores (_), and dots (.).');
      setIsValid(false);
      return;
    }

    // 5. Length check
    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters.');
      setIsValid(false);
      return;
    }

    // Clear validation error and set loading state for database check
    setError('');
    setIsValid(false);
    setIsChecking(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.checkUsernameAvailability(username, excludeUserId);
        if (res.success) {
          if (res.available) {
            setError('');
            setIsValid(true);
          } else {
            setError('Username is already taken.');
            setIsValid(false);
          }
        } else {
          setError('Error checking username availability.');
          setIsValid(false);
        }
      } catch (err) {
        setError('Error checking username availability.');
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    }, 400); // 400ms debounce to prevent spamming DB queries

    return () => clearTimeout(delayDebounce);
  }, [username, excludeUserId]);

  return {
    username,
    setUsername,
    error,
    isChecking,
    isValid,
    setError
  };
};
