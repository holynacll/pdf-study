# Refatoração - Clean Code & SOLID

Este documento descreve a refatoração realizada no projeto PDF Study para seguir os princípios SOLID e boas práticas de Clean Code.

## 📋 Problemas Identificados

### 1. Violações de SOLID

#### **App.jsx (1,773 linhas)**
- **Violação massiva do SRP**: Um único componente gerenciava PDF, Chat, UI, Settings, Autenticação
- **God Object Anti-Pattern**: Componente sabia e fazia demais
- **Difícil de testar**: Código monolítico impossível de testar unitariamente
- **Alto acoplamento**: Lógica de negócio misturada com apresentação

#### **firestore.service.js (234 linhas)**
- **Violação do SRP**: Gerenciava API Keys, Documentos, Conversas, Preferências e Encriptação
- **Violação do OCP**: Para adicionar nova entidade, era necessário modificar o arquivo
- **Falta de abstração**: Funções soltas sem organização

#### **AuthContext.jsx**
- **Violação do SRP**: Misturava autenticação com persistência de dados
- **Lógica de negócio no Context**: Deveria apenas gerenciar estado

---

## ✅ Refatoração Realizada

### 1. **Estrutura de Serviços (SRP + DIP)**

#### Antes:
```javascript
// firestore.service.js - tudo em um arquivo
export const saveApiKey = async (userId, provider, apiKey, modelName) => { ... }
export const getDocument = async (userId, documentId) => { ... }
export const saveConversation = async (userId, documentId, messages) => { ... }
const encrypt = (text) => { ... }
```

#### Depois:
```
services/
├── encryption/
│   └── encryption.service.js          # SRP: Apenas encriptação
├── api-keys/
│   └── api-keys.service.js            # SRP: Apenas API keys
├── documents/
│   └── documents.service.js           # SRP: Apenas documentos
├── conversations/
│   └── conversations.service.js       # SRP: Apenas conversas
├── users/
│   └── users.service.js               # SRP: Apenas usuários
├── auth/
│   └── auth.service.js                # SRP: Apenas autenticação
├── firestore/
│   └── firestore.repository.js        # Base repository (DIP)
└── index.js                           # Barrel export
```

**Princípios aplicados:**
- ✅ **SRP**: Cada serviço tem uma única responsabilidade
- ✅ **OCP**: Novos serviços podem ser adicionados sem modificar existentes
- ✅ **DIP**: Todos estendem FirestoreRepository (abstração)

---

### 2. **Factory Pattern para LLM Providers (OCP)**

#### Antes:
```javascript
// Hardcoded no App.jsx
const llmProviders = {
  anthropic: { ... },
  openai: { ... },
  google: { ... }
};

// Lógica de chamada espalhada no código
if (provider === 'anthropic') { ... }
else if (provider === 'openai') { ... }
```

#### Depois:
```
services/llm/
├── llm-client.interface.js       # Interface base (ISP)
├── anthropic-client.js           # Implementação Anthropic (LSP)
├── openai-client.js              # Implementação OpenAI (LSP)
├── google-client.js              # Implementação Google (LSP)
└── llm-client.factory.js         # Factory (OCP + DIP)
```

**Código:**
```javascript
// Interface base
class LLMClient {
  async sendMessage(messages, options = {}) {
    throw new Error('Método deve ser implementado');
  }
}

// Factory
class LLMClientFactory {
  createClient(provider, apiKey, modelName) {
    const ClientClass = this.providers[provider];
    return new ClientClass(apiKey, modelName);
  }
}

// Uso
const client = llmClientFactory.createClient('anthropic', apiKey, modelName);
const response = await client.sendMessage(messages);
```

**Princípios aplicados:**
- ✅ **OCP**: Adicionar novo provider não requer modificar código existente
- ✅ **LSP**: Qualquer implementação pode substituir a interface base
- ✅ **ISP**: Interface mínima e focada
- ✅ **DIP**: Componentes dependem da abstração LLMClient

---

### 3. **Hooks Customizados (SRP + Separation of Concerns)**

#### Antes:
```javascript
// App.jsx - tudo no componente
const [pdfDoc, setPdfDoc] = useState(null);
const [messages, setMessages] = useState([]);
const [darkMode, setDarkMode] = useState(false);
// ... 50+ estados e funções
```

#### Depois:
```
hooks/
├── usePDF.js                  # SRP: Lógica de PDF
├── useChat.js                 # SRP: Lógica de chat
├── useKeyboardShortcuts.js    # SRP: Atalhos de teclado
├── useDarkMode.js             # SRP: Tema
└── index.js
```

**Exemplo - usePDF:**
```javascript
const usePDF = () => {
  // Estado e lógica de PDF centralizada
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPDF = useCallback(async (file) => { ... });
  const renderPage = useCallback(async (pageNum) => { ... });

  return {
    pdfDoc,
    currentPage,
    loadPDF,
    renderPage,
    // ... outras funções
  };
};
```

