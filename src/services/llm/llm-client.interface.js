/**
 * Interface/Classe base para clientes LLM
 *
 * Princípios SOLID aplicados:
 * - Interface Segregation: Define contrato mínimo que clientes LLM devem implementar
 * - Dependency Inversion: Componentes dependem desta abstração, não de implementações concretas
 * - Open/Closed: Aberto para extensão (novas implementações), fechado para modificação
 */
class LLMClient {
  constructor(apiKey, modelName) {
    if (this.constructor === LLMClient) {
      throw new Error('LLMClient é uma classe abstrata e não pode ser instanciada diretamente');
    }
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  /**
   * Envia mensagem para o LLM
   * @param {Array} messages - Array de mensagens
   * @param {Object} options - Opções adicionais
   * @returns {Promise<string>} Resposta do LLM
   */
  async sendMessage(messages, options = {}) {
    throw new Error('Método sendMessage() deve ser implementado');
  }

  /**
   * Valida a API key
   * @returns {Promise<boolean>} True se válida
   */
  async validateApiKey() {
    throw new Error('Método validateApiKey() deve ser implementado');
  }

  /**
   * Obtém nome do provider
   * @returns {string} Nome do provider
   */
  getProviderName() {
    throw new Error('Método getProviderName() deve ser implementado');
  }
}

export default LLMClient;
