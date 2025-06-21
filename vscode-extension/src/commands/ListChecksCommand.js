const BaseCommand = require('./BaseCommand');
const DatabaseManagerFactory = require('../dbclients/database_manager_factory');
const { ConnectionManager } = require('../managers/connection_manager');
const logger = require('../utils/logger');

class ListChecksCommand extends BaseCommand {
  async execute(message, webview) {
    try {
      const connectionName = message.connection;
      if (!connectionName) {
        throw new Error('Connection name is required');
      }

      const connectionManager = new ConnectionManager(this.context);
      const connectionDetails = await connectionManager.getConnection(connectionName);
      if (!connectionDetails) {
        throw new Error(`Failed to get connection details for: ${connectionName}`);
      }

      const databaseManager = DatabaseManagerFactory.create(connectionDetails);
      const checks = databaseManager.listChecks();

      webview.postMessage({
        type: 'checks',
        checks
      });
    } catch (error) {
      logger.log('Failed to list checks:', error);
      webview.postMessage({
        type: 'error',
        message: `Failed to list checks: ${error.message}`
      });
    }
  }
}

module.exports = ListChecksCommand;
