<script>
    import { goto } from '$app/navigation';
    import QueryForm from '$lib/stories/QueryForm.svelte';

    /** @type {import('./$types').PageData} */
    const { data } = $props();
    let queryAnalysis = $state(null);

    async function refreshAnalysis() {
        window.location.reload();
    }

    function setQueryAnalysis(analysis) {
        queryAnalysis = analysis
    }
</script>

<svelte:head>
    <title>AutoDBA - Database Analysis</title>
</svelte:head>

<div class="min-h-screen bg-black text-green-500 font-mono p-4">
    <div class="max-w-4xl mx-auto text-center mb-12">
        <div class="text-green-400 text-sm tracking-wide uppercase border-t-2 border-b-2 border-green-500 py-2 mx-auto max-w-md">
            > Database Analysis Report
        </div>
        <button
            onclick={refreshAnalysis}
            class="mt-4 px-4 py-2 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            > Refresh Analysis_
        </button>
    </div>
    <div class="max-w-4xl mx-auto space-y-8">
        {#if !data.analysis}
            <div class="text-center text-red-500">
                > Error: No analysis data available. Please connect to a database first.
            </div>
        {:else}
            <QueryForm credentials={data.credentials} setAnalysis={setQueryAnalysis} />

            <!-- Query Plan -->
            {#if queryAnalysis}
            <section class="border-2 border-green-500 p-4 space-y-4">
                <h2 class="text-xl mb-4 text-green-400">> Query Plan_</h2>
                <div class="space-y-2 text-sm">
                    <pre>{JSON.stringify(queryAnalysis.queryPlan, null, 2)}</pre>
                </div>
            </section>
            {/if}

            <!-- Query Recommendations -->
            {#if queryAnalysis}
            <section class="border-2 border-green-500 p-4 space-y-4">
                <h2 class="text-xl mb-4 text-green-400">> Query Recommendations_</h2>
                <div class="space-y-2 text-sm">
                    {#each queryAnalysis.recommendations as recommendation}
                        <div>> {recommendation}</div>
                    {/each}
                </div>
            </section>
            {/if}

            <!-- System Recommendations -->
            {#if data.analysis}
            <section class="border-2 border-green-500 p-4 space-y-4">
                <h2 class="text-xl mb-4 text-green-400">> System Recommendations_</h2>
                <div class="space-y-2 text-sm">
                    {#each data.analysis.recommendations as recommendation}
                        <div>> {recommendation}</div>
                    {/each}
                </div>
            </section>
            {/if}

            <!-- System Information -->
            <section class="border-2 border-green-500 p-4">
                <h2 class="text-xl mb-4 text-green-400">> System Information_</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>> Version: {data.analysis.systemInfo.version}</div>
                    <div>> CPU Cores: {data.analysis.systemInfo.cpu_count}</div>
                    <div>> Max Connections: {data.analysis.systemInfo.max_connections}</div>
                    <div>> Encoding: {data.analysis.systemInfo.server_encoding}</div>
                    <div>> Memory: {data.analysis.systemInfo.total_memory}</div>
                </div>
            </section>

            <!-- Database Size -->
            <section class="border-2 border-green-500 p-4">
                <h2 class="text-xl mb-4 text-green-400">> Database Size_</h2>
                <div class="text-sm">
                    <div>> Database: {data.analysis.databaseSize.database_name}</div>
                    <div>> Size: {data.analysis.databaseSize.size_pretty}</div>
                </div>
            </section>

            <!-- Memory Configuration -->
            <section class="border-2 border-green-500 p-4">
                <h2 class="text-xl mb-4 text-green-400">> Memory Configuration_</h2>
                <div class="space-y-2 text-sm">
                    {#each data.analysis.memoryConfig as config}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>> {config.name}:</div>
                            <div class="text-green-400">{config.setting} {config.unit}</div>
                        </div>
                    {/each}
                </div>
            </section>

            <!-- Parallel Processing -->
            <section class="border-2 border-green-500 p-4">
                <h2 class="text-xl mb-4 text-green-400">> Parallel Processing Configuration_</h2>
                <div class="space-y-2 text-sm">
                    {#each data.analysis.parallelConfig as config}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>> {config.name}:</div>
                            <div class="text-green-400">{config.setting}</div>
                        </div>
                    {/each}
                </div>
            </section>

            <!-- Table Statistics -->
            <section class="border-2 border-green-500 p-4">
                <h2 class="text-xl mb-4 text-green-400">> Table Statistics_</h2>
                <div class="space-y-4 text-sm">
                    {#each data.analysis.tableStats as table}
                        <div class="border border-green-700 p-2">
                            <div class="text-green-400">> {table.table_name}</div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                <div>Size: {table.total_size_pretty}</div>
                                <div>Rows: {table.row_count}</div>
                                <div>Dead Rows: {table.dead_rows}</div>
                                <div>Last Vacuum: {table.last_vacuum ? new Date(table.last_vacuum).toLocaleString() : 'Never'}</div>
                                <div>Last Analyze: {table.last_analyze ? new Date(table.last_analyze).toLocaleString() : 'Never'}</div>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
        </div>

    <div class="max-w-4xl mx-auto mt-12 text-center text-green-600 text-xs">
        <div class="border-t-2 border-green-800 max-w-md mx-auto pt-4 mt-8">
            <div class="animate-pulse">> End of Analysis Report_</div>
        </div>
    </div>
</div>
