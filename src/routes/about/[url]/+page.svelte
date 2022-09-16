<script lang="ts">
    import type { PageData } from './$types';
    import { Splide, SplideSlide } from '@splidejs/svelte-splide';
    import type { Options } from '@splidejs/splide';
    import '@splidejs/svelte-splide/css';
	import { onMount } from 'svelte';

	export let data: PageData;

    const splideOptions: Options = {
        type: "loop",
        width: "100%",
        height: "40vh",
        autoWidth: true,
        focus: "center",
        autoplay: true,
        interval: 3000,
        speed: 1000,
        lazyLoad: true,
    };

    let imageHeight = 0;

    onMount(() => {
        imageHeight = window.innerHeight * 0.4;
    });
</script>

<section>
    {#if imageHeight != 0}
        <Splide options={splideOptions}>
            {#each data.about.attributes.photoUrls as photoUrl}
                <SplideSlide>
                    <img src={photoUrl} alt="{photoUrl}" style="height: {imageHeight}px" />
                </SplideSlide>
            {/each}
        </Splide>
    {/if}

    <article>
        <h1 id="title">{data.about.attributes.title}</h1>
        {@html data.about.html}
    </article>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    article {
        padding: 4vw;
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