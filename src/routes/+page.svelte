<script lang="ts">
	import Marquee from "svelte-fast-marquee";
	import { Canvas } from "@threlte/core";
	import Logo3D from "$lib/logo_3d/Logo3D.svelte";

	let w: number = $state(0);
	let h: number = $state(0);

	let zoom = $derived(Math.min(w, h) / 5);
	let speed = $derived(w / 384 + 5);

	let logoOpacity = $state(0);

	function onGltfLoadedCallback() {
		setTimeout(() => {
			logoOpacity = 1;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Official Website - Xyphuz</title>
	<meta name="description" content="This is the official website of Xyphuz." />
</svelte:head>

<section
	class="relative m-0 flex h-full w-full items-center justify-center overflow-hidden p-0"
	bind:clientWidth={w}
	bind:clientHeight={h}
	style="--logo-opacity: {logoOpacity}"
>
	<div
		class="absolute -z-30 m-0 flex h-full w-full items-center justify-center p-0 opacity-0"
		id="backgruond"
	></div>

	<div
		class="absolute -z-20 flex h-[calc(100%-5em)] w-full items-center justify-center p-0 md:mb-[34vh]"
	>
		<div
			class="m-0 flex h-full w-screen items-center justify-center whitespace-nowrap p-0 text-[12rem] font-black text-gray-100 opacity-0"
			id="backgruond-marquee"
		>
			<Marquee {speed}>
				Official Website - Xyphuz
				<div class="w-[5vw]"></div>
			</Marquee>
		</div>
	</div>

	<div
		class="absolute -z-10 m-0 flex h-[calc(100%-5em)] w-full items-center justify-center p-0 opacity-[var(--logo-opacity)] transition-opacity duration-1000 ease-in-out md:left-1/2 md:w-1/2"
		id="canvas"
	>
		<Canvas>
			<Logo3D {zoom} {onGltfLoadedCallback} />
		</Canvas>
	</div>

	<div
		class="relative left-0 top-0 m-0 flex h-full w-full flex-col items-start justify-between p-8 md:justify-end md:px-[3vw] md:py-[3vh]"
	>
		<div class="relative w-full">
			<p
				class="m-0 p-0 text-[4rem] font-black leading-tight text-gray-800 after:absolute after:left-0 after:top-0 after:text-gray-800 after:content-[attr(data-text)] md:text-[8.5vw]"
				id="name"
				data-text="Xyphuz's"
			>
				Xyphuz's
			</p>
		</div>
		<div class="relative w-full">
			<p
				class="m-0 w-full p-0 text-right text-[4rem] font-black leading-tight after:absolute after:left-0 after:top-0 after:w-full after:text-right after:text-white after:content-[attr(data-text)] md:text-left md:text-[8.5vw] after:md:text-left"
				id="description"
				data-text="Official Website"
			>
				Official Website
			</p>
		</div>
	</div>
</section>

<style>
	#backgruond {
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC)
			repeat 0 0;
		animation: backgruond-scrolling 10s linear infinite, fade-in 1s ease-in-out 0.5s forwards;
	}

	#backgruond-marquee {
		animation: fade-in 2s ease-in-out 1s forwards;
	}

	@keyframes backgruond-scrolling {
		100% {
			background-position: 50px 50px;
		}
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	#name {
		-webkit-text-stroke: 2px #fff;
	}
	#name::after {
		-webkit-text-stroke: 0px #fff;
	}

	#description {
		-webkit-text-stroke: 2px #222;
	}
	#description::after {
		-webkit-text-stroke: 0px #222;
	}
</style>
