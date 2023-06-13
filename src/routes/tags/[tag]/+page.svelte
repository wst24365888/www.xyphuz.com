<script lang="ts">
	import PostCard from "$lib/PostCard.svelte";

	export let data;
</script>

<svelte:head>
	<title>Tag: {data.tag} - Xyphuz</title>
</svelte:head>

<section class="flex justify-center p-8">
	<div class=" w-full md:w-1/2">
		<h1 class=" mb-16 mt-6 text-4xl font-bold">Tag: {data.tag}</h1>

		{#each data.posts as post}
			<div class="mb-6">
				<PostCard {post} />
			</div>
		{/each}
	</div>
</section>
