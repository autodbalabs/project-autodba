/**
 * Base check interface that all database checks must implement.
 * Each check is responsible for:
 * 1. Preflight validation (validate)
 * 2. Insight generation (generateInsights)
 */
class BaseCheck {
  /**
   * Create a new check instance
   * @param {DatabaseManager} databaseManager - Database manager for executing queries
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.blocking] - If true, critical validation failures will stop further checks
   */
  constructor(databaseManager, options = {}) {
    if (!databaseManager) {
      throw new Error('DatabaseManager is required');
    }
    this.databaseManager = databaseManager;
    this.blocking = options.blocking || false;
  }

  /**
   * Validate if the check can be performed
   * @param {Object} context - Context from previous checks
   * @returns {Promise<Array<Object>>} Array of validation insights with highest severity
   */
  async validate(context = {}) {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Generate insights based on the check
   * @param {Object} context - Context from previous checks
   * @returns {Promise<Array<Object>>} Array of generated insights
   */
  async generateInsights(context = {}) {
    throw new Error('generateInsights() must be implemented by subclass');
  }

  /**
   * Determine if execution should stop after this check.
   * Subclasses can override for custom logic.
   * @returns {boolean}
   */
  shouldBlock() {
    return this.blocking;
  }
}

module.exports = BaseCheck;
