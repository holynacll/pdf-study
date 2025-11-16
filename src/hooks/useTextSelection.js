import { useState, useCallback, useEffect } from 'react';

/**
 * Hook customizado para gerenciar seleção de texto no PDF
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas gerencia seleção de texto
 * - Separation of Concerns: Separa lógica de seleção da UI
 */
const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState('');

  /**
   * Limpa e normaliza o texto selecionado
   */
  const cleanText = (text) => {
    return text
      .replace(/(\r\n|\r)/g, '\n')    // Normalizar quebras de linha
      .replace(/\n\s+/g, '\n')        // Remove espaços após quebras
      .replace(/\s+\n/g, '\n')        // Remove espaços antes de quebras
      .replace(/\n\s*•\s*/g, ' • ')   // Bullets
      .replace(/\n\s*-\s*/g, ' - ')   // Hífens
      .replace(/\n\s*\d+\.\s*/g, ' ') // Listas numeradas
      .replace(/\n+/g, ' ')           // Quebras de linha → espaço
      .replace(/\s+/g, ' ')           // Múltiplos espaços → único
      .trim();
  };

  /**
   * Handler para seleção de texto
   */
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    let text = selection.toString();

    if (!text.trim()) {
      setSelectedText('');
      return;
    }

    const cleanedText = cleanText(text);
    if (cleanedText) {
      setSelectedText(cleanedText);
    }
  }, []);

  /**
   * Limpa a seleção
   */
  const clearSelection = useCallback(() => {
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  }, []);

  return {
    selectedText,
    handleTextSelection,
    clearSelection,
    setSelectedText
  };
};

export default useTextSelection;
