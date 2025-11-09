# 🔐 Regras de Segurança Firestore - PDF Sage

## Como Configurar as Regras

### Passo 1: Acessar Firebase Console
1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto "pdf-sage"
3. Clique em **Firestore Database** no menu lateral
4. Vá na aba **Regras**

### Passo 2: Copiar as Regras
Copie o código abaixo e cole no editor de regras do Firebase:

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

### Passo 3: Publicar as Regras
1. Clique no botão **Publicar** (canto superior direito)
2. Confirme a publicação
3. Aguarde a publicação completar (normalmente 30 segundos)

## O que as Regras Fazem

### 🔒 Segurança Implementada

✅ **Isolamento de Dados**
- Cada usuário só pode acessar seus próprios dados
- API Keys são encriptadas e isoladas por usuário
- Marcadores e conversas são privados

✅ **Controle de Acesso**
- Apenas usuários autenticados podem fazer requisições
- Leitura/escrita autorizada apenas para dados do próprio usuário
- Criação de dados requer uid correspondente ao usuário autenticado

✅ **Prevenção de Acesso Não Autorizado**
- Usuários não autenticados não conseguem acessar nada
- Usuários não conseguem acessar dados de outros usuários
- Regra padrão nega tudo não explicitamente permitido

## Testando as Regras

### No Firebase Console
1. Vá em **Firestore Database** > **Regras**
2. Clique em **Simulador de Regras** (lado direito)
3. Teste os seguintes cenários:

#### Teste 1: Acesso Autorizado (Seu Próprio Usuário)
- Método: `get`
- Localização: `/databases/(default)/documents/users/[seu-uid]`
- Autenticado: ✅ Sim
- Esperado: **✅ PERMITIDO**

#### Teste 2: Acesso Negado (Outro Usuário)
- Método: `get`
- Localização: `/databases/(default)/documents/users/outro-usuario-id`
- Autenticado: ✅ Sim (como seu usuário)
- Esperado: **❌ NEGADO**

#### Teste 3: Acesso Não Autenticado
- Método: `get`
- Localização: `/databases/(default)/documents/users/qualquer-usuario`
- Autenticado: ❌ Não
- Esperado: **❌ NEGADO**

## Verificação de Segurança

Após publicar as regras, o aplicativo deve:

✅ Permitir login com Google
✅ Salvar dados do usuário no Firestore
✅ Encriptar e salvar API Keys
✅ Carregar dados do próprio usuário
✅ Redirecionar não autenticados para /login
✅ Permitir logout e re-login

## Troubleshooting

### Erro: "Permissão negada"
- Verifique se as regras foram publicadas corretamente
- Aguarde 1-2 minutos após publicar
- Tente fazer logout e login novamente

### Erro: "Falha ao salvar API Key"
- Verifique se o usuário está autenticado
- Verifique o console do navegador por erros
- Confirme que as credenciais do Firebase estão corretas em `.env.local`

### Dados Não Carregam
- Verifique se o usuário está logado
- Abra o DevTools > Console e procure por erros
- Confirme que os dados existem no Firebase Console

## Estrutura de Dados Esperada

```
users/
  └── {userId}/
        ├── uid: string
        ├── email: string
        ├── displayName: string
        ├── photoURL: string
        ├── createdAt: timestamp
        ├── lastLogin: timestamp
        └── preferences: object

api_keys/
  └── {userId}_{provider}/
        ├── userId: string
        ├── provider: string (anthropic, openai, google)
        ├── apiKey: string (encriptado)
        ├── modelName: string
        ├── isValid: boolean
        ├── lastValidated: timestamp
        └── createdAt: timestamp

documents/
  └── {userId}_{documentId}/
        ├── userId: string
        ├── documentId: string
        ├── fileName: string
        ├── bookmarks: array
        ├── lastAccess: timestamp
        └── updatedAt: timestamp

conversations/
  └── {userId}_{documentId}/
        ├── userId: string
        ├── documentId: string
        ├── messages: array
        └── updatedAt: timestamp
```

## Próximos Passos

1. ✅ Publicar as regras no Firebase Console
2. ✅ Testar as regras usando o Simulador
3. ✅ Testar o fluxo completo do aplicativo
4. ✅ Verificar sincronização de dados em tempo real
5. ✅ Validar isolamento de dados entre usuários
