/**
 * Testes White-box — MCC (Multiple Condition Coverage)
 * Unidade: validatePlan() em src/services/plans.service.js
 *
 * Técnica: Whitebox — MCC (Cobertura de Múltiplas Condições)
 * Para cada decisão (if) com n condições atómicas → 2^n linhas na tabela de verdade.
 * Linhas infeasíveis são documentadas mas não geram teste.
 * Total de ifs na função: 36
 *
 * Nomenclatura dos testes:
 *   IF-XX (Cn=V|F, ...) → resultado esperado
 */

const ERRORS = require('../../src/config/errors');
const { validatePlan } = require('../../src/services/plans.service');

// Plano base completamente válido — garante que todas as restantes condições têm ramo F
const BASE = {
  herbId: 1,
  type: 'regular',
  name: 'Plano Whitebox',
  temperature: { min: 20, max: 26 },
  humidity:    { min: 50, max: 70 },
  luminosity:  { min: 8000, max: 20000 },
  cycleDays: 90,
};

// Plano base válido para tipo pontual (authorizedBy=2 é Responsável ativo)
const BASE_PONTUAL = { ...BASE, type: 'pontual', authorizedBy: 2 };

// ─────────────────────────────────────────────────────────────────────────────
// IF-01 — if (!planData || typeof planData !== 'object' || Array.isArray(planData))
//
// C1 = !planData
// C2 = typeof planData !== 'object'
// C3 = Array.isArray(planData)
//
// Tabela de verdade 2^3 = 8 linhas:
// Linha | C1 | C2 | C3 | Decisão | Feasível?
//   1   |  V |  V |  V |    V    | NÃO — array falsy não existe em JS
//   2   |  V |  V |  F |    V    | SIM — valor falsy e não-objeto (ex: 0, false)
//   3   |  V |  F |  V |    V    | NÃO — arrays vazios [] não são falsy
//   4   |  V |  F |  F |    V    | SIM — null (!null=V, typeof null==='object')
//   5   |  F |  V |  V |    V    | NÃO — typeof!=='object' é incompatível com isArray
//   6   |  F |  V |  F |    V    | SIM — string/number/boolean truthy
//   7   |  F |  F |  V |    V    | SIM — array não vazio
//   8   |  F |  F |  F |    F    | SIM — objeto válido
// Infeasíveis: linhas 1, 3, 5
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-01 — !planData || typeof !== object || Array.isArray (2^3=8, 5 feasíveis)', () => {
  // Linha 2 (V,V,F): valor falsy E não-objeto → ex: 0
  test('IF-01 (C1=V,C2=V,C3=F) | 0 → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan(0);
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  // Linha 4 (V,F,F): null (!null=V, typeof null==='object', !isArray)
  test('IF-01 (C1=V,C2=F,C3=F) | null → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan(null);
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  // Linha 6 (F,V,F): string truthy → typeof!=='object', não falsy, não array
  test('IF-01 (C1=F,C2=V,C3=F) | string → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan('invalido');
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  // Linha 7 (F,F,V): array → ![] = falso, typeof [] === 'object', isArray = verdade
  test('IF-01 (C1=F,C2=F,C3=V) | array → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan([1, 2]);
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  // Linha 8 (F,F,F): objeto válido → todos falsos → ramo F (não entra no if)
  test('IF-01 (C1=F,C2=F,C3=F) | objeto válido → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_TYPE_MISMATCH);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-02 — if (herbId === null || herbId === undefined)
//
// C1 = herbId === null
// C2 = herbId === undefined
//
// Tabela de verdade 2^2 = 4 linhas:
// Linha | C1 | C2 | Decisão | Feasível?
//   1   |  V |  V |    V    | NÃO — um valor não pode ser null E undefined ao mesmo tempo
//   2   |  V |  F |    V    | SIM — herbId = null
//   3   |  F |  V |    V    | SIM — herbId = undefined
//   4   |  F |  F |    F    | SIM — herbId = número
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-02 — herbId === null || herbId === undefined (2^2=4, 3 feasíveis)', () => {
  // Linha 2 (V,F): null
  test('IF-02 (C1=V,C2=F) | herbId null → rejeita PLAN_HERBID_REQUIRED', () => {
    const r = validatePlan({ ...BASE, herbId: null });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HERBID_REQUIRED);
  });

  // Linha 3 (F,V): undefined
  test('IF-02 (C1=F,C2=V) | herbId undefined → rejeita PLAN_HERBID_REQUIRED', () => {
    const { herbId, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HERBID_REQUIRED);
  });

  // Linha 4 (F,F): número válido → ramo F
  test('IF-02 (C1=F,C2=F) | herbId=1 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_HERBID_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-03 — if (!isNumber(herbId))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-03 — !isNumber(herbId) (2^1=2)', () => {
  // Linha 1 (V): string → não é número finito
  test('IF-03 (C1=V) | herbId string → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, herbId: 'um' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  // Linha 1b (V): NaN → typeof NaN === 'number' mas !isFinite
  test('IF-03 (C1=V) | herbId NaN → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, herbId: NaN });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  // Linha 2 (F): número finito → ramo F
  test('IF-03 (C1=F) | herbId=1 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-04 — if (herbId <= 0)    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-04 — herbId <= 0 (2^1=2)', () => {
  // Linha 1 (V): zero
  test('IF-04 (C1=V) | herbId=0 → rejeita PLAN_HERBID_INVALID', () => {
    const r = validatePlan({ ...BASE, herbId: 0 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HERBID_INVALID);
  });

  // Linha 1b (V): negativo
  test('IF-04 (C1=V) | herbId=-1 → rejeita PLAN_HERBID_INVALID', () => {
    const r = validatePlan({ ...BASE, herbId: -1 });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HERBID_INVALID);
  });

  // Linha 2 (F): positivo → ramo F
  test('IF-04 (C1=F) | herbId=1 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_HERBID_INVALID);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-05 — if (!herb)    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-05 — !herb após herbs.find() (2^1=2)', () => {
  // Linha 1 (V): herbId inexistente no mockData
  test('IF-05 (C1=V) | herbId=9999 → rejeita PLAN_HERB_NOT_FOUND', () => {
    const r = validatePlan({ ...BASE, herbId: 9999 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(404);
    expect(r.code).toBe(ERRORS.PLAN_HERB_NOT_FOUND);
  });

  // Linha 2 (F): herb encontrada → ramo F
  test('IF-05 (C1=F) | herbId=1 existe → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_HERB_NOT_FOUND);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-06 — if (type === null || type === undefined)
//
// C1 = type === null  |  C2 = type === undefined
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um valor não pode ser null E undefined
//   Linha 2 (V,F): SIM — type = null
//   Linha 3 (F,V): SIM — type = undefined
//   Linha 4 (F,F): SIM — type = 'regular'
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-06 — type === null || type === undefined (2^2=4, 3 feasíveis)', () => {
  test('IF-06 (C1=V,C2=F) | type null → rejeita PLAN_TYPE_REQUIRED', () => {
    const r = validatePlan({ ...BASE, type: null });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_REQUIRED);
  });

  test('IF-06 (C1=F,C2=V) | type undefined → rejeita PLAN_TYPE_REQUIRED', () => {
    const { type, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_REQUIRED);
  });

  test('IF-06 (C1=F,C2=F) | type=regular → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_TYPE_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-07 — if (!isType(type, 'string'))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-07 — !isType(type, string) (2^1=2)', () => {
  test('IF-07 (C1=V) | type number → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, type: 123 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-07 (C1=V) | type boolean → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, type: true });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-07 (C1=F) | type=regular (string) → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-08 — if (!VALID_TYPES.includes(type))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-08 — !VALID_TYPES.includes(type) (2^1=2)', () => {
  test('IF-08 (C1=V) | type=invalido → rejeita PLAN_TYPE_INVALID', () => {
    const r = validatePlan({ ...BASE, type: 'invalido' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_INVALID);
  });

  test('IF-08 (C1=V) | type vazio → rejeita PLAN_TYPE_INVALID', () => {
    const r = validatePlan({ ...BASE, type: '' });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_INVALID);
  });

  test('IF-08 (C1=F) | type=regular → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_TYPE_INVALID);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-09 — if (name === null || name === undefined)
//
// C1 = name === null  |  C2 = name === undefined
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um valor não pode ser null E undefined
//   Linha 2 (V,F): SIM — name = null
//   Linha 3 (F,V): SIM — name = undefined
//   Linha 4 (F,F): SIM — name = string
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-09 — name === null || name === undefined (2^2=4, 3 feasíveis)', () => {
  test('IF-09 (C1=V,C2=F) | name null → rejeita PLAN_NAME_REQUIRED', () => {
    const r = validatePlan({ ...BASE, name: null });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_NAME_REQUIRED);
  });

  test('IF-09 (C1=F,C2=V) | name undefined → rejeita PLAN_NAME_REQUIRED', () => {
    const { name, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_NAME_REQUIRED);
  });

  test('IF-09 (C1=F,C2=F) | name válido → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_NAME_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-10 — if (!isType(name, 'string'))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-10 — !isType(name, string) (2^1=2)', () => {
  test('IF-10 (C1=V) | name number → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, name: 123 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-10 (C1=V) | name object → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, name: {} });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-10 (C1=F) | name string → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-11 — if (name.trim() === '')    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-11 — name.trim() === "" (2^1=2)', () => {
  test('IF-11 (C1=V) | name só espaços → rejeita PLAN_NAME_INVALID', () => {
    const r = validatePlan({ ...BASE, name: '   ' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_NAME_INVALID);
  });

  test('IF-11 (C1=V) | name vazio → rejeita PLAN_NAME_INVALID', () => {
    const r = validatePlan({ ...BASE, name: '' });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_NAME_INVALID);
  });

  test('IF-11 (C1=F) | name não vazio → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_NAME_INVALID);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-12 — if (type === 'pontual')    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-12 — type === "pontual" bloco autorização (2^1=2)', () => {
  // Linha 1 (V): entra no bloco → testa authorizedBy
  test('IF-12 (C1=V) | type=pontual → entra no bloco e valida authorizedBy', () => {
    const r = validatePlan({ ...BASE, type: 'pontual' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(403);
    expect(r.code).toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
  });

  // Linha 2 (F): salta o bloco pontual
  test('IF-12 (C1=F) | type=regular → ignora bloco pontual', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
    expect(r.plan.authorizedBy).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-13 — if (authorizedBy === null || authorizedBy === undefined)
//
// C1 = authorizedBy === null  |  C2 = authorizedBy === undefined
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — não pode ser null E undefined ao mesmo tempo
//   Linha 2 (V,F): SIM — authorizedBy = null
//   Linha 3 (F,V): SIM — authorizedBy = undefined (omitido)
//   Linha 4 (F,F): SIM — authorizedBy = número
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-13 — authorizedBy === null || === undefined, dentro de pontual (2^2=4, 3 feasíveis)', () => {
  test('IF-13 (C1=V,C2=F) | authorizedBy null → 403 PLAN_AUTHORIZATION_REQUIRED', () => {
    const r = validatePlan({ ...BASE, type: 'pontual', authorizedBy: null });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(403);
    expect(r.code).toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
  });

  test('IF-13 (C1=F,C2=V) | authorizedBy undefined → 403 PLAN_AUTHORIZATION_REQUIRED', () => {
    const r = validatePlan({ ...BASE, type: 'pontual' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(403);
    expect(r.code).toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
  });

  test('IF-13 (C1=F,C2=F) | authorizedBy=2 → não rejeita por este if', () => {
    const r = validatePlan(BASE_PONTUAL);
    expect(r.code).not.toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-14 — if (!isNumber(authorizedBy))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-14 — !isNumber(authorizedBy) dentro de pontual (2^1=2)', () => {
  test('IF-14 (C1=V) | authorizedBy string → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, type: 'pontual', authorizedBy: 'dois' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-14 (C1=V) | authorizedBy array → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, type: 'pontual', authorizedBy: [2] });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-14 (C1=F) | authorizedBy=2 → não rejeita por este if', () => {
    const r = validatePlan(BASE_PONTUAL);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-15 — if (!responsible) após users.find(...)    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-15 — !responsible: authorizedBy não identifica Responsável ativo (2^1=2)', () => {
  test('IF-15 (C1=V) | id inexistente → 403 PLAN_AUTHORIZATION_REQUIRED', () => {
    const r = validatePlan({ ...BASE, type: 'pontual', authorizedBy: 9999 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(403);
    expect(r.code).toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
  });

  test('IF-15 (C1=V) | id=1 (Administrador, não Responsável) → 403', () => {
    const r = validatePlan({ ...BASE, type: 'pontual', authorizedBy: 1 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(403);
    expect(r.code).toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
  });

  test('IF-15 (C1=F) | id=2 Responsável ativo → não rejeita por este if', () => {
    const r = validatePlan(BASE_PONTUAL);
    expect(r.code).not.toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-16 — if (temperature === undefined || temperature === null)
//
// C1 = temperature === undefined  |  C2 = temperature === null
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — não pode ser undefined E null ao mesmo tempo
//   Linha 2 (V,F): SIM — temperature omitida
//   Linha 3 (F,V): SIM — temperature = null
//   Linha 4 (F,F): SIM — temperature = objeto
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-16 — temperature === undefined || temperature === null (2^2=4, 3 feasíveis)', () => {
  test('IF-16 (C1=V,C2=F) | temperature undefined → rejeita PLAN_TEMPERATURE_REQUIRED', () => {
    const { temperature, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_REQUIRED);
  });

  test('IF-16 (C1=F,C2=V) | temperature null → rejeita PLAN_TEMPERATURE_REQUIRED', () => {
    const r = validatePlan({ ...BASE, temperature: null });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_REQUIRED);
  });

  test('IF-16 (C1=F,C2=F) | temperature fornecida → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_TEMPERATURE_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-17 — if (!isNumber(temperature.min))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-17 — !isNumber(temperature.min) (2^1=2)', () => {
  test('IF-17 (C1=V) | temperature.min string → rejeita PLAN_TEMPERATURE_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 'vinte', max: 26 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MIN_INVALID);
  });

  test('IF-17 (C1=V) | temperature.min NaN → rejeita PLAN_TEMPERATURE_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: NaN, max: 26 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MIN_INVALID);
  });

  test('IF-17 (C1=F) | temperature.min=20 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-18 — if (temperature.min < TEMP_MIN || temperature.min > TEMP_MAX)
//
// TEMP_MIN=18, TEMP_MAX=28
// C1 = temperature.min < 18  |  C2 = temperature.min > 28
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <18 E >28 ao mesmo tempo
//   Linha 2 (V,F): SIM — min=17
//   Linha 3 (F,V): SIM — min=29
//   Linha 4 (F,F): SIM — min=20 (dentro do intervalo)
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-18 — temperature.min < 18 || temperature.min > 28 (2^2=4, 3 feasíveis)', () => {
  test('IF-18 (C1=V,C2=F) | min=17 < 18 → rejeita PLAN_TEMPERATURE_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 17, max: 26 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MIN_INVALID);
  });

  test('IF-18 (C1=F,C2=V) | min=29 > 28 → rejeita PLAN_TEMPERATURE_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 29, max: 26 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MIN_INVALID);
  });

  test('IF-18 (C1=F,C2=F) | min=20 no intervalo → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-19 — if (!isNumber(temperature.max))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-19 — !isNumber(temperature.max) (2^1=2)', () => {
  test('IF-19 (C1=V) | temperature.max string → rejeita PLAN_TEMPERATURE_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 20, max: 'abc' } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MAX_INVALID);
  });

  test('IF-19 (C1=V) | temperature.max null → rejeita PLAN_TEMPERATURE_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 20, max: null } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MAX_INVALID);
  });

  test('IF-19 (C1=F) | temperature.max=26 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-20 — if (temperature.max < TEMP_MIN || temperature.max > TEMP_MAX)
//
// C1 = temperature.max < 18  |  C2 = temperature.max > 28
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <18 E >28 ao mesmo tempo
//   Linha 2 (V,F): SIM — max=17
//   Linha 3 (F,V): SIM — max=29
//   Linha 4 (F,F): SIM — max=26
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-20 — temperature.max < 18 || temperature.max > 28 (2^2=4, 3 feasíveis)', () => {
  test('IF-20 (C1=V,C2=F) | max=17 < 18 → rejeita PLAN_TEMPERATURE_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 18, max: 17 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MAX_INVALID);
  });

  test('IF-20 (C1=F,C2=V) | max=29 > 28 → rejeita PLAN_TEMPERATURE_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 20, max: 29 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_MAX_INVALID);
  });

  test('IF-20 (C1=F,C2=F) | max=26 no intervalo → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-21 — if (temperature.min > temperature.max)    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-21 — temperature.min > temperature.max (2^1=2)', () => {
  test('IF-21 (C1=V) | min=25, max=20 → rejeita PLAN_TEMPERATURE_RANGE_INVALID', () => {
    const r = validatePlan({ ...BASE, temperature: { min: 25, max: 20 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TEMPERATURE_RANGE_INVALID);
  });

  test('IF-21 (C1=F) | min=20 <= max=26 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-22 — if (humidity === undefined || humidity === null)
//
// C1 = humidity === undefined  |  C2 = humidity === null
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — não pode ser undefined E null ao mesmo tempo
//   Linha 2 (V,F): SIM — humidity omitida
//   Linha 3 (F,V): SIM — humidity = null
//   Linha 4 (F,F): SIM — humidity = objeto
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-22 — humidity === undefined || humidity === null (2^2=4, 3 feasíveis)', () => {
  test('IF-22 (C1=V,C2=F) | humidity undefined → rejeita PLAN_HUMIDITY_REQUIRED', () => {
    const { humidity, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_REQUIRED);
  });

  test('IF-22 (C1=F,C2=V) | humidity null → rejeita PLAN_HUMIDITY_REQUIRED', () => {
    const r = validatePlan({ ...BASE, humidity: null });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_REQUIRED);
  });

  test('IF-22 (C1=F,C2=F) | humidity fornecida → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_HUMIDITY_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-23 — if (!isNumber(humidity.min))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-23 — !isNumber(humidity.min) (2^1=2)', () => {
  test('IF-23 (C1=V) | humidity.min string → rejeita PLAN_HUMIDITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 'quarenta', max: 70 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MIN_INVALID);
  });

  test('IF-23 (C1=V) | humidity.min boolean → rejeita PLAN_HUMIDITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: true, max: 70 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MIN_INVALID);
  });

  test('IF-23 (C1=F) | humidity.min=50 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-24 — if (humidity.min < HUM_MIN || humidity.min > HUM_MAX)
//
// HUM_MIN=40, HUM_MAX=80
// C1 = humidity.min < 40  |  C2 = humidity.min > 80
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <40 E >80 ao mesmo tempo
//   Linha 2 (V,F): SIM — min=39
//   Linha 3 (F,V): SIM — min=81
//   Linha 4 (F,F): SIM — min=50
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-24 — humidity.min < 40 || humidity.min > 80 (2^2=4, 3 feasíveis)', () => {
  test('IF-24 (C1=V,C2=F) | min=39 < 40 → rejeita PLAN_HUMIDITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 39, max: 70 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MIN_INVALID);
  });

  test('IF-24 (C1=F,C2=V) | min=81 > 80 → rejeita PLAN_HUMIDITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 81, max: 70 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MIN_INVALID);
  });

  test('IF-24 (C1=F,C2=F) | min=50 no intervalo → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-25 — if (!isNumber(humidity.max))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-25 — !isNumber(humidity.max) (2^1=2)', () => {
  test('IF-25 (C1=V) | humidity.max string → rejeita PLAN_HUMIDITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 50, max: 'oitenta' } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MAX_INVALID);
  });

  test('IF-25 (C1=V) | humidity.max undefined → rejeita PLAN_HUMIDITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 50 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MAX_INVALID);
  });

  test('IF-25 (C1=F) | humidity.max=70 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-26 — if (humidity.max < HUM_MIN || humidity.max > HUM_MAX)
//
// C1 = humidity.max < 40  |  C2 = humidity.max > 80
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <40 E >80 ao mesmo tempo
//   Linha 2 (V,F): SIM — max=39
//   Linha 3 (F,V): SIM — max=81
//   Linha 4 (F,F): SIM — max=70
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-26 — humidity.max < 40 || humidity.max > 80 (2^2=4, 3 feasíveis)', () => {
  test('IF-26 (C1=V,C2=F) | max=39 < 40 → rejeita PLAN_HUMIDITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 40, max: 39 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MAX_INVALID);
  });

  test('IF-26 (C1=F,C2=V) | max=81 > 80 → rejeita PLAN_HUMIDITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 50, max: 81 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_MAX_INVALID);
  });

  test('IF-26 (C1=F,C2=F) | max=70 no intervalo → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-27 — if (humidity.min > humidity.max)    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-27 — humidity.min > humidity.max (2^1=2)', () => {
  test('IF-27 (C1=V) | min=70, max=50 → rejeita PLAN_HUMIDITY_RANGE_INVALID', () => {
    const r = validatePlan({ ...BASE, humidity: { min: 70, max: 50 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_HUMIDITY_RANGE_INVALID);
  });

  test('IF-27 (C1=F) | min=50 <= max=70 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-28 — if (luminosity === undefined || luminosity === null)
//
// C1 = luminosity === undefined  |  C2 = luminosity === null
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — não pode ser undefined E null ao mesmo tempo
//   Linha 2 (V,F): SIM — luminosity omitida
//   Linha 3 (F,V): SIM — luminosity = null
//   Linha 4 (F,F): SIM — luminosity = objeto
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-28 — luminosity === undefined || luminosity === null (2^2=4, 3 feasíveis)', () => {
  test('IF-28 (C1=V,C2=F) | luminosity undefined → rejeita PLAN_LUMINOSITY_REQUIRED', () => {
    const { luminosity, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_REQUIRED);
  });

  test('IF-28 (C1=F,C2=V) | luminosity null → rejeita PLAN_LUMINOSITY_REQUIRED', () => {
    const r = validatePlan({ ...BASE, luminosity: null });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_REQUIRED);
  });

  test('IF-28 (C1=F,C2=F) | luminosity fornecida → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_LUMINOSITY_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-29 — if (!isNumber(luminosity.min))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-29 — !isNumber(luminosity.min) (2^1=2)', () => {
  test('IF-29 (C1=V) | luminosity.min string → rejeita PLAN_LUMINOSITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 'oito', max: 20000 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MIN_INVALID);
  });

  test('IF-29 (C1=V) | luminosity.min Infinity → rejeita PLAN_LUMINOSITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: Infinity, max: 20000 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MIN_INVALID);
  });

  test('IF-29 (C1=F) | luminosity.min=8000 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-30 — if (luminosity.min < LUM_MIN || luminosity.min > LUM_MAX)
//
// LUM_MIN=5000, LUM_MAX=25000
// C1 = luminosity.min < 5000  |  C2 = luminosity.min > 25000
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <5000 E >25000 ao mesmo tempo
//   Linha 2 (V,F): SIM — min=4999
//   Linha 3 (F,V): SIM — min=25001
//   Linha 4 (F,F): SIM — min=8000
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-30 — luminosity.min < 5000 || luminosity.min > 25000 (2^2=4, 3 feasíveis)', () => {
  test('IF-30 (C1=V,C2=F) | min=4999 < 5000 → rejeita PLAN_LUMINOSITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 4999, max: 20000 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MIN_INVALID);
  });

  test('IF-30 (C1=F,C2=V) | min=25001 > 25000 → rejeita PLAN_LUMINOSITY_MIN_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 25001, max: 20000 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MIN_INVALID);
  });

  test('IF-30 (C1=F,C2=F) | min=8000 no intervalo → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-31 — if (!isNumber(luminosity.max))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-31 — !isNumber(luminosity.max) (2^1=2)', () => {
  test('IF-31 (C1=V) | luminosity.max string → rejeita PLAN_LUMINOSITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 8000, max: 'vinte' } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MAX_INVALID);
  });

  test('IF-31 (C1=V) | luminosity.max NaN → rejeita PLAN_LUMINOSITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 8000, max: NaN } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MAX_INVALID);
  });

  test('IF-31 (C1=F) | luminosity.max=20000 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-32 — if (luminosity.max < LUM_MIN || luminosity.max > LUM_MAX)
//
// C1 = luminosity.max < 5000  |  C2 = luminosity.max > 25000
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <5000 E >25000 ao mesmo tempo
//   Linha 2 (V,F): SIM — max=4999
//   Linha 3 (F,V): SIM — max=25001
//   Linha 4 (F,F): SIM — max=20000
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-32 — luminosity.max < 5000 || luminosity.max > 25000 (2^2=4, 3 feasíveis)', () => {
  test('IF-32 (C1=V,C2=F) | max=4999 < 5000 → rejeita PLAN_LUMINOSITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 5000, max: 4999 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MAX_INVALID);
  });

  test('IF-32 (C1=F,C2=V) | max=25001 > 25000 → rejeita PLAN_LUMINOSITY_MAX_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 8000, max: 25001 } });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_MAX_INVALID);
  });

  test('IF-32 (C1=F,C2=F) | max=20000 no intervalo → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-33 — if (luminosity.min > luminosity.max)    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-33 — luminosity.min > luminosity.max (2^1=2)', () => {
  test('IF-33 (C1=V) | min=20000, max=8000 → rejeita PLAN_LUMINOSITY_RANGE_INVALID', () => {
    const r = validatePlan({ ...BASE, luminosity: { min: 20000, max: 8000 } });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_LUMINOSITY_RANGE_INVALID);
  });

  test('IF-33 (C1=F) | min=8000 <= max=20000 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-34 — if (cycleDays === undefined || cycleDays === null)
//
// C1 = cycleDays === undefined  |  C2 = cycleDays === null
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — não pode ser undefined E null ao mesmo tempo
//   Linha 2 (V,F): SIM — cycleDays omitido
//   Linha 3 (F,V): SIM — cycleDays = null
//   Linha 4 (F,F): SIM — cycleDays = número
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-34 — cycleDays === undefined || cycleDays === null (2^2=4, 3 feasíveis)', () => {
  test('IF-34 (C1=V,C2=F) | cycleDays undefined → rejeita PLAN_CYCLE_REQUIRED', () => {
    const { cycleDays, ...rest } = BASE;
    const r = validatePlan(rest);
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_CYCLE_REQUIRED);
  });

  test('IF-34 (C1=F,C2=V) | cycleDays null → rejeita PLAN_CYCLE_REQUIRED', () => {
    const r = validatePlan({ ...BASE, cycleDays: null });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_CYCLE_REQUIRED);
  });

  test('IF-34 (C1=F,C2=F) | cycleDays=90 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.code).not.toBe(ERRORS.PLAN_CYCLE_REQUIRED);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-35 — if (!isNumber(cycleDays))    [1 condição → 2^1 = 2 linhas]
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-35 — !isNumber(cycleDays) (2^1=2)', () => {
  test('IF-35 (C1=V) | cycleDays string → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, cycleDays: 'noventa' });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-35 (C1=V) | cycleDays boolean → rejeita PLAN_TYPE_MISMATCH', () => {
    const r = validatePlan({ ...BASE, cycleDays: false });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('IF-35 (C1=F) | cycleDays=90 → não rejeita por este if', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// IF-36 — if (cycleDays < CYCLE_MIN || cycleDays > CYCLE_MAX)
//
// CYCLE_MIN=1, CYCLE_MAX=365
// C1 = cycleDays < 1  |  C2 = cycleDays > 365
// Tabela 2^2 = 4 linhas:
//   Linha 1 (V,V): INFEASÍVEL — um número não pode ser <1 E >365 ao mesmo tempo
//   Linha 2 (V,F): SIM — cycleDays=0
//   Linha 3 (F,V): SIM — cycleDays=366
//   Linha 4 (F,F): SIM — cycleDays=90
// ─────────────────────────────────────────────────────────────────────────────
describe('IF-36 — cycleDays < 1 || cycleDays > 365 (2^2=4, 3 feasíveis)', () => {
  test('IF-36 (C1=V,C2=F) | cycleDays=0 < 1 → rejeita PLAN_CYCLE_INVALID', () => {
    const r = validatePlan({ ...BASE, cycleDays: 0 });
    expect(r.valid).toBe(false);
    expect(r.status).toBe(400);
    expect(r.code).toBe(ERRORS.PLAN_CYCLE_INVALID);
  });

  test('IF-36 (C1=F,C2=V) | cycleDays=366 > 365 → rejeita PLAN_CYCLE_INVALID', () => {
    const r = validatePlan({ ...BASE, cycleDays: 366 });
    expect(r.valid).toBe(false);
    expect(r.code).toBe(ERRORS.PLAN_CYCLE_INVALID);
  });

  test('IF-36 (C1=F,C2=F) | cycleDays=90 no intervalo → aceita', () => {
    const r = validatePlan(BASE);
    expect(r.valid).toBe(true);
    expect(r.plan.cycleDays).toBe(90);
  });
});
