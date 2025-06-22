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
   * Close the database connection
   */
  async close() {
    // Optional for subclasses to implement
  }
}

module.exports = DatabaseManager;
