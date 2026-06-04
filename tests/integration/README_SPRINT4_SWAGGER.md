# Sprint 4 — Swagger/OpenAPI + Testes de Integração em JS

Esta versão usa Swagger/OpenAPI para documentar a API e Jest/Supertest para executar os testes de integração em JavaScript, mantendo o mesmo estilo técnico dos restantes testes do projeto.

## O que foi atualizado

- Os casos adicionais foram adaptados aos controladores, rotas e endpoints reais do projeto.
- Não foram usadas coleções Postman/Newman em JSON.
- O ficheiro `tests/integration/swagger.integration.test.js` contém 111 testes de integração.
- Foram corrigidas diferenças importantes face à lista externa de testes:
  - relatórios: `POST /reports` + `GET /reports/:id/export`, não `GET /reports/export`;
  - automação: `PATCH /automation/:id/mode`, não `POST /automation/mode`;
  - alertas: `PATCH /alerts/:id/resolve` e `PATCH /alerts/:id/ignore`, não `PATCH /alerts/:id` com `action`;
  - importação de ervas: JSON `{ data: csv }`, não multipart;
  - tarefas: `PATCH /tasks/:id`, não `PUT /tasks/:id`;
  - perfis reais: `Técnico`, `Responsável`, `Administrador`.

## Como executar

```bash
npm install
npm run swagger:json
npm run test:integration
```

## Endpoints Swagger

Com a API iniciada:

```bash
npm start
```

Abrir:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/swagger.json`

## Ficheiro principal de testes

```text
tests/integration/swagger.integration.test.js
```

Os testes validam os contratos documentados no Swagger, usando chamadas HTTP reais contra a app Express montada em `src/app.js`.
