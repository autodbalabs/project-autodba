const BaseCheck = require('../../checks/base_check');

/**
 * Simple connectivity check that ensures the database can be reached.
 * This check is marked as blocking so other checks are skipped when it fails.
 */
class ConnectionCheck extends BaseCheck {
  static weight = 1;

  constructor(databaseManager) {
    super(databaseManager, { blocking: true });
  }

  async generateInsights() {
    const insights = [];
    try {
      await this.databaseManager.executeQuery('SELECT 1');
    } catch (error) {
      insights.push({
        kind: 'connection-failed',
        severity_level: 5,
        location: 'database',
        resolution: null,
        title: 'Database Connection Failed',
        context: {
          error: error.message,
          impact: 'critical',
          description: `Failed to connect to database: ${error.message}`
        }
      });
    }
    return insights;
  }
}

module.exports = ConnectionCheck;
