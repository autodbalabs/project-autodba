<script>
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	/** @typedef {{
        host: string,
        port: string,
        database: string,
        username: string,
        password: string
    }} Credentials */

	/** @type {Credentials} */
	let dbCredentials = $state({
		host: 'localhost',
		port: '5432',
		database: 'postgres',
		username: 'postgres',
		password: 'secret'
	});

	let error = $state('');
	let isValidating = $state(false);

	if (browser) {
		dbCredentials = JSON.parse(sessionStorage.getItem('dbCredentials') || '{}');
	}

	$effect(() => {
		if (browser) {
			sessionStorage.setItem('dbCredentials', JSON.stringify(dbCredentials));
		}
	});

	/** @type {import('@sveltejs/kit').SubmitFunction} */
	function handleSubmit() {
		isValidating = true;
		error = '';

		if (!dbCredentials.host || !dbCredentials.database || !dbCredentials.username || !dbCredentials.password) {
			error = 'All fields are required';
			isValidating = false;
			return;
		}

		if (!/^\d+$/.test(dbCredentials.port)) {
			error = 'Port must be a number';
			isValidating = false;
			return;
		}

		goto('/analysis');

		isValidating = false;
	}
</script>

<div class="w-full max-w-2xl mx-auto p-6 bg-black border-2 border-green-500 rounded-none font-mono text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
	<h2 class="text-2xl text-center mb-8 uppercase tracking-wider text-green-400 font-bold">
		> Database Connection_
	</h2>

	{#if error}
		<div class="mb-4 text-red-500 text-center border border-red-500 p-2">
			> Error: {error}_
		</div>
	{/if}

	<form method="POST" on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div class="space-y-2">
			<label for="host" class="block text-green-400 uppercase text-sm tracking-wider">> Host:</label>
			<input 
				type="text" 
				id="host" 
				name="host"
				bind:value={dbCredentials.host} 
				placeholder="localhost"
				required
				disabled={isValidating}
				class="w-full bg-black border-2 border-green-500 p-2 text-green-500 placeholder-green-800 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:opacity-50"
			/>
		</div>

		<div class="space-y-2">
			<label for="port" class="block text-green-400 uppercase text-sm tracking-wider">> Port:</label>
			<input 
				type="text" 
				id="port" 
				name="port"
				bind:value={dbCredentials.port} 
				placeholder="5432"
				required
				disabled={isValidating}
				class="w-full bg-black border-2 border-green-500 p-2 text-green-500 placeholder-green-800 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:opacity-50"
			/>
		</div>

		<div class="space-y-2">
			<label for="database" class="block text-green-400 uppercase text-sm tracking-wider">> Database:</label>
			<input 
				type="text" 
				id="database" 
				name="database"
				bind:value={dbCredentials.database} 
				placeholder="mydatabase"
				required
				disabled={isValidating}
				class="w-full bg-black border-2 border-green-500 p-2 text-green-500 placeholder-green-800 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:opacity-50"
			/>
		</div>

		<div class="space-y-2">
			<label for="username" class="block text-green-400 uppercase text-sm tracking-wider">> Username:</label>
			<input 
				type="text" 
				id="username" 
				name="username"
				bind:value={dbCredentials.username} 
				placeholder="username"
				required
				disabled={isValidating}
				class="w-full bg-black border-2 border-green-500 p-2 text-green-500 placeholder-green-800 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:opacity-50"
			/>
		</div>

		<div class="space-y-2">
			<label for="password" class="block text-green-400 uppercase text-sm tracking-wider">> Password:</label>
			<input 
				type="password" 
				id="password" 
				name="password"
				bind:value={dbCredentials.password} 
				required
				disabled={isValidating}
				class="w-full bg-black border-2 border-green-500 p-2 text-green-500 placeholder-green-800 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 disabled:opacity-50"
			/>
		</div>

		<button 
			type="submit"
			disabled={isValidating}
			class="w-full mt-8 bg-green-500 text-black py-3 px-6 uppercase font-bold tracking-wider hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			> {isValidating ? 'Validating Connection_' : 'Test Connection_'}
		</button>
	</form>
</div>
