<script lang="ts">
	import type { PostPreview } from 'src/models/post_preview';

	export let post: PostPreview;
</script>

<div class="post-card">
	<a href={post.url}>
		<article>
			<h1>{post.mdAttributes.title}</h1>
			<p>{post.mdAttributes.description}</p>
		</article>
	</a>
</div>

<style>
	.post-card {
		padding: 0.75em 1.5em;
		border: 1px solid #ccc;
	}

	h1 {
		margin-top: 3vh;
		margin-bottom: 3vh;
	}
</style>