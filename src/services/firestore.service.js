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
import { db } from '../config/firebase';
import CryptoJS from 'crypto-js';

// Chave de encriptação (deve estar em variável de ambiente)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-me';

// Funções de encriptação
const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ==================== API KEYS ====================

export const saveApiKey = async (userId, provider, apiKey, modelName) => {
  try {
    const keyRef = doc(db, 'api_keys', `${userId}_${provider}`);
    await setDoc(keyRef, {
      userId,
      provider,
      apiKey: encrypt(apiKey), // Encriptar
      modelName,
      isValid: true,
      lastValidated: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erro ao salvar API key:', error);
    throw error;
  }
};

export const getApiKey = async (userId, provider) => {
  try {
    const keyRef = doc(db, 'api_keys', `${userId}_${provider}`);
    const keySnap = await getDoc(keyRef);

    if (keySnap.exists()) {
      const data = keySnap.data();
      return {
        ...data,
        apiKey: decrypt(data.apiKey) // Decriptar
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter API key:', error);
    throw error;
  }
};

export const deleteApiKey = async (userId, provider) => {
  try {
    const keyRef = doc(db, 'api_keys', `${userId}_${provider}`);
    await deleteDoc(keyRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar API key:', error);
    throw error;
  }
};

// ==================== DOCUMENTOS ====================

export const saveDocument = async (userId, documentData) => {
  try {
    const docRef = doc(db, 'documents', `${userId}_${documentData.documentId}`);
    await setDoc(docRef, {
      userId,
      ...documentData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    throw error;
  }
};

export const getDocument = async (userId, documentId) => {
  try {
    const docRef = doc(db, 'documents', `${userId}_${documentId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    throw error;
  }
};

export const getRecentDocuments = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('lastAccess', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Erro ao obter documentos recentes:', error);
    throw error;
  }
};

// ==================== MARCADORES ====================

export const updateBookmarks = async (userId, documentId, bookmarks) => {
  try {
    const docRef = doc(db, 'documents', `${userId}_${documentId}`);
    await updateDoc(docRef, {
      bookmarks,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar marcadores:', error);
    throw error;
  }
};

// ==================== CONVERSAS ====================

export const saveConversation = async (userId, documentId, messages) => {
  try {
    const convRef = doc(db, 'conversations', `${userId}_${documentId}`);
    await setDoc(convRef, {
      userId,
      documentId,
      messages,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar conversa:', error);
    throw error;
  }
};

export const getConversation = async (userId, documentId) => {
  try {
    const convRef = doc(db, 'conversations', `${userId}_${documentId}`);
    const convSnap = await getDoc(convRef);
    return convSnap.exists() ? convSnap.data().messages : [];
  } catch (error) {
    console.error('Erro ao obter conversa:', error);
    throw error;
  }
};

export const deleteConversation = async (userId, documentId) => {
  try {
    const convRef = doc(db, 'conversations', `${userId}_${documentId}`);
    await deleteDoc(convRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar conversa:', error);
    throw error;
  }
};

// ==================== PREFERÊNCIAS ====================

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    throw error;
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().preferences : null;
  } catch (error) {
    console.error('Erro ao obter preferências:', error);
    throw error;
  }
};

// ==================== LISTENER REALTIME ====================

export const subscribeToApiKeys = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'api_keys'),
      where('userId', '==', userId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const keys = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        keys[data.provider] = {
          ...data,
          apiKey: decrypt(data.apiKey)
        };
      });
      callback(keys);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Erro ao inscrever em API keys:', error);
    throw error;
  }
};
