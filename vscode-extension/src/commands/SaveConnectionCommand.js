const vscode = require('vscode');
const BaseCommand = require('./BaseCommand');
const { ConnectionManager } = require('../managers/connection_manager');
const DatabaseManagerFactory = require('../dbclients/database_manager_factory');

class SaveConnectionCommand extends BaseCommand {
  async execute(message, webview) {
    try {
      // Test connection before saving
      await DatabaseManagerFactory.testConnection(message.connection);

      const connectionManager = new ConnectionManager(this.context);
      await connectionManager.addConnection(message.name, message.connection);

      vscode.window.showInformationMessage('Connection saved successfully!');

      webview.postMessage({
        type: 'success',
        name: message.name
      });
    } catch (error) {
      console.error('Failed to save connection:', error.code);

      if (error.code === 'ECONNREFUSED') {
        vscode.window.showErrorMessage('Failed to save connection: Connection refused', {
          modal: true,
          detail: error.detail || error.message || error.code
        });
      } else {
        vscode.window.showErrorMessage(`Failed to save connection: ${error.message || error.code}`, {
          modal: true,
          detail: error.detail || error.message || error.code
        });
      }

      webview.postMessage({
        type: 'error',
        message: `Failed to save connection: ${error.message || error.code}`
      });
    }
  }
}

module.exports = SaveConnectionCommand;
