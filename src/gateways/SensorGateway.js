class SensorGateway {
  /**
   * @param {number} batchId
   * @returns {{ temperature: number, humidity: number, luminosity: number,
   *             measurementRecent: boolean, thresholdViolated: boolean }}
   */
  async getLatestReading(batchId) {
    throw new Error('SensorGateway.getLatestReading() não implementado');
  }
}

module.exports = { SensorGateway };
