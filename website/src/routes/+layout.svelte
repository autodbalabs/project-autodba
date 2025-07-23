<script>
	import '../app.css';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="app bg-black">
	<header class="max-w-4xl mx-auto text-center">
        <pre class="text-[0.6rem] leading-none mb-8 animate-pulse">
{`
    _         _        ____  ____    _    
   / \\  _   _| |_ ___ |  _ \\| __ )  / \\   
  / _ \\| | | | __/ _ \\| | | |  _ \\ / _ \\  
 / ___ \\ |_| | || (_) | |_| | |_) / ___ \\ 
/_/   \\_\\__,_|\\__\\___/|____/|____/_/   \\_\\
`}
        </pre>
    </header>

	<main>
		{@render children()}
	</main>

	<footer>AutoDBA</footer>
</div>
