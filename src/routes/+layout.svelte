<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
</script>

<div id="header">
	<Header />
</div>

<main>
	<slot />
</main>

<footer>
</footer>

<style>
	#header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 2;
	}

	main {
		margin-top: 5em;
	}

	:global(body) {		
		margin: 0;
		padding: 0;
		font-family: "Montserrat", sans-serif;
		line-height: 1.75;
		overflow-y: overlay;
	}
</style>
