/**
 * Manages database insights and their application
 */
const { getChecks } = require('../utils/check_registry');

class InsightsManager {
  /**
   * Create a new insights manager instance
   * @param {DatabaseManager} manager - Database manager instance
   */
  constructor(manager) {
    this.manager = manager;
  }

  /**
   * Execute a list of checks sequentially.
   * @param {Array<BaseCheck>} checks
   * @returns {Promise<{context: Object, insights: Array<Object>}>}
   */
  async _executeChecks(checks) {
    const allInsights = [];
    let currentContext = { capabilities: {} };

    for (const check of checks) {
      try {
        const validationInsights = await check.validate(currentContext);
        const hasCritical = validationInsights.some(i => i.severity_level === 5);
        if (validationInsights.length) {
          allInsights.push(...validationInsights);
        }
        if (hasCritical) {
          if (check.shouldBlock()) {
            break;
          }
          continue;
        }

        const insights = await check.generateInsights(currentContext);
        if (insights) {
          allInsights.push(...insights);
        }
      } catch (error) {
        console.error(`Error executing check ${check.constructor.name}:`, error);
        allInsights.push({
          kind: 'check-failed',
          severity_level: 5,
          location: 'system',
          resolution: null,
          title: `${check.constructor.name} Failed`,
          context: {
            error: error.message,
            status: 'failed',
            impact: 'critical',
            description: `Error executing check: ${error.message}`
          }
        });
      }
    }

    return { context: currentContext, insights: allInsights };
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
    const { insights } = await this._executeChecks(checks);
    return allInsights.concat(insights);
  }
}

module.exports = InsightsManager;
