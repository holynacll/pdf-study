import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Repositório Base do Firestore
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Gerencia apenas operações CRUD do Firestore
 * - Open/Closed: Aberto para extensão (subclasses), fechado para modificação
 * - Dependency Inversion: Componentes dependem desta abstração, não de implementações concretas
 *
 * Esta classe base implementa o padrão Repository, abstraindo a lógica de acesso a dados
 */
class FirestoreRepository {
  constructor(collectionName) {
    if (!collectionName) {
      throw new Error('Collection name is required');
    }
    this.collectionName = collectionName;
    this.db = db;
  }

  /**
   * Cria ou atualiza um documento
   * @param {string} docId - ID do documento
   * @param {Object} data - Dados a serem salvos
   * @param {Object} options - Opções adicionais
   */
  async save(docId, data, options = {}) {
    try {
      const docRef = doc(this.db, this.collectionName, docId);
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp()
      };

      if (!options.merge && !options.skipCreatedAt) {
        dataWithTimestamp.createdAt = serverTimestamp();
      }

      await setDoc(docRef, dataWithTimestamp, { merge: options.merge || false });
      return true;
    } catch (error) {
      console.error(`Error saving document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Obtém um documento por ID
   * @param {string} docId - ID do documento
   * @returns {Object|null} Dados do documento ou null
   */
  async get(docId) {
    try {
      const docRef = doc(this.db, this.collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error(`Error getting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza campos específicos de um documento
   * @param {string} docId - ID do documento
   * @param {Object} data - Dados a serem atualizados
   */
  async update(docId, data) {
    try {
      const docRef = doc(this.db, this.collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error(`Error updating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um documento
   * @param {string} docId - ID do documento
   */
  async delete(docId) {
    try {
      const docRef = doc(this.db, this.collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Busca documentos com filtros
   * @param {Array} filters - Array de filtros [campo, operador, valor]
   * @param {Object} options - Opções de ordenação e limite
   */
  async find(filters = [], options = {}) {
    try {
      const constraints = [collection(this.db, this.collectionName)];

      filters.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });

      if (options.orderBy) {
        const [field, direction = 'asc'] = options.orderBy;
        constraints.push(orderBy(field, direction));
      }

      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error finding documents in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Inscreve-se para atualizações em tempo real
   * @param {Array} filters - Array de filtros
   * @param {Function} callback - Função de callback
   */
  subscribe(filters = [], callback) {
    try {
      const constraints = [collection(this.db, this.collectionName)];

      filters.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });

      const q = query(...constraints);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      });

      return unsubscribe;
    } catch (error) {
      console.error(`Error subscribing to ${this.collectionName}:`, error);
      throw error;
    }
  }
}

export default FirestoreRepository;
