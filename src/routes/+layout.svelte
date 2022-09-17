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
</style>
