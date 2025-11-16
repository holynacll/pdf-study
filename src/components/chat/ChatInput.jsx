import React from 'react';
import { Send, Loader2 } from 'lucide-react';

/**
 * Componente ChatInput - Campo de entrada de mensagens
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas input de mensagens
 * - Controlled Component: Estado gerenciado externamente
 */
const ChatInput = ({ value, loading, onChange, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        onSend();
      }
    }
  };

  return (
    <div className="p-4 border-t dark:border-gray-700">
      <div className="flex gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para quebra de linha)"
          className="flex-1 p-3 border dark:border-gray-600 rounded-lg resize-none dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={loading}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || loading}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span className="hidden sm:inline">Enviando...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span className="hidden sm:inline">Enviar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
