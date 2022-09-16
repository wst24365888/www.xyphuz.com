<script lang="ts">
    import type { PageData } from './$types';

	export let data: PageData;
</script>

<section>
    <article>
        <h1 id="title">{data.post.attributes.title}</h1>
        {@html data.post.html}
    </article>
</section>

<style>
    section {
        display: flex;
        justify-content: center;
        padding: 4vh 4vw;
    }
    
	article :global(img) {
        max-width: 100%;
	}    

	#title {
		margin-top: 1vh;
		margin-bottom: 4vh;
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