const BaseCheck = require('../../checks/base_check');
const { getSeverityLevel } = require('../../utils/severity');

/**
 * Configuration suggestions check for PostgreSQL
 * Analyzes current configuration and suggests optimizations based on PostgreSQL system information
 */
class ConfigSuggestionsCheck extends BaseCheck {
  /**
   * Validate if the check can be performed
   * @param {Object} context - Context from previous checks
   * @returns {Promise<Array<Object>>} Array of validation insights
   */
  async validate(context = {}) {
    const insights = [];
    try {
      // Check if we can access configuration
      await this.databaseManager.executeQuery(`
        SELECT 1 FROM pg_settings LIMIT 1
      `);
    } catch (error) {
      insights.push({
        kind: 'config-analysis-failure',
        severity_level: 5,
        location: 'database',
        resolution: null,
        title: 'Configuration Analysis Cannot Run',
        context: {
          reason: `Cannot access configuration information: ${error.message || error.code}`,
          status: 'failed',
          impact: 'critical',
          description: `Cannot analyze configuration: ${error.message}`
        }
      });
    }
    return insights;
  }

  /**
   * Generate insights based on the check
   * @param {Object} context - Context from previous checks
   * @returns {Promise<Array<Object>>} Array of generated insights
   */
  async generateInsights(context = {}) {
    const insights = [];

    try {
      // Get current configuration
      const config = await this.databaseManager.executeQuery(`
        SELECT name, setting, unit, context, vartype, min_val, max_val, enumvals
        FROM pg_settings
        WHERE name IN (
          'shared_buffers',
          'work_mem',
          'maintenance_work_mem',
          'wal_buffers',
          'max_connections',
          'max_worker_processes',
          'effective_cache_size',
          'random_page_cost',
          'effective_io_concurrency'
        )
      `);

      // Get system information from PostgreSQL
      const systemInfo = await this.databaseManager.executeQuery(`
        WITH system_info AS (
          SELECT 
            (SELECT setting::bigint FROM pg_settings WHERE name = 'shared_buffers') as shared_buffers,
            (SELECT setting::bigint FROM pg_settings WHERE name = 'work_mem') as work_mem,
            (SELECT setting::bigint FROM pg_settings WHERE name = 'maintenance_work_mem') as maintenance_work_mem,
            (SELECT setting::bigint FROM pg_settings WHERE name = 'wal_buffers') as wal_buffers,
            (SELECT setting::bigint FROM pg_settings WHERE name = 'max_connections') as max_connections,
            (SELECT setting::bigint FROM pg_settings WHERE name = 'max_worker_processes') as max_workers,
            (SELECT count(*) FROM pg_stat_activity) as current_connections,
            (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
        )
        SELECT * FROM system_info
      `);

      // Analyze and suggest configuration changes
      const suggestions = this._analyzeConfig(config.rows, systemInfo.rows[0]);
      
      for (const suggestion of suggestions) {
        insights.push({
          kind: 'config-optimization',
          severity_level: getSeverityLevel(suggestion.impact),
          location: suggestion.parameter,
          resolution: suggestion.sql,
          title: suggestion.title,
          context: {
            parameter: suggestion.parameter,
            current_value: suggestion.current_value,
            suggested_value: suggestion.suggested_value,
            impact: suggestion.impact,
            rationale: suggestion.rationale
          }
        });
      }

      return insights;

    } catch (error) {
      console.error('Error analyzing PostgreSQL configuration:', error);
      throw error;
    }
  }

  _analyzeConfig(config, systemInfo) {
    const suggestions = [];

    // Analyze shared_buffers
    const sharedBuffers = config.find(c => c.name === 'shared_buffers');
    if (sharedBuffers) {
      const currentValue = parseInt(sharedBuffers.setting);
      const suggestedValue = Math.min(Math.floor(systemInfo.ram_mb * 0.25), 8192); // 25% of RAM, max 8GB
      
      if (currentValue < suggestedValue) {
        suggestions.push({
          parameter: 'shared_buffers',
          current_value: currentValue,
          suggested_value: suggestedValue,
          impact: 'high',
          title: 'Shared Buffers Configuration',
          rationale: 'Shared buffers are used for caching data. Increasing this can improve read performance.',
          sql: `ALTER SYSTEM SET shared_buffers = '${suggestedValue}MB';`
        });
      }
    }

    // Analyze work_mem
    const workMem = config.find(c => c.name === 'work_mem');
    if (workMem) {
      const currentValue = parseInt(workMem.setting);
      const suggestedValue = Math.min(Math.floor(systemInfo.ram_mb / (systemInfo.max_connections * 4)), 64); // 1/4 of RAM per connection, max 64MB
      
      if (currentValue < suggestedValue) {
        suggestions.push({
          parameter: 'work_mem',
          current_value: currentValue,
          suggested_value: suggestedValue,
          impact: 'moderate',
          title: 'Work Memory Configuration',
          rationale: 'Work memory is used for sorting and hash operations. Increasing this can improve query performance.',
          sql: `ALTER SYSTEM SET work_mem = '${suggestedValue}MB';`
        });
      }
    }

    // Analyze maintenance_work_mem
    const maintenanceWorkMem = config.find(c => c.name === 'maintenance_work_mem');
    if (maintenanceWorkMem) {
      const currentValue = parseInt(maintenanceWorkMem.setting);
      const suggestedValue = Math.min(Math.floor(systemInfo.ram_mb * 0.1), 1024); // 10% of RAM, max 1GB
      
      if (currentValue < suggestedValue) {
        suggestions.push({
          parameter: 'maintenance_work_mem',
          current_value: currentValue,
          suggested_value: suggestedValue,
          impact: 'moderate',
          title: 'Maintenance Work Memory Configuration',
          rationale: 'Maintenance work memory is used for maintenance operations like CREATE INDEX. Increasing this can speed up maintenance tasks.',
          sql: `ALTER SYSTEM SET maintenance_work_mem = '${suggestedValue}MB';`
        });
      }
    }

    // Analyze wal_buffers
    const walBuffers = config.find(c => c.name === 'wal_buffers');
    if (walBuffers) {
      const currentValue = parseInt(walBuffers.setting);
      const suggestedValue = 16; // 16MB is a good default for most systems
      
      if (currentValue < suggestedValue) {
        suggestions.push({
          parameter: 'wal_buffers',
          current_value: currentValue,
          suggested_value: suggestedValue,
          impact: 'moderate',
          title: 'WAL Buffers Configuration',
          rationale: 'WAL buffers store write-ahead log data before it is written to disk. Increasing this can improve write performance.',
          sql: `ALTER SYSTEM SET wal_buffers = '${suggestedValue}MB';`
        });
      }
    }

    return suggestions;
  }
}

module.exports = ConfigSuggestionsCheck;
