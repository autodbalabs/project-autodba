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
  async getInsights(checkIds = null) {
    // Run preflight/prerequisite checks first
    const prereqResult = await this.manager.checkPrerequisites();
    const allInsights = [...prereqResult.insights];

    if (prereqResult.insights.some(insight => insight.severity_level === 5)) {
      return allInsights;
    }

    const checks = this.manager.getAvailableChecks(checkIds);
    const { insights } = await this.manager.executeChecks(checks);
    return allInsights.concat(insights);
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
