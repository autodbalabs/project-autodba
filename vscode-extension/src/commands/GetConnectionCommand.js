const BaseCommand = require('./BaseCommand');
const { ConnectionManager } = require('../managers/connection_manager');

class GetConnectionCommand extends BaseCommand {
  async execute(message, webview) {
    try {
      const connectionManager = new ConnectionManager(this.context);
      const connectionDetails = await connectionManager.getConnection(message.connectionName);
      if (!connectionDetails) {
        throw new Error(`Failed to get connection details for: ${message.connectionName}`);
      }
      
      webview.postMessage({
        type: 'connection_details',
        connection: connectionDetails
      });
    } catch (error) {
      webview.postMessage({
        type: 'error',
        error: error.message
      });
    }
  }
}

module.exports = GetConnectionCommand; 