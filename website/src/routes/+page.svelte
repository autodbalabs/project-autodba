<script>
	import DatabaseCredentialsForm from '$lib/stories/DatabaseCredentialsForm.svelte';
</script>

<svelte:head>
	<title>AutoDBA - Database Management Console</title>
	<meta name="description" content="AutoDBA - Your Retro Database Management System" />
</svelte:head>

<div class="min-h-screen bg-black text-green-500 font-mono p-4">
	<div class="max-w-4xl mx-auto text-center mb-12 space-y-4">
		<div class="text-green-400 text-sm tracking-wide uppercase border-t-2 border-b-2 border-green-500 py-2 mx-auto max-w-md">
			> Database Observatory v1.0
		</div>
		<div class="text-green-600 text-xs space-y-1">
			<div>> System: Online</div>
			<div>> Status: Ready</div>
			<div class="animate-pulse">> Awaiting Database Credentials_</div>
		</div>
	</div>

	<div class="max-w-4xl mx-auto">
		<div class="mb-8 text-center">
			<div class="inline-block border-2 border-green-500 px-4 py-2 text-sm tracking-wider">
				> Enter Database Credentials To Proceed_
			</div>
		</div>
		<DatabaseCredentialsForm />
	</div>

	<div class="max-w-4xl mx-auto mt-12 text-center text-green-600 text-xs space-y-1">
		<div class="border-t-2 border-green-800 max-w-md mx-auto pt-4 mt-8">
			<div>> Memory: OK</div>
			<div>> Connection: READY</div>
			<div class="animate-pulse">> Awaiting Input_</div>
		</div>
	</div>
</div>
