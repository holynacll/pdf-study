import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import usersService from '../users/users.service';

/**
 * Serviço de Autenticação
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas autenticação
 * - Dependency Inversion: Depende da abstração UsersService
 *
 * Separa a lógica de autenticação da lógica de persistência
 */
class AuthService {
  constructor() {
    this.auth = auth;
    this.googleProvider = googleProvider;
    this.usersService = usersService;
  }

  /**
   * Faz login com Google
   * @returns {Object} Dados do usuário autenticado
   */
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      // Verificar se usuário já existe
      const userExists = await this.usersService.userExists(user.uid);

      if (!userExists) {
        // Primeiro login - criar documento
        await this.usersService.createUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        // Atualizar último login
        await this.usersService.updateLastLogin(user.uid);
      }

      return user;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  }

  /**
   * Faz logout
   */
  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Observa mudanças no estado de autenticação
   * @param {Function} callback - Função chamada quando estado muda
   * @returns {Function} Função para cancelar observação
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Obtém o usuário atual
   * @returns {Object|null} Usuário atual ou null
   */
  getCurrentUser() {
    return this.auth.currentUser;
  }
}

// Singleton instance
const authService = new AuthService();
export default authService;
