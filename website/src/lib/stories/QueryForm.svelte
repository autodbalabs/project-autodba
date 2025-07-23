<script>
    import { browser } from '$app/environment';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    /** @typedef {{
        sql: string,
        timestamp: number
    }} QueryHistory */

    /** @typedef {{
        host: string,
        port: string,
        database: string,
        username: string,
        password: string
    }} DatabaseCredentials */

    /** @type {DatabaseCredentials} */
    const { credentials, setAnalysis } = $props();

    /** @type {QueryHistory} */
    let queryState = $state({
        sql: '',
        timestamp: Date.now()
    });

    let error = $state('');
    let isAnalyzing = $state(false);

    // Load from session storage on mount
    if (browser) {
        const saved = sessionStorage.getItem('queryHistory');
        if (saved) {
            queryState = JSON.parse(saved);
        }
    }

    // Save to session storage when query changes
    $effect(() => {
        if (browser) {
            sessionStorage.setItem('queryHistory', JSON.stringify(queryState));
        }
    });

    async function analyzeQuery() {
        if (!queryState.sql.trim()) {
            error = 'Query cannot be empty';
            return;
        }

        if (!credentials) {
            error = 'Database credentials are required';
            return;
        }

        isAnalyzing = true;
        error = '';

        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: queryState.sql,
                    credentials
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze query');
            }

            // Update timestamp when query is analyzed successfully
            queryState.timestamp = Date.now();
            
            // Emit the analysis result to the parent component
            setAnalysis(data.analysis);
        } catch (e) {
            error = e instanceof Error ? e.message : 'An unknown error occurred';
        } finally {
            isAnalyzing = false;
        }
    }
</script>

<div class="w-full max-w-4xl mx-auto p-6 bg-black border-2 border-green-500 rounded-none font-mono text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
    <h2 class="text-2xl text-center mb-8 uppercase tracking-wider text-green-400 font-bold">
        > Query Analysis_
    </h2>

    {#if error}
        <div class="mb-4 text-red-500 text-center border border-red-500 p-2">
            > Error: {error}_
        </div>
    {/if}

    <div class="space-y-6">
        <div class="space-y-2">
            <label for="query" class="block text-green-400 uppercase text-sm tracking-wider">> SQL Query:</label>
            <textarea
                id="query"
                bind:value={queryState.sql}
                placeholder="SELECT * FROM your_table WHERE..."
                disabled={isAnalyzing}
                rows="8"
                class="w-full bg-black border-2 border-green-500 p-2 text-green-500 placeholder-green-800 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:opacity-50 font-mono"
            ></textarea>
        </div>

        <div class="flex justify-between items-center">
            <div class="text-sm text-green-700">
                {#if queryState.timestamp}
                    > Last analyzed: {new Date(queryState.timestamp).toLocaleString()}_
                {/if}
            </div>

            <button
                on:click={analyzeQuery}
                disabled={isAnalyzing}
                class="bg-green-500 text-black py-2 px-6 uppercase font-bold tracking-wider hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                > {isAnalyzing ? 'Analyzing Query_' : 'Analyze Query_'}
            </button>
        </div>
    </div>

    {#if queryState.sql}
        <div class="mt-8 pt-8 border-t-2 border-green-800">
            <h3 class="text-xl mb-4 text-green-400">> Previous Query_</h3>
            <pre class="bg-black/50 p-4 border border-green-800 overflow-x-auto">
                {queryState.sql}
            </pre>
        </div>
    {/if}
</div> 