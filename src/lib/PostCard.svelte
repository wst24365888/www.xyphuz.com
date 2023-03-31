<script lang="ts">
	import { goto } from "$app/navigation";
	import type { PostPreview } from "../models/post_preview";

	export let post: PostPreview;
	$: dateString = new Date(post.attributes.date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	function onPostClick() {
		goto(post.url);
	}

	function onTagClick(tag: string) {
		goto(`/tags/${tag}`);
	}
</script>

<div class="post-card" on:click={onPostClick} on:keypress={onPostClick} data-sveltekit-preload-data>
	<a href={post.url}>
		<h2>{post.attributes.title}</h2>
	</a>
	<p>{post.attributes.description}</p>
	<div class="card-info">
		<div class="tags">
			{#each post.attributes.tags as tag}
				<div class="tag" on:click|stopPropagation={() => onTagClick(tag)} on:keypress|stopPropagation={() => onTagClick(tag)}>
					# {tag}
				</div>
			{/each}
		</div>
		<p class="date-string">{dateString}</p>
	</div>
</div>

<style>
	.post-card {
		padding: 0.75em 1.5em;
		border: 1px solid #ccc;
		transition: 0.5s;
	}

	.post-card:hover {
		border: 1px solid #000;
		cursor: pointer;
	}

	.tags {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.tag {
		margin: 0.25em 0.5em 0.25em 0;
		background-color: #eee;
		padding: 0.25em 0.5em;
		transition: 0.5s;
	}

	.tag:hover {
		background-color: #ccc;
	}

	h2 {
		margin-top: 0.75em 0;
	}

	p {
		font-weight: 300;
		color: #666;
	}	

	a {
		text-decoration: none;
		color: #000;
	}

	@media (orientation: landscape) {
		.card-info {
			display: flex;
			justify-content: space-between;
		}

		.tags {
			width: 60%;
		}

		.date-string {
			width: 40%;
		}

		.date-string {
			display: inline-flex;
			justify-content: flex-end;
		}
	}

	@media (orientation: portrait) {
		.tags {
			width: 100%;
		}

		.date-string {
			width: 100%;
		}
	}
</style>
