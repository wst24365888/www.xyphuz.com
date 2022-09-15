<script lang="ts">
    import type { PageData } from './$types';

	export let data: PageData;
</script>

<section>
    <article>
        <h1>{data.post.mdAttributes.title}</h1>
        {@html data.post.html}
    </article>
</section>

<style>
    section {
        display: flex;
        justify-content: center;
    }

    article {
        padding: 4vw;
    }
    
	:global(img) {
        max-width: 100%;
	}

    @media (orientation: landscape) {
        article {
            width: 50%;
        }
    }
</style>