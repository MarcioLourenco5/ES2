/**
 * Testes de Unidade — automationEngine.js
 * Sprint 3 — Plataforma GREENHERB
 *
 * Tipo: Caixa-Branca (White Box)
 * Técnica: Cobertura de Condições Múltiplas (MC/DC)
 * Unidade testada: decideAction({ mode, ruleActive, measurementRecent, thresholdViolated })
 *
 * Tabela de verdade (4 condições, cobertura MC/DC):
 *   C1: ruleActive
 *   C2: measurementRecent
 *   C3: thresholdViolated
 *   C4: mode === 'Automático'
 *
 *   C1   C2   C3   C4   Resultado
 *   F    *    *    *    'none'
 *   T    F    *    *    'none'
 *   T    T    F    *    'none'
 *   T    T    T    F    'suggested'   (Manual)
 *   T    T    T    T    'executed'    (Automático)
 */

const { decideAction } = require('../../src/services/automationEngine');

describe('MC/DC — decideAction()', () => {
  test('TU-AM-001 | C1=F | regra inativa → none (qualquer outro valor)', () => {
    expect(decideAction({ mode: 'Automático', ruleActive: false, measurementRecent: true, thresholdViolated: true }))
      .toBe('none');
  });

  test('TU-AM-002 | C2=F | medição não recente → none', () => {
    expect(decideAction({ mode: 'Automático', ruleActive: true, measurementRecent: false, thresholdViolated: true }))
      .toBe('none');
  });

  test('TU-AM-003 | C3=F | limiar não violado → none', () => {
    expect(decideAction({ mode: 'Automático', ruleActive: true, measurementRecent: true, thresholdViolated: false }))
      .toBe('none');
  });

  test('TU-AM-004 | C4=F | modo Manual + todas as outras T → suggested', () => {
    expect(decideAction({ mode: 'Manual', ruleActive: true, measurementRecent: true, thresholdViolated: true }))
      .toBe('suggested');
  });

  test('TU-AM-005 | C4=T | modo Automático + todas as outras T → executed', () => {
    expect(decideAction({ mode: 'Automático', ruleActive: true, measurementRecent: true, thresholdViolated: true }))
      .toBe('executed');
  });

  test('TU-AM-006 | modo desconhecido com violação → none (modo não reconhecido não executa ações)', () => {
    expect(decideAction({ mode: 'Desconhecido', ruleActive: true, measurementRecent: true, thresholdViolated: true }))
      .toBe('none');
  });
});
