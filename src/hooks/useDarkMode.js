import { useState, useEffect } from 'react';
import { UI_CONFIG } from '../constants/app-config';

/**
 * Hook customizado para gerenciar tema dark mode
 *
 * Princípios aplicados:
 * - Single Responsibility: Gerencia apenas tema dark/light
 * - Separation of Concerns: Separa lógica de tema da UI
 *
 * @returns {[boolean, Function]} Tupla com estado darkMode e função toggle
 */
const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(UI_CONFIG.THEME.STORAGE_KEY);
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(UI_CONFIG.THEME.STORAGE_KEY, JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return [darkMode, toggleDarkMode, setDarkMode];
};

export default useDarkMode;
