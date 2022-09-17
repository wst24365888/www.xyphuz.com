<script lang="ts">
	import AboutCard from '$lib/AboutCard.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<svelte:head>
	<title>About - Xyphuz</title>
</svelte:head>

<section>
    <div id="container">
        <h1>About</h1>

        {#each data.abouts as about}
            <AboutCard {about}/>
            <div class="divider"></div>
        {/each}
    </div>
</section>

<style>    
    section {
        display: flex;
        justify-content: center;
        padding: 2em 2.5em;
    }

    h1 {
        margin-top: 0.25em;
        margin-bottom: 1.25em;
    }

    .divider {
        height: 1.5em;
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