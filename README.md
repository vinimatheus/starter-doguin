# Doguin 🐶

Uma aplicação SaaS moderna construída com Next.js, oferecendo uma experiência completa de gestão de organizações e projetos.

## 📋 Características

- ✅ Autenticação de usuários
- ✅ Gestão de organizações e membros
- ✅ Painel de controle interativo
- ✅ Sistema de convites por e-mail
- ✅ Interface moderna e responsiva com Tailwind CSS
- ✅ Layout dinâmico baseado em rotas
- ✅ Componentes de UI personalizáveis

## 🛠️ Tecnologias

- **Framework**: [Next.js](https://nextjs.org/) com App Router
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Biblioteca personalizada de componentes
- **Gerenciamento de Estado**: React Context API
- **Banco de Dados**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Autenticação**: Next-Auth
- **Navegação**: Next.js Routing System
- **Icons**: Lucide React

## 🚀 Começando

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Docker e Docker Compose

### Configuração do Banco de Dados

1. Inicie o PostgreSQL usando Docker Compose:
   ```bash
   docker-compose up -d
   ```

   Isso iniciará um contêiner PostgreSQL com as seguintes configurações:
   - Nome de usuário: doguin
   - Senha: senhadadoguin
   - Banco de dados: doguin
   - Porta: 5432

2. Aplique as migrações do Prisma:
   ```bash
   npx prisma migrate dev
   ```

3. Edite o arquivo de seed para adicionar seus dados:
   - Abra o arquivo `prisma/seed.ts`
   - Localize a seção de usuários (cerca da linha 65):
     ```typescript
     { name: 'seunome', email: 'seu@email.com.br' },
     ```
   - Substitua 'seunome' pelo seu nome
   - Substitua 'seu@email.com.br' pelo seu endereço de email

4. Execute o script de seed para criar dados iniciais:
   ```bash
   npx prisma db seed
   ```
   
   Este comando criará usuários iniciais com as informações que você configurou no passo anterior.
   A senha será exibida no console após a execução do seed.

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/vinimatheus/starter-doguin
   cd starter-doguin
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
   Preencha as variáveis necessárias no arquivo `.env.local`, incluindo as informações de conexão com o banco de dados:
   ```
   DATABASE_URL="postgresql://doguin:senhadadoguin@localhost:5432/doguin"
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Acesse `http://localhost:3000` no seu navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/                   # Estrutura de rotas Next.js
│   ├── (auth)/            # Rotas relacionadas à autenticação
│   ├── (protected)/       # Rotas protegidas (requerem login)
│   ├── api/               # Rotas de API
│   └── ...
├── components/            # Componentes React reutilizáveis
│   ├── layout/            # Componentes de layout
│   ├── ui/                # Componentes de UI base
│   └── ...
├── constants/             # Constantes e dados estáticos
├── providers/             # Providers de contexto React
├── lib/                   # Funções utilitárias e bibliotecas
└── ...
```

## 🔍 Principais Funcionalidades

### Sistema de Rotas

A aplicação utiliza a estrutura de pastas do Next.js para definir as rotas:
- `/(auth)/*`: Rotas públicas para autenticação
- `/(protected)/*`: Rotas protegidas que exigem autenticação
- `/api/*`: APIs para operações no backend

### Gestão de Organizações

Os usuários podem:
- Criar e gerenciar organizações
- Convidar membros via e-mail
- Configurar permissões de membros
- Alternar entre diferentes organizações


## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 📧 Contato

Para perguntas ou sugestões, entre em contato com [vinimatheus999@gmail.com].

---

Desenvolvido com ❤️ por Vinicius Matheus Moreira
