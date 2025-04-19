# Insight Generation Guidelines

## Overview
This document provides guidelines for generating database insights that will be displayed in the AutoDBA extension.

## Insight Structure
Each insight should follow the base structure defined in `schema.ts` and include all required fields:
- `kind`: The type of insight
- `severity_level`: A number from 1-5 indicating severity
- `location`: A unique identifier for the insight
- `resolution`: A valid SQL command to resolve the issue
- `title`: A clear, concise title
- `context`: Type-specific context data

## Severity Levels
1. **Informational (1)**: General information, no action required
2. **Low (2)**: Minor issues that can be addressed when convenient
3. **Moderate (3)**: Issues that should be addressed soon
4. **High (4)**: Important issues that need attention
5. **Critical (5)**: Issues that require immediate attention

## Best Practices

### Titles
- Be clear and descriptive
- Use present tense
- Keep it concise
- Example: "Unused Index Detected" instead of "Found an unused index"

### Descriptions
- Explain the issue clearly
- Include relevant metrics
- Provide context for the severity level
- Example: "Index X on table Y is unused and occupies Z bytes of storage"

### Resolutions
- Always use valid SQL syntax
- Include schema qualifications
- Use IF EXISTS clauses where appropriate
- Example: `DROP INDEX IF EXISTS "schema"."index_name";`

### Context Data
- Include all required fields for the insight type
- Use consistent formatting for sizes (bytes as strings)
- Provide complete index definitions
- Include impact assessment using the new severity levels:
  - "informational" for general information
  - "low" for minor issues
  - "moderate" for issues that should be addressed soon
  - "high" for important issues
  - "critical" for issues requiring immediate attention

## Example Format
```json
{
  "kind": "unused-index",
  "severity_level": 4,
  "location": "schema.table.index",
  "resolution": "DROP INDEX IF EXISTS \"schema\".\"index\";",
  "title": "Unused Index Detected",
  "context": {
    "schema": "schema_name",
    "table": "table_name",
    "index": "index_name",
    "index_definition": "CREATE INDEX ...",
    "index_size": "123456",
    "impact": "high",
    "description": "Detailed description of the issue"
  }
}
```

## Severity Utility Functions
Use the following utility functions for consistent severity handling:
- `getSeverityLevel(impact)`: Convert impact string to severity number
- `getSeverityClass(level)`: Get CSS class for styling
- `getSeverityText(level)`: Get display text for UI 