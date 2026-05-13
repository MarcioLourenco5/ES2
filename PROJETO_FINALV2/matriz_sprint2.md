

---

## 1. Classes de Equivalência — Import CSV (`herbs.service.js`)

### 1.1 Parâmetro: `csvContent`

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-H1 | Válida | CSV com linhas válidas | `"name,sciName\na,b\nc,d"` | — | 200 |
| CE-H2 | Inválida | `null` ou `undefined` | `null` / `undefined` | `IMPORT_DATA_REQUIRED` | 400 |
| CE-H3 | Inválida | String vazia | `""` | `IMPORT_DATA_REQUIRED` | 400 |
| CE-H4 | Inválida | CSV só com header, sem dados | `"name,sciName"` | — | 200 (0 importadas) |
| CE-H5 | Inválida | Linha com `name` vazio | `"n,s\n,b"` | `HERB_NAME_REQUIRED` | 422 |
| CE-H6 | Inválida | Linha com `scientificName` vazio | `"n,s\na,"` | `HERB_SCIENTIFIC_NAME_REQUIRED` | 422 |
| CE-H7 | Inválida | Tipo inválido: número | `12345` | `IMPORT_INVALID_FORMAT` | 400 |
| CE-H8 | Inválida | Tipo inválido: array/objeto | `[1,2,3]` / `{}` | `IMPORT_INVALID_FORMAT` | 400 |
| CE-H9 | Válida | Linha com description opcional ausente | `"n,s\na,b"` | — | 200 |
| CE-H10 | Inválida | Nome duplicado (existingHerbs) | nome já existente | `HERB_DUPLICATE` | 422 |
| CE-H11 | Inválida | Linha com `name` só espaços | `"n,s\n   ,b"` | `HERB_NAME_REQUIRED` | 422 |

### 1.2 Parâmetro: `existingHerbs` (para deteção de duplicados)

| ID | Tipo | Descrição | Input Representativo | Resultado |
|----|------|-----------|----------------------|-----------|
| CE-E1 | Válida | Array vazio (sem duplicados) | `[]` | Todas importadas |
| CE-E2 | Válida | Array com ervas existentes | `[{name: "X"}]` | Duplicado ignorado |

---

## 2. Classes de Equivalência — Planos (`plans.service.js`)

### 2.1 Parâmetro: `type`

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-PT1 | Válida | Regular | `"regular"` | — | 201 |
| CE-PT2 | Válida | Emergência | `"emergência"` | — | 201 |
| CE-PT3 | Válida | Pontual (c/ authorizedBy) | `"pontual"` + auth | — | 201 |
| CE-PT4 | Inválida | Tipo inexistente | `"inexistente"` | `PLAN_TYPE_INVALID` | 400 |
| CE-PT5 | Inválida | `null` ou `undefined` | `null` / `undefined` | `PLAN_TYPE_REQUIRED` | 400 |
| CE-PT6 | Inválida | Tipo numérico (type mismatch) | `123` | `PLAN_TYPE_MISMATCH` | 400 |
| CE-PT7 | Inválida | String vazia | `""` | `PLAN_TYPE_INVALID` | 400 |

### 2.2 Parâmetro: `herbId`

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-PH1 | Válida | Número | `1` | — | 201 |
| CE-PH2 | Inválida | `null` ou `undefined` | `null` | `PLAN_HERBID_REQUIRED` | 400 |
| CE-PH3 | Inválida | String (type mismatch) | `"um"` | `PLAN_TYPE_MISMATCH` | 400 |
| CE-PH4 | Inválida | Array/boolean | `[1]` / `true` | `PLAN_TYPE_MISMATCH` | 400 |

