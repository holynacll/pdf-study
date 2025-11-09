🚀 Guia de Instalação Local
1️⃣ Pré-requisitos

Node.js (versão 16 ou superior) - Download aqui
npm ou yarn (vem com Node.js)
Editor de código (recomendo VS Code)

2️⃣ Criar o Projeto
bash# Criar projeto React com Vite (mais rápido)
npm create vite@latest pdf-study-app -- ## **🚀 Guia de Instalação Local**

### **1️⃣ Pré-requisitos**

* **Node.js** (versão 16 ou superior) \- [Download aqui](https://nodejs.org/)  
* **npm** ou **yarn** (vem com Node.js)  
* Editor de código (recomendo **VS Code**)

### **2️⃣ Criar o Projeto**

bash  
*\# Criar projeto React com Vite (mais rápido)*  
npm create vite@latest pdf-study-app \-- \--template react

*\# OU com Create React App (tradicional)*  
npx create-react-app pdf-study-app

*\# Entrar na pasta*

cd pdf-study-app

### **3️⃣ Instalar Dependências**

bash  
*\# Instalar Tailwind CSS*  
npm install \-D tailwindcss postcss autoprefixer  
npx tailwindcss init \-p

*\# Instalar lucide-react (ícones)*

npm install lucide-react

### **4️⃣ Configurar Tailwind CSS**

Edite `tailwind.config.js`:

javascript  
*/\*\* @type {import('tailwindcss').Config} \*/*  
export default {  
  content: \[  
    "./index.html",  
    "./src/\*\*/\*.{js,ts,jsx,tsx}",  
  \],  
  theme: {  
    extend: {},  
  },  
  plugins: \[\],

}

Edite `src/index.css` (ou `src/App.css`):

css  
@tailwind base;  
@tailwind components;

@tailwind utilities;

### **5️⃣ Adicionar o Código**

Substitua o conteúdo de `src/App.jsx` pelo código completo do artefato que criei.

### **6️⃣ Executar**

bash  
*\# Iniciar servidor de desenvolvimento*  
npm run dev

*\# Ou se usou Create React App:*  
npm start  
\`\`\`

Acesse: \`http://localhost:5173\` (Vite) ou \`http://localhost:3000\` (CRA)

\---

*\#\# 📦 Estrutura de Pastas*  
\`\`\`  
pdf-study-app/  
├── node\_modules/  
├── public/  
├── src/  
│   ├── App.jsx          \<\- Cole o código aqui  
│   ├── index.css        \<\- Adicione Tailwind  
│   └── main.jsx  
├── index.html  
├── package.json  
├── tailwind.config.js

└── vite.config.js

---

## **🔑 Configurar API Keys**

Depois que a aplicação estiver rodando:

1. Clique no botão **"Config"**  
2. Escolha o provedor (Claude/GPT/Gemini)  
3. Cole sua API Key  
4. Clique em **"Validar"**

### **Onde obter API Keys:**

* **Claude**: [console.anthropic.com](https://console.anthropic.com/)  
* **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)  
* **Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## **🐛 Problemas Comuns**

**Erro de importação do Tailwind:**

* Certifique-se que adicionou `@tailwind` no CSS

**Ícones não aparecem:**

bash

npm install lucide-react

**PDF.js não carrega:**

* O CDN já está configurado no código, deve funcionar automaticamente

**Porta já em uso:**

bash  
*\# Vite \- use outra porta*

npm run dev \-- \--port 3001

--template react

# OU com Create React App (tradicional)
npx create-react-app pdf-study-app

# Entrar na pasta
cd pdf-study-app
3️⃣ Instalar Dependências
bash# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar lucide-react (ícones)
npm install lucide-react
4️⃣ Configurar Tailwind CSS
Edite tailwind.config.js:
javascript/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
Edite src/index.css (ou src/App.css):
css@tailwind base;
@tailwind components;
@tailwind utilities;
5️⃣ Adicionar o Código
Substitua o conteúdo de src/App.jsx pelo código completo do artefato que criei.
6️⃣ Executar
bash# Iniciar servidor de desenvolvimento
npm run dev

# Ou se usou Create React App:
npm start
```

Acesse: `http://localhost:5173` (Vite) ou `http://localhost:3000` (CRA)

---

## 📦 Estrutura de Pastas
```
pdf-study-app/
├── node_modules/
├── public/
├── src/
│   ├── App.jsx          <- Cole o código aqui
│   ├── index.css        <- Adicione Tailwind
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js

🔑 Configurar API Keys
Depois que a aplicação estiver rodando:

Clique no botão "Config"
Escolha o provedor (Claude/GPT/Gemini)
Cole sua API Key
Clique em "Validar"

Onde obter API Keys:

Claude: console.anthropic.com
OpenAI: platform.openai.com/api-keys
Gemini: aistudio.google.com/app/apikey


🐛 Problemas Comuns
Erro de importação do Tailwind:

Certifique-se que adicionou @tailwind no CSS

Ícones não aparecem:
bashnpm install lucide-react
PDF.js não carrega:

O CDN já está configurado no código, deve funcionar automaticamente

Porta já em uso:
bash# Vite - use outra porta
npm run dev -- --port 3001