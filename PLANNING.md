# 📋 Planejamento de Desenvolvimento - PDF Sage

## 🎯 Visão Geral
Plataforma web para leitura e compreensão inteligente de documentos PDF, oferecendo uma experiência moderna, fluida e apoiada por inteligência artificial.

---

## 📊 Estado Atual do Projeto

### ✅ Funcionalidades Implementadas
- [x] Visualização de PDF com PDF.js
- [x] Navegação entre páginas (anterior, próxima, ir para página)
- [x] Controles de zoom e rotação
- [x] Modo de visualização única e dupla (modo livro)
- [x] Sistema de miniaturas (thumbnails)
- [x] Sistema de marcadores (bookmarks)
- [x] Busca no documento
- [x] Seleção de texto com camada de texto
- [x] Chat integrado com IA
- [x] Suporte a múltiplos provedores LLM (Claude, GPT, Gemini)
- [x] Configuração e validação de API keys
- [x] Interface responsiva com Tailwind CSS
- [x] Modo tela cheia
- [x] Atalhos de teclado básicos

---

## 🚀 Fases de Desenvolvimento

### **⚠️ FASE 0: Correção de Bugs e Infraestrutura Base** 🔧
> Prazo estimado: 3-5 dias | **PRIORIDADE CRÍTICA**

#### 0.1 Correção de Ícones e Elementos Visuais
- [ ] Verificar importação correta do lucide-react
- [ ] Testar renderização de todos os ícones na interface
- [ ] Corrigir ícones que não aparecem ou aparecem quebrados
- [ ] Validar que todos os componentes visuais estão renderizando
- [ ] Verificar console do navegador para erros
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Safari)
- [ ] Documentar ícones problemáticos e soluções aplicadas

#### 0.2 Autenticação com Firebase (Google) 🔐
- [ ] Criar projeto no Firebase Console
- [ ] Configurar Firebase Authentication
- [ ] Habilitar provedor Google Sign-In
- [ ] Instalar dependências: `firebase`, `react-firebase-hooks`
- [ ] Criar arquivo de configuração `src/config/firebase.js`
- [ ] Criar variáveis de ambiente (.env) para credenciais Firebase
- [ ] Implementar contexto de autenticação (`src/contexts/AuthContext.jsx`)
- [ ] Criar página de login (`src/pages/Login.jsx`)
- [ ] Implementar botão "Entrar com Google"
- [ ] Criar fluxo de logout
- [ ] Implementar Protected Routes (só autenticados acessam app)
- [ ] Adicionar loading state durante autenticação

#### 0.3 Configuração do Firestore 💾
- [ ] Habilitar Firestore Database no Firebase Console
- [ ] Definir regras de segurança do Firestore
- [ ] Criar coleções: `users`, `api_keys`, `documents`, `conversations`
- [ ] Estruturar schema de dados
- [ ] Implementar serviço de database (`src/services/firestore.service.js`)
- [ ] Criar funções CRUD para cada coleção

#### 0.4 Migração de LocalStorage para Firestore
- [ ] Remover armazenamento de API Keys do localStorage
- [ ] Implementar salvamento seguro de API Keys no Firestore
- [ ] Migrar configurações de LLM para Firestore
- [ ] Migrar marcadores para Firestore (por usuário + documento)
- [ ] Migrar histórico de conversas para Firestore
- [ ] Migrar documentos recentes para Firestore
- [ ] Implementar sincronização em tempo real (onSnapshot)
- [ ] Manter apenas preferências visuais em localStorage (tema, zoom)

#### 0.5 Roteamento
- [ ] Instalar React Router: `npm install react-router-dom`
- [ ] Configurar rotas principais: `/login`, `/app`
- [ ] Implementar PrivateRoute component
- [ ] Redirecionar usuários não autenticados para /login
- [ ] Redirecionar usuários autenticados para /app

