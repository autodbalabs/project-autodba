const DatabaseManagerFactory = require('../dbclients/database_manager_factory');
const { ConnectionManager } = require('../managers/connection_manager');

class BaseCommand {
  constructor(context) {
    this.context = context;
  }

  async getDatabaseManager(connectionName) {
    const connectionManager = new ConnectionManager(this.context);
    const connectionDetails = await connectionManager.getConnection(connectionName);
    if (!connectionDetails) {
      throw new Error(`Failed to get connection details for: ${connectionName}`);
    }
    return DatabaseManagerFactory.create(connectionDetails);
  }

  async execute(message, webview) {
    throw new Error('execute() must be implemented by subclass');
  }
}

module.exports = BaseCommand;
