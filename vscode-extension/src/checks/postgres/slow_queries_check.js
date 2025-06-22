const BaseCheck = require('../../checks/base_check');
const { getSeverityLevel } = require('../../utils/severity');

/**
 * Slow queries analysis check
 */
class SlowQueriesCheck extends BaseCheck {
  static id = 'slow-queries';
  static weight = 30;

  _extractTables(query) {
    // Simple regex to extract table names from SQL
    const tableRegex = /FROM\s+([a-zA-Z0-9_\.]+)|JOIN\s+([a-zA-Z0-9_\.]+)/gi;
    const matches = query.matchAll(tableRegex);
    const tables = new Set();
    
    for (const match of matches) {
      const table = match[1] || match[2];
      if (table) {
        tables.add(table);
      }
    }
    
    return Array.from(tables);
  }

  _analyzeQuery(query) {
    const analysis = {
      impact: 'moderate',
      recommendation: '',
      sql: null
    };

    // Analyze query performance metrics
    const avgTime = query.mean_time;
    const totalTime = query.total_time;
    const calls = query.calls;
    const rows = query.rows;
    const sharedBlksHit = query.shared_blks_hit;
    const sharedBlksRead = query.shared_blks_read;
    const sharedBlksWritten = query.shared_blks_written;
    const tempBlksRead = query.temp_blks_read;
    const tempBlksWritten = query.temp_blks_written;

    // Determine impact level
    if (avgTime > 1000 || totalTime > 10000) {
      analysis.impact = 'high';
    } else if (avgTime > 100 || totalTime > 1000) {
      analysis.impact = 'moderate';
    } else {
      analysis.impact = 'low';
    }

    // Generate recommendations based on metrics
    const recommendations = [];

    if (sharedBlksRead > sharedBlksHit * 0.5) {
      recommendations.push('Consider adding or optimizing indexes to reduce sequential scans');
    }

    if (tempBlksRead > 0 || tempBlksWritten > 0) {
      recommendations.push('Query is using temporary tables. Consider optimizing to avoid temp table usage');
    }

    if (rows > 10000) {
      recommendations.push('Query returns a large number of rows. Consider adding LIMIT or optimizing the WHERE clause');
    }

    if (calls > 1000) {
      recommendations.push('Query is called frequently. Consider caching results if possible');
    }

    analysis.recommendation = recommendations.join('\n');
    return analysis;
  }

  /**
   * Generate insights based on the check
   * @param {Object} context - Context from previous checks
   * @returns {Promise<Array<Object>>} Array of generated insights
   */
  async generateInsights(context = {}) {
    const insights = [];

    try {
      const result = await this.databaseManager.executeQuery(
        `SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'`
      );

      if (result.rows.length === 0) {
        insights.push({
          kind: 'missing-extension',
          severity_level: 5,
          location: 'database',
          resolution: 'CREATE EXTENSION IF NOT EXISTS pg_stat_statements;',
          title: 'pg_stat_statements Extension Missing',
          context: {
            extension: 'pg_stat_statements',
            status: 'missing',
            impact: 'critical',
            description:
              'The pg_stat_statements extension is not enabled. This extension is required for query performance analysis.'
          }
        });
        return insights;
      }
    } catch (error) {
      insights.push({
        kind: 'slow-query-analysis-failure',
        severity_level: 5,
        location: 'database',
        resolution: null,
        title: 'Slow Queries Analysis Cannot Run',
        context: {
          reason: `Cannot analyze slow queries: ${error.message || error.code}`,
          status: 'failed',
          impact: 'critical',
          description: `Cannot analyze slow queries: ${error.message}`
        }
      });
      return insights;
    }

    try {
      // Get slow queries
      const slowQueries = await this.databaseManager.executeQuery(`
        SELECT
          query,
          calls,
          COALESCE(total_exec_time, total_time) AS total_time,
          COALESCE(mean_exec_time, mean_time) AS mean_time,
          rows,
          shared_blks_hit,
          shared_blks_read,
          shared_blks_written,
          local_blks_hit,
          local_blks_read,
          local_blks_written,
          temp_blks_read,
          temp_blks_written,
          blk_read_time,
          blk_write_time
        FROM pg_stat_statements
        WHERE COALESCE(mean_exec_time, mean_time) > 100
        ORDER BY COALESCE(mean_exec_time, mean_time) DESC
        LIMIT 10
      `);

      for (const query of slowQueries.rows) {
        const analysis = this._analyzeQuery(query);
        insights.push({
          kind: 'slow-query',
          severity_level: getSeverityLevel(analysis.impact),
          location: this._extractTables(query.query).join(', '),
          resolution: analysis.sql,
          title: 'Slow Query Detected',
          context: {
            query: query.query,
            calls: query.calls,
            total_time: query.total_time,
            mean_time: query.mean_time,
            rows: query.rows,
            shared_blks_hit: query.shared_blks_hit,
            shared_blks_read: query.shared_blks_read,
            shared_blks_written: query.shared_blks_written,
            local_blks_hit: query.local_blks_hit,
            local_blks_read: query.local_blks_read,
            local_blks_written: query.local_blks_written,
            temp_blks_read: query.temp_blks_read,
            temp_blks_written: query.temp_blks_written,
            blk_read_time: query.blk_read_time,
            blk_write_time: query.blk_write_time,
            impact: analysis.impact,
            description: `Query takes ${query.mean_time.toFixed(2)}ms on average (${query.calls} calls)\n${analysis.recommendation}`
          }
        });
      }

      return insights;

    } catch (error) {
      console.error('Error analyzing slow queries:', error);
      return [];
    }
  }
}

module.exports = SlowQueriesCheck;
