import React from 'react';
import { Settings, MessageSquare, LogOut, FileText, Moon, Sun } from 'lucide-react';

/**
 * Componente Header - Cabeçalho da aplicação
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas renderiza header
 * - Presentational Component: Não gerencia estado
 */
const Header = ({
  pdfFile,
  darkMode,
  user,
  onToggleChat,
  onToggleSettings,
  onToggleDarkMode,
  onLogout
}) => {
  return (
    <div className="h-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white flex items-center justify-between px-6 shadow-lg">
      {/* Logo e título */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold">PDF Sage</h1>
          {pdfFile && (
            <p className="text-xs text-white/80 truncate max-w-xs">
              {pdfFile}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {/* Toggle Dark Mode */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Abrir chat (Ctrl+K)"
        >
          <MessageSquare size={20} />
        </button>

        {/* Settings */}
        <button
          onClick={onToggleSettings}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Configurações"
        >
          <Settings size={20} />
        </button>

        {/* User info e logout */}
        {user && (
          <>
            <div className="h-6 w-px bg-white/20 mx-2" />
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
              )}
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
