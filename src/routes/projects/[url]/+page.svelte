<script lang="ts">
	import type { PageData } from "./$types";
	import { Splide, SplideSlide } from "@splidejs/svelte-splide";
	import type { Options } from "@splidejs/splide";
	import "@splidejs/svelte-splide/css";

	export let data: PageData;

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
		focus: "center",
		autoplay: true,
		interval: 3000,
		speed: 1000,
		lazyLoad: true,
		pauseOnHover: false,
		pauseOnFocus: false,
	} as Options;

	$: computedPhotoUrls = (() => {
		if (data.project.attributes.photoUrls == null) {
			return null;
		}

		let photoUrls = data.project.attributes.photoUrls;

		const perPage = 8;
		while (photoUrls.length < perPage) {
			photoUrls = photoUrls.concat(photoUrls);
		}

		return photoUrls;
	})();
</script>

<svelte:head>
	<title>Project - {data.project.attributes.title}</title>
	{#if computedPhotoUrls != null}
		{#each computedPhotoUrls as photoUrl}
			<link rel="preload" as="image" href={photoUrl} />
		{/each}
	{/if}
</svelte:head>

<section style="--carousel-opacity: {carouselOpacity}">
	{#if showCarouesel && computedPhotoUrls != null}
		<Splide options={splideOptions}>
			{#each computedPhotoUrls as photoUrl}
				<SplideSlide>
					<img src={photoUrl} loading="lazy" alt={photoUrl} style="height: 25em" />
				</SplideSlide>
			{/each}
		</Splide>
	{:else}
		<div style="height: 25em" />
	{/if}

	<div id="article-container">
		<article>
			<h1 id="title">{data.project.attributes.title}</h1>
			<div id="date">{data.project.attributes.dateString}</div>
			<hr />
			{@html data.project.html}
		</article>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	section :global(.splide) {
		transition: opacity 1s ease-in-out;
		opacity: var(--carousel-opacity);
	}

	#article-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 4em 2.5em 2em 2.5em;
	}

	article :global(img) {
		max-width: 100%;
	}

	#title {
		margin-top: 0.25em;
		margin-bottom: 1.25em;
	}

	#date {
		margin-top: 0.25em;
		color: #888;
	}

	hr {
		margin-top: 1.2em;
		margin-bottom: 3em;
		border: 1px solid #eee;
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
			font-size: 2rem;
		}
	}

	:global(.splide__slide) {
		opacity: 0.2;
		transition: all 0.25s ease-in-out;
	}

	:global(.splide__slide.is-active) {
		opacity: 1;
	}
</style>
