const vscode = require('vscode');
const BaseCommand = require('./BaseCommand');
const { ConnectionManager } = require('../managers/connection_manager');

class SaveConnectionCommand extends BaseCommand {
  async execute(message, webview) {
    try {
      const connectionManager = new ConnectionManager(this.context);
      await connectionManager.addConnection(message.name, message.connection);

      vscode.window.showInformationMessage('Connection saved successfully!');

      webview.postMessage({
        type: 'success'
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