import { serverTimestamp } from 'firebase/firestore';
import FirestoreRepository from '../firestore/firestore.repository';
import encryptionService from '../encryption/encryption.service';
import { FIRESTORE_COLLECTIONS } from '../../constants/app-config';

/**
 * Serviço de API Keys
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas API keys
 * - Open/Closed: Estende FirestoreRepository sem modificá-lo
 * - Liskov Substitution: Pode ser usado onde FirestoreRepository é esperado
 * - Dependency Inversion: Depende de abstrações (FirestoreRepository, EncryptionService)
 */
class ApiKeysService extends FirestoreRepository {
  constructor() {
    super(FIRESTORE_COLLECTIONS.API_KEYS);
    this.encryptionService = encryptionService;
  }

  /**
   * Gera ID único para API key
   * @param {string} userId - ID do usuário
   * @param {string} provider - Provedor LLM
   * @returns {string} ID único
   */
  _generateKeyId(userId, provider) {
    return `${userId}_${provider}`;
  }

  /**
   * Salva uma API key encriptada
   * @param {string} userId - ID do usuário
   * @param {string} provider - Provedor (anthropic, openai, google)
   * @param {string} apiKey - API key em texto plano
   * @param {string} modelName - Nome do modelo
   */
  async saveApiKey(userId, provider, apiKey, modelName) {
    try {
      const keyId = this._generateKeyId(userId, provider);
      const encryptedKey = this.encryptionService.encrypt(apiKey);

      await this.save(keyId, {
        userId,
        provider,
        apiKey: encryptedKey,
        modelName,
        isValid: true,
        lastValidated: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }

  /**
   * Obtém uma API key decriptada
   * @param {string} userId - ID do usuário
   * @param {string} provider - Provedor
   * @returns {Object|null} Dados da API key com apiKey decriptada
   */
  async getApiKey(userId, provider) {
    try {
      const keyId = this._generateKeyId(userId, provider);
      const data = await this.get(keyId);

      if (!data) {
        return null;
      }

      // Decriptar a API key antes de retornar
      return {
        ...data,
        apiKey: this.encryptionService.decrypt(data.apiKey)
      };
    } catch (error) {
      console.error('Error getting API key:', error);
      throw error;
    }
  }

  /**
   * Deleta uma API key
   * @param {string} userId - ID do usuário
   * @param {string} provider - Provedor
   */
  async deleteApiKey(userId, provider) {
    try {
      const keyId = this._generateKeyId(userId, provider);
      return await this.delete(keyId);
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as API keys de um usuário (decriptadas)
   * @param {string} userId - ID do usuário
   * @returns {Object} Objeto com keys por provider
   */
  async getAllApiKeys(userId) {
    try {
      const keys = await this.find([['userId', '==', userId]]);
      const keysMap = {};

      keys.forEach((keyData) => {
        keysMap[keyData.provider] = {
          ...keyData,
          apiKey: this.encryptionService.decrypt(keyData.apiKey)
        };
      });

      return keysMap;
    } catch (error) {
      console.error('Error getting all API keys:', error);
      throw error;
    }
  }

  /**
   * Inscreve-se para atualizações em tempo real das API keys
   * @param {string} userId - ID do usuário
   * @param {Function} callback - Callback com keys decriptadas
   */
  subscribeToApiKeys(userId, callback) {
    try {
      return this.subscribe([['userId', '==', userId]], (snapshot) => {
        const keysMap = {};

        snapshot.forEach((keyData) => {
          keysMap[keyData.provider] = {
            ...keyData,
            apiKey: this.encryptionService.decrypt(keyData.apiKey)
          };
        });

        callback(keysMap);
      });
    } catch (error) {
      console.error('Error subscribing to API keys:', error);
      throw error;
    }
  }
}

// Singleton instance
const apiKeysService = new ApiKeysService();
export default apiKeysService;
