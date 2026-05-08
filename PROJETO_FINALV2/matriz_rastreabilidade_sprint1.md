# Matriz de Rastreabilidade — Sprint 1
## Plataforma GREENHERB — Testes de Unidade: Autenticação

**Requisito coberto:** RF-AUTH — Autenticação de utilizador  
O sistema deve validar `username` e `password`, emitir um JWT em caso de sucesso e retornar códigos de erro estruturados em caso de falha.

**Unidade testada:** `authenticate(username, password, usersStore)` em `src/services/auth.service.js`  
**Framework:** Jest | **Ficheiro:** `tests/unit/auth.service.test.js`  
**Tipo de teste:** Caixa-Preta (Black Box)  
**Técnica:** Particionamento de Equivalência  
**Dependências mockadas:** `bcryptjs` (`compare`, `hashSync`), `jsonwebtoken` (`sign`)

---

## 1. Classes de Equivalência

### 1.1 Username

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-U1 | Válida | Username existe no sistema, password correta | `"admin"` | — | 200 |
| CE-U2 | Inválida | String vazia | `""` | `USERNAME_INVALID` | 400 |
| CE-U3 | Inválida | `null` ou `undefined` | `null` / `undefined` | `USERNAME_REQUIRED` | 400 |
| CE-U4 | Inválida | String válida mas utilizador inexistente | `"fantasma"` | `CREDENTIALS_INVALID` | 401 |
| CE-U5 | Inválida | String composta só por espaços | `"   "` | `USERNAME_INVALID` | 400 |
| CE-U6 | Inválida | Utilizador com `active=false` | `"inativo"` | `USER_INACTIVE` | 403 |

### 1.2 Password

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-P1 | Válida | Password correta para o utilizador | `"Admin@1234"` | — | 200 |
| CE-P2 | Inválida | String vazia | `""` | `PASSWORD_INVALID` | 400 |
| CE-P3 | Inválida | `null` ou `undefined` | `null` / `undefined` | `PASSWORD_REQUIRED` | 400 |
| CE-P4 | Inválida | Password incorrecta (utilizador existe) | `"SenhaErrada1"` | `CREDENTIALS_INVALID` | 401 |
| CE-P5 | Inválida | String composta só por espaços | `"        "` | `PASSWORD_INVALID` | 400 |

---

## 2. Casos de Teste

| ID | Requisito | Endpoint / Módulo | Nível | Técnica | Classe | Resultado Esperado | Pré-condições |
|----|-----------|-------------------|-------|---------|--------|--------------------|---------------|
| TU-A01 | RF-AUTH: login com credenciais válidas | `authenticate()` | Unidade | PE — CE-U1+CE-P1 | ✓ | `success=true`, `status=200` | Mock user `admin`, `active=true`; `bcrypt.compare` → `true` |
| TU-A02 | RF-AUTH: username vazio rejeitado | `authenticate()` | Unidade | PE — CE-U2 | ✓ | `status=400`, `code=USERNAME_INVALID` | — |
| TU-A03 | RF-AUTH: username null rejeitado | `authenticate()` | Unidade | PE — CE-U3 | ✓ | `status=400`, `code=USERNAME_REQUIRED` | — |
| TU-A04 | RF-AUTH: username undefined rejeitado | `authenticate()` | Unidade | PE — CE-U3 | ✓ | `status=400`, `code=USERNAME_REQUIRED` | — |
| TU-A05 | RF-AUTH: utilizador não existe | `authenticate()` | Unidade | PE — CE-U4 | ✓ | `status=401`, `code=CREDENTIALS_INVALID` | — |
| TU-A06 | RF-AUTH: username só com espaços | `authenticate()` | Unidade | PE — CE-U5 | ✓ | `status=400`, `code=USERNAME_INVALID` | — |
| TU-A07 | RF-AUTH: utilizador inativo bloqueado | `authenticate()` | Unidade | PE — CE-U6 | ✓ | `status=403`, `code=USER_INACTIVE` | Mock user `inativo`, `active=false` |
| TU-A08 | RF-AUTH: password correcta aceite | `authenticate()` | Unidade | PE — CE-P1 | ✓ | `success=true`, `status=200` | `bcrypt.compare` → `true` |
| TU-A09 | RF-AUTH: password vazia rejeitada | `authenticate()` | Unidade | PE — CE-P2 | ✓ | `status=400`, `code=PASSWORD_INVALID` | — |
| TU-A10 | RF-AUTH: password null rejeitada | `authenticate()` | Unidade | PE — CE-P3 | ✓ | `status=400`, `code=PASSWORD_REQUIRED` | — |
| TU-A11 | RF-AUTH: password undefined rejeitada | `authenticate()` | Unidade | PE — CE-P3 | ✓ | `status=400`, `code=PASSWORD_REQUIRED` | — |
| TU-A12 | RF-AUTH: password incorrecta (user existe) | `authenticate()` | Unidade | PE — CE-P4 | ✓ | `status=401`, `code=CREDENTIALS_INVALID` | `bcrypt.compare` → `false` |
| TU-A13 | RF-AUTH: password só com espaços | `authenticate()` | Unidade | PE — CE-P5 | ✓ | `status=400`, `code=PASSWORD_INVALID` | — |
| TU-A14 | RF-AUTH: username e password simultaneamente vazios | `authenticate()` | Unidade | PE — CE-U2+CE-P2 | ✓ | `status=400`, `code=USERNAME_INVALID` | Validação de username precede a de password |
| TU-A15 | RF-AUTH: username e password simultaneamente null/undefined | `authenticate()` | Unidade | PE — CE-U3+CE-P3 | ✓ | `status=400`, `code=USERNAME_REQUIRED` | Validação de username precede a de password |

**Total Sprint 1:** 15 testes de unidade — todos passam ✓

---

## 3. Tabela Inversa: Requisito → Casos de Teste

| Requisito | Casos de Teste |
|-----------|---------------|
| RF-AUTH: validação de username (formato e presença) | TU-A02, TU-A03, TU-A04, TU-A06 |
| RF-AUTH: utilizador deve existir no sistema | TU-A05 |
| RF-AUTH: utilizador deve estar activo | TU-A07 |
| RF-AUTH: validação de password (formato e presença) | TU-A09, TU-A10, TU-A11, TU-A13 |
| RF-AUTH: password verificada com bcrypt | TU-A12 |
| RF-AUTH: login com sucesso emite JWT | TU-A01, TU-A08 |
| RF-AUTH: prioridade de validação (username validado antes de password) | TU-A14, TU-A15 |

---

## 4. Resultado de Execução (Sprint 1)

```
Test Suites: 1 passed
Tests:       15 passed
Time:        ~1.2s
```

| Métrica (`auth.service.js`) | Valor |
|-----------------------------|-------|
| Statement coverage | 91% |
| Branch coverage | 89% |
| Function coverage | 100% |
