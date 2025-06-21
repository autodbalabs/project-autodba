<script>
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import { vscode } from '~/lib/vscode';
  import Insights from './pages/Insights.svelte';
  import ConnectionUrlForm from './components/connections/ConnectionUrlForm.svelte';

  let connections = [];
  let selectedConnection = '';

  onMount(() => {
    if (typeof window !== 'undefined') {
      posthog.init('phc_vLseNAgoHJmcJ91o4rILkZ5zN7FlP8bup42r2keIPQh', {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'always'
      });
    }

    vscode.postMessage({ command: 'connections:list' });

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'connections') {
        connections = message.connections;
        if (!selectedConnection && connections.length > 0) {
          selectedConnection = connections[0].name;
        }
      } else if (message.type === 'success') {
        vscode.postMessage({ command: 'connections:list' });
      }
    });
  });
</script>

<main>
  <div class="container">
    <h1>AutoDBA: PostgreSQL Insights (Alpha)</h1>

    <div class="connection-select">
      <label for="connection-select">Select Connection</label>
      <select id="connection-select" bind:value={selectedConnection}>
        <option value="" disabled selected>Select...</option>
        {#each connections as conn}
          <option value={conn.name}>{conn.name}</option>
        {/each}
      </select>
    </div>

    <div class="new-connection">
      <h2>Add Connection</h2>
      <ConnectionUrlForm onSaved={() => vscode.postMessage({ command: 'connections:list' })} />
    </div>

    <Insights connection={selectedConnection} />
  </div>
</main>

<style>
  main {
    padding: 20px;
    background-color: var(--dark-bg);
    min-height: 100vh;
    color: var(--text-light);
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  h1 {
    margin: 0;
  }

  .connection-select {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  select {
    padding: 8px;
    border-radius: 4px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--dark-border);
  }

  .new-connection h2 {
    margin: 0 0 8px 0;
    font-size: 1.2em;
  }
</style>
