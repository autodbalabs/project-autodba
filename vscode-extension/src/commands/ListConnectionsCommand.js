const BaseCommand = require('./BaseCommand');
const { ConnectionManager } = require('../managers/connection_manager');

class ListConnectionsCommand extends BaseCommand {
  async execute(message, webview) {
    const connectionManager = new ConnectionManager(this.context);
    const connections = await connectionManager.getAllConnections();

    webview.postMessage({
      type: 'connections',
      connections: connections
    });
  }
}

module.exports = ListConnectionsCommand; 