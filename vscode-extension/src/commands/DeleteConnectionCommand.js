const vscode = require('vscode');
const BaseCommand = require('./BaseCommand');
const { ConnectionManager } = require('../managers/connection_manager');

class DeleteConnectionCommand extends BaseCommand {
  async execute(message, webview) {
    try {
      const connectionManager = new ConnectionManager(this.context);
      await connectionManager.removeConnection(message.name);
      const updatedConnections = await connectionManager.getAllConnections();

      webview.postMessage({
        type: 'connections',
        connections: updatedConnections
      });

      vscode.window.showInformationMessage('Connection deleted successfully!');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete connection: ${error.message}`);
    }
  }
}

module.exports = DeleteConnectionCommand; 