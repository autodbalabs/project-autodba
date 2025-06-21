<script>
  import { onMount } from 'svelte';
  import { vscode } from '~/lib/vscode';
  import InsightGroup from '../components/insights/InsightGroup.svelte';
  import LoadingState from '../components/insights/LoadingState.svelte';
  import RefreshButton from '../components/common/RefreshButton.svelte';
  
  export let connection;

  let insights = [];
  const GROUPS = [
    { kind: 'unused-index', title: 'Unused Indexes' },
    { kind: 'redundant-index', title: 'Redundant Indexes' },
    { kind: 'config-optimization', title: 'Configuration Optimizations' },
    { kind: 'slow-query', title: 'Slow Queries' },
    { kind: 'permission-failure', title: 'Permission Issues' },
    { kind: 'missing-extension', title: 'Missing Extensions' },
    { kind: 'check-validation-failed', title: 'Validation Failures' },
    { kind: 'check-failed', title: 'Check Errors' },
    { kind: 'connection-failed', title: 'Connection Issues' },
    { kind: 'prerequisites-failure', title: 'Prerequisite Checks' },
    { kind: 'config-analysis-failure', title: 'Config Analysis Failures' }
  ];
  let groupedInsights = [];

  $: groupedInsights = GROUPS.map(g => ({
    title: g.title,
    kind: g.kind,
    insights: insights.filter(i => i.kind === g.kind)
  }));
  let isLoading = true;
  let error = null;
  let lastRefreshTime = null;

  function refreshInsights() {
    if (!connection) return;
    
    isLoading = true;
    vscode.postMessage({
      command: 'insights:list',
      connection
    });
    lastRefreshTime = new Date();
  }

  onMount(() => {
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'insights') {
        console.log('Insights received insights', message.insights);
        insights = message.insights || [];
        isLoading = false;
        error = null;
      }
    });

    refreshInsights();
  });

  $: console.log("connection url", connection)
</script>

<div class="insights-container">
  <div class="insights-header">
    <h2>Insights</h2>
    <div class="refresh-controls">
      {#if lastRefreshTime}
        <span class="last-refresh">
          Last refreshed: {lastRefreshTime.toLocaleTimeString()}
        </span>
      {/if}
      <RefreshButton 
        onRefresh={refreshInsights}
        disabled={!connection}
        {isLoading}
      />
    </div>
  </div>

  <div class="insights-list">
    {#if !connection}
      <div class="state-message">
        <p>Please select a connection to view insights</p>
      </div>
    {:else if isLoading}
      <LoadingState />
    {:else if error}
      <div class="state-message error">
        <p>{error}</p>
      </div>
    {:else if insights.length === 0}
      <div class="state-message">
        <p>No insights available</p>
      </div>
    {:else}
      <ul>
        {#each groupedInsights as group}
          <li class="insight-item">
            <InsightGroup title={group.title} insights={group.insights} />
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .insights-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .refresh-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .last-refresh {
    color: var(--text-light);
    font-size: 0.9em;
  }

  .insights-list {
    background-color: var(--dark-bg-alt);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--dark-border);
  }

  .state-message {
    text-align: center;
    padding: 20px;
    color: var(--text-light);
  }

  .state-message.error {
    color: var(--error-red);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .insight-item {
    padding: 15px;
    border-bottom: 1px solid var(--dark-border);
  }

  .insight-item:last-child {
    border-bottom: none;
  }
</style>
