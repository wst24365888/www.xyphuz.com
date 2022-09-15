<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
</script>

<Header />

<main>
	<slot />
</main>

<footer>
</footer>

<style>
	:global(body) {		
		margin: 0;
		padding: 0;
		font-family: "Montserrat", sans-serif;
		line-height: 1.5;
	}
</style>