**Estrutura de Dados Firestore:**
```javascript
// Coleção: users
{
  uid: "user-firebase-uid",
  email: "user@example.com",
  displayName: "Nome do Usuário",
  photoURL: "https://...",
  createdAt: Timestamp,
  lastLogin: Timestamp,
  preferences: {
    theme: "dark",
    defaultZoom: 1.5,
    defaultLLM: "anthropic"
  }
}

// Coleção: api_keys
{
  userId: "user-firebase-uid",
  provider: "anthropic",
  apiKey: "encrypted-key", // Considerar encriptação
  modelName: "claude-sonnet-4",
  isValid: true,
  lastValidated: Timestamp,
  createdAt: Timestamp
}

// Coleção: documents
{
  userId: "user-firebase-uid",
  documentId: "hash-do-pdf",
  fileName: "documento.pdf",
  fileSize: 1234567,
  lastPage: 42,
  lastAccess: Timestamp,
  bookmarks: [1, 10, 25, 42],
  createdAt: Timestamp
}

// Coleção: conversations
{
  userId: "user-firebase-uid",
  documentId: "hash-do-pdf",
  messages: [
    { role: "user", content: "...", timestamp: Timestamp },
    { role: "assistant", content: "...", timestamp: Timestamp }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Regras de Segurança Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /api_keys/{keyId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /documents/{docId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /conversations/{convId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

**Métricas de Sucesso:**
- ✅ Login com Google funciona perfeitamente
- ✅ API Keys nunca aparecem no localStorage
- ✅ Dados sincronizam em tempo real
- ✅ Apenas usuários autenticados acessam o app
- ✅ Regras de segurança impedem acesso não autorizado
- ✅ Todos os ícones renderizam corretamente

**Esforço Estimado**: 3-5 dias

---

### **FASE 1: Melhorias de UX/UI e Usabilidade** 🎨
> Prazo estimado: 1-2 semanas

#### 1.1 Sistema de Drag & Drop
- [ ] Implementar área de drop para upload de PDFs
- [ ] Adicionar indicadores visuais durante o arraste
- [ ] Validar tipos de arquivo durante o drop
- [ ] Mostrar preview do arquivo antes de carregar

#### 1.2 Feedback Visual Aprimorado
- [ ] Adicionar skeleton screens durante carregamento
- [ ] Implementar toasts/notificações para ações do usuário
- [ ] Melhorar indicadores de loading
- [ ] Adicionar animações de transição suaves
- [ ] Implementar estados de erro mais visuais

#### 1.3 Atalhos de Teclado Expandidos
- [ ] Criar painel de ajuda com todos os atalhos (? ou F1)
- [ ] Adicionar atalhos para marcadores (B para adicionar/remover)
- [ ] Atalho para alternar sidebar (Ctrl+\)
- [ ] Atalho para modo tela cheia (F11)
- [ ] Atalho para limpar histórico de chat (Ctrl+L)

#### 1.4 Melhorias de Acessibilidade
- [ ] Adicionar labels ARIA adequados
- [ ] Garantir navegação por teclado em todos os elementos
- [ ] Adicionar suporte a leitores de tela
- [ ] Melhorar contraste de cores
- [ ] Adicionar modo de alto contraste

---

### **FASE 2: Sistema de Tradução Aprimorado** 🌍
> Prazo estimado: 1-2 semanas

#### 2.1 Funcionalidade de Tradução Dedicada
- [ ] Criar botão específico para tradução na toolbar
- [ ] Implementar modal de tradução com opções de idioma
- [ ] Adicionar seletor de idioma de origem e destino
- [ ] Implementar tradução de texto selecionado
- [ ] Implementar tradução de página inteira
- [ ] Adicionar opção de tradução de múltiplas páginas

#### 2.2 Visualização de Tradução
- [ ] Criar modo de visualização lado a lado (original | tradução)
- [ ] Implementar highlight sincronizado entre original e tradução
- [ ] Adicionar opção de exportar tradução
- [ ] Criar histórico de traduções realizadas
- [ ] Implementar cache de traduções para evitar re-tradução

#### 2.3 Configurações de Tradução
- [ ] Adicionar preferências de idioma padrão
- [ ] Configurar tom da tradução (formal, casual, técnico)
- [ ] Opção de preservar formatação técnica (fórmulas, código)
- [ ] Glossário personalizado para termos específicos

---

### **FASE 3: Persistência de Dados e Estado** 💾
> Prazo estimado: 1-2 semanas

#### 3.1 LocalStorage/SessionStorage
- [ ] Implementar salvamento automático de configurações de LLM
- [ ] Salvar preferências de visualização (zoom, modo, tema)
- [ ] Persistir marcadores entre sessões
- [ ] Salvar histórico de documentos recentes
- [ ] Implementar restauração de última página visualizada

#### 3.2 Sistema de Histórico
- [ ] Criar painel de histórico de conversas
- [ ] Permitir exportar conversas (JSON, TXT, MD)
- [ ] Implementar busca no histórico de conversas
- [ ] Adicionar opção de limpar histórico
- [ ] Agrupar conversas por documento

#### 3.3 Gestão de Documentos
- [ ] Criar lista de documentos recentes
- [ ] Adicionar informações de último acesso
- [ ] Implementar favoritos de documentos
- [ ] Adicionar metadados dos PDFs (autor, data, título)
- [ ] Sistema de tags/categorias para documentos

---

### **FASE 4: Recursos Avançados de IA** 🤖
> Prazo estimado: 2-3 semanas

#### 4.1 Prompts Especializados
- [ ] Criar biblioteca de prompts predefinidos
- [ ] Implementar prompts para diferentes contextos (acadêmico, legal, técnico)
- [ ] Adicionar templates de perguntas por tipo de documento
- [ ] Sistema de prompts favoritos do usuário
- [ ] Permitir criação de prompts personalizados

#### 4.2 Análise de Documento
- [ ] Implementar resumo automático do documento completo
- [ ] Extração de tópicos principais
- [ ] Geração de índice de conteúdo inteligente
- [ ] Identificação de entidades (pessoas, locais, datas)
- [ ] Análise de sentimento (para documentos apropriados)

#### 4.3 Funcionalidades de Estudo
- [ ] Geração de flashcards automáticos
- [ ] Criação de quizzes/questões de estudo
- [ ] Geração de mapas mentais
- [ ] Sugestões de recursos complementares
- [ ] Sistema de anotações inteligentes

#### 4.4 Comparação de Documentos
- [ ] Permitir upload de múltiplos PDFs
- [ ] Comparar e contrastar documentos
- [ ] Identificar diferenças e semelhanças
- [ ] Gerar relatório de comparação

---

### **FASE 5: Anotações e Marcações** ✏️
> Prazo estimado: 2-3 semanas

#### 5.1 Sistema de Anotações
- [ ] Implementar camada de anotações sobre o PDF
- [ ] Adicionar notas de texto em pontos específicos
- [ ] Sistema de cores para categorizar anotações
- [ ] Comentários em trechos selecionados
- [ ] Sidebar com lista de todas as anotações

#### 5.2 Ferramentas de Marcação
- [ ] Ferramenta de highlight (marcador de texto)
- [ ] Desenho livre sobre o PDF
- [ ] Formas geométricas (círculos, quadrados, setas)
- [ ] Caixa de texto flutuante
- [ ] Ferramenta de apagador

#### 5.3 Gestão de Anotações
- [ ] Exportar anotações separadamente
- [ ] Importar/exportar anotações (formato padrão)
- [ ] Busca em anotações
- [ ] Filtrar por cor/categoria
- [ ] Compartilhar anotações

---

### **FASE 6: Exportação e Compartilhamento** 📤
> Prazo estimado: 1-2 semanas

#### 6.1 Exportação de Conteúdo
- [ ] Exportar conversas do chat (PDF, TXT, MD)
- [ ] Exportar resumos gerados
- [ ] Exportar traduções
- [ ] Exportar PDF com anotações incorporadas
- [ ] Exportar relatórios de análise

#### 6.2 Funcionalidades de Impressão
- [ ] Melhorar suporte de impressão nativa
- [ ] Opção de imprimir com anotações
- [ ] Imprimir tradução lado a lado
- [ ] Imprimir resumo/análise do documento

#### 6.3 Compartilhamento
- [ ] Gerar links de compartilhamento (se implementar backend)
- [ ] Copiar trechos formatados para clipboard
- [ ] Compartilhar insights do chat
- [ ] Exportar configurações para compartilhar

---

### **FASE 7: Otimização e Performance** ⚡
> Prazo estimado: 1-2 semanas

#### 7.1 Performance de Renderização
- [ ] Implementar virtualização para páginas (lazy loading)
- [ ] Otimizar geração de thumbnails
- [ ] Cache de páginas renderizadas
- [ ] Web Workers para processamento pesado
- [ ] Otimizar re-renderizações do React

#### 7.2 Gestão de Memória
- [ ] Limpar recursos não utilizados
- [ ] Implementar garbage collection manual quando necessário
- [ ] Limitar número de páginas em memória
- [ ] Otimizar armazenamento de histórico

#### 7.3 Otimização de Rede
- [ ] Implementar retry automático para falhas de API
- [ ] Cache de respostas da IA (quando apropriado)
- [ ] Otimizar payloads de requisições
- [ ] Implementar timeout configurável

---

### **FASE 8: Tratamento de Erros e Resiliência** 🛡️
> Prazo estimado: 1 semana

#### 8.1 Tratamento de Erros
- [ ] Implementar Error Boundaries no React
- [ ] Adicionar tratamento de erros de rede
- [ ] Mensagens de erro amigáveis e acionáveis
- [ ] Logging de erros estruturado
- [ ] Fallbacks para funcionalidades críticas

#### 8.2 Validações
- [ ] Validar tamanho máximo de PDF
- [ ] Validar número de páginas do PDF
- [ ] Validar formato e estrutura do PDF
- [ ] Validar entrada do usuário no chat
- [ ] Validar configurações antes de salvar

#### 8.3 Modo Offline
- [ ] Detectar estado offline
- [ ] Desabilitar funcionalidades que requerem rede
- [ ] Informar usuário sobre limitações offline
- [ ] Queue de ações para quando voltar online

---

### **FASE 9: Testes** 🧪
> Prazo estimado: 2-3 semanas

#### 9.1 Testes Unitários
- [ ] Configurar ambiente de testes (Jest, Vitest)
- [ ] Testes para funções utilitárias
- [ ] Testes para hooks customizados
- [ ] Testes para lógica de negócio
- [ ] Cobertura mínima de 70%

#### 9.2 Testes de Integração
- [ ] Testes de interação com API de LLM
- [ ] Testes de upload e processamento de PDF
- [ ] Testes de navegação entre páginas
- [ ] Testes de busca no documento
- [ ] Testes de persistência de dados

#### 9.3 Testes E2E
- [ ] Configurar Playwright ou Cypress
- [ ] Testes de fluxo completo de uso
- [ ] Testes de cenários de erro
- [ ] Testes de performance
- [ ] Testes em diferentes navegadores

#### 9.4 Testes de Acessibilidade
- [ ] Testes automatizados com axe-core
- [ ] Testes manuais com leitores de tela
- [ ] Validar WCAG 2.1 AA
- [ ] Testes de navegação por teclado

---

### **FASE 10: Documentação** 📚
> Prazo estimado: 1 semana

#### 10.1 Documentação do Código
- [ ] Adicionar JSDoc para funções principais
- [ ] Documentar componentes React
- [ ] Documentar APIs e interfaces
- [ ] Adicionar comentários explicativos
- [ ] Criar guia de arquitetura

#### 10.2 Documentação do Usuário
- [ ] Criar guia de início rápido
- [ ] Tutorial interativo (tour da aplicação)
- [ ] Documentação de funcionalidades
- [ ] FAQ
- [ ] Vídeos demonstrativos

#### 10.3 Documentação para Desenvolvedores
- [ ] README detalhado
- [ ] Guia de contribuição (CONTRIBUTING.md)
- [ ] Guia de configuração de ambiente
- [ ] Documentação de deploy
- [ ] Changelog estruturado

---

### **FASE 11: Recursos Adicionais e Polimento** ✨
> Prazo estimado: 2-3 semanas

#### 11.1 Temas e Personalização
- [ ] Implementar tema claro/escuro
- [ ] Permitir customização de cores
- [ ] Diferentes layouts de visualização
- [ ] Configurações de tipografia
- [ ] Salvar preferências de tema

#### 11.2 Internacionalização (i18n)
- [ ] Configurar sistema de i18n (react-i18next)
- [ ] Traduzir interface para inglês
- [ ] Traduzir interface para espanhol
- [ ] Permitir seleção de idioma
- [ ] Traduzir documentação

#### 11.3 Funcionalidades Auxiliares
- [ ] Calculadora embutida (para documentos técnicos)
- [ ] Conversor de unidades
- [ ] Dicionário integrado
- [ ] Referências bibliográficas
- [ ] Modo de leitura (remover distrações)

#### 11.4 Estatísticas e Analytics
- [ ] Tempo de leitura
- [ ] Páginas mais visitadas
- [ ] Estatísticas de uso do chat
- [ ] Palavras-chave mais buscadas
- [ ] Dashboard de atividades

---

### **FASE 12: Infraestrutura e Deploy** 🚀
> Prazo estimado: 1 semana

#### 12.1 Otimização de Build
- [ ] Configurar code splitting
- [ ] Otimizar bundle size
- [ ] Implementar tree shaking
- [ ] Minificação e compressão
- [ ] Análise de bundle (bundle analyzer)

#### 12.2 CI/CD
- [ ] Configurar GitHub Actions
- [ ] Testes automatizados em PRs
- [ ] Build automático
- [ ] Deploy automático
- [ ] Versionamento semântico

#### 12.3 Deploy
- [ ] Configurar para Vercel/Netlify
- [ ] Configurar domínio customizado
- [ ] Configurar SSL/HTTPS
- [ ] Configurar variáveis de ambiente
- [ ] Monitoramento de erros (Sentry)

#### 12.4 Performance Web
- [ ] Otimizar Core Web Vitals
- [ ] Implementar Service Worker (PWA)
- [ ] Cache estratégico
- [ ] Lazy loading de recursos
- [ ] Otimização de imagens

---

## 🎯 Priorização Sugerida

### **Prioridade CRÍTICA (Infraestrutura e Segurança)**
1. ⚠️ **FASE 0: Correção de Bugs e Infraestrutura Base** - COMEÇAR IMEDIATAMENTE
   - 0.1: Correção de Ícones (1 dia)
   - 0.2: Autenticação Firebase (1-2 dias)
   - 0.3: Firestore Setup (1 dia)
   - 0.4: Migração para Firestore (1-2 dias)
   - 0.5: Roteamento (meio dia)

### **Prioridade ALTA (MVP Aprimorado)**
2. ✅ FASE 1: Melhorias de UX/UI e Usabilidade
3. ✅ FASE 2: Sistema de Tradução Aprimorado
4. ✅ FASE 8: Tratamento de Erros e Resiliência

### **Prioridade MÉDIA (Funcionalidades Valiosas)**
5. FASE 4: Recursos Avançados de IA
6. FASE 6: Exportação e Compartilhamento
7. FASE 7: Otimização e Performance
8. FASE 11: Recursos Adicionais e Polimento

### **Prioridade BAIXA (Melhorias Futuras)**
9. FASE 5: Anotações e Marcações
10. FASE 9: Testes
11. FASE 10: Documentação
12. FASE 12: Infraestrutura e Deploy

---

## 📈 Métricas de Sucesso

### Métricas Técnicas
- [ ] Tempo de carregamento inicial < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Score > 90
- [ ] Cobertura de testes > 70%
- [ ] Bundle size < 500KB (gzipped)

### Métricas de Usabilidade
- [ ] Taxa de conclusão de tarefas > 90%
- [ ] Tempo médio para realizar ação principal < 30s
- [ ] Taxa de erro do usuário < 5%
- [ ] NPS (Net Promoter Score) > 50
- [ ] Acessibilidade WCAG 2.1 AA

### Métricas de Produto
- [ ] Taxa de retenção de usuários
- [ ] Documentos processados por sessão
- [ ] Mensagens de chat por documento
- [ ] Taxa de uso de recursos avançados
- [ ] Feedback qualitativo positivo

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **PDF Rendering**: PDF.js

### APIs
- **LLM Providers**: Anthropic (Claude), OpenAI (GPT), Google (Gemini)

### Futuras Adições Potenciais
- **State Management**: Zustand ou Jotai (se necessário)
- **Testing**: Vitest, React Testing Library, Playwright
- **i18n**: react-i18next
- **Forms**: React Hook Form (se necessário)
- **Validation**: Zod
- **Backend** (opcional): Node.js, Express, PostgreSQL

---

## 📝 Notas Importantes

### Considerações de Segurança
- ✅ **API Keys armazenadas no Firestore (não mais localStorage)** - FASE 0 implementada
- ✅ **Autenticação via Firebase/Google** - acesso controlado
- ✅ **Regras de segurança Firestore** - dados isolados por usuário
- ⚠️ Validação de PDFs para prevenir malware
- ⚠️ Sanitização de inputs do usuário
- ⚠️ Rate limiting para chamadas de API
- ⚠️ CSP (Content Security Policy)
- 🔐 Considerar encriptação de API Keys no Firestore (crypto-js)

### Considerações de Privacidade
- 🔒 PDFs processados apenas no cliente
- 🔒 Nenhum dado enviado para servidor (exceto APIs de LLM)
- 🔒 Informar usuário sobre uso de dados pelas APIs
- 🔒 Opção de modo totalmente offline

### Limitações Conhecidas
- PDF.js pode ter problemas com PDFs muito grandes (>100MB)
- APIs de LLM têm limite de tokens (contexto limitado)
- Renderização de PDFs complexos pode ser lenta
- Anotações não são persistidas no PDF original

---

## 🎓 Recursos de Aprendizado

### Para o Time
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google AI Docs](https://ai.google.dev/)
- [React 19 Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

**Última atualização**: 2025-11-09
**Versão do documento**: 1.0
**Status do projeto**: Em desenvolvimento ativo
