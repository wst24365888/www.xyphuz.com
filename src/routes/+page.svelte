<script lang="ts">
	import Marquee from "svelte-fast-marquee";
	import { Canvas } from "@threlte/core";
	import Logo3D from "$lib/logo_3d/Logo3D.svelte";

	let w: number;
	let h: number;

	$: zoom = Math.min(w, h) / 5;
	$: speed = w / 384 + 5;

	let logoOpacity = 0;

	function gltfLoadedCallback() {
		setTimeout(() => {
			logoOpacity = 1;
		}, 2000);
	}
</script>

<svelte:head>
	<title>Official Website - Xyphuz</title>
	<meta name="description" content="This is the official website of Xyphuz." />
</svelte:head>

<section bind:clientWidth={w} bind:clientHeight={h} style="--logo-opacity: {logoOpacity}">
	<div id="backgruond" />

	<div id="backgruond-marquee-container">
		<div id="backgruond-marquee">
			<Marquee {speed}>
				Official Website - Xyphuz
				<div id="divider" />
			</Marquee>
		</div>
	</div>

	<div id="canvas">
		<Canvas>
			<Logo3D {zoom} {gltfLoadedCallback} />
		</Canvas>
	</div>

	<div id="info-container">
		<div class="wrapper">
			<p id="name" data-text="Xyphuz's">Xyphuz's</p>
		</div>
		<div class="wrapper">
			<p id="description" data-text="Official Website">Official Website</p>
		</div>
	</div>
</section>

<style>
	section {
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		position: relative;
	}

	#backgruond {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		z-index: -3;
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC)
			repeat 0 0;
		opacity: 0;
		animation: backgruond-scrolling 10s linear infinite, fade-in 1s ease-in-out 0.5s forwards;
	}

	#backgruond-marquee-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		width: 100%;
		height: calc(100% - 5em);
		z-index: -2;
	}

	#backgruond-marquee {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-weight: 900;
		color: #eee;
		white-space: nowrap;
		width: 100vw;
		margin: 0;
		padding: 0;
		height: 100%;
		opacity: 0;
		animation: fade-in 2s ease-in-out 1s forwards;
	}

	#divider {
		width: 5vw;
	}

	#canvas {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		height: calc(100% - 5em);
		z-index: -1;
		opacity: var(--logo-opacity);
		transition: opacity 1s ease-in-out;
	}

	#info-container {
		position: relative;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin: 0;
		width: 100%;
		height: 100%;
	}

	.wrapper {
		position: relative;
		width: 100%;
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

	@media (orientation: landscape) {
		#backgruond-marquee {
			font-size: 13vw;
		}

		#backgruond-marquee-container {
			margin-bottom: 34vh;
		}
		
		#canvas {
			left: 50vw;
			width: 50vw;
		}

		#info-container {
			padding: 3vh 3vw;
			justify-content: flex-end;
		}

		#name {
			font-size: 8.5vw;
			font-weight: 900;
			color: #222;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #fff;
		}

		#name::after {
			content: attr(data-text);
			color: #222;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #fff;
		}

		#description {
			font-size: 8.5vw;
			font-weight: 900;
			color: white;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #222;
		}

		#description::after {
			content: attr(data-text);
			color: white;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #222;
		}
	}

	@media (orientation: portrait) {
		#backgruond-marquee {
			font-size: 12em;
		}

		#canvas {
			width: 100vw;
		}

		#info-container {
			padding: 2em;
			justify-content: space-between;
			width: 100%;
			box-sizing: border-box;
		}

		#name {
			font-size: 4em;
			font-weight: 900;
			color: #222;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #fff;
		}

		#name::after {
			content: attr(data-text);
			color: #222;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #fff;
		}

		#description {
			font-size: 4em;
			font-weight: 900;
			color: white;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #222;
			width: 100%;
			text-align: right;
		}

		#description::after {
			content: attr(data-text);
			color: white;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #222;
			width: 100%;
			text-align: right;
		}
	}
</style>
