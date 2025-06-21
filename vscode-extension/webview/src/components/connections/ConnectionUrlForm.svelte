<script>
  import { vscode } from '~/lib/vscode';
  export let onSaved = () => {};

  let name = '';
  let url = '';
  let error = '';

  function parseUrl(dbUrl) {
    const u = new URL(dbUrl);
    return {
      kind: 'postgresql',
      host: u.hostname,
      port: parseInt(u.port) || 5432,
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      dbname: u.pathname.replace(/^\//, '')
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    try {
      const connection = parseUrl(url);
      vscode.postMessage({
        command: 'connections:save',
        name: name || connection.dbname || connection.host,
        connection
      });
      name = '';
      url = '';
      error = '';
    } catch (e) {
      error = 'Invalid database URL';
    }
  }

  const messageHandler = (event) => {
    const message = event.data;
    if (message.type === 'success') {
      onSaved();
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
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <button type="submit">Add Connection</button>
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

  .error {
    color: var(--error-red);
    font-size: 0.9em;
  }

  button {
    align-self: flex-start;
  }
</style>
