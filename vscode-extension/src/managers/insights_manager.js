/**
 * Manages database insights and their application
 */
const { getChecks } = require('../utils/check_registry');

class InsightsManager {
  /**
   * Create a new insights manager instance
   * @param {DatabaseManager} manager - Database manager instance
   * @param {vscode.ExtensionContext} context - VSCode extension context
   */
  constructor(manager, context) {
    this.manager = manager;
  }

  /**
   * Get insights from available checks
   * @returns {Promise<Array<Object>>} Array of insights
   */
  async getInsights() {
    // Run preflight/prerequisite checks first
    const prereqResult = await this.manager.checkPrerequisites();
    const allInsights = [...prereqResult.insights];

    if (prereqResult.insights.some(insight => insight.severity_level === 5)) {
      return allInsights;
    }

    const checkClasses = getChecks(
      this.manager.getDatabaseType ? this.manager.getDatabaseType() : this.manager.kind
    );
    const checks = checkClasses.map(Check => new Check(this.manager));
    const { insights } = await this.manager.executeChecks(checks);
    return allInsights.concat(insights);
  }
}

module.exports = InsightsManager;
