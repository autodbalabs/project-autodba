const vscode = require('vscode');
const {
  parseConnectionUrl,
  sanitizeConnectionUrl
} = require('../utils/connection_url');

/**
 * Manages database connections and their storage
 */
class ConnectionManager {
  /**
   * Create a new connection manager instance
   * @param {vscode.ExtensionContext} context - VSCode extension context
   */
  constructor(context) {
    this.context = context;
    this.connections = new Map();
    this.db = null;
  }

  /**
   * Initialize the database connection
   */
  async initialize() {
    if (this.db) return;

    const path = require('path');
    const fs = require('fs');
  
    const { LowSync } = await import('lowdb');
    const { JSONFileSync } = await import('lowdb/node');
  
    const dbPath = path.join(this.context.globalStorageUri.fsPath, 'autodba.json');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    const adapter = new JSONFileSync(dbPath);
    this.db = new LowSync(adapter, {
      connections: {}
    });
  }

  /**
   * Add a new database connection
   * @param {string} name - Connection name
   * @param {Object} connectionDetails - Connection details
   */
  async addConnection(name, connectionDetails) {
    await this.initialize();

    // Validate connection details
    if (!connectionDetails.kind) {
      throw new Error('Database kind is required');
    }

    // When a URL is provided, split password from the stored URL
    let password = connectionDetails.password;
    let url = connectionDetails.url;
    let options = connectionDetails.options || {};

    if (url) {
      const parsed = parseConnectionUrl(url);
      password = password || parsed.password;
      options = Object.keys(options).length ? options : parsed.options;
      url = sanitizeConnectionUrl(url);
    }

    const nonSensitiveDetails = {
      kind: connectionDetails.kind,
      url,
      options,
      system: connectionDetails.system || {
        cpus: connectionDetails.cpus,
        memory_gb: connectionDetails.memory_gb,
        storage_type: connectionDetails.storage_type
      }
    };

    await this.db.read();
    this.db.data.connections[name] = nonSensitiveDetails;
    await this.db.write();

    if (password) {
      await this.context.secrets.store(
        `autodba.connection.${name}.auth`,
        JSON.stringify({ password })
      );
    }

    this.connections.set(name, { ...nonSensitiveDetails, password });
  }

  /**
   * Remove a database connection
   * @param {string} name - Connection name
   */
  async removeConnection(name) {
    await this.initialize();

    // Remove from lowdb
    await this.db.read();
    delete this.db.data.connections[name];
    await this.db.write();

    // Remove from secrets
    await this.context.secrets.delete(`autodba.connection.${name}.auth`);

    // Remove from connections list
    this.connections.delete(name);
  }

  /**
   * Get connection details
   * @param {string} name - Connection name
   * @returns {Promise<Object>} Connection details
   */
  async getConnection(name) {
    await this.initialize();

    // Get non-sensitive details from lowdb
    await this.db.read();
    const nonSensitiveDetails = this.db.data.connections[name];
    if (!nonSensitiveDetails) {
      throw new Error(`Connection ${name} not found`);
    }

    // Get sensitive details from secrets
    const authData = await this.context.secrets.get(`autodba.connection.${name}.auth`);
    const sensitiveDetails = authData ? JSON.parse(authData) : {};

    let result = { name, ...nonSensitiveDetails, ...sensitiveDetails };

    if (nonSensitiveDetails.url) {
      const parsed = parseConnectionUrl(nonSensitiveDetails.url);
      parsed.password = sensitiveDetails.password || parsed.password;
      result = { name, ...nonSensitiveDetails, ...parsed, ...sensitiveDetails };
    }

    return result;
  }

  /**
   * Get all connections
   * @returns {Promise<Array<Object>>} Array of connection details
   */
  async getAllConnections() {
    await this.initialize();
    await this.db.read();
    const connections = this.db.data.connections || {};

    const result = [];
    for (const [name, nonSensitiveDetails] of Object.entries(connections)) {
      // Get sensitive details from secrets
      const authData = await this.context.secrets.get(`autodba.connection.${name}.auth`);
      const sensitiveDetails = authData ? JSON.parse(authData) : {};

      let conn = { name, ...nonSensitiveDetails, ...sensitiveDetails };

      if (nonSensitiveDetails.url) {
        const parsed = parseConnectionUrl(nonSensitiveDetails.url);
        parsed.password = sensitiveDetails.password || parsed.password;
        conn = { name, ...nonSensitiveDetails, ...parsed, ...sensitiveDetails };
      }

      result.push(conn);
    }

    return result;
  }
}

module.exports = { ConnectionManager };
