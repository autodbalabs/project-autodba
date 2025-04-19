<script>
  import router from '~/lib/router';

  import List from './list.svelte';
  import Create from './create.svelte';
  import Edit from './edit.svelte';

  const connectionsRouter = router.scope('connections');
  const isListRoute = connectionsRouter.isCurrentRoute('list');
  const isCreateRoute = connectionsRouter.isCurrentRoute('create');
  const isEditRoute = connectionsRouter.isCurrentRoute('edit');
  
  export let selectedConnection = null;
  export let onShowInsights = () => {};
</script>

{#if $isListRoute}
  <List 
    onShowInsights={onShowInsights}
    onEditConnection={(name) => {
      selectedConnection = name;
      connectionsRouter.navigate('edit');
    }}
  />
{:else if $isCreateRoute}
  <Create 
    onSubmit={() => connectionsRouter.navigate('list')}
    onCancel={() => connectionsRouter.navigate('list')}
  />
{:else if $isEditRoute}
  <Edit 
    connectionName={selectedConnection}
    onSubmit={() => connectionsRouter.navigate('list')}
    onCancel={() => connectionsRouter.navigate('list')}
  />
{/if}
