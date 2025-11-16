import FirestoreRepository from '../firestore/firestore.repository';
import { FIRESTORE_COLLECTIONS } from '../../constants/app-config';

/**
 * Serviço de Documentos
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas documentos PDF
 * - Open/Closed: Estende FirestoreRepository sem modificá-lo
 * - Liskov Substitution: Pode ser usado onde FirestoreRepository é esperado
 * - Dependency Inversion: Depende da abstração FirestoreRepository
 */
class DocumentsService extends FirestoreRepository {
  constructor() {
    super(FIRESTORE_COLLECTIONS.DOCUMENTS);
  }

  /**
   * Gera ID único para documento
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   * @returns {string} ID único
   */
  _generateDocId(userId, documentId) {
    return `${userId}_${documentId}`;
  }

  /**
   * Salva ou atualiza um documento
   * @param {string} userId - ID do usuário
   * @param {Object} documentData - Dados do documento
   */
  async saveDocument(userId, documentData) {
    try {
      const docId = this._generateDocId(userId, documentData.documentId);

      return await this.save(docId, {
        userId,
        ...documentData
      }, { merge: true });
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  /**
   * Obtém um documento
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   */
  async getDocument(userId, documentId) {
    try {
      const docId = this._generateDocId(userId, documentId);
      return await this.get(docId);
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Obtém documentos recentes do usuário
   * @param {string} userId - ID do usuário
   * @param {number} limitCount - Número máximo de documentos
   */
  async getRecentDocuments(userId, limitCount = 10) {
    try {
      return await this.find(
        [['userId', '==', userId]],
        {
          orderBy: ['lastAccess', 'desc'],
          limit: limitCount
        }
      );
    } catch (error) {
      console.error('Error getting recent documents:', error);
      throw error;
    }
  }

  /**
   * Atualiza marcadores de um documento
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   * @param {Array} bookmarks - Array de marcadores
   */
  async updateBookmarks(userId, documentId, bookmarks) {
    try {
      const docId = this._generateDocId(userId, documentId);
      return await this.update(docId, { bookmarks });
    } catch (error) {
      console.error('Error updating bookmarks:', error);
      throw error;
    }
  }

  /**
   * Deleta um documento
   * @param {string} userId - ID do usuário
   * @param {string} documentId - ID do documento
   */
  async deleteDocument(userId, documentId) {
    try {
      const docId = this._generateDocId(userId, documentId);
      return await this.delete(docId);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

// Singleton instance
const documentsService = new DocumentsService();
export default documentsService;
