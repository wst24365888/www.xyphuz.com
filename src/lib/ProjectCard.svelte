<script lang="ts">
	import { goto } from "$app/navigation";
	import type { ProjectPreview } from "../models/project_preview";

	export let project: ProjectPreview;
</script>

<button
	class="flex w-full cursor-pointer flex-col gap-6 border border-solid border-gray-300 px-6 py-8 text-left transition duration-500 hover:border-black"
	on:click={() => goto(project.url)}
	data-sveltekit-preload-data
>
	<h2 class=" text-2xl font-bold">{project.attributes.title}</h2>
	<div class=" flex w-full flex-wrap justify-between">
		<p class=" mt-4 font-light text-gray-400">{project.attributes.description}</p>
		{#if project.attributes.dateString}
			<p class=" mt-4 font-light text-gray-400">{project.attributes.dateString}</p>
		{/if}
	</div>
</button>
