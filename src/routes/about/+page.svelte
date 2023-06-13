<script lang="ts">
	import AboutCard from "$lib/AboutCard.svelte";

	export let data;
</script>

<svelte:head>
	<title>About - Xyphuz</title>
</svelte:head>

<section class="flex justify-center p-8">
	<div class=" w-full md:w-1/2">
		<h1 class=" mb-16 mt-6 text-4xl font-bold">About</h1>

		{#each data.abouts as about}
			<div class="mb-6">
				<AboutCard {about} />
			</div>
		{/each}
	</div>
</section>
