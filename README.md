# Sistema de Inventário FabLab

Um sistema de gerenciamento de inventário para FabLabs, desenvolvido em Node.js com TypeScript, Express e Prisma. Permite o controle de usuários, itens de inventário e empréstimos de itens.

## Tecnologias Utilizadas

- **Runtime**: Node.js
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Segurança**: bcrypt para hash de senhas
- **Containerização**: Docker Compose
- **Outros**: CORS, dotenv

## Funcionalidades

- **Gerenciamento de Usuários**: Cadastro, autenticação e atualização de perfis
- **Controle de Inventário**: Adição, atualização e remoção de itens
- **Sistema de Empréstimos**: Registro de empréstimos com datas de devolução
- **Autenticação JWT**: Tokens de acesso e refresh para segurança
- **Validação de Dados**: Validações robustas em todas as entradas
- **Tratamento de Erros**: Mensagens de erro padronizadas em português

## Arquitetura

O projeto segue uma arquitetura modular MVC com separação clara de responsabilidades:

- **Controllers**: Manipulam requisições HTTP
- **Services**: Contêm lógica de negócio
- **Routes**: Definem endpoints da API
- **DTOs**: Tipos TypeScript para dados
- **Validators**: Validação de entrada
- **Middlewares**: Autenticação e tratamento de erros

## Estrutura do Projeto

```
src/
├── app.ts                 # Configuração do Express
├── server.ts              # Ponto de entrada do servidor
├── @types/                # Extensões de tipos TypeScript
├── constants/messages.ts  # Mensagens de erro/sucesso
├── languages/pt.ts        # Localização em português
├── lib/prisma.ts          # Instância do cliente Prisma
├── middlewares/
│   ├── authMiddleware.ts  # Verificação JWT
│   └── errorHandler.ts    # Tratamento global de erros
├── modules/
│   ├── auth/              # Módulo de autenticação
│   ├── user/              # Módulo de usuários
│   ├── item/              # Módulo de itens
│   └── loan/              # Módulo de empréstimos
└── shared/
    ├── services/token.service.ts  # Geração de tokens JWT
    └── utils/                     # Utilitários (bcrypt, crypto, validações)
```

## Modelo de Dados

### Usuário (User)
- id: Identificador único
- email: Email único
- username: Nome de usuário
- passwordHash: Hash da senha

### Item (Item)
- id: Identificador único
- name: Nome do item
- category: Categoria (opcional)
- totalQuantity: Quantidade total
- location: Localização

### Empréstimo (Loan)
- id: Identificador único
- loanDate: Data do empréstimo
- dueDate: Data de devolução prevista
- returnDate: Data de devolução efetiva (opcional)
- loanQuantity: Quantidade emprestada
- userId: ID do usuário
- itemId: ID do item

### Token de Autenticação (AuthToken)
- id: Identificador único
- userId: ID do usuário
- refreshTokenHash: Hash do token de refresh
- expiresAt: Data de expiração
- revoked: Status de revogação

## Instalação e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- npm ou yarn

### Passos de Instalação

1. **Clone o repositório e navegue até a pasta:**
   ```bash
   cd /home/nearo/projects/sistema-inventario-fablab
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env` na raiz do projeto com base nas variáveis do .env.example:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
   POSTGRES_USER="postgres"
   POSTGRES_PASSWORD="postgres"
   POSTGRES_DB="app_db"

   JWT_SECRET="dev_secret_key"
   JWT_SECRET_REFRESH="dev_refresh_secret_key"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   ```

4. **Inicie o banco de dados PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

5. **Gere o cliente Prisma:**
   ```bash
   npm run db:generate
   ```

6. **Execute as migrações do banco:**
   ```bash
   npm run db:migrate
   ```

7. **(Opcional) Povoe a base de dados com dados iniciais:**
   ```bash
   npm run db:seed
   ```
   Este comando pergunta interativamente se pretende apagar os dados existentes e criar dados de exemplo (utilizadores, clientes, itens e empréstimos).

8. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

O servidor estará rodando em `http://localhost:3000`.

### Atalhos

- `npm run start:db` — Combina os passos 4, 6 e 8: inicia a base de dados Docker, executa as migrações e inicializa o servidor.
- `npm run start:full` — Como o `start:db` mas também copia o `.env.example` para `.env` automaticamente se este não existir. (Útil para primeira execução.)

### Comandos Úteis

- **Desenvolvimento**: `npm run dev` (recarrega automaticamente)
- **Gerar cliente Prisma**: `npm run db:generate`
- **Executar migrações**: `npm run db:migrate`
- **Povoar base de dados**: `npm run db:seed` (interativo, pede confirmação)
- **Resetar banco**: `npm run db:reset`
- **Abrir Prisma Studio**: `npm run db:studio`
- **Arranque completo (DB + servidor)**: `npm run start:db`
- **Arranque completo com setup automático**: `npm run start:full` (opcional)

## 📡 API Endpoints

### Autenticação (`/auth`)

- `POST /auth/login` - Login (retorna tokens JWT)
- `POST /auth/refresh` - Refresh do token de acesso

### Usuários (`/user`)

- `POST /user` - Criar novo usuário
- `GET /user` - Listar todos os usuários (requer auth)
- `PATCH /user/:id` - Atualizar usuário (requer auth)
- `DELETE /user/:id` - Deletar usuário (requer auth)

### Itens (`/item`) - Todos requerem autenticação

- `POST /item` - Criar novo item
- `GET /item` - Listar todos os itens
- `PATCH /item/:id` - Atualizar item
- `DELETE /item/:id` - Deletar item

### Empréstimos (`/loan`) - Todos requerem autenticação

- `POST /loan` - Criar novo empréstimo
- `GET /loan` - Listar todos os empréstimos
- `PATCH /loan/:id` - Atualizar empréstimo
- `DELETE /loan/:id` - Deletar empréstimo

## Segurança

- **Hash de senhas**: bcrypt com 10 rounds de salt
- **Tokens JWT**: Acesso e refresh tokens com expiração
- **Revogação de tokens**: Refresh tokens podem ser revogados
- **Validação de entrada**: Todas as entradas são validadas
- **Tratamento de erros**: Mensagens genéricas para evitar vazamento de informações

## Validações

### Usuário
- Email: Formato padrão obrigatório
- Username: 3-24 caracteres, alfanumérico + `._-`
- Senha: 6-18 caracteres com confirmação

### Item
- Nome: 2-50 caracteres obrigatório
- Categoria: Opcional, máximo 30 caracteres
- Quantidade: Inteiro não-negativo obrigatório
- Localização: Obrigatório, máximo 80 caracteres

### Empréstimo
- Datas: Formato ISO 8601
- Quantidade: Inteiro positivo

## Exemplos de Uso

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@fablab.com",
  "password": "senha123"
}
```

### Criar Item
```bash
POST /item
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Impressora 3D",
  "category": "Equipamentos",
  "totalQuantity": 5,
  "location": "Sala A-1"
}
```

### Criar Empréstimo
```bash
POST /loan
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": 1,
  "itemId": 2,
  "loanDate": "2025-05-01T10:00:00Z",
  "dueDate": "2025-05-15T10:00:00Z",
  "loanQuantity": 1
}
```
