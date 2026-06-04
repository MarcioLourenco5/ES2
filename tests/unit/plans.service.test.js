/**
 * Testes de Unidade — plans.service.js
 * Sprint 2 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Preta (Black Box)
 * Técnicas: Particionamento de Equivalência (PE) + Análise de Valores Limite (BVA)
 * Unidade testada: validatePlan(planData)
 *
 * Classes de Equivalência — type:
 *   CE-PT1 (V) — regular
 *   CE-PT2 (V) — emergência
 *   CE-PT3 (V) — pontual (com authorizedBy)
 *   CE-PT4 (I) — tipo inexistente
 *   CE-PT5 (I) — null / undefined
 *   CE-PT6 (I) — tipo numérico
 *   CE-PT7 (I) — string vazia
 *
 * Classes de Equivalência — herbId:
 *   CE-PH1 (V) — número positivo existente no catálogo de ervas
 *   CE-PH2 (I) — null / undefined
 *   CE-PH3 (I) — string
 *   CE-PH4 (I) — array/object
 *   CE-PH5 (I) — negativo ou zero
 *   CE-PH6 (I) — número positivo inexistente no catálogo de ervas
 *
 * Classes de Equivalência — name:
 *   CE-PN1 (V) — string não vazia
 *   CE-PN2 (I) — null / undefined
 *   CE-PN3 (I) — string vazia
 *   CE-PN4 (I) — só espaços
 *   CE-PN5 (I) — tipo numérico
 *
 * Classes de Equivalência — authorizedBy (pontual):
 *   CE-PA1 (V) — número presente
 *   CE-PA2 (I) — null / undefined
 *   CE-PA3 (I) — string
 *
 * BVA — Temperature:  [18, 28]
 * BVA — Humidity:     [40, 80]
 * BVA — Luminosity:   [5000, 25000]
 * BVA — CycleDays:    [1, 365]
 *
 * Campos obrigatórios após correção:
 *   temperature, humidity, luminosity e cycleDays não podem ser omitidos.
 *   O serviço não aplica defaults automaticamente.
 */

const { validatePlan } = require('../../src/services/plans.service');
const ERRORS = require('../../src/config/errors');

// Helper: dados base válidos para testes
const validPlan = {
  herbId: 1,
  type: 'regular',
  name: 'Plano Teste',
  temperature: { min: 18, max: 28 },
  humidity: { min: 40, max: 80 },
  luminosity: { min: 5000, max: 25000 },
  cycleDays: 90,
};

