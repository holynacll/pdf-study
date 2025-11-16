import React, { useEffect, useRef } from 'react';
import { X, MessageSquare, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

/**
 * Componente ChatPanel - Painel lateral de chat com IA
 *
 * Princípios aplicados:
 * - Single Responsibility: Gerencia apenas a interface de chat
 * - Composition: Compõe ChatMessage e ChatInput
 */
const ChatPanel = ({
  isOpen,
  messages,
  input,
  loading,
  apiKeyValid,
  onClose,
  onInputChange,
  onSendMessage,
  onClearConversation
}) => {
  const chatEndRef = useRef(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold">Chat com IA</h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearConversation}
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
              title="Limpar conversa"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/20 transition-colors"
            title="Fechar chat (Ctrl+K)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Aviso se API key não configurada */}
      {!apiKeyValid && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b dark:border-gray-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Configure uma API key válida nas configurações para usar o chat.
          </p>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageSquare
                size={48}
                className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
              />
              <p className="text-gray-600 dark:text-gray-400">
                Comece uma conversa com a IA
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Faça perguntas sobre o documento ou selecione texto no PDF
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                isUser={msg.role === 'user'}
              />
            ))}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        loading={loading}
        onChange={onInputChange}
        onSend={onSendMessage}
      />
    </div>
  );
};

export default ChatPanel;
