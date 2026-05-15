# Matriz de Rastreabilidade - Sprint 3
## Plataforma GREENHERB - Testes de Unidade Restantes

**Objetivo do Sprint 3:** criar testes de unidade para requisitos ainda nao cobertos e atualizar a rastreabilidade entre requisitos, tecnicas de teste e casos executados.

**Framework:** Jest  
**Comando de execucao:** `node exec-sprint3.js` ou `npm.cmd run test:sprint3`  
**Resultado validado:** 6 test suites passed, 67 tests passed

---

## 1. Tecnicas Aplicadas

| Tecnica | Ficheiros | Casos |
|---------|-----------|-------|
| Particionamento de Equivalencia (PE) | `herbs.validator.test.js`, `csvParser.test.js`, `herbs.accessControl.test.js`, `auth.service.test.js` | TU-H01 a TU-H19, TU-H36 a TU-H52, TU-A01 a TU-A15 |
| MC/DC | `authorization.mcdc.test.js` | TU-H20 a TU-H29 |
| Analise de Valores Limite (BVA/VL) | `herbs.boundaries.test.js` | TU-H30 a TU-H35 |

---

## 2. Matriz Requisito -> Testes

| Requisito / Regra | Modulo | Tecnica | Casos de Teste | Resultado Esperado |
|-------------------|--------|---------|----------------|--------------------|
| RF-HERB-01: validar nome da erva | `src/utils/herbValidator.js` | PE | TU-H01 a TU-H06 | Aceitar nomes validos e rejeitar nome vazio, nulo, indefinido ou so com espacos |
| RF-HERB-02: validar nome cientifico | `src/utils/herbValidator.js` | PE | TU-H07 a TU-H09 | Rejeitar `scientificName` vazio/nulo e validar prioridade de erros |
| RF-HERB-03: importar/interpretar linhas CSV | `src/utils/csvParser.js` | PE | TU-H10 a TU-H19 | Interpretar CSV valido, campos com aspas, espacos, descricao vazia e linhas invalidas |
| RN-HERB-01: limite de descricao [0, 1000] caracteres | `src/utils/herbValidator.js` | VL | TU-H30 a TU-H35 | Aceitar 0, 1, 500 e 1000 caracteres; rejeitar 1001 e 5000 |
| RF-ACL-01: leitura de ervas por perfil autenticado | `tests/unit/herbs.accessControl.test.js` | PE | TU-H36 a TU-H39 | Tecnico, Responsavel e Administrador podem ler; sem autenticacao e rejeitado |
| RF-ACL-02: atualizacao/criacao de ervas | `tests/unit/herbs.accessControl.test.js` | PE | TU-H40 a TU-H42, TU-H47 a TU-H49 | Responsavel e Administrador podem alterar/criar; Tecnico nao pode |
| RF-ACL-03: remocao/importacao de ervas | `tests/unit/herbs.accessControl.test.js` | PE | TU-H43 a TU-H46, TU-H50 a TU-H52 | Apenas Administrador pode remover/importar; restantes perfis sao rejeitados |
| RF-AUTHZ-01: autorizacao por papel e token | `src/middleware/auth.middleware.js` | MC/DC | TU-H20 a TU-H29 | Cobrir combinacoes independentes entre papel permitido, papel nao permitido e token presente/ausente |

---

## 3. Casos de Teste Sprint 3

| Intervalo | Ficheiro | Total | Tecnica |
|-----------|----------|-------|---------|
| TU-H01 a TU-H09 | `tests/unit/herbs.validator.test.js` | 9 | PE |
| TU-H10 a TU-H19 | `tests/unit/csvParser.test.js` | 10 | PE |
| TU-H20 a TU-H29 | `tests/unit/authorization.mcdc.test.js` | 10 | MC/DC |
| TU-H30 a TU-H35 | `tests/unit/herbs.boundaries.test.js` | 6 | VL |
| TU-H36 a TU-H52 | `tests/unit/herbs.accessControl.test.js` | 17 | PE |

**Total Sprint 3:** 52 novos testes de unidade.  
**Total executado no comando `test:sprint3`:** 67 testes, incluindo os 15 testes de autenticacao ja existentes.

---

## 4. Resultado de Execucao

```text
Test Suites: 6 passed, 6 total
Tests:       67 passed, 67 total
Snapshots:   0 total
Time:        ~0.8s
```

