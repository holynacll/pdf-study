# 🔥 Guia de Implementação - Firebase & Firestore

## 📋 Índice
1. [Configuração Inicial do Firebase](#1-configuração-inicial-do-firebase)
2. [Instalação de Dependências](#2-instalação-de-dependências)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Implementação da Autenticação](#4-implementação-da-autenticação)
5. [Configuração do Firestore](#5-configuração-do-firestore)
6. [Migração de Dados](#6-migração-de-dados)
7. [Regras de Segurança](#7-regras-de-segurança)
8. [Testes](#8-testes)

---

## 1. Configuração Inicial do Firebase

### 1.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `pdf-sage` (ou o que preferir)
4. Desabilite Google Analytics (opcional para MVP)
5. Clique em "Criar projeto"

### 1.2 Adicionar App Web

1. No painel do projeto, clique no ícone Web `</>`
2. Apelido do app: `PDF Sage Web`
3. **NÃO** marque Firebase Hosting (por enquanto)
4. Clique em "Registrar app"
5. **COPIE** as credenciais do Firebase (você vai precisar)

```javascript
// Exemplo de credenciais (NÃO COMMITAR)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "pdf-sage-xxxxx.firebaseapp.com",
  projectId: "pdf-sage-xxxxx",
  storageBucket: "pdf-sage-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 1.3 Habilitar Authentication

1. No menu lateral, vá em **Authentication**
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Clique em **Google**
5. Ative o toggle "Enable"
6. Configure:
   - Nome público do projeto: `PDF Sage`
   - Email de suporte: seu email
7. Clique em "Salvar"

### 1.4 Habilitar Firestore Database

1. No menu lateral, vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Modo: **Produção** (vamos configurar regras depois)
4. Localização: `southamerica-east1` (São Paulo) ou `us-central1`
5. Clique em "Ativar"

---

## 2. Instalação de Dependências

```bash
# Firebase SDK
npm install firebase

# React Firebase Hooks (facilita integração)
npm install react-firebase-hooks

# React Router (para navegação /login, /app)
npm install react-router-dom

# Crypto (opcional, para encriptar API keys)
npm install crypto-js

# Dotenv (para variáveis de ambiente)
npm install dotenv
```

---

## 3. Estrutura de Arquivos

```
src/
├── config/
│   └── firebase.js              # Configuração Firebase
├── contexts/
│   └── AuthContext.jsx          # Contexto de autenticação
├── services/
│   ├── auth.service.js          # Serviços de autenticação
│   └── firestore.service.js     # Serviços do Firestore
├── pages/
│   ├── Login.jsx                # Página de login
│   └── App.jsx                  # App principal (renomear atual)
├── components/
│   ├── PrivateRoute.jsx         # Rota protegida
│   └── PDFViewer.jsx            # Componente do viewer
├── hooks/
│   └── useFirestore.js          # Hook customizado Firestore
├── utils/
│   └── crypto.js                # Funções de encriptação
├── main.jsx                     # Entry point com Router
└── .env.local                   # Variáveis de ambiente (NÃO COMMITAR)
```

---

## 4. Implementação da Autenticação

### 4.1 Criar `.env.local`

```env
# .env.local (NÃO COMMITAR - adicionar ao .gitignore)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=pdf-sage-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pdf-sage-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=pdf-sage-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 4.2 Atualizar `.gitignore`

```bash
# Adicionar no .gitignore
.env.local
.env
```

### 4.3 Configurar Firebase (`src/config/firebase.js`)

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configurações opcionais
googleProvider.setCustomParameters({
  prompt: 'select_account' // Força seleção de conta
});

export default app;
```

### 4.4 Criar Contexto de Autenticação (`src/contexts/AuthContext.jsx`)

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Criar/atualizar documento do usuário no Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Primeiro login - criar documento
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          preferences: {
            theme: 'light',
            defaultZoom: 1.5,
            defaultLLM: 'anthropic'
          }
        });
      } else {
        // Atualizar último login
        await setDoc(userRef, {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }

      return user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  // Observar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 4.5 Criar Página de Login (`src/pages/Login.jsx`)

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Loader2 } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/app');
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Falha ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PDF Sage</h1>
          <p className="text-gray-600">
            Leitura inteligente de PDFs com IA
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Bem-vindo!
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span className="font-medium text-gray-700">Entrando...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700">Entrar com Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Ao entrar, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-xs text-gray-600">Chat com IA</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🌍</div>
            <p className="text-xs text-gray-600">Tradução</p>
          </div>
          <div>
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xs text-gray-600">Análise</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### 4.6 Criar PrivateRoute (`src/components/PrivateRoute.jsx`)

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
```

### 4.7 Atualizar `src/main.jsx` com Router

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import App from './App'; // Renomear para PDFApp ou mover para pages/
import PrivateRoute from './components/PrivateRoute';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 5. Configuração do Firestore

### 5.1 Criar Serviço Firestore (`src/services/firestore.service.js`)

```javascript
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

// ==================== PREFERÊNCIAS ====================

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp()
    });
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

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToDocument = (userId, documentId, callback) => {
  const docRef = doc(db, 'documents', `${userId}_${documentId}`);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const subscribeToConversation = (userId, documentId, callback) => {
  const convRef = doc(db, 'conversations', `${userId}_${documentId}`);
  return onSnapshot(convRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().messages);
    }
  });
};
```

---

## 6. Migração de Dados

### 6.1 Remover LocalStorage do App.jsx

**Remover:**
```javascript
// REMOVER ESTAS LINHAS
const [apiKey, setApiKey] = useState('');
const [llmProvider, setLlmProvider] = useState('anthropic');
const [modelName, setModelName] = useState('claude-sonnet-4-20250514');
```

**Substituir por:**
```javascript
import { useAuth } from './contexts/AuthContext';
import { getApiKey, saveApiKey } from './services/firestore.service';

const { currentUser } = useAuth();
const [apiKey, setApiKey] = useState('');
const [llmProvider, setLlmProvider] = useState('anthropic');
const [modelName, setModelName] = useState('claude-sonnet-4-20250514');

// Carregar API key do Firestore ao montar
useEffect(() => {
  if (currentUser) {
    loadApiKey();
  }
}, [currentUser, llmProvider]);

const loadApiKey = async () => {
  try {
    const keyData = await getApiKey(currentUser.uid, llmProvider);
    if (keyData) {
      setApiKey(keyData.apiKey);
      setModelName(keyData.modelName);
      setApiKeyValid(keyData.isValid);
    }
  } catch (error) {
    console.error('Erro ao carregar API key:', error);
  }
};

// Salvar API key no Firestore após validação
const validateApiKey = async () => {
  // ... código de validação existente ...

  if (isValid) {
    // Salvar no Firestore
    await saveApiKey(currentUser.uid, llmProvider, apiKey, modelName);
  }

  setApiKeyValid(isValid);
};
```

---

## 7. Regras de Segurança

### 7.1 Configurar Regras no Firebase Console

1. Vá em **Firestore Database** > **Regras**
2. Cole as regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }

    // Função para verificar se é o próprio usuário
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // USUÁRIOS - apenas o próprio pode ler/escrever
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // API KEYS - apenas o próprio pode ler/escrever
    match /api_keys/{keyId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // DOCUMENTOS - apenas o próprio pode ler/escrever
    match /documents/{docId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // CONVERSAS - apenas o próprio pode ler/escrever
    match /conversations/{convId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }

    // Negar tudo que não foi explicitamente permitido
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clique em **Publicar**

### 7.2 Testar Regras

```javascript
// Teste no console do Firebase (simulador de regras)
// Como usuário autenticado (auth.uid = 'test-user-123')
get /databases/(default)/documents/users/test-user-123   // ✅ PERMITIDO
get /databases/(default)/documents/users/other-user-456  // ❌ NEGADO

// Como usuário não autenticado
get /databases/(default)/documents/users/test-user-123   // ❌ NEGADO
```

---

## 8. Testes

### 8.1 Checklist de Testes

**Autenticação:**
- [ ] Login com Google funciona
- [ ] Dados do usuário são salvos no Firestore
- [ ] Logout funciona corretamente
- [ ] Redirecionamento para /login quando não autenticado
- [ ] Redirecionamento para /app quando autenticado

**Firestore:**
- [ ] API Keys são salvas encriptadas
- [ ] API Keys são carregadas e decriptadas corretamente
- [ ] Marcadores são salvos por documento
- [ ] Conversas são persistidas
- [ ] Documentos recentes aparecem
- [ ] Sincronização em tempo real funciona

**Segurança:**
- [ ] Usuário não consegue acessar dados de outros usuários
- [ ] API Keys não aparecem em texto plano no Firestore
- [ ] Regras de segurança bloqueiam acesso não autorizado
- [ ] Credenciais Firebase não estão no código (apenas .env)

### 8.2 Comandos de Teste

```bash
# Rodar aplicação
npm run dev

# Testar fluxo completo:
# 1. Acessar http://localhost:5173
# 2. Deve redirecionar para /login
# 3. Clicar em "Entrar com Google"
# 4. Selecionar conta
# 5. Deve redirecionar para /app
# 6. Verificar se dados aparecem

# Verificar Firestore no console Firebase
# - Coleção users deve ter documento do usuário
# - Coleção api_keys deve estar vazia inicialmente

# Configurar API key
# - Deve salvar em api_keys com dados encriptados

# Fazer logout e login novamente
# - API key deve ser carregada automaticamente
```

---

## 9. Troubleshooting

### Problema: "Firebase App not initialized"
**Solução:** Verificar se firebase.js está sendo importado corretamente

### Problema: "Missing or insufficient permissions"
**Solução:** Verificar regras de segurança no Firestore

### Problema: Variáveis de ambiente não carregam
**Solução:**
- Verificar se arquivo é `.env.local` (não `.env`)
- Reiniciar servidor Vite (`npm run dev`)
- Variáveis devem começar com `VITE_`

### Problema: Login com Google abre popup mas não funciona
**Solução:**
- Verificar se domínio está autorizado no Firebase Console
- Authentication > Settings > Authorized domains
- Adicionar `localhost` e domínio de produção

### Problema: API Key não persiste
**Solução:**
- Verificar se `saveApiKey` está sendo chamado após validação
- Verificar console para erros do Firestore
- Verificar regras de segurança

---

## 10. Próximos Passos

Após implementar Firebase:

1. ✅ Testar exaustivamente autenticação
2. ✅ Migrar todos os dados de localStorage
3. ✅ Adicionar botão de logout na UI
4. ✅ Implementar perfil do usuário (nome, foto)
5. ✅ Adicionar loading states
6. ✅ Implementar tratamento de erros
7. 🔜 Prosseguir para FASE 1 do planejamento

---

**Documentação Oficial:**
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

**Suporte:**
- [Firebase Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community](https://firebase.google.com/community)

---

**Última atualização**: 2025-11-09
**Status**: Pronto para implementação
