<script lang="ts">
	import { Splide, SplideSlide } from "@splidejs/svelte-splide";
	import type { Options } from "@splidejs/splide";
	import "@splidejs/svelte-splide/css";

	export let data;

	let showCarouesel = false;
	setTimeout(() => {
		showCarouesel = true;
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
		autoHeight: true,
		focus: "center",
		autoplay: true,
		interval: 3000,
		speed: 1000,
		lazyLoad: false,
		pauseOnHover: false,
		pauseOnFocus: false,
	} as Options;

	const computedPhotoUrls = (() => {
		if (data.project.attributes.photoUrls == null) {
			return null;
		}

		let result: string[] = [];
		let photoUrls = data.project.attributes.photoUrls;

		const perPage = 8;
		while (result.length < perPage) {
			result = result.concat(photoUrls);
		}

		return result;
	})();
</script>

<svelte:head>
	<title>Project - {data.project.attributes.title}</title>
	<link rel="preconnect" href="https://www.xyphuz.com" />
	<link rel="dns-prefetch" href="https://www.xyphuz.com" />
	{#if computedPhotoUrls != null}
		{#each computedPhotoUrls as photoUrl}
			<link rel="preload" as="image" href={photoUrl} />
		{/each}
	{/if}
</svelte:head>

<section
	class="flex flex-col items-center justify-center"
	style="--carousel-opacity: {carouselOpacity}"
>
	{#if computedPhotoUrls != null}
		{#if showCarouesel}
			<Splide options={splideOptions}>
				{#each computedPhotoUrls as photoUrl}
					<SplideSlide>
						<img src={photoUrl} alt={photoUrl} style="height: 25em" />
					</SplideSlide>
				{/each}
			</Splide>
		{:else}
			<div style="height: 25em" />
		{/if}
	{/if}

	<div class="flex w-full flex-col items-center justify-center px-10 pb-8 pt-16">
		<article class="prose w-full md:w-1/2">
			<h1 class="mb-6 mt-1">{data.project.attributes.title}</h1>
			<div class="mb-6 text-gray-400">{data.project.attributes.description}</div>
			<div class="mb-6">
				{#if data.project.attributes.dateString}
					{data.project.attributes.dateString}
				{/if}
				{#if data.project.attributes.dateString && data.project.attributes.link}
					&middot;
				{/if}
				{#if data.project.attributes.link}
					<a href={data.project.attributes.link} target="_blank" class="break-words">
						{data.project.attributes.link}
					</a>
				{/if}
			</div>
			<hr class="border border-solid border-gray-100" />
			{@html data.project.html}
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