// ─────────────────────────────────────────────────────────────────────────────
// VALIDAÇÃO GERAL — Dados de entrada
// ─────────────────────────────────────────────────────────────────────────────
describe('Validação geral de entrada', () => {

  test('TU-PS-033 | Dados totalmente ausentes ({}) → erro', () => {
    const result = validatePlan({});
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
  });

  test('planData null → erro TYPE_MISMATCH', () => {
    const result = validatePlan(null);
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('planData é array → erro TYPE_MISMATCH', () => {
    const result = validatePlan([1, 2, 3]);
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('planData é string → erro TYPE_MISMATCH', () => {
    const result = validatePlan('invalido');
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PE — herbId
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — herbId', () => {

  test('TU-PS-007 | CE-PH2 | herbId null → erro PLAN_HERBID_REQUIRED', () => {
    const result = validatePlan({ ...validPlan, herbId: null });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_HERBID_REQUIRED);
  });

  test('TU-PS-007b | CE-PH2 | herbId undefined → erro PLAN_HERBID_REQUIRED', () => {
    const result = validatePlan({ ...validPlan, herbId: undefined });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_HERBID_REQUIRED);
  });

  test('TU-PS-008 | CE-PH3 | herbId é string → erro TYPE_MISMATCH', () => {
    const result = validatePlan({ ...validPlan, herbId: 'um' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('CE-PH4 | herbId é array → erro TYPE_MISMATCH', () => {
    const result = validatePlan({ ...validPlan, herbId: [1] });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('CE-PH4 | herbId é boolean → erro TYPE_MISMATCH', () => {
    const result = validatePlan({ ...validPlan, herbId: true });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('CE-PH1 | herbId é número válido → aceite', () => {
    const result = validatePlan(validPlan);
    expect(result.valid).toBe(true);
  });

  test('TU-PS-034 | CE-PH5 | herbId negativo (-5) → erro PLAN_HERBID_INVALID', () => {
    const result = validatePlan({ ...validPlan, herbId: -5 });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_HERBID_INVALID);
  });

  test('TU-PS-034b | CE-PH5 | herbId igual a zero (0) → erro PLAN_HERBID_INVALID', () => {
    const result = validatePlan({ ...validPlan, herbId: 0 });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_HERBID_INVALID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PE — type
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — type', () => {

  test('TU-PS-001 | CE-PT1 | type "regular" → aceite', () => {
    const result = validatePlan(validPlan);
    expect(result.valid).toBe(true);
    expect(result.plan.type).toBe('regular');
  });

  test('TU-PS-002 | CE-PT2 | type "emergência" → aceite', () => {
    const result = validatePlan({ ...validPlan, type: 'emergência' });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-003 | CE-PT3 | type "pontual" com authorizedBy → aceite', () => {
    const result = validatePlan({ ...validPlan, type: 'pontual', authorizedBy: 2 });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-004 | CE-PT4 | type inválido → erro PLAN_TYPE_INVALID', () => {
    const result = validatePlan({ ...validPlan, type: 'inexistente' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_INVALID);
  });

  test('TU-PS-005 | CE-PT5 | type null → erro PLAN_TYPE_REQUIRED', () => {
    const result = validatePlan({ ...validPlan, type: null });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_REQUIRED);
  });

  test('TU-PS-005b | CE-PT5 | type undefined → erro PLAN_TYPE_REQUIRED', () => {
    const result = validatePlan({ ...validPlan, type: undefined });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_REQUIRED);
  });

  test('TU-PS-006 | CE-PT6 | type é número → erro PLAN_TYPE_MISMATCH', () => {
    const result = validatePlan({ ...validPlan, type: 123 });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });

  test('CE-PT7 | type string vazia → erro PLAN_TYPE_INVALID', () => {
    const result = validatePlan({ ...validPlan, type: '' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_INVALID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PE — name
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — name', () => {

  test('TU-PS-009 | CE-PN3 | name vazio → erro PLAN_NAME_INVALID', () => {
    const result = validatePlan({ ...validPlan, name: '' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_NAME_INVALID);
  });

  test('TU-PS-010 | CE-PN4 | name só espaços → erro PLAN_NAME_INVALID', () => {
    const result = validatePlan({ ...validPlan, name: '   ' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_NAME_INVALID);
  });

  test('CE-PN2 | name null → erro PLAN_NAME_REQUIRED', () => {
    const result = validatePlan({ ...validPlan, name: null });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_NAME_REQUIRED);
  });

  test('CE-PN5 | name é número → erro PLAN_TYPE_MISMATCH', () => {
    const result = validatePlan({ ...validPlan, name: 123 });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PE — authorizedBy (plano pontual)
// ─────────────────────────────────────────────────────────────────────────────
describe('PE — authorizedBy (plano pontual)', () => {

  test('TU-PS-011 | CE-PA2 | plano pontual sem authorizedBy → 403 PLAN_AUTHORIZATION_REQUIRED', () => {
    const result = validatePlan({ ...validPlan, type: 'pontual' });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(403);
    expect(result.code).toBe(ERRORS.PLAN_AUTHORIZATION_REQUIRED);
  });

  test('CE-PA2 | plano pontual authorizedBy null → 403', () => {
    const result = validatePlan({ ...validPlan, type: 'pontual', authorizedBy: null });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(403);
  });

  test('CE-PA3 | plano pontual authorizedBy string → erro TYPE_MISMATCH', () => {
    const result = validatePlan({ ...validPlan, type: 'pontual', authorizedBy: 'dois' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — Temperature [18, 28]
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Temperature', () => {

  const base = { ...validPlan };

  test('TU-PS-012 | BVA-T1 | temperature.min = 17 (abaixo mínimo) → rejeitado', () => {
    const result = validatePlan({ ...base, temperature: { min: 17, max: 28 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TEMPERATURE_MIN_INVALID);
  });

  test('TU-PS-013 | BVA-T2 | temperature.min = 18 (limite inferior) → aceite', () => {
    const result = validatePlan({ ...base, temperature: { min: 18, max: 28 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-014 | BVA-T3 | temperature = { min: 18, max: 23 } (nominal) → aceite', () => {
    const result = validatePlan({ ...base, temperature: { min: 18, max: 23 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-015 | BVA-T4 | temperature.max = 28 (limite superior) → aceite', () => {
    const result = validatePlan({ ...base, temperature: { min: 18, max: 28 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-016 | BVA-T5 | temperature.max = 29 (acima máximo) → rejeitado', () => {
    const result = validatePlan({ ...base, temperature: { min: 18, max: 29 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TEMPERATURE_MAX_INVALID);
  });

  test('TM-P5 | temperature.min é string → erro TYPE_MISMATCH', () => {
    const result = validatePlan({ ...base, temperature: { min: '18', max: 28 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TEMPERATURE_MIN_INVALID);
  });

  test('TU-PS-035 | BVA-T6 | temperature.min > temperature.max (min:25, max:20) → erro PLAN_TEMPERATURE_RANGE_INVALID', () => {
    const result = validatePlan({ ...base, temperature: { min: 25, max: 20 } });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_TEMPERATURE_RANGE_INVALID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — Humidity [40, 80]
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Humidity', () => {

  const base = { ...validPlan };

  test('TU-PS-017 | BVA-H1 | humidity.min = 39 (abaixo mínimo) → rejeitado', () => {
    const result = validatePlan({ ...base, humidity: { min: 39, max: 80 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_HUMIDITY_MIN_INVALID);
  });

  test('TU-PS-018 | BVA-H2 | humidity.min = 40 (limite inferior) → aceite', () => {
    const result = validatePlan({ ...base, humidity: { min: 40, max: 80 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-019 | BVA-H3 | humidity = { min: 40, max: 60 } (nominal) → aceite', () => {
    const result = validatePlan({ ...base, humidity: { min: 40, max: 60 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-020 | BVA-H4 | humidity.max = 80 (limite superior) → aceite', () => {
    const result = validatePlan({ ...base, humidity: { min: 40, max: 80 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-021 | BVA-H5 | humidity.max = 81 (acima máximo) → rejeitado', () => {
    const result = validatePlan({ ...base, humidity: { min: 40, max: 81 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_HUMIDITY_MAX_INVALID);
  });

  test('TU-PS-036 | BVA-H6 | humidity.min > humidity.max (min:70, max:50) → erro PLAN_HUMIDITY_RANGE_INVALID', () => {
    const result = validatePlan({ ...base, humidity: { min: 70, max: 50 } });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_HUMIDITY_RANGE_INVALID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — Luminosity [5000, 25000]
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — Luminosity', () => {

  const base = { ...validPlan };

  test('TU-PS-022 | BVA-L1 | luminosity.min = 4999 (abaixo mínimo) → rejeitado', () => {
    const result = validatePlan({ ...base, luminosity: { min: 4999, max: 25000 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_LUMINOSITY_MIN_INVALID);
  });

  test('TU-PS-023 | BVA-L2 | luminosity.min = 5000 (limite inferior) → aceite', () => {
    const result = validatePlan({ ...base, luminosity: { min: 5000, max: 25000 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-024 | BVA-L3 | luminosity = { min: 5000, max: 15000 } (nominal) → aceite', () => {
    const result = validatePlan({ ...base, luminosity: { min: 5000, max: 15000 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-025 | BVA-L4 | luminosity.max = 25000 (limite superior) → aceite', () => {
    const result = validatePlan({ ...base, luminosity: { min: 5000, max: 25000 } });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-026 | BVA-L5 | luminosity.max = 25001 (acima máximo) → rejeitado', () => {
    const result = validatePlan({ ...base, luminosity: { min: 5000, max: 25001 } });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_LUMINOSITY_MAX_INVALID);
  });

  test('TU-PS-037 | BVA-L6 | luminosity.min > luminosity.max (min:20000, max:10000) → erro PLAN_LUMINOSITY_RANGE_INVALID', () => {
    const result = validatePlan({ ...base, luminosity: { min: 20000, max: 10000 } });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_LUMINOSITY_RANGE_INVALID);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BVA — CycleDays [1, 365]
// ─────────────────────────────────────────────────────────────────────────────
describe('BVA — CycleDays', () => {

  const base = { ...validPlan };

  test('TU-PS-027 | BVA-C1 | cycleDays = 0 (abaixo mínimo) → rejeitado', () => {
    const result = validatePlan({ ...base, cycleDays: 0 });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_CYCLE_INVALID);
  });

  test('TU-PS-028 | BVA-C2 | cycleDays = 1 (limite inferior) → aceite', () => {
    const result = validatePlan({ ...base, cycleDays: 1 });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-029 | BVA-C3 | cycleDays = 90 (nominal) → aceite', () => {
    const result = validatePlan({ ...base, cycleDays: 90 });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-030 | BVA-C4 | cycleDays = 365 (limite superior) → aceite', () => {
    const result = validatePlan({ ...base, cycleDays: 365 });
    expect(result.valid).toBe(true);
  });

  test('TU-PS-031 | BVA-C5 | cycleDays = 366 (acima máximo) → rejeitado', () => {
    const result = validatePlan({ ...base, cycleDays: 366 });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_CYCLE_INVALID);
  });

  test('TU-PS-032 | TM-P4 | cycleDays é string → erro TYPE_MISMATCH', () => {
    const result = validatePlan({ ...base, cycleDays: 'noventa' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe(ERRORS.PLAN_TYPE_MISMATCH);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PE — Consistência de domínio e campos obrigatórios do plano
// ─────────────────────────────────────────────────────────────────────────────
describe('Consistência de domínio e campos obrigatórios', () => {

  test('TU-PS-038 | herbId inexistente → 404 PLAN_HERB_NOT_FOUND', () => {
    const result = validatePlan({ ...validPlan, herbId: 999999 });

    expect(result.valid).toBe(false);
    expect(result.status).toBe(404);
    expect(result.code).toBe(ERRORS.PLAN_HERB_NOT_FOUND);
  });

  test('TU-PS-039 | sem temperature → 400 PLAN_TEMPERATURE_REQUIRED', () => {
    const { temperature, ...planWithoutTemperature } = validPlan;
    const result = validatePlan(planWithoutTemperature);

    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_TEMPERATURE_REQUIRED);
  });

  test('TU-PS-040 | sem humidity → 400 PLAN_HUMIDITY_REQUIRED', () => {
    const { humidity, ...planWithoutHumidity } = validPlan;
    const result = validatePlan(planWithoutHumidity);

    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_HUMIDITY_REQUIRED);
  });

  test('TU-PS-041 | sem luminosity → 400 PLAN_LUMINOSITY_REQUIRED', () => {
    const { luminosity, ...planWithoutLuminosity } = validPlan;
    const result = validatePlan(planWithoutLuminosity);

    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_LUMINOSITY_REQUIRED);
  });

  test('TU-PS-042 | sem cycleDays → 400 PLAN_CYCLE_REQUIRED', () => {
    const { cycleDays, ...planWithoutCycleDays } = validPlan;
    const result = validatePlan(planWithoutCycleDays);

    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
    expect(result.code).toBe(ERRORS.PLAN_CYCLE_REQUIRED);
  });

  test('Sem authorizedBy em plano regular → null (não é obrigatório)', () => {
    const result = validatePlan(validPlan);

    expect(result.valid).toBe(true);
    expect(result.plan.authorizedBy).toBeNull();
  });
});
