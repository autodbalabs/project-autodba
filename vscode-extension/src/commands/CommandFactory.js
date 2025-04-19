const SaveConnectionCommand = require('./SaveConnectionCommand');
const ListConnectionsCommand = require('./ListConnectionsCommand');
const DeleteConnectionCommand = require('./DeleteConnectionCommand');
const ListInsightsCommand = require('./ListInsightsCommand');
const GetConnectionCommand = require('./GetConnectionCommand');
const logger = require('../utils/logger');

class CommandFactory {
  constructor(context) {
    logger.log('Initializing CommandFactory');
    this._context = context;
    this._commands = {
      'connections:save': SaveConnectionCommand,
      'connections:list': ListConnectionsCommand,
      'connections:delete': DeleteConnectionCommand,
      'connections:get': GetConnectionCommand,
      'insights:list': ListInsightsCommand
    };
    logger.log('CommandFactory initialized with commands:', Object.keys(this._commands));
  }

  createCommand(commandName) {
    logger.log(`Creating command: ${commandName}`);
    const CommandClass = this._commands[commandName];
    if (!CommandClass) {
      const error = `Unknown command: ${commandName}`;
      logger.log('Error:', error);
      throw new Error(error);
    }
    logger.log(`Successfully created command: ${commandName}`);
    return new CommandClass(this._context);
  }
}

module.exports = { CommandFactory };
