<script>
  import { onMount, onDestroy } from 'svelte';
  
  export let onRefresh;
  export let disabled = false;
  export let isLoading = false;
  export let intervalSeconds = 300; // 5 minutes default
  
  let timeUntilRefresh = intervalSeconds;
  let countdownInterval;

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function handleRefresh() {
    if (disabled || isLoading) return;
    onRefresh();
    timeUntilRefresh = intervalSeconds;
  }

  onMount(() => {
    countdownInterval = setInterval(() => {
      if (timeUntilRefresh > 0) {
        timeUntilRefresh--;
      }
    }, 1000);
  });

  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });
</script>

<button 
  class="refresh-button" 
  on:click={handleRefresh}
  disabled={disabled || isLoading}
>
  {#if isLoading}
    Refreshing...
  {:else}
    Refresh (in {formatTime(timeUntilRefresh)})
  {/if}
</button>

<style>
  .refresh-button {
    background-color: var(--dark-bg-alt);
    color: var(--text-light);
    border: 1px solid var(--dark-border);
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 140px;
  }

  .refresh-button:hover:not(:disabled) {
    background-color: var(--dark-bg);
  }

  .refresh-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 