/**
 * Testes — NotificationGateway (Mock)
 * Sprint 6 — Plataforma GREENHERB
 *
 * Tipo de duplo: MOCK
 * Justificação: o envio de notificações é um dado que SAI da app para um serviço
 * externo (email/SMS). O mock verifica que sendNotification() foi CHAMADO, quantas
 * vezes, e com que argumentos — comportamento observável que o stub não garante.
 *
 * Unidade testada: AutomationService.evaluate() → NotificationGateway.sendNotification()
 */

const { AutomationService } = require('../../src/services/automationService');

// ── Stub fixo do SensorGateway (fornece entradas, sem verificações) ───────────
class SensorGatewayStub {
  constructor(reading) {
    this._reading = reading;
  }
  async getLatestReading() {
    return this._reading;
  }
}

const READING_VIOLATION   = { temperature: 35, measurementRecent: true, thresholdViolated: true };
const READING_NO_VIOLATION = { temperature: 22, measurementRecent: true, thresholdViolated: false };

const RULE_AUTO_ACTIVE   = { id: 1, mode: 'Automático', active: true };
const RULE_MANUAL_ACTIVE = { id: 2, mode: 'Manual',     active: true };
const RULE_INACTIVE      = { id: 3, mode: 'Automático', active: false };

// ─────────────────────────────────────────────────────────────────────────────

describe('MOCK — NotificationGateway: verificação de chamadas', () => {
  test('TU-NG-001 | limiar violado + modo Automático → sendNotification chamado 1 vez', async () => {
    const mockGateway = { sendNotification: jest.fn() };
    const svc = new AutomationService(new SensorGatewayStub(READING_VIOLATION), mockGateway);

    await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(mockGateway.sendNotification).toHaveBeenCalledTimes(1);
  });

  test('TU-NG-002 | limiar violado + modo Automático → notificação enviada com action=executed', async () => {
    const mockGateway = { sendNotification: jest.fn() };
    const svc = new AutomationService(new SensorGatewayStub(READING_VIOLATION), mockGateway);

    await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(mockGateway.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'executed', batchId: 1 })
    );
  });

  test('TU-NG-003 | limiar violado + modo Manual → notificação enviada com action=suggested', async () => {
    const mockGateway = { sendNotification: jest.fn() };
    const svc = new AutomationService(new SensorGatewayStub(READING_VIOLATION), mockGateway);

    await svc.evaluate(RULE_MANUAL_ACTIVE, 2);

    expect(mockGateway.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'suggested', batchId: 2 })
    );
  });

  test('TU-NG-004 | limiar NÃO violado → sendNotification NÃO deve ser chamado', async () => {
    const mockGateway = { sendNotification: jest.fn() };
    const svc = new AutomationService(new SensorGatewayStub(READING_NO_VIOLATION), mockGateway);

    await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(mockGateway.sendNotification).not.toHaveBeenCalled();
  });

  test('TU-NG-005 | regra inativa → sendNotification NÃO deve ser chamado', async () => {
    const mockGateway = { sendNotification: jest.fn() };
    const svc = new AutomationService(new SensorGatewayStub(READING_VIOLATION), mockGateway);

    await svc.evaluate(RULE_INACTIVE, 1);

    expect(mockGateway.sendNotification).not.toHaveBeenCalled();
  });

  test('TU-NG-006 | notificação contém alertType=Crítico quando limiar violado', async () => {
    const mockGateway = { sendNotification: jest.fn() };
    const svc = new AutomationService(new SensorGatewayStub(READING_VIOLATION), mockGateway);

    await svc.evaluate(RULE_AUTO_ACTIVE, 1);

    expect(mockGateway.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ alertType: 'Crítico' })
    );
  });
});
