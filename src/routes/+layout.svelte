<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';

	let w: number;
	let h: number;

	$: landscape = w > h;
</script>

<div id="header">
	<Header {landscape} />
</div>

<main bind:clientWidth={w} bind:clientHeight={h}>
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
		height: calc(100vh - 5em);
	}

	@media only screen {
		:global(body::-webkit-scrollbar) {
			width: 0.5em;
		}

		:global(body::-webkit-scrollbar-track) {
			background: #eee;
		}

		:global(body::-webkit-scrollbar-thumb) {
			background: #888;
		}

		:global(body::-webkit-scrollbar-thumb:hover) {
			background: #444;
		}
	}
</style>
