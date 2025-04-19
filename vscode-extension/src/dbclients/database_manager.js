/**
 * Base database manager interface that all database managers must implement
 */
class DatabaseManager {
  /**
   * Create a new database manager instance
   * @param {Object} connectionDetails - Connection details
   */
  constructor(connectionDetails) {
    this.connectionDetails = connectionDetails;
  }

  /**
   * Get database type
   * @returns {string} Database type
   */
  getDatabaseType() {
    throw new Error('getDatabaseType() must be implemented by subclass');
  }

  /**
   * Get database version
   * @returns {string} Database version
   */
  getDatabaseVersion() {
    throw new Error('getDatabaseVersion() must be implemented by subclass');
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query to execute
   * @returns {Promise<Object>} Query result
   */
  executeQuery(sql) {
    throw new Error('execute(sql) must be implemented by subclass');
  }

  /**
   * Check if prerequisites are met
   * @returns {Promise<Object>} Check result
   */
  checkPrerequisites() {
    throw new Error('checkPrerequisites() must be implemented by subclass');
  }

  /**
   * Get available checks
   * @returns {Array<BaseCheck>} Array of check instances
   */
  getAvailableChecks() {
    throw new Error('getAvailableChecks() must be implemented by subclass');
  }

  /**
   * Execute checks
   * @param {Array<BaseCheck>} checks - Array of check instances
   * @returns {Promise<Object>} Check result
   */
  executeChecks(checks) {
    throw new Error('executeChecks() must be implemented by subclass');
  }
}

module.exports = DatabaseManager;
