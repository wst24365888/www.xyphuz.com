<script lang="ts">
	import PostCard from "$lib/PostCard.svelte";
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<section>
    <div id="container">
        <h1># {data.tag}</h1>

        {#each data.posts as post}
            <PostCard {post}/>
            <div class="divider"></div>
        {/each}
    </div>
</section>

<style>    
    section {
        display: flex;
        justify-content: center;
        padding: 4vh 4vw;
    }

    h1 {
        margin-top: 1vh;
        margin-bottom: 4vh;
    }

    .divider {
        height: 2vh;
    }

    @media (orientation: landscape) {
        #container {
            width: 50%;
        }

        #container :global(h1) {
            font-size: 2.4rem;
        }
    }

    @media (orientation: portrait) {
        #container {
            width: 100%;
        }

        #container :global(h1) {
            font-size: 2em;
        }
    }
</style>