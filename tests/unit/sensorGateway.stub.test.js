/**
 * Testes — SensorGateway (Stub)
 * Sprint 6 — Plataforma GREENHERB
 *
 * Tipo de duplo: STUB
 * Justificação: a leitura de sensores é um processo AUTOMÁTICO (dado entra na app
 * vindo de hardware externo). O stub substitui esse hardware devolvendo valores
 * predefinidos, sem qualquer verificação de chamadas — apenas fornece entradas
 * controladas para que o AutomationService possa ser testado isoladamente.
 *
 * Unidade testada: AutomationService.evaluate()
 */

const { AutomationService } = require('../../src/services/automationService');
const { NotificationGateway } = require('../../src/gateways/NotificationGateway');

// ── Stub manual do SensorGateway ─────────────────────────────────────────────
class SensorGatewayStub {
  constructor(reading) {
    this._reading = reading;
  }
  async getLatestReading(_batchId) {
    return this._reading;
  }
}

// ── Stub neutro do NotificationGateway (não nos interessa aqui) ──────────────
class NotificationGatewayStub extends NotificationGateway {
  async sendNotification() {}
}

// ─────────────────────────────────────────────────────────────────────────────

const RULE_AUTO_ACTIVE = { id: 1, mode: 'Automático', active: true };
const RULE_MANUAL_ACTIVE = { id: 2, mode: 'Manual', active: true };
const RULE_INACTIVE = { id: 3, mode: 'Automático', active: false };

describe('STUB — SensorGateway: AutomationService.evaluate()', () => {
  test('TU-SG-001 | leitura recente + limiar violado + modo Automático → action=executed', async () => {
    const stub = new SensorGatewayStub({ temperature: 35, measurementRecent: true, thresholdViolated: true });
    const svc = new AutomationService(stub, new NotificationGatewayStub());

    const { action } = await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(action).toBe('executed');
  });

  test('TU-SG-002 | leitura recente + limiar violado + modo Manual → action=suggested', async () => {
    const stub = new SensorGatewayStub({ temperature: 35, measurementRecent: true, thresholdViolated: true });
    const svc = new AutomationService(stub, new NotificationGatewayStub());

    const { action } = await svc.evaluate(RULE_MANUAL_ACTIVE, 1);

    expect(action).toBe('suggested');
  });

  test('TU-SG-003 | leitura NÃO recente → action=none (medição desatualizada)', async () => {
    const stub = new SensorGatewayStub({ temperature: 35, measurementRecent: false, thresholdViolated: true });
    const svc = new AutomationService(stub, new NotificationGatewayStub());

    const { action } = await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(action).toBe('none');
  });

  test('TU-SG-004 | limiar NÃO violado → action=none (temperatura dentro dos limites)', async () => {
    const stub = new SensorGatewayStub({ temperature: 22, measurementRecent: true, thresholdViolated: false });
    const svc = new AutomationService(stub, new NotificationGatewayStub());

    const { action } = await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(action).toBe('none');
  });

  test('TU-SG-005 | regra inativa → action=none independentemente da leitura', async () => {
    const stub = new SensorGatewayStub({ temperature: 35, measurementRecent: true, thresholdViolated: true });
    const svc = new AutomationService(stub, new NotificationGatewayStub());

    const { action } = await svc.evaluate(RULE_INACTIVE, 1);

    expect(action).toBe('none');
  });

  test('TU-SG-006 | stub devolve a leitura original no resultado', async () => {
    const reading = { temperature: 30, humidity: 75, measurementRecent: true, thresholdViolated: true };
    const stub = new SensorGatewayStub(reading);
    const svc = new AutomationService(stub, new NotificationGatewayStub());

    const result = await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(result.reading).toEqual(reading);
  });
});
