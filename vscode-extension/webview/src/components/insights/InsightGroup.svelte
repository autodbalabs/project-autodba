<script>
  import InsightCard from './InsightCard.svelte';
  export let title;
  export let insights = [];
  let expanded = false;
  const toggle = () => expanded = !expanded;
</script>

<div class="insight-group">
  <div class="group-header" on:click={toggle}>
    <h3>{title}</h3>
    {#if insights.length === 0}
      <span class="status-ok">✓</span>
    {:else}
      <span class="issue-count">{insights.length} issues</span>
      <span class="toggle">{expanded ? '▼' : '▶'}</span>
    {/if}
  </div>
  {#if expanded && insights.length > 0}
    <div class="group-insights">
      {#each insights as insight}
        <InsightCard {insight} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .group-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid var(--dark-border);
    padding: 8px 0;
  }
  .group-header h3 {
    margin: 0;
    flex: 1;
  }
  .status-ok {
    color: var(--success-green);
  }
  .issue-count {
    margin-right: 8px;
  }
  .toggle {
    margin-left: auto;
  }
  .group-insights {
    padding: 12px 0;
  }
</style>
