<script lang="ts">
	import { goto } from "$app/navigation";
	import type { AboutPreview } from "../models/about_preview";

	interface Props {
		about: AboutPreview;
	}

	let { about }: Props = $props();
</script>

<button
	class="flex w-full cursor-pointer flex-col gap-6 border border-solid border-gray-300 px-6 py-8 text-left transition duration-500 hover:border-black"
	onclick={() => goto(about.url)}
	data-sveltekit-preload-data
>
	<h2 class="text-2xl font-bold">{about.attributes.title}</h2>
	<div class="flex w-full flex-wrap justify-between">
		<p class="mt-4 font-light text-gray-400">{about.attributes.description}</p>
		{#if about.attributes.dateString}
			<p class="mt-4 font-light text-gray-400">{about.attributes.dateString}</p>
		{/if}
	</div>
</button>
