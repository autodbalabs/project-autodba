<script>
  import { onMount } from 'svelte';
  import { vscode } from '~/lib/vscode';
import Insights from './sections/Insights.svelte';
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

  function handleConnectionSaved(name) {
    addingConnection = false;
    selectedConnection = name || selectedConnection;
    refreshConnections();
  }

  function handleDeleteConnection() {
    if (!selectedConnection) return;
    vscode.postMessage({
      command: 'connections:delete',
      name: selectedConnection
    });
  }

  onMount(() => {
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
        handleConnectionSaved(message.name);
      }
    });
  });
</script>

<main>
  <div class="container">
    <header class="page-header">
      <h1>AutoDBA: PostgreSQL Insights (Alpha)</h1>
      <a
        class="discord-link"
        href="https://discord.gg/wbB8Pdb3nm"
        target="_blank"
        rel="noopener"
        >Need help? Join our Discord</a
      >
    </header>

    <div class="connection-controls">
      {#if addingConnection}
        <ConnectionUrlForm
          onSaved={handleConnectionSaved}
          onCancel={() => (addingConnection = false)}
        />
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
        {:else}
          <button class="delete-btn" on:click={handleDeleteConnection}>Delete Connection</button>
        {/if}
      {/if}
    </div>

    {#if selectedConnection}
      <Insights connection={selectedConnection} />
    {:else}
      <div class="empty-state no-connection">
        <ol class="empty-steps">
          <li>Create a connection</li>
          <li>Select a connection</li>
          <li>
            <a
              href="https://discord.gg/wbB8Pdb3nm"
              target="_blank"
              rel="noopener"
              >Join our Discord community</a
            >
          </li>
        </ol>
        <p class="highlight-note security-note">
          AutoDBA runs entirely on your machine. Database credentials are stored locally using VS Code's Secret Storage, and the extension sends no credentials or usage data anywhere.
        </p>
      </div>
    {/if}
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  a.discord-link {
    color: var(--primary-blue);
    text-decoration: none;
    font-size: 0.9em;
  }

  a.discord-link:hover {
    text-decoration: underline;
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

  .add-btn {
    width: fit-content;
  }

  .delete-btn {
    width: fit-content;
  }

  .no-connection {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: var(--dark-bg-alt);
    border: 1px solid var(--dark-border);
    border-radius: 8px;
  }

  .empty-steps {
    list-style: decimal inside;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0;
  }
</style>
