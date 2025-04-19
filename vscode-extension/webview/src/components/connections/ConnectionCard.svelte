<script>
  export let connection;
  export let onShowInsights;
  export let onDelete;
  export let onEdit;
</script>

<div class="connection-card">
  <div class="card-header">
    <div class="connection-name">
      {connection.name}
    </div>
    <div class="connection-actions">
      <button 
        class="action-button edit"
        on:click={() => onShowInsights(connection.name)}
      >
        Insights
      </button>
      <button 
        class="action-button edit"
        on:click={() => onEdit(connection.name)}
      >
        Edit
      </button>
      <button 
        class="action-button delete"
        on:click={() => onDelete(connection.name)}
      >
        Delete
      </button>
    </div>
  </div>
</div>

<style>
  .connection-card {
    background: var(--dark-bg-alt);
    border: 1px solid var(--dark-border);
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .connection-name {
    font-weight: 500;
    color: var(--text-light);
  }

  .connection-actions {
    display: flex;
    gap: 8px;
  }

  @keyframes rotate {
    0% {
      transform: perspective(200px) rotateY(0deg);
    }
    50% {
      transform: perspective(200px) rotateY(180deg);
    }
    100% {
      transform: perspective(200px) rotateY(360deg);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.2);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
  }

  .action-button {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background: var(--vscode-button-hoverBackground);
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .action-button.edit {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }

  .action-button.edit:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }

  .action-button.delete {
    background: var(--error-red);
    color: var(--text-light);
  }

  .action-button.delete:hover {
    opacity: 0.9;
  }
</style>
