<script lang="ts">
	import type { PostPreview } from 'src/models/post_preview';

	export let post: PostPreview;
</script>

<a href={post.url}>
	<article>
		<h1>{post.mdAttributes.title}</h1>
		<p>{post.mdAttributes.description}</p>
	</article>
</a>