### 2.3 Parâmetro: `name`

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-PN1 | Válida | String não vazia | `"Plano A"` | — | 201 |
| CE-PN2 | Inválida | `null` ou `undefined` | `null` | `PLAN_NAME_REQUIRED` | 400 |
| CE-PN3 | Inválida | String vazia | `""` | `PLAN_NAME_INVALID` | 400 |
| CE-PN4 | Inválida | Só espaços | `"   "` | `PLAN_NAME_INVALID` | 400 |
| CE-PN5 | Inválida | Tipo numérico | `123` | `PLAN_TYPE_MISMATCH` | 400 |

### 2.4 Parâmetro: `authorizedBy` (para tipo `pontual`)

| ID | Tipo | Descrição | Input Representativo | Código de Erro | HTTP |
|----|------|-----------|----------------------|---------------|------|
| CE-PA1 | Válida | Número presente | `2` | — | 201 |
| CE-PA2 | Inválida | `null` ou `undefined` | `null` | `PLAN_AUTHORIZATION_REQUIRED` | 403 |
| CE-PA3 | Inválida | String (type mismatch) | `"dois"` | `PLAN_TYPE_MISMATCH` | 400 |

---

## 3. Análise de Valores Limite (BVA)

### 3.1 Temperatura — Intervalo [18, 28] ºC

| ID | Valor | Tipo | Resultado Esperado | Código de Erro |
|----|-------|------|--------------------|---------------|
| BVA-T1 | 17 | Abaixo do mínimo | Rejeitado | `PLAN_TEMPERATURE_MIN_INVALID` |
| BVA-T2 | 18 | Limite inferior | Aceite | — |
| BVA-T3 | 23 | Valor nominal | Aceite | — |
| BVA-T4 | 28 | Limite superior | Aceite | — |
| BVA-T5 | 29 | Acima do máximo | Rejeitado | `PLAN_TEMPERATURE_MAX_INVALID` |

### 3.2 Humidade — Intervalo [40, 80] %

| ID | Valor | Tipo | Resultado Esperado | Código de Erro |
|----|-------|------|--------------------|---------------|
| BVA-H1 | 39 | Abaixo do mínimo | Rejeitado | `PLAN_HUMIDITY_MIN_INVALID` |
| BVA-H2 | 40 | Limite inferior | Aceite | — |
| BVA-H3 | 60 | Valor nominal | Aceite | — |
| BVA-H4 | 80 | Limite superior | Aceite | — |
| BVA-H5 | 81 | Acima do máximo | Rejeitado | `PLAN_HUMIDITY_MAX_INVALID` |

### 3.3 Luminosidade — Intervalo [5000, 25000] lux

| ID | Valor | Tipo | Resultado Esperado | Código de Erro |
|----|-------|------|--------------------|---------------|
| BVA-L1 | 4999 | Abaixo do mínimo | Rejeitado | `PLAN_LUMINOSITY_MIN_INVALID` |
| BVA-L2 | 5000 | Limite inferior | Aceite | — |
| BVA-L3 | 15000 | Valor nominal | Aceite | — |
| BVA-L4 | 25000 | Limite superior | Aceite | — |
| BVA-L5 | 25001 | Acima do máximo | Rejeitado | `PLAN_LUMINOSITY_MAX_INVALID` |

### 3.4 Duração do Ciclo — Intervalo [1, 365] dias

| ID | Valor | Tipo | Resultado Esperado | Código de Erro |
|----|-------|------|--------------------|---------------|
| BVA-C1 | 0 | Abaixo do mínimo | Rejeitado | `PLAN_CYCLE_INVALID` |
| BVA-C2 | 1 | Limite inferior | Aceite | — |
| BVA-C3 | 90 | Valor nominal | Aceite | — |
| BVA-C4 | 365 | Limite superior | Aceite | — |
| BVA-C5 | 366 | Acima do máximo | Rejeitado | `PLAN_CYCLE_INVALID` |

---

## 4. Casos de Teste — Sprint 2

### 4.1 Testes de Unidade — Import CSV Herbs

