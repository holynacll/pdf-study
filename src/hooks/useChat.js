import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import llmClientFactory from '../services/llm/llm-client.factory';
import { apiKeysService, conversationsService } from '../services';
import { LLM_PROVIDERS, DEFAULT_LLM_PROVIDER } from '../constants/llm-providers';

/**
 * Hook customizado para gerenciar chat com LLMs
 *
 * Princípios aplicados:
 * - Single Responsibility: Gerencia apenas lógica de chat
 * - Dependency Inversion: Usa abstrações (llmClientFactory, services)
 * - Separation of Concerns: Separa lógica de chat da UI
 *
 * @param {string} userId - ID do usuário
 * @param {string} documentId - ID do documento
 * @returns {Object} Estado e funções para gerenciar chat
 */
const useChat = (userId, documentId) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [llmProvider, setLlmProvider] = useState(DEFAULT_LLM_PROVIDER);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState(LLM_PROVIDERS[DEFAULT_LLM_PROVIDER].defaultModel);
  const [apiKeyValid, setApiKeyValid] = useState(null);
  const [validating, setValidating] = useState(false);

  /**
   * Carrega API Key do Firestore quando provider muda
   */
  useEffect(() => {
    if (!userId || !llmProvider) return;

    const loadApiKey = async () => {
      try {
        const keyData = await apiKeysService.getApiKey(userId, llmProvider);
        if (keyData) {
          setApiKey(keyData.apiKey);
          setModelName(keyData.modelName || LLM_PROVIDERS[llmProvider].defaultModel);
          setApiKeyValid(true);
        } else {
          setApiKey('');
          setApiKeyValid(null);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, [userId, llmProvider]);

  /**
   * Atualiza modelo padrão quando provider muda
   */
  useEffect(() => {
    setModelName(LLM_PROVIDERS[llmProvider].defaultModel);
    setApiKeyValid(null);
  }, [llmProvider]);

  /**
   * Carrega conversa existente
   */
  useEffect(() => {
    if (!userId || !documentId) return;

    const loadConversation = async () => {
      try {
        const savedMessages = await conversationsService.getConversation(userId, documentId);
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [userId, documentId]);

  /**
   * Valida API Key
   */
  const validateApiKey = useCallback(async () => {
    if (!apiKey) {
      toast.error('Por favor, insira uma API key');
      return false;
    }

    setValidating(true);

    try {
      const client = llmClientFactory.createClient(llmProvider, apiKey, modelName);
      const isValid = await client.validateApiKey();

      setApiKeyValid(isValid);

      if (isValid) {
        // Salva no Firestore
        await apiKeysService.saveApiKey(userId, llmProvider, apiKey, modelName);
        toast.success('API key válida e salva!');
      } else {
        toast.error('API key inválida');
      }

      return isValid;
    } catch (error) {
      console.error('Error validating API key:', error);
      setApiKeyValid(false);
      toast.error('Erro ao validar API key');
      return false;
    } finally {
      setValidating(false);
    }
  }, [apiKey, llmProvider, modelName, userId]);

  /**
   * Envia mensagem para o LLM
   */
  const sendMessage = useCallback(async (pageContext = '') => {
    if (!input.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    if (!apiKeyValid) {
      toast.error('Configure uma API key válida primeiro');
      return;
    }

    const userMessage = {
      role: 'user',
      content: pageContext ? `Contexto da página: ${pageContext}\n\n${input}` : input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const client = llmClientFactory.createClient(llmProvider, apiKey, modelName);
      const updatedMessages = [...messages, userMessage];

      const response = await client.sendMessage(updatedMessages);

      const assistantMessage = {
        role: 'assistant',
        content: response
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Salva conversa no Firestore
      if (userId && documentId) {
        await conversationsService.saveConversation(userId, documentId, finalMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [input, apiKeyValid, llmProvider, apiKey, modelName, messages, userId, documentId]);

  /**
   * Limpa conversa
   */
  const clearConversation = useCallback(async () => {
    setMessages([]);
    if (userId && documentId) {
      try {
        await conversationsService.clearConversation(userId, documentId);
        toast.success('Conversa limpa');
      } catch (error) {
        console.error('Error clearing conversation:', error);
      }
    }
  }, [userId, documentId]);

  /**
   * Deleta conversa
   */
  const deleteConversation = useCallback(async () => {
    setMessages([]);
    if (userId && documentId) {
      try {
        await conversationsService.deleteConversation(userId, documentId);
        toast.success('Conversa deletada');
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  }, [userId, documentId]);

  /**
   * Salva API key
   */
  const saveApiKey = useCallback(async () => {
    return await validateApiKey();
  }, [validateApiKey]);

  /**
   * Deleta API key
   */
  const deleteApiKey = useCallback(async () => {
    try {
      await apiKeysService.deleteApiKey(userId, llmProvider);
      setApiKey('');
      setApiKeyValid(null);
      toast.success('API key removida');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Erro ao remover API key');
    }
  }, [userId, llmProvider]);

  return {
    // Estado
    messages,
    input,
    loading,
    llmProvider,
    apiKey,
    modelName,
    apiKeyValid,
    validating,
    // Setters
    setInput,
    setLlmProvider,
    setApiKey,
    setModelName,
    // Funções
    sendMessage,
    validateApiKey,
    clearConversation,
    deleteConversation,
    saveApiKey,
    deleteApiKey,
    // Providers disponíveis
    availableProviders: LLM_PROVIDERS
  };
};

export default useChat;
