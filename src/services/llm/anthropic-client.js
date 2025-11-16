import LLMClient from './llm-client.interface';
import { LLM_PROVIDERS } from '../../constants/llm-providers';

/**
 * Cliente Anthropic (Claude)
 *
 * Implementa interface LLMClient para Anthropic
 * Seguindo Liskov Substitution Principle - pode ser usado onde LLMClient é esperado
 */
class AnthropicClient extends LLMClient {
  constructor(apiKey, modelName) {
    super(apiKey, modelName);
    this.config = LLM_PROVIDERS.anthropic;
  }

  getProviderName() {
    return 'anthropic';
  }

  async validateApiKey() {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.config.headers(this.apiKey),
        body: JSON.stringify({
          model: this.modelName,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating Anthropic API key:', error);
      return false;
    }
  }

  async sendMessage(messages, options = {}) {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.config.headers(this.apiKey),
        body: JSON.stringify({
          model: this.modelName,
          max_tokens: options.maxTokens || 4096,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao comunicar com Anthropic');
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error sending message to Anthropic:', error);
      throw error;
    }
  }
}

export default AnthropicClient;