| ID | Requisito / Regra | Endpoint / Módulo | Nível | Técnica | Resultado Esperado | Pré-condições |
|----|-------------------|-------------------|-------|---------|--------------------|---------------|
| TU-H01 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (CSV com 2 linhas válidas: nome + scientificName preenchidos) | Serviço importa 2 ervas com sucesso. Retorna `imported=2`, `skipped=0`, lista de erros vazia. | Nenhuma. Teste isolado sobre o serviço, sem dependências de BD ou rede. |
| TU-H02 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (csvContent = null) | Serviço rejeita `null` e retorna código `IMPORT_DATA_REQUIRED` com status 400. Nenhuma erva importada. | — |
| TU-H03 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (csvContent = undefined) | Serviço rejeita `undefined` e retorna código `IMPORT_DATA_REQUIRED` com status 400. Nenhuma erva importada. | — |
| TU-H04 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (csvContent = string vazia ou só espaços) | Serviço rejeita string vazia/whitespace e retorna código `IMPORT_DATA_REQUIRED` com status 400. Nenhuma erva importada. | — |
| TU-H05 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (CSV apenas com header, sem linhas de dados) | Serviço processa CSV sem linhas de dados. Retorna `imported=0`, `skipped=0`, lista de erros vazia. | — |
| TU-H06 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (linha CSV com name vazio) | Serviço ignora a linha com `name` vazio. Retorna `skipped=1` com código `HERB_NAME_REQUIRED` no erro. | — |
| TU-H07 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (linha CSV com scientificName vazio) | Serviço ignora a linha com `scientificName` vazio. Retorna `skipped=1` com código `HERB_SCIENTIFIC_NAME_REQUIRED` no erro. | — |
| TU-H08 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (csvContent = número, type mismatch) | Serviço rejeita input numérico (esperava string CSV). Retorna código `IMPORT_INVALID_FORMAT` com status 400. | — |
| TU-H09 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (csvContent = array/objeto, type mismatch) | Serviço rejeita array ou objeto (esperava string CSV). Retorna código `IMPORT_INVALID_FORMAT` com status 400. | — |
| TU-H10 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (CSV com description opcional presente) | Serviço importa linha preservando o campo description. Retorna `imported=1` com description no objeto. | — |
| TU-H11 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (nome duplicado em existingHerbs, comparação case-insensitive) | Serviço deteta nome duplicado (ignora maiúsculas/minúsculas) e ignora a linha. Retorna `skipped=1` com código `HERB_DUPLICATE` no erro. | Array `existingHerbs` contém erva registada com o mesmo nome. |
| TU-H12 | RF-03: importação de catálogo de ervas via CSV | `importHerbsFromCsv()` | Unidade | Particionamento de Equivalência (name composto apenas por espaços) | Serviço trata nome só com espaços como inválido. Ignora a linha e retorna `skipped=1` com código `HERB_NAME_REQUIRED` no erro. | — |

### 4.2 Testes de Unidade — Criação de Planos (PE)

