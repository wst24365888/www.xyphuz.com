<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PostPreview } from 'src/models/post_preview';

	export let post: PostPreview;
	$: dateString = new Date(post.mdAttributes.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	function handleClick() {
		goto(post.url);
	}
</script>

<div class="post-card" on:click="{handleClick}">
	<h1>{post.mdAttributes.title}</h1>
	<div class="card-info">
		<p>{post.mdAttributes.description}</p>
		<p>{dateString}</p>
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
	}

	.card-info {
		display: flex;
		justify-content: space-between;
	}

	h1 {
		margin-top: 3vh;
		margin-bottom: 3vh;
	}

	p {
		font-weight: 300;
		color: #666;
	}
</style>