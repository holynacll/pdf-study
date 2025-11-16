import { serverTimestamp } from 'firebase/firestore';
import FirestoreRepository from '../firestore/firestore.repository';
import { FIRESTORE_COLLECTIONS } from '../../constants/app-config';

/**
 * Serviço de Usuários
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas dados de usuários e suas preferências
 * - Open/Closed: Estende FirestoreRepository sem modificá-lo
 * - Liskov Substitution: Pode ser usado onde FirestoreRepository é esperado
 * - Dependency Inversion: Depende da abstração FirestoreRepository
 */
class UsersService extends FirestoreRepository {
  constructor() {
    super(FIRESTORE_COLLECTIONS.USERS);
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   */
  async createUser(userData) {
    try {
      const { uid, email, displayName, photoURL } = userData;

      const defaultPreferences = {
        theme: 'light',
        defaultZoom: 1.5,
        defaultLLM: 'anthropic'
      };

      return await this.save(uid, {
        uid,
        email,
        displayName,
        photoURL,
        preferences: defaultPreferences,
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Obtém dados do usuário
   * @param {string} userId - ID do usuário
   */
  async getUser(userId) {
    try {
      return await this.get(userId);
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Atualiza último login do usuário
   * @param {string} userId - ID do usuário
   */
  async updateLastLogin(userId) {
    try {
      return await this.update(userId, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Atualiza preferências do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} preferences - Objeto com preferências
   */
  async updatePreferences(userId, preferences) {
    try {
      return await this.update(userId, {
        preferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Obtém preferências do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object|null} Preferências do usuário
   */
  async getPreferences(userId) {
    try {
      const userData = await this.get(userId);
      return userData ? userData.preferences : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário existe
   * @param {string} userId - ID do usuário
   * @returns {boolean} True se existe
   */
  async userExists(userId) {
    try {
      const userData = await this.get(userId);
      return !!userData;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }
}

// Singleton instance
const usersService = new UsersService();
export default usersService;
