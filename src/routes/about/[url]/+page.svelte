<script lang="ts">
	import { Splide, SplideSlide } from "@splidejs/svelte-splide";
	import type { Options } from "@splidejs/splide";
	import "@splidejs/svelte-splide/css";

	export let data;

	let showCarouesel = false;
	setTimeout(() => {
		showCarouesel = true;
		console.log("showCarouesel = true");
	}, 800);

	let carouselWidth = "0px";
	let carouselOpacity = 0;
	setTimeout(() => {
		carouselOpacity = 1;
		carouselWidth = "100%";
	}, 1200);

	$: splideOptions = {
		type: "loop",
		width: carouselWidth,
		height: "25em",
		autoWidth: true,
		focus: "center",
		autoplay: true,
		interval: 3000,
		speed: 1000,
		lazyLoad: true,
		pauseOnHover: false,
		pauseOnFocus: false,
	} as Options;
</script>

<svelte:head>
	<title>About - {data.about.attributes.title}</title>
	{#if data.about.attributes.photoUrls != null}
		{#each data.about.attributes.photoUrls as photoUrl}
			<link rel="preload" as="image" href={photoUrl} />
		{/each}
	{/if}
</svelte:head>

<section
	class="flex flex-col items-center justify-center"
	style="--carousel-opacity: {carouselOpacity}"
>
	{#if showCarouesel && data.about.attributes.photoUrls != null}
		<Splide options={splideOptions}>
			{#each data.about.attributes.photoUrls as photoUrl}
				<SplideSlide>
					<img src={photoUrl} loading="lazy" alt={photoUrl} style="height: 25em" />
				</SplideSlide>
			{/each}
		</Splide>
	{:else}
		<div style="height: 25em" />
	{/if}

	<div class="flex w-full flex-col items-center justify-center px-10 pb-8 pt-16">
		<article class="prose w-full md:w-1/2">
			<h1 class="mb-6 mt-1">{data.about.attributes.title}</h1>
			<div class=" mb-6 text-gray-400">{data.about.attributes.description}</div>
			{#if data.about.attributes.dateString}
				<div>{data.about.attributes.dateString}</div>
			{/if}
			<hr class="mb-12 border border-solid border-gray-100" />
			{@html data.about.html}
		</article>
	</div>
</section>

<style>
	section :global(.splide) {
		transition: opacity 1s ease-in-out;
		opacity: var(--carousel-opacity);
	}

	article :global(img) {
		max-width: 100%;
	}

	:global(.splide__slide) {
		opacity: 0.2;
		transition: all 0.25s ease-in-out;
	}

	:global(.splide__slide.is-active) {
		opacity: 1;
	}
</style>
