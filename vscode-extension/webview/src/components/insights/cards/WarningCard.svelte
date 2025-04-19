<script>
  import { getSeverityClass, getSeverityText, getSeverityLevel } from '../../../lib/utils/severity';
  export let insight;

  // Helper function to format values based on their type
  function formatValue(value) {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  }

  // Helper function to determine if a value should be displayed
  function shouldDisplayValue(value) {
    return value !== undefined && value !== null && value !== '';
  }
</script>

<div class="insight-warning">
  <div class="insight-header">
    <span class="icon">{insight.kind === 'warning' ? '⚠️' : 'ℹ️'}</span>
    <span>{insight.title}</span>
    <span class="severity-badge {getSeverityClass(insight.severity_level || getSeverityLevel(insight.context.impact))}">
      {getSeverityText(insight.severity_level || getSeverityLevel(insight.context.impact))}
    </span>
  </div>
  <div class="insight-details">
    {#if insight.context.description || insight.context.reason}
      <div class="detail-group">
        <div class="detail-label">Description</div>
        <div class="detail-value">{insight.context.description || insight.context.reason}</div>
      </div>
    {/if}

    {#each Object.entries(insight.context) as [key, value]}
      {#if shouldDisplayValue(value) && key !== 'description' && key !== 'reason'}
        <div class="detail-group">
          <div class="detail-label">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
          <div class="detail-value">
            {#if typeof value === 'object' && !Array.isArray(value)}
              <pre>{JSON.stringify(value, null, 2)}</pre>
            {:else}
              {formatValue(value)}
            {/if}
          </div>
        </div>
      {/if}
    {/each}

    {#if insight.resolution}
      <div class="recommendation">
        <div class="recommendation-header">Resolution</div>
        <div class="command">
          <code>{insight.resolution}</code>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .insight-warning {
    background-color: var(--dark-bg);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid var(--dark-border);
  }

  .insight-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
  }

  .icon {
    font-size: 1.2em;
  }

  .severity-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    text-transform: uppercase;
  }

  .severity-badge.informational {
    background-color: var(--info-blue);
    color: var(--text-dark);
  }

  .severity-badge.low {
    background-color: var(--success-green);
    color: var(--text-dark);
  }

  .severity-badge.moderate {
    background-color: var(--warning-yellow);
    color: var(--text-dark);
  }

  .severity-badge.high {
    background-color: var(--warning-yellow-dark);
    color: var(--text-dark);
  }

  .severity-badge.critical {
    background-color: var(--error-red);
    color: var(--text-light);
  }

  .insight-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .detail-label {
    font-size: 0.9em;
    color: var(--text-muted);
  }

  .detail-value {
    color: var(--text-light);
  }

  .detail-value pre {
    background-color: var(--dark-bg-alt);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
  }

  .recommendation {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--dark-border);
  }

  .recommendation-header {
    font-size: 0.9em;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .command {
    background-color: var(--dark-bg-alt);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
  }

  code {
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
  }
</style> 