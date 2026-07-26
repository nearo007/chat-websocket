# Referência da API — Frontend

URL Base: `http://localhost:<PORT>` (padrão `3000`)

---

## Autenticação

### Login (público)
```
POST /auth/login
Body: { "email": string, "password": string }
→  { "accessToken": string, "refreshToken": string }
```

### Refresh Token (público)
```
POST /auth/refresh
Body: { "refreshToken": string }
→  { "accessToken": string, "refreshToken": string }
```

### Endpoints protegidos
Envie o token de acesso no cabeçalho:
```
Authorization: Bearer <accessToken>
```
Retorna `401` se estiver ausente/expirado.

---

## Formato de erro
| Status | Formato | Quando |
|--------|---------|--------|
| `400` | `{ "errorMessage": string }` | Violação de validação / regra de negócio |
| `401` | `{ "error": string }` | Token ausente ou inválido |
| `500` | `{ "errorMessage": "Erro interno" }` | Erro inesperado |

---

## Rotas

### Usuários (`/user`)

| Método | Caminho | Auth | Corpo obrigatório | Corpo opcional | Resposta |
|--------|---------|------|-------------------|----------------|----------|
| `POST` | `/user` | Não | `username`, `email`, `password`, `passwordConfirm` | — | `User` |
| `GET` | `/user/` | Sim | — | — | `User[]` |
| `GET` | `/user/:id` | Sim | — | — | `User` |
| `PATCH` | `/user/:id` | Sim | — | `username`, `email` | `User` |
| `DELETE` | `/user/:id` | Sim | — | — | `200` (vazio) |

### Itens (`/item`)

| Método | Caminho | Auth | Corpo obrigatório | Corpo opcional | Resposta |
|--------|---------|------|-------------------|----------------|----------|
| `POST` | `/item` | Sim | `name`, `totalQuantity`, `location` | `category`, `availableQuantity` | `Item` |
| `GET` | `/item/` | Sim | — | — | `Item[]` |
| `GET` | `/item/by-category?category=...` | Sim | `category` (query) | — | `Item[]` |
| `GET` | `/item/by-location?location=...` | Sim | `location` (query) | — | `Item[]` |
| `GET` | `/item/:id` | Sim | — | — | `Item` |
| `PATCH` | `/item/:id` | Sim | — | `name`, `category`, `totalQuantity`, `location` | `Item` |
| `DELETE` | `/item/:id` | Sim | — | — | `Item` |

Os filtros são enviados como parâmetros de query.

### Clientes (`/client`)

| Método | Caminho | Auth | Corpo obrigatório | Corpo opcional | Resposta |
|--------|---------|------|-------------------|----------------|----------|
| `POST` | `/client` | Sim | `name`, `email` | `phone` | `Client` |
| `GET` | `/client/` | Sim | — | — | `Client[]` |
| `GET` | `/client/:id` | Sim | — | — | `Client` |
| `PATCH` | `/client/:id` | Sim | — | `name`, `email`, `phone` | `Client` |
| `DELETE` | `/client/:id` | Sim | — | — | `200` (vazio) |

### Empréstimos (`/loan`)

| Método | Caminho | Auth | Corpo obrigatório | Corpo opcional | Resposta |
|--------|---------|------|-------------------|----------------|----------|
| `POST` | `/loan` | Sim | `clientId`, `itemId`, `loanDate`, `dueDate`, `loanQuantity` | `returnDate` | `Loan` |
| `GET` | `/loan/` | Sim | — | — | `Loan[]` |
| `GET` | `/loan/:id` | Sim | — | — | `Loan` |
| `PATCH` | `/loan/:id` | Sim | — | `loanDate`, `dueDate`, `returnDate` | `Loan` |
| `DELETE` | `/loan/:id` | Sim | — | — | `200` (vazio) |

---

## Modelos

### Usuário
```ts
{ id: number, email: string, username: string, role: "ADMIN" | "OPERATOR" }
```

### Cliente
```ts
{ id: number, name: string, email: string, phone: string | null }
```

### Item
```ts
{ id: number, name: string, category: string | null, totalQuantity: number, availableQuantity: number, location: string }
```

### Empréstimo
```ts
{
  id: number,
  loanDate: string,       // ISO
  dueDate: string,        // ISO
  returnDate: string | null,
  loanQuantity: number,
  clientId: number,
  itemId: number
}
```

---

## Regras de validação (resumo)

| Campo | Regras |
|-------|--------|
| `email` | Formato de e-mail válido |
| `password` | 6–18 caracteres |
| `passwordConfirm` | Deve ser igual a `password` |
| `username` | 3–24 caracteres, alfanumérico + `._-` |
| `name` (cliente/item) | 2–50 caracteres |
| `category` | Máx. 30 caracteres |
| `location` | Máx. 80 caracteres |
| `phone` | 10–11 dígitos |
| `totalQuantity` | ≥ 0 |
| `availableQuantity` | ≥ 0 e ≤ `totalQuantity` |
| `loanQuantity` | ≥ 1, não pode exceder `totalQuantity` do item |
| `id` (parâmetro) | Número inteiro positivo |
| Datas | String ISO 8601 (ex.: `"2025-01-15"`) |
