import LLMClient from './llm-client.interface';
import { LLM_PROVIDERS } from '../../constants/llm-providers';

/**
 * Cliente OpenAI (ChatGPT)
 *
 * Implementa interface LLMClient para OpenAI
 * Seguindo Liskov Substitution Principle - pode ser usado onde LLMClient é esperado
 */
class OpenAIClient extends LLMClient {
  constructor(apiKey, modelName) {
    super(apiKey, modelName);
    this.config = LLM_PROVIDERS.openai;
  }

  getProviderName() {
    return 'openai';
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
      console.error('Error validating OpenAI API key:', error);
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
        throw new Error(error.error?.message || 'Erro ao comunicar com OpenAI');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to OpenAI:', error);
      throw error;
    }
  }
}

export default OpenAIClient;
