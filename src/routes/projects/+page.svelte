<script lang="ts">
	import ProjectCard from "$lib/ProjectCard.svelte";

	interface Props {
		data: any;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Projects - Xyphuz</title>
</svelte:head>

<section class="flex justify-center p-8">
	<div class="w-full md:w-1/2">
		<h1 class="mb-16 mt-6 text-4xl font-bold">Projects</h1>

		{#each data.projects as project}
			<div class="mb-6">
				<ProjectCard {project} />
			</div>
		{/each}
	</div>
</section>
