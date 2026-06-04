const { decideAction } = require('./automationEngine');

class AutomationService {
  /**
   * @param {import('../gateways/SensorGateway').SensorGateway} sensorGateway
   * @param {import('../gateways/NotificationGateway').NotificationGateway} notificationGateway
   */
  constructor(sensorGateway, notificationGateway) {
    this.sensorGateway = sensorGateway;
    this.notificationGateway = notificationGateway;
  }

  /**
   * Avalia uma regra para um lote e envia notificação se necessário.
   * @param {{ id: number, mode: string, active: boolean }} rule
   * @param {number} batchId
   * @returns {Promise<{ action: string, reading: object }>}
   */
  async evaluate(rule, batchId) {
    const reading = await this.sensorGateway.getLatestReading(batchId);

    const action = decideAction({
      mode: rule.mode,
      ruleActive: rule.active,
      measurementRecent: reading.measurementRecent,
      thresholdViolated: reading.thresholdViolated,
    });

    if (action !== 'none') {
      await this.notificationGateway.sendNotification({
        batchId,
        alertType: reading.thresholdViolated ? 'Crítico' : 'Informativo',
        message: `Ação automática despoletada: ${action} (lote ${batchId})`,
        action,
      });
    }

    return { action, reading };
  }
}

module.exports = { AutomationService };
