import { useState, useEffect } from 'react';

/**
 * Custom hook for sessionStorage persistence with automatic JSON handling
 * @param {string} key - The sessionStorage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @param {boolean} isJson - Whether to JSON parse/stringify the value
 * @returns {[any, function]} - [currentValue, setValue] tuple
 */
export const useSessionStorage = (key, defaultValue, isJson = false) => {
  // Initialize state from sessionStorage
  const [value, setValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      if (isJson) {
        return JSON.parse(item);
      }

      // Handle type conversion based on default value type
      if (typeof defaultValue === 'number') {
        const parsed = Number(item);
        return isNaN(parsed) ? defaultValue : parsed;
      }

      if (typeof defaultValue === 'boolean') {
        return item === 'true';
      }

      return item;
    } catch (error) {
      console.warn(`useSessionStorage: Error reading ${key} from sessionStorage:`, error);
      return defaultValue;
    }
  });

  // Persist changes to sessionStorage
  useEffect(() => {
    try {
      if (value === null || value === undefined) {
        sessionStorage.removeItem(key);
      } else if (isJson) {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        sessionStorage.setItem(key, String(value));
      }
    } catch (error) {
      console.warn(`useSessionStorage: Error writing ${key} to sessionStorage:`, error);
    }
  }, [key, value, isJson]);

  return [value, setValue];
};