| ID | Requisito / Regra | Endpoint / Módulo | Nível | Técnica | Resultado Esperado | Pré-condições |
|----|-------------------|-------------------|-------|---------|--------------------|---------------|
| TU-P01 | RF-04: criação de plano de cultivo — tipo "regular" | `validatePlan()` | Unidade | Particionamento de Equivalência (type = "regular", válido) | Validador aceita tipo "regular". Retorna `valid=true` com `plan.type="regular"` e campos preenchidos com valores por defeito. | Nenhuma. Teste isolado sobre o validador, sem dependências de BD ou rede. |
| TU-P02 | RF-04: criação de plano de cultivo — tipo "emergência" | `validatePlan()` | Unidade | Particionamento de Equivalência (type = "emergência", válido) | Validador aceita tipo "emergência". Retorna `valid=true` sem erros. | — |
| TU-P03 | RF-04: criação de plano de cultivo — tipo "pontual" com autorização | `validatePlan()` | Unidade | Particionamento de Equivalência (type = "pontual" + authorizedBy = 2, válido) | Validador aceita tipo "pontual" com authorizedBy preenchido. Retorna `valid=true` e `plan.authorizedBy=2`. | — |
| TU-P04 | RF-04: criação de plano de cultivo — type inválido | `validatePlan()` | Unidade | Particionamento de Equivalência (type = "inexistente", inválido) | Validador rejeita type desconhecido. Retorna `valid=false` com código `PLAN_TYPE_INVALID` e status 400. | — |
| TU-P05 | RF-04: criação de plano de cultivo — type null | `validatePlan()` | Unidade | Particionamento de Equivalência (type = null/undefined, ausente) | Validador rejeita type ausente. Retorna `valid=false` com código `PLAN_TYPE_REQUIRED` e status 400. | — |
| TU-P06 | RF-04: criação de plano de cultivo — type numérico | `validatePlan()` | Unidade | Particionamento de Equivalência (type = 123, type mismatch: esperava string, recebeu número) | Validador rejeita type numérico. Retorna `valid=false` com código `PLAN_TYPE_MISMATCH` e status 400. | — |
| TU-P07 | RF-04: criação de plano de cultivo — herbId null | `validatePlan()` | Unidade | Particionamento de Equivalência (herbId = null/undefined, ausente) | Validador rejeita herbId ausente. Retorna `valid=false` com código `PLAN_HERBID_REQUIRED` e status 400. | — |
| TU-P08 | RF-04: criação de plano de cultivo — herbId string | `validatePlan()` | Unidade | Particionamento de Equivalência (herbId = "um", type mismatch: esperava número, recebeu string) | Validador rejeita herbId do tipo string. Retorna `valid=false` com código `PLAN_TYPE_MISMATCH` e status 400. | — |
| TU-P09 | RF-04: criação de plano de cultivo — name vazio | `validatePlan()` | Unidade | Particionamento de Equivalência (name = "", inválido) | Validador rejeita name vazio. Retorna `valid=false` com código `PLAN_NAME_INVALID` e status 400. | — |
| TU-P10 | RF-04: criação de plano de cultivo — name só espaços | `validatePlan()` | Unidade | Particionamento de Equivalência (name = "   ", apenas espaços) | Validador rejeita name composto apenas por espaços. Retorna `valid=false` com código `PLAN_NAME_INVALID` e status 400. | — |
| TU-P11 | RF-04: criação de plano de cultivo — pontual sem autorização | `validatePlan()` | Unidade | Particionamento de Equivalência (type = "pontual", authorizedBy ausente) | Validador rejeita plano pontual sem authorizedBy. Retorna `valid=false` com código `PLAN_AUTHORIZATION_REQUIRED` e status 403. | — |
| TU-P34 | RF-04: criação de plano de cultivo — dados vazios/nulos | `validatePlan()` | Unidade | Particionamento de Equivalência (planData = null ou objeto vazio) | Validador rejeita planData nulo ou vazio. Retorna `valid=false` com status 400. | — |

### 4.3 Testes de Unidade — Planos (BVA + Type Mismatch)

