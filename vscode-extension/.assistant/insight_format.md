# Insight Format Documentation

## Overview
Insights are structured data objects that represent various database optimization opportunities and issues. They are used throughout the application to display information about database performance, unused resources, and optimization suggestions.

## Base Structure
```typescript
interface Insight {
  kind: string;           // Type of insight (e.g., "unused-index", "validation-error")
  severity_level: number; // 1 (informational) to 5 (critical)
  location: string;       // Unique identifier for the insight
  resolution: string;     // SQL command to resolve the issue (null if no resolution)
  title: string;         // Human-readable title
  context: {             // Context-specific data
    // Common fields
    status?: string;     // Status of the insight (e.g., "failed", "missing")
    impact: string;      // Impact level: "informational" | "low" | "moderate" | "high" | "critical"
    description: string; // Detailed description of the issue
    reason?: string;     // Reason for failure (for validation errors)
  };
}
```

## Severity Levels
The application uses a 5-level severity system:
1. Informational - General information, no action required
2. Low - Minor issues that can be addressed when convenient
3. Moderate - Issues that should be addressed soon
4. High - Important issues that need attention
5. Critical - Issues that require immediate attention (validation failures)

## Insight Types

### Validation Error
```typescript
interface ValidationErrorInsight extends Insight {
  kind: "validation-error" | "missing-extension" | "config-analysis-failure" | "index-audit-failure" | "slow-query-analysis-failure";
  severity_level: 5; // Always critical
  context: {
    status: "failed" | "missing";
    impact: "critical";
    description: string;
    reason?: string;
  };
}
```

### Unused Index
```typescript
interface UnusedIndexInsight extends Insight {
  kind: "unused-index";
  context: {
    schema: string;
    table: string;
    index: string;
    index_definition: string;
    index_size: string;
    impact: "low" | "moderate" | "high";
    description: string;
  };
}
```

### Redundant Index
```typescript
interface RedundantIndexInsight extends Insight {
  kind: "redundant-index";
  context: {
    schema: string;
    table: string;
    redundant_index: string;    // The index that can be safely removed
    covering_index: string;     // The index that makes the redundant one unnecessary
    impact: "low" | "moderate";
    description: string;
  };
}
```

### Configuration Optimization
```typescript
interface ConfigOptimizationInsight extends Insight {
  kind: "config-optimization";
  context: {
    parameter: string;          // The configuration parameter name
    current_value: number;      // Current value of the parameter
    suggested_value: number;    // Recommended value for the parameter
    impact: "moderate" | "high";
    rationale: string;         // Explanation of why this change is recommended
  };
}
```

### Slow Query
```typescript
interface SlowQueryInsight extends Insight {
  kind: "slow-query";
  context: {
    query: string;             // The slow query
    calls: number;             // Number of times the query was executed
    total_time: number;        // Total execution time
    mean_time: number;         // Average execution time
    rows: number;              // Number of rows processed
    shared_blks_hit: number;   // Shared buffer hits
    shared_blks_read: number;  // Shared buffer reads
    impact: "low" | "moderate" | "high";
    description: string;       // Analysis and recommendations
  };
}
```

### Permission Failure
```typescript
interface PermissionFailureInsight extends Insight {
  kind: "permission-failure";
  context: {
    table: string;           // The table requiring permission
    permission: string;      // The required permission (e.g., "SELECT")
    impact: "critical";      // Always critical as it prevents functionality
    description: string;     // Explanation of why this permission is needed
  };
}
```

### Missing Extension
```typescript
interface MissingExtensionInsight extends Insight {
  kind: "missing-extension";
  context: {
    extension: string;      // The name of the missing extension
    impact: "critical";     // Always critical as it prevents functionality
    description: string;    // Explanation of why this extension is needed
  };
}
```

### Check Validation Failure
```typescript
interface CheckValidationFailureInsight extends Insight {
  kind: "check-validation-failed";
  context: {
    error: string;          // The error message
    status: "failed";       // The status of the validation
    impact: "critical";     // Always critical as it prevents check execution
    description: string;    // Detailed error description
  };
}
```

### Prerequisites Failure
```typescript
interface PrerequisitesFailureInsight extends Insight {
  kind: "prerequisites-failure";
  context: {
    reason: string;         // The reason for the failure
    status: "failed";       // The status of the prerequisites check
    impact: "critical";     // Always critical as it prevents functionality
    description: string;    // Detailed failure description
  };
}

## Check Implementation
Each check must implement two methods:

1. `validate(context: Object): Promise<Array<Insight>>`
   - Performs preflight validation
   - Returns validation insights with severity level 5 for critical issues
   - Should be lightweight and fast

2. `generateInsights(context: Object): Promise<Array<Insight>>`
   - Generates insights based on the check
   - Only runs if validation passes
   - Can perform more intensive analysis

## Precheck Conditions
The following conditions are checked during the prerequisites phase:

1. Database Connectivity
   - Basic connection to the database
   - Ability to execute queries

2. Required Permissions
   - SELECT on pg_stat_activity (query analysis)
   - SELECT on pg_settings (configuration analysis)
   - SELECT on pg_indexes (index analysis)
   - SELECT on pg_stat_statements (query performance)
   - SELECT on pg_stat_user_indexes (index usage)
   - SELECT on pg_stat_user_tables (table statistics)

3. Required Extensions
   - pg_stat_statements (query performance analysis)

4. Check-Specific Prerequisites
   - Each check's validate() method is called
   - Validation insights are collected
   - Critical issues (severity 5) prevent check execution

## Resolution Commands
When available, insights include SQL commands to resolve the issue:

1. Permission Issues:
   ```sql
   GRANT SELECT ON <table_name> TO current_user;
   ```

2. Missing Extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS <extension_name>;
   ```

## Best Practices
1. Always include a clear title and description
2. Provide a valid SQL resolution command when possible
3. Set appropriate severity levels based on the 5-level system
4. Include all relevant context information
5. Use consistent naming conventions
6. Use the severity utility functions for consistent handling:
   - `getSeverityLevel(impact)` - Convert impact string to severity number
   - `getSeverityClass(level)` - Get CSS class for styling
   - `getSeverityText(level)` - Get display text for UI
