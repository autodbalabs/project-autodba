# Check Implementation Guide

## Overview
This guide outlines the process of implementing new database checks in the application. Each check should extend the `BaseCheck` class and implement the required methods.

## Base Check Class
```typescript
class BaseCheck {
  constructor(databaseManager) {
    this.databaseManager = databaseManager;
  }

  async validate(context = {}) {
    return [];
  }

  async generateInsights(context = {}) {
    return [];
  }
}
```

## Required Methods

### 1. validate(context: Object): Promise<Array<Insight>>
This method performs preflight validation to ensure the check can be executed. It should:
- Be lightweight and fast
- Check for required extensions, permissions, or dependencies
- Return validation insights with severity level 5 for critical issues
- Return an empty array if validation passes

Example:
```typescript
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
        reason: `Cannot access index information: ${error.message}`,
        status: 'failed',
        impact: 'critical'
      }
    });
  }
  return insights;
}
```

### 2. generateInsights(context: Object): Promise<Array<Insight>>
This method generates insights based on the check. It should:
- Only be called if validation passes
- Perform the actual analysis
- Return an array of insights
- Handle errors gracefully

Example:
```typescript
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
      WHERE ui.idx_scan = 0
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

    return insights;
  } catch (error) {
    console.error('Error analyzing indexes:', error);
    return [];
  }
}
```

## Best Practices

1. **Error Handling**
   - Always use try-catch blocks in both methods
   - Log errors with appropriate context
   - Return empty arrays instead of throwing errors
   - Use validation insights for critical issues

2. **Performance**
   - Keep validation checks lightweight
   - Use appropriate indexes in your queries
   - Limit result sets when possible
   - Consider caching for expensive operations

3. **Insight Generation**
   - Use consistent severity levels
   - Provide clear, actionable resolutions
   - Include all relevant context
   - Use descriptive titles and descriptions

4. **SQL Queries**
   - Use parameterized queries when possible
   - Include appropriate error handling
   - Consider query timeouts
   - Use appropriate indexes

5. **Testing**
   - Test both validation and insight generation
   - Test error cases
   - Test with different database configurations
   - Test performance with large datasets

## Example Implementation
Here's a complete example of a check implementation:

```typescript
const BaseCheck = require('../../checks/base_check');

class ExampleCheck extends BaseCheck {
  async validate(context = {}) {
    const insights = [];
    try {
      await this.databaseManager.executeQuery(`
        SELECT 1 FROM analytics_data LIMIT 1
      `);
    } catch (error) {
      insights.push({
        kind: 'example-check-failure',
        severity_level: 5,
        location: 'database',
        resolution: null,
        title: 'Example Check Cannot Run',
        context: {
          reason: error.message,
          status: 'failed',
          impact: 'critical'
        }
      });
    }
    return insights;
  }

  async generateInsights(context = {}) {
    const insights = [];
    try {
      const results = await this.databaseManager.executeQuery(`
        SELECT * FROM analytics_data
        WHERE is_processed = true
      `);

      for (const result of results.rows) {
        insights.push({
          kind: 'example-insight',
          severity_level: 3,
          location: result.location,
          resolution: result.resolution,
          title: 'Example Insight',
          context: {
            data: result.data,
            impact: 'moderate',
            description: result.description
          }
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }
}

module.exports = ExampleCheck;
```

## Integration
To integrate a new check:

1. Create the check file in the appropriate directory
2. Implement the required methods
3. Add the check to the database manager's available checks
4. Test the check thoroughly
5. Update documentation as needed 