<script lang="ts">
	import ProjectCard from '$lib/ProjectCard.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<section>
    <div id="container">
        <h1>Project</h1>

        {#each data.projects as project}
            <ProjectCard {project}/>
            <div class="divider"></div>
        {/each}
    </div>
</section>

<style>    
    section {
        display: flex;
        justify-content: center;
        padding: 2em 4vw;
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