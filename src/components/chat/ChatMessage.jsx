import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente ChatMessage - Renderiza uma mensagem individual
 *
 * Princípios aplicados:
 * - Single Responsibility: Renderiza apenas uma mensagem
 * - Presentational Component: Foca na apresentação
 */
const ChatMessage = ({ message, isUser }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copiado!', { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`group relative max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Botão de copiar (apenas para mensagens da IA) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copiar"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
