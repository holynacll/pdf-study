import React, { useState } from 'react';
import { MessageSquare, Copy, Check, X, HelpCircle, Languages } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente TextSelectionMenu - Menu flutuante ao selecionar texto
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas renderiza menu de ações para texto selecionado
 * - Presentational Component: Recebe callbacks via props
 */
const TextSelectionMenu = ({
  selectedText,
  darkMode,
  onAskAI,
  onTranslate,
  onExplain,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!selectedText) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      toast.success('Texto copiado!', { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar texto');
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-2.5 flex items-center gap-2 border-2 border-purple-300 dark:border-purple-600 z-30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Botão: Pergunte a IA */}
      <div className="group relative">
        <button
          onClick={onAskAI}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 hover:scale-110 shadow-md"
          title="Pergunte a IA"
        >
          <MessageSquare size={14} />
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Pergunte a IA
        </div>
      </div>

      {/* Botão: Traduzir */}
      <div className="group relative">
        <button
          onClick={onTranslate}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-110 shadow-md"
          title="Traduzir"
        >
          <Languages size={14} />
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Traduzir
        </div>
      </div>

      {/* Botão: Explique isso */}
      <div className="group relative">
        <button
          onClick={onExplain}
          className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:scale-110 shadow-md"
          title="Explique isso"
        >
          <HelpCircle size={14} />
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Explique isso
        </div>
      </div>

      {/* Botão: Copiar */}
      <div className="group relative">
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200 hover:scale-110 shadow-md"
          title="Copiar"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {copied ? 'Copiado!' : 'Copiar'}
        </div>
      </div>

      {/* Botão: Fechar */}
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ml-1"
      >
        <X size={14} className="text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default TextSelectionMenu;
