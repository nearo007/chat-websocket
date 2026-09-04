# Sistema de Inventário FabLab

API REST para gerir usuários, clientes, itens e empréstimos de um FabLab. Desenvolvida com Node.js, TypeScript, Express, Prisma e PostgreSQL.

## Requisitos

- Node.js `^20.19`, `^22.12` ou `>=24`
- npm 10+
- Docker com Compose, ou uma instância PostgreSQL 18

## Configuração local

```bash
npm install
cp .env.example .env
```

Substitua os segredos JWT do `.env`. Para gerar valores adequados:

```bash
openssl rand -base64 48
```

Use resultados diferentes em `JWT_SECRET` e `JWT_SECRET_REFRESH`. A aplicação recusa configurações ausentes, segredos curtos ou segredos iguais.

Inicie o banco, aplique as migrações e execute a API:

```bash
npm run start:db
```

Ou execute cada etapa separadamente:

```bash
docker compose up -d --wait postgres
npm run db:generate
npm run db:deploy
npm run dev
```

A API usa `http://localhost:3000` por padrão. Verifique:

```bash
curl http://localhost:3000/health/live
curl http://localhost:3000/health/ready
```

### Atualização de uma instalação existente

Faça backup antes de `npm run db:deploy`. A migração recusa dados que já violem as novas regras. Verifique previamente e corrija conscientemente qualquer resultado:

```sql
SELECT * FROM "Item"
WHERE "totalQuantity" < 0
   OR "availableQuantity" < 0
   OR "availableQuantity" > "totalQuantity";

SELECT LOWER("email"), COUNT(*) FROM "User"
GROUP BY LOWER("email") HAVING COUNT(*) > 1;

SELECT LOWER("email"), COUNT(*) FROM "Client"
GROUP BY LOWER("email") HAVING COUNT(*) > 1;
```

Mudanças incompatíveis: criação de usuários agora exige `ADMIN`; erros usam `{ error: { code, message } }`; criação de item exige `totalQuantity` e não aceita `availableQuantity`; alterações de quantidade exigem `adjustmentReason`; criações retornam 201; exclusões retornam 204; e excluir um empréstimo agora o cancela sem apagar o histórico.

## Primeiro administrador

A criação de usuários exige um administrador; não existe cadastro público. Numa instalação nova, defina `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` no `.env`, depois execute:

```bash
npm run db:bootstrap-admin
```

O comando só cria um usuário quando ainda não existe nenhum administrador. Depois disso, administradores podem criar outros usuários e atribuir `ADMIN` ou `OPERATOR` pela API.

### Dados de exemplo

Para preencher uma base de desenvolvimento descartável, defina senhas próprias em `SEED_ADMIN_PASSWORD` e `SEED_OPERATOR_PASSWORD`, depois execute:

```bash
npm run db:seed
```

O seed pede confirmação porque substitui os dados existentes. Para automação em uma base descartável, use `npm run db:seed -- --yes`. Toda a operação é atômica: uma falha restaura os dados anteriores.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com reload |
| `npm run build` | Gera Prisma e compila a aplicação em `dist/` |
| `npm start` | Executa a compilação de produção |
| `npm run typecheck` | Verifica aplicação, seed e testes |
| `npm test` | Testes unitários; integração é habilitada por `RUN_DB_TESTS=true` |
| `npm run test:coverage` | Testes com relatório de cobertura |
| `npm run lint` | Lint e verificação de formatação |
| `npm run check` | Lint, tipos, testes e build |
| `npm run db:migrate` | Cria/aplica migração em desenvolvimento |
| `npm run db:deploy` | Aplica migrações existentes |
| `npm run db:bootstrap-admin` | Cria com segurança o primeiro administrador |
| `npm run db:seed` | Recria os dados de demonstração |

## Regras importantes

- `ADMIN`: administra usuários e seus papéis, e pode executar todas as operações. O último administrador não pode ser excluído nem rebaixado.
- `OPERATOR`: consulta dados e cria/atualiza clientes, itens e empréstimos.
- A quantidade disponível de um item não é editável pela API. Ela é atualizada por empréstimos, devoluções e cancelamentos.
- Ao alterar a quantidade total, a quantidade disponível é recalculada preservando as unidades emprestadas.
- Alterações da quantidade total exigem um motivo e geram um registro de auditoria com o operador responsável.
- Devoluções e reaberturas são serializadas no banco e são seguras contra requisições simultâneas.
- `DELETE /loan/:id` cancela o empréstimo e preserva o histórico; não remove a linha.
- E-mails são normalizados em minúsculas e os corpos rejeitam campos desconhecidos.
- Listas são limitadas a 100 registros por requisição.

## API

A especificação completa está em [openapi.yaml](./openapi.yaml), e exemplos voltados ao frontend estão em [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

Resumo:

- `/auth`: login, refresh, logout e revogação de todas as sessões
- `/user`: administração de usuários e alteração da própria senha
- `/client`: CRUD e histórico de empréstimos
- `/item`: CRUD e filtros por categoria/localização
- `/loan`: criação, consulta, devolução/reabertura e cancelamento
- `/health`: liveness e readiness

Todos os erros usam o mesmo formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição do erro."
  }
}
```

## Segurança e integridade

- Senhas com bcrypt (cost 12) e mínimo de 12 caracteres; o limite de 72 bytes evita truncamento silencioso do bcrypt.
- JWTs de acesso e refresh usam segredos e finalidades diferentes, algoritmo fixo, issuer e audience.
- Refresh tokens são armazenados como hash, rotacionados de forma atômica e podem ser revogados.
- Login/refresh e a API possuem rate limiting.
- Helmet, limite de corpo JSON e allowlist de CORS habilitados.
- Quantidades e ordem das datas também são protegidas por constraints PostgreSQL.
- Operadores responsáveis por criar, devolver ou cancelar empréstimos são registrados.
- Logs estruturados omitem credenciais e tokens.

Não publique o `.env` nem use as senhas de seed em produção.

## Produção e Docker

O `Dockerfile` gera uma imagem sem dependências de desenvolvimento e executa como usuário não-root:

```bash
docker build -t sistema-inventario-fablab .
docker run --rm -p 3000:3000 --env-file .env sistema-inventario-fablab
```

Aplique `npm run db:deploy` como etapa única de implantação antes de iniciar novas réplicas. O processo responde a `SIGTERM`/`SIGINT`, fecha o servidor e desconecta o Prisma.

## Testes de integração

Use exclusivamente uma base descartável cujo nome contenha `test`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_test npm run db:deploy
RUN_DB_TESTS=true DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_test npm test
```

O workflow de CI provisiona essa base automaticamente e executa lint, migrações, tipos, testes, build e auditoria de dependências.
