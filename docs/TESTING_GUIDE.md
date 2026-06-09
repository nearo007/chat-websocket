# Guia de Testes — Novas Funcionalidades

## Pré-requisitos

- Servidor rodando: `npm run dev`
- Banco de dados com seed aplicado: `npm run db:seed`
- Cliente HTTP (Insomnia, Postman ou similar)
- URL base: `http://localhost:3000`

---

## 1. Autenticação

Todos os endpoints exigem um token JWT. Faça login primeiro e copie o `accessToken` retornado.

**POST** `/auth/login`

```json
{
  "email": "admin@fablab.pt",
  "password": "admin123"
}
```

**Resposta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "..."
}
```

> Em todas as requisições seguintes, adicione o header:
> ```
> Authorization: Bearer <accessToken>
> ```

---

## 2. Controle de Estoque no Empréstimo

O sistema agora impede emprestar mais do que o disponível. A quantidade disponível é calculada como:

```
disponível = totalQuantity - SOMA(empréstimos ativos sem devolução)
```

### 2.1 Verificar estoque antes de emprestar

**GET** `/item/1/stock`

**Resposta esperada:**
```json
{
  "id": 1,
  "name": "Arduino Uno",
  "totalQuantity": 10,
  "availableQuantity": 8,
  "loanedQuantity": 2,
  "activeLoans": [
    {
      "id": 3,
      "loanQuantity": 2,
      "loanDate": "2026-06-01T00:00:00.000Z",
      "dueDate": "2026-06-15T00:00:00.000Z",
      "clientId": 1
    }
  ]
}
```

### 2.2 Criar empréstimo dentro do estoque disponível

**POST** `/loan`

```json
{
  "clientId": 1,
  "itemId": 1,
  "loanDate": "2026-06-09",
  "dueDate": "2026-06-20",
  "loanQuantity": 2
}
```

**Resposta esperada:** `200 OK` com os dados do empréstimo criado.

> Uma movimentação de **SAIDA** é criada automaticamente.

### 2.3 Tentar emprestar mais do que o disponível (deve falhar)

**POST** `/loan`

```json
{
  "clientId": 2,
  "itemId": 1,
  "loanDate": "2026-06-09",
  "dueDate": "2026-06-20",
  "loanQuantity": 999
}
```

**Resposta esperada:** `500` com mensagem de erro indicando a quantidade máxima disponível.

### 2.4 Registrar devolução

**PATCH** `/loan/1`

```json
{
  "returnDate": "2026-06-15"
}
```

**Resposta esperada:** `200 OK` — o estoque do item é restaurado automaticamente e uma movimentação de **ENTRADA** é criada.

---

## 3. Movimentações de Estoque

### 3.1 Registrar entrada manual

Use quando receber novos itens (doação, compra, etc).

**POST** `/movement`

```json
{
  "type": "ENTRADA",
  "quantity": 5,
  "itemId": 1,
  "reason": "Doação recebida"
}
```

**Resposta esperada:** `201 Created` com os dados da movimentação.

### 3.2 Registrar saída manual

Use quando um item for descartado, perdido ou retirado por outro motivo.

**POST** `/movement`

```json
{
  "type": "SAIDA",
  "quantity": 1,
  "itemId": 1,
  "reason": "Item danificado e descartado"
}
```

**Resposta esperada:** `201 Created` com os dados da movimentação.

### 3.3 Listar todas as movimentações

**GET** `/movement`

**Resposta esperada:** array com todas as movimentações em ordem decrescente de data, incluindo as geradas automaticamente pelos empréstimos.

```json
[
  {
    "id": 3,
    "type": "ENTRADA",
    "quantity": 2,
    "reason": "Devolução registrada",
    "createdAt": "2026-06-15T10:00:00.000Z",
    "itemId": 1,
    "loanId": 1
  },
  {
    "id": 2,
    "type": "SAIDA",
    "quantity": 2,
    "reason": "Empréstimo registrado",
    "createdAt": "2026-06-09T08:00:00.000Z",
    "itemId": 1,
    "loanId": 1
  },
  {
    "id": 1,
    "type": "ENTRADA",
    "quantity": 5,
    "reason": "Doação recebida",
    "createdAt": "2026-06-09T07:00:00.000Z",
    "itemId": 1,
    "loanId": null
  }
]
```

> `loanId: null` indica movimentação manual. `loanId` preenchido indica movimentação gerada por empréstimo.

### 3.4 Listar movimentações de um item específico

**GET** `/movement/item/1`

**Resposta esperada:** mesmo formato acima, filtrado pelo item de ID 1.

---

## 4. Histórico de Empréstimos por Cliente

**GET** `/client/1/loans`

**Resposta esperada:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "loans": [
    {
      "id": 2,
      "loanDate": "2026-06-09T00:00:00.000Z",
      "dueDate": "2026-06-20T00:00:00.000Z",
      "returnDate": null,
      "loanQuantity": 2,
      "clientId": 1,
      "itemId": 1,
      "item": {
        "id": 1,
        "name": "Arduino Uno",
        "category": "Eletrônica",
        "totalQuantity": 10,
        "location": "Prateleira A"
      }
    }
  ]
}
```

> Os empréstimos vêm ordenados do mais recente para o mais antigo. `returnDate: null` significa que o item ainda não foi devolvido.

---

## Resumo dos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/login` | Login e obtenção do token |
| `POST` | `/loan` | Criar empréstimo (controla estoque) |
| `PATCH` | `/loan/:id` | Atualizar empréstimo / registrar devolução |
| `GET` | `/item/:id/stock` | Estoque atual de um item |
| `POST` | `/movement` | Registrar movimentação manual |
| `GET` | `/movement` | Listar todas as movimentações |
| `GET` | `/movement/item/:itemId` | Movimentações de um item |
| `GET` | `/client/:id/loans` | Histórico de empréstimos de um cliente |