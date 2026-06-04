/**
 * Motor de regras de automação — Sprint 3 (enunciado §5.1)
 *
 * Decide se uma ação deve ser sugerida, executada ou ignorada com base em
 * quatro condições atómicas (tabela MC/DC documentada em automation.engine.test.js).
 *
 * @param {{ mode: string, ruleActive: boolean, measurementRecent: boolean, thresholdViolated: boolean }} params
 * @returns {'none' | 'suggested' | 'executed'}
 */
function decideAction({ mode, ruleActive, measurementRecent, thresholdViolated }) {
  if (!ruleActive || !measurementRecent || !thresholdViolated) return 'none';
  if (mode === 'Automático') return 'executed';
  if (mode === 'Manual') return 'suggested';
  return 'none';
}

module.exports = { decideAction };
