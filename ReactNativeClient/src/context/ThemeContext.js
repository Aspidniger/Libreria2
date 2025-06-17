import React, { createContext, useState, useContext } from 'react';
import { DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => setDarkMode(prev => !prev);

  const combinedPaperTheme = darkMode ? PaperDarkTheme : PaperDefaultTheme;
  const combinedNavTheme = darkMode ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, setDarkMode, paperTheme: combinedPaperTheme, navTheme: combinedNavTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
