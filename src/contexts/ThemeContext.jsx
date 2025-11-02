import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme state with proper fallback logic
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === null) {
      // No saved preference, use system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedMode === 'true';
  });

  const [isSystemDefault, setIsSystemDefault] = useState(() => {
    return localStorage.getItem('darkMode') === null;
  });

  // Apply theme to document immediately when state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (!isSystemDefault) {
        localStorage.setItem('darkMode', 'true');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (!isSystemDefault) {
        localStorage.setItem('darkMode', 'false');
      }
    }
  }, [isDarkMode, isSystemDefault]);

  // Listen for system preference changes (only if user hasn't set a preference)
  useEffect(() => {
    if (!isSystemDefault) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isSystemDefault]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevState => !prevState);
    setIsSystemDefault(false); // User is now overriding system preference
  };

  const resetToSystem = () => {
    localStorage.removeItem('darkMode');
    setIsSystemDefault(true);
    setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  const value = {
    isDarkMode,
    isSystemDefault,
    toggleDarkMode,
    resetToSystem
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};