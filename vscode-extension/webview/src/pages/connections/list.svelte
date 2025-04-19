<script>
  import { onMount } from 'svelte';
  import { vscode } from '~/lib/vscode';
  import ConnectionCard from '~/components/connections/ConnectionCard.svelte';

  export let onShowInsights;
  export let onEditConnection;

  let connections = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      vscode.postMessage({
        command: 'connections:list'
      });
    } catch (err) {
      console.error('Error fetching connections:', err);
      error = err.message;
      loading = false;
    }
  });

  function handleDelete(connectionName) {
    vscode.postMessage({ 
      command: 'connections:delete', 
      name: connectionName 
    });
  }

  function handleEdit(connectionName) {
    onEditConnection(connectionName);
  }

  function handleShowInsights(connection) {
    onShowInsights(connection);
  }

  // Listen for messages from the extension
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'connections':
        connections = message.connections;
        loading = false;
        break;
    }
  });
</script>

<div class="connections-page">
  <div class="card spacing-y-4">
    {#if loading}
      <div class="loading">Loading connections...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if connections.length === 0}
      <div class="empty-state">
        <p>No connections configured</p>
      </div>
    {:else}
      <div class="list">
        {#each connections as connection}
          <ConnectionCard 
            {connection}
            onShowInsights={handleShowInsights}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .connections-page {
    width: 100%;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    text-align: center;
    padding: 24px;
  }

  .loading {
    text-align: center;
    font-style: italic;
  }

  .error-message {
    color: var(--vscode-errorForeground);
    text-align: center;
  }
</style> 