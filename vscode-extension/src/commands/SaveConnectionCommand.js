const vscode = require('vscode');
const BaseCommand = require('./BaseCommand');
const { ConnectionManager } = require('../managers/connection_manager');
const DatabaseManagerFactory = require('../dbclients/database_manager_factory');

class SaveConnectionCommand extends BaseCommand {
  async execute(message, webview) {
    try {
      // Test connection before saving
      let tempManager;
      try {
        tempManager = DatabaseManagerFactory.create(message.connection);
        await tempManager.executeQuery('SELECT 1');
      } finally {
        if (tempManager && typeof tempManager.close === 'function') {
          await tempManager.close();
        }
      }

      const connectionManager = new ConnectionManager(this.context);
      await connectionManager.addConnection(message.name, message.connection);

      vscode.window.showInformationMessage('Connection saved successfully!');

      webview.postMessage({
        type: 'success',
        name: message.name
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save connection: ${error.message}`);

      webview.postMessage({
        type: 'error',
        message: `Failed to save connection: ${error.message}`
      });
    }
  }
}

module.exports = SaveConnectionCommand; 