**Exemplo - useChat:**
```javascript
const useChat = (userId, documentId) => {
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback(async (pageContext) => {
    const client = llmClientFactory.createClient(provider, apiKey, model);
    const response = await client.sendMessage(messages);
    // ...
  });

  return { messages, sendMessage, ... };
};
```

**Princípios aplicados:**
- ✅ **SRP**: Cada hook tem uma única responsabilidade
- ✅ **Separation of Concerns**: Lógica separada da apresentação
- ✅ **DRY**: Elimina código duplicado

---

### 4. **Constantes Centralizadas**

#### Antes:
```javascript
// Espalhado pelo código
const scale = 1.5;
const storageKey = 'pdf-sage-dark-mode';
const llmProviders = { ... };
```

#### Depois:
```
constants/
├── app-config.js          # Configurações gerais
├── llm-providers.js       # Configurações de LLMs
└── keyboard-shortcuts.js  # Atalhos de teclado
```

**Benefícios:**
- ✅ Fácil manutenção
- ✅ Única fonte de verdade
- ✅ Type-safety com JSDoc

---

### 5. **AuthContext Refatorado (SRP)**

#### Antes:
```javascript
const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  // Lógica de persistência no Context
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, { ... });
};
```

#### Depois:
```javascript
// AuthContext - apenas gerencia estado
const loginWithGoogle = async () => {
  return await authService.loginWithGoogle();
};

// authService - lógica de negócio
class AuthService {
  async loginWithGoogle() {
    const result = await signInWithPopup(this.auth, this.googleProvider);
    const userExists = await this.usersService.userExists(user.uid);
    // ... lógica de persistência
  }
}
```

**Princípios aplicados:**
- ✅ **SRP**: Context gerencia estado, Service gerencia lógica
- ✅ **DIP**: Context depende de abstração (authService)

---

## 📊 Comparação Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **App.jsx** | 1,773 linhas | ~300 linhas (estimado) |
| **firestore.service.js** | 234 linhas | 6 serviços separados |
| **Serviços** | 1 arquivo monolítico | 7 serviços especializados |
| **Testabilidade** | Baixa | Alta |
| **Manutenibilidade** | Baixa | Alta |
| **Extensibilidade** | Difícil | Fácil |
| **Acoplamento** | Alto | Baixo |
| **Coesão** | Baixa | Alta |

---

## 🎯 Princípios SOLID Aplicados

### ✅ **S - Single Responsibility Principle**
- Cada classe/função tem uma única razão para mudar
- Serviços especializados (ApiKeysService, DocumentsService, etc.)
- Hooks focados (usePDF, useChat, etc.)

### ✅ **O - Open/Closed Principle**
- LLMClientFactory permite adicionar novos providers sem modificar código
- FirestoreRepository permite novos repositórios sem modificação

### ✅ **L - Liskov Substitution Principle**
- Qualquer LLMClient pode ser usado onde a interface é esperada
- Todos os serviços podem substituir FirestoreRepository

### ✅ **I - Interface Segregation Principle**
- LLMClient define apenas métodos essenciais
- Interfaces mínimas e focadas

### ✅ **D - Dependency Inversion Principle**
- Componentes dependem de abstrações (services, factories)
- Não dependem de implementações concretas

---

## 📦 Como Usar os Novos Serviços

### Importar serviços:
```javascript
import {
  apiKeysService,
  documentsService,
  conversationsService,
  usersService,
  authService
} from '../services';
```

### Usar LLM Factory:
```javascript
import llmClientFactory from '../services/llm/llm-client.factory';

const client = llmClientFactory.createClient('anthropic', apiKey, 'claude-sonnet-4');
const response = await client.sendMessage(messages);
```

### Usar hooks:
```javascript
import { usePDF, useChat, useDarkMode } from '../hooks';

const MyComponent = () => {
  const { pdfDoc, loadPDF, nextPage } = usePDF();
  const { messages, sendMessage } = useChat(userId, documentId);
  const [darkMode, toggleDarkMode] = useDarkMode();

  // ...
};
```

---

## 🚀 Próximos Passos

Para completar a refatoração:

1. ✅ Criar estrutura de diretórios
2. ✅ Extrair constantes
3. ✅ Criar serviços especializados
4. ✅ Implementar Factory Pattern
5. ✅ Criar hooks customizados
6. ✅ Refatorar AuthContext
7. ⏳ Atualizar App.jsx para usar novos hooks e serviços
8. ⏳ Criar componentes React menores (PDFViewer, ChatPanel, etc.)
9. ⏳ Testes unitários
10. ⏳ Documentação de API

---

## 📖 Referências

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring - Martin Fowler](https://refactoring.com/)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

**Data da refatoração:** 2025-11-16
**Versão:** 0.2.0
