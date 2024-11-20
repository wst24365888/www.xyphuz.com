<script lang="ts">
	import { stopPropagation } from 'svelte/legacy';

	import { goto } from "$app/navigation";
	import type { PostPreview } from "../models/post_preview";

	interface Props {
		post: PostPreview;
	}

	let { post }: Props = $props();
</script>

<div
	class="flex w-full cursor-pointer flex-col gap-6 border border-solid border-gray-300 px-6 py-8 text-left transition duration-500 hover:border-black"
	onclick={() => goto(post.url)}
	data-sveltekit-preload-data
	role={undefined}
>
	<h2 class="text-2xl font-bold">{post.attributes.title}</h2>
	<p class="mt-2 text-gray-400">{post.attributes.description}</p>
	<div class="flex w-full flex-wrap items-center justify-between">
		<div class="mt-2 inline-flex flex-wrap items-center">
			{#each post.attributes.tags as tag}
				<button
					class="my-1 mr-2 bg-gray-100 px-2 py-1 transition duration-500 hover:bg-gray-300"
					onclick={stopPropagation(() => goto(`/tags/${tag}`))}
				>
					# {tag}
				</button>
			{/each}
		</div>
		<p class="mt-2 text-gray-400">
			{new Date(post.attributes.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})}
		</p>
	</div>
</div>
