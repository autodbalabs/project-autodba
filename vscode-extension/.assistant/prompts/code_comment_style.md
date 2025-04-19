# Code Comment Style Guidelines

## Overview
This document outlines the standard style for code comments in the AutoDBA extension codebase.

## General Rules

### JSDoc Comments
Use JSDoc comments for:
- Function declarations
- Class declarations
- Interface declarations
- Type declarations
- Module exports

Example:
```typescript
/**
 * Formats a byte size into a human-readable string
 * @param bytes - The number of bytes to format
 * @returns A formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes: number): string {
  // Implementation
}
```

### Inline Comments
Use inline comments for:
- Complex logic explanations
- Non-obvious code behavior
- Important implementation details

Example:
```typescript
// Convert string size to number and format with appropriate unit
const formattedSize = formatBytes(parseInt(indexSize));
```

## Component Comments

### Svelte Components
For Svelte components, include:
- Component purpose
- Props documentation
- Event documentation
- Slot documentation

Example:
```svelte
<!--
  UnusedIndexCard.svelte
  Displays information about unused database indexes
  
  Props:
  - insight: UnusedIndexInsight - The insight data to display
  
  Events:
  - None
-->
```

## Type Definitions
For TypeScript types and interfaces:
- Document the purpose
- Document each property
- Include examples where helpful

Example:
```typescript
/**
 * Represents a database optimization insight
 * @example
 * {
 *   kind: "unused-index",
 *   severity_level: 3,
 *   location: "schema.table.index"
 * }
 */
interface Insight {
  /** The type of insight */
  kind: string;
  /** Severity level from 1 (low) to 3 (high) */
  severity_level: number;
  /** Unique identifier for the insight */
  location: string;
}
```

## Best Practices

1. **Be Clear and Concise**
   - Write comments that add value
   - Avoid stating the obvious
   - Use complete sentences

2. **Keep Comments Up-to-Date**
   - Update comments when code changes
   - Remove outdated comments
   - Ensure accuracy

3. **Use Consistent Style**
   - Follow the established patterns
   - Use proper punctuation
   - Maintain consistent formatting

4. **Document Complex Logic**
   - Explain non-obvious algorithms
   - Document edge cases
   - Include examples where helpful

5. **Avoid Commented-Out Code**
   - Remove unused code
   - Use version control for history
   - Keep the codebase clean 