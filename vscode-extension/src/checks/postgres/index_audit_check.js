const BaseCheck = require('../../checks/base_check');

/**
 * Index Audit analysis check
 */
class IndexAuditCheck extends BaseCheck {
  /**
   * Validate if the check can be performed
   * @param {Object} context - Context from previous checks
   * @returns {Promise<Array<Object>>} Array of validation insights
   */
  async validate(context = {}) {
    const insights = [];
    try {
      // Check if we can access index information
      await this.databaseManager.executeQuery(`
        SELECT 1 
        FROM pg_indexes 
        LIMIT 1
      `);
    } catch (error) {
      insights.push({
        kind: 'index-audit-failure',
        severity_level: 5,
        location: 'database',
        resolution: null,
        title: 'Index Audit Cannot Run',
        context: {
          reason: `Cannot access index information: ${error.message || error.code}`,
          status: 'failed',
          impact: 'critical'
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
      // Find unused indexes
      const unusedIndexes = await this.databaseManager.executeQuery(`
        SELECT 
          ui.schemaname,
          ui.relname,
          ui.indexrelname,
          ui.idx_scan,
          ui.last_idx_scan,
          pg_relation_size(ui.indexrelid) as index_size,
          pi.indexdef as index_definition
        FROM pg_stat_user_indexes ui
        JOIN pg_indexes pi ON ui.schemaname = pi.schemaname 
          AND ui.relname = pi.tablename 
          AND ui.indexrelname = pi.indexname
        WHERE ui.idx_scan = 0 OR (ui.last_idx_scan IS NOT NULL AND ui.last_idx_scan < now() - interval '30 days')
        ORDER BY pg_relation_size(ui.indexrelid) DESC
      `);

      for (const index of unusedIndexes.rows) {
        insights.push({
          kind: 'unused-index',
          severity_level: 3,
          location: `${index.schemaname}.${index.relname}.${index.indexrelname}`,
          resolution: `DROP INDEX IF EXISTS "${index.schemaname}"."${index.indexrelname}";`,
          title: 'Unused Index Detected',
          context: {
            schema: index.schemaname,
            table: index.relname,
            index: index.indexrelname,
            index_definition: index.index_definition,
            index_size: index.index_size,
            impact: 'moderate',
            description: `Index ${index.indexrelname} on ${index.schemaname}.${index.relname} is unused`
          }
        });
      }

      // Find redundant indexes
      const redundantIndexes = await this.databaseManager.executeQuery(`
        WITH index_info AS (
          SELECT
            schemaname,
            tablename,
            indexname,
            indexdef,
            regexp_replace(indexdef, '^CREATE.*INDEX.*ON.*\\((.*)\\)$', '\\1') as columns
          FROM pg_indexes
        )
        SELECT DISTINCT
          a.schemaname,
          a.tablename,
          a.indexname as redundant_index,
          b.indexname as covering_index
        FROM index_info a
        JOIN index_info b ON a.schemaname = b.schemaname
          AND a.tablename = b.tablename
          AND a.indexname != b.indexname
          AND b.columns LIKE a.columns || '%'
      `);

      for (const index of redundantIndexes.rows) {
        insights.push({
          kind: 'redundant-index',
          severity_level: 2,
          location: `${index.schemaname}.${index.tablename}.${index.redundant_index}`,
          resolution: `DROP INDEX IF EXISTS "${index.schemaname}"."${index.redundant_index}";`,
          title: 'Redundant Index Detected',
          context: {
            schema: index.schemaname,
            table: index.tablename,
            redundant_index: index.redundant_index,
            covering_index: index.covering_index,
            impact: 'low',
            description: `Index ${index.redundant_index} is redundant with ${index.covering_index}`
          }
        });
      }

      return insights;

    } catch (error) {
      console.error('Error analyzing indexes:', error);
      return [];
    }
  }
}

module.exports = IndexAuditCheck;
