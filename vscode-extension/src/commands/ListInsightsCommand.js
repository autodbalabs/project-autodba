const BaseCommand = require('./BaseCommand');
const DatabaseManagerFactory = require('../dbclients/database_manager_factory');
const { ConnectionManager } = require('../managers/connection_manager');
const InsightsManager = require('../managers/insights_manager');
const logger = require('../utils/logger');
const postgresChecks = require('../checks/postgres');

class ListInsightsCommand extends BaseCommand {
  async execute(message, webview) {
    let databaseManager;
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

      if (connectionDetails.kind === 'postgresql' || connectionDetails.kind === 'postgres') {
        postgresChecks.registerChecks(connectionName);
      }

      databaseManager = DatabaseManagerFactory.create(connectionDetails);
      const insightsManager = new InsightsManager(databaseManager);
      const insights = await insightsManager.getInsights();
      
      webview.postMessage({
        type: 'insights',
        insights: insights
      });
    } catch (error) {
      logger.log('Failed to get insights:', error);
      webview.postMessage({
        type: 'error',
        message: `Failed to get insights: ${error.message}`
      });
    } finally {
      if (databaseManager) {
        try {
          await databaseManager.close();
        } catch (e) {
          logger.log('Error closing database manager:', e);
        }
      }
    }
  }
}

module.exports = ListInsightsCommand;
