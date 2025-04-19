<script>
  import ConnectionDetailsForm from '~/components/connections/ConnectionDetailsForm.svelte';
  
  export let connectionName;
  export let onSubmit;
  export let onCancel;

  console.log("here")
</script>

<div class="edit-connection-page">
  <h2>Edit Connection</h2>
  <ConnectionDetailsForm 
    {connectionName}
    onFinish={onSubmit}
    close={onCancel}
  />
</div>

<style>
  .edit-connection-page {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 8px;
    padding: 24px;
  }

  h2 {
    color: var(--vscode-editor-foreground);
    margin: 0 0 24px 0;
    font-size: 1.5em;
  }
</style> 