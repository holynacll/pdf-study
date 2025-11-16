import AnthropicClient from './anthropic-client';
import OpenAIClient from './openai-client';
import GoogleClient from './google-client';

/**
 * Factory para criação de clientes LLM
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Responsável apenas por criar clientes LLM
 * - Open/Closed: Aberto para extensão (novos providers), fechado para modificação (usando mapa)
 * - Dependency Inversion: Retorna abstração (LLMClient), não implementação concreta
 *
 * Padrão Factory Method: Encapsula a lógica de criação de objetos
 */
class LLMClientFactory {
  constructor() {
    // Mapa de providers para suas classes
    // Para adicionar novo provider, basta adicionar aqui (OCP)
    this.providers = {
      anthropic: AnthropicClient,
      openai: OpenAIClient,
      google: GoogleClient
    };
  }

  /**
   * Cria um cliente LLM baseado no provider
   * @param {string} provider - Nome do provider (anthropic, openai, google)
   * @param {string} apiKey - API Key
   * @param {string} modelName - Nome do modelo
   * @returns {LLMClient} Instância do cliente LLM
   */
  createClient(provider, apiKey, modelName) {
    const ClientClass = this.providers[provider];

    if (!ClientClass) {
      throw new Error(`Provider desconhecido: ${provider}. Providers disponíveis: ${Object.keys(this.providers).join(', ')}`);
    }

    if (!apiKey) {
      throw new Error('API Key é obrigatória');
    }

    if (!modelName) {
      throw new Error('Nome do modelo é obrigatório');
    }

    return new ClientClass(apiKey, modelName);
  }

  /**
   * Verifica se um provider é suportado
   * @param {string} provider - Nome do provider
   * @returns {boolean} True se suportado
   */
  isProviderSupported(provider) {
    return provider in this.providers;
  }

  /**
   * Obtém lista de providers suportados
   * @returns {Array<string>} Array com nomes dos providers
   */
  getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Registra novo provider (extensibilidade)
   * @param {string} providerName - Nome do provider
   * @param {Class} ClientClass - Classe do cliente
   */
  registerProvider(providerName, ClientClass) {
    if (this.providers[providerName]) {
      console.warn(`Provider ${providerName} já existe e será sobrescrito`);
    }
    this.providers[providerName] = ClientClass;
  }
}

// Singleton instance
const llmClientFactory = new LLMClientFactory();
export default llmClientFactory;
