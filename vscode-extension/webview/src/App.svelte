<script>
  import { onMount } from 'svelte';
  import posthog from 'posthog-js';
  import { vscode } from '~/lib/vscode';
import Insights from './pages/Insights.svelte';
import ConnectionUrlForm from './components/connections/ConnectionUrlForm.svelte';

  let connections = [];
  let selectedConnection = '';
  let addingConnection = false;

  function refreshConnections() {
    vscode.postMessage({ command: 'connections:list' });
  }

  function handleAddConnection() {
    addingConnection = true;
  }

  function handleConnectionSaved() {
    addingConnection = false;
    refreshConnections();
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      posthog.init('phc_vLseNAgoHJmcJ91o4rILkZ5zN7FlP8bup42r2keIPQh', {
        api_host: 'https://us.i.posthog.com',
        person_profiles: 'always'
      });
    }

    refreshConnections();

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'connections') {
        connections = message.connections;
        const exists = connections.some((c) => c.name === selectedConnection);
        if (!exists) {
          selectedConnection = '';
        }
      } else if (message.type === 'success') {
        handleConnectionSaved();
      }
    });
  });
</script>

<main>
  <div class="container">
    <h1>AutoDBA: PostgreSQL Insights (Alpha)</h1>

    <div class="connection-controls">
      {#if addingConnection}
        <ConnectionUrlForm onSaved={handleConnectionSaved} />
        <button class="cancel-btn" on:click={() => (addingConnection = false)}>
          Cancel
        </button>
      {:else}
        <div class="connection-select">
          <label for="connection-select">Select Connection</label>
          <select id="connection-select" bind:value={selectedConnection}>
            <option value="">Select...</option>
            {#each connections as conn}
              <option value={conn.name}>{conn.name}</option>
            {/each}
          </select>
        </div>
        {#if !selectedConnection}
          <button class="add-btn" on:click={handleAddConnection}>Add Connection</button>
        {/if}
      {/if}
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

  .connection-controls {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }

  .connection-select {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  select {
    padding: 8px;
    border-radius: 4px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--dark-border);
  }

  .add-btn,
  .cancel-btn {
    width: fit-content;
  }
</style>
