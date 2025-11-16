import LLMClient from './llm-client.interface';
import { LLM_PROVIDERS } from '../../constants/llm-providers';

/**
 * Cliente Google (Gemini)
 *
 * Implementa interface LLMClient para Google Gemini
 * Seguindo Liskov Substitution Principle - pode ser usado onde LLMClient é esperado
 */
class GoogleClient extends LLMClient {
  constructor(apiKey, modelName) {
    super(apiKey, modelName);
    this.config = LLM_PROVIDERS.google;
  }

  getProviderName() {
    return 'google';
  }

  async validateApiKey() {
    try {
      const endpoint = `${this.config.endpoint}/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.config.headers(),
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating Google API key:', error);
      return false;
    }
  }

  async sendMessage(messages, options = {}) {
    try {
      const endpoint = `${this.config.endpoint}/${this.modelName}:generateContent?key=${this.apiKey}`;

      // Converte formato de mensagens para formato Gemini
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.config.headers(),
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: options.maxTokens || 4096
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao comunicar com Google Gemini');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error sending message to Google:', error);
      throw error;
    }
  }
}

export default GoogleClient;
