# 📚 PDF Sage - Leitura Inteligente com IA

![Version](https://img.shields.io/badge/version-0.1.5-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.0-FFCA28?logo=firebase)

Plataforma web moderna para leitura e análise inteligente de documentos PDF com IA integrada.

## ✨ Funcionalidades

### 📖 Visualização de PDF
- ✅ Renderização de alta qualidade com PDF.js
- ✅ Navegação rápida entre páginas
- ✅ Zoom e rotação
- ✅ Modo página única e dupla (modo livro)
- ✅ Sistema de miniaturas
- ✅ Busca avançada no documento
- ✅ Marcadores personalizados
- ✅ Seleção de texto com camada de texto

### 🤖 Assistente IA
- ✅ Chat integrado com contexto do documento
- ✅ Suporte a múltiplos provedores:
  - Anthropic (Claude)
  - OpenAI (GPT)
  - Google (Gemini)
- ✅ Prompts especializados
- ✅ Resumo automático
- ✅ Explicação de conceitos

### 🔐 Segurança
- ✅ Autenticação Firebase/Google
- ✅ API Keys encriptadas no Firestore
- ✅ Dados isolados por usuário
- ✅ Regras de segurança rigorosas

### 🎨 Interface
- ✅ Design moderno e responsivo
- ✅ Modo claro/escuro
- ✅ Drag & drop de arquivos
- ✅ Atalhos de teclado
- ✅ Notificações elegantes

---

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- npm ou yarn
- Conta Firebase ([Criar](https://console.firebase.google.com/))

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/seu-usuario/pdf-sage.git
cd pdf-sage
```

### Passo 2: Instale as Dependências

```bash
npm install
```

### Passo 3: Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication (Google Sign-In)
3. Ative Firestore Database
4. Copie as credenciais

### Passo 4: Configure Variáveis de Ambiente

```bash
# Copie o template
cp .env.example .env.local

# Edite com suas credenciais
nano .env.local
```

Exemplo do `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_ENCRYPTION_KEY=sua-chave-secreta-aleatoria-aqui
```

### Passo 5: Configure Regras do Firestore

No Firebase Console > Firestore > Regras, cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    match /api_keys/{keyId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }
    
    match /documents/{docId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }
    
    match /conversations/{convId} {
      allow read, write: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Passo 6: Inicie o Servidor

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🔑 Configurar API Keys de IA

### Anthropic (Claude)

1. Acesse [console.anthropic.com](https://console.anthropic.com/)
2. Crie uma API Key
3. Cole no app em Config > Anthropic

### OpenAI (GPT)

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma API Key
3. Cole no app em Config > OpenAI

### Google (Gemini)

1. Acesse [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Crie uma API Key
3. Cole no app em Config > Google

---

## 🎯 Como Usar

### 1. Faça Login

- Clique em "Entrar com Google"
- Autorize o app

### 2. Abra um PDF

- Clique em "Abrir PDF" ou
- Arraste e solte um arquivo

### 3. Configure a IA (primeira vez)

- Clique em "Config"
- Escolha o provedor (Claude, GPT ou Gemini)
- Cole sua API Key
- Clique em "Validar"

### 4. Explore!

- **Navegue** com setas ou clique nas miniaturas
- **Busque** com Ctrl+F
- **Marque** páginas com Ctrl+B
- **Converse** com a IA sobre o conteúdo
- **Selecione** texto para enviar ao chat

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `←` / `→` | Página anterior/próxima |
| `Home` | Primeira página |
| `End` | Última página |
| `Ctrl` + `+` / `-` | Zoom in/out |
| `Ctrl` + `0` | Zoom padrão |
| `Ctrl` + `F` | Buscar |
| `Ctrl` + `K` | Abrir chat |
| `Ctrl` + `B` | Adicionar marcador |
| `Esc` | Fechar busca/fullscreen |
| `?` ou `F1` | Atalhos |

---

## 📁 Estrutura do Projeto

```
pdf-sage/
├── src/
│   ├── components/       # Componentes React
│   │   └── PrivateRoute.jsx
│   ├── config/          # Configurações
│   │   └── firebase.js
│   ├── contexts/        # Contexts do React
│   │   └── AuthContext.jsx
│   ├── pages/           # Páginas
│   │   ├── App.jsx
│   │   └── Login.jsx
│   ├── services/        # Serviços (API, Firestore)
│   │   └── firestore.service.js
│   ├── index.css        # Estilos globais
│   └── main.jsx         # Entry point
├── .env.local           # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example         # Template de variáveis
├── package.json         # Dependências
├── tailwind.config.js   # Config Tailwind
├── vite.config.js       # Config Vite
└── README.md
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18.3** - Framework UI
- **Vite 5.4** - Build tool
- **Tailwind CSS 3.4** - Estilos
- **Lucide React** - Ícones
- **Sonner** - Notificações

### Backend & Cloud
- **Firebase 11** - Backend as a Service
- **Firestore** - Banco de dados NoSQL
- **Firebase Auth** - Autenticação

### Bibliotecas
- **PDF.js** - Renderização de PDFs
- **React Router** - Roteamento
- **CryptoJS** - Encriptação

---

## 🐛 Troubleshooting

### Estilos não aparecem

```bash
# Limpe o cache
rm -rf node_modules/.vite
npm run dev
```

### Ícones não renderizam

```bash
# Reinstale lucide-react
npm install lucide-react
```

### Firebase não conecta

1. Verifique `.env.local`
2. Certifique-se que variáveis começam com `VITE_`
3. Reinicie o servidor

### Build falha

```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Performance

- **Load Time**: < 3s
- **FCP**: < 1.5s
- **TTI**: < 3.5s
- **Lighthouse Score**: > 90

---

## 🔐 Segurança

- ✅ API Keys encriptadas (AES)
- ✅ Credenciais em variáveis de ambiente
- ✅ Regras de segurança Firestore
- ✅ Dados isolados por usuário
- ✅ HTTPS obrigatório em produção

---

## 🚀 Deploy

### Vercel

```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure variáveis de ambiente no dashboard
```

### Netlify

```bash
# Instale Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure variáveis de ambiente no dashboard
```

---

## 📝 Roadmap

### v0.2.0 - UX Aprimorada (Em breve)
- [ ] Drag & drop melhorado
- [ ] Notificações ricas
- [ ] Animações suaves
- [ ] Loading skeletons

### v0.3.0 - Tradução Dedicada
- [ ] Modal de tradução
- [ ] Tradução de seleção

### v1.0.0 - Lançamento Público
- [ ] Testes completos
- [ ] Documentação final
- [ ] Marketing
- [ ] Lançamento oficial

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu@email.com

---

## 🙏 Agradecimentos

- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Anthropic](https://www.anthropic.com/)
- [OpenAI](https://openai.com/)
- [Google AI](https://ai.google.dev/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/)

---

**PDF Sage** © 2024 - Leitura Inteligente com IA

