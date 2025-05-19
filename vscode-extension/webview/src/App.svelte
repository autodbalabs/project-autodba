<script>
  import posthog from 'posthog-js'
  import { onMount } from 'svelte';
  import router from '~/lib/router';
  import ConnectionsRouter from './pages/connections/index.svelte';
  import Insights from './pages/Insights.svelte';

  let selectedConnection = null;

  onMount(() => {
    if (typeof window !== 'undefined') {
      posthog.init(
        'phc_vLseNAgoHJmcJ91o4rILkZ5zN7FlP8bup42r2keIPQh',
        {
          api_host: 'https://us.i.posthog.com',
          person_profiles: 'always',
        }
      )
    }

    router.navigate('connections/list');
    router.onRouteChanged(({ path, fullPath }) => {
      console.log('Navigating to', path, fullPath);
      posthog.capture('page_view', { page: path });
    });
  });

  function showInsights(connection) {
    selectedConnection = connection;
    router.navigate('insights');
  }

  const isConnectionsRoute = router.isCurrentRoutePrefix('connections');
  const isInsightsRoute = router.isCurrentRoute('insights');
</script>

<main>
  <div class="container">
    <h1>AutoDBA: PostgreSQL Insights (Alpha)</h1>
    <div class="state-controls">
      <button 
        class="state-toggle" 
        class:active={$isConnectionsRoute}
        on:click={() => router.navigate('connections/list')}
      >
        Connections
      </button>
      <button 
        class="state-toggle"
        on:click={() => router.navigate('connections/create')}
      >
        Add Connection
      </button>
    </div>
    
    {#if $isConnectionsRoute}
      <ConnectionsRouter onShowInsights={showInsights} {selectedConnection} />
    {:else if $isInsightsRoute}
      <Insights connection={selectedConnection} />
    {/if}
  </div>
</main>

<style>
  main {
    font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
    padding: 20px;
    background-color: var(--dark-bg);
    min-height: 100vh;
    color: var(--text-light);
  }
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    color: var(--text-light);
    margin-bottom: 20px;
    font-size: 2em;
    font-weight: 500;
  }
  
  .state-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .state-toggle {
    padding: 8px 16px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .state-toggle:hover {
    background: var(--vscode-button-hoverBackground);
  }
  
  .state-toggle.active {
    background: var(--vscode-button-hoverBackground);
  }
  
  button {
    margin: 10px 0;
    padding: 10px 20px;
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 