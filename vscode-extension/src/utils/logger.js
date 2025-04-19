const vscode = require('vscode');

let outputChannel = null;

function initialize() {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('AutoDBA');
    }
}

function formatMessage(message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => {
        if (arg instanceof Error) {
            return `${arg.message}\n${arg.stack}`;
        }
        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg;
    }).join(' ');
    return `[${timestamp}] ${message} ${formattedArgs}`.trim();
}

function log(message, ...args) {
    initialize();
    outputChannel.appendLine(formatMessage(message, ...args));
}

function showOutput() {
    if (outputChannel) {
        outputChannel.show();
    }
}

function dispose() {
    if (outputChannel) {
        outputChannel.dispose();
        outputChannel = null;
    }
}

module.exports = {
    initialize,
    log,
    showOutput,
    dispose
}; 