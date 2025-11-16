import { useEffect } from 'react';
import { KEYBOARD_SHORTCUTS } from '../constants/keyboard-shortcuts';

/**
 * Hook customizado para gerenciar atalhos de teclado
 *
 * Princípios aplicados:
 * - Single Responsibility: Gerencia apenas atalhos de teclado
 * - Separation of Concerns: Separa lógica de atalhos da UI
 *
 * @param {Object} handlers - Objeto com funções handlers para cada atalho
 */
const useKeyboardShortcuts = (handlers = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputField = e.target.matches('input, textarea');
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // Navegação - Apenas se não estiver em campo de input
      if (!isInputField) {
        if (e.key === KEYBOARD_SHORTCUTS.NAVIGATION.NEXT_PAGE && handlers.nextPage) {
          e.preventDefault();
          handlers.nextPage();
        } else if (e.key === KEYBOARD_SHORTCUTS.NAVIGATION.PREVIOUS_PAGE && handlers.previousPage) {
          e.preventDefault();
          handlers.previousPage();
        }
      }

      // Busca - Ctrl/Cmd + F
      if (ctrlOrCmd && e.key === KEYBOARD_SHORTCUTS.SEARCH.OPEN_SEARCH && handlers.openSearch) {
        e.preventDefault();
        handlers.openSearch();
      }

      // Chat - Ctrl/Cmd + K
      if (ctrlOrCmd && e.key === KEYBOARD_SHORTCUTS.CHAT.OPEN_CHAT && handlers.openChat) {
        e.preventDefault();
        handlers.openChat();
      }

      // Bookmark - Ctrl/Cmd + B
      if (ctrlOrCmd && e.key === KEYBOARD_SHORTCUTS.BOOKMARKS.TOGGLE_BOOKMARK && handlers.toggleBookmark) {
        e.preventDefault();
        handlers.toggleBookmark();
      }

      // Escape - Fechar busca/fullscreen/modal
      if (e.key === KEYBOARD_SHORTCUTS.VIEW.FULLSCREEN_EXIT) {
        if (handlers.closeSearch) handlers.closeSearch();
        if (handlers.exitFullscreen) handlers.exitFullscreen();
        if (handlers.closeHelp) handlers.closeHelp();
      }

      // F1 - Ajuda
      if (e.key === KEYBOARD_SHORTCUTS.VIEW.SHOW_HELP && handlers.showHelp) {
        e.preventDefault();
        handlers.showHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};

export default useKeyboardShortcuts;
