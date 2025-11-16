import CryptoJS from 'crypto-js';

/**
 * Serviço de Encriptação
 *
 * Responsabilidade Única (SRP): Gerenciar encriptação/decriptação de dados sensíveis
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas encriptação/decriptação
 * - Dependency Inversion: Depende de abstração (CryptoJS), não de implementação concreta
 */
class EncryptionService {
  constructor(encryptionKey) {
    if (!encryptionKey) {
      throw new Error('Encryption key is required');
    }
    this.encryptionKey = encryptionKey;
  }

  /**
   * Encripta um texto usando AES
   * @param {string} text - Texto a ser encriptado
   * @returns {string} Texto encriptado
   */
  encrypt(text) {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  /**
   * Decripta um texto encriptado
   * @param {string} ciphertext - Texto encriptado
   * @returns {string} Texto decriptado
   */
  decrypt(ciphertext) {
    if (!ciphertext) {
      throw new Error('Ciphertext to decrypt cannot be empty');
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// Singleton instance
const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-me';
const encryptionService = new EncryptionService(encryptionKey);

export default encryptionService;
