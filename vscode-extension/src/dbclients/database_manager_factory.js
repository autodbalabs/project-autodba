const PostgresManager = require('./postgres_manager');

/**
 * Factory for creating database manager instances
 */
class DatabaseManagerFactory {
  /**
   * Create a database manager instance based on connection details
   * @param {Object} connectionDetails - Connection details including kind and other required properties
   * @returns {DatabaseManager} Database manager instance
   * @throws {Error} If the database kind is not supported
   */
  static create(connectionDetails) {
    if (!connectionDetails.kind) {
      throw new Error('Database kind is required');
    }

    switch (connectionDetails.kind) {
      case 'postgresql':
      case 'postgres':
        return new PostgresManager(connectionDetails);
      default:
        throw new Error(`Unsupported database kind: ${connectionDetails.kind}`);
    }
  }
}

module.exports = DatabaseManagerFactory;
