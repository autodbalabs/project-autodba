<script>
  import { onMount } from 'svelte';
  import { vscode } from '~/lib/vscode';
  import InsightCard from '../components/insights/InsightCard.svelte';
  import LoadingState from '../components/insights/LoadingState.svelte';
  
  export let connection;

  let insights = [];
  let isLoading = true;
  let error = null;

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

    vscode.postMessage({
      command: 'insights:list',
      connection
    });
  });
</script>

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
      {#each insights as insight}
        <li class="insight-item">
          <InsightCard {insight} />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
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
