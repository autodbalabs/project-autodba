<script>
  import { getSeverityClass, getSeverityText } from '../../../lib/utils/severity';
  export let insight;
  let expanded = false;
  const toggle = () => expanded = !expanded;

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes < 0) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
</script>

<div class="insight-unused-index">
  <div class="insight-header" on:click={toggle}>
    <span class="icon">📊</span>
    <span>{insight.title}</span>
    <span class="severity-badge {getSeverityClass(insight.severity_level)}">
      {getSeverityText(insight.severity_level)}
    </span>
    <span class="toggle">{expanded ? '▼' : '▶'}</span>
  </div>
  {#if expanded}
  <div class="insight-details">
    <div class="detail-group">
      <div class="detail-label">Table</div>
      <div class="detail-value">{insight.context.schema}.{insight.context.table}</div>
    </div>
    <div class="detail-group">
      <div class="detail-label">Index</div>
      <div class="detail-value">{insight.context.index}</div>
    </div>
    <div class="detail-group">
      <div class="detail-label">Definition</div>
      <div class="detail-value">
        <code>{insight.context.index_definition}</code>
      </div>
    </div>
    <div class="detail-group">
      <div class="detail-label">Storage Impact</div>
      <div class="detail-value">{formatBytes(parseInt(insight.context.index_size))}</div>
    </div>
    <div class="detail-group">
      <div class="detail-label">Description</div>
      <div class="detail-value">{insight.context.description}</div>
    </div>
    <div class="recommendation">
      <div class="recommendation-header">Resolution</div>
      <div class="command">
        <code>{insight.resolution}</code>
      </div>
    </div>
  </div>
  {/if}
</div>

<style>
  .insight-unused-index {
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
    cursor: pointer;
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

  .toggle {
    margin-left: auto;
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