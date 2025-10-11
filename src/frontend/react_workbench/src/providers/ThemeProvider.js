import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [boldBusinessTheme, setBoldBusinessTheme] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedBoldBusinessTheme = localStorage.getItem('boldBusinessTheme') === 'true';
    setTheme(savedTheme);
    setBoldBusinessTheme(savedBoldBusinessTheme);
    applyTheme(savedTheme, savedBoldBusinessTheme);
  }, []);

  const applyTheme = (newTheme, useBoldBusinessTheme = false) => {
    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes first
    root.classList.remove('dark', 'bold-business-theme');
    body.classList.remove('dark', 'bold-business-theme');

    if (useBoldBusinessTheme) {
      root.classList.add('bold-business-theme');
      body.classList.add('bold-business-theme');
    } else if (newTheme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, boldBusinessTheme);
  };

  const toggleBoldBusinessTheme = () => {
    const newBoldBusinessTheme = !boldBusinessTheme;
    setBoldBusinessTheme(newBoldBusinessTheme);
    localStorage.setItem('boldBusinessTheme', newBoldBusinessTheme.toString());
    applyTheme(theme, newBoldBusinessTheme);
  };

  const setThemeMode = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, boldBusinessTheme);
  };

  const value = {
    theme,
    toggleTheme,
    boldBusinessTheme,
    toggleBoldBusinessTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark',
    isBoldBusinessTheme: boldBusinessTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
