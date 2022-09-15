<script lang="ts">
    import type { PageData } from './$types';

	export let data: PageData;
</script>

<article>
	<h1>{data.post.mdAttributes.title}</h1>
	{@html data.post.html}
</article>

<style>
    :global(article) {
        padding: 4vw;
    }
</style>