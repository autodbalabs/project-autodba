const { Pool } = require('pg');
const DatabaseManager = require('./database_manager');
const { parseConnectionUrl } = require('../utils/connection_url');
/**
 * @typedef {Object} PostgresConnectionProps
 * @property {string} host - Database host
 * @property {number} port - Database port
 * @property {string} dbname - Database name
 * @property {string} username - Database username
 * @property {string} password - Database password
 * @property {number} [connectionTimeoutMillis] - Connection timeout in milliseconds
 */

/**
 * PostgreSQL database manager
 */
class PostgresManager extends DatabaseManager {
  constructor(connectionDetails) {
    super(connectionDetails);

    this.pool = new Pool(this.resolveConnectionDetails(connectionDetails));
  }

  get kind() {
    return 'postgresql';
  }

  resolveConnectionDetails(connectionDetails) {
    // Default to 30s if no timeout is provided
    const DEFAULT_TIMEOUT = 30000;

    if (connectionDetails.url) {
      const parsed = parseConnectionUrl(connectionDetails.url);
      return {
        host: parsed.host,
        port: parsed.port,
        database: parsed.dbname,
        user: parsed.username,
        password: connectionDetails.password || parsed.password,
        connectionTimeoutMillis: connectionDetails.connectionTimeoutMillis ?? parsed.options.connectionTimeoutMillis ?? DEFAULT_TIMEOUT,
        ...parsed.options,
        ...(connectionDetails.options || {})
      };
    }

    return {
      host: connectionDetails.host,
      port: connectionDetails.port,
      database: connectionDetails.dbname,
      user: connectionDetails.username,
      password: connectionDetails.password,
      connectionTimeoutMillis: connectionDetails.connectionTimeoutMillis ?? connectionDetails.options?.connectionTimeoutMillis ?? DEFAULT_TIMEOUT,
      ...(connectionDetails.options || {})
    };
  }

  /**
   * Get database type
   * @returns {string} Database type
   */
  getDatabaseType() {
    return 'postgresql';
  }

  /**
   * Get database version
   * @returns {Promise<string>} Database version
   */
  async getDatabaseVersion() {
    const result = await this.executeQuery('SELECT version()');
    return result.rows[0].version;
  }

  /**
   * Execute a SQL query
   * @param {string} sql - SQL query to execute
   * @returns {Promise<Object>} Query result
   */
  async executeQuery(sql) {
    const client = await this.pool.connect();
    try {
      return await client.query(sql);
    } finally {
      client.release();
    }
  }

  /**
   * Check if prerequisites are met
   * @returns {Promise<Object>} Check result
   */
  async checkPrerequisites() {
    const insights = [];
    const context = {};
    try {
      // Check basic connectivity
      await this.executeQuery('SELECT 1');

      try {
        const ver = await this.executeQuery('SHOW server_version');
        context.server_version = ver.rows[0].server_version;
      } catch (e) {
        context.server_version = 'unknown';
      }
      
      // Check if we have necessary permissions for all required tables
      const permissionCheck = await this.executeQuery(`
        SELECT 
          has_table_privilege(current_user, 'pg_stat_activity', 'SELECT') as can_read_stats,
          has_table_privilege(current_user, 'pg_settings', 'SELECT') as can_read_settings,
          has_table_privilege(current_user, 'pg_indexes', 'SELECT') as can_read_indexes,
          has_table_privilege(current_user, 'pg_stat_statements', 'SELECT') as can_read_statements,
          has_table_privilege(current_user, 'pg_stat_user_indexes', 'SELECT') as can_read_user_indexes,
          has_table_privilege(current_user, 'pg_stat_user_tables', 'SELECT') as can_read_user_tables
      `);

      const permissions = permissionCheck.rows[0];
      if (!permissions.can_read_stats) {
        insights.push({
          kind: 'permission-failure',
          severity_level: 5,
          location: 'database',
          resolution: 'GRANT SELECT ON pg_stat_activity TO current_user;',
          title: 'Missing Permission: pg_stat_activity',
          context: {
            table: 'pg_stat_activity',
            permission: 'SELECT',
            impact: 'critical',
            description: 'Cannot read pg_stat_activity table. Required for query analysis.'
          }
        });
      }
      if (!permissions.can_read_settings) {
        insights.push({
          kind: 'permission-failure',
          severity_level: 5,
          location: 'database',
          resolution: 'GRANT SELECT ON pg_settings TO current_user;',
          title: 'Missing Permission: pg_settings',
          context: {
            table: 'pg_settings',
            permission: 'SELECT',
            impact: 'critical',
            description: 'Cannot read pg_settings table. Required for configuration analysis.'
          }
        });
      }
      if (!permissions.can_read_indexes) {
        insights.push({
          kind: 'permission-failure',
          severity_level: 5,
          location: 'database',
          resolution: 'GRANT SELECT ON pg_indexes TO current_user;',
          title: 'Missing Permission: pg_indexes',
          context: {
            table: 'pg_indexes',
            permission: 'SELECT',
            impact: 'critical',
            description: 'Cannot read pg_indexes table. Required for index analysis.'
          }
        });
      }
      if (!permissions.can_read_statements) {
        insights.push({
          kind: 'permission-failure',
          severity_level: 5,
          location: 'database',
          resolution: 'GRANT SELECT ON pg_stat_statements TO current_user;',
          title: 'Missing Permission: pg_stat_statements',
          context: {
            table: 'pg_stat_statements',
            permission: 'SELECT',
            impact: 'critical',
            description: 'Cannot read pg_stat_statements table. Required for query performance analysis.'
          }
        });
      }
      if (!permissions.can_read_user_indexes) {
        insights.push({
          kind: 'permission-failure',
          severity_level: 5,
          location: 'database',
          resolution: 'GRANT SELECT ON pg_stat_user_indexes TO current_user;',
          title: 'Missing Permission: pg_stat_user_indexes',
          context: {
            table: 'pg_stat_user_indexes',
            permission: 'SELECT',
            impact: 'critical',
            description: 'Cannot read pg_stat_user_indexes table. Required for index usage analysis.'
          }
        });
      }
      if (!permissions.can_read_user_tables) {
        insights.push({
          kind: 'permission-failure',
          severity_level: 5,
          location: 'database',
          resolution: 'GRANT SELECT ON pg_stat_user_tables TO current_user;',
          title: 'Missing Permission: pg_stat_user_tables',
          context: {
            table: 'pg_stat_user_tables',
            permission: 'SELECT',
            impact: 'critical',
            description: 'Cannot read pg_stat_user_tables table. Required for table statistics analysis.'
          }
        });
      }

      // Check if pg_stat_statements extension is installed
      const extensionCheck = await this.executeQuery(`
        SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'
      `);
      if (extensionCheck.rows.length === 0) {
        insights.push({
          kind: 'missing-extension',
          severity_level: 5,
          location: 'database',
          resolution: 'CREATE EXTENSION IF NOT EXISTS pg_stat_statements;',
          title: 'Missing Extension: pg_stat_statements',
          context: {
            extension: 'pg_stat_statements',
            impact: 'critical',
            description: 'The pg_stat_statements extension is required for query performance analysis.'
          }
        });
      }
      
    } catch (error) {
      insights.push({
        kind: 'prerequisites-failure',
        severity_level: 5,
        location: 'database',
        resolution: null,
        title: 'Database Prerequisites Check Failed',
        context: {
          reason: error.message,
          status: 'failed',
          impact: 'critical',
          description: `Cannot verify database prerequisites: ${error.message}`
        }
      });
    }
    return { insights, context };
  }

  /**
   * Close the database connection
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = PostgresManager;
