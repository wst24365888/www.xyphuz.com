<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
	$: dateString = new Date(data.post.attributes.date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
</script>

<svelte:head>
	<title>Post - {data.post.attributes.title}</title>

	<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin="anonymous" />
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

<section>
	<article>
		<h1 id="title">{data.post.attributes.title}</h1>
		<div id="date">{dateString}</div>
		<hr />
		{@html data.post.html}
	</article>
</section>

<style>
	section {
		display: flex;
		justify-content: center;
		padding: 2em 2.5em;
	}

	article :global(img) {
		max-width: 100%;
	}

	#title {
		margin-top: 0.25em;
		margin-bottom: 1.25em;
	}

	hr {
		margin-top: 1.2em;
		border: 1px solid #eee;
	}

	@media (orientation: landscape) {
		article {
			width: 50%;
		}

		article :global(h1) {
			font-size: 2.4rem;
		}
	}

	@media (orientation: portrait) {
		article {
			width: 100%;
		}

		article :global(h1) {
			font-size: 2em;
		}
	}
</style>
