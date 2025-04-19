const { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } = require('vscode');
const { CommandFactory } = require('../commands/CommandFactory');
const logger = require('../utils/logger');

/**
 * Gets the webview URI of the given local file path.
 * 
 * @param {Webview} webview A reference to the extension webview
 * @param {Uri} extensionUri The URI of the directory containing the extension
 * @param {string[]} pathList An array of strings representing the path to a file
 * @returns {Uri} The URI pointing to the file path
 */
function getUri(webview, extensionUri, pathList) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

/**
 * This class manages the state and behavior of the main webview panel.
 *
 * It contains all the data and methods for:
 * - Creating and rendering the main webview panel
 * - Managing database connections and insights
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
class MainPanel {
  /** @type {MainPanel | undefined} */
  static currentPanel = undefined;
  
  /** @type {WebviewPanel} */
  _panel;
  
  /** @type {Disposable[]} */
  _disposables = [];

  /**
   * The MainPanel class private constructor (called only from the render method).
   *
   * @param {WebviewPanel} panel A reference to the webview panel
   * @param {ExtensionContext} context The extension context
   */
  constructor(panel, context) {
    logger.log('Initializing MainPanel');
    this._panel = panel;
    this._context = context;
    this._commandFactory = new CommandFactory(context);
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, this._context.extensionUri);
    this._setWebviewMessageListener(this._panel.webview);
    logger.log('MainPanel initialized successfully');
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param {ExtensionContext} context The extension context
   */
  static render(context) {
    if (MainPanel.currentPanel) {
      logger.log('Revealing existing webview panel');
      MainPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      logger.log('Creating new webview panel');
      const panel = window.createWebviewPanel(
        'main_panel',
        'Auto DBA',
        ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [Uri.joinPath(context.extensionUri, 'webview', 'dist')]
        }
      );

      MainPanel.currentPanel = new MainPanel(panel, context);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  dispose() {
    logger.log('Disposing MainPanel');
    MainPanel.currentPanel = undefined;

    if (this._panel) {
      this._panel.dispose();
    }

    while (this._disposables?.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
    logger.log('MainPanel disposed successfully');
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @param {Webview} webview A reference to the extension webview
   * @param {Uri} extensionUri The URI of the directory containing the extension
   * @returns {string} A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  _getWebviewContent(webview, extensionUri) {
    const nonce = this._getNonce();
    const stylesUri = getUri(webview, extensionUri, ['webview', 'dist', 'bundle.css']);
    const scriptUri = getUri(webview, extensionUri, ['webview', 'dist', 'bundle.js']);

    return /*html*/ `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${stylesUri}">
          <script nonce="${nonce}" src="${scriptUri}" defer></script>
        </head>
        <body>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is received.
   *
   * @param {Webview} webview A reference to the extension webview
   */
  _setWebviewMessageListener(webview) {
    webview.onDidReceiveMessage(
      async (message) => {
        logger.log('Received message from webview:', message);
        try {
          const command = this._commandFactory.createCommand(message.command);
          logger.log(`Executing command: ${message.command}`);
          await command.execute(message, webview);
          logger.log(`Command ${message.command} executed successfully`);
        } catch (error) {
          logger.log('Error executing command:', error);
          window.showErrorMessage(`Failed to execute command: ${error.message}`);
        }
      },
      undefined,
      this._disposables
    );
  }

  /**
   * Generates a nonce for use in the webview's Content Security Policy.
   * 
   * @returns {string} A random nonce string
   */
  _getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

module.exports = { MainPanel };
