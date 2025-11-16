/**
 * Configurações gerais da aplicação
 */

export const PDF_CONFIG = {
  DEFAULT_SCALE: 1.5,
  DEFAULT_ROTATION: 0,
  SCROLL_MODES: {
    PAGE: 'page',
    CONTINUOUS: 'continuous'
  },
  PAGE_MODES: {
    SINGLE: 'single',
    DUAL: 'dual'
  },
  PDFJS: {
    CDN_VERSION: '3.11.174',
    WORKER_URL: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    SCRIPT_URL: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
  }
};

export const UI_CONFIG = {
  SIDEBAR_TABS: {
    THUMBNAILS: 'thumbnails',
    BOOKMARKS: 'bookmarks',
    OUTLINE: 'outline'
  },
  THEME: {
    LIGHT: 'light',
    DARK: 'dark',
    STORAGE_KEY: 'pdf-sage-dark-mode'
  },
  TOAST_DURATION: {
    SHORT: 2000,
    MEDIUM: 3000,
    LONG: 4000
  }
};

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  API_KEYS: 'api_keys',
  DOCUMENTS: 'documents',
  CONVERSATIONS: 'conversations',
  BOOKMARKS: 'bookmarks'
};
