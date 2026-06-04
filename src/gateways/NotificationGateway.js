class NotificationGateway {
  /**
   * @param {{ batchId: number, alertType: string, message: string, action: string }} notification
   * @returns {Promise<void>}
   */
  async sendNotification(notification) {
    throw new Error('NotificationGateway.sendNotification() não implementado');
  }
}

module.exports = { NotificationGateway };
