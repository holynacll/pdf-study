#!/bin/bash

# Script de Setup Automático - PDF Sage
# Este script configura o projeto automaticamente

set -e  # Sair em caso de erro

echo "🚀 Iniciando setup do PDF Sage..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Instale em https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) instalado"

# 2. Limpar instalações anteriores
if [ -d "node_modules" ]; then
    echo ""
    echo "🧹 Limpando node_modules antigo..."
    rm -rf node_modules
    print_success "node_modules removido"
fi

if [ -f "package-lock.json" ]; then
    echo "🧹 Limpando package-lock.json..."
    rm package-lock.json
    print_success "package-lock.json removido"
fi

# 3. Instalar dependências
echo ""
echo "📥 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependências instaladas com sucesso"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

# 4. Verificar .env.local
echo ""
if [ ! -f ".env.local" ]; then
    print_warning ".env.local não encontrado"
    echo ""
    echo "📝 Criando .env.local a partir do template..."
    cp .env.example .env.local
    print_success ".env.local criado"
    echo ""
    print_warning "IMPORTANTE: Edite .env.local com suas credenciais Firebase!"
    echo ""
    echo "Execute:"
    echo "  nano .env.local"
    echo "  ou"
    echo "  code .env.local"
    echo ""
else
    print_success ".env.local já existe"
fi

# 5. Verificar Git
echo ""
if [ -d ".git" ]; then
    print_success "Repositório Git inicializado"
else
    print_warning "Git não inicializado"
    read -p "Deseja inicializar Git? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git init
        git add .
        git commit -m "chore: initial commit"
        print_success "Git inicializado"
    fi
fi

# 6. Resumo final
echo ""
echo "════════════════════════════════════════════════"
echo "✅ Setup Completo!"
echo "════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1️⃣  Configure o Firebase:"
echo "   • Crie um projeto em https://console.firebase.google.com/"
echo "   • Ative Authentication (Google Sign-In)"
echo "   • Ative Firestore Database"
echo ""
echo "2️⃣  Configure .env.local:"
echo "   • Edite .env.local com suas credenciais"
echo "   • Execute: nano .env.local"
echo ""
echo "3️⃣  Configure regras do Firestore:"
echo "   • Veja instruções em FIREBASE_SETUP.md"
echo ""
echo "4️⃣  Inicie o servidor:"
echo "   • Execute: npm run dev"
echo "   • Acesse: http://localhost:5173"
echo ""
echo "════════════════════════════════════════════════"
echo ""
print_success "Tudo pronto para começar! 🎉"
echo ""
