<script lang="ts">
	import PostCard from "$lib/PostCard.svelte";
    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<section>
    <h1>Posts</h1>

    {#each data.posts as post}
        <PostCard {post}/>
    {/each}
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: calc(100vh - 5em);
    }
</style>