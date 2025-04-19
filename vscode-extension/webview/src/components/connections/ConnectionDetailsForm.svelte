<script>
  import { onMount } from 'svelte';
  import { vscode } from '~/lib/vscode';

  export let connectionName = '';
  export let close = () => {}; // callback for closing the form
  export let onFinish = () => {}; // callback for when the form is finished (saved successfully)

  let connectionInfo = {
    kind: 'postgresql',
    host: '',
    port: undefined,
    username: '',
    password: '',
    dbname: '',
    name: ''
  };

  let originalName = ''; // store original name for rename operations
  
  onMount(() => {
    if (connectionName) {
      // Request connection details from the extension
      vscode.postMessage({
        command: 'connections:get',
        connectionName
      });
      originalName = connectionName;
      connectionInfo = { ...connectionInfo, name: connectionName };
    }

    // Listen for messages from the extension
    const messageHandler = (event) => {
      const message = event.data;
      if (message.type === 'connection_details' && message.connection) {
        connectionInfo = message.connection;
      } else if (message.type === 'success') {
        if (originalName && originalName !== connectionInfo.name) {
          vscode.postMessage({
            command: 'connections:delete',
            name: originalName
          });
        }
        onFinish();
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  });

  function handleInput(event) {
    let { name, value } = event.target;
    if (name === 'port') {
      value = parseInt(value, 10) || undefined;
    }
    connectionInfo = { ...connectionInfo, [name]: value };
  }

  function handleSubmit(event) {
    event.preventDefault();
    
    const { name, ...connection } = connectionInfo;

    vscode.postMessage({
      command: 'connections:save',
      name,
      connection
    });
  }
</script>

<form class="connection-details-form" on:submit={handleSubmit}>
  <div class="connection-note">
    <p>Currently only TCP-based PostgreSQL connections are supported. Support for more databases and local socket connections will be added in a future update.</p>
    <p>For more information, refer to the <a href="https://github.com/generalpiston/autodba/blob/main/README.md" target="_blank">README</a>.</p>
  </div>

  <div class="form-group">
    <label for="name">Connection Name</label>
    <input
      type="text"
      id="name"
      name="name"
      value={connectionInfo.name}
      on:input={handleInput}
      placeholder="e.g. My Database"
      required
    />
  </div>

  <div class="form-group">
    <label for="host">Host</label>
    <input
      type="text"
      id="host"
      name="host"
      value={connectionInfo.host}
      on:input={handleInput}
      placeholder="e.g. localhost"
      required
    />
  </div>

  <div class="form-group">
    <label for="port">Port</label>
    <input
      type="text"
      id="port"
      name="port"
      value={connectionInfo.port}
      on:input={handleInput}
      placeholder="e.g. 5432"
      required
    />
  </div>

  <div class="form-group">
    <label for="username">Username</label>
    <input
      type="text"
      id="username"
      name="username"
      value={connectionInfo.username}
      on:input={handleInput}
      placeholder="Database username"
      required
    />
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      name="password"
      value={connectionInfo.password}
      on:input={handleInput}
      placeholder="Database password"
      required
    />
  </div>

  <div class="form-group">
    <label for="dbname">Database Name</label>
    <input
      type="text"
      id="dbname"
      name="dbname"
      value={connectionInfo.dbname}
      on:input={handleInput}
      placeholder="e.g. my_database"
      required
    />
  </div>

  <div class="button-group">
    <button type="submit" class="primary">Save Connection</button>
    <button type="button" class="secondary" on:click={close}>Cancel</button>
  </div>
</form>

<style>
  .connection-details-form {
    background-color: var(--vscode-editor-background);
    padding: 25px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px var(--vscode-widget-shadow);
  }

  .connection-note {
    margin-bottom: 20px;
    padding: 12px;
    background-color: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 6px;
    border-left: 4px solid var(--vscode-notificationsInfoIcon-foreground);
  }

  .connection-note p {
    margin: 0;
    margin-bottom: 1rem;
    color: var(--vscode-foreground);
    font-size: 13px;
    line-height: 1.4;
  }

  .connection-note p:last-child {
    margin-bottom: 0;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: var(--vscode-foreground);
    font-weight: 500;
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid var(--vscode-input-border);
    border-radius: 6px;
    font-size: 14px;
    color: var(--vscode-input-foreground);
    background-color: var(--vscode-input-background);
  }

  input::placeholder {
    color: var(--vscode-input-placeholderForeground);
  }

  input:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }

  .button-group {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  button.primary {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }

  button.primary:hover {
    background-color: var(--vscode-button-hoverBackground);
  }

  button.secondary {
    background-color: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }

  button.secondary:hover {
    background-color: var(--vscode-button-secondaryHoverBackground);
  }
</style> 