<script>
  import UnusedIndexCard from './cards/UnusedIndexCard.svelte';
  import WarningCard from './cards/WarningCard.svelte';
  import ConfigOptimizationCard from './cards/ConfigOptimizationCard.svelte';
  import SlowQueryCard from './cards/SlowQueryCard.svelte';
  import RedundantIndexCard from './cards/RedundantIndexCard.svelte';
  
  export let insight;
</script>

{#if insight.kind === 'unused-index'}
  <UnusedIndexCard {insight} />
{:else if insight.kind === 'config-optimization'}
  <ConfigOptimizationCard {insight} />
{:else if insight.kind === 'slow-query'}
  <SlowQueryCard {insight} />
{:else if insight.kind === 'redundant-index'}
  <RedundantIndexCard {insight} />
{:else}
  <WarningCard {insight} />
{/if}
