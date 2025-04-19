const vscode = require('vscode');
const CacheManager = require('./cache_manager');
const config = require('../utils/config');

/**
 * Manages database insights and their application
 */
class InsightsManager {
  /**
   * Create a new insights manager instance
   * @param {DatabaseManager} manager - Database manager instance
   * @param {vscode.ExtensionContext} context - VSCode extension context
   */
  constructor(manager, context) {
    this.manager = manager;
    this.cacheManager = new CacheManager(context, undefined, config.get('debug_mode', false));
  }

  /**
   * Get insights from available checks
   * @returns {Promise<Array<Object>>} Array of insights
   */
  async getInsights() {
    const allInsights = [];
    const checks = this.manager.getAvailableChecks();

    for (const check of checks) {
      try {
        // Run preflight validation first
        const validationInsights = await check.validate();
        
        // If there are any critical validation issues, skip this check
        const hasCriticalIssues = validationInsights.some(insight => insight.severity_level === 5);
        if (hasCriticalIssues) {
          allInsights.push(...validationInsights);
          continue;
        }

        // Run the check if validation passed
        const insights = await check.generateInsights();
        allInsights.push(...insights);
      } catch (error) {
        console.error(`Error executing check ${check.constructor.name}:`, error);
        allInsights.push({
          kind: 'check-error',
          severity_level: 5,
          location: 'system',
          resolution: null,
          title: `Error in ${check.constructor.name}`,
          context: {
            error: error.message,
            status: 'failed',
            impact: 'critical'
          }
        });
      }
    }

    return allInsights;
  }

  /**
   * Clear cache for the database manager
   */
  async clearCache() {
    const cacheKey = this.manager.constructor.name;
    await this.cacheManager.clearInsights(cacheKey);
  }

  /**
   * Clear all cached insights
   */
  async clearAllCache() {
    await this.cacheManager.clearAllInsights();
  }
}

module.exports = InsightsManager;
