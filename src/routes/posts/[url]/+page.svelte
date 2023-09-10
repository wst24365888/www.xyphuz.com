<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Post - {data.post.attributes.title}</title>

	<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin="anonymous" />
	<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" crossorigin="anonymous" />
	<link
		rel="preload"
		as="style"
		href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-night-owl.min.css"
		integrity="sha512-MXRiGOm1i9a1yooXJgIZhA+q5XHvP+iHXn0ardNqqdE3ixpQBvjR0NCkFTR0Jic6jmhhnpviB87P+tK3zuzuSg=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-night-owl.min.css"
		integrity="sha512-MXRiGOm1i9a1yooXJgIZhA+q5XHvP+iHXn0ardNqqdE3ixpQBvjR0NCkFTR0Jic6jmhhnpviB87P+tK3zuzuSg=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<section class="flex w-full flex-col items-center justify-center px-10 pb-8 pt-16">
	<article class="prose w-full md:w-1/2">
		<h1 class="mb-6 mt-1">{data.post.attributes.title}</h1>
		<div class="mb-6 text-gray-400">{data.post.attributes.description}</div>
		<div>
			{new Date(data.post.attributes.date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})}
		</div>
		<hr class="mb-12 border border-solid border-gray-100" />
		{@html data.post.html}
	</article>
</section>

<style>
	article :global(img) {
		max-width: 100%;
	}
</style>
