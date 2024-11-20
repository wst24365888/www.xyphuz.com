<script lang="ts">
	import Header from "$lib/header/Header.svelte";
	import "../index.css";

	let { children } = $props();

	let w: number = $state(0);
	let h: number = $state(0);

	let landscape: boolean = $derived(w > h);
</script>

<div class="fixed left-0 right-0 top-0 z-10">
	<Header {landscape} />
</div>

<main class="mt-20 h-[calc(100vh-5rem)]" bind:clientWidth={w} bind:clientHeight={h}>
	{@render children?.()}
</main>

<footer></footer>

<style>
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
</style>
