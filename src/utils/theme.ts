import { THEMES } from './constants';

let isDarkMode = true;

export const applyTheme = () => {
  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value as string);
  });
};

export const toggleTheme = () => {
  isDarkMode = !isDarkMode;
  applyTheme();
  return isDarkMode;
};

export const getCurrentTheme = () => {
  return isDarkMode;
}; 