| ID | Requisito / Regra | Endpoint / Módulo | Nível | Técnica | Resultado Esperado | Pré-condições |
|----|-------------------|-------------------|-------|---------|--------------------|---------------|
| TU-P12 | RN-01: intervalo temperatura [18, 28] ºC | `validatePlan()` | Unidade | Valores Limite (temperatura.min = 17 ºC — abaixo do mínimo) | Validador rejeita temperatura mínima de 17ºC (abaixo do limite inferior de 18ºC). Retorna `valid=false` com código `PLAN_TEMPERATURE_MIN_INVALID` e status 400. | Nenhuma. Teste isolado sobre o validador, sem dependências de BD ou rede. |
| TU-P13 | RN-01: intervalo temperatura [18, 28] ºC | `validatePlan()` | Unidade | Valores Limite (temperatura.min = 18 ºC — limite inferior) | Validador aceita temperatura mínima de 18ºC (limite inferior do intervalo). Retorna `valid=true`. | — |
| TU-P14 | RN-01: intervalo temperatura [18, 28] ºC | `validatePlan()` | Unidade | Valores Limite (temperatura = 23 ºC — valor nominal) | Validador aceita temperatura de 23ºC (valor nominal dentro do intervalo [18, 28]). Retorna `valid=true`. | — |
| TU-P15 | RN-01: intervalo temperatura [18, 28] ºC | `validatePlan()` | Unidade | Valores Limite (temperatura.max = 28 ºC — limite superior) | Validador aceita temperatura máxima de 28ºC (limite superior do intervalo). Retorna `valid=true`. | — |
| TU-P16 | RN-01: intervalo temperatura [18, 28] ºC | `validatePlan()` | Unidade | Valores Limite (temperatura.max = 29 ºC — acima do máximo) | Validador rejeita temperatura máxima de 29ºC (acima do limite superior de 28ºC). Retorna `valid=false` com código `PLAN_TEMPERATURE_MAX_INVALID` e status 400. | — |
| TU-P17 | RN-01: intervalo humidade [40, 80] % | `validatePlan()` | Unidade | Valores Limite (humidade.min = 39 % — abaixo do mínimo) | Validador rejeita humidade mínima de 39% (abaixo do limite inferior de 40%). Retorna `valid=false` com código `PLAN_HUMIDITY_MIN_INVALID` e status 400. | — |
| TU-P18 | RN-01: intervalo humidade [40, 80] % | `validatePlan()` | Unidade | Valores Limite (humidade.min = 40 % — limite inferior) | Validador aceita humidade mínima de 40% (limite inferior do intervalo). Retorna `valid=true`. | — |
| TU-P19 | RN-01: intervalo humidade [40, 80] % | `validatePlan()` | Unidade | Valores Limite (humidade = 60 % — valor nominal) | Validador aceita humidade de 60% (valor nominal dentro do intervalo [40, 80]). Retorna `valid=true`. | — |
| TU-P20 | RN-01: intervalo humidade [40, 80] % | `validatePlan()` | Unidade | Valores Limite (humidade.max = 80 % — limite superior) | Validador aceita humidade máxima de 80% (limite superior do intervalo). Retorna `valid=true`. | — |
| TU-P21 | RN-01: intervalo humidade [40, 80] % | `validatePlan()` | Unidade | Valores Limite (humidade.max = 81 % — acima do máximo) | Validador rejeita humidade máxima de 81% (acima do limite superior de 80%). Retorna `valid=false` com código `PLAN_HUMIDITY_MAX_INVALID` e status 400. | — |
| TU-P22 | RN-01: intervalo luminosidade [5000, 25000] lux | `validatePlan()` | Unidade | Valores Limite (luminosidade.min = 4999 lux — abaixo do mínimo) | Validador rejeita luminosidade mínima de 4999 lux (abaixo do limite inferior de 5000). Retorna `valid=false` com código `PLAN_LUMINOSITY_MIN_INVALID` e status 400. | — |
| TU-P23 | RN-01: intervalo luminosidade [5000, 25000] lux | `validatePlan()` | Unidade | Valores Limite (luminosidade.min = 5000 lux — limite inferior) | Validador aceita luminosidade mínima de 5000 lux (limite inferior do intervalo). Retorna `valid=true`. | — |
| TU-P24 | RN-01: intervalo luminosidade [5000, 25000] lux | `validatePlan()` | Unidade | Valores Limite (luminosidade = 15000 lux — valor nominal) | Validador aceita luminosidade de 15000 lux (valor nominal dentro do intervalo [5000, 25000]). Retorna `valid=true`. | — |
| TU-P25 | RN-01: intervalo luminosidade [5000, 25000] lux | `validatePlan()` | Unidade | Valores Limite (luminosidade.max = 25000 lux — limite superior) | Validador aceita luminosidade máxima de 25000 lux (limite superior do intervalo). Retorna `valid=true`. | — |
| TU-P26 | RN-01: intervalo luminosidade [5000, 25000] lux | `validatePlan()` | Unidade | Valores Limite (luminosidade.max = 25001 lux — acima do máximo) | Validador rejeita luminosidade máxima de 25001 lux (acima do limite superior de 25000). Retorna `valid=false` com código `PLAN_LUMINOSITY_MAX_INVALID` e status 400. | — |
| TU-P27 | RN-01: intervalo duração ciclo [1, 365] dias | `validatePlan()` | Unidade | Valores Limite (cycleDays = 0 — abaixo do mínimo) | Validador rejeita ciclo de 0 dias (abaixo do limite inferior de 1). Retorna `valid=false` com código `PLAN_CYCLE_INVALID` e status 400. | — |
| TU-P28 | RN-01: intervalo duração ciclo [1, 365] dias | `validatePlan()` | Unidade | Valores Limite (cycleDays = 1 — limite inferior) | Validador aceita ciclo de 1 dia (limite inferior do intervalo). Retorna `valid=true`. | — |
| TU-P29 | RN-01: intervalo duração ciclo [1, 365] dias | `validatePlan()` | Unidade | Valores Limite (cycleDays = 90 — valor nominal) | Validador aceita ciclo de 90 dias (valor nominal dentro do intervalo [1, 365]). Retorna `valid=true`. | — |
| TU-P30 | RN-01: intervalo duração ciclo [1, 365] dias | `validatePlan()` | Unidade | Valores Limite (cycleDays = 365 — limite superior) | Validador aceita ciclo de 365 dias (limite superior do intervalo). Retorna `valid=true`. | — |
| TU-P31 | RN-01: intervalo duração ciclo [1, 365] dias | `validatePlan()` | Unidade | Valores Limite (cycleDays = 366 — acima do máximo) | Validador rejeita ciclo de 366 dias (acima do limite superior de 365). Retorna `valid=false` com código `PLAN_CYCLE_INVALID` e status 400. | — |
| TU-P32 | RN-01: validação de tipos — temperatura.min é string | `validatePlan()` | Unidade | Type Mismatch (temperatura.min = "17", string em vez de número) | Validador rejeita temperatura.min do tipo string. Retorna `valid=false` com código `PLAN_TEMPERATURE_MIN_INVALID` e status 400. | — |
| TU-P33 | RN-01: validação de tipos — cycleDays é string | `validatePlan()` | Unidade | Type Mismatch (cycleDays = "90", string em vez de número) | Validador rejeita cycleDays do tipo string. Retorna `valid=false` com código `PLAN_TYPE_MISMATCH` e status 400. | — |

**Total Sprint 2:** 12 (herbs) + 23 (plans) = **35 testes de unidade** — todos passam ✓

**Total acumulado (Sprint 1 + Sprint 2):** 13 + 35 = **48 testes de unidade**

---

## 5.  Requisito → Casos de Teste

| Requisito | Casos de Teste |
|-----------|---------------|
| **RF-03**: Importação CSV de ervas aromáticas | TU-H01 a TU-H12 |
| **RF-04**: Criação de planos de cultivo | TU-P01 a TU-P11, TU-P34 |
| **RN-01**: Intervalo temperatura [18, 28] ºC | TU-P12 a TU-P16, TU-P32 |
| **RN-01**: Intervalo humidade [40, 80] % | TU-P17 a TU-P21 |
| **RN-01**: Intervalo luminosidade [5000, 25000] lux | TU-P22 a TU-P26 |
| **RN-01**: Intervalo duração ciclo [1, 365] dias | TU-P27 a TU-P31, TU-P33 |
| Type Mismatch / validação de tipos | TU-P06, TU-P08, TU-P32, TU-P33, TU-P34 |



