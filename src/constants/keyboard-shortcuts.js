/**
 * Constantes de atalhos de teclado
 * Centraliza todas as configurações de atalhos em um único lugar
 */

export const KEYBOARD_SHORTCUTS = {
  NAVIGATION: {
    NEXT_PAGE: 'ArrowRight',
    PREVIOUS_PAGE: 'ArrowLeft'
  },
  SEARCH: {
    OPEN_SEARCH: 'f', // com Ctrl/Cmd
    CLOSE_SEARCH: 'Escape'
  },
  CHAT: {
    OPEN_CHAT: 'k' // com Ctrl/Cmd
  },
  BOOKMARKS: {
    TOGGLE_BOOKMARK: 'b' // com Ctrl/Cmd
  },
  VIEW: {
    FULLSCREEN_EXIT: 'Escape',
    SHOW_HELP: 'F1'
  }
};

export const MODIFIER_KEYS = {
  CTRL_OR_CMD: ['Control', 'Meta']
};
