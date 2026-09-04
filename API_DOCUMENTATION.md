# Referência da API — Frontend

URL base local: `http://localhost:3000`. Datas de resposta são strings ISO 8601.

## Autenticação

Envie o token de acesso como `Authorization: Bearer <accessToken>`. Tokens de refresh só são aceitos nos endpoints de refresh/logout.

| Método | Rota | Acesso | Corpo | Resposta |
|---|---|---|---|---|
| `POST` | `/auth/login` | Público | `{ email, password }` | `200` com tokens |
| `POST` | `/auth/refresh` | Público | `{ refreshToken }` | `200` com tokens rotacionados |
| `POST` | `/auth/logout` | Público | `{ refreshToken }` | `204` |
| `POST` | `/auth/logout-all` | Autenticado | — | `204` |

Login e refresh possuem limite de 20 requisições por 15 minutos por endereço.

## Erros

```json
{
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "Não foi possível encontrar um item com esse ID."
  }
}
```

Status usuais: `400` validação/JSON, `401` autenticação, `403` papel insuficiente, `404` recurso/rota, `409` conflito de estado ou unicidade, `429` limite de requisições e `500` falha inesperada.

## Paginação

Endpoints de lista aceitam `page` (padrão 1) e `pageSize` (padrão 50, máximo 100). A resposta continua sendo um array para manter compatibilidade.

## Usuários

| Método | Rota | Papel | Corpo/consulta | Resposta |
|---|---|---|---|---|
| `POST` | `/user` | `ADMIN` | `username`, `email`, `password`, `passwordConfirm`, `role?` | `201 User` |
| `GET` | `/user` | `ADMIN` | `page`, `pageSize`, `search?` | `200 User[]` |
| `GET` | `/user/:id` | `ADMIN` | — | `200 User` |
| `PATCH` | `/user/:id` | `ADMIN` | `username?`, `email?`, `role?` | `200 User` |
| `DELETE` | `/user/:id` | `ADMIN` | — | `204` |
| `PATCH` | `/user/me/password` | Autenticado | `currentPassword`, `newPassword`, `passwordConfirm` | `204` |

A senha deve ter 12 ou mais caracteres e no máximo 72 bytes. Alterá-la revoga todos os refresh tokens do usuário. `role` aceita `ADMIN` ou `OPERATOR` e assume `OPERATOR` quando omitido. O último administrador não pode ser excluído nem rebaixado.

## Clientes

| Método | Rota | Papel | Corpo/consulta | Resposta |
|---|---|---|---|---|
| `POST` | `/client` | `ADMIN`, `OPERATOR` | `name`, `email`, `phone?` | `201 Client` |
| `GET` | `/client` | Autenticado | `page`, `pageSize`, `search?` | `200 Client[]` |
| `GET` | `/client/:id` | Autenticado | — | `200 Client` |
| `GET` | `/client/:id/loans` | Autenticado | paginação | `200 Client` com `loans` |
| `PATCH` | `/client/:id` | `ADMIN`, `OPERATOR` | `name?`, `email?`, `phone?` | `200 Client` |
| `DELETE` | `/client/:id` | `ADMIN` | — | `204` |

`phone: null` remove o telefone. São aceitos de 8 a 15 dígitos; pontuação é removida. Clientes com histórico de empréstimos não podem ser apagados (`409`).

## Itens

| Método | Rota | Papel | Corpo/consulta | Resposta |
|---|---|---|---|---|
| `POST` | `/item` | `ADMIN`, `OPERATOR` | `name`, `totalQuantity`, `location`, `category?` | `201 Item` |
| `GET` | `/item` | Autenticado | `page`, `pageSize`, `search?` | `200 Item[]` |
| `GET` | `/item/by-category` | Autenticado | `category`, paginação | `200 Item[]` |
| `GET` | `/item/by-location` | Autenticado | `location`, paginação | `200 Item[]` |
| `GET` | `/item/:id` | Autenticado | — | `200 Item` |
| `GET` | `/item/:id/adjustments` | `ADMIN` | paginação | `200 InventoryAdjustment[]` |
| `PATCH` | `/item/:id` | `ADMIN`, `OPERATOR` | `name?`, `category?`, `totalQuantity?`, `adjustmentReason?`, `location?` | `200 Item` |
| `DELETE` | `/item/:id` | `ADMIN` | — | `204` |

`totalQuantity` é inteiro e não-negativo. `availableQuantity` é calculado pelo servidor. Alterar `totalQuantity` exige `adjustmentReason` (3–200 caracteres) e gera uma entrada de auditoria. `category: null` remove a categoria. A quantidade total não pode ficar abaixo das unidades atualmente emprestadas. Itens com histórico ou ajustes não podem ser apagados (`409`).

## Empréstimos

| Método | Rota | Papel | Corpo/consulta | Resposta |
|---|---|---|---|---|
| `POST` | `/loan` | `ADMIN`, `OPERATOR` | `clientId`, `itemId`, `loanDate`, `dueDate`, `loanQuantity`, `returnDate?` | `201 Loan` |
| `GET` | `/loan` | Autenticado | paginação, `status?` | `200 Loan[]` |
| `GET` | `/loan/:id` | Autenticado | — | `200 Loan` |
| `PATCH` | `/loan/:id` | `ADMIN`, `OPERATOR` | `loanDate?`, `dueDate?`, `returnDate?` | `200 Loan` |
| `DELETE` | `/loan/:id` | `ADMIN` | — | `204` |

`status` aceita `all`, `active`, `returned`, `cancelled` e `overdue`. Definir `returnDate` devolve o estoque; definir `returnDate: null` reabre o empréstimo se houver estoque. `DELETE` cancela e preserva o registro.

Datas aceitam `YYYY-MM-DD` ou data/hora ISO com fuso, por exemplo `2026-09-04T10:00:00-03:00`. `dueDate` e `returnDate` não podem anteceder `loanDate`.

## Modelos resumidos

```ts
type User = {
  id: number; email: string; username: string; role: "ADMIN" | "OPERATOR";
  createdAt: string; updatedAt: string;
};

type Client = {
  id: number; name: string; email: string; phone: string | null;
  createdAt: string; updatedAt: string;
};

type Item = {
  id: number; name: string; category: string | null; location: string;
  totalQuantity: number; availableQuantity: number;
  createdAt: string; updatedAt: string;
};

type Loan = {
  id: number; clientId: number; itemId: number; loanQuantity: number;
  loanDate: string; dueDate: string; returnDate: string | null;
  cancelledAt: string | null;
  createdById: number | null; returnedById: number | null; cancelledById: number | null;
  createdAt: string; updatedAt: string;
};
```

## Saúde

- `GET /health/live`: processo HTTP ativo.
- `GET /health/ready`: processo consegue consultar o PostgreSQL.

Consulte [openapi.yaml](./openapi.yaml) para a especificação legível por ferramentas.
