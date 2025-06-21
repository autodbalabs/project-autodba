<script>
  import { getSeverityClass, getSeverityText } from '../../../lib/utils/severity';
  export let insight;
  let expanded = false;
  const toggle = () => expanded = !expanded;

  function formatTime(ms) {
    if (ms < 1000) {
      return `${ms.toFixed(2)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  function formatNumber(num) {
    return num.toLocaleString();
  }
</script>

<div class="insight-slow-query">
  <div class="insight-header" on:click={toggle}>
    <span class="icon">⏱️</span>
    <span>{insight.title}</span>
    <span class="severity-badge {getSeverityClass(insight.severity_level)}">
      {getSeverityText(insight.severity_level)}
    </span>
    <span class="toggle">{expanded ? '▼' : '▶'}</span>
  </div>
  {#if expanded}
  <div class="insight-details">
    <div class="detail-group">
      <div class="detail-label">Query</div>
      <div class="detail-value">
        <code class="query">{insight.context.query}</code>
      </div>
    </div>
    <div class="metrics-grid">
      <div class="metric">
        <div class="metric-label">Average Time</div>
        <div class="metric-value">{formatTime(insight.context.mean_time)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Total Time</div>
        <div class="metric-value">{formatTime(insight.context.total_time)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Calls</div>
        <div class="metric-value">{formatNumber(insight.context.calls)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Rows</div>
        <div class="metric-value">{formatNumber(insight.context.rows)}</div>
      </div>
    </div>
    <div class="detail-group">
      <div class="detail-label">Description</div>
      <div class="detail-value">{insight.context.description}</div>
    </div>
    {#if insight.resolution}
      <div class="recommendation">
        <div class="recommendation-header">Resolution</div>
        <div class="command">
          <code>{insight.resolution}</code>
        </div>
      </div>
    {/if}
  </div>
  {/if}
</div>

<style>
  .insight-slow-query {
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

  .query {
    background-color: var(--dark-bg-alt);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin: 12px 0;
  }

  .metric {
    background-color: var(--dark-bg-alt);
    padding: 8px;
    border-radius: 4px;
    text-align: center;
  }

  .metric-label {
    font-size: 0.8em;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 1.1em;
    color: var(--text-light);
    font-weight: 500;
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