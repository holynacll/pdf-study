import FirestoreRepository from '../firestore/firestore.repository';
import { FIRESTORE_COLLECTIONS } from '../../constants/app-config';

/**
 * Serviço de Conversas
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas conversas de chat
 * - Open/Closed: Estende FirestoreRepository sem modificá-lo
 * - Liskov Substitution: Pode ser usado onde FirestoreRepository é esperado
 * - Dependency Inversion: Depende da abstração FirestoreRepository
 */
class ConversationsService extends FirestoreRepository {
  constructor() {
    super(FIRESTORE_COLLECTIONS.CONVERSATIONS);
  }

  /**
   * Gera ID único para conversa
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   * @returns {string} ID único
   */
  _generateConversationId(userId, documentId) {
    return `${userId}_${documentId}`;
  }

  /**
   * Salva ou atualiza uma conversa
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   * @param {Array} messages - Array de mensagens
   */
  async saveConversation(userId, documentId, messages) {
    try {
      const convId = this._generateConversationId(userId, documentId);

      return await this.save(convId, {
        userId,
        documentId,
        messages
      }, { merge: true });
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Obtém uma conversa
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   * @returns {Array} Array de mensagens
   */
  async getConversation(userId, documentId) {
    try {
      const convId = this._generateConversationId(userId, documentId);
      const data = await this.get(convId);
      return data ? data.messages : [];
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Deleta uma conversa
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   */
  async deleteConversation(userId, documentId) {
    try {
      const convId = this._generateConversationId(userId, documentId);
      return await this.delete(convId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Adiciona uma mensagem a uma conversa existente
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   * @param {Object} message - Mensagem a ser adicionada
   */
  async addMessage(userId, documentId, message) {
    try {
      const messages = await this.getConversation(userId, documentId);
      messages.push(message);
      return await this.saveConversation(userId, documentId, messages);
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Limpa todas as mensagens de uma conversa
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   */
  async clearConversation(userId, documentId) {
    try {
      return await this.saveConversation(userId, documentId, []);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw error;
    }
  }
}

// Singleton instance
const conversationsService = new ConversationsService();
export default conversationsService;
