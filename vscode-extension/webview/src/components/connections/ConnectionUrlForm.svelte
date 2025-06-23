<script>
  import { vscode } from '~/lib/vscode';
  export let onSaved = () => {};
  export let onCancel = () => {};

  let name = '';
  let url = '';
  // Default hardware values
  let cpus = '1';
  let memory_gb = '1';
  let storage_type = 'ssd';
  let error = '';

  function parseUrl(dbUrl) {
    const u = new URL(dbUrl);
    const options = {};
    u.searchParams.forEach((value, key) => {
      options[key] = value;
    });
    return {
      kind: 'postgresql',
      host: u.hostname,
      port: parseInt(u.port) || 5432,
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      dbname: u.pathname.replace(/^\//, ''),
      options
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    try {
      const parsed = parseUrl(url);
      vscode.postMessage({
        command: 'connections:save',
        name: name || parsed.dbname || parsed.host,
        connection: {
          kind: 'postgresql',
          url,
          cpus: parseFloat(cpus),
          memory_gb: parseFloat(memory_gb),
          storage_type: storage_type || undefined
        }
      });
      name = '';
      url = '';
      cpus = '1';
      memory_gb = '1';
      storage_type = 'ssd';
      error = '';
    } catch (e) {
      error = 'Invalid database URL';
    }
  }

  const messageHandler = (event) => {
    const message = event.data;
    if (message.type === 'success') {
      onSaved(message.name);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('message', messageHandler);
  }
</script>

<form class="connection-url-form" on:submit={handleSubmit}>
  <div class="form-group">
    <label>Connection Name</label>
    <input type="text" bind:value={name} placeholder="Optional" />
  </div>
  <div class="form-group">
    <label>Database URL</label>
    <input type="text" bind:value={url} placeholder="postgres://user:pass@host:port/db" required />
  </div>
  <div class="form-group">
    <label>Available CPUs</label>
    <input type="number" bind:value={cpus} min="0" step="0.1" required placeholder="e.g., 4" />
  </div>
  <div class="form-group">
    <label>Available Memory (GB)</label>
    <input type="number" bind:value={memory_gb} min="0" step="0.1" required placeholder="e.g., 16" />
  </div>
  <div class="form-group">
    <label>Storage Type</label>
    <select bind:value={storage_type} required>
      <option value="ssd">SSD</option>
      <option value="hdd">HDD</option>
      <option value="san">SAN</option>
      <option value="other">Other</option>
    </select>
  </div>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <div class="button-row">
    <button type="submit">Add Connection</button>
    <button type="button" class="cancel-btn" on:click={onCancel}>Cancel</button>
  </div>
</form>

<style>
  .connection-url-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--dark-bg-alt);
    padding: 16px;
    border-radius: 6px;
    border: 1px solid var(--dark-border);
    flex: 1;
    width: 100%;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  label {
    font-size: 0.9em;
    color: var(--text-light);
  }

  input {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--dark-border);
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    width: 100%;
  }

  select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--dark-border);
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    width: 100%;
  }

  .error {
    color: var(--error-red);
    font-size: 0.9em;
  }

  button {
    align-self: flex-start;
  }

  .button-row {
    display: flex;
    gap: 8px;
  }
</style>
