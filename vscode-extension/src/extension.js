const vscode = require('vscode');
// const { PostHog } = require('posthog-node');
const { MainPanel } = require('./panels/MainPanel.js');
const config = require('./utils/config.js');
const logger = require('./utils/logger.js');

// const posthog = new PostHog(config.get('posthog_api_key'), {
//   host: config.get('posthog_host'),
// });

// posthog.capture({
//   event: 'extension_activated',
// });

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  logger.initialize();

  try {
    logger.log('Initializing AutoDBA extension...');
    config.initialize(context);

    if (config.get('debug_mode')) {
      logger.showOutput();
      logger.log('Debug mode is enabled');
    }

    logger.log('AutoDBA extension is now active');

    let disposable = vscode.commands.registerCommand('autodba-postgresql-insights.main', async () => {
      logger.log('Main command triggered');
      MainPanel.render(context);
    });

    context.subscriptions.push(disposable);
    logger.log('AutoDBA extension initialization completed successfully');
  } catch (error) {
    logger.log('Failed to initialize AutoDBA:', error);
    vscode.window.showErrorMessage(`Failed to initialize AutoDBA: ${error.message}`);
  }
}

function deactivate() {
  logger.log('AutoDBA extension is deactivating');
  logger.dispose();
}

module.exports = {
  activate,
  deactivate
};
